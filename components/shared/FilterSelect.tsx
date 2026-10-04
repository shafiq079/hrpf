"use client";

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  /** Label for the "all" option (value is empty string). */
  allLabel?: string;
  id: string;
}

/** Accessible labelled select used in filter bars. */
export default function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel = "All",
  id,
}: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus-visible:border-teal focus-visible:outline-none"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
