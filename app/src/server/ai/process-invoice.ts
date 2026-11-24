import { and, eq, ne, sql } from 'drizzle-orm'
import { getDb } from '@/server/db'
import {
  aiProcessingJobs,
  expenseCategories,
  invoiceItems,
  invoices,
  vendors,
} from '@/server/db/schema'
import { extractInvoiceWithOpenAI, validateExtraction } from '@/server/ai/extract'
import { money } from '@/server/company-context'
import { notifyUser, writeAudit } from '@/server/audit'

function normalizeInvoiceNumber(n: string) {
  return n.replace(/[\s\-_/]/g, '').toUpperCase()
}

export async function processInvoiceJob(jobId: string, bytes: Buffer, mimeType: string, fileName: string) {
  const db = getDb()
  const [job] = await db.select().from(aiProcessingJobs).where(eq(aiProcessingJobs.id, jobId)).limit(1)
  if (!job || !job.invoiceId) return

  await db
    .update(aiProcessingJobs)
    .set({ status: 'processing', startedAt: new Date(), updatedAt: new Date() })
    .where(eq(aiProcessingJobs.id, jobId))

  try {
    const cats = await db
      .select()
      .from(expenseCategories)
      .where(and(eq(expenseCategories.companyId, job.companyId), eq(expenseCategories.active, true)))

    const extract = await extractInvoiceWithOpenAI({
      mimeType,
      fileName,
      bytes,
      categories: cats.map((c) => c.name),
    })
    const { warnings } = validateExtraction(extract)

    let vendorId: string | null = null
    if (extract.vendorName) {
      const [existingVendor] = await db
        .select()
        .from(vendors)
        .where(
          and(
            eq(vendors.companyId, job.companyId),
            sql`lower(${vendors.name}) = ${extract.vendorName.toLowerCase()}`,
          ),
        )
        .limit(1)
      if (existingVendor) vendorId = existingVendor.id
      else {
        const [created] = await db
          .insert(vendors)
          .values({
            companyId: job.companyId,
            name: extract.vendorName,
            defaultCurrency: extract.currency || 'USD',
          })
          .returning()
        vendorId = created.id
      }
    }

    let duplicateOf: string | null = null
    if (extract.invoiceNumber && vendorId) {
      const [dup] = await db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.companyId, job.companyId),
            eq(invoices.vendorId, vendorId),
            eq(invoices.invoiceNumber, extract.invoiceNumber),
            ne(invoices.id, job.invoiceId),
          ),
        )
        .limit(1)
      if (dup) {
        duplicateOf = dup.id
        warnings.push(`Possible duplicate of invoice ${dup.invoiceNumber}`)
      }
    }

    if (extract.invoiceNumber) {
      const norm = normalizeInvoiceNumber(extract.invoiceNumber)
      const candidates = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.companyId, job.companyId), ne(invoices.id, job.invoiceId)))
      for (const c of candidates) {
        if (c.invoiceNumber && normalizeInvoiceNumber(c.invoiceNumber) === norm) {
          if (!duplicateOf) duplicateOf = c.id
          warnings.push(`Normalized invoice number matches ${c.invoiceNumber}`)
          break
        }
      }
    }

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, job.invoiceId))
      .limit(1)

    const total = extract.total ?? 0
    const suggested = cats.find((c) => c.name === extract.suggestedCategory)

    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, job.invoiceId))
    for (const item of extract.lineItems) {
      await db.insert(invoiceItems).values({
        companyId: job.companyId,
        invoiceId: job.invoiceId,
        description: item.description || 'Line item',
        quantity: money(item.quantity ?? 1),
        unitPrice: money(item.unitPrice ?? 0),
        taxAmount: money(item.taxAmount ?? 0),
        lineTotal: money(item.lineTotal ?? 0),
      })
    }

    await db
      .update(invoices)
      .set({
        vendorId,
        invoiceNumber: extract.invoiceNumber,
        invoiceDate: extract.invoiceDate ? new Date(extract.invoiceDate) : null,
        dueDate: extract.dueDate ? new Date(extract.dueDate) : null,
        currency: extract.currency || invoice?.currency || 'USD',
        subtotal: money(extract.subtotal ?? 0),
        taxAmount: money(extract.tax ?? 0),
        discountAmount: money(extract.discount ?? 0),
        totalAmount: money(total),
        reportingAmount: money(total * Number(invoice?.exchangeRate || 1)),
        outstandingBalance: money(total),
        paymentTerms: extract.paymentTerms,
        categoryId: suggested?.id ?? null,
        status: 'needs_review',
        extractedJson: JSON.stringify(extract),
        confidenceJson: JSON.stringify(extract.confidence),
        validationWarnings: JSON.stringify(warnings),
        duplicateOfInvoiceId: duplicateOf,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, job.invoiceId))

    await db
      .update(aiProcessingJobs)
      .set({
        status: 'completed',
        resultJson: JSON.stringify(extract),
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(aiProcessingJobs.id, jobId))

    if (invoice?.createdByUserId) {
      await notifyUser({
        companyId: job.companyId,
        userId: invoice.createdByUserId,
        title: 'Invoice ready for review',
        body: warnings.length
          ? `Extraction finished with ${warnings.length} warning(s).`
          : 'Extraction finished. Please review and confirm.',
      })
    }

    await writeAudit({
      companyId: job.companyId,
      userId: invoice?.createdByUserId,
      action: 'invoice.ai_processed',
      entityType: 'invoice',
      entityId: job.invoiceId,
      summary: 'AI invoice extraction completed',
    })
  } catch (err) {
    await db
      .update(aiProcessingJobs)
      .set({
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(aiProcessingJobs.id, jobId))

    if (job.invoiceId) {
      await db
        .update(invoices)
        .set({ status: 'needs_review', updatedAt: new Date() })
        .where(eq(invoices.id, job.invoiceId))
    }
  }
}
