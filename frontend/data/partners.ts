export interface Partner {
  name: string;
  /** Full name for accessible labelling. */
  fullName: string;
}

/*
  NOTE: These are placeholder institutional partners rendered as text wordmarks.
  They MUST be replaced with approved, licensed partner logos before production.
*/
export const partners: Partner[] = [
  { name: "UNHCR", fullName: "UN Refugee Agency" },
  { name: "ICRC", fullName: "International Committee of the Red Cross" },
  { name: "Amnesty", fullName: "Amnesty International" },
  { name: "World Bank", fullName: "The World Bank" },
  { name: "WHO", fullName: "World Health Organization" },
];
