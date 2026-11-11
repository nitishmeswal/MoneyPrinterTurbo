"""Turn downloaded free-licensed images into round ball faces for image balls.

    python instavideos/engine/ballimg.py <download_dir>

Reads <key>.<ext> + credits.json from the download dir (see CREDITS.md for where
they came from), writes motion/public/img/<key>.png (512 px, round, white face)
and refreshes instavideos/CREDITS.md. A ball spec uses it with {"img": "<key>"}.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import PUBLIC, ROOT  # noqa: E402

IMG = PUBLIC / "img"
SIZE = 512

# how each image sits in its ball: "fit" = whole object on a white face (box = share of the
# diameter), "fill" = a photo cropped to cover the ball. crop = (x0, y0, x1, y1) as fractions.
FIT = {
    "ps5": {"box": 0.86}, "switch": {"box": 0.84}, "deck": {"box": 0.9},
    "ps2": {"box": 0.84}, "ps3": {"box": 0.86}, "ps4": {"box": 0.84}, "xbox": {"box": 0.86}, "x360": {"box": 0.84}, "xone": {"box": 0.84},
    "xsx": {"fill": True, "crop": (0.12, 0.0, 0.88, 0.62)},
    "apple": {"box": 0.56}, "google": {"box": 0.6}, "meta": {"box": 0.66}, "amazon": {"box": 0.74, "dy": 0.03},
    "microsoft": {"box": 0.56, "saturated": True}, "nvidia": {"box": 0.76},
}


def load(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).astype(int)
    if a[..., 3].min() == 255:
        # opaque photo on white: near-white pixels become transparent (soft edge)
        white = np.clip((a[..., :3].min(axis=2) - 232) / 20, 0, 1)
        a[..., 3] = (255 * (1 - white)).astype(int)
        im = Image.fromarray(a.astype(np.uint8))
    return im


def bbox(im: Image.Image, saturated: bool = False):
    a = np.asarray(im).astype(int)
    m = a[..., 3] > 24
    if saturated:
        m &= (a[..., :3].max(axis=2) - a[..., :3].min(axis=2)) > 60
    ys, xs = np.nonzero(m)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def face(key: str, src: Path) -> Image.Image:
    cfg = FIT[key]
    out = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255))
    if cfg.get("fill"):
        im = Image.open(src).convert("RGB")
        x0, y0, x1, y1 = cfg["crop"]
        w, h = im.size
        im = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
        s = min(im.size)
        im = im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width - s) // 2 + s, (im.height - s) // 2 + s)).resize((SIZE, SIZE), Image.LANCZOS)
        out.paste(im)
    else:
        im = load(src)
        im = im.crop(bbox(im, cfg.get("saturated", False)))
        box = cfg["box"] * SIZE
        k = min(box / im.width, box / im.height)
        im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS)
        out.alpha_composite(im, ((SIZE - im.width) // 2, int((SIZE - im.height) / 2 + cfg.get("dy", 0) * SIZE)))
    # round mask, slightly feathered
    mask = Image.new("L", (SIZE * 2, SIZE * 2), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, SIZE * 2 - 1, SIZE * 2 - 1), fill=255)
    mask = mask.resize((SIZE, SIZE), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    out.putalpha(mask)
    return out


def main(dl: Path):
    IMG.mkdir(parents=True, exist_ok=True)
    credits = json.loads((dl / "credits.json").read_text(encoding="utf-8"))
    for key in FIT:
        src = next(dl.glob(f"{key}.*"))
        face(key, src).save(IMG / f"{key}.png", optimize=True)
        print(f"img/{key}.png")
    lines = [
        "# Image credits",
        "",
        "Real images in the challenge videos (g42-g44) come from Wikimedia Commons under free licenses.",
        "Public domain and CC0 need no credit; CC BY-SA images must be credited where the video is posted",
        "(the captions in posts.csv include it). Logos and console names are trademarks of their owners;",
        "the videos only compare them and imply no endorsement.",
        "",
        "| Ball | File | Author | License |",
        "|---|---|---|---|",
    ]
    for key, c in credits.items():
        lines.append(f"| {key} | [{c['file']}]({c['page']}) | {c['author']} | {c['license']} |")
    (ROOT / "CREDITS.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("CREDITS.md")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
