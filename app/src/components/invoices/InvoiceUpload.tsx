'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

function friendlyUploadError(code: string | undefined, status: number) {
  switch (code) {
    case 'FORBIDDEN':
      return 'Your role cannot upload invoices. Ask an admin for invoices.create permission.'
    case 'UNAUTHORIZED':
      return 'Your session expired. Sign in again and retry.'
    case 'NO_COMPANY':
      return 'No active organization. Switch company or finish onboarding.'
    case 'COMPANY_SUSPENDED':
      return 'This organization is suspended. Contact support.'
    case 'INVOICE_QUOTA_EXCEEDED':
      return 'Monthly invoice quota reached. Upgrade the plan or wait until next month.'
    case 'INVALID_FILE_TYPE':
      return 'Use a PDF, JPG, or PNG file.'
    case 'FILE_TOO_LARGE':
      return 'File is too large (max 15 MB). Try a smaller PDF or image.'
    case 'file required':
      return 'Choose a file before uploading.'
    default:
      if (status === 413) return 'File is too large for the server. Try under 4 MB.'
      if (code?.startsWith('BLOB_UPLOAD_FAILED')) {
        return 'Cloud storage rejected the file. Try again or contact support.'
      }
      return code || 'Upload failed'
  }
}

export function InvoiceUpload() {
  const router = useRouter()
  const fileInputId = useId()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const file = fd.get('file')
    if (!(file instanceof File) || file.size === 0) {
      setMessage('Choose a file before uploading.')
      return
    }
    if (file.size > 4.5 * 1024 * 1024) {
      setMessage(
        'This file is over 4.5 MB and may fail on the hosted server. Compress it or use a smaller scan.',
      )
    }
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch('/api/v1/invoices/upload', { method: 'POST', body: fd })
      let json: { error?: string; invoiceId?: string } = {}
      try {
        json = await res.json()
      } catch {
        setMessage(
          res.status === 413
            ? 'File is too large for the server. Try under 4 MB.'
            : `Upload failed (HTTP ${res.status}).`,
        )
        return
      }
      if (!res.ok) {
        setMessage(friendlyUploadError(json.error, res.status))
        return
      }
      setMessage('Upload queued for AI processing')
      form.reset()
      setFileName(null)
      router.push(`/invoices/${json.invoiceId}/review`)
      router.refresh()
    } catch {
      setMessage('Upload failed. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel panel--static">
      <div className="panel-header">
        <h3>Upload invoice</h3>
      </div>
      <div className="panel-body">
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <p className="muted" style={{ margin: 0 }}>
            PDF, JPG, or PNG. Prefer files under 4 MB on production. AI extracts fields for your
            review.
          </p>
          <div className="invoice-upload-file">
            <input
              id={fileInputId}
              type="file"
              name="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              required
              onChange={(e) => {
                const next = e.target.files?.[0]
                setFileName(next?.name || null)
                setMessage(null)
              }}
            />
            <label htmlFor={fileInputId} className="dx-btn dx-btn-secondary dx-btn-md">
              Choose file
            </label>
            <p className="invoice-upload-file__name">{fileName || 'No file selected'}</p>
          </div>
          <div>
            <Button type="submit" disabled={busy}>
              {busy ? 'Uploading…' : 'Upload & process'}
            </Button>
          </div>
          {message ? (
            <p className="dx-login__error" style={{ margin: 0 }}>
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  )
}
