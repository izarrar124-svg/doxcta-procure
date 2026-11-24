import Link from 'next/link'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PricingGrid } from '@/components/marketing/PricingGrid'
import { Button } from '@/components/ui/Button'

export const metadata = {
  title: 'Pricing',
  description: 'Doxcta AI monthly plans — Starter, Professional, and Business.',
}

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mkt-hero" style={{ paddingBottom: '2rem' }}>
        <div className="mkt-container">
          <div className="mkt-eyebrow">Pricing</div>
          <h1 style={{ maxWidth: '14ch' }}>
            clear monthly prices. <span className="accent">no theatre.</span>
          </h1>
          <p className="mkt-hero-lead">
            Pick the seat and invoice limits that match your team. Try it for 14 days. Talk to us if
            you need an Enterprise arrangement.
          </p>
        </div>
      </section>

      <section className="mkt-section" style={{ borderTop: 'none', paddingTop: 0 }}>
        <div className="mkt-container">
          <PricingGrid />

          <table className="mkt-compare">
            <thead>
              <tr>
                <th>Included</th>
                <th>Starter</th>
                <th>Professional</th>
                <th>Business</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Users</td>
                <td>3</td>
                <td>15</td>
                <td>50</td>
              </tr>
              <tr>
                <td>Invoices / month</td>
                <td>100</td>
                <td>500</td>
                <td>2,000</td>
              </tr>
              <tr>
                <td>Invoice extraction</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>Approvals</td>
                <td>Basic</td>
                <td>Multi-step</td>
                <td>Multi-step</td>
              </tr>
              <tr>
                <td>Spend assistant</td>
                <td>Basic</td>
                <td>Full</td>
                <td>Full</td>
              </tr>
              <tr>
                <td>Reports</td>
                <td>Core</td>
                <td>Department + aging</td>
                <td>Full set</td>
              </tr>
              <tr>
                <td>Departments</td>
                <td>1</td>
                <td>10</td>
                <td>Unlimited</td>
              </tr>
            </tbody>
          </table>

          <div className="mkt-cta-row" style={{ marginTop: '2rem' }}>
            <Link href="/register">
              <Button type="button" size="lg">
                Start 14-day trial
              </Button>
            </Link>
            <Link href="/">
              <Button type="button" variant="ghost" size="lg">
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
