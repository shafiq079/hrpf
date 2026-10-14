"use client";

/** Multiple links and streamed route fallbacks can overlap during navigation. */
export function createNavigationTracker() {
  const pending = new Map<string, string | undefined>();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach(listener => listener());
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    snapshot: () => pending.size > 0,
    start(id: string, destination?: string) {
      const existing = pending.has(id);
      if (!existing || destination !== undefined) pending.set(id, destination);
      if (!existing) emit();
    },
    finish(id: string) { if (pending.delete(id)) emit(); },
    committed(destination: string) {
      for (const [id, target] of pending) if (target === destination) pending.delete(id);
      emit();
    },
    reset() { if (pending.size) { pending.clear(); emit(); } },
  };
}

export const navigationFeedback = createNavigationTracker();

/** Downloads, external links, new tabs and same-page anchors keep native behaviour. */
export function isPageNavigation(href: string, current: string) {
  const destination = new URL(href, current), source = new URL(current);
  return destination.origin === source.origin &&
    ["http:", "https:"].includes(destination.protocol) &&
    (destination.pathname !== source.pathname || destination.search !== source.search);
}
