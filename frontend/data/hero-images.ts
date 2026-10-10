/** Topic imagery is decorative; it does not identify staff or document a project.
 * Photo provenance and replacement instructions: docs/HERO_IMAGES.md.
 */
export type HeroImage = {
  src: string;
  position: string;
  mobilePosition?: string;
  variants?: {
    desktop: { src: string; width: number; height: number };
    mobile: { src: string; width: number; height: number };
  };
};

/** Separate compositions; widths in srcSet still use the Next.js optimizer. */
function stockHero(
  name: string,
  mobileWidth: number,
  mobileHeight: number,
  mobilePosition: string,
  desktopWidth = 2172,
  desktopHeight = 724,
): HeroImage {
  const src = `/images/heroes/v2/${name}-desktop.webp`;
  return {
    src,
    position: "50% 50%",
    mobilePosition,
    variants: {
      desktop: { src, width: desktopWidth, height: desktopHeight },
      mobile: {
        src: `/images/heroes/v2/${name}-mobile.webp`,
        width: mobileWidth,
        height: mobileHeight,
      },
    },
  };
}

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
  vision: stockHero("vision", 1800, 1200, "50% 58%"),
  writing: stockHero("writing", 1200, 1800, "50% 60%", 2161, 728),
  teamwork: stockHero("teamwork", 1800, 1200, "55% 50%"),
  contact: stockHero("contact", 1350, 1800, "50% 45%"),
  justice: stockHero("justice", 1800, 1200, "68% 40%"),
  microphone: stockHero("microphone", 1800, 1200, "50% 45%", 2170, 725),
  camera: stockHero("camera", 1331, 1800, "50% 55%"),
  documents: stockHero("documents", 1800, 1200, "50% 50%"),
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
