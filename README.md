# Doxcta Procure

Multi-tenant SaaS foundation for expense & procurement operations (Phase 1–4), with Doxcta branding.

- **GitHub:** https://github.com/izarrar124-svg/doxcta-procure
- **Live:** https://doxcta-procure.vercel.app

## Stack

- Next.js 15 App Router
- Neon PostgreSQL + Drizzle ORM
- Better Auth (email/password)
- Tailwind 4 + Doxcta design tokens

## Quick start

```bash
cd app
cp .env.example .env.local
# set DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000

## Docs

| Doc | Contents |
|---|---|
| [docs/AUDIT.md](docs/AUDIT.md) | Pre-migration audit |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema & migrations |
| [docs/SECURITY.md](docs/SECURITY.md) | Security notes |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel + Neon deploy |

## What’s in Phase 1–4

- Company self-registration + Super Admin provisioning
- Login / logout / password reset hooks
- Employee invitations + membership activate/disable
- Departments, roles/permissions, company settings
- Company switcher, audit + notification writes
- Super Admin tenant/subscription controls

## Deferred (later phases)

Expense/PO engines, budgets, full marketing site, payments, lead CRM.
