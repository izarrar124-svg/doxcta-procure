import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { OverviewBoard } from '@/components/dashboard/OverviewBoard'
import { getActiveCompanyId, getSession, requireMembership } from '@/server/authz'
import { getDb } from '@/server/db'
import { departments, notifications, vendors } from '@/server/db/schema'
import { agingReport, getOverviewMetrics } from '@/server/reports/overview'
import { searchWorkspace } from '@/server/reports/search'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string; q?: string }>
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
  const q = (sp.q || '').trim()
  const customFrom = parseDay(sp.from)
  const customTo = parseDay(sp.to, true)
  const usingCustom = Boolean(customFrom || customTo)
  const range = usingCustom ? 'custom' : sp.range || 'month'
  const from = customFrom || (usingCustom ? undefined : rangeStart(range))
  const to = customTo || undefined

  const metrics = await getOverviewMetrics(companyId, from, to)
  const aging = await agingReport(companyId)
  const search = q ? await searchWorkspace(companyId, q) : null

  const db = getDb()
  const deptRows = await db.select().from(departments).where(eq(departments.companyId, companyId))
  const deptMap = Object.fromEntries(deptRows.map((d) => [d.id, d.name]))
  const vendorRows = await db.select().from(vendors).where(eq(vendors.companyId, companyId))
  const vendorMap = Object.fromEntries(vendorRows.map((v) => [v.id, v.name]))
  const notes = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .limit(8)

  const monthly = metrics.monthly.map((m) => ({
    month: m.month,
    total: Number(m.total),
  }))
  const deptSpend = metrics.deptSpend.map((d) => ({
    name: deptMap[d.departmentId || ''] || 'Unassigned',
    total: Number(d.total),
  }))
  const topVendors = metrics.topVendors.map((v) => ({
    name: vendorMap[v.vendorId || ''] || 'Unknown',
    total: Number(v.total),
  }))
  const agingData = [
    { label: 'Current', total: aging.current },
    { label: '1-30', total: aging.d1_30 },
    { label: '31-60', total: aging.d31_60 },
    { label: '61-90', total: aging.d61_90 },
    { label: '90+', total: aging.d90p },
  ]

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Overview</h1>
          <p>{company.name}: financial operations at a glance.</p>
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
              : '-'
          }
        />
      </div>

      <OverviewBoard
        range={usingCustom ? 'month' : range}
        from={sp.from}
        to={sp.to}
        q={q || undefined}
        monthly={monthly}
        deptSpend={deptSpend}
        topVendors={topVendors}
        aging={agingData}
        notes={notes.map((n) => ({ id: n.id, title: n.title, body: n.body }))}
        search={search}
      />
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

function parseDay(value?: string, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const [y, m, d] = value.split('-').map(Number)
  if (endOfDay) return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999))
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
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
