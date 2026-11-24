import { redirect } from 'next/navigation'
import { createBudgetAction, getBudgetFormOptions, listBudgetsAction } from '@/server/budgets/actions'
import { getActiveCompanyId, getSession, requireAnyPermission, listUserPermissions } from '@/server/authz'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default async function BudgetsPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  const { membership } = await requireAnyPermission(companyId, ['budgets.view', 'budgets.manage'])
  const perms = await listUserPermissions(membership.id)
  const canManage = perms.includes('budgets.manage')

  const { budgets } = await listBudgetsAction()
  const options = canManage ? await getBudgetFormOptions() : { departments: [], categories: [] }

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Budgets</h1>
          <p>Department and category budget tracking.</p>
        </div>
      </div>

      {canManage ? (
        <form className="panel" style={{ maxWidth: 640, marginBottom: 18 }} action={createBudgetAction}>
          <div className="panel-header">
            <h3>Create budget</h3>
          </div>
          <div className="panel-body" style={{ display: 'grid', gap: 12 }}>
            <div className="auth-field">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="auth-field">
              <Label htmlFor="periodType">Period</Label>
              <select id="periodType" name="periodType" className="dx-input" defaultValue="annual">
                <option value="annual">Annual</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="auth-field">
              <Label htmlFor="departmentId">Department</Label>
              <select id="departmentId" name="departmentId" className="dx-input">
                <option value="">All</option>
                {options.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="auth-field">
              <Label htmlFor="categoryId">Category</Label>
              <select id="categoryId" name="categoryId" className="dx-input">
                <option value="">All</option>
                {options.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="auth-field">
              <Label htmlFor="currency">Currency</Label>
              <select id="currency" name="currency" className="dx-input" defaultValue="USD">
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
              </select>
            </div>
            <div className="auth-field">
              <Label htmlFor="allocatedAmount">Allocated amount</Label>
              <Input id="allocatedAmount" name="allocatedAmount" type="number" step="0.01" required />
            </div>
            <Button type="submit">Create</Button>
          </div>
        </form>
      ) : null}

      <div className="panel">
        <div className="panel-body" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Allocated</th>
                <th>Actual</th>
                <th>Remaining</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {budgets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    No budgets configured.
                  </td>
                </tr>
              ) : (
                budgets.map((b) => (
                  <tr key={b.budget.id}>
                    <td>{b.budget.name}</td>
                    <td>
                      {b.budget.currency} {Number(b.budget.allocatedAmount).toFixed(2)}
                    </td>
                    <td>{b.actual.toFixed(2)}</td>
                    <td>{b.remaining.toFixed(2)}</td>
                    <td>{b.utilization.toFixed(0)}%</td>
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
