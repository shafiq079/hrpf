import home from "@/data/homepage.json";
import { Noto_Nastaliq_Urdu } from "next/font/google";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import PrimaryButton from "@/components/shared/PrimaryButton";
import AppImage from "@/components/shared/AppImage";

// Match the Urdu typeface and 500 weight used by the existing hrpf.org site.
// Loading it here keeps the self-hosted font/preload scoped to the homepage.
const urdu = Noto_Nastaliq_Urdu({
  weight: "500",
  subsets: ["arabic"],
  display: "swap",
});

/** Full-width hero with documentary imagery and a navy overlay. */
export default function HeroSection() {
  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden lg:min-h-[660px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <AppImage
          src="/images/hrpf/home-hero.webp"
          alt="Participants at an HRPF public gathering holding an organisational banner."
          fill
          priority
          sizes="100vw"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Navy overlay — stronger on the left for readable, left-aligned text */}
      <div aria-hidden="true" className="absolute inset-0 bg-navy/70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy/70 to-navy/40"
      />

      <Container className="relative z-10 py-20 lg:py-28">
        <div className="max-w-2xl">
          <h1
            lang="ur"
            dir="rtl"
            translate="no"
            className={`${urdu.className} notranslate text-[clamp(2.125rem,5vw,4.5rem)] font-medium leading-[2] tracking-normal text-white`}
          >
            ہیومن رائٹس پروٹیکشن فاؤنڈیشن پاکستان
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-[17px]">
            {home.hero}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryButton
              href="/our-work"
              variant="navy"
              size="lg"
              icon={ArrowRight}
            >
              Explore Our Work
            </PrimaryButton>
            <PrimaryButton
              href="/file-a-complaint"
              variant="red"
              size="lg"
              icon={AlertTriangle}
              iconPosition="left"
            >
              Report a Violation
            </PrimaryButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
