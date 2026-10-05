import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import PrimaryButton from "@/components/shared/PrimaryButton";

export default function NotFound() {
  return (
    <main id="main-content" className="flex-1">
      <section className="bg-off-white py-24 sm:py-28 lg:py-32">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-teal-dark">404 — Page Not Found</p>
            <h1 className="mt-4 font-serif text-[30px] font-semibold leading-tight text-navy sm:text-[38px] lg:text-[44px]">
              We Couldn&rsquo;t Find That Page
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              The page may have been moved, renamed or is temporarily
              unavailable.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryButton href="/" variant="navy" icon={ArrowRight}>
                Return Home
              </PrimaryButton>
              <PrimaryButton href="/our-work" variant="outline">
                View Our Work
              </PrimaryButton>
              <PrimaryButton href="/contact" variant="navy">
                Contact Us
              </PrimaryButton>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
