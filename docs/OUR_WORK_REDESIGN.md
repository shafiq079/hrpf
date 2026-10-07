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
  identification or a reported outcome. Preserve AI restoration disclosure.
- Navigation/membership/social files define existing destinations. This redesign
  uses the implemented complaint route and existing contact/membership routes;
  it does not promise live services through prototype forms.

The Project Files brief is referenced by repository context but no separate
`HRPF_Project_Brief.md` was present in the supplied/local source set. The current
owner request and organisation files supply the necessary direction. Credential
material in the information ZIP is unrelated and was not read.

## Page sequence and content map

| Page | Sourced direction | Evidence-led feature |
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

1. Split navy hero: clear title, concise institutional position, a real HRPF
   public-gathering photograph, complaint action and an anchor to documented work.
2. A compact on-page navigation row, wrapping on mobile.
3. Three priorities explaining dignity/safety, maternal wellbeing and accountability.
4. A substantial Dar-ul-Aman case section: reported concerns → formal complaint
   → reported improvements. Identify year, location and oversight institution,
   and visibly attribute outcomes to the 2025 report.
5. HRPF's approach: listen/document, raise concerns through institutions, follow up.
6. A practical action panel linking to the implemented complaint form and contact;
   explain that the website is not an emergency response service.
7. Short FAQs about shelter ownership, complaints and legal outcomes, followed
   by links to existing Progress Reports and Aims and Objectives.

Remove this page's invented workshops, leadership programme, illustrative impact
figures, anonymous testimonial, stock photograph and unrelated sample reports.
Do not hardcode a link to an unpublished project or expose private report annexes.
The fixed thematic copy needs no seed, new backend endpoint or admin workflow.

## Image provenance

`frontend/public/images/hrpf/womens-rights-archive.webp` is an exact copy of
`other_images_final/website_webp/gallery-200.webp`, supplied in the prepared
photo archive. The existing archive manifest labels it `AI_RESTORATION`.
Use a neutral alt/caption describing the public gathering and disclose restoration.
It is illustrative archive photography, not an image of Dar-ul-Aman residents.

## Verification

Check source-only copy, working links/anchors, one H1, heading order, image
loading/alt/caption, mobile/desktop layout, keyboard FAQ operation and translated
RTL interaction. Keep the remaining detail pages' content unchanged for their
own review. Run the existing frontend checks and public SSR suite, and verify
that the Women's Rights HTML excludes all old sample claims.

Implementation validation: frontend lint, type generation/TypeScript and production
build passed, as did the existing four tests and public SSR/navigation suite.
Browser review covered 1440px desktop, 390px and 320px mobile, and 844px landscape;
source attribution, one H1, image loading, metadata, four anchors, keyboard FAQ,
complaint/contact/report destinations and the unchanged Children's Rights page.
Urdu RTL and English restoration used the existing provider engine with isolated
translation responses; this verifies interaction rather than translation accuracy.
The local Next route cache initially served an older generated page. Moving that
generated cache aside restored the new build; no application caching change was made.
