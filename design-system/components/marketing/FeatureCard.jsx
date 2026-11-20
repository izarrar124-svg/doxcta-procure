import React from "react";
import { IconWrapper } from "../layout/IconWrapper.jsx";
import { Heading } from "../layout/Heading.jsx";
import { Text } from "../layout/Text.jsx";
import { BrandDot } from "../brand/BrandDot.jsx";

export function FeatureCard({ icon, title, description, href, index = 0, style }) {
  const Tag = href ? "a" : "div";
  return (
    <Tag href={href} className="dx-card" style={style}>
      <div className="dx-card-topbar" />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <IconWrapper variant="green" size="lg">{icon}</IconWrapper>
        <span className="dx-card-index" style={{ position: "static" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <Heading as="h3" size="h2" style={{ marginTop: 22 }}>{title}</Heading>
      {description && <Text muted size="large" style={{ marginTop: 12 }}>{description}</Text>}
      {href && (
        <span style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-small-size)", fontWeight: 600, color: "var(--color-lime-500)" }}>
          Explore <BrandDot style={{ width: 6, height: 6, background: "var(--color-lime-500)" }} />
        </span>
      )}
    </Tag>
  );
}
