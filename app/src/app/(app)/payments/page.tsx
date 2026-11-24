import Link from 'next/link'
import { redirect } from 'next/navigation'
import { listPaymentsAction } from '@/server/payments/actions'
import { listInvoicesAction } from '@/server/invoices/actions'
import { getActiveCompanyId, getSession, requireAnyPermission } from '@/server/authz'
import { StatusPill } from '@/components/ui/StatusPill'

export default async function PaymentsPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requireAnyPermission(companyId, ['payments.view', 'payments.record'])

  const [payments, invoices] = await Promise.all([listPaymentsAction(), listInvoicesAction()])
  const open = invoices.filter((i) =>
    ['unpaid', 'partially_paid', 'overdue'].includes(i.invoice.paymentStatus),
  )

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Payments</h1>
          <p>Track invoice payments and outstanding balances.</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <h3>Outstanding invoices</h3>
        </div>
        <div className="panel-body" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Vendor</th>
                <th>Due</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {open.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">
                    No outstanding invoices.
                  </td>
                </tr>
              ) : (
                open.map((r) => (
                  <tr key={r.invoice.id}>
                    <td>{r.invoice.invoiceNumber || r.invoice.id.slice(0, 8)}</td>
                    <td>{r.vendorName || '-'}</td>
                    <td>{r.invoice.dueDate?.toISOString().slice(0, 10) || '-'}</td>
                    <td>
                      {r.invoice.currency} {Number(r.invoice.outstandingBalance).toFixed(2)}
                    </td>
                    <td>
                      <StatusPill status={r.invoice.paymentStatus} />
                    </td>
                    <td>
                      <Link href={`/invoices/${r.invoice.id}`}>Record payment</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Payment history</h3>
        </div>
        <div className="panel-body" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    No payments yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.payment.id}>
                    <td>{p.payment.paymentDate.toISOString().slice(0, 10)}</td>
                    <td>{p.invoiceNumber || '-'}</td>
                    <td>{p.vendorName || '-'}</td>
                    <td>
                      {p.payment.currency} {Number(p.payment.amount).toFixed(2)}
                    </td>
                    <td>{p.payment.reference || '-'}</td>
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
