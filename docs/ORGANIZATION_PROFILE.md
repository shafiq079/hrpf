# Organizational profile

The About Us menu and overview include `/about/profile`. Its overview follows
current client-supplied organization copy. The document is the supplied
`information/PROFILE HRPF.docx` from `03-information.zip`, prepared May 2026.

The DOCX was converted through LibreOffice to a 43-page PDF. Document text, page
order and captions are preserved. Both named female board portraits on page 12
and the female portrait in the closing collage on page 43 use the owner-supplied
neutral silhouette. Native PDF redaction removes underlying photograph pixels.
The private source DOCX is not published.

To reproduce after converting the DOCX, use PyMuPDF:

```bash
python docs/scripts/prepare-organization-profile.py SOURCE.pdf Portrait_Placeholder.png frontend/public/documents/profile/v1/hrpf-organizational-profile.pdf
```

Review the result visually, check its page count and text, and update the size in
`frontend/data/organization-profile.ts`. Coordinate assertions prevent silently
using a different source edition. New public document revisions should use a new
versioned folder because the published URL has immutable caching.

The PDF is served locally, so no Cloudinary account, environment variable, database
seed or admin upload is required. View opens a new tab; Download supplies a clear
filename. The PDF is fetched only when a visitor chooses a document action. The
card stacks below the overview on mobile.
