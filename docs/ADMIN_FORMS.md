# Admin form readability and manual language controls — 8 October 2026

The owner reported that field names and filled answers looked alike, and asked
whether retained Urdu controls were redundant after adding public translation.
Reviewed the supplied `image(8).png` and traced the editor/API/public route code.

## Language behaviour

- Public Translate uses GTranslate over rendered English content. It does not
  populate stored Urdu fields or use them as an override for translated English.
- Original manual Urdu support predates that widget and remains a separate
  publishing capability. Project/Blog `locale` chooses a source-language record,
  not a visitor's preferred language. Urdu original records use `?locale=ur`
  detail URLs and are excluded from the default English listings.
- New records still default to English. Urdu title/summary/excerpt fields are
  unnecessary for ordinary English publishing and automatic translation.
- Retain all stored Urdu values and API/schema support. Project/Blog controls are
  now under “Manual Urdu content (optional)”; required Urdu controls are exposed
  when editing an Urdu original. Other editors have consistent optional guidance.
  Selecting a different source language never generates or rewrites content.

## Design and implementation

Project/Blog inputs inherited `font-semibold` from wrapping labels. Separate
labels from controls through `AdminField`; preserve control IDs, connect labels
with `htmlFor`, and associate permanent hints through `aria-describedby`.
Gallery and Document editors reuse the field component. The admin layout scope
also applies readable control styles to Board, sign-in and complaint forms.

Admin controls have regular-weight 16px text, 14px emphasized labels, clearly
larger section headings, consistent sans-serif typography, a darker field border,
44px minimum control height and a strong focus outline. Long answers use existing
resizable textareas; responsive grouping and optional sections are retained.
Explicit Urdu inputs keep `lang="ur"`, RTL direction and the Arabic font.
Public previews are marked separately so heading typography remains faithful to
the public website. No public styling, publishing API, database record or permission
is changed by this presentation update.

Design references:

- https://design-system.service.gov.uk/components/text-input/ — visible labels
  above controls, concise sentence-case wording and persistent hints.
- https://www.w3.org/WAI/tutorials/forms/labels/ — programmatic labels.
- https://www.w3.org/WAI/tutorials/forms/grouping/ — understandable related groups.

## Validation

Frontend lint, typecheck, production build and existing public regression checks.
An isolated synthetic React-render check covered all five editors, unique control
IDs, label associations, preserved IDs/described-by references, explicit Urdu
semantics, collapsed English manual sections and exposed Urdu-required fields.
It used no real admin login, records or uploads. No live browser interaction is
claimed by that render check.

## Private admin navigation and button cursors

At the owner's further request, the public Header and Footer are omitted from
`/admin` and all its descendants through a pathname-aware `SiteFrame`. Server
slots preserve public page rendering; public routes keep the existing chrome.
The translation controller stays mounted at the root so its route-transition
cleanup still runs, and it continues to omit its widget on private routes.

All six admin consoles use one `AdminNavigation` with wrapping 44px links and
`aria-current="page"` for the active destination. Retain existing signed-in/role
guards, including complaint-only navigation for staff without content access.
Session details, sign-out and explicit public preview links remain in their
existing workflows. No public menu, Donate control or newsletter footer appears
in the admin interface. This is a presentation change, not an authorization rule.

Global button, button-role and native action-input styles now show a hand cursor
when enabled. Disabled/aria-disabled actions show a not-allowed cursor; disclosure
summaries also show a hand cursor. Keyboard focus and disabled behaviour are kept.

Verification covers production SSR for all six admin routes without public chrome,
retained public homepage chrome, synthetic public/admin route switching through
the frame, active admin links and the restricted complaint menu. Frontend checks
include lint, types, production build and existing public regressions.
