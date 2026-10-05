# HRPF website

Human Rights Protection Foundation Pakistan. This is a development prototype,
not a production release. Work on `development`; keep `main` stable.

## M1: infrastructure

- `frontend/`: original Next.js App Router application. Theme, components, content
  and public assets are preserved in this milestone. Framework versions and the
  frontend lockfile are unchanged; a typecheck command and API rewrite are added.
- `backend/`: Express 5 + TypeScript, validated configuration, security headers,
  exact-origin CORS, bounded JSON parsing, consistent errors and health checks.
- MongoDB Atlas and Redis: real connectivity checks; no organization records,
  seed import, auth, business API, uploads or email worker yet.
- `.devcontainer/`: Node 24 workspace and private Redis service via Compose.
- `docs/`: context, decisions, progress and the original frontend audit.

## Codespaces setup

From the repository root with a clean working tree:

```bash
git fetch origin
git switch development
git pull --ff-only origin development
```

If local changes exist, preserve them before switching. Do not use reset/clean.
In the command palette, run **Codespaces: Rebuild Container**. The devcontainer
installs Node 24, starts Redis and runs `npm run setup`. Setup is safe to repeat:

```bash
node --version
npm run setup
npm run check
npm run dev
```

Expected: Node v24.x, dependency installs succeed, backend tests pass, both builds
pass, API listens on 5000, Next.js on 3000. Keep port 3000 private in the Ports
panel. Only the website is automatically forwarded. Do not forward Redis or the
API publicly. Forwarded frontend URLs use your Codespace's port-3000 hostname.

In a second terminal:

```bash
curl -i http://127.0.0.1:5000/api/health/live
curl -i http://127.0.0.1:3000/api/health/live
curl -i http://127.0.0.1:3000/api/health/ready
```

Liveness returns 200 with `{"data":{"status":"alive"}}`, directly and through
Next.js. Readiness returns 503 until BOTH MongoDB and Redis can be pinged, then
200 with `{"data":{"status":"ready"}}`. Errors use
`{"error":{"code":"...","message":"...","requestId":"..."}}`.
No credentials or driver errors appear in responses or normal logs.

Open forwarded port 3000 and compare the home page, desktop/mobile navigation,
a detail page and a form with the original prototype. Forms still simulate
submissions; do not submit real personal information during this milestone.

## Private configuration

`npm run setup` creates `backend/.env` from the secret-free example only if the
file does not exist. It never overwrites existing configuration. Codespaces
secrets override values from this file. Never paste credentials in chat.

Configure `MONGODB_URI` privately and use `MONGODB_DB_NAME=hrpf_dev`. Atlas Network
Access must allow the Codespace's outbound IP; prefer that IP to an unrestricted
allow-list. MongoDB connection failures are retried and reported only as failed
readiness. Redis reconnects automatically. No seed or model writes run in M1.

The rebuilt devcontainer supplies `REDIS_URL=redis://redis:6379`. Without a
container rebuild, an existing Docker-enabled Codespace can start Redis with:

```bash
docker compose up -d redis
```

Then set `REDIS_URL=redis://127.0.0.1:6379` in backend/.env. If a Codespaces secret
already sets REDIS_URL, update that secret instead. The CLI-only path is an
alternative; the rebuilt devcontainer is the standard setup.

`FRONTEND_URL` may be empty in development: localhost and this Codespace's exact
frontend origin are allowed automatically. `CORS_ORIGINS` adds optional exact
origins. No wildcard is accepted. Production requires MongoDB and an explicit
HTTPS frontend origin, but M1 is not ready for production.

Next.js rewrites `/api/*` to `http://127.0.0.1:5000/api/*`. `INTERNAL_API_URL` is an
optional server-only environment variable for a different Express origin. It is
not a public browser API URL. No backend secret belongs in frontend files.

Cloudinary, JWT, SMTP and seed-admin variable names in backend/.env.example are
reserved for later milestones; those services are not implemented in M1.

## Commands and CI

- `npm run setup`: install both lockfiles; initialize ignored backend/.env.
- `npm run dev`: run both services; Ctrl+C stops both process groups.
- `npm run dev:frontend` / `npm run dev:backend`: run either service separately.
- `npm run lint`: frontend lint.
- `npm run typecheck`: Next route type generation and both TypeScript checks.
- `npm test`: backend security/error/health tests without external credentials.
- `npm run build`: backend compilation followed by the frontend production build.
- `npm run check`: all checks above, in order.

CI performs setup/check on pushes to development/main and PRs targeting main.
No live Atlas, Redis, Cloudinary or SMTP credentials are needed for CI.
`next/font` downloads the existing Google fonts while building; network access
is required for that build. An initial health-only process-local rate limiter is
replaced with Redis limits and verified proxy trust in M2 before public forms.

## Continuity and next milestone

Read the Project Files brief first, then docs/PROJECT_CONTEXT.md,
docs/DECISIONS.md and docs/PROGRESS.md. Follow the source priority in the brief.
M2 implements backend models, permissions, cookie auth, CSRF, Redis limits/cache,
email outbox and secure upload infrastructure. Do not merge the draft PR until
Codespaces connectivity and visual checks plus CI are confirmed.
