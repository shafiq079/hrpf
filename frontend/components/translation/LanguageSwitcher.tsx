"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronUp, Globe2, Search, X } from "lucide-react";
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

type Language = { code: string; name: string; englishName: string; value: string };

/** One persistent floating picker for desktop and mobile. Load only
 * after an explicit request or a previously selected translation. The provider
 * observes new public text, including future managed records and UI updates.
 */
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const privatePage = isAdminPath(pathname);
  const host = useRef<HTMLDivElement>(null);
  const widget = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const loader = useRef<(() => void) | null>(null);
  const choose = useRef<((value: string) => void) | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selected, setSelected] = useState("en");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const outside = (event: PointerEvent) => {
      if (widget.current && !widget.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

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
      if (!disposed) { setSelected("en"); setMessage(""); }
    };
    choose.current = (value) => {
      if (select) {
        select.value = value;
        // Keep the provider's translation, preference and restore behaviour.
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    const monitor = () => {
      stop();
      const language = select?.value.split("|")[1] || "en";
      setSelected(language);
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
        select.tabIndex = -1;
        select.setAttribute("aria-label", "Translation engine language");
        const names = new Intl.DisplayNames(["en"], { type: "language" });
        const priority = ["en", "ur", "ar"];
        setLanguages(Array.from(select.options).filter(option => option.value.includes("|")).map(option => {
          const code = option.value.split("|")[1];
          return { code, name: option.text, englishName: names.of(code) || option.text, value: option.value };
        }).sort((a, b) => {
          const rank = (code: string) => priority.includes(code) ? priority.indexOf(code) : priority.length;
          return rank(a.code) - rank(b.code);
        }));
        setSelected(select.value.split("|")[1] || "en");
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
      choose.current = null;
      window.removeEventListener("pageshow", resume);
      select?.removeEventListener("change", monitor);
      script?.remove();
      // A private destination must never inherit translated public DOM.
      window.__GT?.translator?.revert();
      direction("en");
    };
  }, [privatePage]);

  if (privatePage || process.env.NEXT_PUBLIC_TEXT_TRANSLATION === "off") return null;
  const current = languages.find(language => language.code === selected)?.name || "English";
  const filtered = languages.filter(language => `${language.name} ${language.englishName} ${language.code}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return <div ref={widget} className="hrpf-translation-float notranslate" translate="no" lang="en" dir="ltr" onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <div id="hrpf-language-widget" ref={host} hidden aria-hidden="true" />
    <button ref={trigger} type="button" aria-label={`Languages: ${current}`} aria-expanded={open} aria-controls="hrpf-language-panel" aria-haspopup="dialog"
      onClick={() => { setOpen(!open); setQuery(""); if (!open) loader.current?.(); }}
      className="flex min-h-12 items-center gap-3 border border-border bg-white px-4 py-3 text-navy shadow-[0_4px_20px_rgba(11,42,58,0.16)] transition-colors hover:bg-soft-gray">
      <Globe2 size={21} className="text-teal-dark" aria-hidden="true" />
      <span className="text-sm font-semibold tracking-wide">{selected.toUpperCase()}</span>
      <ChevronUp size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
    </button>
    <section id="hrpf-language-panel" hidden={!open} role="dialog" aria-labelledby="hrpf-language-title" aria-describedby="hrpf-language-note" className="hrpf-language-panel border border-border bg-white text-navy shadow-[0_8px_32px_rgba(11,42,58,0.18)]">
      <div className="flex items-center justify-between border-b border-border py-2 pl-4 pr-2">
        <h2 id="hrpf-language-title" className="!font-sans !text-base !leading-normal font-semibold">Translate website</h2>
        <button type="button" onClick={close} aria-label="Close languages" className="flex h-10 w-10 shrink-0 items-center justify-center hover:bg-soft-gray"><X size={18} aria-hidden="true" /></button>
      </div>
      <div className="p-3">
        <label className="flex items-center gap-2 border border-border bg-off-white px-3">
          <Search size={16} className="shrink-0 text-muted" aria-hidden="true" />
          <span className="sr-only">Search languages</span>
          <input ref={search} value={query} onChange={event => setQuery(event.target.value)} type="search" placeholder="Search languages…" autoComplete="off" className="min-h-11 w-full min-w-0 bg-transparent text-sm" />
        </label>
      </div>
      <div className="hrpf-language-list px-2 pb-2" aria-busy={status === "loading"}>
        {status === "ready" ? <>
          <ul aria-label="Available languages" className="space-y-0.5">
            {filtered.map(language => <li key={language.value}>
              <button type="button" aria-pressed={selected === language.code} onClick={() => { choose.current?.(language.value); close(); }}
                className={`flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-soft-gray ${selected === language.code ? "bg-soft-gray font-semibold" : ""}`}>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span lang={language.code === "iw" ? "he" : language.code} dir="auto">{language.name}</span>
                  {language.name !== language.englishName && <span className="text-xs font-normal text-muted">{language.englishName}</span>}
                </span>
                {selected === language.code && <Check size={16} className="shrink-0 text-teal-dark" aria-hidden="true" />}
              </button>
            </li>)}
          </ul>
          {filtered.length === 0 && <p className="px-3 py-4 text-sm text-muted">No matching languages.</p>}
        </> : <div className="px-3 py-4 text-sm">
          <p>{status === "failed" ? "Languages could not load. The English website is still available." : "Loading languages…"}</p>
          {status === "failed" && <button type="button" onClick={() => loader.current?.()} className="mt-3 min-h-11 bg-navy px-4 py-2 font-semibold text-white">Retry languages</button>}
        </div>}
      </div>
      <div className="border-t border-border px-4 py-3 text-xs leading-relaxed text-muted">
        <p id="hrpf-language-note">Automatic text translation. Select English to view the original.</p>
        {message && <p className="mt-1">{message}</p>}
      </div>
    </section>
    <span role="status" aria-live="polite" className="sr-only">{message}</span>
  </div>;
}
