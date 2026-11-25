import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { getDb } from '@/server/db'
import { approvals, expenses, invoices, vendors } from '@/server/db/schema'

export type SearchHit = {
  id: string
  label: string
  detail?: string
  href: string
}

export type WorkspaceSearchResults = {
  expenses: SearchHit[]
  invoices: SearchHit[]
  vendors: SearchHit[]
  approvals: SearchHit[]
}

export async function searchWorkspace(
  companyId: string,
  q: string,
): Promise<WorkspaceSearchResults> {
  const term = q.trim()
  const empty: WorkspaceSearchResults = {
    expenses: [],
    invoices: [],
    vendors: [],
    approvals: [],
  }
  if (!term || term.length < 2) return empty

  const db = getDb()
  const like = `%${term}%`

  const expenseRows = await db
    .select({
      id: expenses.id,
      title: expenses.title,
      reference: expenses.reference,
      status: expenses.status,
      amount: expenses.reportingAmount,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.companyId, companyId),
        or(
          ilike(expenses.title, like),
          ilike(expenses.reference, like),
          ilike(expenses.description, like),
          sql`${expenses.id}::text ilike ${like}`,
        ),
      ),
    )
    .limit(8)

  const invoiceRows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      amount: invoices.reportingAmount,
      vendorId: invoices.vendorId,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.companyId, companyId),
        or(
          ilike(invoices.invoiceNumber, like),
          sql`${invoices.id}::text ilike ${like}`,
        ),
      ),
    )
    .limit(8)

  const vendorRows = await db
    .select({
      id: vendors.id,
      name: vendors.name,
      email: vendors.email,
      country: vendors.country,
    })
    .from(vendors)
    .where(
      and(
        eq(vendors.companyId, companyId),
        or(ilike(vendors.name, like), ilike(vendors.email, like), ilike(vendors.legalName, like)),
      ),
    )
    .limit(8)

  const approvalRows = await db
    .select({
      id: approvals.id,
      entityType: approvals.entityType,
      entityId: approvals.entityId,
      status: approvals.status,
      amount: approvals.amount,
      currency: approvals.currency,
    })
    .from(approvals)
    .where(
      and(
        eq(approvals.companyId, companyId),
        eq(approvals.status, 'pending'),
        or(
          ilike(approvals.entityType, like),
          sql`${approvals.entityId}::text ilike ${like}`,
          sql`${approvals.id}::text ilike ${like}`,
        ),
      ),
    )
    .limit(8)

  return {
    expenses: expenseRows.map((r) => ({
      id: r.id,
      label: r.title,
      detail: `${r.reference} · ${r.status} · ${Number(r.amount).toFixed(2)}`,
      href: `/expenses/${r.id}`,
    })),
    invoices: invoiceRows.map((r) => ({
      id: r.id,
      label: r.invoiceNumber || `Invoice ${r.id.slice(0, 8)}`,
      detail: `${r.status} · ${Number(r.amount).toFixed(2)}`,
      href: `/invoices/${r.id}`,
    })),
    vendors: vendorRows.map((r) => ({
      id: r.id,
      label: r.name,
      detail: [r.email, r.country].filter(Boolean).join(' · ') || undefined,
      href: `/vendors/${r.id}`,
    })),
    approvals: approvalRows.map((r) => ({
      id: r.id,
      label: `${r.entityType} approval`,
      detail: [
        r.entityId.slice(0, 8),
        r.amount != null ? `${Number(r.amount).toFixed(2)} ${r.currency || ''}`.trim() : null,
      ]
        .filter(Boolean)
        .join(' · '),
      href: '/approvals',
    })),
  }
}
