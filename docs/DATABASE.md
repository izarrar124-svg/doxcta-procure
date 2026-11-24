# Database — Doxcta AI MVP

ORM: Drizzle. Database: Neon PostgreSQL.

## Foundation (Phase 1–4)

users, sessions, accounts, verifications, companies, company_settings, company_memberships, departments, permissions, roles, role_permissions, membership_roles, invitations, subscription_plans, subscriptions, audit_logs, notifications

## Financial domain

| Table | Purpose |
|---|---|
| vendors | Suppliers |
| expense_categories | Categories |
| expenses | Expense transactions (`NUMERIC` amounts) |
| invoices | Invoice headers + AI extraction JSON |
| invoice_items | Line items |
| invoice_documents | Uploaded file metadata |
| payments | Payment records; outstanding computed on invoice |
| approval_workflows / approval_steps | Configurable chains |
| approvals / approval_history | Runtime approval state |
| budgets / budget_periods | Allocations |
| ai_processing_jobs | OCR/extract job status |
| usage_records | Metered invoices/AI usage |
| ai_assistant_logs | Query/response audit |

## Money fields

All amounts use `numeric(18,4)`. Each converted row stores `exchange_rate`, `reporting_currency`, and `reporting_amount` so historical reports stay stable.

## Tenancy

Every business table includes `company_id`. Backend authz is primary; optional RLS scripts live in `app/sql/rls.sql`.

## Apply schema

```bash
cd app
npm run db:push
npm run db:seed
```
