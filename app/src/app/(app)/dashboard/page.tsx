import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getActiveCompanyId, getSession, requireMembership } from '@/server/authz'
import { getDb } from '@/server/db'
import { departments, notifications, vendors } from '@/server/db/schema'
import { getOverviewMetrics } from '@/server/reports/overview'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const session = await getSession()
  if (!session?.user) redirect('/login')

  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) {
    return (
      <div>
        <h1>Welcome</h1>
        <p className="muted">No organization workspace yet. Register or accept an invitation.</p>
      </div>
    )
  }

  const { company } = await requireMembership(companyId)
  const sp = await searchParams
  const range = sp.range || 'month'
  const from = rangeStart(range)
  const metrics = await getOverviewMetrics(companyId, from)

  const db = getDb()
  const deptRows = await db.select().from(departments).where(eq(departments.companyId, companyId))
  const deptMap = Object.fromEntries(deptRows.map((d) => [d.id, d.name]))
  const vendorRows = await db.select().from(vendors).where(eq(vendors.companyId, companyId))
  const vendorMap = Object.fromEntries(vendorRows.map((v) => [v.id, v.name]))
  const notes = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .limit(5)

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Overview</h1>
          <p>{company.name} — financial operations at a glance.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['week', 'month', 'quarter', 'year'].map((r) => (
            <Link key={r} href={`/dashboard?range=${r}`} className="dx-btn dx-btn-ghost dx-btn-sm">
              {r === 'week' ? 'This week' : r === 'month' ? 'This month' : r === 'quarter' ? 'This quarter' : 'This year'}
            </Link>
          ))}
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <Stat label="Total expenses" value={metrics.totalExpenses.toFixed(2)} />
        <Stat label="Total invoiced" value={metrics.totalInvoiced.toFixed(2)} />
        <Stat label="Outstanding payables" value={metrics.outstanding.toFixed(2)} />
        <Stat label="Pending approvals" value={String(metrics.pendingApprovals)} />
        <Stat label="Overdue invoices" value={String(metrics.overdueInvoices)} />
        <Stat label="Budget utilization" value={`${metrics.budgetUtilization.toFixed(0)}%`} />
        <Stat label="Total paid" value={metrics.totalPaid.toFixed(2)} />
        <Stat
          label="Monthly growth pts"
          value={
            metrics.monthly.length >= 2
              ? (
                  Number(metrics.monthly[metrics.monthly.length - 1].total) -
                  Number(metrics.monthly[metrics.monthly.length - 2].total)
                ).toFixed(2)
              : '—'
          }
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-header">
            <h3>Departmental expenditure</h3>
          </div>
          <div className="panel-body">
            {metrics.deptSpend.length === 0 ? (
              <p className="muted">No spend in range.</p>
            ) : (
              <ul>
                {metrics.deptSpend.map((d) => (
                  <li key={d.departmentId || 'none'}>
                    {deptMap[d.departmentId || ''] || 'Unassigned'}: {Number(d.total).toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <h3>Top vendors</h3>
          </div>
          <div className="panel-body">
            {metrics.topVendors.length === 0 ? (
              <p className="muted">No vendor invoices yet.</p>
            ) : (
              <ul>
                {metrics.topVendors.map((v) => (
                  <li key={v.vendorId || 'none'}>
                    {vendorMap[v.vendorId || ''] || 'Unknown'}: {Number(v.total).toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <h3>Monthly spending trend</h3>
        </div>
        <div className="panel-body">
          {metrics.monthly.length === 0 ? (
            <p className="muted">No monthly data yet.</p>
          ) : (
            <ul>
              {metrics.monthly.map((m) => (
                <li key={m.month}>
                  {m.month}: {Number(m.total).toFixed(2)}
                </li>
              ))}
            </ul>
          )}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className="value" style={{ fontSize: '1.25rem' }}>
        {value}
      </div>
    </div>
  )
}

function rangeStart(range: string) {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  if (range === 'week') {
    d.setUTCDate(d.getUTCDate() - 7)
    return d
  }
  if (range === 'quarter') {
    const q = Math.floor(d.getUTCMonth() / 3) * 3
    return new Date(Date.UTC(d.getUTCFullYear(), q, 1))
  }
  if (range === 'year') return new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}
