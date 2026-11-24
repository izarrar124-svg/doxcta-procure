'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      const { error: err } = await authClient.resetPassword({ newPassword: password, token })
      if (err) {
        setError(err.message || 'Reset failed')
        return
      }
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Reset password</h1>
        <div className="auth-field">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p style={{ color: 'var(--color-danger)' }}>{error}</p> : null}
        <Button type="submit" style={{ width: '100%' }}>
          Update password
        </Button>
        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}
