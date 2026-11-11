"""Music edit on bar lines: keep only the parts of a track that drive the film.

A 2-minute AI track has intros, breakdowns and long builds a 60 s launch film
cannot afford. This cuts the track at bar lines (from beatmap.py) and joins the
kept parts with a short equal-power crossfade that ends exactly on each kept
part's downbeat, so the hit lands at full strength and the beat never skips.
The beat grid and hits of the edit are carried over from the analysis of the
original, so they stay exact across every splice.

    python flayel-videos/musicedit.py track.mp3 --bars 6-12,32-46,51-60 \
        -o flayel-videos/motion/public/launch/music-flayel.wav \
        --timeline flayel-videos/motion/src/launch/flayel.json

`--bars a-b` keeps bars a (inclusive) to b (exclusive), as numbered in
`beatmap.py --png`. The timeline gets `grid`, `accents`, `musicOffset` 0, the
`music` path and an `edit` note; its scenes are kept.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from beatmap import FFMPEG, analyse, dump_timeline  # noqa: E402

XFADE = 0.025  # seconds of overlap at each splice, all of it before the downbeat


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track", type=Path)
    ap.add_argument("--bars", required=True, help="kept bar ranges, e.g. 6-12,32-46,51-60")
    ap.add_argument("-o", "--out", type=Path, required=True, help="edited audio (.wav keeps the timing sample-exact)")
    ap.add_argument("--timeline", type=Path, help="film timeline JSON to write the edit's beat grid into")
    a = ap.parse_args()

    bm = analyse(a.track)
    beats, down = bm["beats"], bm["downbeat"]
    bar_t = [b["t"] for b in bm["bars"]]

    def bar_time(k: int) -> float:
        if k < len(bar_t):
            return bar_t[k]
        if k == len(bar_t):
            return bm["duration"]
        raise SystemExit(f"bar {k} is past the end of the track ({len(bar_t)} bars)")

    ranges = [tuple(int(x) for x in r.split("-")) for r in a.bars.split(",")]
    segs = [(bar_time(s), bar_time(e)) for s, e in ranges]

    # ffmpeg: each later part starts XFADE early so the crossfade finishes on its downbeat
    parts, chain, label = [], "", "s0"
    for i, (s, e) in enumerate(segs):
        s0 = max(0.0, s - (XFADE if i else 0.0))
        parts.append(f"[0:a]atrim=start={s0:.5f}:end={e:.5f},asetpts=PTS-STARTPTS[s{i}]")
    for i in range(1, len(segs)):
        out = f"x{i}"
        chain += f";[{label}][s{i}]acrossfade=d={XFADE}:c1=qsin:c2=qsin[{out}]"
        label = out
    graph = ";".join(parts) + chain
    a.out.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run([str(FFMPEG), "-v", "error", "-y", "-i", str(a.track), "-filter_complex", graph, "-map", f"[{label}]", "-ar", "44100", str(a.out)], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(r.stderr[-2000:])

    # carry the beat grid and the hits across the splices
    grid, accents, offset, splices = [], [], 0.0, []
    for i, (s, e) in enumerate(segs):
        if i:
            splices.append(round(offset, 4))
        grid += [round(b - s + offset, 4) for b in beats if s - 1e-3 <= b < e - 1e-3]
        accents += [[round(x["t"] - s + offset, 3), x["v"]] for x in bm["accents"] if s - 0.03 <= x["t"] < e - 0.03]
        offset += e - s
    print(f"{a.track.name}: kept bars {a.bars} -> {offset:.2f}s, {len(grid)} beats, splices at {splices}")
    print(f"wrote {a.out}")

    if a.timeline:
        tl = json.loads(a.timeline.read_text(encoding="utf-8"))
        public = a.out.resolve().as_posix()
        tl["music"] = public.split("/public/", 1)[1] if "/public/" in public else a.out.name
        tl["bpm"] = bm["bpm"]
        tl["musicOffset"] = 0
        tl["edit"] = {"source": a.track.name, "bars": a.bars, "splices": splices, "length": round(offset, 3)}
        tl["grid"] = grid
        tl["accents"] = accents
        a.timeline.write_text(dump_timeline(tl), encoding="utf-8")
        print(f"beat grid written into {a.timeline}")


if __name__ == "__main__":
    main()
