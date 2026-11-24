import { redirect } from 'next/navigation'
import { createManualInvoiceAction, getInvoiceFormOptions } from '@/server/invoices/actions'
import { getActiveCompanyId, getSession, requirePermission } from '@/server/authz'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default async function NewInvoicePage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requirePermission(companyId, 'invoices.create')
  const options = await getInvoiceFormOptions()

  async function save(formData: FormData) {
    'use server'
    const result = await createManualInvoiceAction(formData)
    if (result.id) redirect(`/invoices/${result.id}`)
  }

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Manual invoice</h1>
          <p>Enter invoice details without AI extraction.</p>
        </div>
      </div>
      <form className="panel" style={{ maxWidth: 640 }} action={save}>
        <div className="panel-body" style={{ display: 'grid', gap: 12 }}>
          <div className="auth-field">
            <Label htmlFor="invoiceNumber">Invoice number</Label>
            <Input id="invoiceNumber" name="invoiceNumber" required />
          </div>
          <div className="auth-field">
            <Label htmlFor="vendorId">Vendor</Label>
            <select id="vendorId" name="vendorId" className="dx-input">
              <option value="">-</option>
              {options.vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div className="auth-field">
            <Label htmlFor="invoiceDate">Invoice date</Label>
            <Input id="invoiceDate" name="invoiceDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="auth-field">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" name="dueDate" type="date" />
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
            <Label htmlFor="subtotal">Subtotal</Label>
            <Input id="subtotal" name="subtotal" type="number" step="0.01" required />
          </div>
          <div className="auth-field">
            <Label htmlFor="taxAmount">Tax</Label>
            <Input id="taxAmount" name="taxAmount" type="number" step="0.01" defaultValue="0" />
          </div>
          <div className="auth-field">
            <Label htmlFor="discountAmount">Discount</Label>
            <Input id="discountAmount" name="discountAmount" type="number" step="0.01" defaultValue="0" />
          </div>
          <div className="auth-field">
            <Label htmlFor="paymentTerms">Payment terms</Label>
            <Input id="paymentTerms" name="paymentTerms" defaultValue="Net 30" />
          </div>
          <div className="auth-field">
            <Label htmlFor="categoryId">Category</Label>
            <select id="categoryId" name="categoryId" className="dx-input">
              <option value="">-</option>
              {options.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Save invoice</Button>
        </div>
      </form>
    </div>
  )
}
