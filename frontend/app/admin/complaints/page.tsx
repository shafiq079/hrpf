import type { Metadata } from "next";
import ComplaintConsole from "@/components/admin/ComplaintConsole";
export const metadata: Metadata = {
  title: "Complaint administration",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <main id="main-content" className="flex-1 bg-off-white">
      <ComplaintConsole />
    </main>
  );
}
