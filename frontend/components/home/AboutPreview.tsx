import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import AppImage from "@/components/shared/AppImage";
import Reveal from "@/components/shared/Reveal";

/** Two-column "Who we are" preview with an overlapping quote strip. */
export default function AboutPreview() {
  return (
    <section className="bg-off-white py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image + overlapping quote */}
          <Reveal className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border shadow-[0_16px_40px_-24px_rgba(8,47,67,0.4)]">
              <AppImage
                src="/images/about-community.jpg"
                alt="An advocate speaking with community members during an outreach visit."
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover"
              />
            </div>
            <blockquote className="mt-4 rounded-md bg-teal px-5 py-4 text-white lg:absolute lg:-bottom-6 lg:left-6 lg:right-12 lg:mt-0 lg:shadow-lg">
              <p className="font-serif text-[15px] italic leading-snug sm:text-base">
                &ldquo;Human rights are not a privilege; they are our
                birthright.&rdquo;
              </p>
            </blockquote>
          </Reveal>

          {/* Content */}
          <Reveal delay={0.1}>
            <div className="lg:pl-2">
              <p className="eyebrow">Who We Are</p>
              <h2 className="mt-3 text-[28px] leading-tight sm:text-[34px] lg:text-[40px]">
                A Legacy of Advocacy and Impact
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">
                Since our inception, the Human Rights Protection Foundation has
                been a beacon of hope for those marginalized by systemic
                injustice. We operate through a network of legal experts,
                community organizers and global advocates.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                Our approach combines high-level legal advocacy with grassroots
                empowerment, ensuring that change is not just systemic, but
                deeply rooted in the communities we serve.
              </p>
              <Link
                href="/about"
                className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
              >
                Learn more about our mission
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
