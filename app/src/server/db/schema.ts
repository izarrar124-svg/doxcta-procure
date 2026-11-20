import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const companyStatusEnum = pgEnum('company_status', [
  'active',
  'suspended',
  'pending',
])

export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'invited',
  'disabled',
])

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trial',
  'active',
  'past_due',
  'suspended',
  'cancelled',
  'expired',
])

export const invitationStatusEnum = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'revoked',
  'expired',
])

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}

/** Better Auth core tables */
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
  ...timestamps,
})

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    activeCompanyId: uuid('active_company_id'),
    ...timestamps,
  },
  (t) => [index('sessions_user_id_idx').on(t.userId)],
)

export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    ...timestamps,
  },
  (t) => [index('accounts_user_id_idx').on(t.userId)],
)

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ...timestamps,
})

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    businessEmail: text('business_email').notNull().unique(),
    phone: text('phone'),
    country: text('country'),
    industry: text('industry'),
    companySize: text('company_size'),
    status: companyStatusEnum('status').default('active').notNull(),
    ...timestamps,
  },
  (t) => [index('companies_status_idx').on(t.status)],
)

export const companySettings = pgTable('company_settings', {
  companyId: uuid('company_id')
    .primaryKey()
    .references(() => companies.id, { onDelete: 'cascade' }),
  currency: text('currency').default('PKR').notNull(),
  timezone: text('timezone').default('Asia/Karachi').notNull(),
  fiscalYearStart: text('fiscal_year_start').default('July').notNull(),
  approvalReminderDays: integer('approval_reminder_days').default(3).notNull(),
  fxRatePkrUsd: numeric('fx_rate_pkr_usd', { precision: 12, scale: 4 }).default('278'),
  ...timestamps,
})

export const companyMemberships = pgTable(
  'company_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: membershipStatusEnum('status').default('active').notNull(),
    employeeCode: text('employee_code'),
    phone: text('phone'),
    designation: text('designation'),
    departmentId: uuid('department_id'),
    managerMembershipId: uuid('manager_membership_id'),
    joiningDate: timestamp('joining_date', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('membership_company_user_uidx').on(t.companyId, t.userId),
    index('membership_company_idx').on(t.companyId),
    index('membership_user_idx').on(t.userId),
  ],
)

export const departments = pgTable(
  'departments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    code: text('code').notNull(),
    headMembershipId: uuid('head_membership_id'),
    active: boolean('active').default(true).notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('dept_company_code_uidx').on(t.companyId, t.code),
    index('dept_company_idx').on(t.companyId),
  ],
)

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  description: text('description').notNull(),
})

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    isSystem: boolean('is_system').default(false).notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('roles_company_key_uidx').on(t.companyId, t.key),
    index('roles_company_idx').on(t.companyId),
  ],
)

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('role_perm_uidx').on(t.roleId, t.permissionId)],
)

export const membershipRoles = pgTable(
  'membership_roles',
  {
    membershipId: uuid('membership_id')
      .notNull()
      .references(() => companyMemberships.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('membership_role_uidx').on(t.membershipId, t.roleId)],
)

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    token: text('token').notNull().unique(),
    roleId: uuid('role_id').references(() => roles.id),
    invitedByUserId: text('invited_by_user_id').references(() => users.id),
    status: invitationStatusEnum('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index('invitations_company_email_idx').on(t.companyId, t.email)],
)

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  monthlyPrice: numeric('monthly_price', { precision: 12, scale: 2 }).default('0').notNull(),
  annualPrice: numeric('annual_price', { precision: 12, scale: 2 }).default('0').notNull(),
  employeeLimit: integer('employee_limit').default(10).notNull(),
  featuresJson: text('features_json').default('[]').notNull(),
  active: boolean('active').default(true).notNull(),
  ...timestamps,
})

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' })
      .unique(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => subscriptionPlans.id),
    status: subscriptionStatusEnum('status').default('trial').notNull(),
    trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('subscriptions_status_idx').on(t.status)],
)

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    summary: text('summary').notNull(),
    ipAddress: text('ip_address'),
    correlationId: text('correlation_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('audit_company_idx').on(t.companyId),
    index('audit_created_idx').on(t.createdAt),
  ],
)

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    body: text('body').notNull(),
    read: boolean('read').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('notifications_user_idx').on(t.userId)],
)

export type User = typeof users.$inferSelect
export type Company = typeof companies.$inferSelect
export type Membership = typeof companyMemberships.$inferSelect
