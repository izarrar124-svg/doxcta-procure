import type { ReactNode, CSSProperties } from "react";
export interface GridProps {
  children: ReactNode;
  /** Responsive column count */
  cols?: 1 | 2 | 3 | 4;
  style?: CSSProperties;
}
export declare function Grid(props: GridProps): JSX.Element;
