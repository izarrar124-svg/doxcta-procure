'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function InvoiceUpload() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch('/api/v1/invoices/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) {
        setMessage(json.error || 'Upload failed')
        return
      }
      setMessage('Upload queued for AI processing')
      form.reset()
      router.push(`/invoices/${json.invoiceId}/review`)
      router.refresh()
    } catch {
      setMessage('Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="panel-header">
        <h3>Upload invoice</h3>
      </div>
      <div className="panel-body" style={{ display: 'grid', gap: 12 }}>
        <p className="muted">PDF, JPG, or PNG. AI extracts fields for your review.</p>
        <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*" required />
        <Button type="submit" disabled={busy}>
          {busy ? 'Uploading…' : 'Upload & process'}
        </Button>
        {message ? <p className="muted">{message}</p> : null}
      </div>
    </form>
  )
}
