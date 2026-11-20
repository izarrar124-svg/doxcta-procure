# Xorora Procure — product map

Authoritative live capture: [`procure-live-capture-2026-11-21.md`](./procure-live-capture-2026-11-21.md)  
Screenshots: [`screen-gallery/`](./screen-gallery/) (`01-dashboard.png` … `17-spend-chat.png`)

## Stack signals

| Signal | Observation |
|---|---|
| Frontend | React SPA, Vite-hashed assets, code-split routes |
| Data | TanStack Query |
| API | `https://xorora-procure-api.vercel.app/api/v1` |
| Auth storage keys (names only) | `xorora_access_token`, `xorora_refresh_token`, `xorora_user` |
| Currency | PKR (+ USD in reports via org FX, observed 278) |

Confirmed calls: `POST /auth/login`, `GET /analytics/dashboard`, `GET /requests` (+ detail). Broader admin/expense paths inferred from UI.

## Canonical routes

```
/dashboard
/requests
/requests/:id
/approvals
/procurement
/procurement/expenses   ← sidebar “Expenses” (bare /expenses → dashboard in live)
/analytics
/reports
/notifications
/admin/users
/admin/departments
/admin/roles
/admin/categories
/admin/vendors
/admin/workflows
/admin/settings
```

## Status enums (live)

`DRAFT` | `PENDING_APPROVAL` | `RETURNED` | `REJECTED` | `APPROVED` | `IN_PROCUREMENT` | `COMPLETED`

Priority: `LOW` | `MEDIUM` | `HIGH`

## Workflow

1. Submit request → Pending Approval (Default: Dept Head → CEO → Procurement)
2. Approved → Procurement queue (`IN_PROCUREMENT`)
3. Purchase / sheet sync → Completed + Expenses log
4. Surfaces in dashboard, analytics, reports; spend assistant over ledger

## Brand note for rebuild

Live: light surfaces, indigo/orange. Rebuild: Doxcta dark + acid lime — same IA.
