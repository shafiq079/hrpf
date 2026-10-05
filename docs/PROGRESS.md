# HRPF Progress

Updated: 2026-10-05

## Done
- Reviewed supplied project brief and source pack.
- Prepared implementation plan; owner approved it.
- Read root AGENTS.md and retrieved prototype source at d3848c940d8bf260c7b2657a66473df991777296.
- Completed static frontend audit and component reuse map.
- Verified repository uses npm, Next.js App Router and a root-level frontend.
- Recorded design preservation, content corrections and routing decisions.
- Prepared continuity documents and source-audit report.

## In progress
- M0: Codespaces baseline verification and visual comparison.
- Documentation-only development-to-main PR review.

## Exact next step
In the HRPF Codespace, fetch and check out development. Run npm ci, npm run lint, npx tsc --noEmit and npm run build from the repository root. Report the command results. Then run npm run dev -- --hostname 0.0.0.0 and review the unchanged prototype through forwarded port 3000 at desktop and mobile widths.

Before Next.js implementation, inspect the installed node_modules/next/dist/docs guides required by AGENTS.md.

## Next milestone
- M1: move existing application into frontend/, introduce backend scaffolding, devcontainer/Redis, environment validation, proxy health check and CI.
- Preserve all existing visual styles during the folder move.
- Provide exact files, commands, expected results and verification steps.

## Open items and blockers
- TODO-CONFIRM: baseline lint/typecheck/build and visual results. Blocks completion of M0 and frontend changes.
- TODO-CONFIRM: membership fee/types/duration, existing form fields and any legacy member register. Native paid submissions stay disabled.
- TODO-CONFIRM: sender/provider and admin notifications. Development recipient defaults to hrpf786@gmail.com.
- TODO-CONFIRM: renewed Charity Commission certificate and clearer PCP/FBR certificate. Historical dates only.
- TODO-CONFIRM: Urdu launch scope. English default, Urdu infrastructure and reviewed translations planned.
- TODO-CONFIRM: missing OCR Markdown, clean chairman photo, Threads URL, interview URLs and retention policy. Use supplied scans or omit unsupported material.
- TODO-CONFIRM: Cloudinary limits/PDF delivery and hosting choices before relevant stages.

## Verification boundary
- No application code has changed in M0.
- No dependencies were installed or execution checks run in the assistant environment.
- No database, Cloudinary, Redis or email service has been connected.
- No secrets were added to repository documentation.
