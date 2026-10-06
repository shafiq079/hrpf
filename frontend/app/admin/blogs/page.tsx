import BlogConsole from "@/components/admin/BlogConsole";
export const metadata = {
  title: "Manage blogs",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/blogs" },
};
export default function Page() {
  return (
    <main id="main-content">
      <BlogConsole />
    </main>
  );
}
