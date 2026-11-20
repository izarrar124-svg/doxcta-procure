import type { ReactNode, CSSProperties } from "react";
export interface CalloutProps {
  children: ReactNode;
  variant?: "default" | "green";
  style?: CSSProperties;
}
export declare function Callout(props: CalloutProps): JSX.Element;
