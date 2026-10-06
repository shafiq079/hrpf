import home from "@/data/homepage.json";
import { Quote } from "lucide-react";
import Container from "@/components/shared/Container";
import AppImage from "@/components/shared/AppImage";
import Reveal from "@/components/shared/Reveal";

/** Original quote layout with a sourced chairman statement and HRPF archive photograph. */
export default function TestimonialSection() {
  return (
    <section className="bg-off-white py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Testimonial */}
          <Reveal>
            <figure className="border-l-2 border-teal pl-6 sm:pl-8">
              <Quote className="h-9 w-9 text-teal" aria-hidden="true" />
              <blockquote className="mt-4 font-serif text-[22px] italic leading-snug text-navy sm:text-[26px] lg:text-[30px]">
                &ldquo;{home.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-navy text-sm font-semibold text-white">
                  YB
                </span>
                <span>
                  <span className="block text-sm font-semibold text-text">
                    {home.quoteName}
                  </span>
                  <span className="block text-sm text-muted">
                    {home.quoteRole}
                  </span>
                </span>
              </figcaption>
            </figure>
          </Reveal>

          {/* Image */}
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border shadow-[0_16px_40px_-24px_rgba(8,47,67,0.4)] lg:aspect-[3/2]">
              <AppImage
                src="/images/hrpf/home-chairman.webp"
                alt="Participants in a public-awareness event from HRPF’s supplied photo archive."
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
