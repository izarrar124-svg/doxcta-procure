import React from "react";
export function Callout({ children, variant = "default", style, ...rest }) {
  return (
    <div className={"dx-callout" + (variant === "green" ? " dx-callout-green" : "")} style={style} {...rest}>
      {children}
    </div>
  );
}
