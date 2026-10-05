/*
  Team profiles for /about and /team.

  SAMPLE CONTENT NOTICE: Names, biographies and role details below are
  fictional demonstration profiles. They are not real people or verified
  credentials. Replace with approved profiles and photographs before production.
*/

export type TeamCategory =
  | "Board of Directors"
  | "Executive Leadership"
  | "Programme Team"
  | "Legal and Referral Team"
  | "Research Team"
  | "Communications Team"
  | "Advisors"
  | "Volunteers";

export interface TeamMember {
  name: string;
  position: string;
  category: TeamCategory;
  /** Short card biography. */
  bio: string;
  /** Longer description of what this role is responsible for. */
  roleDescription: string;
  /** Key day-to-day responsibilities of the role. */
  responsibilities: string[];
  expertise: string[];
  image: string;
  linkedin?: string;
}

export const teamCategories: TeamCategory[] = [
  "Board of Directors",
  "Executive Leadership",
  "Programme Team",
  "Legal and Referral Team",
  "Research Team",
  "Communications Team",
  "Advisors",
  "Volunteers",
];

/** Short descriptions of what each team category does within HRPF. */
export const teamCategoryDescriptions: Record<TeamCategory, string> = {
  "Board of Directors":
    "Provides independent oversight, approves strategy and ensures the foundation remains accountable to its mission and communities.",
  "Executive Leadership":
    "Leads day-to-day operations, sets organisational priorities and represents HRPF with partners and the public.",
  "Programme Team":
    "Designs and delivers community programmes, awareness activities and field-level support initiatives.",
  "Legal and Referral Team":
    "Coordinates legal-awareness sessions and connects eligible individuals with qualified professional referral services.",
  "Research Team":
    "Produces responsible evidence, policy briefs and learning that inform advocacy and programme improvement.",
  "Communications Team":
    "Shares accurate information about our work, supports public awareness and manages media and digital channels.",
  Advisors:
    "Independent specialists who offer guidance on ethics, law, safeguarding and sector practice.",
  Volunteers:
    "Community members who support outreach, events, administration and awareness activities.",
};

