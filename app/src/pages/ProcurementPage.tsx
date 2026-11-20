import { Link } from 'react-router-dom'
import { requests } from '@/data/mock'
import { formatPkr } from '@/lib/format'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusPill } from '@/components/ui/StatusPill'

export function ProcurementPage() {
  const pipeline = requests.filter((r) =>
    ['Approved', 'In Procurement'].includes(r.status),
  )

  return (
    <div>
      <PageHeader
        title="Procurement"
        description="Buy approved requests awaiting purchase."
      />
      <div className="panel">
        {pipeline.length === 0 ? (
          <div className="panel-body" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>Queue empty</h3>
            <p className="muted" style={{ margin: 0 }}>
              No approved requests awaiting purchase.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pipeline.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/requests/${item.number}`}>{item.number}</Link>
                    <div>{item.title}</div>
                  </td>
                  <td>{item.vendor}</td>
                  <td className="mono">{formatPkr(item.amount)}</td>
                  <td>
                    <StatusPill status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
