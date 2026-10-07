"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { isAdminPath, translationSelected } from "@/lib/translation";

/** English keeps Next navigation. Translated pages get a fresh document so an
 * external engine never leaves a stale translated tree for React to reconcile.
 * Query strings, anchors, modified clicks and downloads retain normal semantics.
 */
export default function TranslationLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  return <Link {...props} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey || props.download ||
        (props.target && props.target !== "_self")) return;
    const url = new URL(event.currentTarget.href, window.location.href);
    if (url.origin !== window.location.origin ||
        (url.pathname === window.location.pathname && url.search === window.location.search)) return;
    if (isAdminPath(url.pathname) || translationSelected()) {
      event.preventDefault();
      window.location.assign(url.href);
    }
  }} />;
}
