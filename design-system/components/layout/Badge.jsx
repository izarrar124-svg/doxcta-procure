import React from "react";
export function Badge({ children, variant = "default", style, ...rest }) {
  return (
    <span className={"dx-badge dx-badge-" + variant} style={style} {...rest}>
      {children}
    </span>
  );
}
