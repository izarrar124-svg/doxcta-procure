import React from "react";
const sizes = { sm: "48rem", md: "64rem", lg: "80rem", full: "100%" };
export function Container({ children, size = "lg", style, ...rest }) {
  return (
    <div style={{ marginInline: "auto", width: "100%", maxWidth: sizes[size], paddingInline: "24px", ...style }} {...rest}>
      {children}
    </div>
  );
}
