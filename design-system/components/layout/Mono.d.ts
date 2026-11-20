import type { ReactNode, CSSProperties } from "react";
export interface MonoProps {
  children: ReactNode;
  as?: "span" | "p" | "div";
  style?: CSSProperties;
}
export declare function Mono(props: MonoProps): JSX.Element;
