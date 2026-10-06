import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import { readHomeDetail } from "@/lib/home-feed";
import { readPublicCollection } from "@/lib/public-collections";
import type { BlogDetail } from "@/lib/blog-details";
import BlogDetailView from "@/components/blogs/BlogDetailView";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ locale?: string }>;
};
const readBlog = cache(
  async (slug: string, locale: "en" | "ur") =>
    (await readHomeDetail("blogs", slug, locale)) as BlogDetail | null,
);
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await searchParams).locale === "ur" ? "ur" : "en";
  const row = await readBlog(slug, locale);
  if (!row) return { robots: { index: false, follow: false } };
  const path = `/blogs/${slug}${locale === "ur" ? "?locale=ur" : ""}`;
  const title = row.details?.seoTitle || row.title;
  const description = row.details?.seoDescription || row.excerpt;
  const metadata = createMetadata({ title, description, path });
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: row.publishedAt ?? undefined,
      authors: [row.authorName || "HRPF Pakistan"],
    },
  };
}
export default async function BlogPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const locale = (await searchParams).locale === "ur" ? "ur" : "en";
  const [blog, feed] = await Promise.all([
    readBlog(slug, locale),
    readPublicCollection<BlogDetail>("blogs", 1, undefined, 12, locale),
  ]);
  if (!blog) notFound();
  const others = feed.data.filter((row) => row.slug !== slug);
  const related = [
    ...others.filter((row) => row.category === blog.category),
    ...others.filter((row) => row.category !== blog.category),
  ].slice(0, 3);
  return (
    <main
      id="main-content"
      className="flex-1"
      dir={locale === "ur" ? "rtl" : undefined}
    >
      <BlogDetailView blog={blog} related={related} locale={locale} />
    </main>
  );
}
