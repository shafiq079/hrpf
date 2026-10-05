import Link from "next/link";
import {
  footerFoundationLinks,
  footerLegalLinks,
  footerSupportLinks,
  type NavLink,
} from "@/data/navigation";
import Container from "@/components/shared/Container";
import BrandLogo from "@/components/shared/BrandLogo";
import { publicSettings } from "@/lib/public-content";
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
export default async function Footer() {
  const result = await publicSettings(),
    settings = result.status === "ok" ? result.data : {};
  return (
    <footer className="bg-navy-dark text-white">
      <Container className="py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:gap-10">
          <div>
            <Link href="/" aria-label="HRPF Pakistan home">
              <BrandLogo size={56} onDark />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              {settings.identity?.name ??
                "Human Rights Protection Foundation Pakistan"}
            </p>
            <ul className="mt-5 flex flex-wrap gap-3">
              {Object.entries(settings.socialLinks ?? {})
                .filter(([, value]) => value.startsWith("https://"))
                .map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm capitalize text-white/70 hover:text-teal"
                    >
                      {name}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
          <FooterColumn heading="Foundation" links={footerFoundationLinks} />
          <FooterColumn heading="Support" links={footerSupportLinks} />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em]">
              Contact
            </h3>
            {settings.contact ? (
              <>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  {settings.contact.address} {settings.contact.postalCode}
                </p>
                <a
                  className="mt-4 block text-sm text-white/70"
                  href={`tel:${settings.contact.phone.replace(/[^+\d]/g, "")}`}
                >
                  {settings.contact.phone}
                </a>
                {settings.contact.emails.map((email) => (
                  <a
                    key={email}
                    className="mt-3 block break-all text-sm text-white/70"
                    href={`mailto:${email}`}
                  >
                    {email}
                  </a>
                ))}
              </>
            ) : (
              <Link
                href="/contact"
                className="mt-4 block text-sm text-white/60"
              >
                Contact information
              </Link>
            )}
          </div>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-4 py-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getUTCFullYear()} Human Rights Protection Foundation
            Pakistan.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footerLegalLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-teal">
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
