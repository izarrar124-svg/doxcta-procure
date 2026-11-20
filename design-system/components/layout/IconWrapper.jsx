import React from "react";
export function IconWrapper({ children, size = "md", variant = "default", style, ...rest }) {
  return (
    <div className={"dx-icon-wrap dx-icon-" + size + " dx-icon-" + variant} style={style} {...rest}>
      {children}
    </div>
  );
}
