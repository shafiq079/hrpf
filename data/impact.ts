/*
  Impact page data for /impact.

  DEVELOPMENT NOTICE: all figures below are SAMPLE values for a demonstration
  website. Verified organizational data must replace them before publication.
  These values are intentionally separate from any homepage figures and must
  not be presented as confirmed results.
*/

export interface ImpactStatistic {
  value: string;
  label: string;
}

export interface MeasureCard {
  title: string;
  question: string;
}

export interface FocusAreaProgress {
  label: string;
  /** Illustrative percentage (0–100). Sample data only. */
  value: number;
}

export interface CommunityStory {
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
}

export interface SDGAlignment {
  code: string;
  title: string;
}

export const impactSummaryStats: ImpactStatistic[] = [
  { value: "5,000+", label: "People Reached" },
  { value: "120+", label: "Cases Referred or Supported" },
  { value: "60+", label: "Awareness Sessions" },
  { value: "25+", label: "Community and Institutional Partners" },
];

export const measureCards: MeasureCard[] = [
  { title: "Reach", question: "Who participated in or benefited from an activity?" },
  { title: "Quality", question: "Was support delivered safely, respectfully and effectively?" },
  { title: "Outcomes", question: "What measurable improvement followed the intervention?" },
  { title: "Learning", question: "What should be changed or improved in future programmes?" },
];

export const focusAreaProgress: FocusAreaProgress[] = [
  { label: "Education and Awareness", value: 78 },
  { label: "Access to Justice", value: 64 },
  { label: "Women's Rights", value: 58 },
  { label: "Children's Rights", value: 52 },
  { label: "Research and Advocacy", value: 45 },
];

export const communityStories: CommunityStory[] = [
  {
    title: "Understanding Rights Through Awareness",
    excerpt:
      "A sample story about how awareness sessions helped community members understand available support.",
    image: "/images/impact/story-1.jpg",
    imageAlt: "Community members at an awareness session.",
  },
  {
    title: "Connecting People with Support",
    excerpt:
      "A sample story illustrating responsible referral to qualified services.",
    image: "/images/impact/story-2.jpg",
    imageAlt: "A referral consultation in progress.",
  },
  {
    title: "Building Local Leadership",
    excerpt:
      "A sample story about supporting participation in community decision-making.",
    image: "/images/impact/story-3.jpg",
    imageAlt: "A community leadership workshop.",
  },
];

export const annualProgress: { year: string; milestone: string }[] = [
  { year: "2022", milestone: "Expanded community awareness activities (sample)" },
  { year: "2023", milestone: "Introduced research and digital-awareness work (sample)" },
  { year: "2024", milestone: "Strengthened referral partnerships (sample)" },
  { year: "2025", milestone: "Developed partnership consultation programme (sample)" },
];

export const sdgAlignments: SDGAlignment[] = [
  { code: "SDG 4", title: "Quality Education" },
  { code: "SDG 5", title: "Gender Equality" },
  { code: "SDG 10", title: "Reduced Inequalities" },
  { code: "SDG 16", title: "Peace, Justice and Strong Institutions" },
  { code: "SDG 17", title: "Partnerships for the Goals" },
];
