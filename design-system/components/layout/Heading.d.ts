import type { ReactNode, ElementType, CSSProperties } from "react";
export interface HeadingProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "p";
  size?: "display" | "h1" | "h2" | "h3";
  /** Doxcta headlines are lowercase by brand rule; set false to override */
  lowercase?: boolean;
  style?: CSSProperties;
}
export declare function Heading(props: HeadingProps): JSX.Element;
