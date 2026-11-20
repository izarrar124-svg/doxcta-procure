import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { getAuth } from '../src/server/auth'
import { ensureGlobalPermissions, ensureSubscriptionPlans } from '../src/server/company-provision'
import { getDb } from '../src/server/db'
import { users } from '../src/server/db/schema'

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
  console.log('Super admin ready:', email)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
