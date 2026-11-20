import type { TextareaHTMLAttributes, CSSProperties } from "react";
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  style?: CSSProperties;
}
export declare function Textarea(props: TextareaProps): JSX.Element;
