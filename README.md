# Doxcta Procure

Reverse-engineered rebuild of [Xorora Procure](https://procure.xorora.com/dashboard), restyled with the **Doxcta** design system.

## Layout

| Path | Contents |
|---|---|
| `app/` | Vite + React + TypeScript rebuild |
| `design-system/` | Extracted Doxcta design system |
| `tools/rea/` | Reverse Engineer Anything toolkit (reference) |
| `docs/procure-live-capture-2026-11-21.md` | Full live capture report |
| `docs/product-map.md` | Condensed IA + routes |
| `docs/rebuild-spec.md` | Rebuild contracts and screen map |
| `docs/parity-gaps.md` | Known differences vs live |
| `docs/screen-gallery/` | Capture screenshots (`01`–`17`) |

## Run the app

```bash
cd app
npm install
npm run dev
```

Open http://127.0.0.1:5173 — sign in with any work email (mock auth).

## Capture notes

Primary capture used the Cursor browser against the live authenticated session. Confirmed API host: `xorora-procure-api.vercel.app/api/v1`. Authenticated response bodies were not retained.
