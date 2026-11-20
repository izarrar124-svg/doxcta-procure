import React from "react";
export const Input = React.forwardRef(function Input({ className = "", style, ...rest }, ref) {
  return <input ref={ref} className={"dx-input " + className} style={style} {...rest} />;
});
