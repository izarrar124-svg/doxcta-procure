import React from "react";
export const Textarea = React.forwardRef(function Textarea({ className = "", style, ...rest }, ref) {
  return <textarea ref={ref} className={"dx-textarea " + className} style={style} {...rest} />;
});
