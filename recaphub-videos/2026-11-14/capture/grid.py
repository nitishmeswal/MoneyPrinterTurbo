"""Gridded previews of captured shots, labelled in source pixels, for picking crop/lift rectangles.
python grid.py <out.png> name [name ...]"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

SHOTS = Path(__file__).resolve().parent.parent / "motion" / "public" / "shots"
out, names = sys.argv[1], sys.argv[2:]
TW = 900
tiles = []
for n in names:
    im = Image.open(SHOTS / f"{n}.png").convert("RGB")
    k = TW / im.width
    th = int(im.height * k)
    im = im.resize((TW, th))
    d = ImageDraw.Draw(im)
    step = 200
    for x in range(0, int(TW / k), step):
        d.line([(x * k, 0), (x * k, th)], fill=(255, 0, 80) if x % 1000 == 0 else (255, 140, 170), width=1)
        d.text((x * k + 2, 2), str(x), fill=(220, 0, 60))
    for y in range(0, int(th / k), step):
        d.line([(0, y * k), (TW, y * k)], fill=(255, 0, 80) if y % 1000 == 0 else (255, 140, 170), width=1)
        d.text((2, y * k + 2), str(y), fill=(220, 0, 60))
    d.rectangle([0, th - 18, TW, th], fill="black")
    d.text((6, th - 15), n, fill="white")
    tiles.append(im)
cols = 2
rows = [tiles[i:i + cols] for i in range(0, len(tiles), cols)]
H = sum(max(t.height for t in r) for r in rows)
sheet = Image.new("RGB", (cols * TW, H), "white")
y = 0
for r in rows:
    for i, t in enumerate(r):
        sheet.paste(t, (i * TW, y))
    y += max(t.height for t in r)
sheet.save(out)
print(out, sheet.size)
