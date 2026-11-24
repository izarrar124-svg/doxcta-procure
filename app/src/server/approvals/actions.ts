'use server'

import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAnyPermission } from '@/server/authz'
import { resolveCompanyId } from '@/server/company-context'
import { getDb } from '@/server/db'
import { approvals, companyMemberships, expenses, invoices, users } from '@/server/db/schema'
import { decideApproval } from '@/server/approvals/service'

export async function listPendingApprovalsAction() {
  const { companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['expenses.approve', 'invoices.approve'])
  const db = getDb()
  return db
    .select({
      approval: approvals,
      requesterName: users.name,
    })
    .from(approvals)
    .leftJoin(companyMemberships, eq(approvals.requesterMembershipId, companyMemberships.id))
    .leftJoin(users, eq(companyMemberships.userId, users.id))
    .where(and(eq(approvals.companyId, companyId), eq(approvals.status, 'pending')))
    .orderBy(desc(approvals.createdAt))
}

export async function getApprovalEntityLabel(entityType: string, entityId: string) {
  const db = getDb()
  if (entityType === 'expense') {
    const [e] = await db.select().from(expenses).where(eq(expenses.id, entityId)).limit(1)
    return e ? `${e.reference}: ${e.title}` : entityId
  }
  if (entityType === 'invoice') {
    const [i] = await db.select().from(invoices).where(eq(invoices.id, entityId)).limit(1)
    return i ? `Invoice ${i.invoiceNumber || i.id.slice(0, 8)}` : entityId
  }
  return entityId
}

export async function approveAction(formData: FormData): Promise<void> {
  const { session, companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['expenses.approve', 'invoices.approve'])
  await decideApproval({
    companyId,
    approvalId: String(formData.get('id') || ''),
    actorUserId: session.user.id,
    decision: 'approved',
    comment: String(formData.get('comment') || '') || undefined,
  })
  revalidatePath('/approvals')
  revalidatePath('/expenses')
  revalidatePath('/invoices')
}

export async function rejectAction(formData: FormData): Promise<void> {
  const { session, companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['expenses.approve', 'invoices.approve'])
  await decideApproval({
    companyId,
    approvalId: String(formData.get('id') || ''),
    actorUserId: session.user.id,
    decision: 'rejected',
    comment: String(formData.get('comment') || '') || undefined,
  })
  revalidatePath('/approvals')
  revalidatePath('/expenses')
  revalidatePath('/invoices')
}

export async function returnAction(formData: FormData): Promise<void> {
  const { session, companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['expenses.approve', 'invoices.approve'])
  await decideApproval({
    companyId,
    approvalId: String(formData.get('id') || ''),
    actorUserId: session.user.id,
    decision: 'returned',
    comment: String(formData.get('comment') || '') || undefined,
  })
  revalidatePath('/approvals')
  revalidatePath('/expenses')
  revalidatePath('/invoices')
}
