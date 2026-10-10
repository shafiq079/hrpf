import type { PublicBoardMember } from "@/lib/public-collections";
import AppImage from "@/components/shared/AppImage";
export default function PersonPortrait({
  person,
  priority = false,
}: {
  person: PublicBoardMember;
  priority?: boolean;
}) {
  const usePlaceholder = ["dr-sidra-mubashir", "dr-iqra-mubashar"].includes(person.slug);
  const photo = usePlaceholder ? "/images/people/v1/portrait-placeholder.webp" : person.photo;
  const zoom = usePlaceholder ? 1 : Math.min(2, Math.max(1, person.photoZoom ?? 1));
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-soft-gray">
      {photo ? (
        <div
          className="absolute inset-0"
          style={{ transform: "scale(" + zoom + ")" }}
        >
          <AppImage
            src={photo}
            alt={usePlaceholder ? "" : (person.photoAlt || person.name)}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden="true"
            className="font-serif text-7xl text-teal-dark/50"
          >
            {person.name
              .split(" ")
              .filter((part) => part !== "Dr.")
              .slice(0, 2)
              .map((part) => part[0])
              .join("")}
          </span>
          <span className="sr-only">Portrait unavailable</span>
        </div>
      )}
    </div>
  );
}
