"""Prepare the supplied profile PDF, preserving text and replacing private portraits.
Usage: python prepare-organization-profile.py SOURCE.pdf PLACEHOLDER.png OUTPUT.pdf
Requires PyMuPDF. SOURCE is the 43-page LibreOffice conversion of PROFILE HRPF.docx.
"""
import sys
from pathlib import Path
import fitz

source, placeholder, output = map(Path, sys.argv[1:])
doc = fitz.open(source)
assert len(doc) == 43, 'Unexpected source edition; review image coordinates before editing.'
original_text = [page.get_text() for page in doc]
# Image-native coordinates; preserve captions and all other people.
regions = [(11, 0, (769, 628), [(570, 17, 735, 233), (86, 341, 279, 549)]),
           (42, 2, (294, 414), [(227, 341, 288, 408)])]
for page_number, image_number, dimensions, boxes in regions:
    page = doc[page_number]
    info = page.get_image_info()[image_number]
    assert (info['width'], info['height']) == dimensions
    x, y, x1, y1 = info['bbox']
    sx, sy = (x1-x)/dimensions[0], (y1-y)/dimensions[1]
    rects = [fitz.Rect(x+a*sx, y+b*sy, x+c*sx, y+d*sy) for a,b,c,d in boxes]
    for rect in rects:
        page.add_redact_annot(rect, fill=(.90, .90, .90))
    # Remove underlying image pixels; an overlay alone would retain the private photo.
    page.apply_redactions(images=2, graphics=0, text=0)
    for rect in rects:
        page.insert_image(rect, filename=str(placeholder), keep_proportion=True)
output.parent.mkdir(parents=True, exist_ok=True)
doc.save(output, garbage=4, deflate=True)
final = fitz.open(output)
assert original_text == [page.get_text() for page in final], 'Document text changed.'
print(f'{len(final)} pages; {output.stat().st_size} bytes; all text preserved')
