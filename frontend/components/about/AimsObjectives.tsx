import TranslationText from "@/components/translation/TranslationText";
import { objectives, objectiveCount, objectivesIntroduction } from "@/data/aims-and-objectives";

const ranges = [1, 11, 21, 31];

/** Preserve the supplied sequence; the complete text remains visible. */
export default function AimsObjectives() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="border border-border bg-white p-5 sm:p-8 lg:p-10">
        <p className="text-base leading-relaxed text-text sm:text-lg">
          <TranslationText>{objectivesIntroduction}</TranslationText>
        </p>
        <nav aria-label="Jump to objectives" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ranges.map((start, index) => (
            <a
              key={start}
              href={`#objective-${start}`}
              className="flex min-h-11 items-center justify-center rounded-sm border border-border px-3 py-2 text-center text-sm font-semibold text-teal-dark transition-colors hover:border-teal hover:bg-teal/5"
            >
              <TranslationText>{`Objectives ${start}–${index === ranges.length - 1 ? objectiveCount : ranges[index + 1] - 1}`}</TranslationText>
            </a>
          ))}
        </nav>
        <ol className="mt-8 list-decimal space-y-6 ps-6 text-base leading-8 text-text marker:font-semibold marker:text-teal-dark sm:ps-8">
          {objectives.map((text, index) => (
            <li key={index} id={`objective-${index + 1}`} className="scroll-mt-28 border-b border-border pb-6 ps-1 last:border-b-0 last:pb-0 sm:ps-3">
              <div className="min-w-0 space-y-4 break-words text-start">
                {text.split("\n\n").map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}><TranslationText>{paragraph}</TranslationText></p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
