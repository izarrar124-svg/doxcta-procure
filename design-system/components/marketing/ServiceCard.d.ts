import type { ReactNode, CSSProperties } from "react";
export interface ServiceCardProps {
  slug: string;
  title: string;
  shortDescription: string;
  icon: ReactNode;
  index?: number;
}
export declare function ServiceCard(props: ServiceCardProps): JSX.Element;
