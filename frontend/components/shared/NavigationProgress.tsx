"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isPageNavigation, navigationFeedback } from "@/lib/navigation-feedback";
import { notify } from "@/lib/notifications";

const serverSnapshot = () => false;
export default function NavigationProgress() {
  const pending = useSyncExternalStore(navigationFeedback.subscribe, navigationFeedback.snapshot, serverSnapshot);
  const pathname = usePathname(), query = useSearchParams().toString();
  const committedRoute = useRef("");
  useEffect(() => {
    committedRoute.current = `${pathname}?${query}`;
    navigationFeedback.committed(committedRoute.current);
    navigationFeedback.finish("history");
    navigationFeedback.finish("document");
  }, [pathname, query]);
  useEffect(() => {
    const backOrForward = () => {
      if (`${window.location.pathname}?${window.location.search.slice(1)}` !== committedRoute.current) navigationFeedback.start("history");
    };
    const searchSubmission = (event: Event) => {
      const form = event.target;
      if (event.defaultPrevented || !(form instanceof HTMLFormElement) || form.method.toLowerCase() !== "get" || (form.target && form.target !== "_self")) return;
      const destination = new URL(form.action, window.location.href);
      if (destination.pathname.startsWith("/api/")) return;
      const params = new URLSearchParams();
      for (const [name, value] of new FormData(form)) if (typeof value === "string") params.append(name, value);
      destination.search = params.toString();
      if (isPageNavigation(destination.href, window.location.href)) navigationFeedback.start("document");
    };
    const restored = () => navigationFeedback.reset();
    window.addEventListener("popstate", backOrForward);
    window.addEventListener("pageshow", restored);
    window.addEventListener("pagehide", restored);
    document.addEventListener("submit", searchSubmission);
    return () => {
      window.removeEventListener("popstate", backOrForward);
      window.removeEventListener("pageshow", restored);
      window.removeEventListener("pagehide", restored);
      document.removeEventListener("submit", searchSubmission);
    };
  }, []);
  useEffect(() => {
    if (!pending) { notify.dismiss("navigation-loading"); return; }
    const timer = setTimeout(() => {
      notify.warning("This page is taking longer than usual. Check your connection or try again.", "navigation-loading");
      // Full-document navigation can be cancelled by the browser without a route commit.
      navigationFeedback.finish("document");
      navigationFeedback.finish("history");
    }, 45000);
    return () => clearTimeout(timer);
  }, [pending]);
  if (!pending) return null;
  return <div className="hrpf-navigation-progress notranslate" translate="no" role="progressbar" aria-label="Loading page">
    <span className="hrpf-loading-runner" aria-hidden="true" />
    <span className="sr-only" role="status">Loading page…</span>
  </div>;
}
