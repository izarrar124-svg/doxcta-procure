import React from "react";
const sizeStyle = {
  display: { fontSize: "clamp(2.75rem,7vw,5rem)", lineHeight: 0.98, fontWeight: 700, letterSpacing: "-0.03em" },
  h1: { fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1.04, fontWeight: 700, letterSpacing: "-0.02em" },
  h2: { fontSize: "clamp(1.5rem,3vw,2.125rem)", lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.01em" },
  h3: { fontSize: "1.375rem", lineHeight: 1.3, fontWeight: 600 },
};
export function Heading({ children, as: Tag = "h2", size = "h2", lowercase = true, style, ...rest }) {
  return (
    <Tag style={{ margin: 0, fontFamily: "var(--font-display)", color: "var(--text-primary)", textTransform: lowercase ? "lowercase" : "none", ...sizeStyle[size], ...style }} {...rest}>
      {children}
    </Tag>
  );
}
