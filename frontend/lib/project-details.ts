export type TextBlock = {
  type: "paragraph" | "heading" | "list";
  text?: string;
  items?: string[];
};
export type ProjectDetails = {
  overview?: string;
  challenge?: string;
  approach?: string;
  period?: string;
  targetCommunity?: string;
  objectives?: string[];
  activities?: string[];
  outcomes?: string[];
  partners?: string[];
  milestones?: { period: string; title: string; description?: string }[];
  metrics?: { value: string; label: string; source?: string }[];
  sections?: { heading: string; body: string }[];
};
export type ProjectDetail = {
  title: string;
  slug: string;
  summary: string;
  focusArea: string;
  location: string;
  status: "Ongoing" | "Completed" | "Proposed" | "Emergency Response";
  startYear?: number;
  image?: string | null;
  imageAlt?: string;
  blocks: TextBlock[];
  details?: ProjectDetails;
  gallery?: { image: string; alt: string; caption?: string }[];
  documents?: { file: string; label: string }[];
};
