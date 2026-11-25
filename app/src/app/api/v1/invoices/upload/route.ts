import { after } from 'next/server'
import { eq } from 'drizzle-orm'
import { requirePermission } from '@/server/authz'
import { resolveCompanyId, money } from '@/server/company-context'
import { getDb } from '@/server/db'
import {
  aiProcessingJobs,
  companySettings,
  invoiceDocuments,
  invoices,
} from '@/server/db/schema'
import { hashBuffer, storeInvoiceFile, validateInvoiceFile } from '@/server/storage'
import { assertInvoiceQuota, recordUsage } from '@/server/usage'
import { processInvoiceJob } from '@/server/ai/process-invoice'
import { writeAudit } from '@/server/audit'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { session, companyId } = await resolveCompanyId()
    await requirePermission(companyId, 'invoices.create')
    await assertInvoiceQuota(companyId)

    let form: FormData
    try {
      form = await req.formData()
    } catch {
      return Response.json(
        { error: 'FILE_TOO_LARGE' },
        { status: 413 },
      )
    }
    const file = form.get('file')
    if (!(file instanceof File)) {
      return Response.json({ error: 'file required' }, { status: 400 })
    }
    validateInvoiceFile(file)
    const bytes = Buffer.from(await file.arrayBuffer())
    const documentHash = hashBuffer(bytes)

    const stored = await storeInvoiceFile({
      companyId,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      bytes,
    })

    const db = getDb()
    const [settings] = await db
      .select()
      .from(companySettings)
      .where(eq(companySettings.companyId, companyId))
      .limit(1)

    const reportingCurrency = settings?.currency || 'USD'

    const [invoice] = await db
      .insert(invoices)
      .values({
        companyId,
        currency: reportingCurrency,
        reportingCurrency,
        reportingAmount: money(0),
        outstandingBalance: money(0),
        status: 'processing',
        paymentStatus: 'unpaid',
        documentHash,
        createdByUserId: session.user.id,
      })
      .returning()

    await db.insert(invoiceDocuments).values({
      companyId,
      invoiceId: invoice.id,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      storageUrl: stored.url,
      documentHash,
    })

    const [job] = await db
      .insert(aiProcessingJobs)
      .values({
        companyId,
        invoiceId: invoice.id,
        status: 'queued',
        provider: 'openai',
      })
      .returning()

    await recordUsage(companyId, 'invoices', 1)
    await writeAudit({
      companyId,
      userId: session.user.id,
      action: 'invoice.uploaded',
      entityType: 'invoice',
      entityId: invoice.id,
      summary: `Uploaded ${file.name}`,
    })

    const mimeType = file.type || 'application/octet-stream'
    const fileName = file.name
    after(() => processInvoiceJob(job.id, bytes, mimeType, fileName))

    return Response.json({ ok: true, invoiceId: invoice.id, jobId: job.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UPLOAD_FAILED'
    const status =
      message === 'UNAUTHORIZED' || message === 'FORBIDDEN'
        ? 403
        : message === 'INVOICE_QUOTA_EXCEEDED'
          ? 402
          : message === 'FILE_TOO_LARGE'
            ? 413
            : 400
    return Response.json({ error: message }, { status })
  }
}
