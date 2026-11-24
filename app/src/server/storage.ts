import { createHash } from 'crypto'

const ALLOWED = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'])
const MAX_BYTES = 15 * 1024 * 1024

export function validateInvoiceFile(file: File) {
  if (!ALLOWED.has(file.type) && !/\.(pdf|jpe?g|png)$/i.test(file.name)) {
    throw new Error('INVALID_FILE_TYPE')
  }
  if (file.size > MAX_BYTES) throw new Error('FILE_TOO_LARGE')
}

export function hashBuffer(buf: ArrayBuffer | Buffer) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf)
  return createHash('sha256').update(b).digest('hex')
}

export async function storeInvoiceFile(input: {
  companyId: string
  fileName: string
  mimeType: string
  bytes: Buffer
}) {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  const pathname = `invoices/${input.companyId}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  if (!token) {
    // Local/dev fallback: data URL is too large; store as placeholder path with base64 length marker
    const b64 = input.bytes.toString('base64')
    return {
      url: `local:///${pathname}?len=${input.bytes.length}`,
      storageUrl: `data:${input.mimeType};base64,${b64.slice(0, 0)}${pathname}`,
      localBase64: b64,
      pathname,
    }
  }

  const res = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': input.mimeType,
      'x-vercel-blob-access': 'private',
    },
    body: new Uint8Array(input.bytes),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`BLOB_UPLOAD_FAILED: ${text}`)
  }
  const json = (await res.json()) as { url: string }
  return { url: json.url, storageUrl: json.url, pathname }
}
