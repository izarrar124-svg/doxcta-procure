'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    const { error: err } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })
    if (err) setError(err.message || 'Request failed')
    else setMessage('If that email exists, a reset link has been sent (or logged in development).')
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Forgot password</h1>
        <p className="subtitle">We will email a reset link when email is configured.</p>
        <div className="auth-field">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {error ? <p style={{ color: 'var(--color-danger)' }}>{error}</p> : null}
        {message ? <p className="muted">{message}</p> : null}
        <Button type="submit" style={{ width: '100%' }}>
          Send reset link
        </Button>
        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </form>
    </div>
  )
}
