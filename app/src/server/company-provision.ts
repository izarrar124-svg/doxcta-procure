import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '@/server/db'
import {
  approvalSteps,
  approvalWorkflows,
  companies,
  companyMemberships,
  companySettings,
  departments,
  expenseCategories,
  membershipRoles,
  permissions,
  rolePermissions,
  roles,
  subscriptionPlans,
  subscriptions,
  users,
} from '@/server/db/schema'
import { PERMISSIONS, ROLE_TEMPLATES } from '@/server/permissions'
import { writeAudit, notifyUser } from '@/server/audit'

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 48) || 'company'
  )
}

export async function ensureGlobalPermissions() {
  const db = getDb()
  for (const p of PERMISSIONS) {
    await db
      .insert(permissions)
      .values({ key: p.key, description: p.description })
      .onConflictDoNothing({ target: permissions.key })
  }
}

export async function ensureSubscriptionPlans() {
  const db = getDb()
  const plans = [
    {
      key: 'starter',
      name: 'Starter',
      description: 'Small businesses — expense tracking and AI invoice extraction.',
      monthlyPrice: '29',
      annualPrice: '290',
      employeeLimit: 3,
      featuresJson: JSON.stringify({
        users: 3,
        invoicesPerMonth: 100,
        aiExtraction: true,
        aiAssistant: 'basic',
        approvals: 'basic',
        reports: 'basic',
        departments: 1,
      }),
    },
    {
      key: 'professional',
      name: 'Professional',
      description: 'Growing companies — advanced approvals and full AI assistant.',
      monthlyPrice: '79',
      annualPrice: '790',
      employeeLimit: 15,
      featuresJson: JSON.stringify({
        users: 15,
        invoicesPerMonth: 500,
        aiExtraction: true,
        aiAssistant: 'full',
        approvals: 'advanced',
        reports: 'advanced',
        departments: 10,
      }),
    },
    {
      key: 'business',
      name: 'Business',
      description: 'Established SMEs — higher limits and advanced reporting.',
      monthlyPrice: '149',
      annualPrice: '1490',
      employeeLimit: 50,
      featuresJson: JSON.stringify({
        users: 50,
        invoicesPerMonth: 2000,
        aiExtraction: true,
        aiAssistant: 'full',
        approvals: 'advanced',
        reports: 'advanced',
        departments: -1,
      }),
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      description: 'Custom limits, dedicated support, advanced configuration.',
      monthlyPrice: '0',
      annualPrice: '0',
      employeeLimit: 10000,
      featuresJson: JSON.stringify({
        users: -1,
        invoicesPerMonth: -1,
        aiExtraction: true,
        aiAssistant: 'full',
        approvals: 'advanced',
        reports: 'advanced',
        departments: -1,
      }),
    },
  ]
  for (const plan of plans) {
    await db.insert(subscriptionPlans).values(plan).onConflictDoNothing({ target: subscriptionPlans.key })
  }
}

async function seedCompanyRoles(companyId: string) {
  const db = getDb()
  const allPerms = await db.select().from(permissions)
  const byKey = Object.fromEntries(allPerms.map((p) => [p.key, p.id]))

  const created: Record<string, string> = {}
  for (const template of ROLE_TEMPLATES) {
    const [role] = await db
      .insert(roles)
      .values({
        companyId,
        key: template.key,
        name: template.name,
        description: template.description,
        isSystem: true,
      })
      .returning()
    created[template.key] = role.id
    for (const key of template.permissions) {
      const permissionId = byKey[key]
      if (!permissionId) continue
      await db
        .insert(rolePermissions)
        .values({ roleId: role.id, permissionId })
        .onConflictDoNothing()
    }
  }
  return created
}

async function seedDefaultCategories(companyId: string) {
  const db = getDb()
  const cats = [
    { name: 'Software & Subscriptions', code: 'SOFT' },
    { name: 'Travel', code: 'TRAV' },
    { name: 'Office Supplies', code: 'OFF' },
    { name: 'Professional Services', code: 'PROF' },
    { name: 'Utilities', code: 'UTIL' },
    { name: 'Marketing', code: 'MKT' },
    { name: 'Other', code: 'OTHER' },
  ]
  for (const c of cats) {
    await db.insert(expenseCategories).values({ companyId, ...c })
  }
}

