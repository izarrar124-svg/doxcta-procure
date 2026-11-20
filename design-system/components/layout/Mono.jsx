import React from "react";
export function Mono({ children, as: Tag = "span", style, ...rest }) {
  return (
    <Tag className="dx-mono" style={style} {...rest}>
      {children}
    </Tag>
  );
}
