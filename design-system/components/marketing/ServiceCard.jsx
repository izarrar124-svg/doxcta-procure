import React from "react";
import { IconWrapper } from "../layout/IconWrapper.jsx";
import { Heading } from "../layout/Heading.jsx";
import { Text } from "../layout/Text.jsx";

export function ServiceCard({ slug, title, shortDescription, icon, index = 0 }) {
  return (
    <a href={"/services/" + slug} className="dx-card">
      <span className="dx-card-index">{String(index + 1).padStart(2, "0")}</span>
      <div className="dx-card-topbar" />
      <IconWrapper variant="green" size="lg">{icon}</IconWrapper>
      <Heading as="h3" size="h2" style={{ marginTop: 22 }}>{title.toLowerCase()}</Heading>
      <Text muted size="large" style={{ marginTop: 12 }}>{shortDescription}</Text>
      <span style={{ marginTop: 26, display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-lime-500)" }}>
        Learn more
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </span>
    </a>
  );
}
