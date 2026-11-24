'use server'

import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAnyPermission, requirePermission } from '@/server/authz'
import { money, resolveCompanyId } from '@/server/company-context'
import { writeAudit, notifyUser } from '@/server/audit'
import { getDb } from '@/server/db'
import {
  companySettings,
  expenseCategories,
  invoiceDocuments,
  invoiceItems,
  invoices,
  vendors,
} from '@/server/db/schema'
import { assertInvoiceQuota, recordUsage } from '@/server/usage'

export async function listInvoicesAction() {
  const { companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['invoices.view', 'invoices.create'])
  const db = getDb()
  return db
    .select({
      invoice: invoices,
      vendorName: vendors.name,
    })
    .from(invoices)
    .leftJoin(vendors, eq(invoices.vendorId, vendors.id))
    .where(eq(invoices.companyId, companyId))
    .orderBy(desc(invoices.createdAt))
}

export async function getInvoiceAction(id: string) {
  const { companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['invoices.view', 'invoices.create', 'invoices.approve'])
  const db = getDb()
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.companyId, companyId)))
    .limit(1)
  if (!invoice) return null
  const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id))
  const docs = await db.select().from(invoiceDocuments).where(eq(invoiceDocuments.invoiceId, id))
  return { invoice, items, docs }
}

export async function createManualInvoiceAction(formData: FormData) {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'invoices.create')
  await assertInvoiceQuota(companyId)

  const db = getDb()
  const [settings] = await db
    .select()
    .from(companySettings)
    .where(eq(companySettings.companyId, companyId))
    .limit(1)

  const subtotal = Number(formData.get('subtotal') || 0)
  const tax = Number(formData.get('taxAmount') || 0)
  const discount = Number(formData.get('discountAmount') || 0)
  const total = subtotal + tax - discount
  const currency = String(formData.get('currency') || settings?.currency || 'USD')
  const reportingCurrency = settings?.currency || 'USD'
  const exchangeRate = Number(formData.get('exchangeRate') || 1)

  const [row] = await db
    .insert(invoices)
    .values({
      companyId,
      vendorId: String(formData.get('vendorId') || '') || null,
      invoiceNumber: String(formData.get('invoiceNumber') || '') || null,
      invoiceDate: formData.get('invoiceDate')
        ? new Date(String(formData.get('invoiceDate')))
        : new Date(),
      dueDate: formData.get('dueDate') ? new Date(String(formData.get('dueDate'))) : null,
      currency,
      subtotal: money(subtotal),
      taxAmount: money(tax),
      discountAmount: money(discount),
      totalAmount: money(total),
      exchangeRate: money(exchangeRate),
      reportingCurrency,
      reportingAmount: money(total * exchangeRate),
      paymentTerms: String(formData.get('paymentTerms') || '') || null,
      status: 'validated',
      paymentStatus: 'unpaid',
      outstandingBalance: money(total),
      categoryId: String(formData.get('categoryId') || '') || null,
      departmentId: String(formData.get('departmentId') || '') || null,
      createdByUserId: session.user.id,
    })
    .returning()

  await recordUsage(companyId, 'invoices', 1)
  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'invoice.created',
    entityType: 'invoice',
    entityId: row.id,
    summary: `Invoice ${row.invoiceNumber || row.id} created`,
  })
  await notifyUser({
    companyId,
    userId: session.user.id,
    title: 'Invoice created',
    body: `Invoice ${row.invoiceNumber || row.id.slice(0, 8)} saved.`,
  })

  revalidatePath('/invoices')
  return { ok: true, id: row.id }
}

export async function updateInvoiceAction(formData: FormData): Promise<void> {
  const { session, companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['invoices.create', 'invoices.approve'])
  const id = String(formData.get('id') || '')
  const db = getDb()
  const [existing] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.companyId, companyId)))
    .limit(1)
  if (!existing) return

  const subtotal = Number(formData.get('subtotal') || existing.subtotal)
  const tax = Number(formData.get('taxAmount') || existing.taxAmount)
  const discount = Number(formData.get('discountAmount') || existing.discountAmount)
  const total = subtotal + tax - discount
  const exchangeRate = Number(formData.get('exchangeRate') || existing.exchangeRate)

  await db
    .update(invoices)
    .set({
      vendorId: String(formData.get('vendorId') || '') || null,
      invoiceNumber: String(formData.get('invoiceNumber') || '') || null,
      invoiceDate: formData.get('invoiceDate')
        ? new Date(String(formData.get('invoiceDate')))
        : existing.invoiceDate,
      dueDate: formData.get('dueDate') ? new Date(String(formData.get('dueDate'))) : existing.dueDate,
      currency: String(formData.get('currency') || existing.currency),
      subtotal: money(subtotal),
      taxAmount: money(tax),
      discountAmount: money(discount),
      totalAmount: money(total),
      exchangeRate: money(exchangeRate),
      reportingAmount: money(total * exchangeRate),
      paymentTerms: String(formData.get('paymentTerms') || '') || null,
      categoryId: String(formData.get('categoryId') || '') || null,
      departmentId: String(formData.get('departmentId') || '') || null,
      status: 'validated',
      outstandingBalance: money(Math.max(total - (Number(existing.totalAmount) - Number(existing.outstandingBalance)), 0)),
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, id))

  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'invoice.updated',
    entityType: 'invoice',
    entityId: id,
    summary: `Invoice updated`,
  })
  revalidatePath('/invoices')
  revalidatePath(`/invoices/${id}`)
  revalidatePath(`/invoices/${id}/review`)
}

export async function getInvoiceFormOptions() {
  const { companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['invoices.create', 'invoices.view'])
  const db = getDb()
  const [vendorRows, categoryRows] = await Promise.all([
    db.select().from(vendors).where(and(eq(vendors.companyId, companyId), eq(vendors.active, true))),
    db
      .select()
      .from(expenseCategories)
      .where(and(eq(expenseCategories.companyId, companyId), eq(expenseCategories.active, true))),
  ])
  return { vendors: vendorRows, categories: categoryRows }
}
