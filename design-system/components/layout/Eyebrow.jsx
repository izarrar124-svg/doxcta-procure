import React from "react";
export function Eyebrow({ children, light = false, style, ...rest }) {
  return (
    <p className={"dx-eyebrow" + (light ? " light" : "")} style={style} {...rest}>
      {children}
    </p>
  );
}
