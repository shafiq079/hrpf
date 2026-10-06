import ManagedDetail from "@/components/home/ManagedDetail";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ManagedDetail kind="projects" slug={slug} />;
}
