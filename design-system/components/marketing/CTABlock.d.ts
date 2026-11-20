export interface CTABlockProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  variant?: "light" | "dark";
}
export declare function CTABlock(props: CTABlockProps): JSX.Element;
