import type { LucideIcon } from "lucide-react";
import { BookOpenCheck, Building2, Globe, GraduationCap, HeartHandshake, Scale, Users, UserRound } from "lucide-react";
import { getWorkAreaContent } from "./workAreas";

export interface FocusArea {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
}
const fields: [string, LucideIcon][] = [
  ["womens-rights", UserRound], ["childrens-rights", HeartHandshake],
  ["access-to-justice", Scale], ["minority-rights", Users],
  ["education-and-awareness", GraduationCap], ["research-and-advocacy", BookOpenCheck],
  ["refugees-and-migrants", Globe], ["community-development", Building2],
];
export const focusAreas: FocusArea[] = fields.map(([slug, icon]) => {
  const content = getWorkAreaContent(slug)!;
  return { slug, icon, title: content.title, description: content.description };
});
export function getFocusArea(slug: string) {
  return focusAreas.find(area => area.slug === slug);
}
