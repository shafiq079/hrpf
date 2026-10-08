/** Existing project records store comma-separated related fields in focusArea. */
export const projectFocusFields = ["Women's Rights", "Children's Rights", "Access to Justice", "Minority Rights", "Education and Awareness", "Research and Advocacy", "Refugees and Migrants", "Community Development"] as const;
export function projectMatchesField(value: string, field: string) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/['’]/g, "['’]");
  return new RegExp(`(?:^|[\\s,/&])${escaped}(?=$|[\\s,/&])`, "i").test(value);
}
export function projectFields(value: string): string[] {
  const known = projectFocusFields.filter(field => projectMatchesField(value, field));
  return known.length ? [...known] : value.split(",").map(field => field.trim()).filter(Boolean);
}
