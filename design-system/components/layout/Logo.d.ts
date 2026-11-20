import type { CSSProperties } from "react";
export interface LogoProps {
  /** dark = on the near-black canvas (bone + green artwork) · light = on the bone "paper" surface (ink + green artwork) */
  theme?: "light" | "dark";
  /** md = full lockup · sm = chevron mark only */
  size?: "sm" | "md";
  style?: CSSProperties;
}
export declare function Logo(props: LogoProps): JSX.Element;
