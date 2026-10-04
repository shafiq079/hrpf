/*
  Reports & resources for /reports.

  SAMPLE CONTENT NOTICE: titles, years and file sizes are placeholders.
  TODO: place approved PDF files in /public/documents/ and set `fileUrl` on each
  resource. Until a file exists, `fileUrl` stays undefined so the download button
  is disabled and shows "File coming soon" (never a broken link).
*/

export type ResourceCategory =
  | "Annual Reports"
  | "Financial Reports"
  | "Research Reports"
  | "Policy Briefs"
  | "Human-Rights Guides"
  | "Training Manuals"
  | "Awareness Materials"
  | "Organizational Policies";

export interface ReportResource {
  slug: string;
  title: string;
  category: ResourceCategory;
  year: number;
  language: string;
  fileType: string;
  fileSize: string;
  summary: string;
  /** Undefined until an approved file is available. */
  fileUrl?: string;
}

export const resourceCategories: ResourceCategory[] = [
  "Annual Reports",
  "Financial Reports",
  "Research Reports",
  "Policy Briefs",
  "Human-Rights Guides",
  "Training Manuals",
  "Awareness Materials",
  "Organizational Policies",
];

export const reports: ReportResource[] = [
  {
    slug: "annual-report-2025",
    title: "Annual Report 2025",
    category: "Annual Reports",
    year: 2025,
    language: "English",
    fileType: "PDF",
    fileSize: "≈ 3.2 MB (placeholder)",
    summary:
      "An overview of sample activities, learning and priorities for the year (illustrative content).",
  },
  {
    slug: "community-rights-awareness-guide",
    title: "Community Rights Awareness Guide",
    category: "Human-Rights Guides",
    year: 2025,
    language: "English",
    fileType: "PDF",
    fileSize: "≈ 1.1 MB (placeholder)",
    summary:
      "An accessible introduction to common rights and available support channels.",
  },
  {
    slug: "responsible-case-documentation",
    title: "Introduction to Responsible Case Documentation",
    category: "Training Manuals",
    year: 2024,
    language: "English",
    fileType: "PDF",
    fileSize: "≈ 900 KB (placeholder)",
    summary:
      "Guidance on documenting concerns responsibly while protecting confidentiality.",
  },
  {
    slug: "digital-privacy-and-young-people",
    title: "Digital Privacy and Young People",
    category: "Awareness Materials",
    year: 2024,
    language: "English",
    fileType: "PDF",
    fileSize: "≈ 750 KB (placeholder)",
    summary:
      "A short awareness resource on digital privacy risks and safer online habits.",
  },
  {
    slug: "safeguarding-policy",
    title: "Safeguarding Policy",
    category: "Organizational Policies",
    year: 2025,
    language: "English",
    fileType: "PDF",
    fileSize: "≈ 400 KB (placeholder)",
    summary:
      "Our commitment and procedures for protecting people who interact with HRPF.",
  },
  {
    slug: "volunteer-code-of-conduct",
    title: "Volunteer Code of Conduct",
    category: "Organizational Policies",
    year: 2025,
    language: "English",
    fileType: "PDF",
    fileSize: "≈ 320 KB (placeholder)",
    summary:
      "Expected standards of conduct for volunteers representing HRPF.",
  },
  {
    slug: "partnership-due-diligence-framework",
    title: "Partnership and Due-Diligence Framework",
    category: "Policy Briefs",
    year: 2025,
    language: "English",
    fileType: "PDF",
    fileSize: "≈ 500 KB (placeholder)",
    summary:
      "How HRPF reviews and approves responsible institutional partnerships.",
  },
  {
    slug: "complaints-and-feedback-policy",
    title: "Complaints and Feedback Policy",
    category: "Organizational Policies",
    year: 2024,
    language: "English",
    fileType: "PDF",
    fileSize: "≈ 280 KB (placeholder)",
    summary:
      "How to raise a concern about HRPF and how complaints are handled.",
  },
];

export function getReport(slug: string): ReportResource | undefined {
  return reports.find((report) => report.slug === slug);
}
