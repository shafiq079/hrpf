import ProjectConsole from "@/components/admin/ProjectConsole";
export const metadata = {
  title: "Manage projects",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/projects" },
};
export default function Page() {
  return (
    <main id="main-content">
      <ProjectConsole />
    </main>
  );
}
