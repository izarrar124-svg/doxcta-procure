import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { requests as seed } from '@/data/mock'
import type { PurchaseRequest } from '@/data/types'
import { formatPkr } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusPill } from '@/components/ui/StatusPill'

export function ApprovalsPage() {
  const [items, setItems] = useState<PurchaseRequest[]>(seed)

  const queue = useMemo(
    () =>
      items.filter(
        (r) =>
          r.status === 'Pending Approval' &&
          r.approvals.some((a) => a.decision === 'Pending'),
      ),
    [items],
  )

  function decide(id: string, decision: 'Approved' | 'Rejected') {
    setItems((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req
        const nextApprovals = [...req.approvals]
        const pendingIdx = nextApprovals.findIndex((a) => a.decision === 'Pending')
        if (pendingIdx === -1) return req
        nextApprovals[pendingIdx] = {
          ...nextApprovals[pendingIdx],
          decision,
          decidedAt: new Date().toISOString(),
        }
        const stillPending = nextApprovals.some((a) => a.decision === 'Pending')
        return {
          ...req,
          approvals: nextApprovals,
          status:
            decision === 'Rejected'
              ? 'Rejected'
              : stillPending
                ? 'Pending Approval'
                : 'Approved',
        }
      }),
    )
  }

  return (
    <div>
      <PageHeader
        title="Approvals"
        description="Items waiting for your decision. Sequential steps advance the approval chain."
      />

      <div className="panel">
        {queue.length === 0 ? (
          <div className="panel-body" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>Inbox clear</h3>
            <p className="muted" style={{ margin: 0 }}>
              No requests need your approval right now.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Current step</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => {
                const step = item.approvals.find((a) => a.decision === 'Pending')
                return (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/requests/${item.number}`}>{item.number}</Link>
                      <div>{item.title}</div>
                    </td>
                    <td>
                      {step ? (
                        <>
                          Step {step.order}: {step.approver}
                          <div className="muted">{step.role}</div>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="mono">{formatPkr(item.amount)}</td>
                    <td>
                      <StatusPill status={item.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button type="button" size="sm" onClick={() => decide(item.id, 'Approved')}>
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => decide(item.id, 'Rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
