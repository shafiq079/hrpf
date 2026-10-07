"use client";
import TranslationText from "@/components/translation/TranslationText";

import { useState } from "react";
import { Clock } from "lucide-react";
import {
  CheckboxField,
  TextField,
  TextareaField,
} from "@/components/forms/fields";
import FormMessage from "@/components/forms/FormMessage";
import SubmitButton from "@/components/forms/SubmitButton";
import { isValidEmail, sampleReference, simulateSubmit } from "@/lib/forms";

/*
  Media inquiry form for journalists and editors (UI only). No data is
  transmitted or stored on this demonstration site — a production version
  requires a secure backend with appropriate handling of press contacts.
*/

interface Errors {
  name?: string;
  outlet?: string;
  email?: string;
  details?: string;
  consent?: string;
}

export default function MediaInquiryForm() {
  const [name, setName] = useState("");
  const [outlet, setOutlet] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deadline, setDeadline] = useState("");
  const [details, setDetails] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your full name.";
    if (!outlet.trim()) {
      next.outlet = "Please enter your outlet or organization.";
    }
    if (!email.trim() || !isValidEmail(email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!details.trim() || details.trim().length < 20) {
      next.details = "Please describe your inquiry (at least 20 characters).";
    }
    if (!consent) next.consent = "Please confirm before submitting.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    await simulateSubmit();
    setLoading(false);
    setReference(sampleReference("MED"));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <FormMessage
        type="success"
        title="Thank you — your media inquiry has been received"
      >
        <p>
          <TranslationText>Your inquiry has been recorded for this demonstration only. A member
          of the communications team would normally respond using the details
          you provided.
        </TranslationText></p>
        <p className="mt-2 font-mono text-sm font-semibold text-navy">
          <TranslationText>Reference: </TranslationText><span className="notranslate" translate="no">{reference}</span>
        </p>
      </FormMessage>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="media-name"
          label="Full name"
          value={name}
          onChange={setName}
          required
          error={errors.name}
          autoComplete="name"
        />
        <TextField
          id="media-outlet"
          label="Outlet / Organization"
          value={outlet}
          onChange={setOutlet}
          required
          error={errors.outlet}
          autoComplete="organization"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="media-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          id="media-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          helper="Optional"
          autoComplete="tel"
        />
      </div>

      <TextField
        id="media-deadline"
        label="Deadline"
        type="date"
        value={deadline}
        onChange={setDeadline}
        helper="Optional — let us know if your request is time-sensitive."
      />

      <TextareaField
        id="media-details"
        label="Inquiry details"
        value={details}
        onChange={setDetails}
        required
        error={errors.details}
        rows={6}
        placeholder="Please describe your inquiry, the topic and what you need from us."
      />

      <CheckboxField
        id="media-consent"
        label="I consent to HRPF using the details provided to respond to this media inquiry."
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />

      <div className="flex items-start gap-2.5 text-sm text-muted">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal-dark" aria-hidden="true" />
        <p>
          <TranslationText>We aim to acknowledge media inquiries within two working days. For
          urgent, deadline-driven requests, please note your deadline above.
        </TranslationText></p>
      </div>

      <SubmitButton loading={loading}><TranslationText>Send Media Inquiry</TranslationText></SubmitButton>
    </form>
  );
}
