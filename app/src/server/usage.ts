import { and, eq, sql } from 'drizzle-orm'
import { getDb } from '@/server/db'
import { periodKey } from '@/server/company-context'
import {
  subscriptionPlans,
  subscriptions,
  usageRecords,
} from '@/server/db/schema'

export async function recordUsage(companyId: string, metric: string, quantity = 1) {
  const db = getDb()
  await db.insert(usageRecords).values({
    companyId,
    metric,
    quantity,
    periodKey: periodKey(),
  })
}

export async function getUsageCount(companyId: string, metric: string) {
  const db = getDb()
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${usageRecords.quantity}), 0)` })
    .from(usageRecords)
    .where(
      and(
        eq(usageRecords.companyId, companyId),
        eq(usageRecords.metric, metric),
        eq(usageRecords.periodKey, periodKey()),
      ),
    )
  return Number(row?.total || 0)
}

export async function getPlanLimits(companyId: string) {
  const db = getDb()
  const [sub] = await db
    .select({
      plan: subscriptionPlans,
      status: subscriptions.status,
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(subscriptions.companyId, companyId))
    .limit(1)

  const features = sub?.plan.featuresJson
    ? (JSON.parse(sub.plan.featuresJson) as {
        users?: number
        invoicesPerMonth?: number
        aiAssistant?: string
      })
    : { users: 3, invoicesPerMonth: 100, aiAssistant: 'basic' }

  return {
    employeeLimit: sub?.plan.employeeLimit ?? 3,
    invoicesPerMonth: features.invoicesPerMonth ?? 100,
    aiAssistant: features.aiAssistant ?? 'basic',
    status: sub?.status ?? 'trial',
    planKey: sub?.plan.key ?? 'starter',
  }
}

export async function assertInvoiceQuota(companyId: string) {
  const limits = await getPlanLimits(companyId)
  if (limits.invoicesPerMonth < 0) return
  const used = await getUsageCount(companyId, 'invoices')
  if (used >= limits.invoicesPerMonth) {
    throw new Error('INVOICE_QUOTA_EXCEEDED')
  }
}
