export interface FooterColumn { title: string; links: { label: string; href: string }[]; }
export interface FooterProps {
  columns?: FooterColumn[];
  legalLinks?: { label: string; href: string }[];
}
export declare function Footer(props: FooterProps): JSX.Element;
