import { eq, inArray } from 'drizzle-orm'
import { getActiveCompanyId, getSession, requirePermission } from '@/server/authz'
import { getDb } from '@/server/db'
import { permissions, rolePermissions, roles } from '@/server/db/schema'
import { redirect } from 'next/navigation'

export default async function RolesPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requirePermission(companyId, 'roles.manage')

  const db = getDb()
  const roleRows = await db.select().from(roles).where(eq(roles.companyId, companyId))
  const roleIds = roleRows.map((r) => r.id)
  const links =
    roleIds.length === 0
      ? []
      : await db
          .select({
            roleId: rolePermissions.roleId,
            key: permissions.key,
          })
          .from(rolePermissions)
          .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
          .where(inArray(rolePermissions.roleId, roleIds))

  const byRole = new Map<string, string[]>()
  for (const link of links) {
    const list = byRole.get(link.roleId) ?? []
    list.push(link.key)
    byRole.set(link.roleId, list)
  }

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Roles</h1>
          <p>Permission bundles for your company (system templates seeded on provisioning).</p>
        </div>
      </div>
      <div className="grid-2-equal">
        {roleRows.map((role) => (
          <div className="panel" key={role.id}>
            <div className="panel-header">
              <h3>{role.name}</h3>
              <span className="mono">{role.key}</span>
            </div>
            <div className="panel-body">
              <p className="muted">{role.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(byRole.get(role.id) ?? []).map((p) => (
                  <span key={p} className="dx-badge dx-badge-outline">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
