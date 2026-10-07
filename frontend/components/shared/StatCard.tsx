import TranslationText from "@/components/translation/TranslationText";
interface StatCardProps {
  value: string;
  label: string;
  note?: string;
  /** Light variant for use on navy backgrounds. */
  tone?: "light" | "dark";
}

/** Single statistic display used on impact and detail pages. */
export default function StatCard({
  value,
  label,
  note,
  tone = "dark",
}: StatCardProps) {
  const isLight = tone === "light";

  return (
    <div
      className={`rounded-lg border p-6 text-center ${
        isLight ? "border-white/15 bg-white/5" : "border-border bg-white"
      }`}
    >
      <p
        className={`font-serif text-3xl font-semibold sm:text-4xl ${
          isLight ? "text-teal" : "text-teal-dark"
        }`}
      >
        <TranslationText>{value}</TranslationText>
      </p>
      <p
        className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
          isLight ? "text-white/70" : "text-muted"
        }`}
      >
        <TranslationText>{label}</TranslationText>
      </p>
      {note && (
        <p className={`mt-1 text-xs ${isLight ? "text-white/50" : "text-muted"}`}>
          <TranslationText>{note}</TranslationText>
        </p>
      )}
    </div>
  );
}
