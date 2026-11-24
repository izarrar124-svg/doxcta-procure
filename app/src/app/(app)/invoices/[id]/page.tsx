import Link from 'next/link'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import { getInvoiceAction } from '@/server/invoices/actions'
import { listInvoicePaymentsAction, recordPaymentAction } from '@/server/payments/actions'
import { getActiveCompanyId, getSession, requireAnyPermission } from '@/server/authz'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { StatusPill } from '@/components/ui/StatusPill'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requireAnyPermission(companyId, ['invoices.view', 'invoices.create'])

  const data = await getInvoiceAction(id)
  if (!data) redirect('/invoices')
  const payments = await listInvoicePaymentsAction(id)
  const idem = nanoid()

  async function pay(formData: FormData) {
    'use server'
    await recordPaymentAction(formData)
  }

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Invoice {data.invoice.invoiceNumber || data.invoice.id.slice(0, 8)}</h1>
          <p>
            <StatusPill status={data.invoice.status} /> ·{' '}
            <StatusPill status={data.invoice.paymentStatus} />
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/invoices/${id}/review`}>
            <Button variant="secondary">AI Review</Button>
          </Link>
          <Link href="/invoices">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-body" style={{ display: 'grid', gap: 8 }}>
          <div>
            <strong>Total:</strong> {data.invoice.currency} {Number(data.invoice.totalAmount).toFixed(2)}
          </div>
          <div>
            <strong>Outstanding:</strong> {Number(data.invoice.outstandingBalance).toFixed(2)}
          </div>
          <div>
            <strong>Due:</strong> {data.invoice.dueDate?.toISOString().slice(0, 10) || '—'}
          </div>
          <div>
            <strong>Terms:</strong> {data.invoice.paymentTerms || '—'}
          </div>
          {data.invoice.validationWarnings ? (
            <div>
              <strong>Warnings:</strong>{' '}
              {(JSON.parse(data.invoice.validationWarnings) as string[]).join('; ')}
            </div>
          ) : null}
          {data.invoice.duplicateOfInvoiceId ? (
            <div className="muted">
              Possible duplicate of{' '}
              <Link href={`/invoices/${data.invoice.duplicateOfInvoiceId}`}>
                {data.invoice.duplicateOfInvoiceId.slice(0, 8)}
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <h3>Line items</h3>
        </div>
        <div className="panel-body">
          {data.items.length === 0 ? (
            <p className="muted">No line items.</p>
          ) : (
            <ul>
              {data.items.map((item) => (
                <li key={item.id}>
                  {item.description} — qty {item.quantity} × {item.unitPrice} = {item.lineTotal}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <h3>Documents</h3>
        </div>
        <div className="panel-body">
          {data.docs.length === 0 ? (
            <p className="muted">No documents.</p>
          ) : (
            data.docs.map((d) => (
              <div key={d.id}>
                {d.fileName} ({Math.round(d.sizeBytes / 1024)} KB)
              </div>
            ))
          )}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <h3>Record payment</h3>
        </div>
        <form className="panel-body" style={{ display: 'grid', gap: 12, maxWidth: 420 }} action={pay}>
          <input type="hidden" name="invoiceId" value={id} />
          <input type="hidden" name="idempotencyKey" value={idem} />
          <div className="auth-field">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <div className="auth-field">
            <Label htmlFor="paymentDate">Date</Label>
            <Input
              id="paymentDate"
              name="paymentDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="auth-field">
            <Label htmlFor="paymentMethod">Method</Label>
            <Input id="paymentMethod" name="paymentMethod" />
          </div>
          <div className="auth-field">
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" name="reference" />
          </div>
          <Button type="submit">Record payment</Button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Payment history</h3>
        </div>
        <div className="panel-body">
          {payments.length === 0 ? (
            <p className="muted">No payments recorded.</p>
          ) : (
            <ul>
              {payments.map((p) => (
                <li key={p.id}>
                  {p.paymentDate.toISOString().slice(0, 10)} — {p.currency} {Number(p.amount).toFixed(2)}{' '}
                  {p.reference ? `(${p.reference})` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
