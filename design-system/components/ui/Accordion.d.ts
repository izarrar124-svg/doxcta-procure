export interface AccordionItemData {
  question: string;
  answer: string;
}
export interface AccordionProps {
  items: AccordionItemData[];
}
export declare function Accordion(props: AccordionProps): JSX.Element;
