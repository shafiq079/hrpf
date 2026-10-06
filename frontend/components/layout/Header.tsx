"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, Menu } from "lucide-react";
import { mainNavigation } from "@/data/navigation";
import Container from "@/components/shared/Container";
import PrimaryButton from "@/components/shared/PrimaryButton";
import BrandLogo from "@/components/shared/BrandLogo";
import MobileNavigation from "./MobileNavigation";

/** Slim sticky site header with center navigation, dropdowns and primary actions. */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeMobileMenu = useCallback(() => setMenuOpen(false), []);

  // Add a subtle shadow only after the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close any open dropdown on Escape or when clicking outside the nav.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
    };
    const onClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenIndex(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const linkClasses =
    "relative text-sm font-medium text-text transition-colors duration-150 hover:text-teal-dark after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-teal after:transition-all after:duration-200 hover:after:w-full";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur transition-shadow duration-200 ${
        scrolled ? "shadow-[0_2px_10px_-6px_rgba(11,42,58,0.25)]" : ""
      }`}
    >
      <Container>
        <div className="flex h-[72px] items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center rounded-sm"
            aria-label="Human Rights Protection Foundation home"
          >
            <BrandLogo size={56} />
          </Link>

          {/* Center navigation (desktop) */}
          <nav ref={navRef} aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-4 xl:gap-6">
              {mainNavigation.map((item, index) =>
                item.children ? (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenIndex(index)}
                    onMouseLeave={() => setOpenIndex(null)}
                  >
                    <span className="flex items-center gap-0.5">
                      <Link href={item.href} className={linkClasses} onClick={() => setOpenIndex(null)}>
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        aria-label={`${item.label} submenu`}
                        aria-expanded={openIndex === index}
                        aria-controls={`nav-menu-${index}`}
                        onClick={() =>
                          setOpenIndex(openIndex === index ? null : index)
                        }
                        className="rounded p-1 text-muted transition-colors hover:text-teal-dark"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-150 ${
                            openIndex === index ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </span>
                    {/* Wrapper keeps a transparent `pt-2` bridge so moving the
                        cursor from the trigger to the menu never crosses a gap
                        that would trigger mouseleave and close the dropdown. */}
                    <div
                      id={`nav-menu-${index}`}
                      hidden={openIndex !== index}
                      className={`absolute top-full z-50 pt-2 ${index === mainNavigation.length - 1 ? "right-0" : "left-0"}`}
                    >
                      <ul className="w-72 rounded-md border border-border bg-white p-2 shadow-[0_12px_30px_-12px_rgba(8,47,67,0.35)]">
                        {item.children.map((child) => (
                          <li key={`${child.label}-${child.href}`}>
                            <Link
                              href={child.href}
                              onClick={() => setOpenIndex(null)}
                              className="block rounded px-3 py-2 text-sm text-text transition-colors hover:bg-soft-gray hover:text-teal-dark"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ) : (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClasses} onClick={() => setOpenIndex(null)}>
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>

          {/* Actions (desktop) */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <PrimaryButton
              href="/file-a-complaint"
              variant="red"
              icon={AlertTriangle}
              iconPosition="left"
            >
              File a Complaint
            </PrimaryButton>
            <PrimaryButton href="/donate" variant="gold">
              Donate
            </PrimaryButton>
          </div>

          {/* Actions (mobile) */}
          <div className="flex items-center gap-2 lg:hidden">
            <PrimaryButton href="/donate" variant="gold" size="md">
              Donate
            </PrimaryButton>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-navy transition-colors hover:bg-navy/5"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Container>

      <MobileNavigation open={menuOpen} onClose={closeMobileMenu} />
    </header>
  );
}
