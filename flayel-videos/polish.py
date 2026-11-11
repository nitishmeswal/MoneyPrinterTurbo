"""Final polish in EffectCraft (the open-source After Effects-style compositor).

Takes a raw Remotion render and its beat timeline (motion/src/launch/<film>.json),
builds an EffectCraft project and renders the finished film:

  1. the Remotion render (with its audio)
  2. "Sweep": a radial light sweep in Screen mode, keyed across every `leak` cue
  3. "Finish": an adjustment layer with an exposure flash keyed on every `flash`
     cue, an S-curve, sharpening, optional glow, a soft vignette and film grain

The .ecproj is saved next to the output, so the polish can be opened and
tweaked in EffectCraft's interface like an After Effects project.

    python flayel-videos/polish.py flayel     # -> out/launch/flayel-launch.mp4
    python flayel-videos/polish.py recaphub
    python flayel-videos/polish.py flayel --frame 21.2   # one polished still, for review
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
EC = HERE / "effectcraft-bin" / "effectcraft-0.21.0-windows-x64-portable" / "effectcraft-cli.exe"
OUT = HERE / "out" / "launch"

# Per-brand finishing. Flayel: cream stage, warm brand light, a touch of bloom.
# RecapHub: editorial restraint (its DESIGN.md bans glow), paper grain, softer hits.
LOOKS = {
    "flayel": {
        "timeline": HERE / "motion" / "src" / "launch" / "flayel.json",
        "sweep": [1.0, 0.86, 0.62, 1.0],  # warm gold light
        "sweep_peak": 38,
        "flash": 0.32,
        "curve": "0,0 0.25,0.235 0.75,0.775 1,1",
        "glow": {"threshold": 93, "radius": 28, "intensity": 0.22},
        "vignette": 16,
        "grain": 0.22,
        "sharpen": 35,
    },
    "recaphub": {
        "timeline": HERE / "motion" / "src" / "launch" / "recaphub.json",
        "sweep": [1.0, 0.97, 0.92, 1.0],  # warm paper white
        "sweep_peak": 22,
        "flash": 0.18,
        "curve": "0,0 0.25,0.24 0.75,0.765 1,1",
        "glow": None,
        "vignette": 12,
        "grain": 0.3,
        "sharpen": 30,
    },
}
OVER = 0.42  # transition overlap in the Remotion kit (kit.tsx OVER)
LEAD = {"zoom": 0.12, "push": 0.21, "whip": 0.21, "cut": 0.0, "end": 0.0, "none": 0.0}  # kit.tsx LEAD


def beat_time(tl: dict, b: float) -> float:
    """Film time of a beat: the track's beat map when the timeline has one (kit.tsx beatTime)."""
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


def start_beat(s: dict) -> float:
    return s.get("beat", s.get("bar", 0) * 4)


def len_beats(s: dict) -> float:
    return s.get("beats", s.get("bars", 0) * 4)


def cues(tl: dict) -> tuple[list[float], list[float], float]:
    """Flash times (on the beat) and light-sweep times (with the transition, which may start early)."""
    flashes, leaks = [], []
    for i, s in enumerate(tl["scenes"]):
        t = beat_time(tl, start_beat(s))
        enter = tl["scenes"][i - 1]["exit"] if i else "none"
        lead = LEAD[enter] if tl.get("lead") else 0.0
        if s.get("cue") == "flash":
            flashes.append(t)
        elif s.get("cue") == "leak":
            leaks.append(t - lead)
    flashes += [beat_time(tl, b) for b in tl.get("flashBeats", [])]
    last = tl["scenes"][-1]
    total = beat_time(tl, start_beat(last) + len_beats(last)) + tl["tail"]
    return sorted(flashes), leaks, total


