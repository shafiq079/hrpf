"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import BrandLogo from "@/components/shared/BrandLogo";
import TranslationText from "@/components/translation/TranslationText";

/** A native modal supplies focus trapping and makes the underlying form inert. */
export default function SubmissionOverlay({ active, message, title = "Submitting your form" }: { active: boolean; message?: string; title?: string }) {
  const dialog = useRef<HTMLDialogElement>(null), heading = useRef<HTMLHeadingElement>(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!active || !element) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    heading.current?.focus({ preventScroll: true });
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected && !previous.hasAttribute("disabled")) previous.focus({ preventScroll: true });
    };
  }, [active]);
  if (!active) return null;
  return createPortal(<dialog ref={dialog} aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={event => event.preventDefault()} className="hrpf-submission-overlay">
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
      <BrandLogo size={72} />
      <h2 ref={heading} id={`${id}-title`} tabIndex={-1} className="mt-7 font-serif text-2xl font-semibold text-navy outline-none sm:text-3xl"><TranslationText>{title}</TranslationText></h2>
      <div role="progressbar" aria-label="Submission in progress" className="relative mt-7 h-2 w-full overflow-hidden rounded-full bg-teal/15"><span aria-hidden="true" className="hrpf-loading-runner" /></div>
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-6 min-h-12 text-base font-medium leading-relaxed text-teal-dark"><TranslationText>{message || "Starting your secure submission…"}</TranslationText></p>
      <p id={`${id}-description`} className="mt-4 text-sm leading-relaxed text-muted"><TranslationText>Please keep this page open. Your confirmation will appear when submission finishes.</TranslationText></p>
    </div>
  </dialog>, document.body);
}
