import AppImage from "@/components/shared/AppImage";
import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import { ContentState } from "@/components/content/ContentView";
import { publicRead, type Board } from "@/lib/public-content";
export default async function BoardPage() {
  const result = await publicRead<Board[]>("board");
  return (
    <main id="main-content">
      <PageHero title="Board of Directors" eyebrow="Our People" />
      <Container className="py-14 lg:py-20">
        {result.status === "ok" && result.data.length ? (
          <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((person) => (
              <article
                key={person.slug}
                className="border-b border-r border-border bg-white p-6"
              >
                {person.photo ? (
                  <AppImage
                    src={person.photo}
                    alt={person.name}
                    width={600}
                    height={600}
                    className="mb-5 aspect-square w-full object-cover"
                  />
                ) : (
                  <div
                    className="mb-5 flex aspect-square items-center justify-center bg-soft-gray font-serif text-5xl text-navy"
                    aria-hidden="true"
                  >
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 3)
                      .join("")}
                  </div>
                )}
                <h2 className="font-serif text-2xl text-navy">{person.name}</h2>
                <p className="mt-2 font-semibold text-teal-dark">
                  {person.designation}
                </p>
                {person.slotLabel &&
                  person.slotLabel !== person.designation && (
                    <p className="mt-1 text-sm text-muted">
                      Board position: {person.slotLabel}
                    </p>
                  )}
                <p className="mt-4 whitespace-pre-line text-muted">
                  {person.bio}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <ContentState
            status={result.status === "unavailable" ? "unavailable" : "missing"}
          />
        )}
      </Container>
    </main>
  );
}
