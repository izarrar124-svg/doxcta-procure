'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, type FormEvent } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { DoxctaLogo } from '@/components/brand/DoxctaLogo'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: err } = await authClient.signIn.email({ email, password })
      if (err) {
        setError(err.message || 'Sign in failed')
        return
      }
      router.push(params.get('next') || '/dashboard')
      router.refresh()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Sign in failed. Check that the database and auth env vars are configured.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="dx-login">
      <aside className="dx-login__brand" aria-label="Doxcta">
        <div className="dx-login__brand-top">
          <DoxctaLogo size="sm" />
        </div>
        <div className="dx-login__brand-copy">
          <h2 className="dx-login__brand-title">
            Expenses, invoices, and approvals kept in one place.
          </h2>
          <p className="dx-login__brand-body">
            Upload invoices, track what you still owe, and see department spend
            without another spreadsheet.
          </p>
        </div>
        <p className="dx-login__brand-foot">© {new Date().getFullYear()} Doxcta</p>
      </aside>

      <section className="dx-login__panel">
        <form className="dx-login__form" onSubmit={onSubmit}>
          <div className="dx-login__heading">
            <h1>Sign in</h1>
            <p>Expense and invoice reporting for your team.</p>
          </div>

          <div className="dx-login__field">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="dx-login__password-block">
            <div className="dx-login__password-meta">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="dx-login__text-link">
                Forgot password?
              </Link>
            </div>
            <div className="dx-login__password-field">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="dx-login__show"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error ? <p className="dx-login__error">{error}</p> : null}

          <Button type="submit" className="dx-login__submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="dx-login__footer">
            New organization? <Link href="/register">Start Starter trial</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
