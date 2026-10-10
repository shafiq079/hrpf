import { objectivesDescription } from "./aims-and-objectives";

export const aboutSections = [
  { slug: "who-we-are", label: "Who We Are", description: "Our identity, approach and commitment to human rights in Pakistan." },
  { slug: "profile", label: "Profile", description: "An overview of the Foundation and its complete organizational profile." },
  { slug: "mission-and-vision", label: "Mission and Vision", description: "The purpose that guides our work and the society we strive to build." },
  { slug: "aims-and-objectives", label: "Aims and Objectives", description: objectivesDescription },
  { slug: "message-of-ceo", label: "Message of CEO", description: "Read the supplied leadership message from HRPF’s Chairman." },
  { slug: "board-of-directors", label: "Board of Directors", description: "Meet the directors and office bearers listed in HRPF’s organisation documents." },
  { slug: "our-team", label: "Our Team", description: "The operational team supporting HRPF’s day-to-day work." },
  { slug: "registration-and-certificates", label: "Registration and Certificates", description: "View organisation documents approved for public release." },
  { slug: "progress-reports", label: "Progress Reports", description: "Read published reports on HRPF’s work and progress." },
] as const;
