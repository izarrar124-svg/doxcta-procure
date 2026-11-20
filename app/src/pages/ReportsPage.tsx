import { useMemo, useState } from 'react'
import { dashboardStats, expenses } from '@/data/mock'
import { formatPkr } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

export function ReportsPage() {
  const [year, setYear] = useState('2026')
  const [month, setMonth] = useState('11')
  const [allTime, setAllTime] = useState(false)

  const total = useMemo(() => {
    if (allTime) return expenses.reduce((sum, e) => sum + e.amount, 0) + 180000
    return dashboardStats.spending
  }, [allTime])

  return (
    <div>
      <PageHeader
        title="Reports"
        description="PKR spend reporting by period, department, and category."
        actions={
          <Button type="button" variant="secondary" size="sm">
            Export CSV
          </Button>
        }
      />

      <div className="filters-row">
        <select value={year} onChange={(e) => setYear(e.target.value)} disabled={allTime}>
          {['2026', '2025', '2024'].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} disabled={allTime}>
          <option value="all-months">All months</option>
          {[
            ['1', 'January'],
            ['2', 'February'],
            ['3', 'March'],
            ['4', 'April'],
            ['5', 'May'],
            ['6', 'June'],
            ['7', 'July'],
            ['8', 'August'],
            ['9', 'September'],
            ['10', 'October'],
            ['11', 'November'],
            ['12', 'December'],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          variant={allTime ? 'primary' : 'secondary'}
          onClick={() => setAllTime((v) => !v)}
        >
          All time
        </Button>
      </div>

      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="label">Reported spend</div>
          <div className="value">{formatPkr(total)}</div>
          <div className="hint">
            {allTime ? 'All time' : `Year ${year} · Month ${month}`}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Transactions</div>
          <div className="value">{expenses.length}</div>
          <div className="hint">Completed expenses in fixtures</div>
        </div>
        <div className="stat-card">
          <div className="label">Top department</div>
          <div className="value" style={{ fontSize: '1.25rem' }}>
            {dashboardStats.departmentSpend[0].name}
          </div>
          <div className="hint">{formatPkr(dashboardStats.departmentSpend[0].amount)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Top category</div>
          <div className="value" style={{ fontSize: '1.25rem' }}>
            Software
          </div>
          <div className="hint">{formatPkr(dashboardStats.categorySpend[0].amount)}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Department breakdown</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Spend</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {dashboardStats.departmentSpend.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td className="mono">{formatPkr(row.amount)}</td>
                <td>{Math.round((row.amount / dashboardStats.spending) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
