'use server'

import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import {
  getActiveCompanyId,
  listUserPermissions,
  requirePermission,
  requireSuperAdmin,
  requireUser,
  setActiveCompany,
} from '@/server/authz'
import { getDb } from '@/server/db'
import {
  companies,
  companyMemberships,
  companySettings,
  departments,
  invitations,
  membershipRoles,
  sessions,
  subscriptionPlans,
  subscriptions,
} from '@/server/db/schema'
import { sendEmail } from '@/server/email'
import { writeAudit } from '@/server/audit'
import { provisionCompany } from '@/server/company-provision'
import { getAuth } from '@/server/auth'
import { headers } from 'next/headers'

async function resolveCompanyId(explicit?: string | null) {
  const session = await requireUser()
  const companyId =
    explicit ||
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) throw new Error('NO_COMPANY')
  return { session, companyId }
}

export async function switchCompanyAction(companyId: string) {
  const session = await requireUser()
  const token = session.session.token
  await setActiveCompany(session.user.id, companyId, token)
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function updateCompanySettingsAction(formData: FormData): Promise<void> {
  const { companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'settings.manage')
  const db = getDb()
  await db
    .update(companySettings)
    .set({
      currency: String(formData.get('currency') || 'USD'),
      timezone: String(formData.get('timezone') || 'America/New_York'),
      fiscalYearStart: String(formData.get('fiscalYearStart') || 'January'),
      approvalReminderDays: Number(formData.get('approvalReminderDays') || 3),
      fxRatePkrUsd: String(formData.get('fxRatePkrUsd') || '278'),
      dateFormat: String(formData.get('dateFormat') || 'MM/DD/YYYY'),
      taxLabel: String(formData.get('taxLabel') || 'sales_tax'),
      taxRegistration: String(formData.get('taxRegistration') || '') || null,
      budgetAlert70: Number(formData.get('budgetAlert70') || 70),
      budgetAlert90: Number(formData.get('budgetAlert90') || 90),
      budgetAlert100: Number(formData.get('budgetAlert100') || 100),
      updatedAt: new Date(),
    })
    .where(eq(companySettings.companyId, companyId))
  await db
    .update(companies)
    .set({ name: String(formData.get('name') || ''), updatedAt: new Date() })
    .where(eq(companies.id, companyId))
  revalidatePath('/admin/settings')
}

export async function createDepartmentAction(formData: FormData): Promise<void> {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'departments.manage')
  const name = String(formData.get('name') || '').trim()
  const code = String(formData.get('code') || '')
    .trim()
    .toUpperCase()
  if (!name || !code) return
  const db = getDb()
  await db.insert(departments).values({ companyId, name, code })
  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'department.created',
    entityType: 'department',
    summary: `Created department ${code}`,
  })
  revalidatePath('/admin/departments')
}

export async function inviteEmployeeAction(formData: FormData): Promise<void> {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'employees.manage')

  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase()
  const roleId = String(formData.get('roleId') || '')
  if (!email || !roleId) return

  const db = getDb()
  const { getPlanLimits } = await import('@/server/usage')
  const limits = await getPlanLimits(companyId)
  if (limits.employeeLimit >= 0) {
    const members = await db
      .select()
      .from(companyMemberships)
      .where(and(eq(companyMemberships.companyId, companyId), eq(companyMemberships.status, 'active')))
    if (members.length >= limits.employeeLimit) {
      throw new Error('USER_QUOTA_EXCEEDED')
    }
  }

  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await db.insert(invitations).values({
    companyId,
    email,
    token,
    roleId,
    invitedByUserId: session.user.id,
    expiresAt,
  })

  const base = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = `${base}/invite/${token}`
  await sendEmail({
    to: email,
    subject: 'You are invited to Doxcta AI',
    html: `<p>You have been invited to join an organization workspace on Doxcta AI.</p><p><a href="${url}">Accept invitation</a></p>`,
  })

  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'invitation.created',
    entityType: 'invitation',
    summary: `Invited ${email}`,
  })
  revalidatePath('/admin/users')
}

