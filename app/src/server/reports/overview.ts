import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { getDb } from '@/server/db'
import { approvals, budgets, expenses, invoices } from '@/server/db/schema'

export async function getOverviewMetrics(companyId: string, from?: Date, to?: Date) {
  const db = getDb()
  const start =
    from ||
    (() => {
      const d = new Date()
      d.setUTCDate(1)
      d.setUTCHours(0, 0, 0, 0)
      return d
    })()

  const expenseConds = [
    eq(expenses.companyId, companyId),
    gte(expenses.transactionDate, start),
    sql`${expenses.status} not in ('cancelled','draft','rejected')`,
  ]
  if (to) expenseConds.push(lte(expenses.transactionDate, to))

  const invoiceConds = [eq(invoices.companyId, companyId), gte(invoices.createdAt, start)]
  if (to) invoiceConds.push(lte(invoices.createdAt, to))

  const [expenseTotal] = await db
    .select({ total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)` })
    .from(expenses)
    .where(and(...expenseConds))

  const [invoiced] = await db
    .select({ total: sql<string>`coalesce(sum(${invoices.reportingAmount}), 0)` })
    .from(invoices)
    .where(and(...invoiceConds))

  const [paid] = await db
    .select({
      total: sql<string>`coalesce(sum(${invoices.reportingAmount} - ${invoices.outstandingBalance}), 0)`,
    })
    .from(invoices)
    .where(eq(invoices.companyId, companyId))

  const [outstanding] = await db
    .select({ total: sql<string>`coalesce(sum(${invoices.outstandingBalance}), 0)` })
    .from(invoices)
    .where(
      and(
        eq(invoices.companyId, companyId),
        sql`${invoices.paymentStatus} in ('unpaid','partially_paid','overdue')`,
      ),
    )

  const pendingApprovals = await db
    .select()
    .from(approvals)
    .where(and(eq(approvals.companyId, companyId), eq(approvals.status, 'pending')))

  const overdue = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.companyId, companyId), eq(invoices.paymentStatus, 'overdue')))

  const budgetRows = await db.select().from(budgets).where(and(eq(budgets.companyId, companyId), eq(budgets.active, true)))
  let budgetUtil = 0
  if (budgetRows.length) {
    let alloc = 0
    let actual = 0
    for (const b of budgetRows) {
      alloc += Number(b.allocatedAmount)
      const [sum] = await db
        .select({ total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)` })
        .from(expenses)
        .where(
          and(
            eq(expenses.companyId, companyId),
            sql`${expenses.status} in ('approved','paid','partially_paid','pending_approval')`,
            b.departmentId ? eq(expenses.departmentId, b.departmentId) : sql`true`,
          ),
        )
      actual += Number(sum?.total || 0)
    }
    budgetUtil = alloc > 0 ? (actual / alloc) * 100 : 0
  }

  const deptSpend = await db
    .select({
      departmentId: expenses.departmentId,
      total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)`,
    })
    .from(expenses)
    .where(and(...expenseConds))
    .groupBy(expenses.departmentId)

  const monthly = await db
    .select({
      month: sql<string>`to_char(${expenses.transactionDate}, 'YYYY-MM')`,
      total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)`,
    })
    .from(expenses)
    .where(and(...expenseConds))
    .groupBy(sql`to_char(${expenses.transactionDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${expenses.transactionDate}, 'YYYY-MM')`)

  const topVendors = await db
    .select({
      vendorId: invoices.vendorId,
      total: sql<string>`coalesce(sum(${invoices.reportingAmount}), 0)`,
    })
    .from(invoices)
    .where(and(...invoiceConds))
    .groupBy(invoices.vendorId)
    .orderBy(sql`sum(${invoices.reportingAmount}) desc`)
    .limit(5)

  return {
    totalExpenses: Number(expenseTotal?.total || 0),
    totalInvoiced: Number(invoiced?.total || 0),
    totalPaid: Number(paid?.total || 0),
    outstanding: Number(outstanding?.total || 0),
    pendingApprovals: pendingApprovals.length,
    overdueInvoices: overdue.length,
    budgetUtilization: budgetUtil,
    deptSpend,
    monthly,
    topVendors,
  }
}

export async function agingReport(companyId: string) {
  const db = getDb()
  const rows = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.companyId, companyId),
        sql`${invoices.paymentStatus} in ('unpaid','partially_paid','overdue')`,
      ),
    )

  const buckets = { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90p: 0 }
  const now = Date.now()
  for (const r of rows) {
    const due = r.dueDate ? r.dueDate.getTime() : now
    const days = Math.floor((now - due) / 86400000)
    const amt = Number(r.outstandingBalance)
    if (days <= 0) buckets.current += amt
    else if (days <= 30) buckets.d1_30 += amt
    else if (days <= 60) buckets.d31_60 += amt
    else if (days <= 90) buckets.d61_90 += amt
    else buckets.d90p += amt
  }
  return buckets
}
