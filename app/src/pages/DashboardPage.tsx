import { Link } from 'react-router-dom'
import { dashboardStats } from '@/data/mock'
import { formatPkr } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

export function DashboardPage() {
  const maxTrend = Math.max(...dashboardStats.monthlyTrend.map((m) => m.amount))

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Summary cards reflect the current month. Pick a month for the graphs, or open Reports."
        actions={
          <>
            <Button as={Link} to="/reports" variant="secondary" size="sm">
              Reports
            </Button>
            <Button type="button" variant="secondary" size="sm">
              Refresh
            </Button>
          </>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 18 }}>
        {[
          { label: 'Pending Approvals', value: String(dashboardStats.pendingApprovals) },
          { label: 'My Requests', value: String(dashboardStats.myRequests) },
          { label: 'Approved', value: String(dashboardStats.approved) },
          { label: 'Rejected', value: String(dashboardStats.rejected) },
          {
            label: 'Spending (2026-11)',
            value: formatPkr(dashboardStats.spending),
            hint: 'Current month only',
          },
          {
            label: 'Largest purchase (2026-11)',
            value: formatPkr(dashboardStats.largestPurchase),
            hint: 'Current month only',
          },
          {
            label: 'Avg Approval Time',
            value: `${dashboardStats.avgApprovalHours.toFixed(1)}h`,
          },
          { label: 'Top purchase #', value: dashboardStats.topPurchaseNumber },
        ].map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="label">{card.label}</div>
            <div className="value">{card.value}</div>
            {card.hint ? <div className="hint">{card.hint}</div> : null}
          </div>
        ))}
      </div>

      <div className="panel-header" style={{ padding: '0 0 12px', border: 'none' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Spend graphs</h2>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            Showing November 2026 · {formatPkr(dashboardStats.spending)}
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div className="panel">
          <div className="panel-header">
            <h3>Monthly Spending Trend</h3>
            <span className="muted">November 2026</span>
          </div>
          <div className="panel-body">
            <div className="chart-bars">
              {dashboardStats.monthlyTrend.map((point) => (
                <div
                  key={point.month}
                  className="chart-bar"
                  style={{ height: `${Math.max(8, (point.amount / maxTrend) * 100)}%` }}
                  title={formatPkr(point.amount)}
                >
                  <span>{point.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Department Spending</h3>
            <span className="muted">November 2026</span>
          </div>
          <div className="panel-body">
            {dashboardStats.departmentSpend.map((row) => (
              <div key={row.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>{row.name}</span>
                  <span className="mono">{formatPkr(row.amount)}</span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(row.amount / dashboardStats.spending) * 100}%`,
                      height: '100%',
                      background: 'var(--color-lime-500)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <h3>Procurement Status</h3>
            <span className="muted">Open pipeline across all requests</span>
          </div>
          <div className="panel-body">
            {dashboardStats.pipeline.map((row) => (
              <div
                key={row.status}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}
              >
                <span>{row.status}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="panel-body">
            {dashboardStats.recentActivity.map((item) => (
              <div className="activity-item" key={`${item.number}-${item.action}`}>
                <div className="activity-dot" />
                <div>
                  <div>
                    {item.actor} · {item.action} ·{' '}
                    <Link to={`/requests/${item.number}`}>{item.number}</Link>
                  </div>
                  <div className="muted">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
