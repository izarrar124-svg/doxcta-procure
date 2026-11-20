export interface NavLink { label: string; href: string; }
/**
 * @startingPoint section="Components" subtitle="Sticky dark glass nav with a glowing logo" viewport="700x120"
 */
export interface NavbarProps {
  links?: NavLink[];
  activeHref?: string;
  ctaLabel?: string;
}
export declare function Navbar(props: NavbarProps): JSX.Element;
