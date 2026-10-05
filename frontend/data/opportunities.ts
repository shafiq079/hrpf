import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Handshake,
  Megaphone,
  Users,
  UserPlus,
  Wrench,
} from "lucide-react";

/*
  Ways to get involved for /get-involved.
*/

export interface Opportunity {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const opportunities: Opportunity[] = [
  {
    title: "Volunteer",
    description:
      "Support community activities, awareness campaigns, research, communications or administration.",
    icon: Handshake,
  },
  {
    title: "Become a Member",
    description:
      "Join a network of people committed to responsible human-rights protection.",
    icon: UserPlus,
  },
  {
    title: "Internship",
    description:
      "Develop practical experience in nonprofit programmes, research, communications or community engagement.",
    icon: Briefcase,
  },
  {
    title: "Join a Campaign",
    description:
      "Participate in responsible awareness initiatives addressing specific human-rights concerns.",
    icon: Megaphone,
  },
  {
    title: "Community Representative",
    description:
      "Help communicate local concerns and share verified information about community needs.",
    icon: Users,
  },
  {
    title: "Professional Services",
    description:
      "Offer relevant legal, research, technical, design, training or communications expertise.",
    icon: Wrench,
  },
];

export interface VacancyRole {
  title: string;
  type: string;
  location: string;
  summary: string;
  /** Marked clearly as an example position. */
  example: true;
}

// NOTE: no real vacancies are published. These are clearly labelled examples.
export const exampleVacancies: VacancyRole[] = [];
