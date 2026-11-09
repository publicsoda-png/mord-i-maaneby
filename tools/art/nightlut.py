# WP1 (era rule: no canvas filters): bakes night variants of sprites as PNG8 files — <name>_nat.png next to the source.
# Night LUT = darken to 50 %, desaturate 50 %, cool shift (b +6 %), quantize 255 + hard alpha. Same geometry, same cell layout.
# Usage: ~/Documents/tools/pyimg/bin/python -I tools/art/nightlut.py assets/sprites/helper.png assets/sprites/helper_chair.png …
import sys, os
from PIL import Image, ImageEnhance
for src in sys.argv[1:]:
    im = Image.open(src).convert('RGBA'); a = im.getchannel('A')
    rgb = im.convert('RGB')
    rgb = ImageEnhance.Color(rgb).enhance(0.5); rgb = ImageEnhance.Brightness(rgb).enhance(0.5)
    r, g, b = rgb.split(); b = b.point(lambda v: min(255, int(v * 1.06 + 6))); r = r.point(lambda v: int(v * 0.96))
    rgb = Image.merge('RGB', (r, g, b)).quantize(255, dither=Image.Dither.FLOYDSTEINBERG).convert('RGB')
    out = Image.merge('RGBA', (*rgb.split(), a.point(lambda v: 255 if v > 100 else 0)))
    dst = src[:-4] + '_nat.png'; out.save(dst, optimize=True); print(dst, out.size)
