import PolicyView from "@/components/shared/PolicyView";
import { termsOfUse as policy } from "@/data/websitePolicies";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: policy.title,
  description: policy.description,
  path: "/terms-of-use",
});

export default function Page() {
  return <PolicyView policy={policy} />;
}
