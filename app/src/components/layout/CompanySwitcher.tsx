'use client'

import { switchCompanyAction } from '@/server/actions/company'

export function CompanySwitcher({
  memberships,
  activeCompanyId,
}: {
  memberships: Array<{
    companyId: string
    companyName: string
    status: string
    companyStatus: string
  }>
  activeCompanyId: string | null
}) {
  if (memberships.length === 0) return <span className="muted">No company</span>

  return (
    <select
      className="dx-input"
      style={{ maxWidth: 260, height: 40 }}
      value={activeCompanyId ?? memberships[0].companyId}
      onChange={async (e) => {
        await switchCompanyAction(e.target.value)
        window.location.reload()
      }}
    >
      {memberships.map((m) => (
        <option key={m.companyId} value={m.companyId} disabled={m.status !== 'active'}>
          {m.companyName}
          {m.companyStatus === 'suspended' ? ' (suspended)' : ''}
        </option>
      ))}
    </select>
  )
}
