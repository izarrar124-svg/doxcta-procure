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
  currency: text('currency').default('USD').notNull(),
  timezone: text('timezone').default('America/New_York').notNull(),
  fiscalYearStart: text('fiscal_year_start').default('January').notNull(),
  approvalReminderDays: integer('approval_reminder_days').default(3).notNull(),
  fxRatePkrUsd: numeric('fx_rate_pkr_usd', { precision: 12, scale: 4 }).default('278'),
  dateFormat: text('date_format').default('MM/DD/YYYY').notNull(),
  taxLabel: text('tax_label').default('sales_tax').notNull(),
  taxRegistration: text('tax_registration'),
  budgetAlert70: integer('budget_alert_70').default(70).notNull(),
  budgetAlert90: integer('budget_alert_90').default(90).notNull(),
  budgetAlert100: integer('budget_alert_100').default(100).notNull(),
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

/** Domain enums */
export const expenseStatusEnum = pgEnum('expense_status', [
  'draft',
  'submitted',
  'pending_approval',
  'approved',
  'rejected',
  'paid',
  'partially_paid',
  'cancelled',
])

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'processing',
  'needs_review',
  'validated',
  'pending_approval',
  'approved',
  'rejected',
  'cancelled',
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'unpaid',
  'partially_paid',
  'paid',
  'overdue',
  'disputed',
  'cancelled',
])

export const aiJobStatusEnum = pgEnum('ai_job_status', [
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled',
])

export const approvalDecisionEnum = pgEnum('approval_decision', [
  'pending',
  'approved',
  'rejected',
  'returned',
])

export const budgetPeriodTypeEnum = pgEnum('budget_period_type', ['annual', 'monthly'])

export const vendors = pgTable(
  'vendors',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    legalName: text('legal_name'),
    email: text('email'),
    phone: text('phone'),
    country: text('country'),
    addressLine1: text('address_line1'),
    addressLine2: text('address_line2'),
    city: text('city'),
    state: text('state'),
    postalCode: text('postal_code'),
    taxRegistration: text('tax_registration'),
    defaultCurrency: text('default_currency').default('USD').notNull(),
    paymentTerms: text('payment_terms').default('Net 30'),
    bankAccountName: text('bank_account_name'),
    bankAccountNumber: text('bank_account_number'),
    bankRouting: text('bank_routing'),
    bankName: text('bank_name'),
    notes: text('notes'),
    active: boolean('active').default(true).notNull(),
    ...timestamps,
  },
  (t) => [
    index('vendors_company_idx').on(t.companyId),
    index('vendors_company_name_idx').on(t.companyId, t.name),
  ],
)

export const expenseCategories = pgTable(
  'expense_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    code: text('code').notNull(),
    description: text('description'),
    active: boolean('active').default(true).notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('expense_cat_company_code_uidx').on(t.companyId, t.code),
    index('expense_cat_company_idx').on(t.companyId),
  ],
)

