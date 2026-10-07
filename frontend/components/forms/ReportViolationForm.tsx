"use client";
import { useCallback, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { TextField, TextareaField, SelectField, CheckboxField } from "./fields";
import FormMessage from "./FormMessage";
import ComplaintVerification from "./ComplaintVerification";
import {
  newComplaintAttempt,
  submitComplaint,
  validateComplaintFiles,
  type ComplaintData,
  type ComplaintFiles,
} from "@/lib/complaint-submission";

const initial: ComplaintData = {
  name: "",
  fatherName: "",
  cnic: "",
  email: "",
  phone: "",
  province: "",
  district: "",
  address: "",
  category: "",
  description: "",
  priorProceedings: false,
  priorProceedingsDetails: "",
  consent: false,
};
const initialFiles: ComplaintFiles = {
  cnicImage: null,
  complaintDocument: null,
  decisions: [],
  evidence: [],
};
const steps = ["Your details", "Complaint and documents", "Review and submit"];
const provinces = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
];
const categories = [
  "Access to justice",
  "Discrimination",
  "Child protection",
  "Women’s rights",
  "Minority rights",
  "Public services",
  "Environmental concern",
  "Other",
];
const labels: Record<keyof ComplaintData, string> = {
  name: "Full name",
  fatherName: "Father’s name",
  cnic: "CNIC number",
  email: "Email",
  phone: "Phone",
  province: "Province / region",
  district: "District",
  address: "Address",
  category: "Complaint category",
  description: "Complaint details",
  priorProceedings: "Previously handled by another institution",
  priorProceedingsDetails: "Previous proceedings details",
  consent: "Consent to submit and receive email copies",
};
const button =
  "inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy/5 disabled:opacity-50 disabled:cursor-not-allowed";
