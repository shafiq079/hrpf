"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isAdminPath } from "@/lib/translation";

/** Server-rendered slots keep public chrome separate from private administration. */
export default function SiteFrame({ children, header, footer }: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  if (isAdminPath(pathname)) return children;
  return <>{header}{children}{footer}</>;
}
