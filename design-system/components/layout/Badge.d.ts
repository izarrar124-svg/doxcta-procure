import type { ReactNode, CSSProperties } from "react";
export interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "green" | "outline";
  style?: CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
