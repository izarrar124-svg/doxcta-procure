# Deployment — Doxcta Procure

## Targets

- GitHub: https://github.com/izarrar124-svg/doxcta-procure
- Vercel project: `doxcta-procure` (root directory: `app`)
- Production URL: https://doxcta-procure.vercel.app

## Cutover checklist (Vite → Next.js)

1. Create a Neon project and copy the connection string.
2. In Vercel → Project → Settings → Environment Variables, set:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET` (long random)
   - `BETTER_AUTH_URL` = `https://doxcta-procure.vercel.app`
   - `NEXT_PUBLIC_APP_URL` = same
   - Optional: `RESEND_API_KEY`, `EMAIL_FROM`
3. Redeploy from `main`.
4. From a trusted machine with `DATABASE_URL`:
   ```bash
   cd app
   npm run db:push
   SUPER_ADMIN_EMAIL=... SUPER_ADMIN_PASSWORD=... npm run db:seed
   ```
5. Verify `/register`, `/login`, `/dashboard`, `/super-admin`.
6. Optionally disable Vercel Authentication under Deployment Protection for public access.

## Staging

Create a second Vercel environment + Neon branch. Never run destructive resets against production.

## Rollback

Previous Vite SPA commits remain in git history. Prefer forward-fix for schema; avoid dropping tenant tables.
