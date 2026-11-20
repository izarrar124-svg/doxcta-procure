import React from "react";
import { Logo } from "../layout/Logo.jsx";
import { Mono } from "../layout/Mono.jsx";
import { BrandDiamond } from "../brand/BrandDiamond.jsx";

export function Footer({ columns = [], legalLinks = [] }) {
  return (
    <footer className="dx-atmosphere" style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-primary)", padding: "72px 24px" }}>
      <div className="dx-footer-grid" style={{ margin: "0 auto", maxWidth: "80rem", display: "grid", gap: 48 }}>
        <div style={{ gridColumn: "span 2" }}>
          <Logo size="md" />
          <Mono style={{ marginTop: 18, display: "block", color: "var(--color-lime-300)" }}>Executive operations partner</Mono>
          <p style={{ marginTop: 12, maxWidth: 320, fontSize: "1.0625rem", lineHeight: 1.65, color: "var(--text-muted)" }}>
            Executive operations for founders and growing businesses. We manage the work that keeps you from the work that matters.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-eyebrow-size)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-lime-500)" }}>{col.title}</h3>
            <ul style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
              {col.links.map((l) => (
                <li key={col.title + l.label}><a href={l.href} className="dx-footer-link">{l.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ margin: "56px auto 0", maxWidth: "80rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, borderTop: "1px solid var(--border-default)", paddingTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-bone-faint)" }}>© 2026 doxcta. All rights reserved.</p>
          <BrandDiamond style={{ background: "var(--color-lime-500)", opacity: 0.8 }} />
        </div>
        <ul style={{ display: "flex", gap: 24, listStyle: "none", margin: 0, padding: 0 }}>
          {legalLinks.map((l) => (
            <li key={l.label}><a href={l.href} style={{ fontSize: "0.875rem", color: "var(--color-bone-faint)", textDecoration: "none" }}>{l.label}</a></li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
