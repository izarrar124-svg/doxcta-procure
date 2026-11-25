import { config } from 'dotenv'
config({ path: '.env.local' })
config()

import { eq } from 'drizzle-orm'
import { getAuth } from '../src/server/auth'
import {
  ensureGlobalPermissions,
  ensureSubscriptionPlans,
  provisionCompany,
} from '../src/server/company-provision'
import { getActiveCompanyId } from '../src/server/authz'
import { getDb } from '../src/server/db'
import { companyMemberships, sessions, users } from '../src/server/db/schema'

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL
  const password = process.env.SUPER_ADMIN_PASSWORD
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin'
  if (!email || !password) {
    throw new Error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD')
  }

  await ensureGlobalPermissions()
  await ensureSubscriptionPlans()

  const auth = getAuth()
  const db = getDb()
  const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)

  let userId = existing?.id
  if (!userId) {
    const signed = await auth.api.signUpEmail({
      body: { email: email.toLowerCase(), password, name },
    })
    userId = signed.user.id
  }

  await db.update(users).set({ isSuperAdmin: true, emailVerified: true }).where(eq(users.id, userId))

  let companyId = await getActiveCompanyId(userId)
  if (!companyId) {
    try {
      const provisioned = await provisionCompany({
        companyName: process.env.SUPER_ADMIN_COMPANY_NAME || 'Doxcta Demo',
        businessEmail: email.toLowerCase(),
        ownerUserId: userId,
        country: 'US',
        planKey: 'starter',
      })
      companyId = provisioned.company.id
      console.log('Provisioned demo company:', companyId)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (!/already exists/i.test(message)) throw err
      // Company row exists; ensure membership for this user
      const { companies } = await import('../src/server/db/schema')
      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.businessEmail, email.toLowerCase()))
        .limit(1)
      if (!company) throw err
      companyId = company.id
      const [mem] = await db
        .select()
        .from(companyMemberships)
        .where(eq(companyMemberships.userId, userId))
        .limit(1)
      if (!mem) {
        // Re-run provision path is blocked; attach as admin via provision helper internals is heavy.
        // Create membership by calling provision only when missing - fall through recreate via unique email.
        throw new Error(
          `Company exists for ${email} but user has no membership. Fix manually or delete the company row.`,
        )
      }
    }
  }

  if (companyId) {
    await db
      .update(sessions)
      .set({ activeCompanyId: companyId, updatedAt: new Date() })
      .where(eq(sessions.userId, userId))
  }

  console.log('Super admin ready:', email)
  console.log('Active company:', companyId || 'none')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
