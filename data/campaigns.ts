/*
  Campaigns for /campaigns and /campaigns/[slug].

  SAMPLE CONTENT NOTICE: campaign goals, figures and progress values are
  illustrative placeholders and must be verified before publication.
*/

export type CampaignStatus = "Active" | "Upcoming" | "Completed";

export interface Campaign {
  slug: string;
  title: string;
  status: CampaignStatus;
  goal: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  /** Illustrative progress percentage (0–100). */
  progress: number;
  objective?: string;
  whyItMatters?: string;
  keyFacts?: string[];
  activities?: string[];
  timeline?: { period: string; milestone: string }[];
  resources?: string[];
}

export const campaigns: Campaign[] = [
  {
    slug: "stop-child-labour",
    title: "Stop Child Labour",
    status: "Active",
    goal: "Raise awareness of child-labour prevention",
    description:
      "An awareness campaign promoting child-protection principles and prevention of child labour.",
    image: "/images/campaigns/stop-child-labour.jpg",
    imageAlt: "Children participating in a safe learning activity.",
    href: "/campaigns/stop-child-labour",
    progress: 62,
    objective:
      "Increase community awareness of child-labour risks and prevention.",
    whyItMatters:
      "Every child deserves safety, education and the opportunity to develop free from exploitation.",
    keyFacts: [
      "Awareness is a key element of prevention (sample).",
      "Community reporting channels support early intervention (sample).",
    ],
    activities: ["Awareness workshops", "Community outreach", "Resource sharing"],
    timeline: [
      { period: "Phase 1", milestone: "Awareness materials developed" },
      { period: "Phase 2", milestone: "Community sessions delivered" },
    ],
    resources: ["Community Rights Awareness Guide"],
  },
  {
    slug: "protect-women-from-violence",
    title: "Protect Women from Violence",
    status: "Active",
    goal: "Strengthen awareness and referral support",
    description:
      "A campaign raising awareness of prevention and available support for women.",
    image: "/images/campaigns/protect-women.jpg",
    imageAlt: "A women's community-support gathering.",
    href: "/campaigns/protect-women-from-violence",
    progress: 48,
    objective: "Improve awareness of prevention and safe referral pathways.",
    whyItMatters:
      "Awareness and accessible support help protect safety and dignity.",
    keyFacts: ["Prevention education supports safer communities (sample)."],
    activities: ["Awareness sessions", "Referral coordination"],
  },
  {
    slug: "equal-access-to-education",
    title: "Equal Access to Education",
    status: "Active",
    goal: "Promote inclusive access to education",
    description:
      "A campaign promoting equal access to quality education in underserved communities.",
    image: "/images/campaigns/education-access.jpg",
    imageAlt: "Students arriving at a community learning centre.",
    href: "/campaigns/equal-access-to-education",
    progress: 55,
    objective: "Encourage inclusive, accessible education opportunities.",
    whyItMatters: "Education is a foundation for dignity and opportunity.",
  },
  {
    slug: "know-your-rights",
    title: "Know Your Rights",
    status: "Active",
    goal: "Improve everyday rights awareness",
    description:
      "A public-awareness campaign helping people understand their basic rights.",
    image: "/images/campaigns/know-your-rights.jpg",
    imageAlt: "A public rights-awareness information stand.",
    href: "/campaigns/know-your-rights",
    progress: 70,
    objective: "Increase everyday awareness of rights and responsibilities.",
    whyItMatters: "People can only claim rights they understand.",
  },
  {
    slug: "end-discrimination",
    title: "End Discrimination",
    status: "Upcoming",
    goal: "Promote inclusion and non-discrimination",
    description:
      "An upcoming campaign promoting inclusion and non-discrimination across communities.",
    image: "/images/campaigns/end-discrimination.jpg",
    imageAlt: "A diverse group of people standing together.",
    href: "/campaigns/end-discrimination",
    progress: 20,
    objective: "Promote inclusion and challenge discrimination.",
    whyItMatters: "Equality strengthens social cohesion and dignity.",
  },
];

export function getCampaign(slug: string): Campaign | undefined {
  return campaigns.find((campaign) => campaign.slug === slug);
}
