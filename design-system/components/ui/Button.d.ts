import type { ReactNode, ElementType, CSSProperties, ButtonHTMLAttributes } from "react";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "xl";
  /** Render as a different element/tag, e.g. "a" */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
