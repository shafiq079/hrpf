"use client";

import { useSyncExternalStore } from "react";
import { Toaster } from "sonner";

const query = "(max-width: 639px)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
export default function ActionToaster() {
  const mobile = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
  return <Toaster
    position={mobile ? "top-center" : "top-right"}
    closeButton richColors expand visibleToasts={3}
    offset="max(20px, env(safe-area-inset-top))"
    mobileOffset={{ top: "max(16px, env(safe-area-inset-top))", left: 16, right: 16 }}
    className="notranslate" dir="ltr"
    toastOptions={{ className: "hrpf-toast", style: { fontFamily: "var(--font-inter), sans-serif" } }}
  />;
}
