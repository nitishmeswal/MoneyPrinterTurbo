"""Finishing pass for the RecapHub films in EffectCraft (an After Effects-style compositor).

Takes a raw Remotion render (out/<film>-raw.mp4) and its beat timeline
(motion/src/recaphub-<film>.json) and renders the finished film:

  1. the Remotion render, with its audio
  2. "Sweep": a soft warm-paper light sweep, keyed on every `leak` cue
  3. "Finish": an exposure hit on every `flash` cue, a gentle S-curve,
     sharpening, a soft vignette and fine grain (RecapHub's DESIGN.md bans glow)

The audio is then mastered to -16 LUFS: clear and punchy, but not loud.
The .ecproj is saved next to the output, so it opens in EffectCraft for tweaks.

    python recaphub-videos/polish.py teaser            # -> out/recaphub-teaser.mp4
    python recaphub-videos/polish.py shorts
    python recaphub-videos/polish.py story
    python recaphub-videos/polish.py teaser --frame 6  # one polished still, for review
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
EC = ROOT / "flayel-videos" / "effectcraft-bin" / "effectcraft-0.21.0-windows-x64-portable" / "effectcraft-cli.exe"
FFMPEG = ROOT / ".venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe"
OUT = HERE / "out"
LUFS = -16

LOOK = {
    "sweep": [1.0, 0.97, 0.92, 1.0],  # warm paper white
    "sweep_peak": 22,
    "flash": 0.18,
    "curve": "0,0 0.25,0.24 0.75,0.765 1,1",
    "vignette": 12,
    "grain": 0.28,
    "sharpen": 30,
}
FILMS = ("teaser", "shorts", "story", "pages", "press", "intel", "mcp", "live", "drive", "analytics", "publish")
OVER = 0.42  # transition overlap in kit.tsx (OVER)
LEAD = {"zoom": 0.12, "push": 0.21, "whip": 0.21, "cut": 0.0, "end": 0.0, "none": 0.0}  # kit.tsx LEAD


def beat_time(tl: dict, b: float) -> float:
    g = tl.get("grid")
    if not g or len(g) < 2:
        return b * 60 / tl["bpm"]
    n = len(g)
    if b <= 0:
        x = g[0] + b * (g[1] - g[0])
    elif b >= n - 1:
        x = g[-1] + (b - (n - 1)) * (g[-1] - g[-2])
    else:
        i = int(b)
        x = g[i] + (b - i) * (g[i + 1] - g[i])
    return x - tl["musicOffset"]


def cues(tl: dict) -> tuple[list[float], list[float], float]:
    flashes, leaks = [], []
    for i, s in enumerate(tl["scenes"]):
        t = beat_time(tl, s["beat"])
        enter = tl["scenes"][i - 1]["exit"] if i else "none"
        lead = LEAD[enter] if tl.get("lead") else 0.0
        if s.get("cue") == "flash":
            flashes.append(t)
        elif s.get("cue") == "leak":
            leaks.append(t - lead)
    flashes += [beat_time(tl, b) for b in tl.get("flashBeats", [])]
    last = tl["scenes"][-1]
    total = beat_time(tl, last["beat"] + last["beats"]) + tl["tail"]
    return sorted(flashes), leaks, total


def steps_for(film: str, raw: Path) -> tuple[list[dict], float]:
    tl = json.loads((HERE / "motion" / "src" / f"recaphub-{film}.json").read_text(encoding="utf-8"))
    flashes, leaks, total = cues(tl)

    def setp(layer: str, path: str, value) -> dict:
        return {"command": "prop.set", "params": {"layer": layer, "path": path, "value": value}}

    def key(layer: str, path: str, t: float, value) -> dict:
        return {"command": "prop.addKey", "params": {"layer": layer, "path": path, "time": round(max(0.0, min(total, t)), 4), "timeBase": "comp", "value": value}}

    s: list[dict] = [
        {"command": "comp.new", "params": {"name": "Polish", "width": 1920, "height": 1080, "frameRate": 30, "duration": round(total, 3)}},
        {"command": "file.import", "params": {"paths": [str(raw)], "addToComp": True}},
        {"command": "layer.newSolid", "params": {"name": "Sweep", "color": "#000000", "width": 1920, "height": 1080}},
        {"command": "effect.apply", "params": {"layers": ["Sweep"], "effect": "Gradient Ramp"}},
        setp("Sweep", "effects/#1/shape", 1),
        setp("Sweep", "effects/#1/startColor", LOOK["sweep"]),
        setp("Sweep", "effects/#1/endColor", [0.0, 0.0, 0.0, 1.0]),
        {"command": "layer.setBlendMode", "params": {"layers": ["Sweep"], "mode": "Screen"}},
        key("Sweep", "transform/opacity", 0, 0),
    ]
    for i, t in enumerate(leaks):
        a, b = t - 0.15, t + OVER + 0.35
        left = i % 2 == 0
        s += [
            key("Sweep", "transform/opacity", a, 0),
            key("Sweep", "transform/opacity", t + OVER * 0.5, LOOK["sweep_peak"]),
            key("Sweep", "transform/opacity", b, 0),
            key("Sweep", "effects/#1/start", a, [0.05, 0.25] if left else [0.95, 0.75]),
            key("Sweep", "effects/#1/start", b, [0.95, 0.6] if left else [0.05, 0.4]),
            key("Sweep", "effects/#1/end", a, [0.55, 0.85] if left else [0.45, 0.15]),
            key("Sweep", "effects/#1/end", b, [1.45, 1.2] if left else [-0.45, -0.2]),
        ]
    s += [
        {"command": "layer.newAdjustment", "params": {"name": "Finish"}},
        {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "Exposure"}},
        key("Finish", "effects/#1/master/exposure", 0, 0),
    ]
    for t in flashes:
        s += [
            key("Finish", "effects/#1/master/exposure", t - 0.05, 0),
            key("Finish", "effects/#1/master/exposure", t + 0.02, LOOK["flash"]),
            key("Finish", "effects/#1/master/exposure", t + 0.3, 0),
        ]
    s += [
        {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "Curves"}},
        setp("Finish", "effects/#2/rgb", LOOK["curve"]),
        {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "Unsharp Mask"}},
        setp("Finish", "effects/#3/amount", LOOK["sharpen"]),
        setp("Finish", "effects/#3/radius", 1.2),
        {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "CC Vignette"}},
        setp("Finish", "effects/#4/amount", LOOK["vignette"]),
        {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "Add Grain"}},
        setp("Finish", "effects/#5/preset", 1),
        setp("Finish", "effects/#5/tweaking/intensity", LOOK["grain"]),
        setp("Finish", "effects/#5/tweaking/size", 0.9),
    ]
    return s, total


def run(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run([str(EC), *args], capture_output=True, text=True, encoding="utf-8", errors="replace")


def master_audio(video: Path) -> None:
    tmp = video.with_suffix(".mastering.mp4")
    r = subprocess.run(
        [str(FFMPEG), "-v", "error", "-y", "-i", str(video), "-c:v", "copy", "-af", f"loudnorm=I={LUFS}:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", str(tmp)],
        capture_output=True, text=True, errors="replace",
    )
    if r.returncode:
        sys.exit(f"audio mastering failed: {r.stderr[-1500:]}")
    tmp.replace(video)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("film", choices=FILMS)
    ap.add_argument("--frame", type=float, help="render one polished still at this second instead of the film")
    a = ap.parse_args()

    raw = (OUT / f"{a.film}-raw.mp4").resolve()
    if not raw.exists():
        sys.exit(f"missing {raw}: render it first (npx remotion render src/index.ts ...)")
    steps, total = steps_for(a.film, raw)
    steps_file = OUT / f"{a.film}-polish.steps.json"
    steps_file.write_text(json.dumps(steps, indent=1), encoding="utf-8")
    proj = OUT / f"recaphub-{a.film}.ecproj"
    r = run(["run", "--commands", str(steps_file), "--empty", "--save-as", str(proj), "--json"])
    if r.returncode:
        sys.exit(f"building the EffectCraft project failed:\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}")
    print(f"project  {proj}  ({len(steps)} commands)")

    if a.frame is not None:
        png = OUT / f"{a.film}-polish-{a.frame:05.1f}.png"
        r = run(["render-frame", "--project", str(proj), "--comp", "Polish", "--time", str(a.frame), "--out", str(png)])
        print(r.stdout.strip() or r.stderr.strip())
        return

    final = OUT / f"recaphub-{a.film}.mp4"
    t0 = time.time()
    r = run(["render", "--project", str(proj), "--comp", "Polish", "--out", str(final), "--format", "h264", "--bitrate", "22000", "--audio", "on", "--quality", "best"])
    if r.returncode:
        sys.exit(f"render failed:\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}")
    master_audio(final)
    print(f"rendered {final}  {total:.1f}s of film in {time.time() - t0:.0f}s (audio mastered to {LUFS} LUFS)")


if __name__ == "__main__":
    main()
