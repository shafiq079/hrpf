import { notFound } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { readPublicPerson } from "@/lib/people";
import Container from "@/components/shared/Container";
import EmptyState from "@/components/shared/EmptyState";
import PersonProfile from "@/components/people/PersonProfile";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const result = await readPublicPerson((await params).slug);
  if (result.status === "not-found") notFound();
  if (result.status !== "ok")
    return {
      title: "Profile temporarily unavailable",
      robots: { index: false, follow: false },
    };
  return createMetadata({
    title: result.data.name + " — " + result.data.designation,
    description: result.data.bio.slice(0, 160),
    path: "/about/people/" + result.data.slug,
  });
}
export default async function PersonPage({ params }: Props) {
  const result = await readPublicPerson((await params).slug);
  if (result.status === "not-found") notFound();
  return (
    <main id="main-content" className="flex-1 bg-off-white py-12 sm:py-16">
      <Container>
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap gap-2 text-sm text-muted"
        >
          <Link href="/about" className="hover:text-teal-dark">
            About Us
          </Link>
          <span aria-hidden="true">/</span>
          <span>{result.status === "ok" ? result.data.name : "Profile"}</span>
        </nav>
        {result.status === "ok" ? (
          <PersonProfile person={result.data} />
        ) : (
          <EmptyState
            icon={Users}
            title="Profile temporarily unavailable"
            description="Please try again later."
          />
        )}
      </Container>
    </main>
  );
}
