import type { Metadata } from "next";
import BoardConsole from "@/components/admin/BoardConsole";

export const metadata: Metadata = { title: "Operational Team administration", robots: { index: false, follow: false } };
export default function Page() {
  return <main id="main-content" className="flex-1 bg-off-white"><BoardConsole kind="team" /></main>;
}
