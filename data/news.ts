/*
  News powers the homepage "Latest News" grid, the /news listing and the
  /news/[slug] article template.

  SAMPLE CONTENT NOTICE: articles below are illustrative "Development Content"
  for a demonstration website. They do not describe verified events and must be
  reviewed before publication.
*/

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface NewsArticle {
  slug: string;
  category: string;
  title: string;
  summary: string;
  author: string;
  authorRole: string;
  date: string; // ISO date
  readingTime: string;
  image: string;
  imageAlt: string;
  href: string;
  featured?: boolean;
  tags: string[];
  // Detail content
  intro?: string;
  sections?: ArticleSection[];
  pullQuote?: string;
  sources?: string[];
}

export const newsArticles: NewsArticle[] = [
  {
    slug: "building-safer-digital-spaces",
    category: "Human-Rights Education",
    title: "Building Safer Digital Spaces for Young People",
    summary:
      "Digital-rights education should be treated as an important part of modern child protection.",
    author: "Communications Team",
    authorRole: "HRPF Communications",
    date: "2026-06-18",
    readingTime: "6 min read",
    image: "/images/news/digital-spaces.jpg",
    imageAlt: "A young person using a laptop in a safe learning environment.",
    href: "/news/building-safer-digital-spaces",
    featured: true,
    tags: ["Digital Rights", "Education", "Child Protection"],
    intro:
      "Digital platforms provide young people with access to education, communication and opportunity. They can also expose users to privacy risks, misinformation, harassment and exploitation. Digital-rights education should therefore be treated as an important part of modern child protection.",
    sections: [
      {
        heading: "Understanding Digital Rights",
        paragraphs: [
          "Digital rights extend familiar principles — privacy, dignity, freedom of expression and protection from harm — into online spaces.",
          "Helping young people understand these rights is the first step toward safer participation online.",
        ],
      },
      {
        heading: "Common Risks Young People Face",
        paragraphs: [
          "Young people may encounter privacy risks, misinformation, harassment and content that is inappropriate or exploitative.",
          "Awareness of these risks helps young people make safer choices and know when to seek support.",
        ],
      },
      {
        heading: "The Role of Parents and Educators",
        paragraphs: [
          "Parents and educators play a central role in modelling safe habits and maintaining open, non-judgemental conversations.",
          "Practical guidance is often more effective than restriction alone.",
        ],
      },
      {
        heading: "Building Safer Online Habits",
        paragraphs: [
          "Simple habits — strong privacy settings, careful sharing and critical evaluation of sources — reduce everyday risks.",
        ],
      },
      {
        heading: "When and Where to Seek Help",
        paragraphs: [
          "Young people should know trusted channels for reporting concerns, both within their community and through qualified services.",
        ],
      },
      {
        heading: "How Community Organizations Can Contribute",
        paragraphs: [
          "Community organizations can offer accessible education, resources and referral, complementing the work of families and schools.",
        ],
      },
    ],
    pullQuote:
      "People can only protect rights they understand — and that includes digital rights.",
    sources: [
      "Sample reference: internal HRPF digital-awareness guidance (illustrative).",
    ],
  },
  {
    slug: "why-community-legal-awareness-matters",
    category: "Human-Rights Education",
    title: "Why Community Legal Awareness Matters",
    summary:
      "Legal awareness helps communities understand available pathways and make informed decisions.",
    author: "Programme Team",
    authorRole: "HRPF Programmes",
    date: "2026-05-30",
    readingTime: "5 min read",
    image: "/images/news/legal-awareness.jpg",
    imageAlt: "Community members attending a legal-awareness session.",
    href: "/news/why-community-legal-awareness-matters",
    tags: ["Access to Justice", "Community"],
    intro:
      "Legal awareness is often the difference between confusion and confident action. This article explores why accessible legal information matters.",
    sections: [
      {
        heading: "Knowledge as Protection",
        paragraphs: [
          "Understanding basic rights and processes helps people avoid unsafe decisions and seek appropriate support.",
        ],
      },
    ],
  },
  {
    slug: "responsible-documentation-principles",
    category: "Human-Rights Education",
    title: "Five Principles of Responsible Human-Rights Documentation",
    summary:
      "Responsible documentation protects individuals while supporting accountability.",
    author: "Research Team",
    authorRole: "HRPF Research",
    date: "2026-05-12",
    readingTime: "7 min read",
    image: "/images/news/documentation.jpg",
    imageAlt: "A researcher organising documents and notes.",
    href: "/news/responsible-documentation-principles",
    tags: ["Research", "Documentation"],
    intro:
      "Documentation is powerful, but it must be handled responsibly to protect the people it aims to help.",
    sections: [
      {
        heading: "Consent and Confidentiality",
        paragraphs: [
          "Responsible documentation begins with informed consent and careful protection of sensitive information.",
        ],
      },
    ],
  },
  {
    slug: "women-leading-change",
    category: "Success Stories",
    title: "Women Leading Change in Their Communities",
    summary:
      "Community leadership initiatives support women's participation in decision-making.",
    author: "Communications Team",
    authorRole: "HRPF Communications",
    date: "2026-04-22",
    readingTime: "4 min read",
    image: "/images/news/women-leading.jpg",
    imageAlt: "Women collaborating during a community meeting.",
    href: "/news/women-leading-change",
    tags: ["Women's Rights", "Leadership"],
    intro:
      "This sample story highlights the value of supporting women's participation in community life.",
    sections: [
      {
        heading: "Participation Builds Resilience",
        paragraphs: [
          "When women participate in decision-making, communities benefit from broader perspectives and stronger outcomes.",
        ],
      },
    ],
  },
  {
    slug: "education-as-foundation",
    category: "Human-Rights Education",
    title: "Education as a Foundation for Human Dignity",
    summary:
      "Accessible education underpins awareness, opportunity and long-term protection.",
    author: "Programme Team",
    authorRole: "HRPF Programmes",
    date: "2026-03-28",
    readingTime: "5 min read",
    image: "/images/news/education-foundation.jpg",
    imageAlt: "Students engaged in a classroom learning activity.",
    href: "/news/education-as-foundation",
    tags: ["Education", "Awareness"],
    intro:
      "Education is a foundation for dignity, opportunity and the ability to claim one's rights.",
    sections: [
      {
        heading: "Why Education Matters",
        paragraphs: [
          "Education expands opportunity and equips people to understand and exercise their rights.",
        ],
      },
    ],
  },
  {
    slug: "new-partnership-consultation-programme",
    category: "Press Releases",
    title: "HRPF Announces New Partnership Consultation Programme",
    summary:
      "A new consultation programme invites responsible institutions to explore collaboration.",
    author: "Executive Office",
    authorRole: "HRPF Leadership",
    date: "2026-03-05",
    readingTime: "3 min read",
    image: "/images/news/partnership.jpg",
    imageAlt: "Representatives meeting to discuss a potential partnership.",
    href: "/news/new-partnership-consultation-programme",
    tags: ["Partnerships", "Announcement"],
    intro:
      "HRPF is introducing a consultation programme (sample announcement) to strengthen responsible institutional partnerships.",
    sections: [
      {
        heading: "About the Programme",
        paragraphs: [
          "The programme provides a structured way for institutions to explore compatible, transparent collaboration.",
        ],
      },
    ],
  },
];

export const newsCategories: string[] = [
  "Latest News",
  "Project Updates",
  "Human-Rights Education",
  "Success Stories",
  "Press Releases",
  "Campaigns",
  "Events",
];

export function getArticle(slug: string): NewsArticle | undefined {
  return newsArticles.find((article) => article.slug === slug);
}
