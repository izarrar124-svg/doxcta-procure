import { and, eq } from 'drizzle-orm'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getActiveCompanyId, getSession, requireAnyPermission } from '@/server/authz'
import { getDb } from '@/server/db'
import { expenses, vendors } from '@/server/db/schema'
import { submitExpenseAction } from '@/server/expenses/actions'
import { Button } from '@/components/ui/Button'
import { StatusPill } from '@/components/ui/StatusPill'

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requireAnyPermission(companyId, [
    'expenses.view_own',
    'expenses.view_department',
    'expenses.view_all',
  ])

  const db = getDb()
  const [row] = await db
    .select({ expense: expenses, vendorName: vendors.name })
    .from(expenses)
    .leftJoin(vendors, eq(expenses.vendorId, vendors.id))
    .where(and(eq(expenses.id, id), eq(expenses.companyId, companyId)))
    .limit(1)
  if (!row) redirect('/expenses')

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>{row.expense.title}</h1>
          <p>
            {row.expense.reference} · <StatusPill status={row.expense.status} />
          </p>
        </div>
        <Link href="/expenses">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>
      <div className="panel">
        <div className="panel-body" style={{ display: 'grid', gap: 8 }}>
          <div>
            <strong>Vendor:</strong> {row.vendorName || '-'}
          </div>
          <div>
            <strong>Date:</strong> {row.expense.transactionDate.toISOString().slice(0, 10)}
          </div>
          <div>
            <strong>Amount:</strong> {row.expense.currency} {Number(row.expense.totalAmount).toFixed(2)}
          </div>
          <div>
            <strong>Reporting:</strong> {row.expense.reportingCurrency}{' '}
            {Number(row.expense.reportingAmount).toFixed(2)} @ {row.expense.exchangeRate}
          </div>
          <div>
            <strong>Description:</strong> {row.expense.description || '-'}
          </div>
          {['draft', 'rejected'].includes(row.expense.status) ? (
            <form action={submitExpenseAction}>
              <input type="hidden" name="id" value={row.expense.id} />
              <Button type="submit">Submit for approval</Button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  )
}