export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    reference: text('reference').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
    categoryId: uuid('category_id').references(() => expenseCategories.id, {
      onDelete: 'set null',
    }),
    departmentId: uuid('department_id').references(() => departments.id, {
      onDelete: 'set null',
    }),
    requesterMembershipId: uuid('requester_membership_id').references(
      () => companyMemberships.id,
      { onDelete: 'set null' },
    ),
    transactionDate: timestamp('transaction_date', { withTimezone: true }).notNull(),
    currency: text('currency').notNull(),
    originalAmount: numeric('original_amount', { precision: 18, scale: 4 }).notNull(),
    taxAmount: numeric('tax_amount', { precision: 18, scale: 4 }).default('0').notNull(),
    totalAmount: numeric('total_amount', { precision: 18, scale: 4 }).notNull(),
    exchangeRate: numeric('exchange_rate', { precision: 18, scale: 8 }).default('1').notNull(),
    reportingCurrency: text('reporting_currency').notNull(),
    reportingAmount: numeric('reporting_amount', { precision: 18, scale: 4 }).notNull(),
    paymentMethod: text('payment_method'),
    status: expenseStatusEnum('status').default('draft').notNull(),
    invoiceId: uuid('invoice_id'),
    approvalId: uuid('approval_id'),
    idempotencyKey: text('idempotency_key'),
    recurring: boolean('recurring').default(false).notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('expenses_company_ref_uidx').on(t.companyId, t.reference),
    uniqueIndex('expenses_idempotency_uidx').on(t.companyId, t.idempotencyKey),
    index('expenses_company_idx').on(t.companyId),
    index('expenses_status_idx').on(t.companyId, t.status),
  ],
)

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
    invoiceNumber: text('invoice_number'),
    invoiceDate: timestamp('invoice_date', { withTimezone: true }),
    dueDate: timestamp('due_date', { withTimezone: true }),
    currency: text('currency').default('USD').notNull(),
    subtotal: numeric('subtotal', { precision: 18, scale: 4 }).default('0').notNull(),
    taxAmount: numeric('tax_amount', { precision: 18, scale: 4 }).default('0').notNull(),
    discountAmount: numeric('discount_amount', { precision: 18, scale: 4 }).default('0').notNull(),
    totalAmount: numeric('total_amount', { precision: 18, scale: 4 }).default('0').notNull(),
    exchangeRate: numeric('exchange_rate', { precision: 18, scale: 8 }).default('1').notNull(),
    reportingCurrency: text('reporting_currency').notNull(),
    reportingAmount: numeric('reporting_amount', { precision: 18, scale: 4 }).default('0').notNull(),
    paymentTerms: text('payment_terms'),
    status: invoiceStatusEnum('status').default('draft').notNull(),
    paymentStatus: paymentStatusEnum('payment_status').default('unpaid').notNull(),
    outstandingBalance: numeric('outstanding_balance', { precision: 18, scale: 4 })
      .default('0')
      .notNull(),
    categoryId: uuid('category_id').references(() => expenseCategories.id, {
      onDelete: 'set null',
    }),
    departmentId: uuid('department_id').references(() => departments.id, {
      onDelete: 'set null',
    }),
    expenseId: uuid('expense_id'),
    extractedJson: text('extracted_json'),
    confidenceJson: text('confidence_json'),
    validationWarnings: text('validation_warnings'),
    duplicateOfInvoiceId: uuid('duplicate_of_invoice_id'),
    documentHash: text('document_hash'),
    createdByUserId: text('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    ...timestamps,
  },
  (t) => [
    index('invoices_company_idx').on(t.companyId),
    index('invoices_payment_status_idx').on(t.companyId, t.paymentStatus),
    uniqueIndex('invoices_company_vendor_number_uidx').on(
      t.companyId,
      t.vendorId,
      t.invoiceNumber,
    ),
  ],
)

export const invoiceItems = pgTable(
  'invoice_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    invoiceId: uuid('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    quantity: numeric('quantity', { precision: 18, scale: 4 }).default('1').notNull(),
    unitPrice: numeric('unit_price', { precision: 18, scale: 4 }).default('0').notNull(),
    taxAmount: numeric('tax_amount', { precision: 18, scale: 4 }).default('0').notNull(),
    lineTotal: numeric('line_total', { precision: 18, scale: 4 }).default('0').notNull(),
    ...timestamps,
  },
  (t) => [index('invoice_items_invoice_idx').on(t.invoiceId)],
)

export const invoiceDocuments = pgTable(
  'invoice_documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    invoiceId: uuid('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    storageUrl: text('storage_url').notNull(),
    documentHash: text('document_hash'),
    ...timestamps,
  },
  (t) => [index('invoice_docs_invoice_idx').on(t.invoiceId)],
)

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    invoiceId: uuid('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    amount: numeric('amount', { precision: 18, scale: 4 }).notNull(),
    currency: text('currency').notNull(),
    paymentDate: timestamp('payment_date', { withTimezone: true }).notNull(),
    paymentMethod: text('payment_method'),
    reference: text('reference'),
    notes: text('notes'),
    recordedByUserId: text('recorded_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    idempotencyKey: text('idempotency_key'),
    ...timestamps,
  },
  (t) => [
    index('payments_invoice_idx').on(t.invoiceId),
    uniqueIndex('payments_idempotency_uidx').on(t.companyId, t.idempotencyKey),
  ],
)

