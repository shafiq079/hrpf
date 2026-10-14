import PageLoading from "@/components/shared/PageLoading";
import PageHero from "@/components/shared/PageHero";

export default function Loading() {
  return <PageLoading variant="cards" hero={<PageHero heroImage="camera" headingAs="p" title="HRPF in the Media" />} />;
}
