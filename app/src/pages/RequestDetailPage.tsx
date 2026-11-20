import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { requests } from '@/data/mock'
import { formatDate, formatPkr } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusPill } from '@/components/ui/StatusPill'

export function RequestDetailPage() {
  const { number } = useParams()
  const item = requests.find((r) => r.number === number) ?? requests[0]
  const [comments, setComments] = useState(item.comments)
  const [draft, setDraft] = useState('')

  function postComment(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    setComments((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        author: 'Zarrar Ahmed',
        body: draft.trim(),
        at: new Date().toISOString(),
      },
    ])
    setDraft('')
  }

  return (
    <div>
      <PageHeader
        title={item.title}
        description={`${item.number} · ${item.department}`}
        actions={
          <>
            {['Approved', 'In Procurement', 'Completed'].includes(item.status) ? (
              <Button as={Link} to="/procurement" variant="secondary" size="sm">
                View procurement
              </Button>
            ) : null}
            <Button as={Link} to="/requests" variant="secondary" size="sm">
              Back to requests
            </Button>
          </>
        }
      />

      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div className="panel">
          <div className="panel-header">
            <h3>Request details</h3>
            <StatusPill status={item.status} />
          </div>
          <div className="panel-body">
            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                gap: '10px 12px',
                margin: 0,
              }}
            >
              <dt className="muted">Estimated cost</dt>
              <dd style={{ margin: 0 }} className="mono">
                {formatPkr(item.amount)}
              </dd>
              <dt className="muted">Required date</dt>
              <dd style={{ margin: 0 }}>{formatDate(item.requiredBy)}</dd>
              <dt className="muted">Category</dt>
              <dd style={{ margin: 0 }}>{item.category}</dd>
              <dt className="muted">Department</dt>
              <dd style={{ margin: 0 }}>{item.department}</dd>
              <dt className="muted">Requester</dt>
              <dd style={{ margin: 0 }}>{item.requester}</dd>
              <dt className="muted">Priority</dt>
              <dd style={{ margin: 0 }}>
                <StatusPill status={item.priority} />
              </dd>
              <dt className="muted">Vendor</dt>
              <dd style={{ margin: 0 }}>{item.vendor}</dd>
              <dt className="muted">Description</dt>
              <dd style={{ margin: 0 }}>{item.description}</dd>
            </dl>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Approval timeline</h3>
          </div>
          <div className="panel-body">
            {item.approvals.map((step) => (
              <div key={step.id} className="activity-item">
                <div className="activity-dot" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong>
                      Step {step.order}: {step.approver}
                    </strong>
                    <StatusPill status={step.decision} />
                  </div>
                  <div className="muted">
                    {step.role}
                    {step.decidedAt ? ` · ${formatDate(step.decidedAt)}` : ' · waiting'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <h3>Comments</h3>
          </div>
          <div className="panel-body">
            {comments.length === 0 ? (
              <p className="muted">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div className="activity-item" key={c.id}>
                  <div className="activity-dot" />
                  <div>
                    <strong>{c.author}</strong>
                    <div>{c.body}</div>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>
                      {formatDate(c.at)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <form onSubmit={postComment} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Input
                placeholder="Add a comment…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button type="submit" size="sm">
                Post comment
              </Button>
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Procurement</h3>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="muted">Status</span>
              <StatusPill
                status={
                  item.status === 'Completed'
                    ? 'Completed'
                    : item.status === 'In Procurement'
                      ? 'In Procurement'
                      : item.status === 'Approved'
                        ? 'Approved'
                        : '—'
                }
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Amount</span>
              <span className="mono">{formatPkr(item.amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
