import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import { createExpenseAction, getExpenseFormOptions } from '@/server/expenses/actions'
import { getActiveCompanyId, getSession, requirePermission } from '@/server/authz'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default async function NewExpensePage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requirePermission(companyId, 'expenses.create')
  const options = await getExpenseFormOptions()
  const idem = nanoid()

  async function save(formData: FormData) {
    'use server'
    const result = await createExpenseAction(formData)
    if (result.id) redirect(`/expenses/${result.id}`)
  }

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>New expense</h1>
          <p>Manual expense entry.</p>
        </div>
      </div>
      <form className="panel" style={{ maxWidth: 640 }} action={save}>
        <div className="panel-body" style={{ display: 'grid', gap: 12 }}>
          <input type="hidden" name="idempotencyKey" value={idem} />
          <div className="auth-field">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="auth-field">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
          </div>
          <div className="auth-field">
            <Label htmlFor="vendorId">Vendor</Label>
            <select id="vendorId" name="vendorId" className="dx-input">
              <option value="">—</option>
              {options.vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div className="auth-field">
            <Label htmlFor="categoryId">Category</Label>
            <select id="categoryId" name="categoryId" className="dx-input">
              <option value="">—</option>
              {options.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="auth-field">
            <Label htmlFor="departmentId">Department</Label>
            <select id="departmentId" name="departmentId" className="dx-input">
              <option value="">—</option>
              {options.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="auth-field">
            <Label htmlFor="transactionDate">Date</Label>
            <Input
              id="transactionDate"
              name="transactionDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
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
            <Label htmlFor="originalAmount">Amount (excl. tax)</Label>
            <Input id="originalAmount" name="originalAmount" type="number" step="0.01" required />
          </div>
          <div className="auth-field">
            <Label htmlFor="taxAmount">Tax</Label>
            <Input id="taxAmount" name="taxAmount" type="number" step="0.01" defaultValue="0" />
          </div>
          <div className="auth-field">
            <Label htmlFor="paymentMethod">Payment method</Label>
            <Input id="paymentMethod" name="paymentMethod" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" name="submit" value="0" variant="secondary">
              Save draft
            </Button>
            <Button type="submit" name="submit" value="1">
              Submit for approval
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
