'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { DoxctaLogo } from '@/components/brand/DoxctaLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const { error: err } = await authClient.requestPasswordReset({
        email,
        redirectTo: '/reset-password',
      })
      if (err) setError(err.message || 'Request failed')
      else setMessage('If that email exists, a reset link has been sent (or logged in development).')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    }
  }

  return (
    <main className="dx-login">
      <aside className="dx-login__brand" aria-label="Doxcta">
        <div className="dx-login__brand-top">
          <DoxctaLogo size="sm" />
        </div>
        <div className="dx-login__brand-copy">
          <h2 className="dx-login__brand-title">Reset access and get back to your books.</h2>
          <p className="dx-login__brand-body">
            We will email a reset link when email delivery is configured for your workspace.
          </p>
        </div>
        <p className="dx-login__brand-foot">© {new Date().getFullYear()} Doxcta</p>
      </aside>

      <section className="dx-login__panel">
        <form className="dx-login__form" onSubmit={onSubmit}>
          <div className="dx-login__heading">
            <h1>Reset password</h1>
            <p>Enter the work email for your organization account.</p>
          </div>

          <div className="dx-login__field">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error ? <p className="dx-login__error">{error}</p> : null}
          {message ? <p className="dx-login__sent">{message}</p> : null}

          <Button type="submit" className="dx-login__submit">
            Send reset link
          </Button>

          <p className="dx-login__footer">
            <Link href="/login">← Back to sign in</Link>
          </p>
        </form>
      </section>
    </main>
  )
}
