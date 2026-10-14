# Client audit baseline and minimum scope

Date: 2026-10-14
Branch: `development`
Baseline application commit: `5f094dabdbbc6590b4aa8abd465d6d5ad49f5d55`
Purpose: record only the client-requested fixes before implementation. This is not a broad redesign or penetration test.

## Baseline evidence

- GitHub CI passed for the baseline commit.
- The matching Vercel development deployment is READY.
- The development preview is protected by Vercel Authentication, so final browser acceptance will be performed after implementation using an authorized development preview.
- Production `https://hrpf.org/` returns 200 and `https://www.hrpf.org/` redirects to the non-www domain.
- Production API liveness and readiness return 200.
- Public blogs API returns 200.
- `/robots.txt` returns 404.
- `/sitemap.xml` returns 404.
- `/contact-us` returns 404.
- Page canonical and `og:url` metadata incorrectly use `https://www.hrpf.org`.
- Pages include Open Graph and Twitter titles/descriptions but do not include `og:image` or `twitter:image`.
- Root HTML uses `lang="en"` and no hreflang links.
- The frontend exposes `X-Powered-By: Next.js` and does not return the requested frontend security headers. The proxied Express API already uses Helmet and returns its own security headers.
- The checked public pages contain no images missing an `alt` attribute. Current empty alt values are used on decorative images and should not be replaced with unnecessary text.
- Cloudflare Turnstile is already implemented for contact, complaint, membership and newsletter flows and is verified by the backend. It is intentionally shown only where the relevant form reaches verification.
- Existing public-content Redis caching is already implemented. No broad caching rewrite is required.

## Minimum implementation scope

1. Standardize metadata on `https://hrpf.org`.
2. Add a default social preview image and page-specific images where existing content images are available.
3. Add valid `robots.txt` and `sitemap.xml`.
4. Add the verified legacy `/contact-us` redirect and retain existing redirects.
5. Add essential frontend security headers and disable `X-Powered-By`.
6. Preserve decorative empty alt text; correct only genuinely informative images that lack useful alternative text.
7. Keep English as the source-page language. Do not add misleading hreflang tags until stable native Urdu URLs exist.

## Not part of this client-fix cycle

- PWA or service worker
- Online payment gateway
- Native Urdu routing/content project
- Broad performance or caching redesign
- Replacement of the existing form, upload, Turnstile or email workflows
- Full penetration test
- New monitoring platform
- Sensitive-data workflow redesign
- LocalBusiness schema

## Final acceptance gate

After all client-fix milestones are implemented on `development`:

- GitHub CI must pass.
- The latest development Vercel deployment must be READY.
- Browser-check the homepage, representative static pages, one blog, one project, forms, legacy redirect, robots and sitemap.
- Verify canonical URLs, social images, required headers and no important console errors.
- Only after owner approval, create a pull request from `development` to `main`.
