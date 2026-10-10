"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "@/components/translation/TranslationLink";
import TranslationText from "@/components/translation/TranslationText";
import { TextField, SelectField } from "./fields";
import ComplaintVerification from "./ComplaintVerification";
import {
  answerLabels,
  fileLabels,
  emptyAnswers,
  interests,
  availability,
  feeChoices,
  amountPKR,
  importantNote,
  confirmationMessage,
  declaration,
  validateApplication,
  type Answers,
  type Files,
} from "@/lib/membership-registration";
import {
  newMembershipAttempt,
  submitMembership,
} from "@/lib/membership-submission";
import { paymentDetails } from "@/data/paymentDetails";
import PaymentDetail from "@/app/donate/PaymentDetail";
const button =
  "min-h-11 rounded-md bg-teal px-5 py-3 font-semibold text-white hover:bg-teal-dark disabled:opacity-50";
const imageAccept = ".jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff";
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-6 rounded-xl border border-border bg-white p-5 sm:p-8">
      <h3 className="border-b border-border pb-4 font-serif text-xl font-semibold text-navy">
        <TranslationText>{title}</TranslationText>
      </h3>
      {children}
    </section>
  );
}
function Choices({
  id,
  title,
  options,
  selected,
  onChange,
  error,
  radio = false,
  helper,
}: {
  id: string;
  title: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  error?: string;
  radio?: boolean;
  helper?: string;
}) {
  return (
    <fieldset
      id={id}
      tabIndex={-1}
      aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
      className="min-w-0"
    >
      <legend className="text-base font-semibold text-navy">
        <TranslationText>{title}</TranslationText>
        <span className="text-red-dark"> *</span>
        <span className="sr-only">required</span>
      </legend>
      <p id={`${id}-hint`} className="mb-3 mt-1 text-sm text-muted">
        <TranslationText>
          {helper || (radio ? "Choose one option." : "Choose all that apply.")}
        </TranslationText>
      </p>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 text-sm leading-relaxed ${selected.includes(option) ? "border-teal bg-teal/5" : "border-border"}`}
          >
            <input
              translate="no"
              type={radio ? "radio" : "checkbox"}
              name={id}
              value={option}
              checked={selected.includes(option)}
              onChange={() =>
                onChange(
                  radio
                    ? [option]
                    : selected.includes(option)
                      ? selected.filter((v) => v !== option)
                      : [...selected, option],
                )
              }
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-teal)]"
            />
            <TranslationText>{option}</TranslationText>
          </label>
        ))}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 text-sm font-medium text-red-dark"
          translate="no"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
function UploadField({
  id,
  files,
  onChange,
  error,
}: {
  id: keyof Files;
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}) {
  const multiple = id === "cnic" || id === "police";
  return (
    <div id={id} tabIndex={-1}>
      <label htmlFor={`${id}-file`} className="block font-semibold text-navy">
        <TranslationText>{fileLabels[id]}</TranslationText>
        <span className="text-red-dark"> *</span>
        <span className="sr-only">required</span>
      </label>
      <p id={`${id}-hint`} className="mb-3 mt-1 text-sm text-muted">
        <TranslationText>{`${multiple ? "Up to 5 files" : "1 file"}, maximum 10 MB each. ${id === "police" ? "Images, PDF, Word or ODT documents." : "JPG, PNG, WebP, GIF, BMP or TIFF images."}${id === "cnic" ? " Include clear pictures of both sides of your CNIC." : ""}`}</TranslationText>
      </p>
      <input
        id={`${id}-file`}
        translate="no"
        type="file"
        multiple={multiple}
        accept={imageAccept + (id === "police" ? ",.pdf,.doc,.docx,.odt" : "")}
        aria-invalid={!!error}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        onChange={(e) => {
          onChange(Array.from(e.target.files || []));
          e.target.value = "";
        }}
        className="block w-full min-w-0 rounded-lg border border-dashed border-border p-3 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-navy file:px-4 file:py-2.5 file:font-semibold file:text-white"
      />
      <ul className="mt-3 space-y-2" translate="no">
        {files.map((f, index) => (
          <li
            key={`${f.name}-${index}`}
            className="flex items-center justify-between gap-3 rounded-md bg-off-white p-3"
          >
            <span className="min-w-0 break-all text-sm">
              {f.name}{" "}
              <span className="text-muted">
                ({(f.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </span>
            <button
              type="button"
              className="min-h-11 shrink-0 px-2 text-sm font-semibold text-red-dark"
              aria-label={`Delete ${f.name}`}
              onClick={() => onChange(files.filter((_, i) => i !== index))}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p
          id={`${id}-error`}
          translate="no"
          className="mt-2 text-sm font-medium text-red-dark"
        >
          {error}
        </p>
      )}
    </div>
  );
}
export default function MembershipForm() {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers),
    [files, setFiles] = useState<Files>({
      cnic: [],
      photo: [],
      payment: [],
      police: [],
    });
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [config, setConfig] = useState<{
      available: boolean;
      paymentMethods: string[];
    } | null>(null),
    [configError, setConfigError] = useState(""),
    [configRevision, setConfigRevision] = useState(0);
  const [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [progress, setProgress] = useState(""),
    [reference, setReference] = useState(""),
    [token, setToken] = useState(""),
    [verification, setVerification] = useState(0);
  const attempt = useRef(newMembershipAttempt()),
    acting = useRef(false),
    errorSummary = useRef<HTMLDivElement>(null),
    reviewHeading = useRef<HTMLHeadingElement>(null);
  const [frozen, setFrozen] = useState(false),
    [hasSession, setHasSession] = useState(false);
  const locked = busy || frozen;
  const onError = useCallback((text: string) => setMessage(text), []);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/membership-registration/config", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const body = await response.json();
        if (!body.data || !Array.isArray(body.data.paymentMethods))
          throw new Error();
        return body.data;
      })
      .then((data) => {
        setConfig(data);
        setConfigError("");
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setConfigError("The application service could not load. Try again.");
      });
    return () => controller.abort();
  }, [configRevision]);
  useEffect(() => {
    if (Object.keys(errors).length) errorSummary.current?.focus();
  }, [errors]);
  useEffect(() => {
    if (review) reviewHeading.current?.focus();
  }, [review]);
  function change<K extends keyof Answers>(key: K, value: Answers[K]) {
    attempt.current = newMembershipAttempt();
    setHasSession(false);
    setAnswers((a) => ({
      ...a,
      [key]: value,
      ...(key === "availability" && !(value as string[]).includes("Other")
        ? { availabilityOther: "" }
        : {}),
    }));
    setErrors({});
  }
  function upload(key: keyof Files, value: File[]) {
    attempt.current = newMembershipAttempt();
    setHasSession(false);
    setFiles((f) => ({ ...f, [key]: value }));
    setErrors({});
  }
  function text(
    key: keyof Answers,
    required = true,
    type: "text" | "email" | "tel" | "date" = "text",
    maxLength = 150,
    helper?: string,
  ) {
    return (
      <TextField
        key={key}
        id={key}
        label={answerLabels[key]}
        value={String(answers[key])}
        onChange={(value) => change(key, value)}
        required={required}
        type={type}
        maxLength={maxLength}
        error={errors[key]}
        helper={helper}
        autoComplete={
          key === "email"
            ? "email"
            : key === "name"
              ? "name"
              : key === "dateOfBirth"
                ? "bday"
                : "off"
        }
      />
    );
  }
  async function send() {
    if (acting.current) return;
    acting.current = true;
    setBusy(true);
    setMessage("");
    try {
      const result = await submitMembership(
        answers,
        files,
        attempt.current,
        token,
        setProgress,
      );
      if (!result.reference || result.status !== "received")
        throw new Error(
          "Receipt could not be confirmed. Retry this same submission.",
        );
      setReference(result.reference);
      attempt.current = newMembershipAttempt();
      setAnswers(emptyAnswers());
      setFiles({ cnic: [], photo: [], payment: [], police: [] });
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Submission could not be confirmed. Retry this same submission.",
      );
      if (!attempt.current.submissionStarted) {
        setToken("");
        setVerification((v) => v + 1);
      }
    } finally {
      setFrozen(attempt.current.submissionStarted);
      setHasSession(!!hasSession);
      setBusy(false);
      acting.current = false;
    }
  }
  if (reference)
    return (
      <div
        className="rounded-xl border border-teal bg-white p-6 sm:p-10"
        role="status"
      >
        <h2 className="text-2xl text-navy">Application received</h2>
        <p className="mt-4">
          <TranslationText>{confirmationMessage}</TranslationText>
        </p>
        <p className="mt-4 font-semibold" translate="no">
          Reference: {reference}
        </p>
        <p className="mt-3 text-sm text-muted">
          A confirmation email has been queued to your email address. Payment
          verification and approval are pending. Keep this reference for
          enquiries.
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-flex min-h-11 items-center font-semibold text-teal-dark underline"
        >
          Contact HRPF
        </Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl text-navy sm:text-3xl">Apply for Membership</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Complete the volunteer registration details below. Fields marked * are
          required. You can review your answers before submitting.
        </p>
        <p className="mt-2 text-sm text-muted">
          Your details and documents will be used by HRPF to review your
          application and verify payment.{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-teal-dark underline"
          >
            Read the privacy notice
          </Link>
          .
        </p>
      </div>
      {configError && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-dark bg-white p-4"
        >
          {configError}
          <button
            type="button"
            className="ml-3 min-h-11 font-semibold underline"
            onClick={() => setConfigRevision((v) => v + 1)}
          >
            Retry loading
          </button>
        </div>
      )}
      {config && !config.available && (
        <p
          role="status"
          className="mb-5 rounded-lg border border-border bg-white p-4"
        >
          Membership applications are being updated. Please{" "}
          <Link
            href="/contact"
            className="font-semibold text-teal-dark underline"
          >
            contact HRPF
          </Link>
          .
        </p>
      )}
      {Object.keys(errors).length > 0 && (
        <div
          ref={errorSummary}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-lg border-2 border-red-dark bg-white p-5"
        >
          <h3 className="font-semibold text-red-dark">Check these answers</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {Object.entries(errors).map(([id, error]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => document.getElementById(id)?.focus()}
                  className="text-sm text-red-dark underline"
                >
                  <TranslationText>
                    {answerLabels[id as keyof Answers] ||
                      fileLabels[id as keyof Files]}
                  </TranslationText>
                  : <span translate="no">{error}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (review) {
            void send();
            return;
          }
          const issues = validateApplication(
            answers,
            files,
            config?.paymentMethods || [],
          );
          setErrors(issues);
          if (!Object.keys(issues).length) setReview(true);
        }}
        className="space-y-6"
      >
        {review ? (
          <section className="rounded-xl border border-border bg-white p-5 sm:p-8">
            <h3
              ref={reviewHeading}
              tabIndex={-1}
              className="text-2xl text-navy"
            >
              Check your application
            </h3>
            <p className="mt-3 text-sm text-muted">
              Check every answer and attachment before submitting. Your
              application will be reviewed after payment verification.
            </p>
            <dl className="mt-6 divide-y divide-border">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} className="py-4">
                  <dt className="text-sm font-semibold text-navy">
                    <TranslationText>
                      {answerLabels[key as keyof Answers]}
                    </TranslationText>
                  </dt>
                  <dd
                    translate="no"
                    dir="auto"
                    className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed"
                  >
                    {Array.isArray(value)
                      ? value.join("; ")
                      : value || "Not provided"}
                  </dd>
                </div>
              ))}
              {Object.entries(files).map(([key, value]) => (
                <div key={key} className="py-4">
                  <dt className="text-sm font-semibold text-navy">
                    <TranslationText>
                      {fileLabels[key as keyof Files]}
                    </TranslationText>
                  </dt>
                  <dd translate="no" className="mt-2 break-all text-sm">
                    {value.map((f) => f.name).join("; ")}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 font-semibold">
              Selected services: PKR{" "}
              {amountPKR(answers.fees).toLocaleString("en-PK")}
            </p>
            <button
              disabled={locked}
              type="button"
              className="mt-4 min-h-11 text-sm font-semibold text-teal-dark underline"
              onClick={() => setReview(false)}
            >
              Change answers
            </button>
          </section>
        ) : (
          <fieldset disabled={locked} className="min-w-0 space-y-6">
            <Section title="1. Personal details">
              {text(
                "email",
                true,
                "email",
                254,
                "We will send your application receipt and status updates to this address.",
              )}
              {text("name")}
              {text("fatherName")}
              {text(
                "gmailId",
                true,
                "email",
                254,
                "You may enter the same address as Email above.",
              )}
              {text("dateOfBirth", true, "date", 10)}
              <Choices
                id="gender"
                title={answerLabels.gender}
                options={["Male", "Female", "Other"]}
                selected={answers.gender ? [answers.gender] : []}
                onChange={(v) => change("gender", v[0])}
                radio
                error={errors.gender}
              />
              <UploadField
                id="cnic"
                files={files.cnic}
                onChange={(f) => upload("cnic", f)}
                error={errors.cnic}
              />
              <UploadField
                id="photo"
                files={files.photo}
                onChange={(f) => upload("photo", f)}
                error={errors.photo}
              />
              {text(
                "phone",
                true,
                "tel",
                200,
                "Include both numbers if your mobile and WhatsApp numbers are different.",
              )}
            </Section>
            <Section title="2. Volunteer interests and availability">
              {text("address", true, "text", 1000)}
              <Choices
                id="interests"
                title={answerLabels.interests}
                helper="Preferred Area of Service (Checkboxes)"
                options={interests}
                selected={answers.interests}
                onChange={(v) => change("interests", v)}
                error={errors.interests}
              />
              <Choices
                id="availability"
                title={answerLabels.availability}
                options={availability}
                selected={answers.availability}
                onChange={(v) => change("availability", v)}
                error={errors.availability}
              />
              {answers.availability.includes("Other") &&
                text("availabilityOther", true, "text", 500)}
              {text("emergencyContact", true, "text", 300)}
            </Section>
            <Section title="3. Fees, payment and documentation">
              <Choices
                id="fees"
                title={answerLabels.fees}
                options={feeChoices}
                selected={answers.fees}
                onChange={(v) => change("fees", v)}
                error={errors.fees}
              />
              <p className="rounded-lg bg-teal/5 p-4 text-sm">
                Selected services:{" "}
                <strong>
                  PKR {amountPKR(answers.fees).toLocaleString("en-PK")}
                </strong>
                . The PKR 5,000 total covers both services and is counted once.
              </p>
              <SelectField
                id="paymentMethod"
                label={answerLabels.paymentMethod}
                value={answers.paymentMethod}
                onChange={(v) => change("paymentMethod", v)}
                options={
                  config?.paymentMethods || ["Bank transfer", "JazzCash"]
                }
                required
                error={errors.paymentMethod}
              />
              {answers.paymentMethod && (
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold">Transfer details</h4>
                  {answers.paymentMethod === "Bank transfer" ? (
                    <>
                      <p className="mt-3 text-sm" translate="no">
                        {paymentDetails.bank}
                        <br />
                        {paymentDetails.accountTitle}
                      </p>
                      <dl className="mt-4">
                        <PaymentDetail
                          label="Account number"
                          value={paymentDetails.accountNumber}
                        />
                        <PaymentDetail
                          label="IBAN"
                          value={paymentDetails.iban}
                        />
                      </dl>
                    </>
                  ) : (
                    <dl className="mt-3">
                      <PaymentDetail
                        label="JazzCash number"
                        value={paymentDetails.jazzCash}
                      />
                    </dl>
                  )}
                  <p className="mt-3 text-sm text-muted">
                    Make the transfer using your bank or JazzCash, then attach
                    the payment screenshot. This website does not process the
                    payment.
                  </p>
                </div>
              )}
              <UploadField
                id="payment"
                files={files.payment}
                onChange={(f) => upload("payment", f)}
                error={errors.payment}
              />
              <UploadField
                id="police"
                files={files.police}
                onChange={(f) => upload("police", f)}
                error={errors.police}
              />
              {text("importantNote", false, "text", 1000, importantNote)}
              <Choices
                id="certification"
                title={declaration}
                options={["Yes", "No"]}
                selected={answers.certification ? [answers.certification] : []}
                onChange={(v) => change("certification", v[0])}
                radio
                error={errors.certification}
              />
              {text(
                "confirmationMessage",
                false,
                "text",
                1000,
                confirmationMessage,
              )}
            </Section>
          </fieldset>
        )}
        {review && (
          <div className="rounded-xl border border-border bg-white p-5 sm:p-8">
            <ComplaintVerification
              key={verification}
              purpose="membership_registration"
              onToken={setToken}
              onError={onError}
            />
          </div>
        )}
        {message && (
          <p
            role="alert"
            className="rounded-lg border border-red-dark bg-white p-4 text-sm text-red-dark"
            translate="no"
          >
            {message}
            {frozen &&
              " Your answers are locked so you can safely retry the same application."}
          </p>
        )}
        {busy && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-muted"
            translate="no"
          >
            {progress}
          </p>
        )}
        <button
          className={button}
          disabled={
            busy || !config?.available || (review && !token && !hasSession)
          }
        >
          {busy
            ? "Submitting…"
            : review
              ? frozen
                ? "Retry this submission"
                : "Submit application"
              : "Review application"}
        </button>
      </form>
    </div>
  );
}
