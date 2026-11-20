'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, type FormEvent } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

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
    const { error: err } = await authClient.signIn.email({ email, password })
    setLoading(false)
    if (err) {
      setError(err.message || 'Sign in failed')
      return
    }
    router.push(params.get('next') || '/dashboard')
    router.refresh()
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <img src="/brand/doxcta-lockup-dark.png" alt="Doxcta" style={{ height: 34 }} />
        <h1>Sign in</h1>
        <p className="subtitle">Access your company workspace.</p>

        <div className="auth-field">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="dx-btn dx-btn-link dx-btn-sm" style={{ height: 'auto' }}>
              Forgot password?
            </Link>
          </div>
          <div className="password-field">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error ? <p style={{ color: 'var(--color-danger)' }}>{error}</p> : null}

        <Button type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          New company? <Link href="/register">Create a workspace</Link>
        </p>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
