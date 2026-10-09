"use client";
import { useCallback, useRef, useState } from "react";
import TranslationText from "@/components/translation/TranslationText";
import ComplaintVerification from "@/components/forms/ComplaintVerification";
import { newContactAttempt } from "@/lib/contact-submission";
import { submitNewsletter, NewsletterRequestError } from "@/lib/newsletter-submission";
export default function NewsletterForm() {
  const [email, setEmail] = useState(""), [consent, setConsent] = useState(false), [active, setActive] = useState(false);
  const [error, setError] = useState(""), [submitted, setSubmitted] = useState(false), [busy, setBusy] = useState(false), [locked, setLocked] = useState(false);
  const [botToken, setBotToken] = useState(""), [verificationKey, setVerificationKey] = useState(0);
  const attempt = useRef(newContactAttempt()), submitting = useRef(false);
  const tokenChanged = useCallback((value: string) => setBotToken(value), []);
  const verificationError = useCallback((value: string) => setError(value), []);
  async function send(event: React.FormEvent) {
    event.preventDefault(); if (submitting.current) return;
    setError(""); setActive(true);
    if (!attempt.current.submissionStarted) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) { setError("Enter a valid email address."); return; }
      if (!consent) { setError("Please agree to receive HRPF updates."); return; }
      if (!botToken) { setError("Complete the security verification before subscribing."); return; }
    }
    submitting.current = true; setBusy(true); setLocked(true);
    try { await submitNewsletter(email, consent, attempt.current, botToken); setSubmitted(true); setEmail(""); }
    catch (failure) {
      setError(failure instanceof Error ? failure.message : "Please try again.");
      if (!attempt.current.submissionStarted || (failure instanceof NewsletterRequestError && ["VALIDATION_ERROR", "INVALID_FORM_TICKET"].includes(failure.code || ""))) {
        attempt.current = newContactAttempt(); setLocked(false); setBotToken(""); setVerificationKey(value => value + 1);
      }
    } finally { submitting.current = false; setBusy(false); }
  }
  if (submitted) return <p role="status" className="rounded border border-white/20 p-4 text-sm leading-relaxed text-white"><TranslationText>Your request is recorded. Check your inbox for a confirmation link; you are subscribed only after confirming. If you are already subscribed, no further action is needed.</TranslationText></p>;
  return <form onSubmit={send} noValidate aria-busy={busy} className="space-y-3">
    <label htmlFor="newsletter-email" className="block text-sm text-white/80"><TranslationText>Email address</TranslationText></label>
    <input id="newsletter-email" name="email" type="email" autoComplete="email" maxLength={254} value={email} disabled={locked} onFocus={() => setActive(true)} onChange={event => setEmail(event.target.value)} translate="no" aria-invalid={!!error} aria-describedby={error ? "newsletter-error" : undefined} placeholder="you@example.com" className="w-full border border-white/30 bg-white/5 px-3 py-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-teal" />
    <label className="flex items-start gap-2 text-sm leading-relaxed text-white/80"><input type="checkbox" disabled={locked} checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1" /><TranslationText>I agree to receive HRPF updates. I can unsubscribe through the link in my email.</TranslationText></label>
    {active && !locked && <div className="rounded bg-white p-3 text-navy"><ComplaintVerification key={verificationKey} purpose="newsletter" onToken={tokenChanged} onError={verificationError} /></div>}
    {error && <p id="newsletter-error" role="alert" translate="no" className="notranslate text-sm text-red">{error}</p>}
    <button disabled={busy} className="bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-40"><TranslationText>{busy ? "Submitting…" : locked ? "Retry request" : "Subscribe"}</TranslationText></button>
  </form>;
}
