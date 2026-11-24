import { and, eq, sql } from 'drizzle-orm'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getActiveCompanyId, getSession, requireAnyPermission, listUserPermissions } from '@/server/authz'
import { getDb } from '@/server/db'
import { invoices, vendors } from '@/server/db/schema'
import { updateVendorAction } from '@/server/vendors/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  const { membership } = await requireAnyPermission(companyId, ['vendors.view', 'vendors.manage'])
  const perms = await listUserPermissions(membership.id)
  const canBank = perms.includes('vendors.bank_view')
  const canManage = perms.includes('vendors.manage')

  const db = getDb()
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.id, id), eq(vendors.companyId, companyId)))
    .limit(1)
  if (!vendor) redirect('/vendors')

  const [spend] = await db
    .select({
      total: sql<string>`coalesce(sum(${invoices.reportingAmount}), 0)`,
      outstanding: sql<string>`coalesce(sum(${invoices.outstandingBalance}), 0)`,
    })
    .from(invoices)
    .where(and(eq(invoices.companyId, companyId), eq(invoices.vendorId, id)))

  const history = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.companyId, companyId), eq(invoices.vendorId, id)))
    .limit(20)

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>{vendor.name}</h1>
          <p>
            Spend {Number(spend?.total || 0).toFixed(2)} · Outstanding{' '}
            {Number(spend?.outstanding || 0).toFixed(2)}
          </p>
        </div>
        <Link href="/vendors">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>

      {canManage ? (
        <form className="panel" style={{ maxWidth: 640, marginBottom: 18 }} action={updateVendorAction}>
          <div className="panel-header">
            <h3>Edit vendor</h3>
          </div>
          <div className="panel-body" style={{ display: 'grid', gap: 12 }}>
            <input type="hidden" name="id" value={vendor.id} />
            <div className="auth-field">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={vendor.name} required />
            </div>
            <div className="auth-field">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" defaultValue={vendor.email ?? ''} />
            </div>
            <div className="auth-field">
              <Label htmlFor="paymentTerms">Payment terms</Label>
              <Input id="paymentTerms" name="paymentTerms" defaultValue={vendor.paymentTerms ?? ''} />
            </div>
            <div className="auth-field">
              <Label htmlFor="defaultCurrency">Currency</Label>
              <Input id="defaultCurrency" name="defaultCurrency" defaultValue={vendor.defaultCurrency} />
            </div>
            {canBank ? (
              <>
                <div className="auth-field">
                  <Label htmlFor="bankName">Bank name</Label>
                  <Input id="bankName" name="bankName" defaultValue={vendor.bankName ?? ''} />
                </div>
                <div className="auth-field">
                  <Label htmlFor="bankAccountNumber">Account number</Label>
                  <Input
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    defaultValue={vendor.bankAccountNumber ?? ''}
                  />
                </div>
              </>
            ) : null}
            <input type="hidden" name="active" value={vendor.active ? 'true' : 'false'} />
            <Button type="submit">Save</Button>
          </div>
        </form>
      ) : (
        <div className="panel" style={{ marginBottom: 18 }}>
          <div className="panel-body">
            <p>
              <strong>Email:</strong> {vendor.email || '—'}
            </p>
            <p>
              <strong>Terms:</strong> {vendor.paymentTerms || '—'}
            </p>
            {canBank ? (
              <p>
                <strong>Bank:</strong> {vendor.bankName || '—'} / {vendor.bankAccountNumber || '—'}
              </p>
            ) : (
              <p className="muted">Bank details restricted.</p>
            )}
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>Invoice history</h3>
        </div>
        <div className="panel-body">
          {history.length === 0 ? (
            <p className="muted">No invoices for this vendor.</p>
          ) : (
            <ul>
              {history.map((inv) => (
                <li key={inv.id}>
                  <Link href={`/invoices/${inv.id}`}>
                    {inv.invoiceNumber || inv.id.slice(0, 8)} — {inv.currency}{' '}
                    {Number(inv.totalAmount).toFixed(2)} ({inv.paymentStatus})
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
