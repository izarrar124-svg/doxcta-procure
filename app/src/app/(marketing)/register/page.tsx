'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useActionState, useEffect } from 'react'
import { registerCompanyAction, type RegisterState } from '@/server/actions/register'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { DoxctaLogo } from '@/components/brand/DoxctaLogo'

const initial: RegisterState = { ok: false }

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const rawPlan = (params.get('plan') || 'starter').toLowerCase()
  const planKey =
    rawPlan === 'professional' || rawPlan === 'business' ? rawPlan : 'starter'
  const isStarterTrial = planKey === 'starter'
  const [state, action, pending] = useActionState(registerCompanyAction, initial)

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.push(state.redirectTo)
      router.refresh()
    }
  }, [state, router])

  return (
    <main className="dx-login">
      <aside className="dx-login__brand" aria-label="Doxcta">
        <div className="dx-login__brand-top">
          <DoxctaLogo size="sm" />
        </div>
        <div className="dx-login__brand-copy">
          <h2 className="dx-login__brand-title">
            Start a workspace for expenses and invoices.
          </h2>
          <p className="dx-login__brand-body">
            {isStarterTrial
              ? 'Starter includes 14 days free ($29/mo after). Invite your team when you are ready.'
              : `${planKey[0].toUpperCase()}${planKey.slice(1)} has no free trial. Your workspace starts on that plan.`}
          </p>
        </div>
        <p className="dx-login__brand-foot">© {new Date().getFullYear()} Doxcta</p>
      </aside>

      <section className="dx-login__panel">
        <form className="dx-login__form dx-login__form--wide" action={action}>
          <input type="hidden" name="planKey" value={planKey} />
          <div className="dx-login__heading">
            <h1>Create workspace</h1>
            <p>
              {isStarterTrial
                ? 'Open a Starter workspace with a 14-day free trial.'
                : `Open a ${planKey[0].toUpperCase()}${planKey.slice(1)} workspace.`}
            </p>
          </div>

          <div className="dx-login__grid">
            <div className="dx-login__field">
              <Label htmlFor="companyName">Organization name</Label>
              <Input id="companyName" name="companyName" placeholder="Acme Ltd" required />
            </div>
            <div className="dx-login__field">
              <Label htmlFor="contactName">Contact person</Label>
              <Input id="contactName" name="contactName" placeholder="Jane Smith" required />
            </div>
            <div className="dx-login__field">
              <Label htmlFor="businessEmail">Business email</Label>
              <Input
                id="businessEmail"
                name="businessEmail"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="dx-login__field">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+1 555 000 0000" />
            </div>
            <div className="dx-login__field">
              <Label htmlFor="country">Country</Label>
              <select id="country" name="country" className="dx-input" defaultValue="US">
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="AE">United Arab Emirates</option>
              </select>
            </div>
            <div className="dx-login__field">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" placeholder="Professional services" />
            </div>
            <div className="dx-login__field">
              <Label htmlFor="companySize">Company size</Label>
              <Input id="companySize" name="companySize" placeholder="e.g. 11-50" />
            </div>
            <div className="dx-login__field">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="dx-login__field dx-login__field--span">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </div>

          {state.error ? <p className="dx-login__error">{state.error}</p> : null}

          <Button type="submit" className="dx-login__submit" disabled={pending}>
            {pending ? 'Creating…' : 'Create workspace'}
          </Button>

          <p className="dx-login__footer">
            Already registered? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
