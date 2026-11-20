import { eq } from 'drizzle-orm'
import { createDepartmentAction } from '@/server/actions/company'
import { getActiveCompanyId, getSession, requirePermission } from '@/server/authz'
import { getDb } from '@/server/db'
import { departments } from '@/server/db/schema'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { redirect } from 'next/navigation'

export default async function DepartmentsPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requirePermission(companyId, 'departments.manage')

  const db = getDb()
  const rows = await db.select().from(departments).where(eq(departments.companyId, companyId))

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Departments</h1>
          <p>Org units used for routing and reporting.</p>
        </div>
      </div>

      <form className="panel" style={{ marginBottom: 16 }} action={createDepartmentAction}>
        <div className="panel-header">
          <h3>Add department</h3>
        </div>
        <div className="panel-body grid-2-equal">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" required />
          </div>
          <div>
            <Button type="submit">Create</Button>
          </div>
        </div>
      </form>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td className="mono">{d.code}</td>
                <td>{d.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
