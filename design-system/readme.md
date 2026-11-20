# Doxcta Design System

Doxcta is a premium **Executive Operations** partner for founders and growing businesses — managing inbox, calendar, meetings, CRM, and administrative workflows through documented systems and trained professionals, so founders spend their time on decisions instead of tasks. The company repositioned in 2026 from a general digital marketing/web agency ("dox‑cta: digital solutions") into this focused operations-partner model; this design system reflects that current, live positioning.

There is one product surface: **doxcta.com**, a Next.js marketing site whose primary goal is converting visitors into booked discovery calls (Calendly + a contact form). It is not a SaaS app — no login, dashboard, or client portal exists yet (explicitly out of scope for v1).

## Sources

This system was built by reading the live, connected codebase, not screenshots:

- **GitHub repo:** [zarrar124/Doxcta_web](https://github.com/zarrar124/Doxcta_web) (`main` branch) — a Next.js 15 + Tailwind 4 + shadcn/ui site. Explore `doxcta_docs/` for the project's own product/brand documentation, `src/styles/globals.css` for the full token set, and `src/components/` for every source component. **If you have access, read this repo before extending the system** — it is more detailed than this folder in places (Framer Motion variants, full page compositions, SEO/JSON-LD helpers).
- **Uploaded brand files:** `doxcta_Brand_Guidelines.pdf` and ~30 raw logo export files (`New docxta logo-*.jpg`), the source material behind `public/brand/` in the repo.

Note: an earlier round of project notes described a dark indigo/purple/cyan "SaaS" aesthetic for Doxcta. That direction is **not** reflected anywhere in the live repo — the repo's own `doxcta_docs/06-xorora-design-reference.md` explicitly records that indigo and tangerine were evaluated and rejected in favor of the current brand green (`#8BBE47`) on a light/navy palette. The first pass of this system followed the live codebase exactly.

**Update — deliberate visual redesign.** At the client's request, this system has since moved past a literal 1:1 mirror of the current light/white marketing site. The live site's green-on-white palette read as a generic "digital marketing agency," not the world-class technology company Doxcta wants to become — so this system is now **dark-first**, keeps brand green only as a heritage/secondary accent, and introduces an acid-lime primary accent plus a bolder display/body type pairing. See Visual foundations below for the new system in full; treat it as the design target for new work, ahead of the live site's current light theme.

## Content fundamentals

**Voice:** calm, concrete, and process-driven. Doxcta explicitly avoids "flashy marketing language or exaggerated claims" (project brief). Sentences are short and matter-of-fact — "No pitch deck. Just an honest assessment of fit." Copy states what Doxcta does and doesn't do in plain contrast lists (see "We are / We are not" on the About page) rather than adjectives.

**Casing:** headlines and section titles are **lowercase by brand rule** (`your inbox shouldn't run your day.`, `a partner who owns the ops. not another hire to manage.`). Eyebrows/labels are the opposite — uppercase with wide letter-spacing (`THE PROBLEM`, `EXECUTIVE OPERATIONS PARTNER`). Body copy uses normal sentence case.

**Person:** mostly second person ("you," "your inbox," "your decisions stay yours") describing the founder's experience; "we" for Doxcta's actions ("we handle," "we manage").

**No emoji, ever.** Iconography (Lucide) carries visual meaning instead.

**Structure:** copy favors short declarative fragments over full marketing paragraphs, e.g. proof-strip stats ("6 core workflows," "2 wks typical onboarding," "1 operations partner") and pricing tiers that lead with an ideal-customer line, not a feature dump.

**Numbers as evidence, not decoration:** "150+ projects" style stats appear sparingly and always tied to a concrete claim (workflow count, onboarding time), not vanity metrics.

## Visual foundations (current — dark-first redesign)

**Color:** the canvas is near-black, warm-toned green-black (`--color-bg-0 #07110D`), never pure neutral black — it reads as "deep forest at night," not "OLED dark mode." The single primary accent is an acid lime (`--color-lime-500 #B8FF3D`), used deliberately sparingly — CTAs, links, active states, key numerals — so it stays electric instead of everywhere. Text sits in warm "bone" off-white (`#F3F1EA`), never pure white. The original brand green (`#8BBE47`) is demoted to a heritage/secondary accent — it still lives in the logo and one or two quiet details, a intentional thread back to the existing brand, but no longer carries the palette. One light "paper" section variant (bone background, ink text) exists for occasional high-contrast breaks — used sparingly, not as a second base theme.

**Backgrounds:** almost entirely the deep bg-0/bg-1/bg-2 surface ramp — card surfaces sit one or two steps lighter than the page for depth without borders doing all the work. The signature "hero-atmosphere" treatment carries over from the original brand: a radial lime bloom top-left plus a faint heritage-green bloom bottom-right, over the near-black base, used on the hero, footer, and dark CTA blocks. A faint pixel-grid overlay adds texture to the hero only.

**Gradients:** restrained and purposeful — a lime text-gradient (`lime-300 → lime-500`, `background-clip: text`) on hero headline accent phrases, plus the hero-atmosphere's two soft radial blooms. No gradient buttons, no gradient borders, no decorative gradient meshes.

**Typography:** a bolder, more distinctive two-font system — **Bricolage Grotesque** for all display/heading type (a characterful variable grotesque, not another Inter/Poppins default) paired with **Hanken Grotesk** for body copy, plus **JetBrains Mono** retained for metrics, eyebrows, and technical labels. Display type is very tight (0.98 line-height, -0.03em tracking) and confident (weight 700).

**Spacing:** generous section padding (~96–112px vertical), card padding 32–36px, consistent 24px grid gaps. Radii stepped up slightly for a more premium-tech feel: 10px buttons/inputs, 20px cards, full pill for badges.

**Shadows:** cards use a soft ambient shadow at rest and a lime-tinted glow on hover (`0 24px 60px rgba(184,255,61,0.18)`); highlighted elements (the featured pricing tier) get a defined lime ring-glow (`--shadow-glow`) rather than a heavier border.

**Borders:** subtle 1px hairlines at ~8% white opacity at rest, brightening to lime on hover/focus — borders read as light catching an edge, not hard lines.

**Animation:** still understated in spirit but slightly snappier (180ms UI, cubic-bezier ease) — cards lift 6px and gain a lime glow on hover, primary buttons lift 2px and lighten rather than just scaling. No bounce, no spring overshoot; reduced-motion still respected.

**Hover/press states:** primary buttons lighten to `lime-300` and lift; secondary/ghost buttons brighten their surface and border to lime; press scales to 0.97. Card top-edge accent bars fade in as a lime-to-transparent gradient line rather than a solid bar.

**Cards:** dark surface fill, 1px hairline border, 20px radius, ambient shadow, a thin lime gradient top-edge line that grows in on hover, and small numbered mono index badges in the corner — same numbered-grid language as before, restyled for dark.

**Transparency & blur:** the nav is a blurred near-black glass header at all scroll positions (no more light/dark state swap); rgba overlays remain inside the hero-atmosphere and mobile drawer scrim.

**Imagery:** still none supplied for the marketing site itself — everything remains copy + icon + card driven, now on the dark canvas. The uploaded LinkedIn cover asset (light, monochrome map) is unchanged and kept as historical reference.

## Iconography

Doxcta's live codebase uses **Lucide** (`lucide-react`) exclusively — no icon font, no custom SVG set, no emoji. Icons sit inside a rounded-square `IconWrapper` tile (default gray, green, or dark-on-navy tint) at 20–28px. This design system does not bundle Lucide's source; components accept an icon as a `children`/`icon` prop (any rendered node) so you can bring your own. For quick prototyping, load Lucide from CDN:

```html
<script src="https://unpkg.com/lucide@latest"></script>
<!-- then: <i data-lucide="mail"></i> ... lucide.createIcons() -->
```

Icons referenced across services/industries content: `Mail, Calendar, Briefcase, Users, Database, Headphones, Rocket, Megaphone, Lightbulb, Cloud, Heart, Scale, Shield, FileText, Clock, CheckCircle, Layers, ArrowRight, ChevronDown, Menu, X, Check, Phone, Search, Settings, Zap, Bell, MessageSquare, Award, ListChecks, Handshake, Presentation`.

## Assets

`assets/logos/` — **use these four generated PNGs.** The raw repo exports are misnamed (`logo-lockup-green.png` is the *black* artwork; `logo-lockup-ink.png` is the *white+green* artwork), which is exactly how the nav logo ended up invisible on a dark bar. These copies are unambiguous, tightly cropped, transparent, and have the legacy "DIGITAL SOLUTIONS" tagline removed:
- `doxcta-lockup-dark.png` — bone "dox" + green "cta." + green/bone chevron, for the dark canvas
- `doxcta-lockup-light.png` — ink "dox" + green "cta." + green/ink chevron, for the bone "paper" surface
- `doxcta-mark-dark.png` / `doxcta-mark-light.png` — chevron mark only, same two surfaces

Original repo exports are retained for reference only (`logo-lockup-*.png`, `logo-full-*.jpg`, `logo-mark-*.jpg`, `logo-wordmark-*.png`, `og-image.jpg`) — **verify visibility before using any of them directly.**

`assets/logos/legacy/` — two original tagline'd exports ("DIGITAL SOLUTIONS", "DIGI MARKETING") kept only as brand-history reference. **Do not use these** — current web assets are wordmark-only per the Executive Operations repositioning.

`assets/imagery/linkedin-cover.jpg` — the one supplied full-bleed image asset (employee LinkedIn cover, world-map silhouette).

The brand mark is a green/black chevron ("›" arrow shape) followed by the lowercase wordmark "doxcta." — never redraw or approximate this mark; always render the supplied files.

## Components

30 components, grouped by concern, each with a matching `.d.ts` prop contract and `.prompt.md` usage note:

**Layout & typography** (`components/layout/`) — Container, Grid, Section, Heading, Text, Eyebrow, Badge, IconWrapper, Mono, Logo
**Brand motifs** (`components/brand/`) — BrandDot, BrandDiamond, DashedTrail, AccentBlob
**Form & interactive** (`components/ui/`) — Button, Input, Textarea, Label, Accordion
**Marketing** (`components/marketing/`) — FeatureCard, ServiceCard, PricingCard, Callout, CTABlock, FAQ, Timeline, Hero
**Navigation** (`components/navigation/`) — Navbar, Footer
**Forms** (`components/forms/`) — ContactForm

**Intentional additions:** none beyond the repo's own component inventory (`doxcta_docs/03-component-inventory.md`). Omitted on purpose: `CalendlyLink`/`CalendlyEmbed` (thin wrapper around a third-party embed, no visual identity of its own — use Button + your Calendly URL) and `JsonLd` (SEO markup, not a visual component).

## Foundations

`guidelines/` — specimen cards for the Design System tab: `colors-*.html` (green ramp, neutrals, navy/semantic, hero-atmosphere), `type-*.html` (display/h1, h2/h3/body, eyebrow/mono), `spacing-*.html` (radii, spacing scale, shadows), `brand-*.html` (logo lockups, marks, legacy versions).

## Index

- `styles.css` — root stylesheet, imports every token file and the shared component stylesheet
- `tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css` — CSS custom properties
- `components/components.css` — shared hover/interaction styles (`.dx-*` classes) backing the React components
- `components/<group>/` — the 30 components described above
- `assets/` — logos and imagery
- `guidelines/` — foundation specimen cards
- `SKILL.md` — Claude Code / Agent Skills-compatible entry point

## Caveats — please help me iterate

- **Hero visual:** the live site's hero includes an animated particle/orb background and a hand-built desktop "ops dashboard" illustration (`HeroVisualDesktop`, `HeroBackgroundLazy`). I simplified `Hero` to the atmosphere gradient + copy + CTAs and left out that bespoke visual — if you want it recreated, point me at the component source or describe what it should show.
- **Fonts:** Montserrat and JetBrains Mono are loaded via a Google Fonts `@import` in `tokens/typography.css` rather than self-hosted `@font-face` files (the repo uses `next/font/google`, which self-hosts at build time — not reproducible outside Next.js). Functionally identical; flag if you'd rather have the actual woff2 files vendored in.
- **Icons:** components are icon-agnostic (accept any node) rather than bundling Lucide, since this environment has no npm/bundler step. Fine for prototyping via the CDN script above; production use should install `lucide-react` properly.
- The repo has substantially more page-level detail (full page compositions, motion variants, SEO helpers, MDX resources) than this system captures — worth a deeper pass if you're building out full page recreations rather than working component-by-component.
- **This redesign is a deliberate departure from the live site.** doxcta.com today is still the light green/white theme described in the earlier section of this readme. If you want the live site rebuilt to match this new dark/lime direction, or want this treated as a proposal to show alongside the current site rather than a replacement, say so — I can keep both documented side by side.
- Bricolage Grotesque and Hanken Grotesk are loaded via Google Fonts `@import`, same caveat as before — flag if you want self-hosted files.
- The `Navbar` no longer has a light/overlay toggle (it's the same dark glass treatment everywhere) — let me know if any page in this new direction still needs a light nav.
