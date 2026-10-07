"use client";
import TranslationText from "@/components/translation/TranslationText";
import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
export default function ComplaintVerification({
  onToken,
  onError,
}: {
  onToken: (token: string) => void;
  onError: (message: string) => void;
}) {
  const element = useRef<HTMLDivElement>(null),
    widget = useRef<string | null>(null);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const mount = useCallback(() => {
    if (
      !sitekey ||
      !element.current ||
      !window.turnstile ||
      widget.current !== null
    )
      return;
    widget.current = window.turnstile.render(element.current, {
      sitekey,
      action: "complaint",
      callback: onToken,
      "expired-callback": () => onToken(""),
      "error-callback": () => {
        onToken("");
        onError(
          "Security verification could not load. Refresh the verification and try again.",
        );
      },
    });
  }, [sitekey, onToken, onError]);
  useEffect(() => {
    mount();
    return () => {
      if (widget.current !== null) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, [mount]);
  if (!sitekey)
    return (
      <p role="status" className="text-sm text-muted">
        <TranslationText>Online complaint submission is temporarily unavailable. Please use the
        contact details on our Contact page.
      </TranslationText></p>
    );
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={mount}
        onError={() =>
          onError("Security verification could not load. Try again later.")
        }
      />
      <div ref={element} translate="no" className="notranslate" aria-label="Security verification" />
    </>
  );
}
