'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { registerCompanyAction, type RegisterState } from '@/server/actions/register'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const initial: RegisterState = { ok: false }

export default function RegisterPage() {
  const router = useRouter()
  const [state, action, pending] = useActionState(registerCompanyAction, initial)

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.push(state.redirectTo)
      router.refresh()
    }
  }, [state, router])

  return (
    <div className="auth-page">
      <form className="auth-card" action={action} style={{ width: 'min(520px, 100%)' }}>
        <img src="/brand/doxcta-lockup-dark.png" alt="Doxcta" style={{ height: 34 }} />
        <h1>Create your company</h1>
        <p className="subtitle">Start a Doxcta Procure workspace for your team.</p>

        <div className="auth-field">
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" required />
        </div>
        <div className="auth-field">
          <Label htmlFor="contactName">Contact person</Label>
          <Input id="contactName" name="contactName" required />
        </div>
        <div className="auth-field">
          <Label htmlFor="businessEmail">Business email</Label>
          <Input id="businessEmail" name="businessEmail" type="email" required />
        </div>
        <div className="auth-field">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" />
        </div>
        <div className="auth-field">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" />
        </div>
        <div className="auth-field">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" name="industry" />
        </div>
        <div className="auth-field">
          <Label htmlFor="companySize">Company size</Label>
          <Input id="companySize" name="companySize" placeholder="e.g. 11-50" />
        </div>
        <div className="auth-field">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <div className="auth-field">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
        </div>

        {state.error ? <p style={{ color: 'var(--color-danger)' }}>{state.error}</p> : null}

        <Button type="submit" style={{ width: '100%' }} disabled={pending}>
          {pending ? 'Creating…' : 'Create workspace'}
        </Button>

        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
