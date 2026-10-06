import { createMetadata } from "@/lib/seo";
import { readHomeDetail } from "@/lib/home-feed";
import ManagedDetail from "@/components/home/ManagedDetail";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const row = await readHomeDetail("blogs", slug);
  return createMetadata({ title: row?.title ?? "Blog unavailable", description: row?.excerpt ?? "HRPF published blogs and updates.", path: `/blogs/${slug}` });
}
export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  return <ManagedDetail kind="blogs" slug={slug} />;
}
