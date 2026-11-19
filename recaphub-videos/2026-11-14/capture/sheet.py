"""Labelled contact sheets of the captured shots: python sheet.py <out-prefix> [name ...]"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

SHOTS = Path(__file__).resolve().parent.parent / "motion" / "public" / "shots"
prefix = sys.argv[1]
names = sys.argv[2:] or sorted(p.stem for p in SHOTS.glob("*.png") if not p.stem.endswith("-el"))
W, H, COLS = 480, 300, 4
for k in range(0, len(names), 16):
    batch = names[k:k + 16]
    rows = (len(batch) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * W, rows * (H + 24)), "white")
    d = ImageDraw.Draw(sheet)
    for i, n in enumerate(batch):
        im = Image.open(SHOTS / f"{n}.png").convert("RGB")
        im.thumbnail((W, H))
        x, y = (i % COLS) * W, (i // COLS) * (H + 24)
        sheet.paste(im, (x, y + 24))
        d.rectangle([x, y, x + W, y + 23], fill="black")
        d.text((x + 6, y + 5), f"{n}  {Image.open(SHOTS / f'{n}.png').size}", fill="white")
    sheet.save(f"{prefix}-{k // 16:02d}.png")
    print(f"{prefix}-{k // 16:02d}.png")
