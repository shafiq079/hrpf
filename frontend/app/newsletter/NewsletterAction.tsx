"use client";
import { useState, useSyncExternalStore } from "react";
import TranslationText from "@/components/translation/TranslationText";
import Link from "@/components/translation/TranslationLink";
const subscribe = (listener: () => void) => { window.addEventListener("hashchange", listener); return () => window.removeEventListener("hashchange", listener); };
export default function NewsletterAction() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => "");
  const values = new URLSearchParams(hash.slice(1)), action = values.has("unsubscribe") ? "unsubscribe" : "confirm", token = values.get(action);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState("");
  async function submit() {
    if (busy || !token) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/newsletter/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, action }), credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(30000) });
      const result = await response.json().catch(() => null);
      if (!response.ok || !["confirmed", "unsubscribed"].includes(result?.data?.status)) throw new Error(result?.error?.message || "The request could not be confirmed. Please try again.");
      setMessage(result.data.status === "confirmed" ? "Your HRPF newsletter subscription is confirmed." : "You have been unsubscribed from HRPF newsletter updates.");
      window.history.replaceState(null, "", window.location.pathname);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="border border-border bg-white p-6 sm:p-8">
    {message ? <p role="status" className="text-lg font-semibold text-teal-dark"><TranslationText>{message}</TranslationText></p> : token ? <><p className="mb-6 text-base leading-relaxed"><TranslationText>{action === "confirm" ? "Confirm that you want to receive updates from HRPF Pakistan." : "Cancel your pending request or unsubscribe from HRPF updates."}</TranslationText></p><button disabled={busy} onClick={() => void submit()} className="bg-navy px-5 py-3 font-semibold text-white disabled:opacity-40"><TranslationText>{busy ? "Please wait…" : action === "confirm" ? "Confirm subscription" : "Unsubscribe"}</TranslationText></button></> : <p><TranslationText>Open the link in your newsletter email to confirm or unsubscribe. To request a new confirmation link, use the newsletter signup at the bottom of the website.</TranslationText></p>}
    {error && <p role="alert" className="mt-5 text-sm text-red notranslate" translate="no">{error}</p>}
    <Link href="/contact" className="mt-6 inline-block font-semibold text-teal-dark underline"><TranslationText>Contact HRPF</TranslationText></Link>
  </div>;
}
