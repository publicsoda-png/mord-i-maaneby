# C6: zoom the winning jump-scare render so the face reads at <=300 ms (judges' fix 4) and the doorway drops out (fix 3)
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB'); w, h = im.size; sx = w / 640; sy = h / 480
box = (int(190 * sx), int(80 * sy), int(590 * sx), int(380 * sy))
im.crop(box).resize((640, 480), Image.LANCZOS).save(dst); print(im.size, '->', dst)
