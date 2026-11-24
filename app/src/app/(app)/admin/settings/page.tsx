import { eq } from 'drizzle-orm'
import { updateCompanySettingsAction } from '@/server/actions/company'
import { getActiveCompanyId, getSession, requirePermission } from '@/server/authz'
import { getDb } from '@/server/db'
import { companies, companySettings } from '@/server/db/schema'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requirePermission(companyId, 'settings.manage')

  const db = getDb()
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1)
  const [settings] = await db
    .select()
    .from(companySettings)
    .where(eq(companySettings.companyId, companyId))
    .limit(1)

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Organization Settings</h1>
          <p>Company profile, regional settings, and budget thresholds.</p>
        </div>
      </div>
      <form className="panel" style={{ maxWidth: 640 }} action={updateCompanySettingsAction}>
        <div className="panel-body" style={{ display: 'grid', gap: 14 }}>
          <div className="auth-field">
            <Label htmlFor="name">Organization name</Label>
            <Input id="name" name="name" defaultValue={company?.name} required />
          </div>
          <div className="auth-field">
            <Label htmlFor="currency">Reporting currency</Label>
            <select id="currency" name="currency" className="dx-input" defaultValue={settings?.currency ?? 'USD'}>
              <option value="USD">USD (US Dollar)</option>
              <option value="GBP">GBP (British Pound)</option>
              <option value="AED">AED (UAE Dirham)</option>
            </select>
          </div>
          <div className="auth-field">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" name="timezone" defaultValue={settings?.timezone ?? 'America/New_York'} />
          </div>
          <div className="auth-field">
            <Label htmlFor="dateFormat">Date format</Label>
            <select id="dateFormat" name="dateFormat" className="dx-input" defaultValue={settings?.dateFormat ?? 'MM/DD/YYYY'}>
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (UK/UAE)</option>
            </select>
          </div>
          <div className="auth-field">
            <Label htmlFor="taxLabel">Tax terminology</Label>
            <select id="taxLabel" name="taxLabel" className="dx-input" defaultValue={settings?.taxLabel ?? 'sales_tax'}>
              <option value="sales_tax">Sales tax (US)</option>
              <option value="vat">VAT (UK/UAE)</option>
            </select>
          </div>
          <div className="auth-field">
            <Label htmlFor="taxRegistration">Tax registration number</Label>
            <Input id="taxRegistration" name="taxRegistration" defaultValue={settings?.taxRegistration ?? ''} />
          </div>
          <div className="auth-field">
            <Label htmlFor="fiscalYearStart">Fiscal year start</Label>
            <Input id="fiscalYearStart" name="fiscalYearStart" defaultValue={settings?.fiscalYearStart ?? 'January'} />
          </div>
          <div className="auth-field">
            <Label htmlFor="approvalReminderDays">Approval reminder days</Label>
            <Input
              id="approvalReminderDays"
              name="approvalReminderDays"
              type="number"
              defaultValue={settings?.approvalReminderDays ?? 3}
            />
          </div>
          <div className="auth-field">
            <Label htmlFor="budgetAlert70">Budget alert % (first)</Label>
            <Input id="budgetAlert70" name="budgetAlert70" type="number" defaultValue={settings?.budgetAlert70 ?? 70} />
          </div>
          <div className="auth-field">
            <Label htmlFor="budgetAlert90">Budget alert % (second)</Label>
            <Input id="budgetAlert90" name="budgetAlert90" type="number" defaultValue={settings?.budgetAlert90 ?? 90} />
          </div>
          <div className="auth-field">
            <Label htmlFor="budgetAlert100">Budget alert % (exceeded)</Label>
            <Input id="budgetAlert100" name="budgetAlert100" type="number" defaultValue={settings?.budgetAlert100 ?? 100} />
          </div>
          <div className="auth-field">
            <Label htmlFor="fxRatePkrUsd">Legacy FX (PKR per USD)</Label>
            <Input id="fxRatePkrUsd" name="fxRatePkrUsd" defaultValue={settings?.fxRatePkrUsd ?? '278'} />
          </div>
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </div>
  )
}
