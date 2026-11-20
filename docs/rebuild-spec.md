# Doxcta Procure — rebuild spec

Source of truth for live parity: [`procure-live-capture-2026-11-21.md`](./procure-live-capture-2026-11-21.md).  
App root: [`../app`](../app).

## Stack

Vite + React 19 + TypeScript + React Router 7 + Tailwind 4 + Doxcta tokens.

## Route parity (aligned)

Rebuild now mirrors live canonical paths:

| Area | Route |
|---|---|
| Expenses | `/procurement/expenses` |
| Admin | `/admin/users` … `/admin/settings` |
| Soft redirects | `/expenses`, `/users`, … → canonical |

## Domain

Statuses (display labels): Draft, Pending Approval, Returned, Rejected, Approved, In Procurement, Completed.

Default workflow fixture: Department Head → CEO → Procurement Officer.  
Second workflow: Director → Procurement Officer.

Expense columns: Number, Date, Description, Department, Category, Vendor, Amount, Source.

Settings: org name, currency, FX rate, fiscal year start, approval reminder days.

## Mock data

[`../app/src/data/types.ts`](../app/src/data/types.ts), [`../app/src/data/mock.ts`](../app/src/data/mock.ts).

## Run

```bash
cd app
npm install
npm run dev
```
