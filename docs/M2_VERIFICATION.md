# M2 backend verification

Updated: 2026-10-05. Implementation branch: `development`.

M2 implements independently runnable backend foundations. It does not replace
prototype frontend forms/content, create hosting resources, or publish real
organization data.

## Changed files

- `backend/src/domain/models.ts`: required and supporting schemas/indexes.
- `backend/src/security/`: password/identity crypto, cookie/session auth, CSRF and roles.
- `backend/src/services/`: form verification, scanned uploads, transactional submissions and outbox/worker.
- `backend/src/http/`: strict request contracts, consistent errors, auth/admin/business routing.
- `backend/src/infrastructure/`: dependency/index availability and Redis services.
- Backend server/worker/scripts/package/lock/env example, setup README and OpenAPI contract.
- Backend security/integration tests and isolated integration runner.
- Independent CI, root README and continuity documents. No frontend files changed.

## Passed checks

- `npm run check`: both TypeScript checks, 18 health/security tests, production build and generated OpenAPI consistency.
- `npm run test:integration`: 16 scenarios on a real disposable MongoDB 8.0.5 replica set and Redis 8.2.2 locally. CI supplies Redis 8.
- Integration covers login/current permissions, refresh rotation/replay revocation,
  stale versions and concurrent last-super-admin protection, bot/ticket/expiry/
  membership gates, spoofed/malicious/unscannable uploads and quotas, atomic
  complaint/outbox/counter/file claims, identical concurrent retry and distinct
  concurrent references, rollback for foreign assets, fee snapshots, private
  file authorization, shared Redis limits with forged forwarding ignored,
  cache invalidation, delivery leases/retries, real BullMQ draining, reset-token
  single use/session revocation, redacted outbox retry and safe staged cleanup.
- `npm audit --omit=dev --audit-level=high`: zero backend runtime findings.
- Security-key setup checked in an isolated temporary directory: blank keys filled,
  existing settings preserved, rerun idempotent, no values printed.
- Built API smoke passed with actual Mongo/Redis: automatic index preparation, liveness 200, readiness 200 and CSRF issuance 200.
- Frontend tree unchanged; M1 browser/design acceptance remains applicable.
- GitHub implementation CI run 37343608697 passed both independent jobs, including frontend check/audit and backend check/integration/audit.

## Verification boundaries

Cloudinary/ClamAV/Turnstile/SMTP calls use controlled adapters in tests. No real
sensitive upload or external email was performed. Exact provider credentials,
Turnstile hostnames/actions, scan service, Cloudinary plan/PDF restrictions,
SMTP sender and Vercel/Render proxy trust must be verified privately before
production. No configured membership policy means native applications remain
unavailable. Public content publishing, membership approval/additional information,
case operations and UI wiring remain later milestones.

SMTP can duplicate a message when the provider accepted it before a crash or
Mongo acknowledgement failure. Outbox storage/retry durability is verified;
exactly-once physical email is not claimed. Audit entries are append-only through
the API; production database access restrictions are a later deployment concern.

## Codespaces commands

Preserve local changes before pulling; do not overwrite private `.env` values.

```bash
git switch development
git pull --ff-only origin development
cd backend
npm ci
npm run setup
npm run setup:security
npm run check
npm run dev
```

Readiness remains 503 until MongoDB index preparation and Redis succeed, then
returns 200. Liveness remains 200 independently. Run the unchanged frontend from
its own directory/terminal. Initial administrator creation and the separate
SMTP worker commands are documented in `backend/README.md`. No personal UI
review is required for this backend-only milestone.

## Git delivery

Published implementation: `160c81561080d1cac235701cc0229dcf16aa7e14`,
`feat: implement M2 backend foundations`. PR: https://github.com/shafiq079/hrpf/pull/2
from `development` to `main`. CI: https://github.com/shafiq079/hrpf/actions/runs/37343608697
— frontend and backend passed. Subsequent handoff edits are documentation only.
M1 merge authorization does not automatically merge M2.
