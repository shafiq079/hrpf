# HRPF Progress

Updated: 2026-10-05

## Done
- Reviewed the brief and supplied sources; owner approved the implementation plan.
- M0: completed the source audit, reuse map and continuity documents.
- Baseline lint, TypeScript check and production build passed in the assistant workspace.
- M1: moved the prototype into frontend/; all 182 app/component/data/lib/public files and the frontend lockfile are byte-identical to baseline.
- Added Express 5/TypeScript, environment validation, Helmet, exact-origin CORS, bounded JSON and redacted consistent errors.
- Added MongoDB/Redis connection handling, liveness/readiness checks and graceful shutdown.
- Added Node 24 Codespaces/Compose setup, Redis 8, root development commands and CI.
- Read installed Next 16.2.11 rewrite, allowedDevOrigins, environment and typegen guides required by AGENTS.md.
- M1 assistant checks passed: lint, both typechecks, all nine backend tests and both builds.
- Live built-service probe passed: direct and Next-proxied liveness 200, unavailable-dependency readiness 503, allowed-origin 200 and foreign-origin 403.
- Compose/workflow YAML and devcontainer JSON parsed; the pinned Node 24 image manifest returned 200.
- Verified nested env files, dependencies and seed assets are ignored; env example is trackable.

## In progress
- M1 Codespaces acceptance: rebuild, Atlas/Redis readiness and desktop/mobile visual comparison.
- Draft PR #1 from development to main includes M0 and M1; do not merge before acceptance and CI pass.

## Exact next step
From the repository root: git fetch origin; git switch development; git pull --ff-only origin development.
Rebuild the Codespaces container, then run npm run setup and npm run check.
Configure MONGODB_URI privately in backend/.env or Codespaces secrets; keep MONGODB_DB_NAME=hrpf_dev and allow the Codespace outbound IP in Atlas.
Run npm run dev. In another terminal, curl http://127.0.0.1:3000/api/health/live and /api/health/ready.
Confirm liveness 200; readiness becomes 200 when both Atlas and Redis are reachable. Check the original UI through private forwarded port 3000.
Report command, connectivity and visual results; never send env contents or credentials.

## Next milestone
- M2 backend core, beginning with models, admin permissions, cookie authentication and CSRF.
- Redis-backed client limits/proxy trust, cache, email outbox and secure uploads precede public forms.
- Business endpoints, admin pages, imports and content replacement are not implemented in M1.

## Open items
- TODO-CONFIRM: Codespaces container/Atlas/Redis/visual acceptance; assistant has no Docker runtime or owner Atlas access.
- TODO-CONFIRM: membership fee/types/duration and legacy register; paid native submissions stay disabled.
- TODO-CONFIRM: SMTP sender/provider/notification settings; no email is sent in M1.
- TODO-CONFIRM: renewed Charity Commission certificate and clearer PCP/FBR details; show historical dates only.
- TODO-CONFIRM: reviewed Urdu scope/translations, missing OCR Markdown, clean chairman photo, Threads/interview URLs and retention policy.
- TODO-CONFIRM: Cloudinary limits/PDF delivery and production hosting before relevant stages.

## Verification boundary
- Tests use injected dependency status; successful real Atlas/Redis readiness remains owner verification.
- CI workflow is added; its actual GitHub result must be checked on PR #1.
- No organization data was seeded, sensitive files uploaded or email sent.
- Prototype forms and content still use local sample data; M1 is not a production release.
- main remains stable; implementation stays on development.
