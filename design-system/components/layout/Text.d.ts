import type { ReactNode, ElementType, CSSProperties } from "react";
export interface TextProps {
  children: ReactNode;
  as?: "p" | "span" | "div";
  size?: "body" | "large" | "small";
  muted?: boolean;
  style?: CSSProperties;
}
export declare function Text(props: TextProps): JSX.Element;
