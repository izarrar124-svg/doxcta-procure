import React from "react";
import { Heading } from "../layout/Heading.jsx";
import { Text } from "../layout/Text.jsx";
import { Button } from "../ui/Button.jsx";

export function CTABlock({ eyebrow, title, description, primaryLabel = "Book a Discovery Call", secondaryLabel = "See How We Work", variant = "light" }) {
  const isDark = variant === "dark";
  return (
    <div className={"dx-cta-block " + variant + (isDark ? " dx-atmosphere" : "")}>
      {eyebrow && <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-eyebrow-size)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-lime-500)" }}>{eyebrow}</p>}
      <Heading as="h2" size="h1" style={{ marginTop: 14, maxWidth: 640 }}>{title}</Heading>
      {description && <Text size="large" muted style={{ marginTop: 20, maxWidth: 560 }}>{description}</Text>}
      <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 16 }}>
        <Button variant="primary" size="lg">{primaryLabel}</Button>
        <Button variant="secondary" size="lg">{secondaryLabel}</Button>
      </div>
    </div>
  );
}
