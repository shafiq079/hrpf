import type { TeamMember } from "@/data/team";
import AppImage from "./AppImage";

interface TeamCardProps {
  member: TeamMember;
  /** Show key responsibilities under the bio. */
  showResponsibilities?: boolean;
}

/** Team member profile card with photo, role, bio and expertise tags. */
export default function TeamCard({
  member,
  showResponsibilities = false,
}: TeamCardProps) {
  const {
    name,
    position,
    bio,
    roleDescription,
    responsibilities,
    expertise,
    image,
    linkedin,
  } = member;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="relative aspect-[4/3] overflow-hidden">
        <AppImage
          src={image}
          alt={`${name}, ${position}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm font-medium text-teal-dark">{position}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {showResponsibilities ? roleDescription : bio}
        </p>
        {showResponsibilities && responsibilities.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
            {responsibilities.slice(0, 4).map((item) => (
              <li
                key={item}
                className="flex gap-2 text-xs leading-relaxed text-muted"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {expertise.map((tag) => (
            <span
              key={tag}
              className="rounded bg-soft-gray px-2 py-0.5 text-[11px] font-medium text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        {linkedin && (
          <a
            href={linkedin}
            aria-label={`${name} on LinkedIn`}
            className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-teal hover:text-teal"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M8 10.5V16.5M8 7.6v.02M11.5 16.5v-3.2c0-1 .8-1.8 1.8-1.8s1.7.8 1.7 1.8v3.2" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
