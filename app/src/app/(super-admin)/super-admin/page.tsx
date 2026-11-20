import { count, eq } from 'drizzle-orm'
import {
  superAdminAssignPlanAction,
  superAdminCreateCompanyAction,
  superAdminSetCompanyStatusAction,
} from '@/server/actions/company'
import { requireSuperAdmin } from '@/server/authz'
import { getDb } from '@/server/db'
import {
  companies,
  subscriptionPlans,
  subscriptions,
  users,
} from '@/server/db/schema'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function suspendAction(formData: FormData) {
  'use server'
  await superAdminSetCompanyStatusAction(String(formData.get('companyId')), 'suspended')
}

async function activateAction(formData: FormData) {
  'use server'
  await superAdminSetCompanyStatusAction(String(formData.get('companyId')), 'active')
}

async function assignPlanAction(formData: FormData) {
  'use server'
  await superAdminAssignPlanAction(
    String(formData.get('companyId')),
    String(formData.get('planKey')),
    String(formData.get('status')),
  )
}

export default async function SuperAdminPage() {
  try {
    await requireSuperAdmin()
  } catch {
    redirect('/dashboard')
  }

  const db = getDb()
  const companyRows = await db.select().from(companies)
  const [{ value: userCount }] = await db.select({ value: count() }).from(users)
  const [{ value: activeCount }] = await db
    .select({ value: count() })
    .from(companies)
    .where(eq(companies.status, 'active'))
  const plans = await db.select().from(subscriptionPlans)
  const subs = await db.select().from(subscriptions)
  const subByCompany = Object.fromEntries(subs.map((s) => [s.companyId, s]))

  return (
    <div className="app-content" style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1>Super Admin</h1>
          <p className="muted">Platform tenancy and subscription controls.</p>
        </div>
        <Link href="/dashboard" className="dx-btn dx-btn-secondary dx-btn-sm">
          Back to app
        </Link>
      </div>

      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="label">Companies</div>
          <div className="value">{companyRows.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Active companies</div>
          <div className="value">{activeCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Users</div>
          <div className="value">{userCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Plans</div>
          <div className="value">{plans.length}</div>
        </div>
      </div>

      <form className="panel" style={{ marginBottom: 16 }} action={superAdminCreateCompanyAction}>
        <div className="panel-header">
          <h3>Create company</h3>
        </div>
        <div className="panel-body grid-2-equal">
          <div>
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" name="companyName" required />
          </div>
          <div>
            <Label htmlFor="businessEmail">Admin email</Label>
            <Input id="businessEmail" name="businessEmail" type="email" required />
          </div>
          <div>
            <Label htmlFor="adminName">Admin name</Label>
            <Input id="adminName" name="adminName" required />
          </div>
          <div>
            <Label htmlFor="adminPassword">Temp password</Label>
            <Input id="adminPassword" name="adminPassword" type="password" minLength={8} required />
          </div>
          <div>
            <Label htmlFor="planKey">Plan</Label>
            <select id="planKey" name="planKey" className="dx-input" defaultValue="starter">
              {plans.map((p) => (
                <option key={p.id} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Button type="submit">Provision</Button>
          </div>
        </div>
      </form>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>Subscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companyRows.map((c) => {
              const sub = subByCompany[c.id]
              const plan = plans.find((p) => p.id === sub?.planId)
              return (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.businessEmail}</td>
                  <td>{c.status}</td>
                  <td>
                    {plan?.name ?? '—'} / {sub?.status ?? '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {c.status === 'active' ? (
                        <form action={suspendAction}>
                          <input type="hidden" name="companyId" value={c.id} />
                          <Button type="submit" size="sm" variant="secondary">
                            Suspend
                          </Button>
                        </form>
                      ) : (
                        <form action={activateAction}>
                          <input type="hidden" name="companyId" value={c.id} />
                          <Button type="submit" size="sm">
                            Activate
                          </Button>
                        </form>
                      )}
                      <form action={assignPlanAction} style={{ display: 'flex', gap: 6 }}>
                        <input type="hidden" name="companyId" value={c.id} />
                        <select name="planKey" className="dx-input" style={{ height: 40 }} defaultValue={plan?.key ?? 'starter'}>
                          {plans.map((p) => (
                            <option key={p.id} value={p.key}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <select name="status" className="dx-input" style={{ height: 40 }} defaultValue={sub?.status ?? 'trial'}>
                          <option value="trial">Trial</option>
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="expired">Expired</option>
                        </select>
                        <Button type="submit" size="sm" variant="secondary">
                          Assign
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
