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
          <h1>Settings</h1>
          <p>Organization defaults for this workspace.</p>
        </div>
      </div>
      <form className="panel" style={{ maxWidth: 560 }} action={updateCompanySettingsAction}>
        <div className="panel-body">
          <div className="auth-field">
            <Label htmlFor="name">Organization name</Label>
            <Input id="name" name="name" defaultValue={company?.name} required />
          </div>
          <div className="auth-field">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" name="currency" defaultValue={settings?.currency ?? 'PKR'} />
          </div>
          <div className="auth-field">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" name="timezone" defaultValue={settings?.timezone ?? 'Asia/Karachi'} />
          </div>
          <div className="auth-field">
            <Label htmlFor="fiscalYearStart">Fiscal year start</Label>
            <Input
              id="fiscalYearStart"
              name="fiscalYearStart"
              defaultValue={settings?.fiscalYearStart ?? 'July'}
            />
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
            <Label htmlFor="fxRatePkrUsd">FX rate (PKR per USD)</Label>
            <Input
              id="fxRatePkrUsd"
              name="fxRatePkrUsd"
              defaultValue={settings?.fxRatePkrUsd ?? '278'}
            />
          </div>
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </div>
  )
}
