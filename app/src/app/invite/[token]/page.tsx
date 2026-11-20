'use client'

import { useParams, useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { acceptInvitationAction } from '@/server/actions/company'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    formData.set('token', token)
    const result = await acceptInvitationAction(formData)
    setLoading(false)
    if (!result.ok) {
      setError(result.error || 'Could not accept invitation')
      return
    }
    router.push(result.redirectTo || '/dashboard')
    router.refresh()
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Accept invitation</h1>
        <p className="subtitle">Use the exact email address the invitation was sent to.</p>
        <div className="auth-field">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="auth-field">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="auth-field">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        {error ? <p style={{ color: 'var(--color-danger)' }}>{error}</p> : null}
        <Button type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Joining…' : 'Join workspace'}
        </Button>
      </form>
    </div>
  )
}
