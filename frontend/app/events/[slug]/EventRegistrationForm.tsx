"use client";
import TranslationText from "@/components/translation/TranslationText";

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
  Event registration form. UI only — no data is transmitted or stored.
  A production version requires a secure backend with validation, storage and
  confirmation handling.
*/

const attendeeOptions = ["1", "2", "3", "4+"];

interface Errors {
  name?: string;
  email?: string;
  consent?: string;
}

interface EventRegistrationFormProps {
  eventTitle: string;
}

export default function EventRegistrationForm({
  eventTitle,
}: EventRegistrationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendees, setAttendees] = useState("1");
  const [accessibility, setAccessibility] = useState("");
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
    if (!consent) next.consent = "Please confirm before submitting.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    await simulateSubmit();
    setLoading(false);
    setReference(sampleReference("EVT"));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <FormMessage type="success" title="Registration received">
        <p>
          <TranslationText>Your registration for </TranslationText><TranslationText>{eventTitle}</TranslationText> <TranslationText>has been recorded for this
          demonstration only. A sample reference number is shown below.
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
          id="registration-name"
          label="Full name"
          value={name}
          onChange={setName}
          required
          error={errors.name}
          autoComplete="name"
        />
        <TextField
          id="registration-email"
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
          id="registration-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
        />
        <SelectField
          id="registration-attendees"
          label="Number of attendees"
          value={attendees}
          onChange={setAttendees}
          options={attendeeOptions}
        />
      </div>

      <TextareaField
        id="registration-accessibility"
        label="Accessibility requirements"
        value={accessibility}
        onChange={setAccessibility}
        rows={4}
        helper="Let us know about any adjustments that would help you take part."
      />

      <CheckboxField
        id="registration-consent"
        label="I consent to HRPF contacting me about this event and understand my details will be handled confidentially."
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />

      <SubmitButton loading={loading}><TranslationText>Register for Event</TranslationText></SubmitButton>
    </form>
  );
}
