"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  Multi-step "Report a Human-Rights Concern" form.

  This is UI only. No files are uploaded and no data is transmitted or stored.
  A production implementation MUST provide a secure, confidential backend with
  strict access controls, encryption in transit and at rest, and a documented
  handling process. Do NOT persist report data in localStorage.
*/

interface ReportData {
  fullName: string;
  anonymous: boolean;
  email: string;
  phone: string;
  preferredContact: string;
  country: string;
  location: string;
  incidentDate: string;
  concernType: string;
  urgency: string;
  description: string;
  affected: string;
  responsible: string;
  witness: string;
  additionalContext: string;
  evidenceFile: string | null;
  evidenceDescription: string;
  referenceNumber: string;
  confirmAccurate: boolean;
  understandNoRelationship: boolean;
  understandReferral: boolean;
  permissionToContact: boolean;
}

const initialData: ReportData = {
  fullName: "",
  anonymous: false,
  email: "",
  phone: "",
  preferredContact: "",
  country: "",
  location: "",
  incidentDate: "",
  concernType: "",
  urgency: "",
  description: "",
  affected: "",
  responsible: "",
  witness: "",
  additionalContext: "",
  evidenceFile: null,
  evidenceDescription: "",
  referenceNumber: "",
  confirmAccurate: false,
  understandNoRelationship: false,
  understandReferral: false,
  permissionToContact: false,
};

const steps = [
  "About You",
  "Incident Details",
  "People Involved",
  "Supporting Evidence",
  "Consent & Review",
];

const concernTypes = [
  "Discrimination",
  "Access to justice",
  "Child protection",
  "Women's rights",
  "Minority rights",
  "Privacy or digital rights",
  "Other",
];

const urgencyLevels = ["Low", "Medium", "High"];
const contactMethods = ["Email", "Phone", "No preference"];

type Errors = Partial<Record<keyof ReportData, string>>;

