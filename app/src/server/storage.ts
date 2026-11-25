import { put } from '@vercel/blob'
import { createHash } from 'crypto'

const ALLOWED = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'])
/** App limit; Vercel serverless request bodies are typically capped near 4.5MB. */
export const MAX_INVOICE_BYTES = 15 * 1024 * 1024
export const RECOMMENDED_INVOICE_BYTES = 4 * 1024 * 1024

export function validateInvoiceFile(file: File) {
  if (!ALLOWED.has(file.type) && !/\.(pdf|jpe?g|png)$/i.test(file.name)) {
    throw new Error('INVALID_FILE_TYPE')
  }
  if (file.size > MAX_INVOICE_BYTES) throw new Error('FILE_TOO_LARGE')
}

export function hashBuffer(buf: ArrayBuffer | Buffer) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf)
  return createHash('sha256').update(b).digest('hex')
}

function localStore(input: {
  companyId: string
  fileName: string
  mimeType: string
  bytes: Buffer
  pathname: string
}) {
  const b64 = input.bytes.toString('base64')
  return {
    url: `local:///${input.pathname}?len=${input.bytes.length}`,
    storageUrl: `data:${input.mimeType};base64,${b64.slice(0, 0)}${input.pathname}`,
    localBase64: b64,
    pathname: input.pathname,
  }
}

export async function storeInvoiceFile(input: {
  companyId: string
  fileName: string
  mimeType: string
  bytes: Buffer
}) {
  const pathname = `invoices/${input.companyId}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()

  if (!token) {
    return localStore({ ...input, pathname })
  }

  try {
    const blob = await put(pathname, input.bytes, {
      access: 'private',
      token,
      contentType: input.mimeType || 'application/octet-stream',
      addRandomSuffix: false,
    })
    return { url: blob.url, storageUrl: blob.url, pathname }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    // Fall back so AI processing can still run from in-memory bytes.
    console.error('Blob upload failed, using local placeholder:', detail)
    return localStore({ ...input, pathname })
  }
}
