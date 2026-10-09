export const workAreas = [
  { slug: 'womens-rights', title: "Women's Rights" },
  { slug: 'childrens-rights', title: "Children's Rights" },
  { slug: 'access-to-justice', title: 'Access to Justice' },
  { slug: 'minority-rights', title: 'Minority Rights' },
  { slug: 'education-and-awareness', title: 'Education and Awareness' },
  { slug: 'research-and-advocacy', title: 'Research and Advocacy' },
  { slug: 'refugees-and-migrants', title: 'Refugees and Migrants' },
  { slug: 'community-development', title: 'Community Development' },
] as const;
export const workAreaSlugs = workAreas.map(area => area.slug);
export type WorkAreaSlug = typeof workAreas[number]['slug'];
export function focusPattern(label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]");
  return `(?:^|[\\s,/&])${escaped}(?=$|[\\s,/&])`;
}
/** Compatibility for old records. An explicit empty selection means All Projects only. */
export function projectWorkAreas(row: { workAreas?: string[] | null; focusArea?: string | null }): WorkAreaSlug[] {
  return Array.isArray(row.workAreas) ? row.workAreas.filter((slug): slug is WorkAreaSlug => workAreaSlugs.some(known => known === slug))
    : workAreas.filter(area => new RegExp(focusPattern(area.title), 'i').test(row.focusArea ?? '')).map(area => area.slug);
}
