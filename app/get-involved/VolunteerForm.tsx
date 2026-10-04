"use client";

import { useState } from "react";
import {
  CheckboxField,
  FileUploadField,
  SelectField,
  TextField,
  TextareaField,
} from "@/components/forms/fields";
import FormMessage from "@/components/forms/FormMessage";
import SubmitButton from "@/components/forms/SubmitButton";
import { isValidEmail, sampleReference, simulateSubmit } from "@/lib/forms";

/*
  Volunteer application form for /get-involved.

  UI ONLY — no data is transmitted or stored on this demonstration site.
  A production version REQUIRES a secure backend with validation, storage,
  notification and appropriate privacy controls before collecting real data.
*/

const areaOptions = [
  "Community activities",
  "Awareness campaigns",
  "Research",
  "Communications",
  "Administration",
  "Professional services",
];

const availabilityOptions = [
  "A few hours a week",
  "Part-time",
  "Full-time",
  "Occasional",
];

interface Errors {
  name?: string;
  email?: string;
  motivation?: string;
  consent?: string;
}

export default function VolunteerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [motivation, setMotivation] = useState("");
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
    if (!motivation.trim()) {
      next.motivation = "Please share a short motivation statement.";
    }
    if (!consent) next.consent = "Please provide consent before submitting.";
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
        title="Thank you — your volunteer application has been received"
      >
        <p>
          Your application has been recorded for this demonstration only and has
          not been stored or sent anywhere. A sample reference number is shown
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
        <TextField
          id="volunteer-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
        />
        <TextField
          id="volunteer-location"
          label="Location"
          value={location}
          onChange={setLocation}
          autoComplete="address-level2"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          id="volunteer-area"
          label="Area of interest"
          value={area}
          onChange={setArea}
          options={areaOptions}
        />
        <SelectField
          id="volunteer-availability"
          label="Availability"
          value={availability}
          onChange={setAvailability}
          options={availabilityOptions}
        />
      </div>

      <TextareaField
        id="volunteer-experience"
        label="Relevant experience"
        value={experience}
        onChange={setExperience}
        rows={4}
        helper="Optional. Share any experience relevant to your area of interest."
      />

      <TextareaField
        id="volunteer-motivation"
        label="Short motivation statement"
        value={motivation}
        onChange={setMotivation}
        required
        error={errors.motivation}
        rows={4}
      />

      <FileUploadField
        id="volunteer-cv"
        label="CV upload"
        helper="Optional. Files are not uploaded on this demonstration site."
      />

      <CheckboxField
        id="volunteer-consent"
        label="I consent to HRPF processing this information for volunteer consideration."
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />

      <SubmitButton loading={loading}>Submit Application</SubmitButton>
    </form>
  );
}
