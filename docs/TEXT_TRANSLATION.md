# Automatic public text translation

The owner selected a language dropdown that automatically translates readable
website text into multiple languages. This supersedes the proposed manually
managed Urdu routes and admin translation fields. English remains the authored
source. No database migration, reseeding, backend service, API key or translation
worker is required.

## Provider and operation

Use the current GTranslate free JavaScript dropdown in `url_structure: none` mode.
HRPF is a nonprofit website. The provider's current free terms permit nonprofit
activities; commercial/revenue-generating use needs an applicable subscription.
The dropdown offers the provider's supported language list and native names,
including Urdu, Arabic, Hindi, Bengali, French, Spanish and Chinese. Languages are
not hardcoded to the existing projects or source images.

- The Languages control appears in a compact utility strip above the existing
  header on desktop and mobile. The theme and homepage sections remain intact.
- Provider scripts load after the visitor opens Languages, or returns with a
  previously selected translation. Ordinary English browsing loads no translation
  script. Browser-language auto-selection is disabled.
- Choose a language to translate visible public text. The provider observes new
  text, including future managed projects/blogs and interactive public content.
- The provider stores its language preference in browser localStorage under
  `__GT_TRANSLATE_LANGS`. English clears it and restores original text.
- Urdu/Arabic and supported right-to-left languages set document direction and
  language after a successful translation. English restores left-to-right.
- An Arabic-script font is self-hosted by Next.js and used for Arabic, Urdu,
  Persian, Pashto and Sindhi. It is not preloaded for ordinary English browsing.
- A blocked/failed widget offers retry; a failed translation offers another
  language or English. Existing pages and backend submissions stay available.
- Set `NEXT_PUBLIC_TEXT_TRANSLATION=off` and rebuild to disable the feature.

## React and navigation

The native dropdown lives in a persistent subtree owned by the provider, outside
React's children. Do not render React children inside `#hrpf-language-widget`.

Translation engines replace text nodes with other elements. Public client display
text uses `TranslationText`: when its value changes React replaces the entire
span instead of reconciling a provider-mutated text node. This applies to gallery
captions, filters, menu labels, form steps and other interactive display text.
Keep this boundary for future client components; never use it for private values.

`TranslationLink` preserves ordinary Next.js navigation in English. When a
translation is selected, public page/pagination links load a fresh document and
the provider reapplies the stored language. This deliberately avoids stale
translated DOM, and retains URLs, queries, native modified clicks and downloads.
Same-page anchors do not reload. Admin entry links always use document navigation.
Browser Back/Forward cache restoration reapplies the selected translation.
This feature does not implement the separately deferred performance/caching plan.

## Scope and exclusions

Public navigation, headings, descriptions, project/blog copy, gallery captions,
buttons, form labels and instructions can be translated. Original database text,
form submission payloads, email copies and original files are unchanged.

Input/textarea values, complaint review values, selected filenames, submission
references, error details, Turnstile and all private admin content are marked
`translate="no"` / `notranslate`. Admin routes have no language control and do not
load the translation script on a fresh document. The translator processes public
text; it is a third-party script and is not an HRPF security boundary.

Images, scanned newspaper cuttings, PDFs/certificates, videos, downloaded files
and external Google membership forms are outside this feature. Native browser
controls and some accessibility attributes may remain in their original/browser
language. Search continues to match the English source text. Translation is
automatic and is not an approved human translation of legal/consent wording.

No `/ur/` or other language-specific URLs, translated SEO pages or hreflang tags
are added. The source page remains English for crawlers. This matches the owner's
chosen browser text widget scope.

## Verification and owner review

Run frontend lint/build and `npm run test:home`. The public SSR suite verifies the
language entry point, lazy loading and private-route exclusion alongside existing
homepage, public content, navigation, pagination and complaint checks.

For live review, pull development and run the existing frontend/backend commands.
Open Languages and choose Urdu, then French. Navigate projects/blogs and gallery
pages, change gallery photos, search/filter a collection, and review the complaint
form with test values. Check that private values/files remain original and that
English restores text. Review the browser console for React/hydration errors.

Provider network access, browser script blocking and translation availability
remain external dependencies. Confirm the feature on the final deployed hostname.

Implementation checks passed: lint, typecheck, production build, dependency audit,
the four browser-side retry/navigation tests and the public SSR suite. A headless
browser exercised real Urdu/French translation, RTL fonts, translated navigation,
project photo switching, blog filtering, gallery zoom/pagination and Back.
Complaint interaction and outgoing translation payloads were checked with unique
synthetic values and all external requests intercepted locally. The provider
engine excluded those values and filenames; returning to English retained the
completed review. No live complaint or email was submitted.
Private admin exclusion also passed with a saved translation preference. Mobile
RTL menu interaction and blocked-provider retry passed with provider requests
fulfilled locally; these mobile checks did not contact the translation endpoint.

Official provider references checked on 2026-10-08 (Asia/Karachi):

- https://gtranslate.io/website-translator-widget
- https://gtranslate.io/blog/google-translate-website-widget-discontinued
- https://gtranslate.io/terms
- https://gtranslate.io/privacy-policy
- https://cdn.gtranslate.net/widgets/latest/dropdown.js
- https://cdn.gtranslate.net/widgets/latest/lib.min.js
