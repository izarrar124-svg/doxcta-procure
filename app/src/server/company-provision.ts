import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '@/server/db'
import {
  companies,
  companyMemberships,
  companySettings,
  departments,
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
      description: 'Basic expense management for small teams.',
      monthlyPrice: '29',
      annualPrice: '290',
      employeeLimit: 10,
      featuresJson: JSON.stringify(['expenses', 'basic_reporting']),
    },
    {
      key: 'business',
      name: 'Business',
      description: 'Expense + procurement with approvals and budgets.',
      monthlyPrice: '79',
      annualPrice: '790',
      employeeLimit: 50,
      featuresJson: JSON.stringify(['expenses', 'procurement', 'approvals', 'budgets']),
    },
    {
      key: 'professional',
      name: 'Professional',
      description: 'Advanced reporting and custom workflows.',
      monthlyPrice: '149',
      annualPrice: '1490',
      employeeLimit: 200,
      featuresJson: JSON.stringify(['advanced_reporting', 'custom_workflows']),
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      description: 'Custom limits, dedicated support, advanced configuration.',
      monthlyPrice: '0',
      annualPrice: '0',
      employeeLimit: 10000,
      featuresJson: JSON.stringify(['custom_limits', 'dedicated_support']),
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

  const [company] = await db
    .insert(companies)
    .values({
      name: input.companyName,
      slug,
      businessEmail: input.businessEmail.toLowerCase(),
      phone: input.phone,
      country: input.country,
      industry: input.industry,
      companySize: input.companySize,
      status: 'active',
    })
    .returning()

  await db.insert(companySettings).values({ companyId: company.id })

  const roleMap = await seedCompanyRoles(company.id)

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
      designation: 'Company Admin',
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
    summary: `Company ${company.name} provisioned`,
  })

  await notifyUser({
    companyId: company.id,
    userId: input.ownerUserId,
    title: 'Welcome to Doxcta Procure',
    body: `${company.name} workspace is ready. Invite your team to get started.`,
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
