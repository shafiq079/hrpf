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
      { label: "Refugees and Migrants", href: "/our-work/refugees-and-migrants" },
      { label: "Community Development", href: "/our-work/community-development" },
    ],
  },
  { label: "Projects", href: "/projects" },
  { label: "Blogs", href: "/blogs" },
  {
    label: "Gallery",
    href: "/gallery",
    children: [
      { label: "Media Coverage", href: "/gallery/media-coverage" },
      { label: "TV Interviews", href: "/gallery/tv-interviews" },
    ],
  },
  { label: "Become a Member", href: "/become-a-member" },
  { label: "Contact", href: "/contact" },
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "Who We Are", href: "/about/who-we-are" },
      { label: "Mission and Vision", href: "/about/mission-and-vision" },
      { label: "Aims and Objectives", href: "/about/aims-and-objectives" },
      { label: "Message of CEO", href: "/about/message-of-ceo" },
      { label: "Board of Directors", href: "/about/board-of-directors" },
      { label: "Our Team", href: "/about/our-team" },
      { label: "Registration and Certificates", href: "/about/registration-and-certificates" },
      { label: "Progress Reports", href: "/about/progress-reports" },
    ],
  },
];

// Footer: main institutional links.
export const footerFoundationLinks: NavLink[] = [
  { label: "Our Impact", href: "/impact" },
  { label: "About Us", href: "/about" },
  { label: "Board of Directors", href: "/about/board-of-directors" },
  { label: "Our Team", href: "/about/our-team" },
  { label: "Blogs", href: "/blogs" },
  { label: "Gallery", href: "/gallery" },
];

// Footer: support & engagement links.
export const footerSupportLinks: NavLink[] = [
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Partner With Us", href: "/partner-with-us" },
  { label: "File a Complaint", href: "/file-a-complaint" },
  { label: "Become a Member", href: "/become-a-member" },
  { label: "Progress Reports", href: "/about/progress-reports" },
];

// Accessibility remains at /accessibility but is temporarily hidden from public navigation.
// Footer: policy links.
export const footerResourceLinks: NavLink[] = [
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Safeguarding", href: "/safeguarding-policy" },
];

// Footer bottom bar legal links.
export const footerLegalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Safeguarding", href: "/safeguarding-policy" },
];