export default function ReportViolationForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ReportData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  const update = <K extends keyof ReportData>(key: K, value: ReportData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep = (current: number): Errors => {
    const next: Errors = {};
    if (current === 0) {
      if (!data.anonymous) {
        if (!data.fullName.trim()) next.fullName = "Please enter your name or choose to report anonymously.";
        if (!data.email.trim() && !data.phone.trim()) {
          next.email = "Provide an email or phone number so we can respond.";
        } else if (data.email.trim() && !isValidEmail(data.email)) {
          next.email = "Please enter a valid email address.";
        }
      }
    }
    if (current === 1) {
      if (!data.country.trim()) next.country = "Please enter a country.";
      if (!data.concernType) next.concernType = "Please select a type of concern.";
      if (!data.description.trim() || data.description.trim().length < 20) {
        next.description = "Please provide a description (at least 20 characters).";
      }
    }
    if (current === 4) {
      if (!data.confirmAccurate) next.confirmAccurate = "Please confirm the information is accurate.";
      if (!data.understandNoRelationship) next.understandNoRelationship = "Please acknowledge this statement.";
      if (!data.understandReferral) next.understandReferral = "Please acknowledge this statement.";
      if (!data.anonymous && !data.permissionToContact) {
        next.permissionToContact = "Please give permission to contact you, or report anonymously.";
      }
    }
    return next;
  };

  const goNext = () => {
    const stepErrors = validateStep(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const stepErrors = validateStep(4);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setLoading(true);
    await simulateSubmit();
    setLoading(false);
    setReference(sampleReference("HRPF"));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <FormMessage type="success" title="Thank you — your report has been received">
        <p>
          Your information has been recorded for this demonstration only. A sample
          reference number is shown below.
        </p>
        <p className="mt-2 font-mono text-sm font-semibold text-navy">
          Reference: {reference}
        </p>
        <p className="mt-2">
          Submitting a report does not guarantee investigation, representation or a
          specific outcome. If someone is in immediate danger, contact your local
          emergency service.
        </p>
      </FormMessage>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Progress indicator */}
      <ol className="mb-8 flex flex-wrap gap-2" aria-label="Progress">
        {steps.map((label, index) => {
          const state =
            index < step ? "done" : index === step ? "current" : "upcoming";
          return (
            <li key={label} className="flex-1 min-w-[100px]">
              <div
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${
                  state === "current"
                    ? "border-teal bg-teal/10 text-teal-dark"
                    : state === "done"
                      ? "border-border bg-white text-navy"
                      : "border-border bg-white text-muted"
                }`}
                aria-current={state === "current" ? "step" : undefined}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                    state === "upcoming"
                      ? "bg-soft-gray text-muted"
                      : "bg-teal text-white"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="truncate">{label}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <h2 className="font-serif text-xl font-semibold text-navy">
        Step {step + 1}: {steps[step]}
      </h2>

      <div className="mt-5 space-y-5">
        {step === 0 && (
          <>
            <TextField
              id="fullName"
              label="Full name"
              value={data.fullName}
              onChange={(v) => update("fullName", v)}
              required={!data.anonymous}
              error={errors.fullName}
              autoComplete="name"
            />
            <CheckboxField
              id="anonymous"
              label="I would like to report anonymously"
              checked={data.anonymous}
              onChange={(v) => update("anonymous", v)}
            />
            {!data.anonymous && (
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  id="email"
                  label="Email"
                  type="email"
                  value={data.email}
                  onChange={(v) => update("email", v)}
                  error={errors.email}
                  autoComplete="email"
                />
                <TextField
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={data.phone}
                  onChange={(v) => update("phone", v)}
                  autoComplete="tel"
                />
                <SelectField
                  id="preferredContact"
                  label="Preferred contact method"
                  value={data.preferredContact}
                  onChange={(v) => update("preferredContact", v)}
                  options={contactMethods}
                />
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="country"
                label="Country"
                value={data.country}
                onChange={(v) => update("country", v)}
                required
                error={errors.country}
              />
              <TextField
                id="location"
                label="City or location"
                value={data.location}
                onChange={(v) => update("location", v)}
              />
              <TextField
                id="incidentDate"
                label="Date of incident"
                type="date"
                value={data.incidentDate}
                onChange={(v) => update("incidentDate", v)}
              />
              <SelectField
                id="concernType"
                label="Type of concern"
                value={data.concernType}
                onChange={(v) => update("concernType", v)}
                options={concernTypes}
                required
                error={errors.concernType}
              />
              <SelectField
                id="urgency"
                label="Urgency level"
                value={data.urgency}
                onChange={(v) => update("urgency", v)}
                options={urgencyLevels}
              />
            </div>
            <TextareaField
              id="description"
              label="Detailed description"
              value={data.description}
              onChange={(v) => update("description", v)}
              required
              error={errors.description}
              helper="Please describe what happened. Avoid including more sensitive detail than necessary."
              rows={6}
            />
          </>
        )}

        {step === 2 && (
          <>
            <TextField
              id="affected"
              label="Person or organization affected"
              value={data.affected}
              onChange={(v) => update("affected", v)}
            />
            <TextField
              id="responsible"
              label="Person or organization alleged to be responsible"
              value={data.responsible}
              onChange={(v) => update("responsible", v)}
            />
            <TextareaField
              id="witness"
              label="Witness information"
              value={data.witness}
              onChange={(v) => update("witness", v)}
              rows={3}
            />
            <TextareaField
              id="additionalContext"
              label="Additional context"
              value={data.additionalContext}
              onChange={(v) => update("additionalContext", v)}
              rows={3}
            />
          </>
        )}

        {step === 3 && (
          <>
            <FileUploadField
              id="evidenceFile"
              label="Supporting evidence (optional)"
              helper="Files are not uploaded on this demonstration site."
              onChange={(fileName) => update("evidenceFile", fileName)}
            />
            <TextareaField
              id="evidenceDescription"
              label="Evidence description"
              value={data.evidenceDescription}
              onChange={(v) => update("evidenceDescription", v)}
              rows={3}
            />
            <TextField
              id="referenceNumber"
              label="Existing report or reference number (if any)"
              value={data.referenceNumber}
              onChange={(v) => update("referenceNumber", v)}
            />
          </>
        )}

        {step === 4 && (
          <>
            {/* Review summary */}
            <div className="rounded-lg border border-border bg-soft-gray p-4 text-sm">
              <p className="font-semibold text-navy">Review</p>
              <dl className="mt-2 space-y-1 text-muted">
                <div className="flex gap-2">
                  <dt className="font-medium text-text">Reporting:</dt>
                  <dd>{data.anonymous ? "Anonymously" : data.fullName || "—"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-text">Country:</dt>
                  <dd>{data.country || "—"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-text">Concern:</dt>
                  <dd>{data.concernType || "—"}</dd>
                </div>
              </dl>
            </div>

            <fieldset className="space-y-3">
              <legend className="sr-only">Consent</legend>
              <CheckboxField
                id="confirmAccurate"
                label="I confirm the information is accurate to the best of my knowledge."
                checked={data.confirmAccurate}
                onChange={(v) => update("confirmAccurate", v)}
                error={errors.confirmAccurate}
              />
              <CheckboxField
                id="understandNoRelationship"
                label="I understand that submission does not create a lawyer-client relationship."
                checked={data.understandNoRelationship}
                onChange={(v) => update("understandNoRelationship", v)}
                error={errors.understandNoRelationship}
              />
              <CheckboxField
                id="understandReferral"
                label="I understand that HRPF may refer the matter to another qualified service."
                checked={data.understandReferral}
                onChange={(v) => update("understandReferral", v)}
                error={errors.understandReferral}
              />
              {!data.anonymous && (
                <CheckboxField
                  id="permissionToContact"
                  label="I give permission to contact me."
                  checked={data.permissionToContact}
                  onChange={(v) => update("permissionToContact", v)}
                  error={errors.permissionToContact}
                />
              )}
            </fieldset>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-1.5 rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Save and Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <SubmitButton loading={loading}>Submit Report</SubmitButton>
        )}
      </div>
    </form>
  );
}
