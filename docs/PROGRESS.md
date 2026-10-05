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
- GitHub PR CI passed for implementation commit f0cd57e2f8f4ad4327961de357f5ad75625a5846 (run 37311094157).

## M1 follow-up — independent app operation
- Owner reported invalid MONGODB_DB_NAME prevented Express listening; Next proxy returned 500.
- Removed root package.json and shared app scripts; each app runs/checks independently.
- Moved Redis Compose into backend/ and adjusted devcontainer paths/setup.
- Split CI into separate frontend/backend checks; documented Vercel/Render root directories.
- Added database-name whitespace/blank normalization and a regression check; invalid values remain redacted.
- Follow-up checks passed independently: frontend lint/typecheck/build; backend typecheck, 10 tests and build.
- Separate npm start processes verified direct and proxied liveness 200 and dependency-unavailable readiness 503.
- Compose paths/workspace mount and CI YAML parsed; no root application runner remains.
- GitHub follow-up CI passed for fa1ace780ec3344636a717467fdb43f794dffd4b (run 37318742183), with independent frontend/backend jobs. Owner Codespaces connectivity is verified below; visual acceptance remains pending.

## Codespaces connectivity verification — 2026-10-05
- Owner supplied localhost port-3000 results at 13:53 UTC: /api/health/live returned 200 alive; /api/health/ready returned 200 ready.
- This confirms the frontend rewrite reaches Express and both MongoDB and Redis ping successfully in the owner environment.
- Backend startup validation is no longer blocking these requests. Persistence of the corrected database-name configuration after restart is not yet confirmed.
- Initial frontend audit confirmed 11 findings. Updated Next.js/matching ESLint config to 16.3.8 and applied compatible transitive fixes. Production audit now has zero findings; full audit retains five dev-only entries from one unpatched braces advisory, documented in M1_VERIFICATION.md.

## Current state
- M1 acceptance complete locally: targeted dependency fixes, fresh builds, 10 backend tests and delegated desktop/mobile browser review passed.
- Final-head CI passed for 32e473c481f3f1816aa66873d634669d2ce1a412 (run 37323882076).
- PR #1 merged into main at 68865eff5fff6225eb4b97fbaf06662d5d5a8095; development fast-forwarded to that merge before this documentation handoff.
- PR #1 from development to main includes M0/M1; owner explicitly authorized merging after assistant review. No further owner signoff is required.

## Exact next step
M1 is merged and complete. Begin M2 backend core on development: models/indexes, role permissions, cookie authentication and CSRF, then the remaining secure infrastructure in the approved plan.
See M1_VERIFICATION.md for checks, browser coverage and the remaining dev-tool advisory.

## Next milestone
- M2 backend core, beginning with models, admin permissions, cookie authentication and CSRF.
- Redis-backed client limits/proxy trust, cache, email outbox and secure uploads precede public forms.
- Business endpoints, admin pages, imports and content replacement are not implemented in M1.

## Open items
- Codespaces real connectivity passed; owner delegated visual acceptance and waived further personal review. Local Docker execution was unavailable; configuration validation and owner-hosted health results are recorded in M1_VERIFICATION.md.
- OPEN: five dev-only audit entries from unpatched braces in ESLint tooling; production dependency audit is clean. Monitor upstream; do not force a Next 14 ESLint downgrade.
- TODO-CONFIRM: membership fee/types/duration and legacy register; paid native submissions stay disabled.
- TODO-CONFIRM: SMTP sender/provider/notification settings; no email is sent in M1.
- TODO-CONFIRM: renewed Charity Commission certificate and clearer PCP/FBR details; show historical dates only.
- TODO-CONFIRM: reviewed Urdu scope/translations, missing OCR Markdown, clean chairman photo, Threads/interview URLs and retention policy.
- TODO-CONFIRM: Cloudinary limits/PDF delivery and production hosting before relevant stages.

## Verification boundary
- Automated tests use injected dependency status; owner-provided localhost readiness 200 confirms real Atlas/Redis connectivity in Codespaces at the verification time.
- Final-head CI passed and PR #1 is merged. Desktop/mobile checks and runtime dependency remediation passed; remaining dev-tool advisory is documented. Later documentation-only commits do not change application code.
- No organization data was seeded, sensitive files uploaded or email sent.
- Prototype forms and content still use local sample data; M1 is not a production release.
- main remains stable; implementation stays on development.
