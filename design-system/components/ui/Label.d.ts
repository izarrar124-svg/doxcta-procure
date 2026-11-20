import type { ReactNode, LabelHTMLAttributes, CSSProperties } from "react";
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  style?: CSSProperties;
}
export declare function Label(props: LabelProps): JSX.Element;
