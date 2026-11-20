import React from "react";
const colsMap = { 1: "1fr", 2: "repeat(auto-fit,minmax(260px,1fr))", 3: "repeat(auto-fit,minmax(260px,1fr))", 4: "repeat(auto-fit,minmax(220px,1fr))" };
export function Grid({ children, cols = 3, style, ...rest }) {
  return (
    <div style={{ display: "grid", gap: "24px", gridTemplateColumns: colsMap[cols], ...style }} {...rest}>
      {children}
    </div>
  );
}
