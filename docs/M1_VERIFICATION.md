# M1 verification and merge review

Date: 2026-10-05. Owner delegated review and explicitly authorized merging M1.

## Scope

M0 audit plus M1 independently operated frontend/backend, Express health checks,
MongoDB/Redis connectivity, Next /api proxy, Codespaces infrastructure and CI.
This is a stable development base, not a production website release. Prototype
copy and simulated forms remain assigned to later milestones.

## Security dependency changes

- Next.js and matching eslint-config-next: 16.2.11 -> 16.3.8, pinned exactly.
- Compatible transitive dependency fixes applied without forced major upgrades.
- `npm audit --omit=dev`: zero vulnerabilities (info/low/moderate/high/critical).
- Frontend CI gates production dependencies at high severity or above.
- Full `npm audit` retains five high package entries in the dev-only chain:
  eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch -> braces.
  All five originate from the same unpatched braces advisory:
  https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- `npm explain braces` confirms it is a dev dependency. The installed Next ESLint
  helper uses glob expansion for configured `settings.next.rootDir` strings/arrays;
  this repository configures no such glob and uses the default package cwd.
  It is not part of the production dependency tree. Keep monitoring upstream;
  never describe the full dependency audit as clean. npm's proposed forced
  downgrade to eslint-config-next 14.2.35 is unsuitable for this Next 16 app.

## Code and runtime checks

- Frontend lint, route type generation and TypeScript: passed.
- Fresh Next.js 16.3.8 production build: passed, 60 static outputs generated.
- Backend typechecks, all 10 tests and build: passed.
- Both npm start commands ran independently from their own folders.
- Upgraded frontend proxy: direct/proxied liveness 200; readiness 503 with test
  dependencies unavailable, as designed.
- Owner's real Codespaces checks at 13:53 UTC: proxied liveness 200 alive and
  readiness 200 ready. This verifies real MongoDB/Redis connectivity there.
- Existing devcontainer/Compose YAML/JSON and workspace paths were validated.
  Assistant did not run Docker locally; owner-hosted services were verified
  through the supplied health responses. Owner waived further personal review.

## Browser and visual checks

Production builds were reviewed in headless Chromium through Playwright after
agent-browser's local daemon could not start. No owner UI review is required.

| Width | Routes | Result |
| --- | --- | --- |
| 1440px | /, /about, /team, /reports, /contact, /our-work/access-to-justice, /report-a-violation | HTTP 200, meaningful content/headings, no horizontal overflow, error overlays or broken loaded images |
| 390px | /, /about, /team, /reports, /contact | Same checks passed |

Screenshot inspection covered desktop home/contact and mobile home/open menu.
Mobile menu fills the 844px viewport and its Reports link navigates correctly.
No browser page errors or console errors were captured across these checks.
No real personal data was submitted and no simulated submission was treated as
backend delivery. These checks do not claim complete accessibility or form-flow
coverage; those remain later milestones.

## Mobile correction

The prototype's translated closed drawer caused mobile horizontal overflow and
left offscreen links in the DOM. Its open fixed drawer also inherited the sticky
header's containing block and became only 72px high. One component now unmounts
while closed and renders the open drawer into document.body using a React portal.
Styles, menu data, colours and content remain unchanged. All other 181 original
app/component/data/lib/public files remain byte-identical to the baseline.
Full keyboard focus trapping/restoration remains a later navigation improvement.

## Merge gate

Local verification and delegated visual review are complete. Merge PR #1 into
main only after its final-head GitHub CI succeeds. Owner merge authorization is
already present. Continue subsequent implementation on development.
