import { and, asc, eq } from 'drizzle-orm'
import { getDb } from '@/server/db'
import {
  approvalHistory,
  approvalSteps,
  approvalWorkflows,
  approvals,
  companyMemberships,
  expenses,
  invoices,
  membershipRoles,
  roles,
  users,
} from '@/server/db/schema'
import { notifyUser, writeAudit } from '@/server/audit'
import { sendEmail } from '@/server/email'

export async function submitExpenseForApproval(
  companyId: string,
  expenseId: string,
  actorUserId: string,
) {
  const db = getDb()
  const [expense] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.companyId, companyId)))
    .limit(1)
  if (!expense) throw new Error('NOT_FOUND')
  if (!['draft', 'submitted', 'rejected'].includes(expense.status)) return

  const [workflow] = await db
    .select()
    .from(approvalWorkflows)
    .where(
      and(
        eq(approvalWorkflows.companyId, companyId),
        eq(approvalWorkflows.entityType, 'expense'),
        eq(approvalWorkflows.active, true),
      ),
    )
    .limit(1)

  let approvalId: string | null = null
  if (workflow) {
    const steps = await db
      .select()
      .from(approvalSteps)
      .where(eq(approvalSteps.workflowId, workflow.id))
      .orderBy(asc(approvalSteps.stepOrder))

    const amount = Number(expense.reportingAmount)
    let startStep = 1
    for (const step of steps) {
      if (step.amountThreshold && amount < Number(step.amountThreshold)) {
        continue
      }
      startStep = step.stepOrder
      break
    }

    const [approval] = await db
      .insert(approvals)
      .values({
        companyId,
        workflowId: workflow.id,
        entityType: 'expense',
        entityId: expenseId,
        requesterMembershipId: expense.requesterMembershipId,
        currentStepOrder: startStep,
        status: 'pending',
        amount: expense.reportingAmount,
        currency: expense.reportingCurrency,
      })
      .returning()
    approvalId = approval.id

    await notifyApprovers(companyId, workflow.id, startStep, expense.title, amount, expense.reportingCurrency)
  }

  await db
    .update(expenses)
    .set({
      status: 'pending_approval',
      approvalId,
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, expenseId))

  await writeAudit({
    companyId,
    userId: actorUserId,
    action: 'expense.submitted',
    entityType: 'expense',
    entityId: expenseId,
    summary: `Expense ${expense.reference} submitted for approval`,
  })
}

async function notifyApprovers(
  companyId: string,
  workflowId: string,
  stepOrder: number,
  title: string,
  amount: number,
  currency: string,
) {
  const db = getDb()
  const [step] = await db
    .select()
    .from(approvalSteps)
    .where(and(eq(approvalSteps.workflowId, workflowId), eq(approvalSteps.stepOrder, stepOrder)))
    .limit(1)
  if (!step?.roleKey) return

  const roleRows = await db
    .select({ userId: companyMemberships.userId, email: users.email, name: users.name })
    .from(roles)
    .innerJoin(membershipRoles, eq(membershipRoles.roleId, roles.id))
    .innerJoin(companyMemberships, eq(companyMemberships.id, membershipRoles.membershipId))
    .innerJoin(users, eq(users.id, companyMemberships.userId))
    .where(and(eq(roles.companyId, companyId), eq(roles.key, step.roleKey)))

  for (const r of roleRows) {
    await notifyUser({
      companyId,
      userId: r.userId,
      title: 'Approval requested',
      body: `${title} (${currency} ${amount.toFixed(2)}) needs your approval.`,
    })
    await sendEmail({
      to: r.email,
      subject: 'Doxcta AI: Approval requested',
      html: `<p>Hi ${r.name},</p><p>${title} requires approval at step <strong>${step.name}</strong>.</p>`,
    })
  }
}

export async function decideApproval(input: {
  companyId: string
  approvalId: string
  actorUserId: string
  decision: 'approved' | 'rejected' | 'returned'
  comment?: string
}) {
  const db = getDb()
  const [approval] = await db
    .select()
    .from(approvals)
    .where(and(eq(approvals.id, input.approvalId), eq(approvals.companyId, input.companyId)))
    .limit(1)
  if (!approval || approval.status !== 'pending') throw new Error('NOT_FOUND')

  await db.insert(approvalHistory).values({
    companyId: input.companyId,
    approvalId: approval.id,
    stepOrder: approval.currentStepOrder,
    actorUserId: input.actorUserId,
    decision: input.decision,
    comment: input.comment,
  })

  if (input.decision === 'rejected' || input.decision === 'returned') {
    await db
      .update(approvals)
      .set({ status: input.decision, updatedAt: new Date() })
      .where(eq(approvals.id, approval.id))

    if (approval.entityType === 'expense') {
      await db
        .update(expenses)
        .set({
          status: input.decision === 'rejected' ? 'rejected' : 'draft',
          updatedAt: new Date(),
        })
        .where(eq(expenses.id, approval.entityId))
    }
    if (approval.entityType === 'invoice') {
      await db
        .update(invoices)
        .set({
          status: input.decision === 'rejected' ? 'rejected' : 'needs_review',
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, approval.entityId))
    }

    await writeAudit({
      companyId: input.companyId,
      userId: input.actorUserId,
      action: `approval.${input.decision}`,
      entityType: approval.entityType,
      entityId: approval.entityId,
      summary: `Approval ${input.decision}`,
    })
    return
  }

  const steps = approval.workflowId
    ? await db
        .select()
        .from(approvalSteps)
        .where(eq(approvalSteps.workflowId, approval.workflowId))
        .orderBy(asc(approvalSteps.stepOrder))
    : []

  const amount = Number(approval.amount || 0)
  const remaining = steps.filter((s) => {
    if (s.stepOrder <= approval.currentStepOrder) return false
    if (s.amountThreshold && amount < Number(s.amountThreshold)) return false
    return true
  })

  if (remaining.length === 0) {
    await db
      .update(approvals)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(eq(approvals.id, approval.id))

    if (approval.entityType === 'expense') {
      await db
        .update(expenses)
        .set({ status: 'approved', updatedAt: new Date() })
        .where(eq(expenses.id, approval.entityId))
    }
    if (approval.entityType === 'invoice') {
      await db
        .update(invoices)
        .set({ status: 'approved', updatedAt: new Date() })
        .where(eq(invoices.id, approval.entityId))
    }

    await writeAudit({
      companyId: input.companyId,
      userId: input.actorUserId,
      action: 'approval.completed',
      entityType: approval.entityType,
      entityId: approval.entityId,
      summary: 'Approval chain completed',
    })
    return
  }

  const next = remaining[0]
  await db
    .update(approvals)
    .set({ currentStepOrder: next.stepOrder, updatedAt: new Date() })
    .where(eq(approvals.id, approval.id))

  if (approval.workflowId) {
    await notifyApprovers(
      input.companyId,
      approval.workflowId,
      next.stepOrder,
      `${approval.entityType} approval`,
      amount,
      approval.currency || 'USD',
    )
  }
}
