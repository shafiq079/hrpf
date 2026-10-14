"use client";

import { useEffect, useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { navigationFeedback } from "@/lib/navigation-feedback";
import TranslationText from "@/components/translation/TranslationText";

export default function PageRetryButton() {
  const router = useRouter(), id = useId();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (pending) navigationFeedback.start(id);
    else navigationFeedback.finish(id);
    return () => navigationFeedback.finish(id);
  }, [pending, id]);
  return <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())} className="mt-4 rounded-md border border-teal-dark px-5 py-3 text-sm font-semibold text-teal-dark disabled:opacity-50">
    <TranslationText>{pending ? "Loading…" : "Try again"}</TranslationText>
  </button>;
}
