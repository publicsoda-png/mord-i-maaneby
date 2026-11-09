# Exports every alien cell as its own PNG (512×512, keyed, on neutral grey) for a blinded council.
# Usage: ~/Documents/tools/pyimg/bin/python -I tools/art/alien_cells.py <out_dir>
import os, sys, importlib.util
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('aliens', os.path.join(HERE, 'aliens.py'))
# aliens.py runs main() on import; neutralise argv so it does nothing harmful
sys.argv = [sys.argv[0]]
out = os.environ.get('OUT') or (sys.argv[1] if len(sys.argv) > 1 else None)
out = out or os.path.join(HERE, '..', '..', 'assets', 'raw', 'aliens', 'cells')
os.makedirs(out, exist_ok=True)
RAW = os.path.join(HERE, '..', '..', 'assets', 'raw', 'aliens')

def key(im, tol=80):
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if g > 140 and g - max(r, b) > tol: px[x, y] = (0, 255, 0, 0)
    return im

for s in (1, 2, 3):
    im = Image.open(os.path.join(RAW, f'aliens_{s}.png')).convert('RGB'); w, h = im.size; cw, ch = w // 3, h // 3
    for i in range(9):
        c = key(im.crop(((i % 3) * cw, (i // 3) * ch, (i % 3 + 1) * cw, (i // 3 + 1) * ch)))
        bb = c.getchannel('A').getbbox()
        if bb: c = c.crop(bb)
        c.thumbnail((440, 440), Image.LANCZOS)
        bg = Image.new('RGB', (512, 512), (90, 90, 110)); bg.paste(c, ((512 - c.width) // 2, 512 - 30 - c.height), c)
        bg.save(os.path.join(out, f'alien_{s}_{i}.png'))
print(out, 27)
