import React from "react";
export function Label({ children, style, ...rest }) {
  return <label className="dx-label" style={style} {...rest}>{children}</label>;
}