export async function acceptInvitationAction(formData: FormData) {
  const token = String(formData.get('token') || '')
  const name = String(formData.get('name') || '').trim()
  const password = String(formData.get('password') || '')
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase()

  const db = getDb()
  const [invite] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.token, token), eq(invitations.status, 'pending')))
    .limit(1)
  if (!invite) return { ok: false, error: 'Invitation not found' }
  if (invite.expiresAt < new Date()) return { ok: false, error: 'Invitation expired' }
  if (email !== invite.email) return { ok: false, error: 'Email must match the invitation' }

  const auth = getAuth()
  let userId: string
  try {
    const signed = await auth.api.signUpEmail({
      body: { email, password, name: name || email.split('@')[0] },
    })
    userId = signed.user.id
  } catch {
    // User may already exist; sign in instead
    const signedIn = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })
    userId = signedIn.user.id
  }

  const [membership] = await db
    .insert(companyMemberships)
    .values({
      companyId: invite.companyId,
      userId,
      status: 'active',
      joiningDate: new Date(),
    })
    .onConflictDoNothing()
    .returning()

  let membershipId = membership?.id
  if (!membershipId) {
    const [existing] = await db
      .select()
      .from(companyMemberships)
      .where(
        and(eq(companyMemberships.companyId, invite.companyId), eq(companyMemberships.userId, userId)),
      )
      .limit(1)
    membershipId = existing?.id
  }

  if (membershipId && invite.roleId) {
    await db
      .insert(membershipRoles)
      .values({ membershipId, roleId: invite.roleId })
      .onConflictDoNothing()
  }

  await db
    .update(invitations)
    .set({ status: 'accepted', updatedAt: new Date() })
    .where(eq(invitations.id, invite.id))

  await db
    .update(sessions)
    .set({ activeCompanyId: invite.companyId, updatedAt: new Date() })
    .where(eq(sessions.userId, userId))

  return { ok: true, redirectTo: '/dashboard' }
}

export async function setMembershipStatusAction(membershipId: string, status: 'active' | 'disabled') {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'employees.manage')
  const db = getDb()
  const [m] = await db
    .select()
    .from(companyMemberships)
    .where(and(eq(companyMemberships.id, membershipId), eq(companyMemberships.companyId, companyId)))
    .limit(1)
  if (!m) return { ok: false, error: 'Not found' }
  await db
    .update(companyMemberships)
    .set({ status, updatedAt: new Date() })
    .where(eq(companyMemberships.id, membershipId))
  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'membership.status',
    entityType: 'membership',
    entityId: membershipId,
    summary: `Set membership ${status}`,
  })
  revalidatePath('/admin/users')
  return { ok: true }
}

const createCompanySchema = z.object({
  companyName: z.string().min(2),
  businessEmail: z.string().email(),
  adminName: z.string().min(2),
  adminPassword: z.string().min(8),
  planKey: z.string().default('starter'),
})

export async function superAdminCreateCompanyAction(formData: FormData): Promise<void> {
  await requireSuperAdmin()
  const parsed = createCompanySchema.safeParse({
    companyName: formData.get('companyName'),
    businessEmail: formData.get('businessEmail'),
    adminName: formData.get('adminName'),
    adminPassword: formData.get('adminPassword'),
    planKey: formData.get('planKey') || 'starter',
  })
  if (!parsed.success) return

  const auth = getAuth()
  const signed = await auth.api.signUpEmail({
    body: {
      email: parsed.data.businessEmail.toLowerCase(),
      password: parsed.data.adminPassword,
      name: parsed.data.adminName,
    },
  })
  await provisionCompany({
    companyName: parsed.data.companyName,
    businessEmail: parsed.data.businessEmail,
    ownerUserId: signed.user.id,
    planKey: parsed.data.planKey,
  })
  revalidatePath('/super-admin')
}

export async function superAdminSetCompanyStatusAction(
  companyId: string,
  status: 'active' | 'suspended',
) {
  const session = await requireSuperAdmin()
  const db = getDb()
  await db.update(companies).set({ status, updatedAt: new Date() }).where(eq(companies.id, companyId))
  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'company.status',
    entityType: 'company',
    entityId: companyId,
    summary: `Company marked ${status}`,
  })
  revalidatePath('/super-admin')
  return { ok: true }
}

export async function superAdminAssignPlanAction(companyId: string, planKey: string, status: string) {
  const session = await requireSuperAdmin()
  const db = getDb()
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.key, planKey))
    .limit(1)
  if (!plan) return { ok: false, error: 'Plan not found' }

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.companyId, companyId))
    .limit(1)
  if (existing) {
    await db
      .update(subscriptions)
      .set({
        planId: plan.id,
        status: status as typeof existing.status,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id))
  } else {
    await db.insert(subscriptions).values({
      companyId,
      planId: plan.id,
      status: status as 'trial',
    })
  }
  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'subscription.assigned',
    entityType: 'subscription',
    summary: `Assigned plan ${planKey} (${status})`,
  })
  revalidatePath('/super-admin')
  return { ok: true }
}

export async function getWorkspaceContext() {
  const session = await requireUser()
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) return { session, companyId: null, permissions: [] as string[] }
  const { requireMembership } = await import('@/server/authz')
  const { membership } = await requireMembership(companyId)
  const permissions = await listUserPermissions(membership.id)
  return { session, companyId, permissions }
}
