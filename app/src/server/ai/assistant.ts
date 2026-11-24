'use server'

import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { requirePermission } from '@/server/authz'
import { resolveCompanyId } from '@/server/company-context'
import { getDb } from '@/server/db'
import {
  aiAssistantLogs,
  budgets,
  departments,
  expenses,
  invoices,
  vendors,
} from '@/server/db/schema'
import { getPlanLimits } from '@/server/usage'

type ToolResult = { answer: string; sources: string[] }

async function spendThisMonth(companyId: string): Promise<ToolResult> {
  const db = getDb()
  const start = new Date()
  start.setUTCDate(1)
  start.setUTCHours(0, 0, 0, 0)
  const [row] = await db
    .select({ total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)` })
    .from(expenses)
    .where(
      and(
        eq(expenses.companyId, companyId),
        gte(expenses.transactionDate, start),
        sql`${expenses.status} not in ('cancelled', 'draft', 'rejected')`,
      ),
    )
  return {
    answer: `Total spend this month (reporting currency): ${Number(row?.total || 0).toFixed(2)}`,
    sources: ['expenses'],
  }
}

async function topVendors(companyId: string): Promise<ToolResult> {
  const db = getDb()
  const rows = await db
    .select({
      name: vendors.name,
      total: sql<string>`coalesce(sum(${invoices.reportingAmount}), 0)`,
      id: vendors.id,
    })
    .from(invoices)
    .innerJoin(vendors, eq(invoices.vendorId, vendors.id))
    .where(eq(invoices.companyId, companyId))
    .groupBy(vendors.id, vendors.name)
    .orderBy(desc(sql`sum(${invoices.reportingAmount})`))
    .limit(5)

  if (!rows.length) return { answer: 'No vendor spend recorded yet.', sources: [] }
  const lines = rows.map((r, i) => `${i + 1}. ${r.name}: ${Number(r.total).toFixed(2)}`)
  return { answer: `Top five vendors by invoiced amount:\n${lines.join('\n')}`, sources: rows.map((r) => r.id) }
}

async function unpaidInvoices(companyId: string): Promise<ToolResult> {
  const db = getDb()
  const rows = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.companyId, companyId),
        sql`${invoices.paymentStatus} in ('unpaid', 'partially_paid', 'overdue')`,
      ),
    )
    .orderBy(desc(invoices.dueDate))
    .limit(20)
  const total = rows.reduce((s, r) => s + Number(r.outstandingBalance), 0)
  return {
    answer: `${rows.length} unpaid/partial invoices. Outstanding total: ${total.toFixed(2)}.`,
    sources: rows.map((r) => r.id),
  }
}

async function departmentSpend(companyId: string): Promise<ToolResult> {
  const db = getDb()
  const rows = await db
    .select({
      name: departments.name,
      total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)`,
      id: departments.id,
    })
    .from(expenses)
    .leftJoin(departments, eq(expenses.departmentId, departments.id))
    .where(and(eq(expenses.companyId, companyId), sql`${expenses.status} not in ('cancelled','draft','rejected')`))
    .groupBy(departments.id, departments.name)
    .orderBy(desc(sql`sum(${expenses.reportingAmount})`))

  if (!rows.length) return { answer: 'No departmental spend yet.', sources: [] }
  const top = rows[0]
  const lines = rows.map((r) => `${r.name || 'Unassigned'}: ${Number(r.total).toFixed(2)}`)
  return {
    answer: `Department spend (highest: ${top.name || 'Unassigned'}):\n${lines.join('\n')}`,
    sources: rows.map((r) => r.id).filter(Boolean) as string[],
  }
}

