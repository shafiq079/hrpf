"use client";

import { useState } from "react";
import {
  CheckboxField,
  FileUploadField,
  SelectField,
  TextField,
  TextareaField,
} from "./fields";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";
import { isValidEmail, sampleReference, simulateSubmit } from "@/lib/forms";

/*
  Complaint / feedback form about HRPF (distinct from reporting an external
  human-rights violation). UI only — no data is transmitted or stored.
  A production version requires a secure, confidential backend and a documented
  complaint-handling process.
*/

const categories = [
  "Staff Conduct",
  "Discrimination",
  "Safeguarding Concern",
  "Financial Concern",
  "Project Concern",
  "Privacy Concern",
  "General Feedback",
];

interface Errors {
  category?: string;
  email?: string;
  details?: string;
  consent?: string;
}

export default function ComplaintForm() {
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!category) next.category = "Please select a category.";
    if (!details.trim() || details.trim().length < 20) {
      next.details = "Please describe your concern (at least 20 characters).";
    }
    if (!anonymous && email.trim() && !isValidEmail(email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!consent) next.consent = "Please confirm before submitting.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    await simulateSubmit();
    setLoading(false);
    setReference(sampleReference("CMP"));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <FormMessage type="success" title="Thank you — your complaint has been received">
        <p>
          Your feedback has been recorded for this demonstration only. A sample
          reference number is shown below.
        </p>
        <p className="mt-2 font-mono text-sm font-semibold text-navy">
          Reference: {reference}
        </p>
      </FormMessage>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <CheckboxField
        id="complaint-anonymous"
        label="I would like to submit this complaint anonymously"
        checked={anonymous}
        onChange={setAnonymous}
      />

      {!anonymous && (
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="complaint-name"
            label="Full name"
            value={name}
            onChange={setName}
            autoComplete="name"
          />
          <TextField
            id="complaint-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            autoComplete="email"
          />
        </div>
      )}

      <SelectField
        id="complaint-category"
        label="Complaint category"
        value={category}
        onChange={setCategory}
        options={categories}
        required
        error={errors.category}
      />

      <TextareaField
        id="complaint-details"
        label="Details of your concern"
        value={details}
        onChange={setDetails}
        required
        error={errors.details}
        rows={6}
      />

      <FileUploadField
        id="complaint-file"
        label="Supporting file (optional)"
        helper="Files are not uploaded on this demonstration site."
      />

      <CheckboxField
        id="complaint-consent"
        label="I understand my complaint will be handled confidentially and used to review and improve HRPF's work."
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />

      <SubmitButton loading={loading}>Submit Complaint</SubmitButton>
    </form>
  );
}
