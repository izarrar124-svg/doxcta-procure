import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getActiveCompanyId, getSession, requirePermission } from '@/server/authz'
import { getOverviewMetrics, agingReport } from '@/server/reports/overview'
import { getDb } from '@/server/db'
import { departments, expenseCategories, expenses, vendors } from '@/server/db/schema'
import { Button } from '@/components/ui/Button'

export default async function ReportsPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requirePermission(companyId, 'reports.view')

  const metrics = await getOverviewMetrics(companyId)
  const aging = await agingReport(companyId)
  const db = getDb()
  const [deptRows, catRows, vendorRows] = await Promise.all([
    db.select().from(departments).where(eq(departments.companyId, companyId)),
    db.select().from(expenseCategories).where(eq(expenseCategories.companyId, companyId)),
    db.select().from(vendors).where(eq(vendors.companyId, companyId)),
  ])
  const expenseRows = await db.select().from(expenses).where(eq(expenses.companyId, companyId))

  const byCategory: Record<string, number> = {}
  for (const e of expenseRows) {
    if (['draft', 'cancelled', 'rejected'].includes(e.status)) continue
    const key = e.categoryId || 'none'
    byCategory[key] = (byCategory[key] || 0) + Number(e.reportingAmount)
  }
  const catMap = Object.fromEntries(catRows.map((c) => [c.id, c.name]))

  const csv = [
    'Report,Value',
    `Total Expenses,${metrics.totalExpenses}`,
    `Total Invoiced,${metrics.totalInvoiced}`,
    `Outstanding,${metrics.outstanding}`,
    `Aging Current,${aging.current}`,
    `Aging 1-30,${aging.d1_30}`,
    `Aging 31-60,${aging.d31_60}`,
    `Aging 61-90,${aging.d61_90}`,
    `Aging 90+,${aging.d90p}`,
  ].join('\n')

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Configurable financial summaries with export.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
            download="doxcta-report.csv"
          >
            <Button variant="secondary">Export CSV</Button>
          </a>
          <a href="/api/v1/reports/pdf">
            <Button>Export PDF summary</Button>
          </a>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="label">Expenses</div>
          <div className="value" style={{ fontSize: '1.2rem' }}>
            {metrics.totalExpenses.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Invoiced</div>
          <div className="value" style={{ fontSize: '1.2rem' }}>
            {metrics.totalInvoiced.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Outstanding</div>
          <div className="value" style={{ fontSize: '1.2rem' }}>
            {metrics.outstanding.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Budget util.</div>
          <div className="value" style={{ fontSize: '1.2rem' }}>
            {metrics.budgetUtilization.toFixed(0)}%
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="panel">
          <div className="panel-header">
            <h3>Invoice aging</h3>
          </div>
          <div className="panel-body">
            <ul>
              <li>Current: {aging.current.toFixed(2)}</li>
              <li>1-30 days: {aging.d1_30.toFixed(2)}</li>
              <li>31-60 days: {aging.d31_60.toFixed(2)}</li>
              <li>61-90 days: {aging.d61_90.toFixed(2)}</li>
              <li>90+ days: {aging.d90p.toFixed(2)}</li>
            </ul>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <h3>Category spend</h3>
          </div>
          <div className="panel-body">
            {Object.keys(byCategory).length === 0 ? (
              <p className="muted">No categorized spend.</p>
            ) : (
              <ul>
                {Object.entries(byCategory).map(([id, total]) => (
                  <li key={id}>
                    {catMap[id] || 'Uncategorized'}: {total.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <h3>Departments</h3>
          </div>
          <div className="panel-body">
            <ul>
              {deptRows.map((d) => (
                <li key={d.id}>{d.name}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <h3>Vendors</h3>
          </div>
          <div className="panel-body">
            <ul>
              {vendorRows.slice(0, 10).map((v) => (
                <li key={v.id}>{v.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
