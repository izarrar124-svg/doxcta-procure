import type { ReactNode, CSSProperties } from "react";
export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  href?: string;
  index?: number;
  style?: CSSProperties;
}
export declare function FeatureCard(props: FeatureCardProps): JSX.Element;
