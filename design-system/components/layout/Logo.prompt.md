Renders the Doxcta lockup (or mark) at 34px tall, picking artwork by background.

**Critical:** the source repo's asset names do not match their colors (`logo-lockup-green.png` is the black artwork; `logo-lockup-ink.png` is the white+green artwork), which is how the nav logo ended up invisible. This system ships generated, unambiguous PNGs — `doxcta-lockup-dark.png`, `doxcta-lockup-light.png`, `doxcta-mark-dark.png`, `doxcta-mark-light.png` — with the legacy "DIGITAL SOLUTIONS" tagline cropped off. Always use these, and always confirm the mark is visible on the surface you place it on.

```jsx
<Logo />                        {/* dark canvas, full lockup — default */}
<Logo size="sm" />              {/* dark canvas, chevron mark only */}
<Logo theme="light" />          {/* bone "paper" surface */}
```
Never redraw or reconstruct the mark — always render these PNGs.
