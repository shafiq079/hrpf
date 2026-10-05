import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import Prose from "@/components/shared/Prose";
import EmptyState from "@/components/shared/EmptyState";
import { type Block, type Content, type Result } from "@/lib/public-content";
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <Prose>
      {blocks.map((b, i) =>
        b.type === "heading" ? (
          <h2 key={i}>{b.text}</h2>
        ) : b.type === "list" ? (
          <ul key={i}>
            {b.items?.map((item, n) => (
              <li key={n}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </Prose>
  );
}
export function ContentState({
  status,
}: {
  status: "missing" | "unavailable";
}) {
  return (
    <EmptyState
      title={
        status === "unavailable"
          ? "Content temporarily unavailable"
          : "Content awaiting publication"
      }
      description={
        status === "unavailable"
          ? "Please try again later. Published content could not be loaded."
          : "Reviewed information will appear here once it is published."
      }
    />
  );
}
export default function ContentView({
  title,
  result,
}: {
  title: string;
  result: Result<Content>;
}) {
  return (
    <main id="main-content">
      <PageHero
        eyebrow={
          result.status === "ok" && !result.data.key
            ? "HRPF Pakistan"
            : "About HRPF Pakistan"
        }
        title={result.status === "ok" ? result.data.title : title}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
      />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          {result.status === "ok" ? (
            <Blocks blocks={result.data.blocks} />
          ) : (
            <ContentState status={result.status} />
          )}
        </div>
      </Container>
    </main>
  );
}
