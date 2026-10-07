"use client";
import TranslationText from "@/components/translation/TranslationText";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

/**
 * Newsletter sign-up with client-side validation only (no backend wired up).
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!isValid) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
    setEmail("");
  };

  if (submitted) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-md bg-teal/15 px-3 py-3 text-sm text-white"
      >
        <Check className="h-4 w-4 text-teal" aria-hidden="true" />
        <TranslationText>Thank you — please check your inbox to confirm.
      </TranslationText></p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <label htmlFor="newsletter-email" className="text-sm text-white/70">
        <TranslationText>Email address
      </TranslationText></label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input translate="no"
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus-visible:border-teal focus-visible:outline-none"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark"
        >
          <TranslationText>Subscribe
          </TranslationText><ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p id="newsletter-error" role="alert" className="text-sm text-red">
          <span className="notranslate" translate="no">{error}</span>
        </p>
      )}
    </form>
  );
}
