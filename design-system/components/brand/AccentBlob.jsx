import React from "react";
export function AccentBlob({ style, ...rest }) {
  return <div aria-hidden="true" style={{ position: "absolute", pointerEvents: "none", borderRadius: "50%", background: "rgba(139,190,71,0.1)", filter: "blur(64px)", ...style }} {...rest} />;
}
