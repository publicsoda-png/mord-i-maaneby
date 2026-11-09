#!/usr/bin/env python3
"""Contact sheet of screenshots: sheet.py OUT.png a.png b.png ... (2 columns, 640x480 cells)."""
import sys
from PIL import Image

out, names = sys.argv[1], sys.argv[2:]
ims = [Image.open(n).convert('RGB').resize((640, 480)) for n in names]
rows = (len(ims) + 1) // 2
sheet = Image.new('RGB', (1280, 480 * rows), 'black')
for i, im in enumerate(ims):
    sheet.paste(im, ((i % 2) * 640, (i // 2) * 480))
sheet.save(out)
print(out)
