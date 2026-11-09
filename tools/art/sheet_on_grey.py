# Renders a transparent sprite sheet on neutral grey at 2× for inspection. Usage: sheet_on_grey.py in.png out.png
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGBA'); bg = Image.new('RGB', im.size, (90, 90, 110)); bg.paste(im, (0, 0), im)
bg.resize((im.width * 2, im.height * 2), Image.NEAREST).save(sys.argv[2])
