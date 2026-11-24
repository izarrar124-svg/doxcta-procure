'use server'

import { and, desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAnyPermission, requirePermission } from '@/server/authz'
import { money, resolveCompanyId } from '@/server/company-context'
import { writeAudit } from '@/server/audit'
import { getDb } from '@/server/db'
import { invoices, payments, vendors } from '@/server/db/schema'

async function recalculateInvoiceBalance(invoiceId: string, companyId: string) {
  const db = getDb()
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.companyId, companyId)))
    .limit(1)
  if (!invoice) return

  const [sumRow] = await db
    .select({ paid: sql<string>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))

  const paid = Number(sumRow?.paid || 0)
  const total = Number(invoice.totalAmount)
  const outstanding = Math.max(total - paid, 0)
  let paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'disputed' | 'cancelled' =
    'unpaid'
  if (outstanding <= 0.0001) paymentStatus = 'paid'
  else if (paid > 0) paymentStatus = 'partially_paid'
  else if (invoice.dueDate && invoice.dueDate < new Date() && outstanding > 0) paymentStatus = 'overdue'

  await db
    .update(invoices)
    .set({
      outstandingBalance: money(outstanding),
      paymentStatus,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId))
}

export async function listPaymentsAction() {
  const { companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['payments.view', 'payments.record'])
  const db = getDb()
  return db
    .select({
      payment: payments,
      invoiceNumber: invoices.invoiceNumber,
      vendorName: vendors.name,
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .leftJoin(vendors, eq(invoices.vendorId, vendors.id))
    .where(eq(payments.companyId, companyId))
    .orderBy(desc(payments.paymentDate))
}

export async function listInvoicePaymentsAction(invoiceId: string) {
  const { companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['payments.view', 'payments.record', 'invoices.view'])
  const db = getDb()
  return db
    .select()
    .from(payments)
    .where(and(eq(payments.companyId, companyId), eq(payments.invoiceId, invoiceId)))
    .orderBy(desc(payments.paymentDate))
}

export async function recordPaymentAction(formData: FormData) {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'payments.record')
  const invoiceId = String(formData.get('invoiceId') || '')
  const amount = Number(formData.get('amount') || 0)
  if (!invoiceId || amount <= 0) return { ok: false, error: 'Invalid payment' }

  const idempotencyKey = String(formData.get('idempotencyKey') || '') || null
  const db = getDb()

  if (idempotencyKey) {
    const [existing] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.companyId, companyId), eq(payments.idempotencyKey, idempotencyKey)))
      .limit(1)
    if (existing) return { ok: true, id: existing.id }
  }

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.companyId, companyId)))
    .limit(1)
  if (!invoice) return { ok: false, error: 'Invoice not found' }

  const [row] = await db
    .insert(payments)
    .values({
      companyId,
      invoiceId,
      amount: money(amount),
      currency: String(formData.get('currency') || invoice.currency),
      paymentDate: new Date(String(formData.get('paymentDate') || new Date().toISOString())),
      paymentMethod: String(formData.get('paymentMethod') || '') || null,
      reference: String(formData.get('reference') || '') || null,
      notes: String(formData.get('notes') || '') || null,
      recordedByUserId: session.user.id,
      idempotencyKey,
    })
    .returning()

  await recalculateInvoiceBalance(invoiceId, companyId)

  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'payment.recorded',
    entityType: 'payment',
    entityId: row.id,
    summary: `Payment ${money(amount)} recorded for invoice ${invoice.invoiceNumber || invoiceId}`,
  })

  revalidatePath('/payments')
  revalidatePath('/invoices')
  revalidatePath(`/invoices/${invoiceId}`)
  return { ok: true, id: row.id }
}
