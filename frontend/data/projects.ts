/*
  Projects power the homepage "Featured Projects" grid, the /projects listing
  and the /projects/[slug] detail template.

  SAMPLE CONTENT NOTICE: project figures, partner names, locations and results
  below are placeholders for a demonstration website and MUST be verified
  before public release.
*/

export type ProjectStatus =
  | "Ongoing"
  | "Completed"
  | "Proposed"
  | "Emergency Response";

export interface ProjectTimelineItem {
  period: string;
  milestone: string;
}

export interface ProjectResult {
  value: string;
  label: string;
}

export interface Project {
  slug: string;
  title: string;
  status: ProjectStatus;
  focusArea: string;
  workAreas?: string[];
  location: string;
  startYear: number;
  summary: string;
  image: string | null;
  imageAlt: string;
  href: string;
  // Detail-page content (optional so cards stay lightweight)
  period?: string;
  targetCommunity?: string;
  overview?: string;
  problemStatement?: string;
  objectives?: string[];
  activities?: string[];
  timeline?: ProjectTimelineItem[];
  partners?: string[];
  results?: ProjectResult[];
  story?: { quote: string; name: string; role: string };
  gallery?: string[];
  relatedReportSlugs?: string[];
}

export const projects: Project[] = [
  {
    slug: "safe-haven-initiative",
    title: "Safe Haven Initiative",
    status: "Ongoing",
    focusArea: "Community Protection",
    location: "Multiple communities",
    startYear: 2022,
    summary:
      "A community-based initiative connecting vulnerable families with verified protection, documentation and referral services.",
    image: "/images/projects/safe-haven.jpg",
    imageAlt:
      "Support workers welcoming a family at a community protection centre.",
    href: "/projects/safe-haven-initiative",
    period: "2022 – Present",
    targetCommunity: "Displaced and vulnerable families",
    overview:
      "The Safe Haven Initiative is designed to help vulnerable individuals and families better understand available protection options and connect with qualified services. The project works through local volunteers, verified referral partners and community-awareness sessions.",
    problemStatement:
      "People facing displacement, discrimination or immediate vulnerability often lack reliable information about available support. This can result in delayed assistance, unsafe decisions or exposure to further harm.",
    objectives: [
      "Improve access to reliable protection information",
      "Strengthen responsible referral pathways",
      "Support safer case documentation",
      "Build community awareness of available services",
      "Improve coordination between community organizations",
    ],
    activities: [
      "Community information sessions",
      "Confidential intake and referral",
      "Volunteer training",
      "Service-directory development",
      "Case documentation guidance",
      "Partner coordination meetings",
    ],
    timeline: [
      { period: "2022", milestone: "Initiative launched with volunteer network" },
      { period: "2023", milestone: "Referral partner directory established" },
      { period: "2024", milestone: "Community information sessions expanded" },
      { period: "2025", milestone: "Coordination framework under review" },
    ],
    partners: [
      "Community Partner A (sample)",
      "Referral Service B (sample)",
      "Local Organization C (sample)",
    ],
    results: [
      { value: "800+", label: "People informed (sample)" },
      { value: "120+", label: "Referrals supported (sample)" },
      { value: "12", label: "Partner services (sample)" },
    ],
    story: {
      quote:
        "The information sessions helped my family understand where to turn for reliable support.",
      name: "Community Member",
      role: "Programme participant (sample)",
    },
    gallery: [
      "/images/projects/safe-haven-1.jpg",
      "/images/projects/safe-haven-2.jpg",
      "/images/projects/safe-haven-3.jpg",
    ],
    relatedReportSlugs: ["community-rights-awareness-guide"],
  },
  {
    slug: "digital-literacy-corps",
    title: "Digital Literacy Corps",
    status: "Ongoing",
    focusArea: "Education and Awareness",
    location: "Urban and peri-urban communities",
    startYear: 2023,
    summary:
      "A digital-awareness programme helping young people identify online risks, misinformation and violations of digital privacy.",
    image: "/images/projects/digital-literacy.jpg",
    imageAlt: "Young people learning digital skills at community computers.",
    href: "/projects/digital-literacy-corps",
    period: "2023 – Present",
    targetCommunity: "Young people aged 13–24",
    overview:
      "The Digital Literacy Corps helps young people navigate digital spaces safely, recognise misinformation and understand their digital rights.",
    problemStatement:
      "Young people increasingly rely on digital platforms but may lack guidance on privacy risks, misinformation and safe online habits.",
    objectives: [
      "Improve digital-rights awareness",
      "Reduce exposure to online risks",
      "Support critical evaluation of information",
    ],
    activities: [
      "Digital-awareness workshops",
      "Peer-education sessions",
      "Open learning resources",
    ],
    timeline: [
      { period: "2023", milestone: "Pilot workshops delivered" },
      { period: "2024", milestone: "Peer-education model introduced" },
    ],
    partners: ["Education Partner D (sample)"],
    results: [
      { value: "1,500+", label: "Young people reached (sample)" },
      { value: "35", label: "Workshops delivered (sample)" },
    ],
    relatedReportSlugs: ["digital-privacy-and-young-people"],
  },
  {
    slug: "community-legal-aid-network",
    title: "Community Legal Aid Network",
    status: "Ongoing",
    focusArea: "Access to Justice",
    location: "Regional network",
    startYear: 2021,
    summary:
      "A referral and legal-awareness network connecting underserved communities with qualified legal professionals.",
    image: "/images/projects/legal-aid.jpg",
    imageAlt: "A volunteer adviser meeting community members for a consultation.",
    href: "/projects/community-legal-aid-network",
    period: "2021 – Present",
    targetCommunity: "Underserved communities seeking legal information",
    overview:
      "The Community Legal Aid Network connects eligible individuals with qualified pro-bono professionals and improves legal awareness.",
    problemStatement:
      "Many communities lack affordable access to legal information and struggle to locate qualified professional support.",
    objectives: [
      "Improve legal literacy",
      "Strengthen responsible referral",
      "Expand pro-bono participation",
    ],
    activities: [
      "Legal-awareness clinics",
      "Professional referral coordination",
      "Case documentation guidance",
    ],
    partners: ["Law Firm E (sample)", "Bar Association F (sample)"],
    results: [
      { value: "120+", label: "Referrals supported (sample)" },
      { value: "18", label: "Partner professionals (sample)" },
    ],
    relatedReportSlugs: ["responsible-case-documentation"],
  },
  {
    slug: "rights-in-schools-programme",
    title: "Rights in Schools Programme",
    status: "Proposed",
    focusArea: "Children's Rights",
    location: "Partner schools",
    startYear: 2026,
    summary:
      "A school-based programme teaching students about dignity, safety, responsibilities and trusted reporting channels.",
    image: "/images/projects/rights-in-schools.jpg",
    imageAlt: "Students participating in a classroom rights-awareness activity.",
    href: "/projects/rights-in-schools-programme",
    period: "Proposed for 2026",
    targetCommunity: "Primary and secondary students",
    overview:
      "The Rights in Schools Programme is a proposed initiative to deliver age-appropriate rights education and safe reporting awareness in partner schools.",
    problemStatement:
      "Students often lack accessible education about their rights, responsibilities and trusted channels for raising concerns.",
    objectives: [
      "Deliver age-appropriate rights education",
      "Promote trusted reporting channels",
      "Support safer school environments",
    ],
    activities: [
      "Classroom sessions",
      "Teacher orientation",
      "Age-appropriate resources",
    ],
    results: [{ value: "Proposed", label: "Awaiting partner confirmation" }],
  },
  {
    slug: "womens-community-leadership",
    title: "Women's Community Leadership Initiative",
    status: "Completed",
    focusArea: "Women's Rights",
    location: "Selected communities",
    startYear: 2020,
    summary:
      "A training initiative supporting women's participation in community decision-making and rights awareness.",
    image: "/images/projects/womens-leadership.jpg",
    imageAlt: "Women collaborating during a community leadership workshop.",
    href: "/projects/womens-community-leadership",
    period: "2020 – 2022",
    targetCommunity: "Women community members",
    overview:
      "This completed initiative supported women's participation in community decision-making through training and rights awareness.",
    problemStatement:
      "Women were often under-represented in community decision-making and lacked accessible leadership opportunities.",
    objectives: [
      "Strengthen women's participation",
      "Build rights-awareness capacity",
    ],
    activities: ["Leadership training", "Rights-awareness sessions"],
    results: [
      { value: "300+", label: "Participants (sample)" },
      { value: "12", label: "Communities (sample)" },
    ],
  },
  {
    slug: "evidence-for-change",
    title: "Evidence for Change Research Programme",
    status: "Ongoing",
    focusArea: "Research and Advocacy",
    location: "Multi-region",
    startYear: 2023,
    summary:
      "A research programme documenting emerging community concerns and developing practical policy recommendations.",
    image: "/images/projects/evidence-for-change.jpg",
    imageAlt: "Researchers analysing survey findings on a shared board.",
    href: "/projects/evidence-for-change",
    period: "2023 – Present",
    targetCommunity: "Communities and institutions",
    overview:
      "Evidence for Change documents emerging community concerns responsibly and develops practical recommendations for institutions.",
    problemStatement:
      "Decision-makers often lack reliable, community-level evidence about emerging human-rights concerns.",
    objectives: [
      "Document emerging concerns responsibly",
      "Develop practical recommendations",
      "Support informed policy dialogue",
    ],
    activities: ["Field research", "Policy briefs", "Stakeholder consultation"],
    results: [
      { value: "12", label: "Briefs published (sample)" },
      { value: "25+", label: "Consultations (sample)" },
    ],
    relatedReportSlugs: ["annual-report-2025"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const projectStatuses: ProjectStatus[] = [
  "Ongoing",
  "Completed",
  "Proposed",
  "Emergency Response",
];
