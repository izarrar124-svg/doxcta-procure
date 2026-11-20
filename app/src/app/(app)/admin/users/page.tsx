import { eq } from 'drizzle-orm'
import { inviteEmployeeAction, setMembershipStatusAction } from '@/server/actions/company'
import { getActiveCompanyId, getSession, listRolesForCompany, requirePermission } from '@/server/authz'
import { getDb } from '@/server/db'
import { companyMemberships, users } from '@/server/db/schema'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { redirect } from 'next/navigation'

async function disableAction(formData: FormData) {
  'use server'
  await setMembershipStatusAction(String(formData.get('membershipId')), 'disabled')
}

async function activateAction(formData: FormData) {
  'use server'
  await setMembershipStatusAction(String(formData.get('membershipId')), 'active')
}

export default async function EmployeesPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requirePermission(companyId, 'employees.manage')

  const db = getDb()
  const rows = await db
    .select({
      membershipId: companyMemberships.id,
      status: companyMemberships.status,
      designation: companyMemberships.designation,
      name: users.name,
      email: users.email,
    })
    .from(companyMemberships)
    .innerJoin(users, eq(companyMemberships.userId, users.id))
    .where(eq(companyMemberships.companyId, companyId))

  const roleRows = await listRolesForCompany(companyId)

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Employees</h1>
          <p>Invite teammates and manage membership status.</p>
        </div>
      </div>

      <form className="panel" style={{ marginBottom: 16 }} action={inviteEmployeeAction}>
        <div className="panel-header">
          <h3>Invite employee</h3>
        </div>
        <div className="panel-body grid-2-equal">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="roleId">Role</Label>
            <select id="roleId" name="roleId" className="dx-input" required>
              {roleRows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Button type="submit">Send invitation</Button>
          </div>
        </div>
      </form>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Designation</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.membershipId}>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.designation || '—'}</td>
                <td>{row.status}</td>
                <td>
                  {row.status === 'active' ? (
                    <form action={disableAction}>
                      <input type="hidden" name="membershipId" value={row.membershipId} />
                      <Button type="submit" size="sm" variant="secondary">
                        Disable
                      </Button>
                    </form>
                  ) : (
                    <form action={activateAction}>
                      <input type="hidden" name="membershipId" value={row.membershipId} />
                      <Button type="submit" size="sm">
                        Activate
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
