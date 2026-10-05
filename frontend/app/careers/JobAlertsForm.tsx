"use client";

import { useState } from "react";
import { CheckboxField, SelectField, TextField } from "@/components/forms/fields";
import FormMessage from "@/components/forms/FormMessage";
import SubmitButton from "@/components/forms/SubmitButton";
import { isValidEmail, simulateSubmit } from "@/lib/forms";

/*
  Job alerts sign-up (UI only). No data is transmitted or stored on this
  demonstration site — a production version requires a secure backend with
  consent handling and unsubscribe support.
*/

const interestAreas = [
  "Programmes",
  "Research",
  "Legal/Referral",
  "Communications",
  "Operations",
  "Volunteering",
];

interface Errors {
  email?: string;
  interest?: string;
  consent?: string;
}

export default function JobAlertsForm() {
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!email.trim() || !isValidEmail(email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!interest) next.interest = "Please select an area of interest.";
    if (!consent) next.consent = "Please confirm your consent before submitting.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    await simulateSubmit();
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <FormMessage
        type="success"
        title="You're subscribed to job alerts"
      >
        <p>
          Thank you. On this demonstration site no data is stored, but in a
          live version you would receive email alerts for new opportunities in
          your chosen area.
        </p>
      </FormMessage>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <TextField
        id="job-alerts-email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        error={errors.email}
        autoComplete="email"
        placeholder="you@example.com"
      />

      <SelectField
        id="job-alerts-interest"
        label="Area of interest"
        value={interest}
        onChange={setInterest}
        options={interestAreas}
        required
        error={errors.interest}
      />

      <CheckboxField
        id="job-alerts-consent"
        label="I consent to receiving job alerts by email."
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />

      <SubmitButton loading={loading}>Subscribe to Job Alerts</SubmitButton>
    </form>
  );
}
