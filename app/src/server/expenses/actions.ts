'use server'

import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { requireAnyPermission, requirePermission } from '@/server/authz'
import { money, resolveCompanyId } from '@/server/company-context'
import { writeAudit, notifyUser } from '@/server/audit'
import { getDb } from '@/server/db'
import {
  companySettings,
  departments,
  expenseCategories,
  expenses,
  vendors,
} from '@/server/db/schema'
import { submitExpenseForApproval } from '@/server/approvals/service'

function nextExpenseRef() {
  const d = new Date()
  return `EXP-${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}-${nanoid(6).toUpperCase()}`
}

export async function listExpensesAction(filters?: {
  status?: string
  from?: string
  to?: string
}) {
  const { session, companyId } = await resolveCompanyId()
  const { membership, permissions } = await requireAnyPermission(companyId, [
    'expenses.view_own',
    'expenses.view_department',
    'expenses.view_all',
    'expenses.create',
  ])

  const db = getDb()
  const conditions = [eq(expenses.companyId, companyId)]
  if (filters?.status) {
    conditions.push(sql`${expenses.status} = ${filters.status}`)
  }
  if (filters?.from) conditions.push(gte(expenses.transactionDate, new Date(filters.from)))
  if (filters?.to) conditions.push(lte(expenses.transactionDate, new Date(filters.to)))

  if (!permissions.includes('expenses.view_all')) {
    if (permissions.includes('expenses.view_department') && membership.departmentId) {
      conditions.push(eq(expenses.departmentId, membership.departmentId))
    } else {
      conditions.push(eq(expenses.requesterMembershipId, membership.id))
    }
  }

  const rows = await db
    .select({
      expense: expenses,
      vendorName: vendors.name,
      categoryName: expenseCategories.name,
      departmentName: departments.name,
    })
    .from(expenses)
    .leftJoin(vendors, eq(expenses.vendorId, vendors.id))
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .leftJoin(departments, eq(expenses.departmentId, departments.id))
    .where(and(...conditions))
    .orderBy(desc(expenses.transactionDate))

  void session
  return rows
}

export async function createExpenseAction(formData: FormData) {
  const { session, companyId } = await resolveCompanyId()
  const { membership } = await requirePermission(companyId, 'expenses.create')
  const db = getDb()

  const idempotencyKey = String(formData.get('idempotencyKey') || '') || null
  if (idempotencyKey) {
    const [existing] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.companyId, companyId), eq(expenses.idempotencyKey, idempotencyKey)))
      .limit(1)
    if (existing) return { ok: true, id: existing.id }
  }

  const [settings] = await db
    .select()
    .from(companySettings)
    .where(eq(companySettings.companyId, companyId))
    .limit(1)

  const original = Number(formData.get('originalAmount') || 0)
  const tax = Number(formData.get('taxAmount') || 0)
  const total = original + tax
  const currency = String(formData.get('currency') || settings?.currency || 'USD')
  const reportingCurrency = settings?.currency || 'USD'
  const exchangeRate = Number(formData.get('exchangeRate') || 1)
  const reportingAmount = total * exchangeRate
  const submit = String(formData.get('submit') || '') === '1'

  const [row] = await db
    .insert(expenses)
    .values({
      companyId,
      reference: nextExpenseRef(),
      title: String(formData.get('title') || '').trim() || 'Untitled expense',
      description: String(formData.get('description') || '') || null,
      vendorId: String(formData.get('vendorId') || '') || null,
      categoryId: String(formData.get('categoryId') || '') || null,
      departmentId: String(formData.get('departmentId') || membership.departmentId || '') || null,
      requesterMembershipId: membership.id,
      transactionDate: new Date(String(formData.get('transactionDate') || new Date().toISOString())),
      currency,
      originalAmount: money(original),
      taxAmount: money(tax),
      totalAmount: money(total),
      exchangeRate: money(exchangeRate),
      reportingCurrency,
      reportingAmount: money(reportingAmount),
      paymentMethod: String(formData.get('paymentMethod') || '') || null,
      status: submit ? 'submitted' : 'draft',
      idempotencyKey,
      recurring: String(formData.get('recurring') || '') === 'true',
    })
    .returning()

  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'expense.created',
    entityType: 'expense',
    entityId: row.id,
    summary: `Expense ${row.reference} created`,
  })

  if (submit) {
    await submitExpenseForApproval(companyId, row.id, session.user.id)
  }

  revalidatePath('/expenses')
  return { ok: true, id: row.id }
}

export async function updateExpenseAction(formData: FormData): Promise<void> {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'expenses.create')
  const id = String(formData.get('id') || '')
  const db = getDb()
  const [existing] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.companyId, companyId)))
    .limit(1)
  if (!existing || !['draft', 'rejected'].includes(existing.status)) return

  const original = Number(formData.get('originalAmount') || existing.originalAmount)
  const tax = Number(formData.get('taxAmount') || existing.taxAmount)
  const total = original + tax
  const exchangeRate = Number(formData.get('exchangeRate') || existing.exchangeRate)

  await db
    .update(expenses)
    .set({
      title: String(formData.get('title') || existing.title),
      description: String(formData.get('description') || '') || null,
      vendorId: String(formData.get('vendorId') || '') || null,
      categoryId: String(formData.get('categoryId') || '') || null,
      departmentId: String(formData.get('departmentId') || '') || null,
      transactionDate: new Date(String(formData.get('transactionDate') || existing.transactionDate)),
      currency: String(formData.get('currency') || existing.currency),
      originalAmount: money(original),
      taxAmount: money(tax),
      totalAmount: money(total),
      exchangeRate: money(exchangeRate),
      reportingAmount: money(total * exchangeRate),
      paymentMethod: String(formData.get('paymentMethod') || '') || null,
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, id))

  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'expense.updated',
    entityType: 'expense',
    entityId: id,
    summary: `Expense ${existing.reference} updated`,
  })
  revalidatePath('/expenses')
  revalidatePath(`/expenses/${id}`)
}

export async function submitExpenseAction(formData: FormData): Promise<void> {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'expenses.create')
  const id = String(formData.get('id') || '')
  await submitExpenseForApproval(companyId, id, session.user.id)
  revalidatePath('/expenses')
  revalidatePath('/approvals')
}

export async function exportExpensesCsvAction() {
  const rows = await listExpensesAction()
  const header = [
    'Reference',
    'Title',
    'Vendor',
    'Department',
    'Category',
    'Date',
    'Currency',
    'Amount',
    'Status',
  ]
  const lines = rows.map((r) =>
    [
      r.expense.reference,
      r.expense.title,
      r.vendorName ?? '',
      r.departmentName ?? '',
      r.categoryName ?? '',
      r.expense.transactionDate.toISOString().slice(0, 10),
      r.expense.currency,
      r.expense.totalAmount,
      r.expense.status,
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

export async function getExpenseFormOptions() {
  const { companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, [
    'expenses.create',
    'expenses.view_own',
    'expenses.view_all',
    'expenses.view_department',
  ])
  const db = getDb()
  const [vendorRows, categoryRows, deptRows] = await Promise.all([
    db.select().from(vendors).where(and(eq(vendors.companyId, companyId), eq(vendors.active, true))),
    db
      .select()
      .from(expenseCategories)
      .where(and(eq(expenseCategories.companyId, companyId), eq(expenseCategories.active, true))),
    db.select().from(departments).where(and(eq(departments.companyId, companyId), eq(departments.active, true))),
  ])
  return { vendors: vendorRows, categories: categoryRows, departments: deptRows }
}