export const approvalWorkflows = pgTable(
  'approval_workflows',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    entityType: text('entity_type').notNull(),
    active: boolean('active').default(true).notNull(),
    ...timestamps,
  },
  (t) => [index('approval_workflows_company_idx').on(t.companyId)],
)

export const approvalSteps = pgTable(
  'approval_steps',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    workflowId: uuid('workflow_id')
      .notNull()
      .references(() => approvalWorkflows.id, { onDelete: 'cascade' }),
    stepOrder: integer('step_order').notNull(),
    name: text('name').notNull(),
    roleKey: text('role_key'),
    amountThreshold: numeric('amount_threshold', { precision: 18, scale: 4 }),
    ...timestamps,
  },
  (t) => [index('approval_steps_workflow_idx').on(t.workflowId)],
)

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    workflowId: uuid('workflow_id').references(() => approvalWorkflows.id, {
      onDelete: 'set null',
    }),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    requesterMembershipId: uuid('requester_membership_id').references(
      () => companyMemberships.id,
      { onDelete: 'set null' },
    ),
    currentStepOrder: integer('current_step_order').default(1).notNull(),
    status: approvalDecisionEnum('status').default('pending').notNull(),
    amount: numeric('amount', { precision: 18, scale: 4 }),
    currency: text('currency'),
    ...timestamps,
  },
  (t) => [
    index('approvals_company_idx').on(t.companyId),
    index('approvals_entity_idx').on(t.entityType, t.entityId),
  ],
)

export const approvalHistory = pgTable(
  'approval_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    approvalId: uuid('approval_id')
      .notNull()
      .references(() => approvals.id, { onDelete: 'cascade' }),
    stepOrder: integer('step_order').notNull(),
    actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    decision: approvalDecisionEnum('decision').notNull(),
    comment: text('comment'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('approval_history_approval_idx').on(t.approvalId)],
)

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    departmentId: uuid('department_id').references(() => departments.id, {
      onDelete: 'set null',
    }),
    categoryId: uuid('category_id').references(() => expenseCategories.id, {
      onDelete: 'set null',
    }),
    periodType: budgetPeriodTypeEnum('period_type').default('annual').notNull(),
    currency: text('currency').notNull(),
    allocatedAmount: numeric('allocated_amount', { precision: 18, scale: 4 }).notNull(),
    active: boolean('active').default(true).notNull(),
    ...timestamps,
  },
  (t) => [index('budgets_company_idx').on(t.companyId)],
)

export const budgetPeriods = pgTable(
  'budget_periods',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    budgetId: uuid('budget_id')
      .notNull()
      .references(() => budgets.id, { onDelete: 'cascade' }),
    periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
    periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
    allocatedAmount: numeric('allocated_amount', { precision: 18, scale: 4 }).notNull(),
    ...timestamps,
  },
  (t) => [index('budget_periods_budget_idx').on(t.budgetId)],
)

export const aiProcessingJobs = pgTable(
  'ai_processing_jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
    status: aiJobStatusEnum('status').default('queued').notNull(),
    provider: text('provider').default('openai').notNull(),
    errorMessage: text('error_message'),
    resultJson: text('result_json'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('ai_jobs_company_idx').on(t.companyId)],
)

export const usageRecords = pgTable(
  'usage_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    metric: text('metric').notNull(),
    quantity: integer('quantity').default(1).notNull(),
    periodKey: text('period_key').notNull(),
    ...timestamps,
  },
  (t) => [
    index('usage_company_period_idx').on(t.companyId, t.periodKey, t.metric),
  ],
)

export const aiAssistantLogs = pgTable(
  'ai_assistant_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    query: text('query').notNull(),
    response: text('response').notNull(),
    sourceIds: text('source_ids'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('ai_assistant_logs_company_idx').on(t.companyId)],
)

export type User = typeof users.$inferSelect
export type Company = typeof companies.$inferSelect
export type Membership = typeof companyMemberships.$inferSelect
export type Vendor = typeof vendors.$inferSelect
export type Expense = typeof expenses.$inferSelect
export type Invoice = typeof invoices.$inferSelect
