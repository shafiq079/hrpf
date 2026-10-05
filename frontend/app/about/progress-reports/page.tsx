import Resources from "@/components/content/Resources";
import { pageNumber } from "@/lib/public-content";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  return <Resources kind="reports" page={pageNumber(search.page)} />;
}
