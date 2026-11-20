import React from "react";
export const Button = React.forwardRef(function Button({ children, variant = "primary", size = "md", className = "", as: Tag = "button", style, ...rest }, ref) {
  return (
    <Tag ref={ref} className={"dx-btn dx-btn-" + variant + " dx-btn-" + size + " " + className} style={style} {...rest}>
      {children}
    </Tag>
  );
});
