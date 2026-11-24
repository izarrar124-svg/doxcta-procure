import { describe, expect, it } from 'vitest'
import { validateExtraction, type InvoiceExtract } from '@/server/ai/extract'
import { money } from '@/server/company-context'

describe('money helper', () => {
  it('formats numeric amounts', () => {
    expect(money(12.5)).toBe('12.5000')
    expect(money('3')).toBe('3.0000')
  })
})

describe('invoice validation', () => {
  const base: InvoiceExtract = {
    vendorName: 'Acme',
    invoiceNumber: 'INV-1',
    invoiceDate: '2026-01-01',
    dueDate: '2026-01-31',
    currency: 'USD',
    subtotal: 100,
    tax: 10,
    discount: 0,
    total: 110,
    paymentTerms: 'Net 30',
    lineItems: [],
    confidence: {
      vendorName: 0.9,
      invoiceNumber: 0.9,
      invoiceDate: 0.9,
      dueDate: 0.9,
      currency: 0.9,
      subtotal: 0.9,
      tax: 0.9,
      total: 0.9,
      paymentTerms: 0.9,
    },
    suggestedCategory: 'Software & Subscriptions',
  }

  it('passes reconciled invoice', () => {
    const { warnings, missing } = validateExtraction(base)
    expect(missing).toEqual([])
    expect(warnings.some((w) => w.includes('Arithmetic'))).toBe(false)
  })

  it('flags arithmetic mismatch', () => {
    const { warnings } = validateExtraction({ ...base, total: 999 })
    expect(warnings.some((w) => w.includes('Arithmetic mismatch'))).toBe(true)
  })

  it('flags missing fields', () => {
    const { missing } = validateExtraction({
      ...base,
      vendorName: null,
      invoiceNumber: null,
    })
    expect(missing).toContain('vendorName')
    expect(missing).toContain('invoiceNumber')
  })
})
