/** The provider owns this preference; no translated content is saved by HRPF. */
export const TRANSLATION_PREFERENCE = "__GT_TRANSLATE_LANGS";
export const TRANSLATION_SCRIPT = "https://cdn.gtranslate.net/widgets/latest/dropdown.js";
export const RTL_LANGUAGES = new Set(["ar", "fa", "iw", "he", "ps", "sd", "ur", "yi"]);

/** Source English, completed translations and English restoration all update
 * the language and direction together. The provider uses the legacy iw code. */
export function setDocumentLanguage(language: string, root = document.documentElement) {
  root.lang = language === "iw" ? "he" : language;
  root.dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
}

export function preferredTranslation(): string {
  try {
    const value = JSON.parse(localStorage.getItem(TRANSLATION_PREFERENCE) ?? "null");
    return value?.srcLang === "en" && typeof value.tgtLang === "string" &&
      /^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(value.tgtLang) ? value.tgtLang : "en";
  } catch { return "en"; }
}

export function isAdminPath(path: string): boolean {
  return path === "/admin" || path.startsWith("/admin/");
}

/** Storage may be blocked. A pending/current native selection still requires
 * safe document navigation even when the provider cannot remember it. */
export function translationSelected(): boolean {
  if (preferredTranslation() !== "en") return true;
  const selected = document.querySelector<HTMLSelectElement>("#hrpf-language-select")?.value.split("|")[1];
  return Boolean(selected && selected !== "en") || document.documentElement.lang !== "en";
}
