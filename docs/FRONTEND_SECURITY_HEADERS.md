# M3 — Frontend security headers

Implemented on `development`, following M2 commit `4c334c8e4f2a8de89cb31ec218d15e8351d1ccc5`.

`frontend/next.config.ts` disables Next.js `X-Powered-By` and applies the policy from `frontend/lib/security-headers.ts` to frontend pages, metadata endpoints and static assets. `/api` responses retain the backend's existing Helmet/document policies. Existing asset cache headers and redirects are preserved.

## Headers

- `Content-Security-Policy`: explicit service origins; same-origin default, base URLs, form actions and frame ancestors; object embeds disabled.
- `X-Frame-Options: SAMEORIGIN`: prevents other origins from framing the site and agrees with CSP `frame-ancestors`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Video fullscreen, autoplay and encrypted media remain available.

## Existing services

| Resource | Allowed source |
| --- | --- |
| Next.js bundles, local fonts, images, banner video and API requests | Same origin |
| Turnstile scripts, frames and connections | `https://challenges.cloudflare.com` |
| GTranslate dropdown and translation library | `https://cdn.gtranslate.net` |
| Current GTranslate translation requests | `https://translate-pa.googleapis.com` |
| Cloudinary images/media | `https://res.cloudinary.com` (current managed uploads are served through `/api`) |
| YouTube thumbnails | `https://i.ytimg.com` |
| Maps embed | `https://www.google.com` |
| Video embeds | `https://www.youtube-nocookie.com`, `https://www.youtube.com`, `https://player.vimeo.com` |
| Existing document previews | Same-origin frames; upstream API policy preserved |

The allowlist preserves inline scripts/styles required by static Next.js flight responses, current component styles and the translation widget. It is not a strict nonce-based XSS policy. No rendering or caching redesign is included. Eval and general WebSocket sources are permitted only by `next dev`; production and Vercel preview builds exclude eval.

Vercel Toolbar sources are included only when `VERCEL_ENV=preview`, using Vercel's documented script, connection, image, frame, style and font origins. Production does not permit them.

## Verification

`npm run test:home` includes environment-policy unit tests and production HTTP regression checks for public/forms/admin pages, static images, robots/sitemap, a missing page, required service origins and upstream API header preservation. Existing route, asset, unit and form-helper tests remain in that suite.

M3 local checks passed: lint, TypeScript, the standard Turbopack production build, all 26 unit tests and the complete production route suite. An invalid old local Turbopack cache was moved aside before the successful build. The route fixture now listens on port 5000 to match the default build-time API rewrite, allowing actual proxy-header checks as well as server-rendered content checks.

The full development browser acceptance review remains M5 after M4. In that review, check actual Turnstile verification, translation, video playback, the map and document previews for CSP violations. No real submissions or infrastructure configuration changes are required for M3.

Sources inspected on 2026-10-14:

- Installed Next.js 16.3.8 guides: `frontend/node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` and the `headers`/`poweredByHeader` configuration references.
- [Cloudflare Turnstile CSP guidance](https://developers.cloudflare.com/turnstile/reference/content-security-policy/).
- Current GTranslate `dropdown.js` and `lib.min.js` served from its widget CDN. The latter currently requests `translate-pa.googleapis.com`; recheck the allowlist if the provider changes its endpoints.
- [Vercel Toolbar CSP guidance](https://vercel.com/docs/vercel-toolbar/managing-toolbar#using-a-content-security-policy).
