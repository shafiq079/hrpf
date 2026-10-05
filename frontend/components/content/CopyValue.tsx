"use client";
import { useState } from "react";
export default function CopyValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [message, setMessage] = useState("");
  return (
    <div className="border-b border-border py-4">
      <dt className="text-sm font-semibold text-navy">{label}</dt>
      <dd className="mt-2 flex flex-wrap items-center gap-3">
        <span className="break-all text-muted">{value}</span>
        <button
          type="button"
          className="border border-border px-3 py-1 text-sm text-teal-dark"
          aria-label={`Copy ${label}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setMessage("Copied");
            } catch {
              setMessage("Copy unavailable; select the text to copy it.");
            }
          }}
        >
          Copy
        </button>
        <span role="status" className="text-sm text-muted">
          {message}
        </span>
      </dd>
    </div>
  );
}
