import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getInvoiceAction, getInvoiceFormOptions, updateInvoiceAction } from '@/server/invoices/actions'
import { getActiveCompanyId, getSession, requireAnyPermission } from '@/server/authz'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default async function InvoiceReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requireAnyPermission(companyId, ['invoices.approve', 'invoices.create', 'invoices.view'])

  const data = await getInvoiceAction(id)
  if (!data) redirect('/invoices')
  const options = await getInvoiceFormOptions()
  const confidence = data.invoice.confidenceJson
    ? (JSON.parse(data.invoice.confidenceJson) as Record<string, number>)
    : {}
  const warnings = data.invoice.validationWarnings
    ? (JSON.parse(data.invoice.validationWarnings) as string[])
    : []
  const doc = data.docs[0]

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>AI Review Center</h1>
          <p>Confirm extracted fields before finalizing the invoice record.</p>
        </div>
        <Link href={`/invoices/${id}`}>
          <Button variant="secondary">Invoice detail</Button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="panel">
          <div className="panel-header">
            <h3>Original document</h3>
          </div>
          <div className="panel-body">
            {doc ? (
              <div>
                <p>
                  <strong>{doc.fileName}</strong>
                </p>
                <p className="muted">
                  {doc.mimeType} · {Math.round(doc.sizeBytes / 1024)} KB
                </p>
                {doc.storageUrl.startsWith('http') ? (
                  <a href={doc.storageUrl} target="_blank" rel="noreferrer">
                    Open document
                  </a>
                ) : (
                  <p className="muted">Document stored (local/dev). Preview unavailable without Blob.</p>
                )}
              </div>
            ) : (
              <p className="muted">No document attached (manual invoice).</p>
            )}
            {warnings.length ? (
              <div style={{ marginTop: 12 }}>
                <strong>Validation warnings</strong>
                <ul>
                  {warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.invoice.duplicateOfInvoiceId ? (
              <p style={{ marginTop: 12 }}>
                Duplicate candidate:{' '}
                <Link href={`/invoices/${data.invoice.duplicateOfInvoiceId}`}>
                  {data.invoice.duplicateOfInvoiceId.slice(0, 8)}
                </Link>
              </p>
            ) : null}
          </div>
        </div>

        <form className="panel" action={updateInvoiceAction}>
          <div className="panel-header">
            <h3>Extracted fields</h3>
          </div>
          <div className="panel-body" style={{ display: 'grid', gap: 12 }}>
            <input type="hidden" name="id" value={id} />
            <Field
              label={`Invoice number (${pct(confidence.invoiceNumber)})`}
              name="invoiceNumber"
              defaultValue={data.invoice.invoiceNumber ?? ''}
            />
            <div className="auth-field">
              <Label htmlFor="vendorId">Vendor ({pct(confidence.vendorName)})</Label>
              <select
                id="vendorId"
                name="vendorId"
                className="dx-input"
                defaultValue={data.invoice.vendorId ?? ''}
              >
                <option value="">—</option>
                {options.vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label={`Invoice date (${pct(confidence.invoiceDate)})`}
              name="invoiceDate"
              type="date"
              defaultValue={data.invoice.invoiceDate?.toISOString().slice(0, 10) ?? ''}
            />
            <Field
              label={`Due date (${pct(confidence.dueDate)})`}
              name="dueDate"
              type="date"
              defaultValue={data.invoice.dueDate?.toISOString().slice(0, 10) ?? ''}
            />
            <div className="auth-field">
              <Label htmlFor="currency">Currency ({pct(confidence.currency)})</Label>
              <select id="currency" name="currency" className="dx-input" defaultValue={data.invoice.currency}>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
              </select>
            </div>
            <Field label={`Subtotal (${pct(confidence.subtotal)})`} name="subtotal" type="number" defaultValue={data.invoice.subtotal} />
            <Field label={`Tax (${pct(confidence.tax)})`} name="taxAmount" type="number" defaultValue={data.invoice.taxAmount} />
            <Field label="Discount" name="discountAmount" type="number" defaultValue={data.invoice.discountAmount} />
            <Field label={`Payment terms (${pct(confidence.paymentTerms)})`} name="paymentTerms" defaultValue={data.invoice.paymentTerms ?? ''} />
            <div className="auth-field">
              <Label htmlFor="categoryId">Suggested category</Label>
              <select id="categoryId" name="categoryId" className="dx-input" defaultValue={data.invoice.categoryId ?? ''}>
                <option value="">—</option>
                {options.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Approve & save</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function pct(n?: number) {
  if (n == null) return 'n/a'
  return `${Math.round(n * 100)}%`
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
}: {
  label: string
  name: string
  defaultValue: string
  type?: string
}) {
  return (
    <div className="auth-field">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} step={type === 'number' ? '0.01' : undefined} />
    </div>
  )
}