function FileChoice({
  id,
  label,
  required,
  image,
  multiple,
  onChange,
  names,
}: {
  id: string;
  label: string;
  required?: boolean;
  image?: boolean;
  multiple?: boolean;
  onChange: (files: File[]) => void;
  names: string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text">
        {label}
        {required ? " *" : " (optional)"}
      </label>
      <input
        id={id}
        type="file"
        required={required && names.length === 0}
        multiple={multiple}
        accept={image ? ".jpg,.jpeg,.png,.webp" : ".jpg,.jpeg,.png,.webp,.pdf"}
        onChange={(e) => onChange(Array.from(e.target.files ?? []))}
        className="mt-2 block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-4 file:py-2 file:font-semibold file:text-white"
      />
      <p className="mt-1 text-xs text-muted">
        {image
          ? "JPG, PNG or WebP. Maximum 5 MB."
          : "JPG, PNG, WebP or PDF. Images up to 5 MB; PDFs up to 10 MB."}
      </p>
      {names.length > 0 && (
        <ul className="mt-2 break-all text-xs text-muted">
          {names.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default function ReportViolationForm() {
  const [data, setData] = useState<ComplaintData>(initial),
    [files, setFiles] = useState<ComplaintFiles>(initialFiles);
  const [step, setStep] = useState(0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(""),
    [reference, setReference] = useState(""),
    [locked, setLocked] = useState(false),
    [requestStarted, setRequestStarted] = useState(false),
    [botToken, setBotToken] = useState("");
  const attempt = useRef(newComplaintAttempt()),
    submitting = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  const tokenChanged = useCallback((token: string) => setBotToken(token), []);
  const verificationError = useCallback(
    (message: string) => setError(message),
    [],
  );
  const change = (key: keyof ComplaintData, value: string | boolean) => {
    setData((previous) => ({ ...previous, [key]: value }));
    setError("");
  };
  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (step === 0 && !/^(?:\d{13}|\d{5}-\d{7}-\d)$/.test(data.cnic.trim())) {
      setError("Enter your 13-digit CNIC number, with or without hyphens.");
      return;
    }
    if (step === 0 && !/^\+?[0-9 ()-]{7,30}$/.test(data.phone.trim())) {
      setError("Enter a valid phone number.");
      return;
    }
    if (step === 1) {
      const issue = validateComplaintFiles(files);
      if (issue) {
        setError(issue);
        return;
      }
    }
    setStep((previous) => Math.min(2, previous + 1));
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!data.consent) {
      setError("Please confirm your consent before submitting.");
      return;
    }
    if (!attempt.current.ticket && !botToken) {
      setError("Complete the security verification before submitting.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setLocked(true);
    setError("");
    try {
      const result = await submitComplaint(
        data,
        files,
        attempt.current,
        botToken,
        setProgress,
      );
      setReference(result.reference);
      setData(initial);
      setFiles(initialFiles);
      attempt.current = newComplaintAttempt();
    } catch (failure) {
      setRequestStarted(attempt.current.submissionStarted);
      setError(
        failure instanceof Error
          ? failure.message
          : "Submission could not be confirmed. Retry this same submission.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
      setProgress("");
    }
  }
  if (reference)
    return (
      <FormMessage type="success" title="Your complaint has been received">
        <p className="mt-2 font-mono font-semibold">Reference: {reference}</p>
        <p className="mt-3">
          A complete copy of your submitted form and files has been queued for
          email to you and HRPF’s administrator. Email delivery may take a
          little time.
        </p>
        <p className="mt-2">
          Keep this reference for follow-up. This confirms receipt; review is
          pending.
        </p>
      </FormMessage>
    );
  const fileNames = [
    ...(files.cnicImage ? [["CNIC proof", files.cnicImage.name]] : []),
    ...(files.complaintDocument
      ? [["Complaint document", files.complaintDocument.name]]
      : []),
    ...files.decisions.map((file) => ["Previous decision", file.name]),
    ...files.evidence.map((file) => ["Supporting evidence", file.name]),
  ];
  return (
    <form onSubmit={step === 2 ? send : next}>
      <ol
        className="mb-8 grid gap-2 sm:grid-cols-3"
        aria-label="Complaint form progress"
      >
        {steps.map((title, index) => (
          <li
            key={title}
            aria-current={index === step ? "step" : undefined}
            className={`flex items-center gap-2 rounded-md border px-3 py-3 text-sm ${step === index ? "border-teal bg-teal/10 font-semibold text-teal-dark" : "border-border text-muted"}`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs text-white">
              {index < step ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
            </span>
            {title}
          </li>
        ))}
      </ol>
      <h2
        ref={heading}
        tabIndex={-1}
        className="font-serif text-xl font-semibold text-navy"
      >
        {steps[step]}
      </h2>
      <p className="mt-2 text-sm text-muted">
        Required fields are marked *. Your form details and uploaded files will
        be emailed to you and HRPF’s administrator.
      </p>
      {error && (
        <div className="mt-5">
          <FormMessage type="error" title="Please check your submission">
            {error}
          </FormMessage>
        </div>
      )}
      <fieldset disabled={busy || locked} className="mt-6 space-y-5">
        {step === 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              {(["name", "fatherName", "cnic", "email", "phone"] as const).map(
                (key) => (
                  <TextField
                    key={key}
                    id={key}
                    label={labels[key]}
                    value={data[key]}
                    onChange={(value) => change(key, value)}
                    required
                    type={
                      key === "email"
                        ? "email"
                        : key === "phone"
                          ? "tel"
                          : "text"
                    }
                    maxLength={
                      key === "email"
                        ? 254
                        : key === "cnic"
                          ? 15
                          : key === "phone"
                            ? 30
                            : 150
                    }
                    autoComplete={
                      key === "name"
                        ? "name"
                        : key === "email"
                          ? "email"
                          : key === "phone"
                            ? "tel"
                            : "off"
                    }
                    helper={
                      key === "cnic"
                        ? "13 digits, for example 12345-1234567-1."
                        : undefined
                    }
                  />
                ),
              )}
              <SelectField
                id="province"
                label={labels.province}
                value={data.province}
                onChange={(value) => change("province", value)}
                options={provinces}
                required
              />
              <TextField
                id="district"
                label={labels.district}
                maxLength={100}
                value={data.district}
                onChange={(value) => change("district", value)}
                required
              />
            </div>
            <TextareaField
              id="address"
              label={labels.address}
              maxLength={1000}
              value={data.address}
              onChange={(value) => change("address", value)}
              rows={3}
              required
            />
          </>
        )}
        {step === 1 && (
          <>
            <SelectField
              id="category"
              label={labels.category}
              value={data.category}
              onChange={(value) => change("category", value)}
              options={categories}
              required
            />
            <TextareaField
              id="description"
              label={labels.description}
              maxLength={10000}
              value={data.description}
              onChange={(value) => change("description", value)}
              rows={7}
              required
              helper="Explain what happened, where it happened and what help you are seeking. Maximum 10,000 characters."
            />
            <div>
              <label
                htmlFor="priorProceedings"
                className="block text-sm font-medium text-text"
              >
                Has this issue previously been handled by another institution? *
              </label>
              <select
                id="priorProceedings"
                value={data.priorProceedings ? "yes" : "no"}
                onChange={(event) => {
                  change("priorProceedings", event.target.value === "yes");
                  if (event.target.value === "no") {
                    change("priorProceedingsDetails", "");
                    setFiles((previous) => ({ ...previous, decisions: [] }));
                  }
                }}
                className="mt-2 w-full rounded-md border border-border px-3 py-2.5"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            {data.priorProceedings && (
              <TextareaField
                id="priorProceedingsDetails"
                label={labels.priorProceedingsDetails}
                maxLength={5000}
                value={data.priorProceedingsDetails}
                onChange={(value) => change("priorProceedingsDetails", value)}
                required
                rows={5}
                helper="Institution name, reference number, dates, current status and any decision. Maximum 5,000 characters."
              />
            )}
            <div className="border-t border-border pt-5">
              <h3 className="font-semibold text-navy">
                Documents and evidence
              </h3>
              <p className="mb-5 mt-2 text-sm text-muted">
                Five files maximum in total. Combined size must be no more than
                15 MB. Files are scanned before your complaint is saved.
              </p>
              <div className="space-y-6">
                <FileChoice
                  id="cnic-image"
                  label="CNIC picture"
                  required
                  image
                  names={files.cnicImage ? [files.cnicImage.name] : []}
                  onChange={(values) =>
                    setFiles((previous) => ({
                      ...previous,
                      cnicImage: values[0] ?? null,
                    }))
                  }
                />
                <FileChoice
                  id="complaint-document"
                  label="Written complaint"
                  required
                  names={
                    files.complaintDocument
                      ? [files.complaintDocument.name]
                      : []
                  }
                  onChange={(values) =>
                    setFiles((previous) => ({
                      ...previous,
                      complaintDocument: values[0] ?? null,
                    }))
                  }
                />
                {data.priorProceedings && (
                  <FileChoice
                    id="decision-documents"
                    label="Documents relating to previous decisions"
                    multiple
                    names={files.decisions.map((file) => file.name)}
                    onChange={(values) =>
                      setFiles((previous) => ({
                        ...previous,
                        decisions: values,
                      }))
                    }
                  />
                )}
                <FileChoice
                  id="supporting-evidence"
                  label="Other supporting evidence"
                  multiple
                  names={files.evidence.map((file) => file.name)}
                  onChange={(values) =>
                    setFiles((previous) => ({ ...previous, evidence: values }))
                  }
                />
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="rounded-lg border border-border bg-off-white p-5">
              <h3 className="font-semibold text-navy">
                Your complete submission
              </h3>
              <dl className="mt-4 space-y-4">
                {Object.entries(labels)
                  .filter(([key]) => key !== "consent")
                  .map(([key, label]) => (
                    <div key={key}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {label}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-text">
                        {key === "priorProceedings"
                          ? data.priorProceedings
                            ? "Yes"
                            : "No"
                          : String(
                              data[key as keyof ComplaintData] ||
                                "Not applicable",
                            )}
                      </dd>
                    </div>
                  ))}
                {fileNames.map(([label, name], index) => (
                  <div key={index}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {label}
                    </dt>
                    <dd className="mt-1 break-all text-sm">{name}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <CheckboxField
              id="consent"
              checked={data.consent}
              onChange={(value) => change("consent", value)}
              label={
                <>
                  I confirm these details are accurate. I agree to HRPF
                  reviewing this complaint and emailing the full form, CNIC
                  details and uploaded files to my entered email address and
                  HRPF’s administrator. Submission does not guarantee
                  representation or a particular outcome. See our{" "}
                  <Link href="/privacy-policy" className="underline">
                    privacy policy
                  </Link>
                  .
                </>
              }
            />
          </>
        )}
      </fieldset>
      {step === 2 && !locked && (
        <div className="mt-5">
          <ComplaintVerification
            onToken={tokenChanged}
            onError={verificationError}
          />
        </div>
      )}
      {progress && (
        <p role="status" className="mt-5 text-sm font-medium text-teal-dark">
          {progress}
        </p>
      )}
      {locked && !busy && (
        <p className="mt-4 text-sm text-muted">
          Retry uses the same files and reference request to prevent duplicate
          complaints.
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={step === 0 || busy || locked}
          onClick={() => {
            setError("");
            setStep((previous) => previous - 1);
            requestAnimationFrame(() => heading.current?.focus());
          }}
          className={button}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={busy || (step === 2 && !locked && !botToken)}
          aria-busy={busy}
          className="inline-flex items-center gap-2 rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy
            ? "Submitting…"
            : step === 2
              ? locked
                ? "Retry same submission"
                : "Submit complaint"
              : "Continue"}
          {step < 2 && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
      {locked && !busy && !requestStarted && (
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-navy underline"
          onClick={() => {
            attempt.current = newComplaintAttempt();
            setRequestStarted(false);
            setLocked(false);
            setBotToken("");
            setError("");
            setStep(1);
          }}
        >
          Return to documents and try again
        </button>
      )}
    </form>
  );
}
