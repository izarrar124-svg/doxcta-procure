# Security — Doxcta AI MVP

## Controls implemented

- HTTPS (Vercel)
- Better Auth password hashing + session cookies
- RBAC permission keys on server actions/routes
- Organization isolation via membership checks
- Append-only `audit_logs` for financial and admin events
- Vendor bank fields gated by `vendors.bank_view`
- File type/size validation on invoice upload
- Idempotency keys on expense create and payment record
- Plan invoice quotas via `usage_records`
- Optional Postgres RLS (`app/sql/rls.sql`)
- AI assistant: tool-calling over verified aggregates only

## Secrets

Never commit `.env`. Required production secrets: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`. Recommended: `OPENAI_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, Stripe keys.

## Compliance posture

Security controls support GDPR/PDPL readiness work; do **not** claim SOC 2 or tax-compliance certification from these controls alone.
