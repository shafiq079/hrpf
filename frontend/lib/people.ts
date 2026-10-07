import "server-only";
import { cache } from "react";
import type { PublicBoardMember } from "./public-collections";
export const readPublicPerson = cache(
  async (
    slug: string,
  ): Promise<
    | { status: "ok"; data: PublicBoardMember }
    | { status: "not-found" | "unavailable" }
  > => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100)
      return { status: "not-found" };
    try {
      const origin = new URL(
        process.env.INTERNAL_API_URL ?? "http://127.0.0.1:5000",
      );
      if (
        !["http:", "https:"].includes(origin.protocol) ||
        origin.username ||
        origin.password ||
        origin.pathname !== "/" ||
        origin.search ||
        origin.hash
      )
        throw new Error("Invalid API origin");
      const response = await fetch(
        new URL("/api/board/" + slug + "?locale=en", origin),
        {
          cache: "no-store",
          credentials: "omit",
          signal: AbortSignal.timeout(4000),
        },
      );
      if (response.status === 404) return { status: "not-found" };
      if (!response.ok) throw new Error("Unavailable");
      const { data } = await response.json();
      if (
        !data ||
        data.slug !== slug ||
        typeof data.name !== "string" ||
        typeof data.bio !== "string"
      )
        throw new Error("Invalid profile");
      return { status: "ok", data };
    } catch {
      return { status: "unavailable" };
    }
  },
);
