import type { ReactNode } from "react";
export interface TimelineStep {
  title: string;
  description: string;
  icon?: ReactNode;
}
export interface TimelineProps {
  steps: TimelineStep[];
}
export declare function Timeline(props: TimelineProps): JSX.Element;
