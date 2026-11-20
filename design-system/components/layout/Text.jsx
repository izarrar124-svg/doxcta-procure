import React from "react";
const sizeStyle = {
  body: { fontSize: "1.0625rem", lineHeight: 1.65 },
  large: { fontSize: "1.125rem", lineHeight: 1.7 },
  small: { fontSize: "0.875rem", lineHeight: 1.4, letterSpacing: "0.01em" },
};
export function Text({ children, as: Tag = "p", size = "body", muted = false, style, ...rest }) {
  return (
    <Tag style={{ margin: 0, fontFamily: "var(--font-sans)", color: muted ? "var(--text-muted)" : "var(--text-primary)", ...sizeStyle[size], ...style }} {...rest}>
      {children}
    </Tag>
  );
}
