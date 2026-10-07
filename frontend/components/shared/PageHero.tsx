import TranslationText from "@/components/translation/TranslationText";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import Container from "./Container";
import PrimaryButton from "./PrimaryButton";
import Breadcrumbs, { type Crumb } from "./Breadcrumbs";
import AppImage from "./AppImage";
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
  /** Optional documentary background image path. */
  backgroundImage?: string;
  imageAlt?: string;
  actions?: PageHeroAction[];
  align?: "left" | "center";
}

/**
 * Shorter internal-page hero. Uses a deep navy background, optionally layered
 * over a documentary image with a navy overlay for readable, accessible text.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  backgroundImage,
  imageAlt = "",
  actions,
  align = "left",
}: PageHeroProps) {
  const isCenter = align === "center";

  return (
    <section className="relative overflow-hidden bg-navy">
      {backgroundImage && (
        <>
          <div className="absolute inset-0">
            <AppImage
              src={backgroundImage}
              alt={imageAlt}
              fill
              priority
              sizes="100vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-navy/80"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 to-navy/50"
          />
        </>
      )}

      <Container className="relative z-10 py-14 sm:py-16 lg:py-20">
        <div className={isCenter ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs
              items={breadcrumbs}
              tone="light"
              className={isCenter ? "flex justify-center" : ""}
            />
          )}
          {eyebrow && (
            <p className="eyebrow mt-4 text-teal"><TranslationText>{eyebrow}</TranslationText></p>
          )}
          <h1 className="mt-3 font-serif text-[30px] font-semibold leading-tight text-white sm:text-[38px] lg:text-[44px]">
            <TranslationText>{title}</TranslationText>
          </h1>
          {description && (
            <p
              className={`mt-4 text-[15px] leading-relaxed text-white/80 sm:text-base ${
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
