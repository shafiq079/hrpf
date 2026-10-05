import pages from "./ngo-pages.json";
import details from "./ngo-details.json";
import type { Content } from "@/lib/public-content";

// Final public copy from the owner's given pages, current social handles and profile.
// Profile is used only for core values, curated aims and thematic pillars.
// These files are bundled with the frontend; no seed, database, admin approval or API is needed.
export const ngoPages = pages as Record<string, Content>;
export const ngoDetails = details;
export const homeCopy = {
  mission:
    "To protect human dignity and rights through lawful advocacy, access to information, institutional accountability and support for vulnerable communities. Our work also promotes clean water, environmental protection and maternal healthcare.",
  vision:
    "A society where every person lives with dignity, equality and freedom, with access to healthcare, education, clean water and justice.",
};
