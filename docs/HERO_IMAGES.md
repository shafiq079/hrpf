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
component. The versioned source directory has an immutable one-year cache;
use `v2` when replacing assets, and update the catalog to avoid stale images.

## Existing organization photographs

The About, leadership, work, project listing, impact, donation and report heroes
reuse existing photographs supplied for HRPF and already used on the website:
`home-about.webp`, `home-chairman.webp`, `home-hero.webp`,
`research-and-advocacy-archive.webp` and `home-report-2024.webp` in
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
