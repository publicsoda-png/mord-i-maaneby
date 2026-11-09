# Builds assets/sprites/helper_chair.png: the empty rocking chair (night sprite, WP8) in the same 125×250 cell as helper.png,
# bottom-anchored and sized so the chair matches the one under the helper (its width in frame 0 of helper.png).
# Usage: ~/Documents/tools/pyimg/bin/python -I tools/art/chair.py assets/raw/helper/chair_empty_1.png
import os, sys
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
FW, FH = 125, 250

def key(im, tol=80):
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if g > 140 and g - max(r, b) > tol: px[x, y] = (0, 255, 0, 0)
            elif g > 120 and g - max(r, b) > tol // 2: px[x, y] = (r, g, b, 120)
    return im

src = sys.argv[1]
helper = Image.open(os.path.join(ROOT, 'assets', 'sprites', 'helper.png')).convert('RGBA')
f0 = helper.crop((0, 0, FW, FH)); bb = f0.getchannel('A').getbbox()
target_w = bb[2] - bb[0]  # the seated figure+chair width; the chair alone is about that wide at the rockers
k = key(Image.open(src)); kb = k.getchannel('A').getbbox(); k = k.crop(kb)
scale = target_w / k.width; k = k.resize((max(1, round(k.width * scale)), max(1, round(k.height * scale))), Image.LANCZOS)
if k.height > FH: k.thumbnail((FW, FH), Image.LANCZOS)
out = Image.new('RGBA', (FW, FH), (0, 0, 0, 0)); out.paste(k, ((FW - k.width) // 2, FH - k.height), k)
rgb = out.convert('RGB').quantize(255, dither=Image.Dither.FLOYDSTEINBERG).convert('RGB')
alpha = out.getchannel('A').point(lambda v: 255 if v > 100 else 0)
dst = os.path.join(ROOT, 'assets', 'sprites', 'helper_chair.png'); Image.merge('RGBA', (*rgb.split(), alpha)).save(dst, optimize=True)
print(dst, out.size, 'chair w', k.width)