async function budgetOverruns(companyId: string): Promise<ToolResult> {
  const db = getDb()
  const rows = await db.select().from(budgets).where(and(eq(budgets.companyId, companyId), eq(budgets.active, true)))
  const results: string[] = []
  const sources: string[] = []
  for (const b of rows) {
    const conditions = [eq(expenses.companyId, companyId), sql`${expenses.status} in ('approved','paid','partially_paid','pending_approval')`]
    if (b.departmentId) conditions.push(eq(expenses.departmentId, b.departmentId))
    if (b.categoryId) conditions.push(eq(expenses.categoryId, b.categoryId))
    const [sum] = await db
      .select({ total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)` })
      .from(expenses)
      .where(and(...conditions))
    const actual = Number(sum?.total || 0)
    const allocated = Number(b.allocatedAmount)
    const pct = allocated > 0 ? (actual / allocated) * 100 : 0
    if (pct >= 100) {
      results.push(`${b.name}: ${pct.toFixed(0)}% utilized (${actual.toFixed(2)} / ${allocated.toFixed(2)})`)
      sources.push(b.id)
    }
  }
  return {
    answer: results.length ? `Budgets exceeded:\n${results.join('\n')}` : 'No departmental/category budgets are currently exceeded.',
    sources,
  }
}

async function compareMonths(companyId: string): Promise<ToolResult> {
  const db = getDb()
  const now = new Date()
  const thisStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const lastStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  const lastEnd = new Date(thisStart.getTime() - 1)

  const [cur] = await db
    .select({ total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)` })
    .from(expenses)
    .where(and(eq(expenses.companyId, companyId), gte(expenses.transactionDate, thisStart)))
  const [prev] = await db
    .select({ total: sql<string>`coalesce(sum(${expenses.reportingAmount}), 0)` })
    .from(expenses)
    .where(
      and(
        eq(expenses.companyId, companyId),
        gte(expenses.transactionDate, lastStart),
        lte(expenses.transactionDate, lastEnd),
      ),
    )

  return {
    answer: `This month: ${Number(cur?.total || 0).toFixed(2)}. Previous month: ${Number(prev?.total || 0).toFixed(2)}.`,
    sources: ['expenses'],
  }
}

function pickTool(query: string) {
  const q = query.toLowerCase()
  if (q.includes('unpaid') || q.includes('owe')) return 'unpaid'
  if (q.includes('top') && q.includes('vendor')) return 'vendors'
  if (q.includes('department')) return 'departments'
  if (q.includes('budget')) return 'budgets'
  if (q.includes('compare') || q.includes('october') || q.includes('november') || q.includes('previous'))
    return 'compare'
  if (q.includes('spend') || q.includes('this month') || q.includes('how much')) return 'spend'
  return 'spend'
}

export async function askAssistantAction(query: string) {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'ai.assistant')
  const limits = await getPlanLimits(companyId)
  void limits

  const tool = pickTool(query)
  let result: ToolResult
  switch (tool) {
    case 'unpaid':
      result = await unpaidInvoices(companyId)
      break
    case 'vendors':
      result = await topVendors(companyId)
      break
    case 'departments':
      result = await departmentSpend(companyId)
      break
    case 'budgets':
      result = await budgetOverruns(companyId)
      break
    case 'compare':
      result = await compareMonths(companyId)
      break
    default:
      result = await spendThisMonth(companyId)
  }

  const explained = await explainWithLlm(query, result.answer)
  const db = getDb()
  await db.insert(aiAssistantLogs).values({
    companyId,
    userId: session.user.id,
    query,
    response: explained,
    sourceIds: JSON.stringify(result.sources),
  })

  return { answer: explained, sources: result.sources, tool }
}

async function explainWithLlm(query: string, verified: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return `${verified}\n\n(Figures calculated from your organization records.)`
  }
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_ASSISTANT_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Explain verified financial results clearly. Never invent numbers. Only use the provided verified facts.',
          },
          {
            role: 'user',
            content: `Question: ${query}\n\nVerified facts:\n${verified}`,
          },
        ],
      }),
    })
    if (!res.ok) return verified
    const json = (await res.json()) as { choices: Array<{ message: { content: string } }> }
    return json.choices[0]?.message?.content || verified
  } catch {
    return verified
  }
}