def steps_for(film: str, raw: Path) -> tuple[list[dict], float]:
    look = LOOKS[film]
    tl = json.loads(look["timeline"].read_text(encoding="utf-8"))
    flashes, leaks, total = cues(tl)

    def setp(layer: str, path: str, value) -> dict:
        return {"command": "prop.set", "params": {"layer": layer, "path": path, "value": value}}

    def key(layer: str, path: str, t: float, value) -> dict:
        return {"command": "prop.addKey", "params": {"layer": layer, "path": path, "time": round(max(0.0, min(total, t)), 4), "timeBase": "comp", "value": value}}

    s: list[dict] = [
        {"command": "comp.new", "params": {"name": "Polish", "width": 1920, "height": 1080, "frameRate": 30, "duration": round(total, 3)}},
        {"command": "file.import", "params": {"paths": [str(raw)], "addToComp": True}},
        # light sweep
        {"command": "layer.newSolid", "params": {"name": "Sweep", "color": "#000000", "width": 1920, "height": 1080}},
        {"command": "effect.apply", "params": {"layers": ["Sweep"], "effect": "Gradient Ramp"}},
        setp("Sweep", "effects/#1/shape", 1),
        setp("Sweep", "effects/#1/startColor", look["sweep"]),
        setp("Sweep", "effects/#1/endColor", [0.0, 0.0, 0.0, 1.0]),
        {"command": "layer.setBlendMode", "params": {"layers": ["Sweep"], "mode": "Screen"}},
        key("Sweep", "transform/opacity", 0, 0),
    ]
    for i, t in enumerate(leaks):
        a, b = t - 0.15, t + OVER + 0.35
        left = i % 2 == 0
        s += [
            key("Sweep", "transform/opacity", a, 0),
            key("Sweep", "transform/opacity", t + OVER * 0.5, look["sweep_peak"]),
            key("Sweep", "transform/opacity", b, 0),
            key("Sweep", "effects/#1/start", a, [0.05, 0.25] if left else [0.95, 0.75]),
            key("Sweep", "effects/#1/start", b, [0.95, 0.6] if left else [0.05, 0.4]),
            key("Sweep", "effects/#1/end", a, [0.55, 0.85] if left else [0.45, 0.15]),
            key("Sweep", "effects/#1/end", b, [1.45, 1.2] if left else [-0.45, -0.2]),
        ]

    # finishing adjustment layer
    s += [
        {"command": "layer.newAdjustment", "params": {"name": "Finish"}},
        {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "Exposure"}},
        key("Finish", "effects/#1/master/exposure", 0, 0),
    ]
    for t in flashes:
        s += [
            key("Finish", "effects/#1/master/exposure", t - 0.05, 0),
            key("Finish", "effects/#1/master/exposure", t + 0.02, look["flash"]),
            key("Finish", "effects/#1/master/exposure", t + 0.3, 0),
        ]
    n = 2
    s += [
        {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "Curves"}},
        setp("Finish", f"effects/#{n}/rgb", look["curve"]),
        {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "Unsharp Mask"}},
        setp("Finish", f"effects/#{n + 1}/amount", look["sharpen"]),
        setp("Finish", f"effects/#{n + 1}/radius", 1.2),
    ]
    n += 2
    if look["glow"]:
        g = look["glow"]
        s += [
            {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "Glow"}},
            setp("Finish", f"effects/#{n}/threshold", g["threshold"]),
            setp("Finish", f"effects/#{n}/radius", g["radius"]),
            setp("Finish", f"effects/#{n}/intensity", g["intensity"]),
        ]
        n += 1
    s += [
        {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "CC Vignette"}},
        setp("Finish", f"effects/#{n}/amount", look["vignette"]),
        {"command": "effect.apply", "params": {"layers": ["Finish"], "effect": "Add Grain"}},
        setp("Finish", f"effects/#{n + 1}/preset", 1),  # Fine 35mm
        setp("Finish", f"effects/#{n + 1}/tweaking/intensity", look["grain"]),
        setp("Finish", f"effects/#{n + 1}/tweaking/size", 0.9),
    ]
    return s, total


def run(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run([str(EC), *args], capture_output=True, text=True, encoding="utf-8", errors="replace")


# The bundled songs are mastered quiet (about -27 dB mean), so the finished
# film's audio is loudness-normalised to the web standard; video is copied as is.
FFMPEG = HERE.parent / ".venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe"


def master_audio(video: Path) -> None:
    tmp = video.with_suffix(".mastering.mp4")
    r = subprocess.run(
        [str(FFMPEG), "-v", "error", "-y", "-i", str(video), "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", str(tmp)],
        capture_output=True, text=True, errors="replace",
    )
    if r.returncode:
        sys.exit(f"audio mastering failed: {r.stderr[-1500:]}")
    tmp.replace(video)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("film", choices=sorted(LOOKS))
    ap.add_argument("--raw", type=Path, help="Remotion render (default out/launch/<film>-raw.mp4)")
    ap.add_argument("--frame", type=float, help="render one polished still at this second instead of the film")
    a = ap.parse_args()

    raw = (a.raw or OUT / f"{a.film}-raw.mp4").resolve()
    if not raw.exists():
        sys.exit(f"missing {raw}: render it first (npx remotion render src/index.ts ...)")
    OUT.mkdir(parents=True, exist_ok=True)
    steps, total = steps_for(a.film, raw)
    steps_file = OUT / f"{a.film}-polish.steps.json"
    steps_file.write_text(json.dumps(steps, indent=1), encoding="utf-8")
    proj = OUT / f"{a.film}-launch.ecproj"

    r = run(["run", "--commands", str(steps_file), "--empty", "--save-as", str(proj), "--json"])
    if r.returncode:
        sys.exit(f"building the EffectCraft project failed:\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}")
    print(f"project  {proj}  ({len(steps)} commands)")

    if a.frame is not None:
        png = OUT / f"{a.film}-polish-{a.frame:05.1f}.png"
        r = run(["render-frame", "--project", str(proj), "--comp", "Polish", "--time", str(a.frame), "--out", str(png)])
        print(r.stdout.strip() or r.stderr.strip())
        return

    final = OUT / f"{a.film}-launch.mp4"
    t0 = time.time()
    r = run(["render", "--project", str(proj), "--comp", "Polish", "--out", str(final), "--format", "h264", "--bitrate", "22000", "--audio", "on", "--quality", "best"])
    if r.returncode:
        sys.exit(f"render failed:\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}")
    master_audio(final)
    print(f"rendered {final}  {total:.1f}s of film in {time.time() - t0:.0f}s (audio mastered to -14 LUFS)")


if __name__ == "__main__":
    main()
