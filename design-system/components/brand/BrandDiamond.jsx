import React from "react";
export function BrandDiamond({ style, ...rest }) {
  return <span aria-hidden="true" style={{ display: "inline-block", width: 8, height: 8, transform: "rotate(45deg)", background: "var(--accent)", ...style }} {...rest} />;
}
