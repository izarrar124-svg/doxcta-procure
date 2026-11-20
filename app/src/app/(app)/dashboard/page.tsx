import { eq } from 'drizzle-orm'
import { getActiveCompanyId, getSession, requireMembership } from '@/server/authz'
import { getDb } from '@/server/db'
import { companies, companyMemberships, departments, notifications } from '@/server/db/schema'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')

  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) {
    return (
      <div>
        <h1>Welcome</h1>
        <p className="muted">No company workspace yet. Register a company or accept an invitation.</p>
      </div>
    )
  }

  const { company } = await requireMembership(companyId)
  const db = getDb()
  const [memberCount] = await db
    .select()
    .from(companyMemberships)
    .where(eq(companyMemberships.companyId, companyId))
  const deptRows = await db.select().from(departments).where(eq(departments.companyId, companyId))
  const notes = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .limit(5)

  // silence unused
  void memberCount
  void companies

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{company.name} — foundation metrics from your live workspace database.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="label">Company status</div>
          <div className="value" style={{ fontSize: '1.4rem' }}>
            {company.status}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Departments</div>
          <div className="value">{deptRows.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Your notifications</div>
          <div className="value">{notes.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Spend modules</div>
          <div className="value" style={{ fontSize: '1.1rem' }}>
            Coming soon
          </div>
          <div className="hint">Expenses & procurement land in Phases 5–6</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Recent notifications</h3>
        </div>
        <div className="panel-body">
          {notes.length === 0 ? (
            <p className="muted">No notifications yet.</p>
          ) : (
            notes.map((n) => (
              <div className="activity-item" key={n.id}>
                <div className="activity-dot" />
                <div>
                  <strong>{n.title}</strong>
                  <div className="muted">{n.body}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
