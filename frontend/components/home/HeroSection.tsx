import { AlertTriangle, ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import PrimaryButton from "@/components/shared/PrimaryButton";
import AppImage from "@/components/shared/AppImage";

/** Full-width hero with documentary imagery and a navy overlay. */
export default function HeroSection() {
  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden lg:min-h-[660px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <AppImage
          src="/images/hero-community.jpg"
          alt="Community members standing together in solidarity."
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
          <p className="eyebrow text-teal">
            Human Rights Protection Foundation Pakistan
          </p>
          <h1 className="mt-4 font-serif text-[38px] font-semibold leading-[1.1] text-white sm:text-5xl lg:text-[60px]">
            Protecting Dignity.
            <br />
            Defending Rights.
            <br />
            Empowering Communities.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-[17px]">
            Human Rights Protection Foundation Pakistan is a non-governmental,
            non-political, public-interest organization.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryButton
              href="/what-we-do"
              variant="navy"
              size="lg"
              icon={ArrowRight}
            >
              Explore Our Work
            </PrimaryButton>
            <PrimaryButton
              href="/report-a-violation"
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
