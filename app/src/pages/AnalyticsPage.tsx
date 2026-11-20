import { dashboardStats } from '@/data/mock'
import { formatPkr } from '@/lib/format'
import { PageHeader } from '@/components/ui/PageHeader'

export function AnalyticsPage() {
  const maxCat = Math.max(...dashboardStats.categorySpend.map((c) => c.amount))

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Category and pipeline distribution for the selected spend period."
      />
      <div className="grid-2-equal">
        <div className="panel">
          <div className="panel-header">
            <h3>Category Distribution</h3>
          </div>
          <div className="panel-body">
            <div className="chart-bars">
              {dashboardStats.categorySpend.map((c) => (
                <div
                  key={c.name}
                  className="chart-bar"
                  style={{ height: `${(c.amount / maxCat) * 100}%` }}
                  title={formatPkr(c.amount)}
                >
                  <span>{c.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <h3>Pipeline mix</h3>
          </div>
          <div className="panel-body">
            {dashboardStats.pipeline.map((row) => (
              <div
                key={row.status}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}
              >
                <span>{row.status}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
