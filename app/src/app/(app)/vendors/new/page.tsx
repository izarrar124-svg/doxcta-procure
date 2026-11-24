import { redirect } from 'next/navigation'
import { createVendorAction } from '@/server/vendors/actions'
import { getActiveCompanyId, getSession, requirePermission } from '@/server/authz'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default async function NewVendorPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requirePermission(companyId, 'vendors.manage')

  async function save(formData: FormData) {
    'use server'
    const result = await createVendorAction(formData)
    if (result.id) redirect(`/vendors/${result.id}`)
  }

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Add vendor</h1>
          <p>Register a supplier for invoices and expenses.</p>
        </div>
      </div>
      <form className="panel" style={{ maxWidth: 640 }} action={save}>
        <div className="panel-body" style={{ display: 'grid', gap: 12 }}>
          <div className="auth-field">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="auth-field">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="auth-field">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" placeholder="US / GB / AE" />
          </div>
          <div className="auth-field">
            <Label htmlFor="defaultCurrency">Default currency</Label>
            <select id="defaultCurrency" name="defaultCurrency" className="dx-input" defaultValue="USD">
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="AED">AED</option>
            </select>
          </div>
          <div className="auth-field">
            <Label htmlFor="paymentTerms">Payment terms</Label>
            <Input id="paymentTerms" name="paymentTerms" defaultValue="Net 30" />
          </div>
          <div className="auth-field">
            <Label htmlFor="taxRegistration">Tax registration</Label>
            <Input id="taxRegistration" name="taxRegistration" />
          </div>
          <div className="auth-field">
            <Label htmlFor="bankName">Bank name</Label>
            <Input id="bankName" name="bankName" />
          </div>
          <div className="auth-field">
            <Label htmlFor="bankAccountNumber">Bank account number</Label>
            <Input id="bankAccountNumber" name="bankAccountNumber" />
          </div>
          <Button type="submit">Save vendor</Button>
        </div>
      </form>
    </div>
  )
}
