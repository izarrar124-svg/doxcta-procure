import React from "react";
export function BrandDot({ style, ...rest }) {
  return <span aria-hidden="true" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", ...style }} {...rest} />;
}
