import { eq } from 'drizzle-orm'
import { getActiveCompanyId, requireUser } from '@/server/authz'
import { getDb } from '@/server/db'
import { sessions } from '@/server/db/schema'

export async function resolveCompanyId(explicit?: string | null) {
  const session = await requireUser()
  const sessionRow = session.session as {
    id?: string
    token?: string
    activeCompanyId?: string | null
  }
  let companyId =
    explicit ||
    sessionRow.activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) throw new Error('NO_COMPANY')

  // Persist active company on the session so subsequent requests stay scoped.
  if (!sessionRow.activeCompanyId && sessionRow.token) {
    const db = getDb()
    await db
      .update(sessions)
      .set({ activeCompanyId: companyId, updatedAt: new Date() })
      .where(eq(sessions.token, sessionRow.token))
  }

  return { session, companyId }
}

export function money(n: number | string) {
  const v = typeof n === 'string' ? Number(n) : n
  if (!Number.isFinite(v)) return '0.0000'
  return v.toFixed(4)
}

export function periodKey(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
