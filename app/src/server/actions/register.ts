'use server'

import { APIError } from 'better-auth/api'
import { z } from 'zod'
import { getAuth } from '@/server/auth'
import { provisionCompany } from '@/server/company-provision'
import { getDb } from '@/server/db'
import { sessions } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

const schema = z.object({
  companyName: z.string().min(2).max(120),
  businessEmail: z.string().email(),
  contactName: z.string().min(2).max(120),
  phone: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  password: z.string().min(8).max(128),
  planKey: z.enum(['starter', 'professional', 'business']).optional(),
})

export type RegisterState = { ok: boolean; error?: string; redirectTo?: string }

export async function registerCompanyAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const rawPlan = String(formData.get('planKey') || 'starter').toLowerCase()
  const planKey =
    rawPlan === 'professional' || rawPlan === 'business' ? rawPlan : 'starter'

  const parsed = schema.safeParse({
    companyName: formData.get('companyName'),
    businessEmail: formData.get('businessEmail'),
    contactName: formData.get('contactName'),
    phone: formData.get('phone') || undefined,
    country: formData.get('country') || undefined,
    industry: formData.get('industry') || undefined,
    companySize: formData.get('companySize') || undefined,
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    planKey,
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const confirm = String(formData.get('confirmPassword') ?? '')
  if (confirm !== parsed.data.password) {
    return { ok: false, error: 'Passwords do not match' }
  }

  const auth = getAuth()
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: parsed.data.businessEmail.toLowerCase(),
        password: parsed.data.password,
        name: parsed.data.contactName,
      },
    })

    const userId = result.user.id
    const { company } = await provisionCompany({
      companyName: parsed.data.companyName,
      businessEmail: parsed.data.businessEmail,
      ownerUserId: userId,
      phone: parsed.data.phone,
      country: parsed.data.country,
      industry: parsed.data.industry,
      companySize: parsed.data.companySize,
      planKey: parsed.data.planKey ?? 'starter',
    })

    // Best-effort: stamp active company on latest session if present
    const db = getDb()
    await db
      .update(sessions)
      .set({ activeCompanyId: company.id, updatedAt: new Date() })
      .where(eq(sessions.userId, userId))

    return { ok: true, redirectTo: '/dashboard' }
  } catch (err) {
    if (err instanceof APIError) {
      return { ok: false, error: err.message }
    }
    const message = err instanceof Error ? err.message : 'Registration failed'
    return { ok: false, error: message }
  }
}
