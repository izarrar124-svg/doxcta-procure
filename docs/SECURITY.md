# Security — Phase 1–4

## Implemented

- Password hashing via Better Auth (never plain text)
- HTTP-only session cookies (`nextCookies` plugin)
- Server-side membership and permission checks
- Suspended company hard-stop on membership routes
- Invitation email must match accept form email
- Audit log writes for provisioning, invites, status changes (no secrets logged)
- Env-based secrets (`.env.example` placeholders only)

## Required before production traffic

- Set strong `BETTER_AUTH_SECRET`
- Enable Resend (or equivalent) for reset/invite emails
- Turn on Neon backups
- Disable Vercel Deployment Protection SSO for public marketing pages when ready
- Add rate limiting on auth/register endpoints (Phase 12 hardening)
- Add RLS policies mirroring app guards (optional defense-in-depth; app guards remain mandatory)

## Explicit non-goals this cut

- Payment card handling
- File upload virus scanning
- Full marketing spam protection stack
