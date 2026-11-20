import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('you@company.com')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = login(email, password)
    if (!ok) {
      setError('Enter a work email to continue.')
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <img src="/brand/doxcta-lockup-dark.png" alt="Doxcta" style={{ height: 34 }} />
        <h1>Sign in</h1>
        <p className="subtitle">Requests, approvals, and spend reporting for your team.</p>

        <div className="auth-field">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </div>

        <div className="auth-field">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Label htmlFor="password">Password</Label>
            <button type="button" className="dx-btn dx-btn-link dx-btn-sm" style={{ height: 'auto' }}>
              Forgot password?
            </button>
          </div>
          <div className="password-field">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error ? <p style={{ color: 'var(--color-danger)', marginTop: 0 }}>{error}</p> : null}

        <Button type="submit" style={{ width: '100%' }}>
          Sign in
        </Button>

        <div className="auth-divider">OR</div>

        <Button type="button" variant="secondary" style={{ width: '100%' }} onClick={() => login(email || 'you@company.com', 'google') && navigate('/dashboard')}>
          Sign in with Google
        </Button>
      </form>
    </div>
  )
}
