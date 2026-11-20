import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="auth-page" style={{ alignItems: 'center' }}>
      <div className="auth-card" style={{ width: 'min(640px, 100%)', textAlign: 'center' }}>
        <img src="/brand/doxcta-lockup-dark.png" alt="Doxcta" style={{ height: 36, margin: '0 auto' }} />
        <h1 style={{ marginTop: 24 }}>Take Control of Every Expense.</h1>
        <p className="subtitle">
          Bring expenses, procurement, approvals and financial operations together in one platform.
          Full marketing site ships in a later phase — start with a company workspace today.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register">
            <Button type="button">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button type="button" variant="secondary">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
