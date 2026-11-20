import { getDb } from '@/server/db'
import { auditLogs, notifications } from '@/server/db/schema'

export async function writeAudit(input: {
  companyId?: string | null
  userId?: string | null
  action: string
  entityType: string
  entityId?: string
  summary: string
  ipAddress?: string
}) {
  const db = getDb()
  await db.insert(auditLogs).values({
    companyId: input.companyId ?? null,
    userId: input.userId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
    ipAddress: input.ipAddress,
  })
}

export async function notifyUser(input: {
  companyId?: string | null
  userId: string
  title: string
  body: string
}) {
  const db = getDb()
  await db.insert(notifications).values({
    companyId: input.companyId ?? null,
    userId: input.userId,
    title: input.title,
    body: input.body,
  })
}
