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
  Campaign volunteer sign-up form. UI only — no data is transmitted or stored.
  A production version requires a secure backend with validation, storage and
  notification handling.
*/

const helpOptions = [
  "Share the campaign",
  "Volunteer time",
  "Provide expertise",
  "Other",
];

interface Errors {
  name?: string;
  email?: string;
  help?: string;
  consent?: string;
}

interface CampaignVolunteerFormProps {
  campaignTitle: string;
}

export default function CampaignVolunteerForm({
  campaignTitle,
}: CampaignVolunteerFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [help, setHelp] = useState("");
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
    if (!help) next.help = "Please tell us how you'd like to help.";
    if (!consent) next.consent = "Please confirm before submitting.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    await simulateSubmit();
    setLoading(false);
    setReference(sampleReference("VOL"));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <FormMessage
        type="success"
        title="Thank you for volunteering"
      >
        <p>
          Your interest in the {campaignTitle} campaign has been recorded for
          this demonstration only. A sample reference number is shown below.
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
          id="volunteer-name"
          label="Full name"
          value={name}
          onChange={setName}
          required
          error={errors.name}
          autoComplete="name"
        />
        <TextField
          id="volunteer-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          error={errors.email}
          autoComplete="email"
        />
      </div>

      <TextField
        id="volunteer-phone"
        label="Phone"
        type="tel"
        value={phone}
        onChange={setPhone}
        autoComplete="tel"
      />

      <SelectField
        id="volunteer-help"
        label="How you'd like to help"
        value={help}
        onChange={setHelp}
        options={helpOptions}
        required
        error={errors.help}
      />

      <TextareaField
        id="volunteer-message"
        label="Message"
        value={message}
        onChange={setMessage}
        rows={5}
        placeholder="Tell us a little about how you'd like to support this campaign."
      />

      <CheckboxField
        id="volunteer-consent"
        label="I consent to HRPF contacting me about this campaign and understand my details will be handled confidentially."
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />

      <SubmitButton loading={loading}>Join Campaign</SubmitButton>
    </form>
  );
}
