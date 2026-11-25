import Link from 'next/link'
import { redirect } from 'next/navigation'
import { StatusPill } from '@/components/ui/StatusPill'
import { InvoiceUpload } from '@/components/invoices/InvoiceUpload'
import { listInvoicesAction } from '@/server/invoices/actions'
import { getActiveCompanyId, getMembershipPermissions, getSession, requireAnyPermission } from '@/server/authz'

export default async function InvoicesPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) {
    return (
      <div>
        <div className="app-page-header">
          <div>
            <h1>Invoice Center</h1>
            <p>You need an organization workspace before uploading invoices.</p>
          </div>
        </div>
        <p className="muted">
          Sign up a new workspace from{' '}
          <Link href="/register" style={{ color: 'var(--accent)' }}>
            Start Starter trial
          </Link>
          , or ask an admin to invite you.
        </p>
      </div>
    )
  }
  await requireAnyPermission(companyId, ['invoices.view', 'invoices.create'])
  const { permissions } = await getMembershipPermissions(companyId)
  const canUpload = permissions.includes('invoices.create')
  const rows = await listInvoicesAction()

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Invoice Center</h1>
          <p>Upload invoices for AI extraction or enter them manually.</p>
        </div>
        {canUpload ? (
          <Link href="/invoices/new" className="dx-btn dx-btn-secondary dx-btn-md">
            Manual invoice
          </Link>
        ) : null}
      </div>

      {canUpload ? (
        <div style={{ marginBottom: 18 }}>
          <InvoiceUpload />
        </div>
      ) : (
        <p className="muted" style={{ marginBottom: 18 }}>
          Your role can view invoices but cannot upload. Ask an admin for upload access.
        </p>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>Invoice records</h3>
        </div>
        <div className="panel-body" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Due</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="muted">
                    No invoices yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.invoice.id}>
                    <td>{r.invoice.invoiceNumber || r.invoice.id.slice(0, 8)}</td>
                    <td>{r.vendorName || '-'}</td>
                    <td>{r.invoice.invoiceDate?.toISOString().slice(0, 10) || '-'}</td>
                    <td>{r.invoice.dueDate?.toISOString().slice(0, 10) || '-'}</td>
                    <td>
                      {r.invoice.currency} {Number(r.invoice.totalAmount).toFixed(2)}
                    </td>
                    <td>
                      <StatusPill status={r.invoice.paymentStatus} />
                    </td>
                    <td>
                      <StatusPill status={r.invoice.status} />
                    </td>
                    <td>
                      <Link href={`/invoices/${r.invoice.id}`}>View</Link>
                      {r.invoice.status === 'needs_review' || r.invoice.status === 'processing' ? (
                        <>
                          {' · '}
                          <Link href={`/invoices/${r.invoice.id}/review`}>Review</Link>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
