"use client";

import Link, { useLinkStatus } from "next/link";
import { useEffect, useId, useRef, type ComponentProps } from "react";
import { isPageNavigation, navigationFeedback } from "@/lib/navigation-feedback";

function PendingNavigation({ id }: { id: string }) {
  const { pending } = useLinkStatus();
  useEffect(() => {
    if (pending) navigationFeedback.start(id);
    else navigationFeedback.finish(id);
    return () => navigationFeedback.finish(id);
  }, [pending, id]);
  return null;
}

/** Next owns navigation, prefetching, cancellation and modifier-key behaviour. */
export default function NavigationLink({ children, onClick, onNavigate, ...props }: ComponentProps<typeof Link>) {
  const id = useId();
  const destination = useRef("");
  return <Link {...props} onClick={event => {
    onClick?.(event);
    if (!event.defaultPrevented) destination.current = event.currentTarget.href;
  }} onNavigate={event => {
    let cancelled = false;
    onNavigate?.({ preventDefault: () => { cancelled = true; event.preventDefault(); } });
    if (!cancelled && destination.current && isPageNavigation(destination.current, window.location.href)) {
      const target = new URL(destination.current);
      navigationFeedback.start(id, `${target.pathname}?${target.search.slice(1)}`);
    }
  }}>{children}<PendingNavigation id={id} /></Link>;
}
