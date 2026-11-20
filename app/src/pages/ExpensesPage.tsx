import { expenses } from '@/data/mock'
import { formatDate, formatPkr } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

export function ExpensesPage() {
  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Expense log from completed procurement and Google Sheet sync. Sync adds new rows only; delete removes from the app, not the sheet."
        actions={
          <Button type="button" size="sm" variant="secondary">
            Sync from Google Sheet
          </Button>
        }
      />
      <p className="muted" style={{ marginTop: -8, marginBottom: 14 }}>
        Showing {expenses.length} of 138
      </p>
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Date</th>
              <th>Description</th>
              <th>Department</th>
              <th>Category</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((row) => (
              <tr key={row.id}>
                <td className="mono">{row.number}</td>
                <td>{formatDate(row.date)}</td>
                <td>{row.description}</td>
                <td>{row.department}</td>
                <td>{row.category}</td>
                <td>{row.vendor}</td>
                <td className="mono">{formatPkr(row.amount)}</td>
                <td>{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
