import type { ReactNode, CSSProperties } from "react";
export interface ContainerProps {
  children: ReactNode;
  /** Max-width preset */
  size?: "sm" | "md" | "lg" | "full";
  style?: CSSProperties;
}
export declare function Container(props: ContainerProps): JSX.Element;
