"""Finishing pass for a rendered short: the account look + a loudness master.

One ffmpeg pass per video (fast enough for 120 shorts): bloom (a blurred copy
screened on top, which makes balls and reveals glow on dark stages), a colour
tweak, a vignette, fine animated grain, and loudnorm to -14 LUFS / -1.5 dBTP.

    python instavideos/engine/finish.py a01-break-out
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import FFMPEG, OUT, load_spec  # noqa: E402

import os  # noqa: E402

# "nvenc" (default) encodes on the NVIDIA GPU; FINISH_ENCODER=x264 falls back to the CPU
ENCODER = os.environ.get("FINISH_ENCODER", "nvenc")

LOOKS = {
    "ball-arena": {"bloom": 0.32, "sigma": 18, "sat": 1.08, "contrast": 1.04, "vig": "PI/7", "grain": 5},
    "mind-reader": {"bloom": 0.22, "sigma": 26, "sat": 1.04, "contrast": 1.03, "vig": "PI/7", "grain": 7},
    "capsule-world": {"bloom": 0.38, "sigma": 22, "sat": 1.12, "contrast": 1.02, "vig": "PI/7", "grain": 4},
    "reflex-lab": {"bloom": 0.26, "sigma": 16, "sat": 1.06, "contrast": 1.05, "vig": "PI/7", "grain": 4},
    "bounce-melody": {"bloom": 0.42, "sigma": 20, "sat": 1.1, "contrast": 1.03, "vig": "PI/7", "grain": 4},
    "marble-kingdom": {"bloom": 0.24, "sigma": 18, "sat": 1.06, "contrast": 1.04, "vig": "PI/7", "grain": 5},
    "sensory": {"bloom": 0.32, "sigma": 18, "sat": 1.08, "contrast": 1.04, "vig": "PI/7", "grain": 4},
}


def finish(vid: str) -> Path:
    spec = load_spec(vid)
    look = LOOKS[spec["account"]]
    raw = OUT / "raw" / f"{vid}.mp4"
    dst = OUT / spec["account"] / f"{vid}.mp4"
    dst.parent.mkdir(parents=True, exist_ok=True)
    vf = (
        # glow is drawn in Remotion (ball halos, ring glows); ffmpeg blooms either tint
        # (screen on YUV) or wash out (luma only) the colours. Here: colour, vignette,
        # grain, and an explicit full-range (Remotion) -> TV-range conversion, keeping its BT.601 matrix
        f"[0:v]eq=saturation={look['sat']}:contrast={look['contrast']},"
        f"vignette=angle={look['vig']}:eval=init,noise=c0s={look['grain']}:c0f=t,"
        f"scale=in_range=full:out_range=limited,format=yuv420p[v]"
    )
    if ENCODER == "nvenc":
        # RTX video encoder: frees the CPU for Chrome while rendering. VBR with a cap keeps the grain from bloating files.
        venc = ["-c:v", "h264_nvenc", "-preset", "p6", "-tune", "hq", "-rc", "vbr", "-cq", "23", "-b:v", "7M", "-maxrate", "10M", "-bufsize", "20M",
                "-spatial-aq", "1", "-temporal-aq", "1", "-profile:v", "high", "-bf", "3"]
    else:
        venc = ["-c:v", "libx264", "-preset", "medium", "-crf", "18"]
    cmd = [str(FFMPEG), "-v", "error", "-y", "-i", str(raw), "-filter_complex", vf, "-map", "[v]", "-map", "0:a",
           "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000",
           *venc, "-r", "60", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "smpte170m", "-color_primaries", "smpte170m", "-color_trc", "smpte170m",
           "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", str(dst)]
    r = subprocess.run(cmd, capture_output=True, text=True, errors="replace")
    if r.returncode:
        raise SystemExit(f"finish {vid} failed: {r.stderr[-1500:]}")
    return dst


if __name__ == "__main__":
    import time

    for v in sys.argv[1:]:
        t0 = time.time()
        print(f"{v} -> {finish(v)} in {time.time() - t0:.0f}s")

