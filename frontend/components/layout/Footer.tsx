import type { ReactNode } from "react";
import Link from "@/components/translation/TranslationLink";
import {
  footerFoundationLinks,
  footerLegalLinks,
  footerSupportLinks,
  type NavLink,
} from "@/data/navigation";
import Container from "@/components/shared/Container";
import BrandLogo from "@/components/shared/BrandLogo";
import NewsletterForm from "./NewsletterForm";

/*
  Social brand glyphs as inline SVGs. Lucide no longer ships brand icons, so
  these lightweight marks keep the footer recognizable and dependency-safe.
*/
const socialLinks: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/19UmHuUKSb/",
    icon: (
      <path d="M14 8.5h2.2V5.6C15.83 5.55 15 5.5 14 5.5c-2.06 0-3.5 1.26-3.5 3.58V11.5H7.8v3h2.7V22h3.2v-7.5h2.7l.4-3h-3.1V9.4c0-.7.28-.9 1.3-.9Z" />
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@human.rightspakistan",
    icon: (
      <path d="M14 3v12a4 4 0 1 1-4-4v3a1 1 0 1 0 1 1V3h3c.4 3 2 4.5 5 5v3c-2-.3-3.6-1.1-5-2.4" />
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/human-rights-protection-foundation-pakistan-hrpf-3b545677",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 10.5V16.5M8 7.6v.02M11.5 16.5v-3.2c0-1 .8-1.8 1.8-1.8s1.7.8 1.7 1.8v3.2" />
      </>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@hrpfpakistan",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="3.5" />
        <path d="M10.5 9.5v5l4-2.5-4-2.5Z" fill="currentColor" stroke="none" />
      </>
    ),
  },
];

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: NavLink[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
        {heading}
      </h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-white/60 transition-colors hover:text-teal"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Institutional footer with navigation, newsletter and legal links. */
export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <Container className="py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:gap-10">
          {/* Brand column */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="Human Rights Protection Foundation home"
            >
              <BrandLogo size={56} onDark />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Promoting human dignity, justice and transparency through lawful
              advocacy and public awareness in Pakistan.
            </p>
            <ul className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors hover:border-teal hover:text-teal"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[18px] w-[18px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {social.icon}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn heading="Foundation" links={footerFoundationLinks} />
          <FooterColumn heading="Support" links={footerSupportLinks} />

          {/* Newsletter column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
              Stay Informed
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Stay connected with the Foundation’s advocacy and public awareness
              work.
            </p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-4 py-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Human Rights Protection Foundation. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {footerLegalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-teal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
