import type { ReactNode, CSSProperties } from "react";
export interface EyebrowProps {
  children: ReactNode;
  /** Use on dark/navy backgrounds */
  light?: boolean;
  style?: CSSProperties;
}
export declare function Eyebrow(props: EyebrowProps): JSX.Element;
