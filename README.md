# HRPF website

Human Rights Protection Foundation Pakistan. Work on `development`; keep `main`
stable. This is a development prototype, not a production release.

## Independent applications

- `frontend/`: Next.js, its own package.json, lockfile, configuration and assets.
- `backend/`: Express, its own package.json, lockfile, configuration and Redis Compose file.
- No root package.json, npm workspace or shared application runner. Each app installs,
  checks, builds and starts from its own directory without importing the other.
- Root files are repository documentation, Git rules and Codespaces/CI configuration.

The frontend calls `/api/*` on its own origin. Next.js proxies these requests to
an independently running Express service. `INTERNAL_API_URL` is the server-only
backend origin: local default `http://127.0.0.1:5000`, or the Render HTTPS origin
when hosted separately. Do not append `/api`. No backend secrets belong in the frontend.

## Codespaces setup

From the repository root, preserve local edits, then fetch/pull `development`.
Use **Codespaces: Rebuild Container** for Node 24 and the private Redis service.
The container installs each app's lockfile and initializes backend/.env only
if it does not exist. You can also install manually from each app directory.

Backend terminal:

```bash
cd /workspaces/hrpf/backend
npm ci
npm run setup
npm run check
```

Configure MongoDB privately in backend/.env or Codespaces secrets:
`MONGODB_URI` is the connection string; `MONGODB_DB_NAME=hrpf_dev` is only the
separate database name. Never place a URL or a variable assignment inside the
name's value. Blank names use the development default; surrounding spaces are
trimmed; invalid characters are still rejected without logging values.
Inherited environment variables, including Codespaces secrets, override .env.
After editing private configuration, stop and restart the backend.

```bash
npm run dev
```

Frontend terminal:

```bash
cd /workspaces/hrpf/frontend
npm ci
npm run check
npm run dev -- --hostname 0.0.0.0
```

Optionally copy frontend/.env.example to frontend/.env.local to customize the
API origin. Restart Next.js after a local change; rebuild deployed rewrites
after changing the upstream origin.

Check from a third Codespaces terminal while both services run:

```bash
curl -i http://127.0.0.1:5000/api/health/live
curl -i http://127.0.0.1:3000/api/health/live
curl -i http://127.0.0.1:3000/api/health/ready
```

Direct and proxied liveness return 200 with `{"data":{"status":"alive"}}`.
Readiness returns 503 until MongoDB and Redis both respond, then 200 with
`{"data":{"status":"ready"}}`. Next proxy errors with a refused port 5000
mean the backend is not running. Private forwarded URLs require GitHub tunnel
authentication; localhost terminal checks avoid that extra layer.

Open forwarded port 3000 privately in the browser for desktop/mobile comparison.
Prototype forms still simulate submissions: use dummy data only.

## Redis and configuration

The rebuilt workspace supplies `REDIS_URL=redis://redis:6379`. Redis is internal.
Without rebuilding, an existing Docker-enabled Codespace can instead run from backend/:

```bash
docker compose up -d redis
```

For this host alternative set REDIS_URL privately to `redis://127.0.0.1:6379`.
If an inherited secret sets it, update that secret. Atlas Network Access must
allow the Codespace's outbound IP. Failed MongoDB connections are retried.
No database records are seeded in M1.

FRONTEND_URL may be empty in development: localhost and the current Codespace's
exact frontend origin are allowed automatically. Optional CORS_ORIGINS adds
exact origins. Cloudinary, JWT, SMTP and seed-admin names are reserved for later
milestones. Never paste secrets or commit .env files.

## Separate hosting configuration

| Setting | Vercel frontend | Render backend |
| --- | --- | --- |
| Root Directory | frontend | backend |
| Install | npm ci | Included in build command |
| Build | npm run build | npm ci && npm run build |
| Start | Managed by Vercel | npm start |
| Node | 24.x | 24.x |
| API origin | INTERNAL_API_URL = Render HTTPS origin | N/A |
| Public frontend origin | N/A | FRONTEND_URL = Vercel/custom frontend HTTPS origin |

Backend production environment also requires private MongoDB/Redis configuration
and NODE_ENV=production. Render supplies PORT; Express binds to 0.0.0.0.
Production deployment remains a later milestone; no hosting resources are created here.

## Checks and continuity

Each app provides `npm run check`. Frontend: lint, route type generation,
TypeScript and build. Backend: TypeScript, tests and build. CI runs separate jobs
from their respective directories without external service credentials.
The existing Google fonts require network access for the frontend build.

Read the Project Files brief, docs/PROJECT_CONTEXT.md, docs/DECISIONS.md and
docs/PROGRESS.md for current state. M2 implements auth, models, permissions,
Redis limits, uploads and the email outbox. Draft PR #1 stays unmerged until CI,
Codespaces connectivity and visual acceptance pass.
