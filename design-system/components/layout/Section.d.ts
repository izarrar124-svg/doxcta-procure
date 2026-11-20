import type { ReactNode, CSSProperties } from "react";
export interface SectionProps {
  children: ReactNode;
  /** Background treatment. light = base near-black canvas · muted = raised dark surface · cream = the one "paper" light-contrast break · green = base with a faint lime spotlight bloom · navy = full hero-atmosphere gradient */
  variant?: "light" | "muted" | "cream" | "green" | "navy";
  containerSize?: "sm" | "md" | "lg" | "full";
  style?: CSSProperties;
}
export declare function Section(props: SectionProps): JSX.Element;
