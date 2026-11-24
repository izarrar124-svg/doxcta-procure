import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getActiveCompanyId, getSession, requirePermission } from '@/server/authz'
import { getBillingSummary, createCheckoutSession } from '@/server/billing/stripe'
import { getUsageCount } from '@/server/usage'
import { resolveCompanyId } from '@/server/company-context'
import { getDb } from '@/server/db'
import { subscriptionPlans } from '@/server/db/schema'
import { Button } from '@/components/ui/Button'

async function checkout(formData: FormData) {
  'use server'
  const { companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'settings.manage')
  const planKey = String(formData.get('planKey') || 'professional')
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const session = await createCheckoutSession({
    companyId,
    planKey,
    successUrl: `${base}/admin/billing?success=1`,
    cancelUrl: `${base}/admin/billing?cancelled=1`,
  })
  redirect(session.url)
}

export default async function BillingPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requirePermission(companyId, 'settings.manage')

  const summary = await getBillingSummary(companyId)
  const invoiceUsage = await getUsageCount(companyId, 'invoices')
  const db = getDb()
  const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.active, true))

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Subscription & usage</h1>
          <p>
            Current plan: <strong>{summary.planKey}</strong> ({summary.status})
          </p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="label">Users limit</div>
          <div className="value">{summary.employeeLimit < 0 ? 'Unlimited' : summary.employeeLimit}</div>
        </div>
        <div className="stat-card">
          <div className="label">Invoices this month</div>
          <div className="value">
            {invoiceUsage}
            {summary.invoicesPerMonth < 0 ? '' : ` / ${summary.invoicesPerMonth}`}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">AI assistant</div>
          <div className="value" style={{ fontSize: '1.1rem' }}>
            {summary.aiAssistant}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Plans</h3>
        </div>
        <div className="panel-body" style={{ display: 'grid', gap: 12 }}>
          {plans.map((p) => (
            <form key={p.id} action={checkout} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <strong>{p.name}</strong>
                <div className="muted">
                  ${p.monthlyPrice}/mo · {p.description}
                </div>
              </div>
              <input type="hidden" name="planKey" value={p.key} />
              <Button type="submit" variant={p.key === summary.planKey ? 'secondary' : 'primary'}>
                {p.key === summary.planKey ? 'Current' : 'Select'}
              </Button>
            </form>
          ))}
        </div>
      </div>
    </div>
  )
}
