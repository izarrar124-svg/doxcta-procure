import type { InputHTMLAttributes, CSSProperties } from "react";
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  style?: CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
