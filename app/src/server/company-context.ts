import { getActiveCompanyId, requireUser } from '@/server/authz'

export async function resolveCompanyId(explicit?: string | null) {
  const session = await requireUser()
  const companyId =
    explicit ||
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) throw new Error('NO_COMPANY')
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
