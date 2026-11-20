import type { ReactNode, CSSProperties } from "react";
export interface IconWrapperProps {
  /** A rendered icon node, e.g. a Lucide icon or <i data-lucide="mail"/> */
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "green" | "dark";
  style?: CSSProperties;
}
export declare function IconWrapper(props: IconWrapperProps): JSX.Element;
