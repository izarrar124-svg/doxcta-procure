import { describe, expect, it } from 'vitest'
import { PERMISSIONS, ROLE_TEMPLATES } from '@/server/permissions'

describe('permission catalog', () => {
  it('has unique permission keys', () => {
    const keys = PERMISSIONS.map((p) => p.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('company admin includes employees.manage', () => {
    const admin = ROLE_TEMPLATES.find((r) => r.key === 'company_admin')
    expect(admin?.permissions).toContain('employees.manage')
  })

  it('employee cannot manage settings', () => {
    const employee = ROLE_TEMPLATES.find((r) => r.key === 'employee')
    expect(employee?.permissions).not.toContain('settings.manage')
  })
})
