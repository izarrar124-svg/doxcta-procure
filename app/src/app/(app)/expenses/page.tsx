import Link from 'next/link'
import { redirect } from 'next/navigation'
import { StatusPill } from '@/components/ui/StatusPill'
import { Button } from '@/components/ui/Button'
import { listExpensesAction } from '@/server/expenses/actions'
import { getActiveCompanyId, getSession, requireAnyPermission } from '@/server/authz'

export default async function ExpensesPage() {
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
    'expenses.create',
  ])

  const rows = await listExpensesAction()

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Expenses</h1>
          <p>Record and track operational expenses.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/api/v1/expenses/export">
            <Button variant="secondary">Export CSV</Button>
          </a>
          <Link href="/expenses/new">
            <Button>New expense</Button>
          </Link>
        </div>
      </div>

      <div className="panel">
        <div className="panel-body" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Vendor</th>
                <th>Department</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="muted">
                    No expenses yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.expense.id}>
                    <td>{r.expense.reference}</td>
                    <td>{r.expense.title}</td>
                    <td>{r.vendorName || '—'}</td>
                    <td>{r.departmentName || '—'}</td>
                    <td>{r.categoryName || '—'}</td>
                    <td>{r.expense.transactionDate.toISOString().slice(0, 10)}</td>
                    <td>
                      {r.expense.currency} {Number(r.expense.totalAmount).toFixed(2)}
                    </td>
                    <td>
                      <StatusPill status={r.expense.status} />
                    </td>
                    <td>
                      <Link href={`/expenses/${r.expense.id}`}>View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
