"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Globe2 } from "lucide-react";
import { isAdminPath, preferredTranslation, RTL_LANGUAGES, TRANSLATION_PREFERENCE, TRANSLATION_SCRIPT } from "@/lib/translation";

type Translator = {
  libReady: boolean;
  finished: boolean;
  error: boolean;
  revert: () => void;
};
declare global {
  interface Window {
    gtranslateSettings?: Record<string, unknown>;
    __GT?: { translator?: Translator };
  }
}

/** One persistent, provider-owned dropdown for desktop and mobile. Load only
 * after an explicit request or a previously selected translation. The provider
 * observes new public text, including future managed records and UI updates.
 */
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const privatePage = isAdminPath(pathname);
  const host = useRef<HTMLDivElement>(null);
  const loader = useRef<(() => void) | null>(null);
  const reset = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (privatePage || process.env.NEXT_PUBLIC_TEXT_TRANSLATION === "off") return;
    let disposed = false;
    let script: HTMLScriptElement | null = null;
    let select: HTMLSelectElement | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let loading = false;
    let loadTimeout: ReturnType<typeof setTimeout> | null = null;
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    const direction = (language: string) => {
      document.documentElement.lang = language === "iw" ? "he" : language;
      document.documentElement.dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
    };
    const restoreEnglish = () => {
      stop();
      window.__GT?.translator?.revert();
      try { localStorage.removeItem(TRANSLATION_PREFERENCE); } catch { /* optional storage */ }
      if (select) select.value = "en|en";
      direction("en");
      if (!disposed) setMessage("");
    };
    reset.current = () => {
      if (select) {
        select.value = "en|en";
        // Queue English behind any library download still in flight.
        select.dispatchEvent(new Event("change", { bubbles: true }));
      } else restoreEnglish();
    };
    const monitor = () => {
      stop();
      const language = select?.value.split("|")[1] || "en";
      if (language === "en") { restoreEnglish(); return; }
      setMessage("Translating text…");
      const started = Date.now();
      timer = setInterval(() => {
        const translator = window.__GT?.translator;
        if (translator?.error || Date.now() - started > 30000) {
          stop();
          setMessage("Translation is unavailable. Try another language or return to English.");
        } else if (translator?.libReady && translator.finished) {
          stop();
          direction(language);
          setMessage("Automatic text translation is active.");
        }
      }, 250);
    };
    const load = () => {
      if (loading || select || !host.current) return;
      loading = true;
      setStatus("loading");
      setMessage("");
      host.current.replaceChildren(); // This subtree is owned by the provider.
      script?.remove();
      window.gtranslateSettings = {
        default_language: "en",
        url_structure: "none",
        native_language_names: true,
        detect_browser_language: false,
        wrapper_selector: "#hrpf-language-widget",
        select_language_label: "Choose language",
      };
      script = document.createElement("script");
      script.src = TRANSLATION_SCRIPT;
      script.async = true;
      script.dataset.hrpfTranslation = "true";
      script.onload = () => {
        if (disposed) return;
        if (loadTimeout) clearTimeout(loadTimeout);
        loading = false;
        select = host.current?.querySelector<HTMLSelectElement>("select.gt_selector") ?? null;
        if (!select) { setStatus("failed"); return; }
        select.id = "hrpf-language-select";
        select.setAttribute("aria-describedby", "hrpf-language-note");
        select.addEventListener("change", monitor);
        setStatus("ready");
        if (select.value !== "en|en") monitor();
      };
      script.onerror = () => {
        if (disposed) return;
        if (loadTimeout) clearTimeout(loadTimeout);
        loading = false;
        setStatus("failed");
        setMessage("Languages could not load. You can continue using the English website.");
      };
      document.body.appendChild(script);
      loadTimeout = setTimeout(() => {
        if (!disposed && loading) {
          loading = false;
          script?.remove();
          setStatus("failed");
          setMessage("Languages could not load. You can continue using the English website.");
        }
      }, 30000);
    };
    loader.current = load;
    if (preferredTranslation() !== "en") load();
    // The provider restores original nodes on pagehide before a BFCache entry.
    // Reapply the selection when browser Back/Forward restores that document.
    const resume = (event: PageTransitionEvent) => {
      if (event.persisted && select) select.dispatchEvent(new Event("change", { bubbles: true }));
    };
    window.addEventListener("pageshow", resume);
    return () => {
      disposed = true;
      stop();
      if (loadTimeout) clearTimeout(loadTimeout);
      loader.current = null;
      reset.current = null;
      window.removeEventListener("pageshow", resume);
      select?.removeEventListener("change", monitor);
      script?.remove();
      // A private destination must never inherit translated public DOM.
      window.__GT?.translator?.revert();
      direction("en");
    };
  }, [privatePage]);

  if (privatePage || process.env.NEXT_PUBLIC_TEXT_TRANSLATION === "off") return null;
  return <div className="notranslate border-b border-border bg-soft-gray" translate="no" lang="en" dir="ltr">
    <div className="mx-auto flex w-full max-w-[75rem] flex-wrap items-center justify-end gap-x-3 gap-y-1 px-[18px] py-1.5 text-xs text-navy sm:px-6">
      <Globe2 size={15} aria-hidden="true" />
      {status !== "ready" && <button type="button" onClick={() => loader.current?.()} disabled={status === "loading"} aria-controls="hrpf-language-widget" className="min-h-8 font-semibold underline-offset-4 hover:underline disabled:opacity-60">
        {status === "loading" ? "Loading languages…" : status === "failed" ? "Retry languages" : "Languages"}
      </button>}
      <div id="hrpf-language-widget" ref={host} className="hrpf-language-widget" />
      {status === "ready" && <>
        <span id="hrpf-language-note" className="text-muted">Automatic text translation</span>
        <button type="button" onClick={() => reset.current?.()} className="min-h-8 font-medium underline underline-offset-4">English</button>
      </>}
      <span role="status" aria-live="polite" className="basis-full text-end text-muted">{message}</span>
    </div>
  </div>;
}
