import { eq } from 'drizzle-orm'
import { getDb } from '@/server/db'
import { subscriptionPlans, subscriptions } from '@/server/db/schema'
import { getPlanLimits } from '@/server/usage'

export async function createCheckoutSession(input: {
  companyId: string
  planKey: string
  successUrl: string
  cancelUrl: string
}) {
  const secret = process.env.STRIPE_SECRET_KEY
  const db = getDb()
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.key, input.planKey))
    .limit(1)
  if (!plan) throw new Error('PLAN_NOT_FOUND')

  if (!secret) {
    // Dev fallback: activate plan immediately
    await db
      .update(subscriptions)
      .set({ planId: plan.id, status: 'active', updatedAt: new Date() })
      .where(eq(subscriptions.companyId, input.companyId))
    return { url: input.successUrl, mode: 'dev' as const }
  }

  const priceId =
    process.env[`STRIPE_PRICE_${input.planKey.toUpperCase()}`] ||
    process.env.STRIPE_PRICE_PROFESSIONAL
  if (!priceId) throw new Error('STRIPE_PRICE_MISSING')

  const params = new URLSearchParams()
  params.set('mode', 'subscription')
  params.set('success_url', input.successUrl)
  params.set('cancel_url', input.cancelUrl)
  params.set('line_items[0][price]', priceId)
  params.set('line_items[0][quantity]', '1')
  params.set('metadata[companyId]', input.companyId)
  params.set('metadata[planKey]', input.planKey)

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  if (!res.ok) throw new Error(await res.text())
  const json = (await res.json()) as { url: string; id: string }
  return { url: json.url, mode: 'stripe' as const, id: json.id }
}

export async function getBillingSummary(companyId: string) {
  return getPlanLimits(companyId)
}
