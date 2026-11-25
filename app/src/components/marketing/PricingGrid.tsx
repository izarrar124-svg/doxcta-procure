import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const PLANS = [
  {
    name: 'Starter',
    price: '29',
    blurb: 'A few people. A modest invoice volume. Enough to get off spreadsheets.',
    features: [
      '14-day free trial',
      '3 users',
      '100 invoices / month',
      'Invoice extraction',
      'Basic approvals',
      'Core reports',
    ],
    cta: 'Start 14-day trial',
    trial: true,
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
    cta: 'Choose Professional',
    trial: false,
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
    cta: 'Choose Business',
    trial: false,
  },
] as const

export function PricingGrid() {
  return (
    <div className="mkt-price-grid">
      {PLANS.map((plan) => (
        <div key={plan.name} className={`mkt-card${'featured' in plan && plan.featured ? ' featured' : ''}`}>
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
          <Link href={plan.trial ? '/register' : `/register?plan=${plan.name.toLowerCase()}`}>
            <Button type="button" variant={'featured' in plan && plan.featured ? 'primary' : 'secondary'}>
              {plan.cta}
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}
