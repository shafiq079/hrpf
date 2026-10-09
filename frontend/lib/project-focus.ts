export const projectWorkPages = [
  { slug: "womens-rights", title: "Women's Rights" },
  { slug: "childrens-rights", title: "Children's Rights" },
  { slug: "access-to-justice", title: "Access to Justice" },
  { slug: "minority-rights", title: "Minority Rights" },
  { slug: "education-and-awareness", title: "Education and Awareness" },
  { slug: "research-and-advocacy", title: "Research and Advocacy" },
  { slug: "refugees-and-migrants", title: "Refugees and Migrants" },
  { slug: "community-development", title: "Community Development" },
] as const;
/** Legacy labels are used only when explicit placements have never been saved. */
export const projectFocusFields = ["Women's Rights", "Children's Rights", "Access to Justice", "Minority Rights", "Education and Awareness", "Research and Advocacy", "Refugees and Migrants", "Community Development"] as const;
export function projectMatchesField(value: string, field: string) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/['’]/g, "['’]");
  return new RegExp(`(?:^|[\\s,/&])${escaped}(?=$|[\\s,/&])`, "i").test(value);
}
export function projectFields(value: string): string[] {
  const known = projectFocusFields.filter(field => projectMatchesField(value, field));
  return known.length ? [...known] : value.split(",").map(field => field.trim()).filter(Boolean);
}
export function selectedWorkPages(project: { workAreas?: string[]; focusArea: string }): string[] {
  return Array.isArray(project.workAreas) ? project.workAreas.filter(slug => projectWorkPages.some(page => page.slug === slug))
    : projectWorkPages.filter(page => projectMatchesField(project.focusArea, page.title)).map(page => page.slug);
}
export function projectPageLabels(project: { workAreas?: string[]; focusArea: string }): string[] {
  const slugs = selectedWorkPages(project);
  return projectWorkPages.filter(page => slugs.includes(page.slug)).map(page => page.title);
}
export function projectAppearsInField(project: { workAreas?: string[]; focusArea: string }, field: string) {
  return projectPageLabels(project).includes(field);
}
