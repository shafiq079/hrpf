"use client";

import { useEffect } from "react";
import Container from "@/components/shared/Container";
import { navigationFeedback } from "@/lib/navigation-feedback";

export default function PageError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { navigationFeedback.reset(); }, []);
  return <main id="main-content" className="flex-1 py-20"><Container>
    <h1 className="text-3xl text-navy">This page could not load</h1>
    <p role="alert" className="mt-4 text-muted">Check your connection and try again.</p>
    <button type="button" onClick={retry} className="mt-6 rounded-md bg-teal-dark px-6 py-3 font-semibold text-white">Try again</button>
  </Container></main>;
}
