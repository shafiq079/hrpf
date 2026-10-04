"use client";

import { useState } from "react";
import {
  CheckboxField,
  SelectField,
  TextField,
  TextareaField,
} from "@/components/forms/fields";
import FormMessage from "@/components/forms/FormMessage";
import SubmitButton from "@/components/forms/SubmitButton";
import { isValidEmail, sampleReference, simulateSubmit } from "@/lib/forms";

/*
  Contact form for general organizational inquiries. UI only — no data is
  transmitted or stored on this demonstration site. A production version
  requires a secure backend with validation, storage and notification.
*/

const inquiryTypes = [
  "General",
  "Partnership",
  "Media",
  "Volunteering",
  "Donation",
  "Technical",
];

interface Errors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  consent?: string;
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your full name.";
    if (!email.trim()) {
      next.email = "Please enter your email address.";
    } else if (!isValidEmail(email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!subject.trim()) next.subject = "Please enter a subject.";
    if (!message.trim()) next.message = "Please enter your message.";
    if (!consent) next.consent = "Please provide your consent to continue.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    await simulateSubmit();
    setLoading(false);
    setReference(sampleReference("MSG"));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <FormMessage type="success" title="Thank you — your message has been received">
        <p>
          Your inquiry has been recorded for this demonstration only. We aim to
          respond within 3–5 working days. A sample reference number is shown
          below.
        </p>
        <p className="mt-2 font-mono text-sm font-semibold text-navy">
          Reference: {reference}
        </p>
      </FormMessage>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="contact-name"
          label="Full name"
          value={name}
          onChange={setName}
          required
          error={errors.name}
          autoComplete="name"
        />
        <TextField
          id="contact-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          error={errors.email}
          autoComplete="email"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="contact-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
        />
        <TextField
          id="contact-organization"
          label="Organization"
          value={organization}
          onChange={setOrganization}
          autoComplete="organization"
        />
      </div>

      <SelectField
        id="contact-inquiry-type"
        label="Inquiry type"
        value={inquiryType}
        onChange={setInquiryType}
        options={inquiryTypes}
      />

      <TextField
        id="contact-subject"
        label="Subject"
        value={subject}
        onChange={setSubject}
        required
        error={errors.subject}
      />

      <TextareaField
        id="contact-message"
        label="Message"
        value={message}
        onChange={setMessage}
        required
        error={errors.message}
        rows={6}
      />

      <CheckboxField
        id="contact-consent"
        label="I consent to HRPF contacting me regarding my inquiry."
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />

      <SubmitButton loading={loading}>Send Message</SubmitButton>
    </form>
  );
}
