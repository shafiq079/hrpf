import { AlertTriangle, ArrowRight, Mail } from "lucide-react";
import Container from "@/components/shared/Container";
import PrimaryButton from "@/components/shared/PrimaryButton";

/** Closing full-width navy call-to-action band. */
export default function FinalCallToAction() {
  return (
    <section className="bg-navy py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[28px] leading-tight text-white sm:text-[34px] lg:text-[42px]">
            Every Person Deserves Dignity,
            <br className="hidden sm:block" /> Safety and Justice.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-base">
            Join our global network of protectors. Whether you contribute time,
            funds or information, your action creates a ripple of justice across
            the world.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryButton
              href="/report-a-violation"
              variant="red"
              size="lg"
              icon={AlertTriangle}
              iconPosition="left"
            >
              Report a Violation
            </PrimaryButton>
            <PrimaryButton
              href="/donate"
              variant="gold"
              size="lg"
              icon={ArrowRight}
            >
              Donate Now
            </PrimaryButton>
            <PrimaryButton
              href="/contact"
              variant="outlineDark"
              size="lg"
              icon={Mail}
              iconPosition="left"
            >
              Contact Us
            </PrimaryButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
