# Our Work: organisation-based redesign

## Owner direction and sequence — 2026-10-07

Translation was accepted and merged through PR #7 (`15b953a`). The owner has
prioritised correcting the prototype Our Work pages before performance/caching.
Implement one category at a time on development, beginning with Women's Rights.
Retain the blue/navy/gold palette, Inter/Lora typography, square corners, header,
footer and multilingual widget. A page-specific redesign is explicitly authorised.

The screenshot lists six menu categories, in the sequence below. The source
data additionally contains Refugees and Migrants and Community Development.
Those legacy pages and the Our Work overview need a later content review; this
milestone does not remove or redesign them or alter the homepage's theme/grid.

## Refined owner direction — 2026-10-08

All category pages should explain HRPF's general priorities and how it handles
concerns. Do not hardcode individual interventions, project outcomes, report
citations, page numbers or archive/restoration captions in the category page.
Use a **Projects in this field** section with public managed project cards instead.
Specific work belongs in each project record and its full project detail page.
The existing source analysis below remains an internal content reference.

## Organisation analysis and evidence

- `information/given pages text.txt`: the current institutional description,
  mission and vision. HRPF is a non-governmental, non-political public-interest
  organisation. Its practical approach centres on documentation, public
  awareness, complaints, representations, information requests, institutional
  engagement and peaceful lawful advocacy. This source takes priority over
  the older profile.
- `aims and objectives.zip`: all five constitutional scans reviewed visually.
  Objects 1–2 include women's rights, gender equality, domestic violence,
  empowerment, reproductive health and mother-and-child healthcare. Objects
  8–17 cover education, research and training; objects 32 and 40–42 include
  public-interest research/reporting and press freedom. These are objects and
  priorities, not proof that every facility or service is operating.
- `progress reports.zip`: reviewed report text/topic inventories for 2023,
  2024 and 2025, with the Women's Rights evidence checked directly against
  the original PDF pages. The 2025 Dar-ul-Aman report, pages 14–15, records
  reported sanitation/healthcare/oversight deficiencies, HRPF's complaint to
  the Provincial Ombudsman Punjab and subsequent reported improvements.
  No resident count, programme budget or continuing service capacity is given.
- `information/Board of Directors.docx`: the current governance source. Its
  biographies support HRPF's institutional/public-welfare identity; they do
  not establish specialist women's services or an emergency response team.
- `information/PROFILE HRPF.docx`: May 2026 fallback for thematic priorities
  and institutional context. Older governance titles and hypothetical job
  descriptions do not override the newer board/source text. Registration
  status is not inferred from profile assertions or old certificate scans.
- `certificates and registration.zip`: historical registration evidence, already
  reviewed in the document milestone. Link to the existing certificates page;
  do not turn expired/dated documents into current accreditation claims.
- Supplied original photographs, prepared photo/press archives and source CSVs:
  visual/context evidence only. Captions describe what is visible. A photograph
  does not establish a date, programme, participant role, consent to victim
  identification or a reported outcome. Keep provenance in this internal source map;
  omit the visible category-page caption per the owner.
- Navigation/membership/social files define existing destinations. This redesign
  uses the implemented complaint route and existing contact/membership routes;
  it does not promise live services through prototype forms.

The Project Files brief is referenced by repository context but no separate
`HRPF_Project_Brief.md` was present in the supplied/local source set. The current
owner request and organisation files supply the necessary direction. Credential
material in the information ZIP is unrelated and was not read.

## Page sequence and content map

| Page | General page direction | Internal evidence / project content |
| --- | --- | --- |
| Women's Rights | Dignity, safety, gender equality, maternal wellbeing and institutional accountability | Dar-ul-Aman, Mandi Bahauddin; 2025 report pp. 14–15 |
| Children's Rights | Child protection, educational rights, healthcare access and prevention of exploitation | School/vaccination interventions; publish no identifiable child case details |
| Access to Justice | Complaints, lawful advocacy, documentation, prisoners' welfare and institutional engagement | Reviewed prison/oversight interventions; no guaranteed representation or outcome |
| Minority Rights | Equality, non-discrimination and interfaith/community inclusion | Constitutional/mission priorities; no named specialist programme or numeric outcome established |
| Education and Awareness | School conditions, rights awareness and public-interest education | Government Primary School Mianwal Ranjha; 2025 report pp. 13, 16 and education analysis pp. 21–22 |
| Research and Advocacy | RTI, institutional transparency, public service evidence and reporting | 2024 crime/health analysis and 2025 RTI section pp. 64–67, with personal details excluded |

For each next page, verify its primary passages and imagery before writing final
copy. Theme consistency does not require six identical page layouts. The Our Work
overview and two legacy categories follow the six requested menu pages.

## Women's Rights design

1. Split navy hero with the thematic introduction, supplied photograph without a
   visible archive/source caption, complaint action and related-project anchor.
2. Compact on-page navigation, wrapping on mobile.
3. Three general priorities: dignity/safety, health/wellbeing, accountability.
4. **Projects in this field**: up to three published managed projects assigned
   to Women's Rights, linking to `/projects/[slug]`, plus View all projects.
5. General approach: listen/document, raise concerns lawfully, follow up/report.
6. Complaint/contact action panel and general FAQs about support and next steps.

No case-specific details, fixed impact figures, invented programmes or anonymous
quotes appear in the category copy. Project titles, summaries and results remain
managed in the existing Projects editor. The same general-page/managed-project
pattern governs the next categories; their individual redesign is still sequential.

## Related-project operation

The page requests `/api/projects?focusArea=Women's%20Rights&limit=3`. The existing
public listing now accepts an optional bounded `focusArea` label and filters before
pagination/counting. Case and straight/curly apostrophe variants match; combined
labels such as `Women's Rights and Health` can also match. Existing publication,
review, release-date and immediate withdrawal controls still apply.

In the Projects editor, use **Women's Rights** (or **Women’s Rights**) as the focus
area and publish the project through the existing workflow. The source-seeded
Dar-ul-Aman project already uses this field; this change does not create or reseed
it. New and edited released records appear automatically. No prototype fallback
is shown if the field is empty; backend failure leaves the general page usable
with a brief projects-loading message. The overview remains `/projects`.

## Image provenance (internal)

`frontend/public/images/hrpf/womens-rights-archive.webp` is an exact copy of
`other_images_final/website_webp/gallery-200.webp`. The archive manifest labels
it `AI_RESTORATION`; the date is unestablished. Keep a descriptive image alt,
without a visible provenance caption. It is illustrative public-gathering imagery,
not a photograph of Dar-ul-Aman residents.

## Verification

Frontend lint, type generation/TypeScript, production build, four existing tests
and public SSR/navigation passed. SSR verifies managed project refresh and focus
query, empty/offline behaviour, one H1, actions and absence of hardcoded case,
source notes and prototype claims. Browser review covered desktop, 390px/320px
mobile and landscape, image/metadata, anchors, keyboard FAQ, project link and
isolated Urdu RTL/English restoration. This checks interaction rather than
translation accuracy. The next category remains unchanged for its own redesign.
Backend typecheck/OpenAPI checks pass; integration checks exercise filtering
before pagination, label variants, literal regex text, unpublished/future/unreviewed
exclusion and immediate withdrawal.