export const team: TeamMember[] = [
  {
    name: "Samira Rahman",
    position: "Board Chair",
    category: "Board of Directors",
    bio: "Guides the board in oversight, strategy review and organisational accountability.",
    roleDescription:
      "The Board Chair leads board meetings, supports independent oversight of executive leadership and helps ensure decisions remain aligned with HRPF’s mission, values and safeguarding commitments.",
    responsibilities: [
      "Chair board meetings and strategy reviews",
      "Support transparent governance and reporting",
      "Oversee organisational risk and accountability",
      "Represent the board with partners where appropriate",
    ],
    expertise: ["Governance", "Oversight", "Strategy"],
    image: "/images/team/board-chair.jpg",
  },
  {
    name: "Daniel Okonkwo",
    position: "Board Member — Finance & Accountability",
    category: "Board of Directors",
    bio: "Supports financial oversight, transparent reporting and responsible use of resources.",
    roleDescription:
      "This board role focuses on financial stewardship, reviewing budgets and helping the organisation report honestly on how resources are used to support programmes and communities.",
    responsibilities: [
      "Review budgets and financial reports",
      "Support audit and transparency processes",
      "Advise on responsible resource allocation",
      "Help strengthen internal financial controls",
    ],
    expertise: ["Finance", "Accountability", "Audit"],
    image: "/images/team/board-member.jpg",
  },
  {
    name: "Elena Vasquez",
    position: "Executive Director",
    category: "Executive Leadership",
    bio: "Leads the organisation’s strategy, partnerships and day-to-day leadership.",
    roleDescription:
      "The Executive Director is responsible for overall organisational leadership — setting priorities, supporting teams, building responsible partnerships and ensuring programmes remain safe, ethical and community-centred.",
    responsibilities: [
      "Set and communicate organisational strategy",
      "Lead senior staff and cross-team coordination",
      "Represent HRPF with partners and institutions",
      "Uphold safeguarding, ethics and accountability standards",
    ],
    expertise: ["Leadership", "Strategy", "Partnerships"],
    image: "/images/team/executive-director.jpg",
  },
  {
    name: "Amina Diallo",
    position: "Programme Manager",
    category: "Programme Team",
    bio: "Designs and coordinates community programmes and field activities.",
    roleDescription:
      "The Programme Manager plans, implements and reviews community programmes — from awareness sessions to referral pathways — ensuring activities are practical, respectful and measurable.",
    responsibilities: [
      "Design and schedule programme activities",
      "Coordinate field teams and community partners",
      "Monitor progress and gather community feedback",
      "Improve programmes based on learning and results",
    ],
    expertise: ["Programmes", "Community Engagement", "Monitoring"],
    image: "/images/team/programme-manager.jpg",
  },
  {
    name: "Yusuf Karim",
    position: "Legal Referral Coordinator",
    category: "Legal and Referral Team",
    bio: "Connects people with legal information and verified professional referrals.",
    roleDescription:
      "This role helps communities understand available legal pathways and coordinates responsible referrals to qualified professionals. It does not provide legal representation itself.",
    responsibilities: [
      "Coordinate legal-awareness sessions",
      "Maintain a verified referral partner directory",
      "Support responsible case documentation guidance",
      "Help eligible individuals reach appropriate services",
    ],
    expertise: ["Referral", "Legal Awareness", "Case Guidance"],
    image: "/images/team/legal-coordinator.jpg",
  },
  {
    name: "Priya Nair",
    position: "Research Lead",
    category: "Research Team",
    bio: "Leads responsible research and develops practical policy recommendations.",
    roleDescription:
      "The Research Lead oversees evidence gathering, analysis and publication — ensuring research is ethical, confidential where required, and useful for communities and institutions.",
    responsibilities: [
      "Plan and supervise research activities",
      "Produce policy briefs and learning notes",
      "Protect participant confidentiality",
      "Share findings with partners and the public",
    ],
    expertise: ["Research", "Policy", "Evidence"],
    image: "/images/team/research-lead.jpg",
  },
  {
    name: "Marcus Bennett",
    position: "Communications Officer",
    category: "Communications Team",
    bio: "Develops clear public messaging, media materials and awareness content.",
    roleDescription:
      "The Communications Officer helps HRPF share accurate information about its work, supports campaigns and news updates, and ensures public materials remain respectful and accessible.",
    responsibilities: [
      "Write and edit public communications",
      "Support media and press inquiries",
      "Coordinate awareness campaign materials",
      "Maintain clear, accessible website content",
    ],
    expertise: ["Communications", "Awareness", "Media"],
    image: "/images/team/communications-officer.jpg",
  },
  {
    name: "Dr. Hana Al-Masri",
    position: "Independent Advisor — Safeguarding",
    category: "Advisors",
    bio: "Provides independent advice on safeguarding, ethics and community protection.",
    roleDescription:
      "Independent advisors offer specialist guidance without day-to-day management responsibility. This advisory role focuses on safeguarding standards, ethical practice and protection of people who interact with HRPF.",
    responsibilities: [
      "Advise on safeguarding policy and practice",
      "Review ethical risks in programmes",
      "Support confidential complaint pathways",
      "Recommend improvements to protection standards",
    ],
    expertise: ["Safeguarding", "Ethics", "Protection"],
    image: "/images/team/advisor.jpg",
  },
  {
    name: "Leila Torres",
    position: "Community Volunteer Lead",
    category: "Volunteers",
    bio: "Supports outreach, events and community information activities.",
    roleDescription:
      "Volunteer leads help organise community outreach, support awareness events and share verified information about HRPF programmes. They work under staff guidance and follow the volunteer code of conduct.",
    responsibilities: [
      "Support community outreach activities",
      "Help organise awareness events",
      "Share verified programme information",
      "Follow safeguarding and conduct standards",
    ],
    expertise: ["Community", "Outreach", "Events"],
    image: "/images/team/volunteer.jpg",
  },
];

export function getTeamByCategory(category: TeamCategory): TeamMember[] {
  return team.filter((member) => member.category === category);
}

export function getExecutiveDirector(): TeamMember | undefined {
  return team.find((member) => member.position === "Executive Director");
}
