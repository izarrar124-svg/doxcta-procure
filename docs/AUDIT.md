# Doxcta Procure — Codebase Audit (Phase 1)

**Date:** 2026-11-21  
**Scope:** Pre-migration audit before Next.js + PostgreSQL multi-tenant SaaS foundation  
**Live deploy (pre-cutover):** https://doxcta-procure.vercel.app  
**Repo:** https://github.com/izarrar124-svg/doxcta-procure

---

## 1. Existing application architecture

| Layer | Reality |
|---|---|
| Frontend | Vite 8 + React 19 + React Router 7 + Tailwind 4 |
| Backend | **None** (client-only SPA) |
| Data | In-memory fixtures in `app/src/data/mock.ts` |
| Auth | `localStorage` session (`doxcta_procure_session`) in `app/src/lib/auth.tsx` |
| Hosting | Vercel static SPA with `app/vercel.json` rewrite to `index.html` |

**Not present (contrary to the SaaS brief’s assumed stack):** Next.js, PostgreSQL, ORM, API routes, server actions, RLS, email, file storage.

Layout groups today:

- Public: `/login` only
- Authenticated shell: dashboard, requests, approvals, procurement, expenses, analytics, reports, notifications, admin CRUD-lite screens, spend chat mock

Design system: extracted Doxcta tokens/components under `design-system/`, copied into `app/src/styles/`.

---

## 2. Existing working modules

| Module | Status | Notes |
|---|---|---|
| Login UI | Working (mock) | Show/hide password; any email succeeds |
| App shell / nav | Working | Routes aligned to live capture (`/admin/*`, `/procurement/expenses`) |
| Dashboard | Working (fixtures) | KPI cards + CSS charts |
| Purchase requests | Working (local state) | List/create/detail; not persisted |
| Approvals | Working (local state) | Approve/reject mutates React state |
| Procurement / Expenses | Working (fixtures) | Read-mostly UI |
| Analytics / Reports | Working (fixtures) | No real aggregations |
| Notifications | Working (fixtures) | Mark-read local |
| Admin tables | Working (fixtures) | Users, depts, roles, categories, vendors, workflows, settings |
| Spend assistant | Working (mock) | Keyword replies |

---

## 3. Incomplete modules

- Approvals/procurement empty states exist; no durable queue
- Settings save is local-only
- Google Sheet sync button is a stub
- Export CSV is a stub
- Role “permissions” are display-only

---

## 4. Missing functionality (vs commercial SaaS brief)

- Multi-tenant companies + isolation
- Real authentication (hashing, sessions, verify, reset)
- Company registration / Super Admin provisioning
- Employee invitations
- Server-enforced RBAC
- Expense/PO lifecycle with attachments
- Configurable approval engine
- Budgets with decimal math
- Marketing website + lead CRM
- Subscription entitlements + payment gateway
- Audit logs, transactional email, secure file access
- Automated isolation tests

---

## 5. Database schema

**Current:** none.

**Required for Phase 1–4:** see `docs/DATABASE.md` (users/sessions, companies, memberships, invitations, departments, roles/permissions, subscription_plans/subscriptions, audit_logs, notifications).

---

## 6. Authentication and authorization

| Concern | Current | Risk |
|---|---|---|
| Credentials | None verified | Anyone can “sign in” |
| Sessions | Browser localStorage JSON | Trivial forgery |
| Authorization | None | All screens client-gated only |
| Tenancy | N/A | Cross-tenant impossible only because there is no shared DB |

---

## 7. API structure

No REST/RPC/server actions. Planned: Better Auth routes + Next.js server actions / route handlers calling Drizzle services with `requireMembership` / `requirePermission`.

---

## 8. UI and responsive design

- Doxcta dark theme applied; desktop-first with mobile sidebar toggle
- Marketing site: **not started**
- Role-specific dashboards: **not started** (single admin-like view)

---

## 9. Security weaknesses

1. No server-side authz  
2. No password hashing  
3. No CSRF/session cookies  
4. No rate limiting  
5. No tenant isolation layer  
6. Secrets: none in repo (good), but also no env-based secrets management yet  
7. Vercel Deployment Protection (SSO) may block public visitors  

---

## 10. Deployment configuration

- Vercel project `doxcta-procure` linked to GitHub
- Root directory currently `app/` (Vite)
- After cutover: Next.js in `app/`, env vars for `DATABASE_URL`, `BETTER_AUTH_*`, optional `RESEND_*`

---

## 11. Required migrations

Greenfield Postgres schema via Drizzle. No existing production DB to preserve for this product (mock SPA only). Do **not** touch any unrelated Neon/Xorora databases.

---

## 12. Recommended implementation sequence

1. Audit (this doc)  
2. Migrate to Next.js App Router; keep Doxcta UI  
3. Drizzle + Neon schema + authz primitives  
4. Better Auth + `provisionCompany` + invitations  
5. Company Admin employees/depts/roles/settings  
6. Super Admin companies/subscriptions  
7. Tests + docs + Vercel deploy  

**Deferred:** expenses/PO/budgets, full marketing site, payments (Phases 5–12).

---

## Conflict with brief assumptions

Brief stated “Frontend/Backend: Next.js, Database: PostgreSQL.” That describes the **target**, not the **current** repo. Resolution: migrate `app/` in place to Next.js + Neon + Drizzle + Better Auth (least disruption, no second frontend).
