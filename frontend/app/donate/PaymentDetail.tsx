"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import TranslationText from "@/components/translation/TranslationText";

export default function PaymentDetail({ label, value }: { label: string; value: string }) {
  const [message, setMessage] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setMessage("Copied to clipboard.");
    } catch {
      setMessage("Select the number above and copy it manually.");
    }
  }

  return (
    <div className="border-t border-border py-5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span dir="ltr" translate="no" className="notranslate select-text break-all font-mono text-base font-semibold tabular-nums text-navy sm:text-lg">{value}</span>
          <button type="button" onClick={copy} aria-label={`Copy ${label}`} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-teal-dark transition-colors hover:bg-teal/10 focus-visible:outline-2 focus-visible:outline-offset-2">
            <Copy className="h-4 w-4" aria-hidden="true" />
            <TranslationText>Copy</TranslationText>
          </button>
        </div>
        <p role="status" className="mt-1 text-sm text-teal-dark"><TranslationText>{message}</TranslationText></p>
      </dd>
    </div>
  );
}
