"""Contact sheet of a rendered video: one frame from late in every shot.

    .venv\\Scripts\\python.exe flayel-videos\\contact_sheet.py pov-01 [pov-02 ...]

Writes flayel-videos/out/sheets/<id>.png, for checking layouts at a glance.
"""

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
W, H = 360, 640


def sheet(video_id: str, points: tuple[float, ...] = (0.8,)) -> Path:
    """One frame per shot at each fraction in `points` (--dense: early, middle, late)."""
    props = json.loads((HERE / "motion" / "public" / video_id / "props.json").read_text(encoding="utf-8"))
    src = HERE / "out" / f"{video_id}.mp4"
    out_dir = HERE / "out" / "sheets"
    out_dir.mkdir(parents=True, exist_ok=True)
    frames = []
    for i, shot in enumerate(props["shots"]):
        for k, frac in enumerate(points):
            t = shot["start"] + (shot["end"] - shot["start"]) * frac
            tmp = out_dir / f"_{video_id}_{i}_{k}.png"
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", str(src), "-frames:v", "1", "-vf", f"scale={W}:{H}", str(tmp)],
                check=True,
            )
            frames.append(Image.open(tmp).copy())
            tmp.unlink()
    cols = 6 if len(points) > 1 else 4
    rows = (len(frames) + cols - 1) // cols
    img = Image.new("RGB", (cols * (W + 8), rows * (H + 8)), "white")
    for i, frame in enumerate(frames):
        img.paste(frame, ((i % cols) * (W + 8), (i // cols) * (H + 8)))
    path = out_dir / f"{video_id}.png"
    img.save(path)
    return path


if __name__ == "__main__":
    dense = "--dense" in sys.argv
    for vid in [a for a in sys.argv[1:] if not a.startswith("--")]:
        print(sheet(vid, (0.12, 0.5, 0.92) if dense else (0.8,)))
