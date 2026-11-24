import { z } from 'zod'

export const invoiceExtractSchema = z.object({
  vendorName: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  currency: z.string().nullable(),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  discount: z.number().nullable(),
  total: z.number().nullable(),
  paymentTerms: z.string().nullable(),
  lineItems: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number().nullable(),
        unitPrice: z.number().nullable(),
        taxAmount: z.number().nullable(),
        lineTotal: z.number().nullable(),
      }),
    )
    .default([]),
  confidence: z.object({
    vendorName: z.number(),
    invoiceNumber: z.number(),
    invoiceDate: z.number(),
    dueDate: z.number(),
    currency: z.number(),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    paymentTerms: z.number(),
  }),
  suggestedCategory: z.string().nullable(),
})

export type InvoiceExtract = z.infer<typeof invoiceExtractSchema>

export async function extractInvoiceWithOpenAI(input: {
  mimeType: string
  fileName: string
  bytes: Buffer
  categories: string[]
}): Promise<InvoiceExtract> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return mockExtract(input.fileName, input.categories)
  }

  const b64 = input.bytes.toString('base64')
  const isPdf = input.mimeType === 'application/pdf' || input.fileName.toLowerCase().endsWith('.pdf')
  const content: Array<Record<string, unknown>> = [
    {
      type: 'text',
      text: `Extract invoice fields as JSON matching this schema. Categories for suggestedCategory: ${input.categories.join(', ') || 'Other'}. Confidence values 0-1. Never invent a paid status.`,
    },
  ]

  if (isPdf) {
    content.push({
      type: 'file',
      file: {
        filename: input.fileName,
        file_data: `data:application/pdf;base64,${b64}`,
      },
    })
  } else {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${input.mimeType};base64,${b64}` },
    })
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_INVOICE_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an invoice extraction engine. Return only valid JSON with vendorName, invoiceNumber, invoiceDate, dueDate, currency, subtotal, tax, discount, total, paymentTerms, lineItems[], confidence{}, suggestedCategory.',
        },
        { role: 'user', content },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OPENAI_EXTRACT_FAILED: ${text}`)
  }

  const json = (await res.json()) as {
    choices: Array<{ message: { content: string } }>
  }
  const raw = JSON.parse(json.choices[0]?.message?.content || '{}')
  const parsed = invoiceExtractSchema.safeParse(normalizeExtract(raw))
  if (!parsed.success) {
    return mockExtract(input.fileName, input.categories)
  }
  return parsed.data
}

function normalizeExtract(raw: Record<string, unknown>) {
  const conf = (raw.confidence as Record<string, number>) || {}
  return {
    vendorName: (raw.vendorName as string) ?? null,
    invoiceNumber: (raw.invoiceNumber as string) ?? null,
    invoiceDate: (raw.invoiceDate as string) ?? null,
    dueDate: (raw.dueDate as string) ?? null,
    currency: (raw.currency as string) ?? null,
    subtotal: num(raw.subtotal),
    tax: num(raw.tax),
    discount: num(raw.discount),
    total: num(raw.total),
    paymentTerms: (raw.paymentTerms as string) ?? null,
    lineItems: Array.isArray(raw.lineItems) ? raw.lineItems : [],
    confidence: {
      vendorName: conf.vendorName ?? 0.5,
      invoiceNumber: conf.invoiceNumber ?? 0.5,
      invoiceDate: conf.invoiceDate ?? 0.5,
      dueDate: conf.dueDate ?? 0.4,
      currency: conf.currency ?? 0.5,
      subtotal: conf.subtotal ?? 0.5,
      tax: conf.tax ?? 0.5,
      total: conf.total ?? 0.5,
      paymentTerms: conf.paymentTerms ?? 0.4,
    },
    suggestedCategory: (raw.suggestedCategory as string) ?? null,
  }
}

function num(v: unknown) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function mockExtract(fileName: string, categories: string[]): InvoiceExtract {
  return {
    vendorName: 'Sample Vendor',
    invoiceNumber: `INV-${fileName.replace(/\W/g, '').slice(0, 8).toUpperCase() || 'MOCK'}`,
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    currency: 'USD',
    subtotal: 100,
    tax: 10,
    discount: 0,
    total: 110,
    paymentTerms: 'Net 30',
    lineItems: [
      {
        description: 'Professional services',
        quantity: 1,
        unitPrice: 100,
        taxAmount: 10,
        lineTotal: 110,
      },
    ],
    confidence: {
      vendorName: 0.4,
      invoiceNumber: 0.4,
      invoiceDate: 0.4,
      dueDate: 0.3,
      currency: 0.5,
      subtotal: 0.4,
      tax: 0.4,
      total: 0.4,
      paymentTerms: 0.3,
    },
    suggestedCategory: categories[0] || 'Other',
  }
}

export function validateExtraction(extract: InvoiceExtract) {
  const warnings: string[] = []
  const missing: string[] = []
  if (!extract.vendorName) missing.push('vendorName')
  if (!extract.invoiceNumber) missing.push('invoiceNumber')
  if (!extract.invoiceDate) missing.push('invoiceDate')
  if (!extract.currency) missing.push('currency')
  if (extract.total == null) missing.push('total')

  if (extract.currency && !/^[A-Z]{3}$/.test(extract.currency)) {
    warnings.push('Currency is not a valid ISO 4217 code')
  }

  if (extract.subtotal != null && extract.tax != null && extract.total != null) {
    const expected = extract.subtotal + extract.tax - (extract.discount || 0)
    if (Math.abs(expected - extract.total) > 0.05) {
      warnings.push(
        `Arithmetic mismatch: subtotal+tax-discount=${expected.toFixed(2)} vs total=${extract.total.toFixed(2)}`,
      )
    }
  }

  const lowConfidence = Object.entries(extract.confidence)
    .filter(([, v]) => v < 0.6)
    .map(([k]) => k)
  if (lowConfidence.length) {
    warnings.push(`Low confidence fields: ${lowConfidence.join(', ')}`)
  }
  if (missing.length) warnings.push(`Missing fields: ${missing.join(', ')}`)

  return { warnings, missing }
}
