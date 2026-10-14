# M0–M2 review and M4 accessibility/language review

Reviewed on `development` after M3 commit `0124a88a2ad2d996f7796e13f4826dd5292cdf1a`. Production remains unchanged.

## M0–M2

- M0's baseline describes the earlier production audit and keeps the agreed scope/exclusions clear. Its missing-header/metadata observations are historical baseline evidence, not claims about the updated development deployment.
- M1 uses `https://hrpf.org` for the metadata base, canonical URLs and social URLs. Homepage/static pages have default Open Graph/Twitter previews; published blog/project/person records supply their available images. The default share asset exists and is a 1280×720 WebP, matching its metadata.
- One small M1 correction: when a record has no cover, the shared default image now retains its own alternative description instead of borrowing the absent record cover's description.
- M2 serves robots and a sitemap with canonical public routes. The sitemap reads all available collection pages and deduplicates entries. Admin, newsletter actions, search results and duplicate programme routes are excluded. `/contact-us` and `/contact-us/` redirect permanently to `/contact`; the existing redirects remain intact.

The production-response regression suite now checks actual canonical/OG/Twitter tags on the homepage, contact page, a project, a blog and a board profile; the loadable share asset; robots rules; later-page sitemap entries; duplicate/query exclusions; and both forms of the legacy contact URL. Next.js first normalizes the trailing slash before the permanent legacy redirect.

## M4

Reviewed public homepage photos, project/blog covers and galleries, media images, video thumbnails, board/team portraits, flags, branded placeholders and hero backgrounds. Meaningful images already have supplied descriptions or useful title/name fallbacks. Decorative heroes, flags, neutral placeholders and thumbnails inside separately labelled carousel buttons correctly retain `alt=""`. No blanket alt-text replacement was needed.

The source document is English and now explicitly starts with `dir="ltr"`. The existing GTranslate flow updates both document language and direction after completed translation and restores English/LTR when returning to English or leaving for a private page. That shared operation is now covered by tests for Urdu, Arabic, the provider's legacy Hebrew code and LTR languages.

Untranslated English toast and validation/error message regions explicitly declare `lang="en"` and `dir="ltr"`. User answers, names and file names are not forced into English. Translatable labels/receipts retain the current provider behaviour.

Focused checks verify representative meaningful image descriptions, presence of every image's alt attribute, decorative empty alternatives and English/LTR source markup. Existing 34-page hero checks cover decorative imagery. No native Urdu routing or unsupported hreflang claims were added.

Local verification passed: lint, TypeScript, the standard production build, all 28 unit tests and the complete route suite including M0–M2/M3/M4 regression checks. The React review found no new hooks, dependencies, rendering modes or request-flow changes.

M5 remains the final development browser review, including actual translation/provider behaviour, security policies, forms, embeds and mobile layouts. No PR to `main` is created until owner approval.

## Browser-tab icon correction

The PNG icon already used the HRPF logo, but the legacy `favicon.ico` still contained the Vercel triangle. Replaced that ICO with 16/32/48/64-pixel versions of the existing HRPF logo and renamed the unchanged PNG to `icon1.png` for a fresh generated icon URL. The root metadata explicitly versions the ICO link. Regression checks confirm that page icon links target HRPF assets and that both served files match the checked-in logo/icon bytes. A clean production build and the full test suite passed.
