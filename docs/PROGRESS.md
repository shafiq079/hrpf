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
- M1 is complete and merged into main at 68865eff5fff6225eb4b97fbaf06662d5d5a8095.
- M2 backend foundations are implemented on development; frontend and backend remain independent.
- Added all collection schemas/indexes, cookie authentication and refresh-family replay protection, CSRF and role enforcement.
- Added first-admin setup and versioned user administration with concurrent last-super-admin protection.
- Added atomic Redis limits, public cache helpers and recoverable purpose-bound form tickets.
- Added bounded scanned authenticated upload staging, ticket quotas/ownership, restricted delivery and unused-file cleanup.
- Added transactional complaint/membership/contact persistence, counters, identity encryption, idempotency and durable outbox records.
- Added separate BullMQ/Nodemailer worker, redacted delivery diagnostics and authorized failed-mail retry.
- Added generated OpenAPI contract and backend setup documentation.
- Local checks pass: 18 health/security tests, 16 MongoDB replica-set/Redis integration tests, typechecks, build, contract consistency and zero production audit findings.
- M2 implementation 160c81561080d1cac235701cc0229dcf16aa7e14 is published in PR #2 to main. GitHub CI run 37343608697 passed both independent jobs, including real backend integration and both production audits.
- Built API smoke passed: automatic index preparation, liveness/readiness and CSRF issuance all succeeded.

## Exact next step
M2 delivery is complete on development with PR #2 open and implementation CI passed. Continue the approved source/seed preparation work; UI data migration and public/admin workflows remain later milestones.

## Next milestone boundary
- Use the audited sources and stable checksums/seed keys; preserve administrator edits.
- Do not seed invented fees, members, statistics, validity or legal outcomes.
- Keep payment verification, member approval and complaint operational workflows separate from the M2 receipt/storage foundations.

## Open items
- Codespaces real connectivity passed; owner delegated visual acceptance and waived further personal review. Local Docker execution was unavailable; configuration validation and owner-hosted health results are recorded in M1_VERIFICATION.md.
- OPEN: five dev-only audit entries from unpatched braces in ESLint tooling; production dependency audit is clean. Monitor upstream; do not force a Next 14 ESLint downgrade.
- TODO-CONFIRM: membership fee/types/duration and legacy register; paid native submissions stay disabled.
- TODO-CONFIRM: SMTP sender/provider/notification settings and live worker transport; M2 tests use a capture sender, never real delivery.
- TODO-CONFIRM: Turnstile exact hostname/action configuration, private ClamAV daemon and Cloudinary authenticated delivery preflight.
- TODO-CONFIRM: production Vercel/Render proxy chain before setting TRUST_PROXY_CIDRS; blank is deliberately conservative.
- TODO-CONFIRM: renewed Charity Commission certificate and clearer PCP/FBR details; show historical dates only.
- TODO-CONFIRM: reviewed Urdu scope/translations, missing OCR Markdown, clean chairman photo, Threads/interview URLs and retention policy.
- TODO-CONFIRM: Cloudinary limits/PDF delivery and production hosting before relevant stages.

## Verification boundary
- M1 health unit tests use injected dependency status; owner-provided localhost readiness 200 confirmed Atlas/Redis in Codespaces at that time. M2 also runs actual isolated MongoDB transactions and Redis/BullMQ integration locally.
- M1 final-head CI passed and PR #1 is merged. Its desktop/mobile checks and runtime dependency remediation remain applicable; frontend is unchanged in M2.
- No organization data was seeded, sensitive files uploaded externally or live email sent. Tests use synthetic fixtures.
- Prototype forms and content still use local sample data; M2 adds backend foundations without UI wiring and is not a production release.
- main remains stable; implementation stays on development.
