import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const PLANS = [
  {
    name: 'Starter',
    price: '29',
    blurb: 'A few people. A modest invoice volume. Enough to get off spreadsheets.',
    features: ['3 users', '100 invoices / month', 'Invoice extraction', 'Basic approvals', 'Core reports'],
  },
  {
    name: 'Professional',
    price: '79',
    blurb: 'When finance needs stronger approval chains and the full spend assistant.',
    features: [
      '15 users',
      '500 invoices / month',
      'Multi-step approvals',
      'Full AI assistant',
      'Department & aging reports',
    ],
    featured: true,
  },
  {
    name: 'Business',
    price: '149',
    blurb: 'Higher volume, more departments, same product, fewer limits.',
    features: [
      '50 users',
      '2,000 invoices / month',
      'Unlimited departments',
      'Full AI assistant',
      'Full reporting set',
    ],
  },
]

export function PricingGrid() {
  return (
    <div className="mkt-price-grid">
      {PLANS.map((plan) => (
        <div key={plan.name} className={`mkt-card${plan.featured ? ' featured' : ''}`}>
          <h3>{plan.name}</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{plan.blurb}</p>
          <div className="price">
            ${plan.price}
            <span>/mo</span>
          </div>
          <ul>
            {plan.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <Link href="/register">
            <Button type="button" variant={plan.featured ? 'primary' : 'secondary'}>
              Start 14-day trial
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}
