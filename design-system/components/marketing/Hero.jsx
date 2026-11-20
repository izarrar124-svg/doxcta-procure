import React from "react";
import { Eyebrow } from "../layout/Eyebrow.jsx";
import { BrandDiamond } from "../brand/BrandDiamond.jsx";
import { Button } from "../ui/Button.jsx";

export function Hero({ eyebrow = "Executive Operations Partner", titleLead = "your inbox shouldn't ", titleAccent = "run your day.", description, trustPoints = [], primaryLabel = "Book a Discovery Call", secondaryLabel = "See How We Work" }) {
  return (
    <section className="dx-atmosphere" style={{ position: "relative", overflow: "hidden", padding: "112px 24px", color: "var(--text-primary)" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%,black,transparent)" }} />
      <div style={{ position: "relative", maxWidth: 680 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BrandDiamond style={{ background: "var(--color-lime-500)" }} />
          <Eyebrow light>{eyebrow}</Eyebrow>
        </div>
        <h1 style={{ marginTop: 28, fontFamily: "var(--font-display)", fontWeight: 700, textTransform: "lowercase", lineHeight: 0.98, letterSpacing: "-0.03em", fontSize: "clamp(2.75rem,7vw,5rem)" }}>
          {titleLead}
          <span style={{ background: "linear-gradient(90deg,var(--color-lime-300),var(--color-lime-500))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{titleAccent}</span>
        </h1>
        {description && <p style={{ marginTop: 24, maxWidth: 540, fontSize: "1.1875rem", lineHeight: 1.7, color: "var(--text-muted)" }}>{description}</p>}
        <div style={{ marginTop: 44, display: "flex", flexWrap: "wrap", gap: 16 }}>
          <Button variant="primary" size="xl">{primaryLabel}</Button>
          <Button variant="secondary" size="xl">{secondaryLabel}</Button>
        </div>
        {trustPoints.length > 0 && (
          <ul style={{ marginTop: 44, display: "flex", flexWrap: "wrap", gap: "12px 32px", listStyle: "none", padding: 0, borderTop: "1px solid var(--border-default)", paddingTop: 32 }}>
            {trustPoints.map((label) => (
              <li key={label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1rem", fontWeight: 500, color: "var(--text-muted)" }}>
                <span style={{ display: "flex", width: 20, height: 20, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(184,255,61,.15)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-lime-500)" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
