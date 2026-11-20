import React from "react";
export function DashedTrail({ style, ...rest }) {
  return (
    <svg width="120" height="24" viewBox="0 0 120 24" fill="none" aria-hidden="true" style={{ color: "rgba(139,190,71,0.4)", ...style }} {...rest}>
      <path d="M2 12H118" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" strokeLinecap="round" />
      <circle cx="118" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
