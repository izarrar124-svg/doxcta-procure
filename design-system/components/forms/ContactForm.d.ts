export interface ContactFormProps {
  /** Called with FormData on submit; return a promise to control the loading state */
  onSubmit?: (data: FormData) => void | Promise<void>;
}
export declare function ContactForm(props: ContactFormProps): JSX.Element;
