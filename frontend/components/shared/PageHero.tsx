import TranslationText from "@/components/translation/TranslationText";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import Container from "./Container";
import PrimaryButton from "./PrimaryButton";
import Breadcrumbs, { type Crumb } from "./Breadcrumbs";
import HeroBackdrop from "./HeroBackdrop";
import type { HeroImageKey } from "@/data/hero-images";
import type { ButtonVariant } from "./PrimaryButton";

export interface PageHeroAction {
  label: string;
  href: string;
  variant?: ButtonVariant;
  icon?: ComponentType<LucideProps>;
  iconPosition?: "left" | "right";
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  heroImage: HeroImageKey;
  /** Optional published cover, with topic imagery used when it is absent. */
  backgroundImage?: string;
  actions?: PageHeroAction[];
  align?: "left" | "center";
}

/**
 * Internal-page photo hero. The navy overlay protects text contrast while
 * leaving the topic photograph visible. Full page content remains below it.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  heroImage,
  backgroundImage,
  actions,
  align = "left",
}: PageHeroProps) {
  const isCenter = align === "center";

  return (
    <section className="hrpf-page-hero relative flex min-h-[340px] items-center overflow-hidden bg-navy sm:min-h-[380px]">
      <HeroBackdrop
        image={heroImage}
        backgroundImage={backgroundImage}
        centered={isCenter}
      />

      <Container className="relative z-10 py-14 sm:py-16 lg:py-20">
        <div
          className={isCenter ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}
        >
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs
              items={breadcrumbs}
              tone="light"
              className={`[&_ol]:text-white/95 ${isCenter ? "flex justify-center" : ""}`}
            />
          )}
          {eyebrow && (
            <p className="eyebrow mt-4 text-white/90">
              <TranslationText>{eyebrow}</TranslationText>
            </p>
          )}
          <h1 className="mt-3 font-serif text-[30px] font-semibold leading-tight text-white sm:text-[38px] lg:text-[44px]">
            <TranslationText>{title}</TranslationText>
          </h1>
          {description && (
            <p
              className={`mt-4 text-[15px] leading-relaxed text-white/95 sm:text-base ${
                isCenter ? "mx-auto max-w-2xl" : "max-w-2xl"
              }`}
            >
              <TranslationText>{description}</TranslationText>
            </p>
          )}
          {actions && actions.length > 0 && (
            <div
              className={`mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap ${
                isCenter ? "sm:justify-center" : ""
              }`}
            >
              {actions.map((action) => (
                <PrimaryButton
                  key={action.label}
                  href={action.href}
                  variant={action.variant ?? "teal"}
                  size="lg"
                  icon={action.icon}
                  iconPosition={action.iconPosition ?? "right"}
                >
                  <TranslationText>{action.label}</TranslationText>
                </PrimaryButton>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
