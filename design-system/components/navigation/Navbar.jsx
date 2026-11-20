import React, { useState } from "react";
import { Logo } from "../layout/Logo.jsx";
import { Button } from "../ui/Button.jsx";

export function Navbar({ links = [], activeHref, ctaLabel = "Book a Discovery Call" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      borderBottom: "1px solid var(--border-default)",
      background: "rgba(7,17,13,.85)",
      backdropFilter: "blur(12px)",
    }}>
      <nav style={{ margin: "0 auto", display: "flex", height: 76, maxWidth: "80rem", alignItems: "center", gap: 16, padding: "0 24px" }}>
        <Logo size="md" />
        <ul style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: 4, listStyle: "none", margin: 0, padding: 0 }}>
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="dx-navlink" style={{ background: activeHref === l.href ? "rgba(255,255,255,.06)" : undefined, color: activeHref === l.href ? "var(--text-primary)" : undefined }}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Button size="md" style={{ flexShrink: 0 }}>{ctaLabel}</Button>
        <button type="button" aria-label="Toggle menu" onClick={() => setMobileOpen((v) => !v)} style={{ display: "none", background: "none", border: "none", cursor: "pointer" }}>☰</button>
      </nav>
    </header>
  );
}
