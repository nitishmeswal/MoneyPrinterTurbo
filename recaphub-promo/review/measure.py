"""Measure a film against the Teamble reference, in numbers rather than impressions.

For each video: hard cuts per minute (scene detection), how much the picture moves (mean frame-to-frame
difference), and the share of "still" frames (almost no change from the previous frame). Teamble's polish
shows up as few hard cuts, constant motion and almost no still frames; a template look shows up as many
cuts with dead holds between them.

    python recaphub-promo/review/measure.py                       # every film in out/ + the reference + v2
    python recaphub-promo/review/measure.py out/recaphub-launch.mp4
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
FF = REPO / ".venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe"
REF = REPO / "flayel-videos" / "Best-SaaS-Product-SnapYT.App.mp4"
V2 = REPO / "recaphub-videos" / "2026-11-14" / "out"


def run(args):
    return subprocess.run([str(FF), "-hide_banner", *args], capture_output=True, text=True, errors="replace").stderr


def measure(path: Path):
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", run(["-i", str(path)])).groups()
    dur = int(h) * 3600 + int(m) * 60 + float(s)
    cuts = len(re.findall(r"pts_time", run(["-i", str(path), "-an", "-vf", "scale=480:-2,select='gt(scene,0.32)',showinfo", "-f", "null", "-"])))
    out = run(["-i", str(path), "-an", "-vf", "scale=320:-2,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG", "-f", "null", "-"])
    d = [float(x) for x in re.findall(r"YAVG=([\d.]+)", out)]
    if not d:
        return None
    still = sum(1 for x in d if x < 0.25) / len(d)
    return dict(dur=dur, cuts_per_min=cuts / dur * 60, motion=sum(d) / len(d), still=still)


def main():
    files = [Path(a) for a in sys.argv[1:]] or [REF, *sorted((ROOT / "out").glob("recaphub-*.mp4")), *sorted(V2.glob("recaphub-*.mp4"))]
    print(f"{'video':42} {'sec':>6} {'cuts/min':>9} {'motion':>8} {'still %':>8}")
    for f in files:
        m = measure(f)
        if not m:
            continue
        tag = "REFERENCE " if f == REF else ("v2 " if V2 in f.parents else "v3 ")
        print(f"{(tag + f.stem)[:42]:42} {m['dur']:6.1f} {m['cuts_per_min']:9.1f} {m['motion']:8.2f} {m['still'] * 100:7.1f}%")


if __name__ == "__main__":
    main()
