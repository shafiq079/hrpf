"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AlertTriangle, ChevronDown, X } from "lucide-react";
import { mainNavigation } from "@/data/navigation";
import PrimaryButton from "@/components/shared/PrimaryButton";
import BrandLogo from "@/components/shared/BrandLogo";

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Accessible slide-in mobile navigation drawer.
 * Locks body scroll while open and closes on Escape.
 */
export default function MobileNavigation({
  open,
  onClose,
}: MobileNavigationProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Prevent background scrolling and support Escape-to-close while open.
  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const items = drawerRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );
        const first = items?.[0],
          last = items?.[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={`lg:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-navy/50 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(84vw,340px)] flex-col bg-off-white shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <BrandLogo size={44} />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-navy transition-colors hover:bg-navy/5"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col">
            {mainNavigation.map((item) =>
              item.children ? (
                <li key={item.label} className="border-b border-border/70">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex-1 py-3 text-base font-medium text-text transition-colors hover:text-teal-dark"
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      aria-label={`Toggle ${item.label} submenu`}
                      aria-expanded={expanded === item.label}
                      onClick={() =>
                        setExpanded(expanded === item.label ? null : item.label)
                      }
                      className="p-2 text-muted"
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-150 ${
                          expanded === item.label ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  {expanded === item.label && (
                    <ul className="pb-2 pl-3">
                      {item.children.map((child) => (
                        <li key={`${child.label}-${child.href}`}>
                          <Link
                            href={child.href}
                            onClick={onClose}
                            className="block py-2 text-sm text-muted transition-colors hover:text-teal-dark"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block border-b border-border/70 py-3 text-base font-medium text-text transition-colors hover:text-teal-dark"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-5">
          <PrimaryButton
            href="/report-a-violation"
            variant="red"
            icon={AlertTriangle}
            iconPosition="left"
            fullWidth
          >
            Report a Violation
          </PrimaryButton>
          <PrimaryButton href="/donate" variant="gold" fullWidth>
            Donate
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