async function seedDefaultApprovalWorkflow(companyId: string) {
  const db = getDb()
  const [workflow] = await db
    .insert(approvalWorkflows)
    .values({
      companyId,
      name: 'Default Expense Approval',
      entityType: 'expense',
      active: true,
    })
    .returning()

  const steps = [
    { stepOrder: 1, name: 'Department Head', roleKey: 'department_manager', amountThreshold: null },
    { stepOrder: 2, name: 'Finance Manager', roleKey: 'finance_manager', amountThreshold: null },
    { stepOrder: 3, name: 'CEO', roleKey: 'ceo', amountThreshold: '5000' },
  ]
  for (const s of steps) {
    await db.insert(approvalSteps).values({
      companyId,
      workflowId: workflow.id,
      stepOrder: s.stepOrder,
      name: s.name,
      roleKey: s.roleKey,
      amountThreshold: s.amountThreshold,
    })
  }
  return workflow
}

export async function provisionCompany(input: {
  companyName: string
  businessEmail: string
  ownerUserId: string
  phone?: string
  country?: string
  industry?: string
  companySize?: string
  planKey?: string
  trialDays?: number
}) {
  const db = getDb()
  await ensureGlobalPermissions()
  await ensureSubscriptionPlans()

  const [existing] = await db
    .select()
    .from(companies)
    .where(eq(companies.businessEmail, input.businessEmail.toLowerCase()))
    .limit(1)
  if (existing) {
    throw new Error('A company with this business email already exists')
  }

  let slug = slugify(input.companyName)
  const [slugHit] = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1)
  if (slugHit) slug = `${slug}-${nanoid(6).toLowerCase()}`

  const country = input.country ?? 'US'
  const regional =
    country === 'GB' || country === 'UK'
      ? { currency: 'GBP', timezone: 'Europe/London', dateFormat: 'DD/MM/YYYY', taxLabel: 'vat' }
      : country === 'AE' || country === 'UAE'
        ? { currency: 'AED', timezone: 'Asia/Dubai', dateFormat: 'DD/MM/YYYY', taxLabel: 'vat' }
        : { currency: 'USD', timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY', taxLabel: 'sales_tax' }

  const [company] = await db
    .insert(companies)
    .values({
      name: input.companyName,
      slug,
      businessEmail: input.businessEmail.toLowerCase(),
      phone: input.phone,
      country,
      industry: input.industry,
      companySize: input.companySize,
      status: 'active',
    })
    .returning()

  await db.insert(companySettings).values({
    companyId: company.id,
    currency: regional.currency,
    timezone: regional.timezone,
    dateFormat: regional.dateFormat,
    taxLabel: regional.taxLabel,
    fiscalYearStart: 'January',
  })

  const roleMap = await seedCompanyRoles(company.id)
  await seedDefaultCategories(company.id)
  await seedDefaultApprovalWorkflow(company.id)

  const defaultDepts = [
    { name: 'Operations', code: 'OPS' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Engineering', code: 'ENG' },
  ]
  for (const d of defaultDepts) {
    await db.insert(departments).values({
      companyId: company.id,
      name: d.name,
      code: d.code,
    })
  }

  const [membership] = await db
    .insert(companyMemberships)
    .values({
      companyId: company.id,
      userId: input.ownerUserId,
      status: 'active',
      designation: 'Organization Admin',
      joiningDate: new Date(),
    })
    .returning()

  await db.insert(membershipRoles).values({
    membershipId: membership.id,
    roleId: roleMap.company_admin,
  })

  const planKey = input.planKey ?? 'starter'
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.key, planKey))
    .limit(1)
  if (plan) {
    const trialDays = input.trialDays ?? 14
    await db.insert(subscriptions).values({
      companyId: company.id,
      planId: plan.id,
      status: 'trial',
      trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
    })
  }

  await writeAudit({
    companyId: company.id,
    userId: input.ownerUserId,
    action: 'company.provisioned',
    entityType: 'company',
    entityId: company.id,
    summary: `Organization ${company.name} provisioned`,
  })

  await notifyUser({
    companyId: company.id,
    userId: input.ownerUserId,
    title: 'Welcome to Doxcta AI',
    body: `${company.name} workspace is ready. Invite your team and start tracking expenses.`,
  })

  return { company, membership, roleMap }
}

export async function getOrCreateUserByEmail(input: {
  email: string
  name: string
  userId?: string
}) {
  const db = getDb()
  const email = input.email.toLowerCase()
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing) return existing
  const [user] = await db
    .insert(users)
    .values({
      id: input.userId ?? nanoid(),
      email,
      name: input.name,
      emailVerified: false,
    })
    .returning()
  return user
}
