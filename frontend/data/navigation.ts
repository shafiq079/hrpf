export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem extends NavLink {
  /** Optional dropdown children shown on hover/focus (desktop) or expand (mobile). */
  children?: NavLink[];
}

// Primary site navigation with dropdowns where appropriate.
export const mainNavigation: NavItem[] = [
  {
    label: "Our Work",
    href: "/our-work",
    children: [
      { label: "Women's Rights", href: "/our-work/womens-rights" },
      { label: "Children's Rights", href: "/our-work/childrens-rights" },
      { label: "Access to Justice", href: "/our-work/access-to-justice" },
      { label: "Minority Rights", href: "/our-work/minority-rights" },
      {
        label: "Education and Awareness",
        href: "/our-work/education-and-awareness",
      },
      {
        label: "Research and Advocacy",
        href: "/our-work/research-and-advocacy",
      },
    ],
  },
  { label: "Projects", href: "/projects" },
  { label: "Impact", href: "/impact" },
  { label: "News", href: "/news" },
  { label: "Reports", href: "/reports" },
  {
    label: "Get Involved",
    href: "/get-involved",
    children: [
      { label: "Volunteer", href: "/get-involved" },
      { label: "Become a Member", href: "/get-involved" },
      { label: "Internships", href: "/careers" },
      { label: "Campaigns", href: "/campaigns" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "Who We Are", href: "/about" },
      { label: "Our People", href: "/about#our-people" },
      { label: "Our Team", href: "/team" },
      { label: "Governance", href: "/governance" },
    ],
  },
];

// Footer: main institutional links.
export const footerFoundationLinks: NavLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Our Team", href: "/team" },
  { label: "Governance", href: "/governance" },
  { label: "Careers", href: "/careers" },
  { label: "Media Centre", href: "/media" },
];

// Footer: support & engagement links.
export const footerSupportLinks: NavLink[] = [
  { label: "Contact", href: "/contact" },
  { label: "Get Help", href: "/get-help" },
  { label: "Partner With Us", href: "/partner-with-us" },
  { label: "Complaints", href: "/complaints" },
  { label: "Reports & Resources", href: "/reports" },
];

// Footer: policy links.
export const footerResourceLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Safeguarding Policy", href: "/safeguarding-policy" },
  { label: "Accessibility", href: "/accessibility" },
];

// Footer bottom bar legal links.
export const footerLegalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Safeguarding", href: "/safeguarding-policy" },
];
