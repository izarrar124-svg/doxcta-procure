repo: zarrar124/Doxcta_web
branch: main
## Last sync
date: 2026-08-07T20:49:06Z
### Updated in this project
- Initial design system build: tokens, components, and foundation cards derived from the live Doxcta_web Next.js codebase
- Component inventory (30 components across layout, brand, ui, marketing, navigation, forms) matches `doxcta_docs/03-component-inventory.md`
- Colors, type scale, radii, shadows, and the hero-atmosphere gradient copied verbatim from `src/styles/globals.css`
## Screen map
| Design system area | Repo source |
|---|---|
| tokens/colors.css, tokens/typography.css, tokens/spacing.css | src/styles/globals.css |
| components/layout/* | src/components/layout/*.tsx |
| components/ui/* | src/components/ui/*.tsx |
| components/marketing/* | src/components/marketing/*.tsx |
| components/brand/* | src/components/brand/brand-motifs.tsx |
| components/navigation/* | src/components/layout/navbar.tsx, footer.tsx |
| components/forms/ContactForm | src/components/forms/contact-form.tsx |
| assets/logos/* | public/brand/*, src/lib/brand-assets.ts |
| readme.md content fundamentals / voice | src/content/site-content.ts, doxcta_docs/00-project-overview-v1.0.md |
