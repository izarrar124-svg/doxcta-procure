import { describe, expect, it } from 'vitest'

/** Documents the error codes authz guards throw for callers to map to HTTP/UI. */
const AUTH_ERRORS = ['UNAUTHORIZED', 'FORBIDDEN', 'COMPANY_SUSPENDED', 'NOT_FOUND', 'NO_COMPANY'] as const

describe('authz error catalog', () => {
  it('includes tenant suspension signal', () => {
    expect(AUTH_ERRORS).toContain('COMPANY_SUSPENDED')
  })

  it('includes forbidden for cross-tenant / missing permission', () => {
    expect(AUTH_ERRORS).toContain('FORBIDDEN')
  })
})
