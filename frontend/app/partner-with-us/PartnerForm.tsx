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
  Partnership inquiry form for /partner-with-us.

  UI ONLY — no data is transmitted or stored on this demonstration site.
  A production version REQUIRES a secure backend with validation, storage,
  notification and appropriate due-diligence handling before collecting real
  organizational data.
*/

const organizationTypes = [
  "International NGO",
  "Local NGO",
  "Donor agency",
  "Government institution",
  "Embassy",
  "University",
  "Research organization",
  "Law firm",
  "Media organization",
  "Company / CSR department",
];

interface Errors {
  organization?: string;
  country?: string;
  contact?: string;
  email?: string;
  collaboration?: string;
  consent?: string;
}

export default function PartnerForm() {
  const [organization, setOrganization] = useState("");
  const [orgType, setOrgType] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collaboration, setCollaboration] = useState("");
  const [resources, setResources] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!organization.trim()) {
      next.organization = "Please enter your organization name.";
    }
    if (!country.trim()) next.country = "Please enter your country.";
    if (!contact.trim()) next.contact = "Please enter a contact person.";
    if (!email.trim()) {
      next.email = "Please enter an official email address.";
    } else if (!isValidEmail(email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!collaboration.trim()) {
      next.collaboration = "Please describe your proposed collaboration.";
    }
    if (!consent) next.consent = "Please provide consent before submitting.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    await simulateSubmit();
    setLoading(false);
    setReference(sampleReference("PTR"));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <FormMessage
        type="success"
        title="Thank you — your partnership inquiry has been received"
      >
        <p>
          Your inquiry has been recorded for this demonstration only and has not
          been stored or sent anywhere. A sample reference number is shown below.
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
          id="partner-organization"
          label="Organization name"
          value={organization}
          onChange={setOrganization}
          required
          error={errors.organization}
          autoComplete="organization"
        />
        <SelectField
          id="partner-type"
          label="Organization type"
          value={orgType}
          onChange={setOrgType}
          options={organizationTypes}
        />
        <TextField
          id="partner-country"
          label="Country"
          value={country}
          onChange={setCountry}
          required
          error={errors.country}
          autoComplete="country-name"
        />
        <TextField
          id="partner-website"
          label="Website"
          type="url"
          value={website}
          onChange={setWebsite}
          placeholder="https://example.org"
          autoComplete="url"
        />
        <TextField
          id="partner-contact"
          label="Contact person"
          value={contact}
          onChange={setContact}
          required
          error={errors.contact}
          autoComplete="name"
        />
        <TextField
          id="partner-email"
          label="Official email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          id="partner-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
        />
      </div>

      <TextareaField
        id="partner-collaboration"
        label="Proposed collaboration"
        value={collaboration}
        onChange={setCollaboration}
        required
        error={errors.collaboration}
        rows={4}
      />

      <TextareaField
        id="partner-resources"
        label="Available resources"
        value={resources}
        onChange={setResources}
        rows={3}
        helper="Optional. Describe funding, expertise, networks or other resources."
      />

      <TextareaField
        id="partner-outcomes"
        label="Expected outcomes"
        value={outcomes}
        onChange={setOutcomes}
        rows={3}
        helper="Optional. Describe the impact you hope the partnership will achieve."
      />

      <FileUploadField
        id="partner-proposal"
        label="Proposal upload"
        helper="Optional. Files are not uploaded on this demonstration site."
      />

      <CheckboxField
        id="partner-consent"
        label="I consent to HRPF processing this information to assess a potential partnership."
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />

      <SubmitButton loading={loading}>Submit Partnership Inquiry</SubmitButton>
    </form>
  );
}
