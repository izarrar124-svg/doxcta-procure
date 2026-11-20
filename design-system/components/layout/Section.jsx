import React from "react";
import { Container } from "./Container.jsx";
const bg = {
  light: { background: "var(--surface-page)" },
  muted: { background: "var(--surface-card)" },
  cream: { background: "var(--surface-paper)", color: "var(--text-on-paper)" },
  green: { background: "var(--surface-page)", backgroundImage: "radial-gradient(ellipse 70% 60% at 50% 0%,rgba(184,255,61,0.08),transparent 60%)" },
  navy: { background: "var(--surface-page)" },
};
export function Section({ children, variant = "light", containerSize = "lg", className = "", style, ...rest }) {
  const isAtmosphere = variant === "navy";
  return (
    <section className={isAtmosphere ? "dx-atmosphere " + className : className} style={{ paddingBlock: "96px", ...bg[variant], ...style }} {...rest}>
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}
