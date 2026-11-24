import { and, eq, inArray } from 'drizzle-orm'
import { headers } from 'next/headers'
import { getAuth } from '@/server/auth'
import { getDb } from '@/server/db'
import {
  companies,
  companyMemberships,
  membershipRoles,
  permissions,
  rolePermissions,
  roles,
  sessions,
} from '@/server/db/schema'
import type { PermissionKey } from '@/server/permissions'

export async function getSession() {
  const auth = getAuth()
  return auth.api.getSession({ headers: await headers() })
}

export async function requireUser() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

export async function requireSuperAdmin() {
  const session = await requireUser()
  if (!(session.user as { isSuperAdmin?: boolean }).isSuperAdmin) {
    throw new Error('FORBIDDEN')
  }
  return session
}

export async function getActiveCompanyId(userId: string, preferred?: string | null) {
  const db = getDb()
  if (preferred) {
    const [m] = await db
      .select()
      .from(companyMemberships)
      .where(
        and(
          eq(companyMemberships.userId, userId),
          eq(companyMemberships.companyId, preferred),
          eq(companyMemberships.status, 'active'),
        ),
      )
      .limit(1)
    if (m) return m.companyId
  }

  const [first] = await db
    .select()
    .from(companyMemberships)
    .where(and(eq(companyMemberships.userId, userId), eq(companyMemberships.status, 'active')))
    .limit(1)
  return first?.companyId ?? null
}

export async function requireMembership(companyId: string) {
  const session = await requireUser()
  const db = getDb()

  const [company] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1)
  if (!company) throw new Error('NOT_FOUND')
  if (company.status === 'suspended') throw new Error('COMPANY_SUSPENDED')

  const [membership] = await db
    .select()
    .from(companyMemberships)
    .where(
      and(
        eq(companyMemberships.companyId, companyId),
        eq(companyMemberships.userId, session.user.id),
        eq(companyMemberships.status, 'active'),
      ),
    )
    .limit(1)

  if (!membership) throw new Error('FORBIDDEN')
  return { session, company, membership }
}

export async function listUserPermissions(membershipId: string): Promise<string[]> {
  const db = getDb()
  const mrs = await db
    .select({ roleId: membershipRoles.roleId })
    .from(membershipRoles)
    .where(eq(membershipRoles.membershipId, membershipId))
  if (mrs.length === 0) return []
  const roleIds = mrs.map((r) => r.roleId)
  const rows = await db
    .select({ key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(inArray(rolePermissions.roleId, roleIds))
  return [...new Set(rows.map((r) => r.key))]
}

export async function requirePermission(companyId: string, permission: PermissionKey) {
  const ctx = await requireMembership(companyId)
  const perms = await listUserPermissions(ctx.membership.id)
  if (!perms.includes(permission)) throw new Error('FORBIDDEN')
  return { ...ctx, permissions: perms }
}

export async function requireAnyPermission(
  companyId: string,
  needed: PermissionKey[],
) {
  const ctx = await requireMembership(companyId)
  const perms = await listUserPermissions(ctx.membership.id)
  if (!needed.some((p) => perms.includes(p))) throw new Error('FORBIDDEN')
  return { ...ctx, permissions: perms }
}

export async function getMembershipPermissions(companyId: string) {
  const ctx = await requireMembership(companyId)
  const perms = await listUserPermissions(ctx.membership.id)
  return { ...ctx, permissions: perms }
}

export async function setActiveCompany(userId: string, companyId: string, sessionToken: string) {
  await requireMembership(companyId)
  const db = getDb()
  await db
    .update(sessions)
    .set({ activeCompanyId: companyId, updatedAt: new Date() })
    .where(eq(sessions.token, sessionToken))
}

export async function listMembershipsForUser(userId: string) {
  const db = getDb()
  return db
    .select({
      membershipId: companyMemberships.id,
      companyId: companies.id,
      companyName: companies.name,
      status: companyMemberships.status,
      companyStatus: companies.status,
    })
    .from(companyMemberships)
    .innerJoin(companies, eq(companyMemberships.companyId, companies.id))
    .where(eq(companyMemberships.userId, userId))
}

export async function listRolesForCompany(companyId: string) {
  const db = getDb()
  return db.select().from(roles).where(eq(roles.companyId, companyId))
}
