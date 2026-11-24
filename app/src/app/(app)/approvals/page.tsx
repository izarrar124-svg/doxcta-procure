import { redirect } from 'next/navigation'
import {
  approveAction,
  getApprovalEntityLabel,
  listPendingApprovalsAction,
  rejectAction,
  returnAction,
} from '@/server/approvals/actions'
import { getActiveCompanyId, getSession, requireAnyPermission } from '@/server/authz'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default async function ApprovalsPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requireAnyPermission(companyId, ['expenses.approve', 'invoices.approve'])

  const rows = await listPendingApprovalsAction()
  const labeled = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      label: await getApprovalEntityLabel(r.approval.entityType, r.approval.entityId),
    })),
  )

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Approval Center</h1>
          <p>Pending expense and invoice approvals.</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-body" style={{ display: 'grid', gap: 16 }}>
          {labeled.length === 0 ? (
            <p className="muted">No pending approvals.</p>
          ) : (
            labeled.map((r) => (
              <div
                key={r.approval.id}
                style={{
                  borderBottom: '1px solid var(--border, #333)',
                  paddingBottom: 12,
                  display: 'grid',
                  gap: 8,
                }}
              >
                <div>
                  <strong>{r.label}</strong>
                  <div className="muted">
                    {r.approval.entityType} · step {r.approval.currentStepOrder} · requester{' '}
                    {r.requesterName || '—'} ·{' '}
                    {r.approval.currency} {Number(r.approval.amount || 0).toFixed(2)}
                  </div>
                  <div className="muted">
                    Submitted {r.approval.createdAt.toISOString().slice(0, 10)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
                  <form action={approveAction} style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
                    <input type="hidden" name="id" value={r.approval.id} />
                    <Input name="comment" placeholder="Comment (optional)" />
                    <Button type="submit">Approve</Button>
                  </form>
                  <form action={rejectAction}>
                    <input type="hidden" name="id" value={r.approval.id} />
                    <input type="hidden" name="comment" value="Rejected" />
                    <Button type="submit" variant="secondary">
                      Reject
                    </Button>
                  </form>
                  <form action={returnAction}>
                    <input type="hidden" name="id" value={r.approval.id} />
                    <input type="hidden" name="comment" value="Returned for correction" />
                    <Button type="submit" variant="ghost">
                      Return
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
