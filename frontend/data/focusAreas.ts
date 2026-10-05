import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  Building2,
  Globe,
  GraduationCap,
  HeartHandshake,
  Scale,
  Users,
  UserRound,
} from "lucide-react";

/*
  Focus areas power both the homepage grid and the /our-work section, plus the
  /our-work/[slug] detail pages. All narrative content below is realistic
  SAMPLE content for a demonstration site and should be reviewed and approved
  before production.
*/

export interface FocusAreaProgramme {
  title: string;
  description: string;
}

export interface FocusAreaFAQ {
  question: string;
  answer: string;
}

export interface FocusArea {
  slug: string;
  title: string;
  /** Shorter label for compact navigation menus. */
  navLabel: string;
  description: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  activities: string[];
  /** Slug of a related project shown as a preview. */
  relatedProjectSlug?: string;
  // Detail-page content
  overview: string;
  whyItMatters: string;
  challenges: string[];
  whatWeDo: string[];
  programmes: FocusAreaProgramme[];
  impactIndicators: { value: string; label: string }[];
  faqs: FocusAreaFAQ[];
}

export const focusAreas: FocusArea[] = [
  {
    slug: "womens-rights",
    title: "Women's Rights",
    navLabel: "Women's Rights",
    description:
      "We support initiatives that improve awareness of women's legal rights, prevent gender-based discrimination and strengthen access to education, safety and economic opportunity.",
    icon: UserRound,
    image: "/images/work/womens-rights.jpg",
    imageAlt:
      "A group of women participating in a community rights-awareness session.",
    activities: [
      "Legal-rights awareness",
      "Prevention education",
      "Referral support",
      "Leadership and economic participation",
    ],
    relatedProjectSlug: "womens-community-leadership",
    overview:
      "Our women's rights work focuses on awareness, prevention and access to support so that women can understand their rights and participate fully in community life.",
    whyItMatters:
      "When women can access education, safety and economic opportunity, entire communities become more resilient and equitable.",
    challenges: [
      "Limited awareness of existing legal protections",
      "Barriers to safe reporting of discrimination or violence",
      "Unequal access to education and economic participation",
    ],
    whatWeDo: [
      "Deliver accessible legal-rights awareness sessions",
      "Support prevention education in communities",
      "Provide responsible referral to qualified services",
      "Encourage women's leadership and participation",
    ],
    programmes: [
      {
        title: "Rights Awareness Workshops",
        description:
          "Community sessions explaining legal rights and available support in accessible language.",
      },
      {
        title: "Leadership Participation",
        description:
          "Encouraging women's participation in community decision-making and dialogue.",
      },
    ],
    impactIndicators: [
      { value: "40+", label: "Awareness sessions (sample)" },
      { value: "1,200+", label: "Participants reached (sample)" },
    ],
    faqs: [
      {
        question: "Does HRPF provide legal representation for women?",
        answer:
          "HRPF provides information and referral to qualified services where possible, but does not guarantee legal representation.",
      },
      {
        question: "Can women participate anonymously?",
        answer:
          "Yes. Participation in awareness activities does not require disclosure of personal information.",
      },
    ],
  },
  {
    slug: "childrens-rights",
    title: "Children's Rights",
    navLabel: "Children's Rights",
    description:
      "We promote safe childhoods by supporting education, raising awareness of exploitation and encouraging stronger child-protection practices.",
    icon: HeartHandshake,
    image: "/images/work/childrens-rights.jpg",
    imageAlt: "Children learning together in a bright community classroom.",
    activities: [
      "Child-protection awareness",
      "Education access",
      "Child-labour prevention",
      "Referral to qualified services",
    ],
    relatedProjectSlug: "rights-in-schools-programme",
    overview:
      "We work to protect the safety and future of children through education, awareness and stronger child-protection practices in communities.",
    whyItMatters:
      "Safe, supported childhoods are the foundation of dignity, opportunity and long-term community wellbeing.",
    challenges: [
      "Limited awareness of child-protection standards",
      "Barriers to consistent education access",
      "Risks of exploitation and child labour",
    ],
    whatWeDo: [
      "Raise awareness of child-protection principles",
      "Support access to education",
      "Promote prevention of child labour",
      "Refer families to qualified services",
    ],
    programmes: [
      {
        title: "Rights in Schools",
        description:
          "School-based sessions on dignity, safety and trusted reporting channels.",
      },
      {
        title: "Family Awareness",
        description:
          "Guidance for families on recognising risks and finding support.",
      },
    ],
    impactIndicators: [
      { value: "30+", label: "Schools engaged (sample)" },
      { value: "2,500+", label: "Students reached (sample)" },
    ],
    faqs: [
      {
        question: "Does HRPF operate schools?",
        answer:
          "No. HRPF supports awareness and referral, and collaborates with existing education providers.",
      },
      {
        question: "How are child-protection concerns handled?",
        answer:
          "Concerns are handled carefully and referred to appropriate qualified services where necessary.",
      },
    ],
  },
  {
    slug: "access-to-justice",
    title: "Access to Justice",
    navLabel: "Access to Justice",
    description:
      "We help communities understand available legal pathways and connect eligible individuals with appropriate legal or institutional support.",
    icon: Scale,
    image: "/images/work/access-to-justice.jpg",
    imageAlt:
      "A legal adviser explaining documents to community members at a table.",
    activities: [
      "Legal information",
      "Case documentation",
      "Professional referrals",
      "Rights-awareness sessions",
    ],
    relatedProjectSlug: "community-legal-aid-network",
    overview:
      "We improve understanding of legal pathways and connect eligible individuals with appropriate professional support.",
    whyItMatters:
      "Access to fair and responsible systems is essential for protecting rights and resolving disputes peacefully.",
    challenges: [
      "Limited legal literacy in underserved communities",
      "Difficulty locating qualified, affordable support",
      "Complex documentation requirements",
    ],
    whatWeDo: [
      "Share clear legal information",
      "Support responsible case documentation",
      "Refer eligible individuals to professionals",
      "Deliver rights-awareness sessions",
    ],
    programmes: [
      {
        title: "Legal Awareness Clinics",
        description:
          "Community sessions explaining rights and legal options in plain language.",
      },
      {
        title: "Referral Network",
        description:
          "Connecting eligible individuals with qualified pro-bono professionals.",
      },
    ],
    impactIndicators: [
      { value: "120+", label: "Referrals supported (sample)" },
      { value: "18", label: "Partner professionals (sample)" },
    ],
    faqs: [
      {
        question: "Is HRPF a law firm?",
        answer:
          "No. HRPF provides information and referral, and does not itself act as a legal representative.",
      },
      {
        question: "Does a referral guarantee a legal outcome?",
        answer:
          "No. Referral connects individuals with services but does not guarantee any specific result.",
      },
    ],
  },
  {
    slug: "minority-rights",
    title: "Minority Rights",
    navLabel: "Minority Rights",
    description:
      "We promote inclusion, non-discrimination and the equal participation of religious, ethnic and cultural minority communities.",
    icon: Users,
    image: "/images/work/minority-rights.jpg",
    imageAlt: "A diverse group of community members in conversation together.",
    activities: [
      "Anti-discrimination education",
      "Community dialogue",
      "Documentation",
      "Advocacy and policy engagement",
    ],
    relatedProjectSlug: "evidence-for-change",
    overview:
      "We support inclusion and non-discrimination so that minority communities can participate equally in public life.",
    whyItMatters:
      "Protecting minority rights strengthens social cohesion and upholds the principle of equality for all.",
    challenges: [
      "Discrimination and exclusion",
      "Under-representation in decision-making",
      "Preservation of cultural heritage",
    ],
    whatWeDo: [
      "Deliver anti-discrimination education",
      "Facilitate community dialogue",
      "Support responsible documentation",
      "Engage in advocacy and policy conversations",
    ],
    programmes: [
      {
        title: "Community Dialogue",
        description:
          "Facilitated conversations that build understanding across communities.",
      },
      {
        title: "Inclusion Advocacy",
        description:
          "Engaging institutions to promote equal participation and non-discrimination.",
      },
    ],
    impactIndicators: [
      { value: "15+", label: "Dialogue sessions (sample)" },
      { value: "8", label: "Communities engaged (sample)" },
    ],
    faqs: [
      {
        question: "How does HRPF define minority communities?",
        answer:
          "We work with religious, ethnic and cultural communities that experience discrimination or exclusion.",
      },
      {
        question: "Does HRPF take political positions?",
        answer:
          "HRPF aims to make decisions based on human-rights principles rather than political interests.",
      },
    ],
  },
  {
    slug: "education-and-awareness",
    title: "Education and Awareness",
    navLabel: "Education and Awareness",
    description:
      "We create accessible programmes that help students, families and community leaders understand rights, responsibilities and available support.",
    icon: GraduationCap,
    image: "/images/work/education.jpg",
    imageAlt: "A facilitator leading an interactive community workshop.",
    activities: [
      "School and university workshops",
      "Public-awareness campaigns",
      "Digital-learning resources",
      "Community training",
    ],
    relatedProjectSlug: "digital-literacy-corps",
    overview:
      "We build accessible educational programmes that improve understanding of rights, responsibilities and available support.",
    whyItMatters:
      "Awareness is often the first step toward protection: people can only claim rights they understand.",
    challenges: [
      "Uneven access to reliable information",
      "Low digital literacy in some communities",
      "Limited rights education in curricula",
    ],
    whatWeDo: [
      "Run school and university workshops",
      "Deliver public-awareness campaigns",
      "Develop digital-learning resources",
      "Provide community training",
    ],
    programmes: [
      {
        title: "Digital Literacy",
        description:
          "Helping young people identify online risks and misinformation.",
      },
      {
        title: "Community Training",
        description:
          "Practical sessions for community leaders and families.",
      },
    ],
    impactIndicators: [
      { value: "60+", label: "Workshops delivered (sample)" },
      { value: "3,000+", label: "Learners reached (sample)" },
    ],
    faqs: [
      {
        question: "Are HRPF resources free to use?",
        answer:
          "Awareness resources are generally provided free for educational, non-commercial use.",
      },
      {
        question: "Can schools request a workshop?",
        answer:
          "Yes. Schools can contact HRPF to discuss availability and suitability.",
      },
    ],
  },
  {
    slug: "research-and-advocacy",
    title: "Research and Advocacy",
    navLabel: "Research and Advocacy",
    description:
      "We produce responsible evidence and recommendations that help institutions better understand human-rights challenges.",
    icon: BookOpenCheck,
    image: "/images/work/research.jpg",
    imageAlt: "Researchers reviewing data and documents together.",
    activities: [
      "Field research",
      "Policy briefs",
      "Stakeholder consultation",
      "Public education",
    ],
    relatedProjectSlug: "evidence-for-change",
    overview:
      "We develop responsible research and practical recommendations to help institutions address human-rights challenges.",
    whyItMatters:
      "Evidence-based advocacy supports durable improvements in policy and practice.",
    challenges: [
      "Gaps in reliable, community-level data",
      "Limited channels for community voices in policy",
      "Ensuring research is conducted responsibly",
    ],
    whatWeDo: [
      "Conduct responsible field research",
      "Publish policy briefs",
      "Consult stakeholders",
      "Support public education",
    ],
    programmes: [
      {
        title: "Evidence for Change",
        description:
          "Documenting emerging concerns and developing policy recommendations.",
      },
      {
        title: "Stakeholder Consultation",
        description:
          "Bringing communities and institutions into shared conversations.",
      },
    ],
    impactIndicators: [
      { value: "12", label: "Briefs published (sample)" },
      { value: "25+", label: "Consultations held (sample)" },
    ],
    faqs: [
      {
        question: "How does HRPF ensure research is responsible?",
        answer:
          "We follow ethical guidelines, protect participant confidentiality and clearly label limitations.",
      },
      {
        question: "Are HRPF reports peer reviewed?",
        answer:
          "Publications follow internal review; sample content on this site is illustrative only.",
      },
    ],
  },
  {
    slug: "refugees-and-migrants",
    title: "Refugees and Migrants",
    navLabel: "Refugees and Migrants",
    description:
      "We provide information, referral and awareness support for displaced people, refugees and migrant communities.",
    icon: Globe,
    image: "/images/work/refugees.jpg",
    imageAlt: "Aid workers assisting families at a community welcome centre.",
    activities: [
      "Rights information",
      "Documentation guidance",
      "Service referrals",
      "Community inclusion",
    ],
    relatedProjectSlug: "safe-haven-initiative",
    overview:
      "We support displaced people, refugees and migrants with information, referral and inclusion activities.",
    whyItMatters:
      "Reliable information and inclusion help people make safer decisions and rebuild stability.",
    challenges: [
      "Lack of clear information about available support",
      "Documentation and referral complexity",
      "Barriers to community inclusion",
    ],
    whatWeDo: [
      "Share rights information",
      "Provide documentation guidance",
      "Refer people to suitable services",
      "Support community inclusion",
    ],
    programmes: [
      {
        title: "Welcome Information",
        description:
          "Accessible information about available services and support.",
      },
      {
        title: "Inclusion Activities",
        description:
          "Community activities that support belonging and participation.",
      },
    ],
    impactIndicators: [
      { value: "900+", label: "People informed (sample)" },
      { value: "10", label: "Partner services (sample)" },
    ],
    faqs: [
      {
        question: "Does HRPF handle asylum applications?",
        answer:
          "No. HRPF provides information and referral, and does not process legal applications.",
      },
      {
        question: "Is support available in multiple languages?",
        answer:
          "We aim to provide accessible materials; language availability varies by resource.",
      },
    ],
  },
  {
    slug: "community-development",
    title: "Community Development",
    navLabel: "Community Development",
    description:
      "We support community-led initiatives that strengthen participation, resilience and access to basic opportunities.",
    icon: Building2,
    image: "/images/work/community.jpg",
    imageAlt: "Community members collaborating on a local development project.",
    activities: [
      "Local leadership",
      "Community consultation",
      "Skills development",
      "Institutional collaboration",
    ],
    relatedProjectSlug: "safe-haven-initiative",
    overview:
      "We support community-led initiatives that build participation, resilience and access to opportunity.",
    whyItMatters:
      "Sustainable protection is rooted in strong, participatory communities.",
    challenges: [
      "Limited local capacity and resources",
      "Weak links between communities and institutions",
      "Barriers to participation",
    ],
    whatWeDo: [
      "Support local leadership",
      "Facilitate community consultation",
      "Encourage skills development",
      "Enable institutional collaboration",
    ],
    programmes: [
      {
        title: "Local Leadership",
        description:
          "Supporting community representatives to voice local needs.",
      },
      {
        title: "Skills Development",
        description:
          "Practical activities that strengthen community capacity.",
      },
    ],
    impactIndicators: [
      { value: "20+", label: "Communities supported (sample)" },
      { value: "5", label: "Institutional partners (sample)" },
    ],
    faqs: [
      {
        question: "How are communities selected?",
        answer:
          "Priorities are guided by need, feasibility and human-rights principles.",
      },
      {
        question: "Can communities propose an initiative?",
        answer:
          "Yes. Communities can contact HRPF to discuss potential collaboration.",
      },
    ],
  },
];

export function getFocusArea(slug: string): FocusArea | undefined {
  return focusAreas.find((area) => area.slug === slug);
}
