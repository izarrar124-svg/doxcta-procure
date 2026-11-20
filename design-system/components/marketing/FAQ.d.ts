export interface FAQItem { question: string; answer: string; }
export interface FAQProps {
  items: FAQItem[];
  title?: string;
  eyebrow?: string;
}
export declare function FAQ(props: FAQProps): JSX.Element;
