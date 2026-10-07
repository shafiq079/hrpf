import DocumentConsole from "@/components/admin/DocumentConsole";
import { createMetadata } from "@/lib/seo";
export const metadata = {
  ...createMetadata({
    title: "Document Administration",
    description:
      "Manage HRPF’s progress reports, registrations and certificates.",
    path: "/admin/documents",
  }),
  robots: {
    index: false,
    follow: false,
  },
};
export default function DocumentAdminPage() {
  return (
    <main id="main-content" className="flex-1 bg-off-white">
      <DocumentConsole />
    </main>
  );
}
