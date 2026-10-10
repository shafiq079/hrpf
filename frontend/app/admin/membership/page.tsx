import type { Metadata } from "next";
import MembershipConsole from "@/components/admin/MembershipConsole";
export const metadata: Metadata = {
  title: "Membership administration",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <main id="main-content" className="flex-1 bg-off-white">
      <MembershipConsole />
    </main>
  );
}
