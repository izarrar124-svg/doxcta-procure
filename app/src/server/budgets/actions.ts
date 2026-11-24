'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAnyPermission, requirePermission } from '@/server/authz'
import { money, resolveCompanyId } from '@/server/company-context'
import { writeAudit, notifyUser } from '@/server/audit'
import { getDb } from '@/server/db'
import {
  budgetPeriods,
  budgets,
  companyMemberships,
  companySettings,
  expenseCategories,
  expenses,
  membershipRoles,
  roles,
} from '@/server/db/schema'

export async function listBudgetsAction() {
  const { companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['budgets.view', 'budgets.manage'])
  const db = getDb()
  const rows = await db.select().from(budgets).where(eq(budgets.companyId, companyId))
  const [settings] = await db
    .select()
    .from(companySettings)
    .where(eq(companySettings.companyId, companyId))
    .limit(1)

  const enriched = []
  for (const b of rows) {
    const conditions = [
      eq(expenses.companyId, companyId),
      sql`${expenses.status} in ('approved','paid','partially_paid','pending_approval','submitted')`,
    ]
    if (b.departmentId) conditions.push(eq(expenses.departmentId, b.departmentId))
    if (b.categoryId) conditions.push(eq(expenses.categoryId, b.categoryId))
    const [sum] = await db
      .select({ total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)` })
      .from(expenses)
      .where(and(...conditions))
    const actual = Number(sum?.total || 0)
    const allocated = Number(b.allocatedAmount)
    const pct = allocated > 0 ? (actual / allocated) * 100 : 0
    enriched.push({ budget: b, actual, remaining: allocated - actual, utilization: pct })
  }

  return { budgets: enriched, settings }
}

export async function createBudgetAction(formData: FormData) {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'budgets.manage')
  const db = getDb()
  const allocated = Number(formData.get('allocatedAmount') || 0)
  const [row] = await db
    .insert(budgets)
    .values({
      companyId,
      name: String(formData.get('name') || 'Budget'),
      departmentId: String(formData.get('departmentId') || '') || null,
      categoryId: String(formData.get('categoryId') || '') || null,
      periodType: String(formData.get('periodType') || 'annual') === 'monthly' ? 'monthly' : 'annual',
      currency: String(formData.get('currency') || 'USD'),
      allocatedAmount: money(allocated),
    })
    .returning()

  const start = new Date()
  start.setUTCMonth(0, 1)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(Date.UTC(start.getUTCFullYear(), 11, 31, 23, 59, 59))
  await db.insert(budgetPeriods).values({
    companyId,
    budgetId: row.id,
    periodStart: start,
    periodEnd: end,
    allocatedAmount: money(allocated),
  })

  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'budget.created',
    entityType: 'budget',
    entityId: row.id,
    summary: `Budget ${row.name} created`,
  })
  revalidatePath('/budgets')
}

export async function checkBudgetAlerts(companyId: string) {
  const db = getDb()
  const { budgets: rows, settings } = await listBudgetsInternal(companyId)
  const thresholds = [
    settings?.budgetAlert70 ?? 70,
    settings?.budgetAlert90 ?? 90,
    settings?.budgetAlert100 ?? 100,
  ]
  const admins = await db
    .select({ userId: companyMemberships.userId })
    .from(roles)
    .innerJoin(membershipRoles, eq(membershipRoles.roleId, roles.id))
    .innerJoin(companyMemberships, eq(companyMemberships.id, membershipRoles.membershipId))
    .where(and(eq(roles.companyId, companyId), eq(roles.key, 'company_admin')))

  for (const r of rows) {
    for (const t of thresholds) {
      if (r.utilization >= t) {
        for (const a of admins) {
          await notifyUser({
            companyId,
            userId: a.userId,
            title: `Budget ${t}% threshold`,
            body: `${r.budget.name} is at ${r.utilization.toFixed(0)}% utilization.`,
          })
        }
        break
      }
    }
  }
}

async function listBudgetsInternal(companyId: string) {
  const db = getDb()
  const rows = await db.select().from(budgets).where(eq(budgets.companyId, companyId))
  const [settings] = await db
    .select()
    .from(companySettings)
    .where(eq(companySettings.companyId, companyId))
    .limit(1)
  const enriched = []
  for (const b of rows) {
    const conditions = [
      eq(expenses.companyId, companyId),
      sql`${expenses.status} in ('approved','paid','partially_paid','pending_approval','submitted')`,
    ]
    if (b.departmentId) conditions.push(eq(expenses.departmentId, b.departmentId))
    if (b.categoryId) conditions.push(eq(expenses.categoryId, b.categoryId))
    const [sum] = await db
      .select({ total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)` })
      .from(expenses)
      .where(and(...conditions))
    const actual = Number(sum?.total || 0)
    const allocated = Number(b.allocatedAmount)
    const pct = allocated > 0 ? (actual / allocated) * 100 : 0
    enriched.push({ budget: b, actual, remaining: allocated - actual, utilization: pct })
  }
  return { budgets: enriched, settings }
}

export async function getBudgetFormOptions() {
  const { companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'budgets.manage')
  const db = getDb()
  const { departments } = await import('@/server/db/schema')
  const [deptRows, catRows] = await Promise.all([
    db.select().from(departments).where(eq(departments.companyId, companyId)),
    db.select().from(expenseCategories).where(eq(expenseCategories.companyId, companyId)),
  ])
  return { departments: deptRows, categories: catRows }
}
