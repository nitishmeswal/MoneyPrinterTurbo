"""Contact sheets straight from the finished films in out/ (no re-render): one frame at `frac` of every shot.

    python recaphub-promo/review/finals.py            # 0.9: where each shot's camera push is largest
    python recaphub-promo/review/finals.py 0.5
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from times import FILMS, times  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
FF = ROOT.parent / ".venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe"
frac = float(sys.argv[1]) if len(sys.argv) > 1 else 0.9
tmp = ROOT / "review" / "_tmp_finals"
tmp.mkdir(exist_ok=True)
w, h, cols = 384, 216, 8
rows = []
for name in FILMS:
    ts, _ = times(name, frac)
    ims = []
    for i, t in enumerate(ts):
        p = tmp / f"{name}-{i}.png"
        subprocess.run([str(FF), "-v", "error", "-y", "-ss", str(t), "-i", str(ROOT / "out" / f"recaphub-{name.lower()}.mp4"), "-frames:v", "1", "-vf", f"scale={w}:{h}", str(p)], check=True)
        ims.append(Image.open(p).convert("RGB"))
    for k in range(0, len(ims), cols):
        rows.append(ims[k:k + cols])
sheet = Image.new("RGB", (cols * (w + 4) + 4, len(rows) * (h + 4) + 4), (27, 27, 27))
for r, row in enumerate(rows):
    for c, im in enumerate(row):
        sheet.paste(im, (4 + c * (w + 4), 4 + r * (h + 4)))
out = ROOT / "review" / f"finals-{frac}.png"
sheet.save(out)
print(out, sheet.size)
