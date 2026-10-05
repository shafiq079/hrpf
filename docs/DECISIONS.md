# HRPF Decisions

## 2026-10-05
- Approved the implementation plan; implementation proceeds one verified milestone at a time.
- Preserve the prototype design because it is the owner's required baseline.
- Keep npm and the existing lockfile; retain the installed framework versions during initial scaffolding.
- Use frontend/app/, frontend/components/, frontend/data/, frontend/lib/ and frontend/public/ after M1; avoid an unnecessary src/ migration.
- Reuse existing cards, form fields and navigation components; extend their data contracts rather than replacing their styling.
- Progress Reports belongs under About, following the client instructions.
- Gallery uses Media Coverage and HRPF in Action, following the higher-priority brief.
- Use only the seven authoritative board members. Our Team can reuse documented office-bearers until a separate roster is provided.
- Include the client's CNIC and previous-proceedings complaint fields; protect identity documents as sensitive assets.
- Reuse the external-concern form as the complaint starting point. The existing ComplaintForm is feedback about HRPF and has a different purpose.
- Remove unsupported statistics, testimonial claims and partner identities from public content; reuse useful layouts for verified content where appropriate.
- Do not introduce a newsletter backend. Replace the fake newsletter area with sourced contact/action content while retaining the footer grid.
- Consolidate unsourced campaigns, events and projects into approved work, gallery or blog content. Do not publish fictional individual records.
- Existing policy/accessibility layouts may be reused, but their prototype policies are not organizational facts.
- Authenticated uploads plus Express authorization on every sensitive file request are the default; ordinary Cloudinary signatures are not treated as expiring access controls.
- Use a transactional MongoDB email outbox with Redis/BullMQ retries to avoid losing saved submissions when email is unavailable.
- Native paid membership submissions remain disabled until fee and validity policies are configured.
- M0 was source audit plus documentation only. The owner explicitly requested M1 continuation before returning Codespaces results; proceed with scaffolding and keep integration/visual acceptance pending.
- Reuse draft PR #1 from development to main for M0/M1 while it remains open; do not merge until CI and Codespaces acceptance pass.
- M1 keeps all 182 app/component/data/lib/public files byte-identical; only frontend configuration and command scripts change.
- Use Node 24 for Codespaces/CI and separate npm lockfiles to preserve the prototype dependency graph.
- Use Next beforeFiles rewrites and an exact Codespace allowedDevOrigins entry, following the installed Next 16.2.11 guides.
- Liveness checks the process; readiness pings MongoDB and Redis. Missing dependencies return 503 rather than implying connectivity.
- Keep configuration error messages limited to variable names; redact driver errors and unexpected startup failures.
- Forward only port 3000 automatically; keep Express and Redis internal. Atlas credentials stay in backend/.env or Codespaces secrets.
- Defer business models/auth/uploads/queue and Redis-backed client limits to M2; M1 is infrastructure, not a production release.

## 2026-10-05 — Independent app operation (owner clarification)
- Owner requires independent frontend/ and backend/ commands and separate Vercel/Render hosting roots.
- Remove root package.json and shared setup/dev runners. Keep only repository-level documentation and Git/Codespaces/CI configuration at root.
- Each app owns npm run check; backend owns a non-overwriting env setup script and Redis Compose file.
- Devcontainer installs the two packages; CI checks them in separate jobs.
- Preserve the /api proxy: independent deployment still uses HTTP communication between services. INTERNAL_API_URL points to Render from Vercel.
- Observed Codespaces backend startup failure: invalid MONGODB_DB_NAME. Trim surrounding whitespace and default blank values; reject unsafe names and keep values redacted. Owner must correct any invalid inherited secret.
- Real Atlas/Redis readiness and UI acceptance remain pending; this follow-up does not advance to M2.

## 2026-10-05 — M1 merge review delegated to assistant
- Owner authorized merging M1 into main after assistant verification and does not want to review it personally. This supersedes the earlier owner-visual-signoff requirement.
- Update Next.js and matching ESLint config from 16.2.11 to 16.3.8 to remove reported runtime vulnerabilities; apply compatible transitive fixes without a forced major downgrade. React and the design remain unchanged.
- Add a production dependency audit to frontend CI. Keep the unpatched dev-only braces dependency documented rather than replacing current Next lint rules with an incompatible Next 14 configuration.
- Browser review found closed-drawer horizontal overflow on mobile. Unmount the drawer when closed and render the open drawer via a body portal to avoid the sticky-header containing block; retain its styling. Full focus trapping remains a later navigation accessibility improvement.
- M1 covers independently running packages/infrastructure only; prototype forms and demo content remain scheduled for later milestones.

## 2026-10-05 — M2 backend foundations
- Continue M2 on development at the owner's instruction; keep independent packages and the M1 design unchanged.
- Use native Node scrypt (N=131072, r=8, p=1) for administrator passwords, JOSE HS256 tokens with distinct keys, and MongoDB rotating session families; no tokens in frontend localStorage.
- Bind signed double-submit CSRF to the refresh session, require exact Origin on auth/admin mutations, and consult active/role/authVersion on every authorized request.
- Serialize super-admin governance writes in a Mongo transaction; optimistic versions prevent overwriting stale edits.
- Keep Mongo authoritative for tickets and submissions. Redis mirrors recover from restarts; unavailable limits fail closed. Trust only explicitly verified proxy CIDRs.
- Scan before provider storage; reject unavailable/infected scans, mismatched file signatures/extensions/MIME and excessive file quotas. Stage all M2 assets as authenticated; public copies require later release review.
- Use entity-bound AES-256-GCM for CNIC and reset payloads, with a separate keyed CNIC lookup hash. Key backup/rotation must be addressed before real production identity data.
- Persist submissions, clean asset claims, counters and email outbox entries in one replica-set transaction. Same-ticket UUID retries are idempotent within the ticket lifetime; receipt does not imply email delivery, payment verification or case approval.
- Membership policy remains unset/disabled; never invent organization fees. Snapshot fee and validity from an enabled validated policy.
- Queue only outbox IDs. Use Mongo leases, bounded retry and stable Message-IDs; SMTP cannot guarantee exactly-once delivery after ambiguous provider acceptance.
- BullMQ 6's native ESM path requires constructed Redis clients; use existing node-redis rather than implicit optional ioredis loading.
- Ensure additive indexes at connection preparation; readiness/business gates stay unavailable until preparation succeeds. Never drop production indexes automatically.
- Add real disposable MongoDB replica-set/Redis tests to CI. External providers are tested with injected adapters; private live preflight remains a production requirement.
- Publish a separate M2 PR; the earlier explicit merge instruction applied to M1.
