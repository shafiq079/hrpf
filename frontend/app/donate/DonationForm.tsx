"use client";
import TranslationText from "@/components/translation/TranslationText";

import { useId, useState } from "react";
import { SelectField, TextField } from "@/components/forms/fields";
import FormMessage from "@/components/forms/FormMessage";
import SubmitButton from "@/components/forms/SubmitButton";
import { projects } from "@/data/projects";

/*
  Donation form for /donate.

  IMPORTANT: This form does NOT process payments. Online payment processing is
  not configured on this demonstration website and no financial data should be
  entered. A production version REQUIRES a secure, PCI-compliant payment
  provider integration and a secure backend before accepting real donations.
  No data is transmitted or stored here.
*/

type Frequency = "One-time" | "Monthly";

interface PresetAmount {
  value: string;
  impact: string;
}

const presetAmounts: PresetAmount[] = [
  { value: "25", impact: "could help print awareness materials" },
  { value: "50", impact: "could support a community information session" },
  { value: "100", impact: "could contribute to documentation activities" },
  { value: "250", impact: "could help sustain a referral programme" },
];

const projectOptions = projects.map((project) => project.title);

export default function DonationForm() {
  const groupId = useId();
  const [frequency, setFrequency] = useState<Frequency>("One-time");
  const [amount, setAmount] = useState("50");
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [project, setProject] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showNotice, setShowNotice] = useState(false);

  const selectedPreset = presetAmounts.find((preset) => preset.value === amount);

  const handleSelectPreset = (value: string) => {
    setIsCustom(false);
    setAmount(value);
    setShowNotice(false);
  };

  const handleSelectCustom = () => {
    setIsCustom(true);
    setShowNotice(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // No payment is processed. Surface a clear, accessible notice instead.
    setShowNotice(true);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Frequency toggle */}
      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-text">
          <TranslationText>Donation frequency
        </TranslationText></legend>
        <div
          role="radiogroup"
          aria-label="Donation frequency"
          className="inline-flex rounded-md border border-border bg-white p-1"
        >
          {(["One-time", "Monthly"] as Frequency[]).map((option) => {
            const active = frequency === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setFrequency(option)}
                className={`rounded px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  active
                    ? "bg-navy text-white"
                    : "bg-transparent text-muted hover:text-text"
                }`}
              >
                <TranslationText>{option}</TranslationText>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Amount selection */}
      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-text">
          <TranslationText>Select an amount
        </TranslationText></legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {presetAmounts.map((preset) => {
            const active = !isCustom && amount === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                aria-pressed={active}
                onClick={() => handleSelectPreset(preset.value)}
                className={`rounded-md border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  active
                    ? "border-teal bg-teal/10 text-teal-dark"
                    : "border-border bg-white text-text hover:border-navy"
                }`}
              >
                <TranslationText>$</TranslationText><TranslationText>{preset.value}</TranslationText>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            type="button"
            aria-pressed={isCustom}
            onClick={handleSelectCustom}
            className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isCustom
                ? "border-teal bg-teal/10 text-teal-dark"
                : "border-border bg-white text-text hover:border-navy"
            }`}
          >
            <TranslationText>Custom amount
          </TranslationText></button>
          {isCustom && (
            <div className="mt-3">
              <TextField
                id={`${groupId}-custom-amount`}
                label="Custom amount (USD)"
                type="text"
                value={customAmount}
                onChange={setCustomAmount}
                placeholder="Enter an amount"
                helper="Illustrative only — no payment will be processed."
              />
            </div>
          )}
        </div>

        {!isCustom && selectedPreset && (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            <span className="font-medium text-text">
              <TranslationText>$</TranslationText><TranslationText>{selectedPreset.value}</TranslationText> <TranslationText>{selectedPreset.impact}</TranslationText>
            </span>{" "}
            <span className="italic"><TranslationText>(illustrative example)</TranslationText></span>
          </p>
        )}
      </fieldset>

      {/* Sponsor a project */}
      <SelectField
        id={`${groupId}-project`}
        label="Sponsor a project (optional)"
        value={project}
        onChange={setProject}
        options={projectOptions}
        helper="Choose a project your contribution could support."
      />

      {/* Donor details */}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id={`${groupId}-name`}
          label="Full name"
          value={name}
          onChange={setName}
          autoComplete="name"
        />
        <TextField
          id={`${groupId}-email`}
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
      </div>

      {showNotice && (
        <FormMessage
          type="error"
          title="Online payments are not available yet"
        >
          <p>
            <TranslationText>Online payment processing has not been configured on this
            demonstration website, so no donation can be completed and no
            financial information should be entered. Please check back once
            secure payment processing is available.
          </TranslationText></p>
        </FormMessage>
      )}

      <SubmitButton variant="gold"><TranslationText>Donate</TranslationText></SubmitButton>
      <p className="text-xs leading-relaxed text-muted">
        <TranslationText>This button does not process a real payment. Online donations are
        disabled until a secure payment provider is configured.
      </TranslationText></p>
    </form>
  );
}
