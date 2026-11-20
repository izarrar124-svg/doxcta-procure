import React from "react";
import { Heading } from "../layout/Heading.jsx";
import { Text } from "../layout/Text.jsx";
import { Badge } from "../layout/Badge.jsx";
import { Button } from "../ui/Button.jsx";

export function PricingCard({ name, description, price, priceNote, idealFor, features, highlighted = false, index = 0 }) {
  return (
    <div className={"dx-pricing-card" + (highlighted ? " highlighted" : "")}>
      <div style={{ position: "absolute", insetInline: 0, top: 0, height: 2, background: "linear-gradient(90deg,var(--color-lime-500),transparent)", transform: highlighted ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left" }} />
      <span style={{ position: "absolute", right: 24, top: 24, fontFamily: "var(--font-mono)", fontSize: "var(--text-eyebrow-size)", fontWeight: 600, color: "var(--color-bone-faint)" }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      {highlighted && <Badge variant="green">Most popular</Badge>}
      <Heading as="h3" size="h2" style={{ marginTop: highlighted ? 14 : 0 }}>{name.toLowerCase()}</Heading>
      <Text muted style={{ marginTop: 8 }}>{description}</Text>
      <p style={{ marginTop: 16, fontSize: "0.875rem", fontWeight: 600, color: "var(--color-lime-500)" }}>{idealFor}</p>
      <div style={{ marginTop: 26, borderTop: "1px solid var(--border-default)", paddingTop: 26 }}>
        {price ? (
          <p style={{ fontSize: "var(--text-h1-size)", fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>{price}</p>
        ) : (
          <p style={{ fontSize: "var(--text-h3-size)", fontWeight: 600, margin: 0, color: highlighted ? "var(--color-lime-300)" : "var(--text-muted)" }}>{priceNote}</p>
        )}
        {!price && <p style={{ marginTop: 4, fontSize: "0.875rem", color: "var(--color-bone-faint)" }}>Exact pricing on discovery call</p>}
      </div>
      <ul style={{ marginTop: 26, flex: 1, listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "1.0625rem", color: "var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-lime-500)" strokeWidth="2" style={{ marginTop: 3, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
            {f}
          </li>
        ))}
      </ul>
      <Button variant={highlighted ? "primary" : "secondary"} style={{ marginTop: 32, width: "100%" }}>
        {highlighted ? "Book a Discovery Call" : "Get pricing"}
      </Button>
    </div>
  );
}
