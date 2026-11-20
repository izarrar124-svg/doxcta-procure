export interface HeroProps {
  eyebrow?: string;
  titleLead?: string;
  /** Rendered with the green gradient accent */
  titleAccent?: string;
  description?: string;
  trustPoints?: string[];
  primaryLabel?: string;
  secondaryLabel?: string;
}
export declare function Hero(props: HeroProps): JSX.Element;
