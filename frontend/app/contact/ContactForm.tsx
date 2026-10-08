"use client";

import { useCallback, useRef, useState } from "react";
import Link from "@/components/translation/TranslationLink";
import TranslationText from "@/components/translation/TranslationText";
import { CheckboxField, SelectField, TextField, TextareaField } from "@/components/forms/fields";
import FormMessage from "@/components/forms/FormMessage";
import SubmitButton from "@/components/forms/SubmitButton";
import ComplaintVerification from "@/components/forms/ComplaintVerification";
import { isValidEmail } from "@/lib/forms";
import { ContactRequestError, newContactAttempt, submitContact, type ContactData } from "@/lib/contact-submission";

const inquiryTypes = ["General", "Partnership", "Media", "Membership", "Donation", "Technical"];
const initial: ContactData = { name: "", email: "", phone: "", organization: "", inquiryType: "General", subject: "", message: "", consent: false };

export default function ContactForm() {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactData, string>>>({});
  const [busy, setBusy] = useState(false), [locked, setLocked] = useState(false);
  const [error, setError] = useState(""), [reference, setReference] = useState("");
  const [botToken, setBotToken] = useState(""), [verificationKey, setVerificationKey] = useState(0);
  const attempt = useRef(newContactAttempt()), submitting = useRef(false);
  const tokenChanged = useCallback((token: string) => setBotToken(token), []);
  const verificationError = useCallback((message: string) => setError(message), []);
  const change = (key: keyof ContactData, value: string | boolean) => setData(previous => ({ ...previous, [key]: value }));

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    if (!attempt.current.submissionStarted) {
      const next: Partial<Record<keyof ContactData, string>> = {};
      if (!data.name.trim() || data.name.trim().length > 150) next.name = "Enter your name using up to 150 characters.";
      if (!isValidEmail(data.email.trim()) || data.email.trim().length > 254) next.email = "Enter a valid email address.";
      if (data.phone.trim() && !/^\+?[0-9 ()-]{7,30}$/.test(data.phone.trim())) next.phone = "Enter a valid phone number or leave it blank.";
      if (!data.subject.trim() || data.subject.trim().length > 200) next.subject = "Enter a subject using up to 200 characters.";
      if (!data.message.trim() || data.message.trim().length > 5000) next.message = "Enter a message using up to 5,000 characters.";
      if (!data.consent) next.consent = "Please confirm your consent before sending.";
      setErrors(next);
      if (Object.keys(next).length) { document.getElementById(`contact-${Object.keys(next)[0]}`)?.focus(); return; }
    }
    submitting.current = true; setBusy(true); setLocked(true);
    try {
      const result = await submitContact(data, attempt.current, botToken);
      setReference(result.reference); setData(initial); attempt.current = newContactAttempt();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Your message could not be confirmed. Please try again.");
      if (!attempt.current.submissionStarted || (failure instanceof ContactRequestError && failure.status === 400 && failure.code === "VALIDATION_ERROR")) {
        attempt.current = newContactAttempt(); setLocked(false); setBotToken(""); setVerificationKey(previous => previous + 1);
      }
    } finally { submitting.current = false; setBusy(false); }
  }

  if (reference) return <FormMessage type="success" title="Your message has been received">
    <p><TranslationText>Thank you for contacting HRPF. Please keep your reference below for any follow-up.</TranslationText></p>
    <p className="mt-3"><TranslationText>Reference: </TranslationText><span dir="ltr" translate="no" className="notranslate break-all font-mono font-semibold">{reference}</span></p>
  </FormMessage>;

  return <form onSubmit={send} noValidate className="space-y-5" aria-busy={busy}>
    <fieldset disabled={locked} className="space-y-5">
      <legend className="sr-only">Contact enquiry</legend>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="contact-name" label="Full name" value={data.name} onChange={value => change("name", value)} required error={errors.name} autoComplete="name" maxLength={150} />
        <TextField id="contact-email" label="Email" type="email" value={data.email} onChange={value => change("email", value)} required error={errors.email} autoComplete="email" maxLength={254} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="contact-phone" label="Phone (optional)" type="tel" value={data.phone} onChange={value => change("phone", value)} error={errors.phone} autoComplete="tel" maxLength={30} />
        <TextField id="contact-organization" label="Organization (optional)" value={data.organization} onChange={value => change("organization", value)} autoComplete="organization" maxLength={150} />
      </div>
      <SelectField id="contact-inquiry-type" label="Enquiry type" value={data.inquiryType} onChange={value => change("inquiryType", value)} options={inquiryTypes} />
      <TextField id="contact-subject" label="Subject" value={data.subject} onChange={value => change("subject", value)} required error={errors.subject} maxLength={200} />
      <TextareaField id="contact-message" label="Message" value={data.message} onChange={value => change("message", value)} required error={errors.message} rows={6} maxLength={5000} helper="Please avoid including CNIC details or private case documents in a general enquiry." />
      <CheckboxField id="contact-consent" label="I consent to HRPF storing my enquiry and emailing it to me and authorised HRPF recipients for follow-up." checked={data.consent} onChange={value => change("consent", value)} error={errors.consent} />
      <p className="text-sm text-muted"><Link href="/privacy-policy" className="font-semibold text-teal-dark underline">Read the Privacy Policy</Link></p>
    </fieldset>
    {!locked ? <ComplaintVerification key={verificationKey} purpose="contact" onToken={tokenChanged} onError={verificationError} /> : null}
    {error ? <FormMessage type="error" title="Message not confirmed"><p>{error}</p></FormMessage> : null}
    {locked && !busy ? <p role="status" className="text-sm text-muted"><TranslationText>Retry to confirm the same message. Your original details are kept on this page to avoid duplicate enquiries.</TranslationText></p> : null}
    <SubmitButton loading={busy}><TranslationText>{locked ? "Retry message" : "Send message"}</TranslationText></SubmitButton>
  </form>;
}
