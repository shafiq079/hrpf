/** Topic imagery is decorative; it does not identify staff or document a project.
 * Photo provenance and replacement instructions: docs/HERO_IMAGES.md.
 */
export type HeroImage = {
  src: string;
  position: string;
  mobilePosition?: string;
};

export const heroImages = {
  about: { src: "/images/hrpf/home-about.webp", position: "55% 28%" },
  community: {
    src: "/images/hrpf/home-hero.webp",
    position: "65% 42%",
    mobilePosition: "62% 42%",
  },
  advocacy: {
    src: "/images/hrpf/research-and-advocacy-archive.webp",
    position: "60% 34%",
  },
  leadership: { src: "/images/hrpf/home-chairman.webp", position: "65% 50%" },
  reports: { src: "/images/hrpf/home-report-2024.webp", position: "55% 45%" },
  vision: { src: "/images/heroes/v1/vision.webp", position: "50% 58%" },
  writing: {
    src: "/images/heroes/v1/writing.webp",
    position: "50% 55%",
    mobilePosition: "50% 60%",
  },
  teamwork: { src: "/images/heroes/v1/teamwork.webp", position: "55% 50%" },
  contact: { src: "/images/heroes/v1/contact.webp", position: "50% 45%" },
  justice: {
    src: "/images/heroes/v1/justice.webp",
    position: "50% 40%",
    mobilePosition: "68% 40%",
  },
  microphone: { src: "/images/heroes/v1/microphone.webp", position: "50% 45%" },
  camera: {
    src: "/images/heroes/v1/camera.webp",
    position: "50% 61%",
    mobilePosition: "50% 55%",
  },
  documents: { src: "/images/heroes/v1/documents.webp", position: "50% 50%" },
} satisfies Record<string, HeroImage>;

export type HeroImageKey = keyof typeof heroImages;

/** A missing project cover gets conceptual imagery, never another project's photo. */
export function projectHeroImage(focusArea: string): HeroImageKey {
  if (/justice|legal|prison|accountability/i.test(focusArea)) return "justice";
  if (/education|awareness|research|information|advocacy/i.test(focusArea))
    return "writing";
  if (/water|environment|community development|rural/i.test(focusArea))
    return "vision";
  return "teamwork";
}

export const aboutHeroImages = {
  "who-we-are": "about",
  "mission-and-vision": "vision",
  "aims-and-objectives": "writing",
  "message-of-ceo": "leadership",
  "board-of-directors": "teamwork",
  "our-team": "teamwork",
  "registration-and-certificates": "documents",
  "progress-reports": "reports",
} satisfies Record<string, HeroImageKey>;
