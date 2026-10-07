import type { ReactNode } from "react";

/*
  Presentational, controlled form field primitives. These are used inside
  client form components (which own the state). They wire up labels, helper
  text, error messages and the appropriate aria attributes for accessibility.
*/

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: (describedBy: string | undefined, invalid: boolean) => ReactNode;
}

function FieldShell({
  id,
  label,
  required,
  helper,
  error,
  children,
}: FieldShellProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-text"
      >
        {label}
        {required && <span className="text-red-dark"> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children(describedBy, Boolean(error))}
      {helper && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-muted">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-dark">
          {error}
        </p>
      )}
    </div>
  );
}

const controlClasses =
  "w-full rounded-md border bg-white px-3 py-2.5 text-sm text-text placeholder:text-muted focus-visible:outline-none";
const borderOk = "border-border focus-visible:border-teal";
const borderErr = "border-red focus-visible:border-red";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  type?: "text" | "email" | "tel" | "url" | "date";
  required?: boolean;
  helper?: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  name,
  type = "text",
  required,
  helper,
  error,
  placeholder,
  autoComplete,
  maxLength,
}: TextFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      helper={helper}
      error={error}
    >
      {(describedBy, invalid) => (
        <input
          id={id}
          name={name ?? id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${controlClasses} ${invalid ? borderErr : borderOk}`}
        />
      )}
    </FieldShell>
  );
}

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function TextareaField({
  id,
  label,
  value,
  onChange,
  name,
  required,
  helper,
  error,
  placeholder,
  rows = 5,
  maxLength,
}: TextareaFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      helper={helper}
      error={error}
    >
      {(describedBy, invalid) => (
        <textarea
          id={id}
          name={name ?? id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${controlClasses} resize-y ${invalid ? borderErr : borderOk}`}
        />
      )}
    </FieldShell>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  name?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  placeholder?: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  name,
  required,
  helper,
  error,
  placeholder = "Please select",
}: SelectFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      helper={helper}
      error={error}
    >
      {(describedBy, invalid) => (
        <select
          id={id}
          name={name ?? id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${controlClasses} ${invalid ? borderErr : borderOk}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

interface CheckboxFieldProps {
  id: string;
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
  error?: string;
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  name,
  error,
}: CheckboxFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          name={name ?? id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-teal focus-visible:outline-2 focus-visible:outline-offset-2 accent-[var(--color-teal)]"
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-text">
          {label}
        </label>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-dark">
          {error}
        </p>
      )}
    </div>
  );
}

interface FileUploadFieldProps {
  id: string;
  label: string;
  name?: string;
  helper?: string;
  onChange?: (fileName: string | null) => void;
}

/**
 * File upload UI only. The selected file name is surfaced for display but the
 * file is NOT uploaded anywhere on this demonstration site.
 */
export function FileUploadField({
  id,
  label,
  name,
  helper,
  onChange,
}: FileUploadFieldProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-text"
      >
        {label}
      </label>
      <input
        id={id}
        name={name ?? id}
        type="file"
        aria-describedby={helperId}
        onChange={(event) => onChange?.(event.target.files?.[0]?.name ?? null)}
        className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-dark"
      />
      {helper && (
        <p id={helperId} className="mt-1.5 text-xs text-muted">
          {helper}
        </p>
      )}
    </div>
  );
}
