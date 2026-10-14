# Navigation and submission loading

Public and admin links use `NavigationLink`. Accepted internal navigation starts
an indeterminate top bar, and Next's pending state or committed destination clears
it. Downloads, external links, modified clicks and same-page anchors keep their
normal behaviour. Translated full-document navigation and GET search forms also
provide loading feedback.

Route `loading.tsx` files render destination headings and card/article skeletons.
Their top bar is server-rendered, so it remains visible while route JavaScript or
data is still arriving. Shared header and footer stay usable. Public collections
have retry buttons when their API is unavailable; unexpected route errors have a
retry boundary. The installed Next.js version calls this boundary prop `retry`.

`SubmissionOverlay` is a native full-screen modal for complaint, membership,
contact and newsletter requests. It displays the existing progress callback's
actual upload stages. Its animated bar has no estimated percentage. Native modal
behaviour traps focus and makes the underlying form inert. Escape does not cancel
an in-flight submission. Success focuses the receipt; failures restore the form
and use the existing error toast and original retry state. Request helpers,
upload identifiers and submission keys are unchanged.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:home`

The HTML checks resolve completed React stream chunks before asserting page
content. Streaming not-found responses can have HTTP 200; checks also require the
final noindex metadata and HRPF not-found screen.

`npm run test:loading` additionally exercises Chromium with slow navigation,
modal focus/escape behaviour, a failed contact request and successful retry,
mobile multi-file complaint submission, and collection retry. It uses only a
local mock API and synthetic data; no email or Cloudinary upload is performed.

For this optional browser check, build with
`NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`. The browser test mocks
the widget, and requires the build's API rewrite to point at
`http://127.0.0.1:5000`. Provide Playwright and its browser locally, or supply
`HRPF_PLAYWRIGHT_MODULE` and `HRPF_BROWSER_EXECUTABLE`. A serverless Chromium
module can supply launch arguments via `HRPF_CHROMIUM_MODULE`.

Production continues to use the existing deployment's real Turnstile key and API
origin. No seed, environment or backend change is required for this UI update.
