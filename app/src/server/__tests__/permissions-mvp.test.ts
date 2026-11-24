import { describe, expect, it } from 'vitest'
import { PERMISSIONS, ROLE_TEMPLATES } from '@/server/permissions'

describe('MVP permissions', () => {
  it('includes invoice payment and AI keys', () => {
    const keys = PERMISSIONS.map((p) => p.key)
    expect(keys).toContain('invoices.create')
    expect(keys).toContain('payments.record')
    expect(keys).toContain('ai.assistant')
    expect(keys).toContain('audit.view')
  })

  it('includes auditor role template', () => {
    const auditor = ROLE_TEMPLATES.find((r) => r.key === 'auditor')
    expect(auditor).toBeTruthy()
    expect(auditor?.permissions).toContain('reports.view')
    expect(auditor?.permissions).not.toContain('payments.record')
  })
})
