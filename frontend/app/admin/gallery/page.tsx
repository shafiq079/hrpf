import GalleryConsole from "@/components/admin/GalleryConsole";
import { createMetadata } from "@/lib/seo";
export const metadata = {
  ...createMetadata({
    title: "Gallery Administration",
    description: "Manage HRPF’s media archive and television interviews.",
    path: "/admin/gallery"
  }),
  robots: {
    index: false,
    follow: false
  }
};
export default function GalleryAdminPage() {
  return <main id="main-content" className="flex-1 bg-off-white"><GalleryConsole /></main>;
}
