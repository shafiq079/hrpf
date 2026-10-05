/*
  Events for /events and /events/[slug].

  SAMPLE CONTENT NOTICE: events below are illustrative and NOT confirmed.
  Do not present them as real scheduled events.
*/

export type EventType =
  | "Workshop"
  | "Training"
  | "Webinar"
  | "Conference"
  | "Community Meeting"
  | "Awareness Session";

export interface EventSpeaker {
  name: string;
  role: string;
}

export interface EventItem {
  slug: string;
  title: string;
  type: EventType;
  date: string; // ISO date
  time: string;
  location: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  past?: boolean;
  organizer?: string;
  speakers?: EventSpeaker[];
  agenda?: { time: string; item: string }[];
}

export const eventTypes: EventType[] = [
  "Workshop",
  "Training",
  "Webinar",
  "Conference",
  "Community Meeting",
  "Awareness Session",
];

export const events: EventItem[] = [
  {
    slug: "digital-rights-workshop",
    title: "Digital Rights Awareness Workshop",
    type: "Workshop",
    date: "2026-09-15",
    time: "10:00 – 12:30",
    location: "Community Centre (sample)",
    description:
      "An interactive workshop introducing digital rights and safer online habits for young people.",
    image: "/images/events/digital-rights.jpg",
    imageAlt: "Participants at a digital rights workshop.",
    href: "/events/digital-rights-workshop",
    organizer: "HRPF Education Team",
    speakers: [{ name: "Full Name", role: "Facilitator (sample)" }],
    agenda: [
      { time: "10:00", item: "Welcome and introductions" },
      { time: "10:30", item: "Understanding digital rights" },
      { time: "11:30", item: "Practical safer-habits session" },
    ],
  },
  {
    slug: "community-legal-awareness-session",
    title: "Community Legal Awareness Session",
    type: "Awareness Session",
    date: "2026-10-05",
    time: "14:00 – 16:00",
    location: "Regional Hall (sample)",
    description:
      "A session explaining common legal pathways and available referral support.",
    image: "/images/events/legal-awareness.jpg",
    imageAlt: "A community legal-awareness session in progress.",
    href: "/events/community-legal-awareness-session",
    organizer: "HRPF Programme Team",
  },
  {
    slug: "responsible-documentation-training",
    title: "Responsible Documentation Training",
    type: "Training",
    date: "2026-11-12",
    time: "09:30 – 13:00",
    location: "Online (webinar)",
    description:
      "A training session on documenting concerns responsibly and protecting confidentiality.",
    image: "/images/events/documentation-training.jpg",
    imageAlt: "A trainer presenting documentation guidance.",
    href: "/events/responsible-documentation-training",
    organizer: "HRPF Research Team",
  },
  {
    slug: "annual-community-forum-2025",
    title: "Annual Community Forum 2025",
    type: "Conference",
    date: "2025-12-03",
    time: "09:00 – 17:00",
    location: "Conference Venue (sample)",
    description:
      "A past forum bringing together communities and partners to discuss priorities.",
    image: "/images/events/community-forum.jpg",
    imageAlt: "Attendees at a community forum.",
    href: "/events/annual-community-forum-2025",
    past: true,
    organizer: "HRPF",
  },
  {
    slug: "womens-leadership-webinar",
    title: "Women's Leadership Webinar",
    type: "Webinar",
    date: "2025-10-20",
    time: "16:00 – 17:00",
    location: "Online (webinar)",
    description:
      "A past webinar on supporting women's participation in community decision-making.",
    image: "/images/events/leadership-webinar.jpg",
    imageAlt: "A webinar session on community leadership.",
    href: "/events/womens-leadership-webinar",
    past: true,
    organizer: "HRPF Programme Team",
  },
];

export function getEvent(slug: string): EventItem | undefined {
  return events.find((event) => event.slug === slug);
}
