# Database — Doxcta Procure

## Engine

PostgreSQL on **Neon**, accessed via Drizzle ORM (`@neondatabase/serverless`).

## Core tables (Phase 1–4)

| Table | Purpose |
|---|---|
| `users`, `sessions`, `accounts`, `verifications` | Better Auth |
| `companies` | Tenant root |
| `company_settings` | Currency, timezone, fiscal year, FX |
| `company_memberships` | User↔company link + employee fields |
| `departments` | Company org units |
| `permissions`, `roles`, `role_permissions`, `membership_roles` | RBAC |
| `invitations` | Email invite tokens |
| `subscription_plans`, `subscriptions` | Manual SaaS plans |
| `audit_logs`, `notifications` | Platform/company events |

All tenant-owned rows carry `company_id` (except platform-global `permissions` / `subscription_plans`).

Monetary columns use `numeric` (never float).

## Commands

```bash
cd app
cp .env.example .env.local   # set DATABASE_URL
npm run db:push              # apply schema (dev)
# or
npm run db:generate && npm run db:migrate
npm run db:seed              # create Super Admin
```

## Isolation

Application services call `requireMembership` / `requirePermission`. Suspended companies are rejected. Do not accept browser-supplied company IDs without membership checks.
