# Public-page hero photography

Public pages use explicitly selected images from `frontend/data/hero-images.ts`.
The Our Work subcategory heroes and their photographs are unchanged.
All existing page information, forms and admin features remain in place.

## Stock images

Downloaded on 10 October 2026 from the photographer's free Unsplash photo page.
The [Unsplash License](https://unsplash.com/license) permits free commercial and
noncommercial use without permission; attribution is appreciated, not required.
These are decorative topic illustrations, not photographs of HRPF personnel,
beneficiaries, offices, documents, payments or particular projects.

| File in `frontend/public/images/heroes/v1/` | Photographer | Source | Topic |
| --- | --- | --- | --- |
| `vision.webp` | asif sharif | [Margalla Hills, Islamabad](https://unsplash.com/photos/XLlP0I4-TCQ) | Vision, Pakistan and a better environment |
| `writing.webp` | Kelly Sikkema | [Writing on paper](https://unsplash.com/photos/F7UonANW5LU) | Objectives, articles, information and awareness |
| `teamwork.webp` | Defrino Maasy | [Stacked hands](https://unsplash.com/photos/eOXkUnxC4PU) | Membership, cooperation, operational team and safeguarding |
| `contact.webp` | Jon Tyson | [Telephone](https://unsplash.com/photos/mE1iNedEJKs) | Contact and feedback |
| `justice.webp` | Tingey Injury Law Firm | [Lady Justice](https://unsplash.com/photos/yCdPU73kGSc) | Complaints, justice and terms |
| `microphone.webp` | Kane Reinholdtsen | [Microphone](https://unsplash.com/photos/LETdkk7wHQk) | TV interviews |
| `camera.webp` | Chris Yang | [Camera](https://unsplash.com/photos/J6xwa3Gedzo) | Gallery and media coverage |
| `documents.webp` | Wesley Tingey | [Paper records](https://unsplash.com/photos/snNHKZ-mGfE) | Registration, privacy and search |

The downloaded images were resized to a maximum dimension of 1800 pixels,
converted to WebP, and stripped of metadata. They are hosted locally rather
than hotlinked. Next.js serves responsive sizes through the existing AppImage
component for organization photos and uploaded covers. Original stock files
remain in `v1` as references. The active stock hero pairs live in `v2`.
Versioned source directories have an immutable one-year cache; use a new
version when replacing assets, and update the catalog to avoid stale images.

## Desktop and mobile compositions (v2)

Each of the eight stock topics has two files in
`frontend/public/images/heroes/v2/`: `<topic>-desktop.webp` and
`<topic>-mobile.webp` (16 assets). The mobile file preserves the downloaded
original exactly. Desktop images were recomposed from those references using
the built-in `image_gen` editing tool, then encoded as WebP with metadata
removed. They are AI-assisted decorative compositions, not unmodified stock
photos or evidence of an HRPF activity. No staff portraits or organization
photographs were generated or edited.

The final prompt set is [HERO_IMAGE_PROMPTS.json](HERO_IMAGE_PROMPTS.json).
Desktop sources are approximately 2172 × 724 pixels (3:1), with the main
subject on the right and negative space beside the heading. The writing
source is 2161 × 728 and microphone source 2170 × 725 pixels.

`HeroBackdrop` uses Next.js `getImageProps` inside a native `<picture>`:
the desktop source is selected from 1024px, and the mobile composition below
1024px. Both have optimized width candidates and `sizes="100vw"`; only the
selected composition is fetched. Eager loading and high fetch priority replace
a mobile-only preload, which could otherwise download both versions.

Stock heroes have a minimum height of 380px on desktop and a maximum width to
height ratio of 4:1, so ultrawide screens do not slice away the main subject.
Long titles and descriptions can grow the hero further. Mobile height remains
content-driven. Desktop decorative stock compositions mirror for RTL copy,
placing the subject opposite the title; actual HRPF photos and uploaded covers
are never mirrored. Original mobile focal points remain independently set.

## Existing organization photographs

The About, Who We Are, leadership, work, impact and donation heroes
reuse existing photographs supplied for HRPF and already used on the website:
`home-about.webp`, `home-chairman.webp`, `home-hero.webp`,
`education-and-awareness-archive.webp` in
`frontend/public/images/hrpf/`. They illustrate the organization generally;
they do not assert a new event date, participant role or project association.
The published CEO portrait remains in the message content below its hero.

## Published detail pages

Project and article heroes use their own uploaded cover when present. A project
without a cover uses conceptual stock imagery selected by its focus area,
not a photograph borrowed from another project. The shared project placeholder
remains unchanged in cards and galleries. Missing article covers use the
writing image. Admin previews follow the same presentation.

## Presentation

Hero photography is decorative (`alt=""`, hidden from assistive technology);
the actual page title, description and breadcrumbs remain real translated text.
Mobile framing can differ from desktop using the catalog's `mobilePosition`.
The text shading is stronger on mobile and beside desktop copy, lighter on the
opposite edge, and reversed for RTL languages. The home video uses its own
lighter blue gradient and retains its existing reduced-motion/mobile behavior.

## Topic replacements (v3) — 11 October 2026

The affected routes now have distinct relevant images:

| Route | Image and purpose | Mobile framing |
| --- | --- | --- |
| `/about` | Existing HRPF meeting, introducing the organization | Independent focal point on the discussion |
| `/about/who-we-are` | Supplied community audience (`education-and-awareness-archive.webp`), reflecting public engagement | Centers participants rather than empty room |
| `/about/profile` | Closed organizational profile folder | Separate near-square composition |
| `/about/mission-and-vision` | Joined hands, representing solidarity and inclusion | Separate near-square composition |
| `/about/progress-reports` | Open annual reports, representing reporting and accountability | Separate near-square composition |
| `/projects` and legacy `/programmes` | Planning clipboard and reviewing hand, representing project coordination | Separate near-square composition |

The four conceptual pairs are original built-in image_gen creations, stored in
`frontend/public/images/heroes/v3/`. They contain no identifiable staff or
beneficiaries, HRPF branding, readable statistics, or claims about a particular
project or document. They are decorative topic illustrations. HRPF photographs
are preserved, without generated or mirrored people. The previous meadow remains
only in other existing topic fallbacks; Mission and Vision no longer uses it.

Desktop sources are 2172 × 724; mobile sources are 1374 × 1145. Each mobile
composition was edited separately from its desktop reference, then both were
encoded as WebP with metadata removed. The existing native picture selects one
optimized image at the 1024px breakpoint. New v3 URLs avoid stale immutable v2
caches. The catalog includes independent mobile focal points for tablet crops.
The complete prompt set and final asset paths are in
[HERO_TOPIC_IMAGES_V3.json](HERO_TOPIC_IMAGES_V3.json).
