export interface NavLink {
  label: string;
  href: string;
}
export interface NavItem extends NavLink {
  children?: NavLink[];
}
export const mainNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Who We Are", href: "/about/who-we-are" },
      { label: "Mission", href: "/about/mission" },
      { label: "Vision", href: "/about/vision" },
      { label: "Aims and Objectives", href: "/about/aims-and-objectives" },
      { label: "Chairman’s Message", href: "/about/chairman-message" },
      { label: "Board of Directors", href: "/about/board" },
      { label: "Our Team", href: "/about/our-team" },
      {
        label: "Registration and Certificates",
        href: "/about/registration-certificates",
      },
      { label: "Progress Reports", href: "/about/progress-reports" },
    ],
  },
  { label: "What We Do", href: "/what-we-do" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blogs", href: "/blogs" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Contact", href: "/contact" },
];
export const footerFoundationLinks: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Board of Directors", href: "/about/board" },
  { label: "What We Do", href: "/what-we-do" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blogs", href: "/blogs" },
];
export const footerSupportLinks: NavLink[] = [
  { label: "Contact", href: "/contact" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Donate", href: "/donate" },
  { label: "Progress Reports", href: "/about/progress-reports" },
  { label: "Certificates", href: "/about/registration-certificates" },
];
export const footerLegalLinks: NavLink[] = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-use" },
  { label: "Accessibility", href: "/accessibility" },
];
export const footerResourceLinks = footerLegalLinks;
