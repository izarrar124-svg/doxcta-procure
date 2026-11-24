# Deployment — Doxcta AI MVP

## Vercel + Neon

1. Set env vars from `app/.env.example`
2. `cd app && npm run db:push && npm run db:seed`
3. Deploy the `app/` project to Vercel
4. Configure `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` to the production host
5. Optionally add Vercel Blob, OpenAI, Resend, Stripe

## Production checklist

- [ ] Neon `DATABASE_URL` connected
- [ ] Super Admin seeded
- [ ] Email verification/reset working (or console fallback accepted for pilot)
- [ ] OpenAI key for live extraction (mock works for demos)
- [ ] Blob token for durable invoice files
- [ ] Stripe prices mapped for paid plans (dev activates plan without Stripe)
- [ ] Optional RLS applied
- [ ] Backups enabled on Neon
- [ ] Cross-tenant isolation smoke test

## Local

```bash
cd app
cp .env.example .env.local
npm install
npm run db:push
npm run db:seed
npm run dev
```
