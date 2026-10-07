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
  Help request form for /get-help.

  UI ONLY — no data is transmitted or stored on this demonstration site.
  A production version REQUIRES a secure, confidential backend with validation,
  storage, notification and careful privacy handling before collecting real
  personal information.
*/

const assistanceTypes = [
  "General rights information",
  "Documentation guidance",
  "Legal-service referrals",
  "Community-service referrals",
  "Awareness resources",
  "Institutional-contact information",
];

const contactMethods = ["Email", "Phone"];

interface Errors {
  email?: string;
  description?: string;
  consent?: string;
}

export default function HelpRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [assistanceType, setAssistanceType] = useState("");
  const [description, setDescription] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (email.trim() && !isValidEmail(email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!description.trim()) {
      next.description = "Please describe your situation.";
    }
    if (!consent) next.consent = "Please confirm before submitting.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    await simulateSubmit();
    setLoading(false);
    setReference(sampleReference("REQ"));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <FormMessage
        type="success"
        title="Thank you — your request has been received"
      >
        <p>
          <TranslationText>Your request has been recorded for this demonstration only and has not
          been stored or sent anywhere. HRPF provides information and referral
          and cannot guarantee legal representation or a specific outcome. A
          sample reference number is shown below.
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
          id="help-name"
          label="Full name"
          value={name}
          onChange={setName}
          autoComplete="name"
        />
        <TextField
          id="help-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          id="help-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
        />
        <TextField
          id="help-location"
          label="Country / Location"
          value={location}
          onChange={setLocation}
          autoComplete="address-level2"
        />
      </div>

      <SelectField
        id="help-type"
        label="Type of assistance"
        value={assistanceType}
        onChange={setAssistanceType}
        options={assistanceTypes}
      />

      <TextareaField
        id="help-description"
        label="Description of your situation"
        value={description}
        onChange={setDescription}
        required
        error={errors.description}
        rows={6}
        helper="Please avoid sharing highly sensitive details on this demonstration website."
      />

      <SelectField
        id="help-contact-method"
        label="Preferred contact method"
        value={contactMethod}
        onChange={setContactMethod}
        options={contactMethods}
      />

      <CheckboxField
        id="help-consent"
        label="I understand HRPF provides information and referral and cannot guarantee legal representation or a specific outcome."
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />

      <SubmitButton loading={loading}><TranslationText>Submit Request</TranslationText></SubmitButton>
    </form>
  );
}
