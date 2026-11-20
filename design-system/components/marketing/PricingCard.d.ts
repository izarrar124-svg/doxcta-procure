export interface PricingCardProps {
  name: string;
  description: string;
  price: string | null;
  priceNote: string;
  idealFor: string;
  features: string[];
  highlighted?: boolean;
  index?: number;
}
export declare function PricingCard(props: PricingCardProps): JSX.Element;
