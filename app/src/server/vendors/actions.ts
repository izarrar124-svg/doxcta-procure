'use server'

import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAnyPermission, requirePermission } from '@/server/authz'
import { resolveCompanyId } from '@/server/company-context'
import { writeAudit } from '@/server/audit'
import { getDb } from '@/server/db'
import { vendors } from '@/server/db/schema'

export async function listVendorsAction(query?: string) {
  const { companyId } = await resolveCompanyId()
  await requireAnyPermission(companyId, ['vendors.view', 'vendors.manage'])
  const db = getDb()
  const where = query
    ? and(
        eq(vendors.companyId, companyId),
        or(ilike(vendors.name, `%${query}%`), ilike(vendors.email, `%${query}%`)),
      )
    : eq(vendors.companyId, companyId)
  return db.select().from(vendors).where(where).orderBy(desc(vendors.updatedAt))
}

export async function createVendorAction(formData: FormData): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'vendors.manage')
  const name = String(formData.get('name') || '').trim()
  if (!name) return { ok: false, error: 'Name is required' }

  const db = getDb()
  const [row] = await db
    .insert(vendors)
    .values({
      companyId,
      name,
      legalName: String(formData.get('legalName') || '') || null,
      email: String(formData.get('email') || '') || null,
      phone: String(formData.get('phone') || '') || null,
      country: String(formData.get('country') || '') || null,
      addressLine1: String(formData.get('addressLine1') || '') || null,
      city: String(formData.get('city') || '') || null,
      state: String(formData.get('state') || '') || null,
      postalCode: String(formData.get('postalCode') || '') || null,
      taxRegistration: String(formData.get('taxRegistration') || '') || null,
      defaultCurrency: String(formData.get('defaultCurrency') || 'USD'),
      paymentTerms: String(formData.get('paymentTerms') || 'Net 30'),
      bankAccountName: String(formData.get('bankAccountName') || '') || null,
      bankAccountNumber: String(formData.get('bankAccountNumber') || '') || null,
      bankRouting: String(formData.get('bankRouting') || '') || null,
      bankName: String(formData.get('bankName') || '') || null,
      notes: String(formData.get('notes') || '') || null,
    })
    .returning()

  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'vendor.created',
    entityType: 'vendor',
    entityId: row.id,
    summary: `Vendor ${name} created`,
  })
  revalidatePath('/vendors')
  return { ok: true, id: row.id }
}

export async function updateVendorAction(formData: FormData): Promise<void> {
  const { session, companyId } = await resolveCompanyId()
  await requirePermission(companyId, 'vendors.manage')
  const id = String(formData.get('id') || '')
  if (!id) return
  const db = getDb()
  await db
    .update(vendors)
    .set({
      name: String(formData.get('name') || ''),
      legalName: String(formData.get('legalName') || '') || null,
      email: String(formData.get('email') || '') || null,
      phone: String(formData.get('phone') || '') || null,
      country: String(formData.get('country') || '') || null,
      addressLine1: String(formData.get('addressLine1') || '') || null,
      city: String(formData.get('city') || '') || null,
      taxRegistration: String(formData.get('taxRegistration') || '') || null,
      defaultCurrency: String(formData.get('defaultCurrency') || 'USD'),
      paymentTerms: String(formData.get('paymentTerms') || 'Net 30'),
      bankAccountName: String(formData.get('bankAccountName') || '') || null,
      bankAccountNumber: String(formData.get('bankAccountNumber') || '') || null,
      bankRouting: String(formData.get('bankRouting') || '') || null,
      bankName: String(formData.get('bankName') || '') || null,
      notes: String(formData.get('notes') || '') || null,
      active: String(formData.get('active') || 'true') === 'true',
      updatedAt: new Date(),
    })
    .where(and(eq(vendors.id, id), eq(vendors.companyId, companyId)))

  await writeAudit({
    companyId,
    userId: session.user.id,
    action: 'vendor.updated',
    entityType: 'vendor',
    entityId: id,
    summary: `Vendor updated`,
  })
  revalidatePath('/vendors')
  revalidatePath(`/vendors/${id}`)
}

export async function findDuplicateVendors(companyId: string) {
  const db = getDb()
  return db.execute(sql`
    SELECT lower(name) AS name_key, count(*)::int AS cnt
    FROM vendors
    WHERE company_id = ${companyId} AND active = true
    GROUP BY lower(name)
    HAVING count(*) > 1
  `)
}
