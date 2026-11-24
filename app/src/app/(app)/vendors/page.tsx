import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { listVendorsAction } from '@/server/vendors/actions'
import { getActiveCompanyId, getSession, requireAnyPermission } from '@/server/authz'

export default async function VendorsPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requireAnyPermission(companyId, ['vendors.view', 'vendors.manage'])
  const rows = await listVendorsAction()

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Vendors</h1>
          <p>Supplier profiles and payment terms.</p>
        </div>
        <Link href="/vendors/new">
          <Button>Add vendor</Button>
        </Link>
      </div>
      <div className="panel">
        <div className="panel-body" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Country</th>
                <th>Currency</th>
                <th>Terms</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">
                    No vendors yet.
                  </td>
                </tr>
              ) : (
                rows.map((v) => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td>{v.country || '-'}</td>
                    <td>{v.defaultCurrency}</td>
                    <td>{v.paymentTerms || '-'}</td>
                    <td>{v.active ? 'Active' : 'Inactive'}</td>
                    <td>
                      <Link href={`/vendors/${v.id}`}>View</Link>
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
