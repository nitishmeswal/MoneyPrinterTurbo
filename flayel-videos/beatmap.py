"""Beat map for a launch-film track: real beat times, bar lines, sections, accents.

Music made by AI generators (Gemini, Suno, ...) often drifts or jumps phase
between the chunks it was stitched from, so a fixed BPM grid lands cuts off the
beat. This tracks every beat with dynamic programming (Ellis 2007), finds the
bar lines and the song's sections (intro, build, drop, breakdown, outro) and
the strongest hits, and writes a JSON the Remotion kit and polish.py both read.

    python flayel-videos/beatmap.py track.mp3 -o flayel-videos/motion/src/launch/recaphub.beats.json
    python flayel-videos/beatmap.py track.mp3 --png beatmap.png   # picture for review

Only numpy (and Pillow for --png) is needed; audio is decoded with the venv ffmpeg.
"""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
FFMPEG = HERE.parent / ".venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe"
SR, HOP, N = 22050, 64, 1024
FPS_ENV = SR / HOP


def load(path: Path) -> np.ndarray:
    raw = subprocess.run([str(FFMPEG), "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def spectra(x: np.ndarray):
    win = np.hanning(N)
    idx = np.arange(0, len(x) - N, HOP)
    frames = np.lib.stride_tricks.sliding_window_view(x, N)[::HOP][: len(idx)]
    M = np.abs(np.fft.rfft(frames * win, axis=1))
    t = (idx + N / 2) / SR
    return M, t, np.fft.rfftfreq(N, 1 / SR)


def onset_env(M: np.ndarray, band=slice(None)) -> np.ndarray:
    L = np.log1p(10 * M[:, band])
    f = np.concatenate([[0], np.maximum(0, np.diff(L, axis=0)).sum(axis=1)])
    f -= np.convolve(f, np.ones(64) / 64, mode="same")
    return np.maximum(f, 0)


def global_period(env: np.ndarray, lo=70, hi=180) -> float:
    """Beat period from the envelope's autocorrelation, folded into lo-hi BPM."""
    e = env - env.mean()
    ac = np.correlate(e, e, mode="full")[len(e) - 1 :]
    lags = np.arange(len(ac)) / FPS_ENV
    m = (lags > 60 / hi) & (lags < 60 / lo)
    i = np.argmax(ac[m])
    # parabolic refinement
    j = np.flatnonzero(m)[i]
    a, b, c = ac[j - 1], ac[j], ac[j + 1]
    off = 0.5 * (a - c) / (a - 2 * b + c) if (a - 2 * b + c) else 0
    return (j + off) / FPS_ENV


def track_beats(env: np.ndarray, t: np.ndarray, period: float, tight: float = 100) -> np.ndarray:
    """Dynamic-programming beat tracker: best path of onsets spaced about one period."""
    f = env / (env.std() + 1e-9)
    P = period * FPS_ENV
    lo, hi = int(P * 0.8), int(P * 1.25)
    score = f.copy()
    back = np.full(len(f), -1)
    for i in range(hi, len(f)):
        prev = np.arange(i - hi, i - lo)
        pen = -tight * np.log((i - prev) / P) ** 2
        j = np.argmax(score[prev] + pen)
        score[i] = f[i] + score[prev][j] + pen[j]
        back[i] = prev[j]
    i = int(np.argmax(score[-hi:]) + len(f) - hi)
    path = []
    while i >= 0:
        path.append(i)
        i = back[i]
    bt = t[np.array(path[::-1])]
    # extend back to the start of the song on the median period
    med = float(np.median(np.diff(bt)))
    while bt[0] - med > -0.02:
        bt = np.concatenate([[max(0.0, bt[0] - med)], bt])
    return bt


def band_db(M, m) -> np.ndarray:
    return 10 * np.log10((M[:, m] ** 2).sum(axis=1) + 1e-9)


def analyse(path: Path) -> dict:
    x = load(path)
    dur = len(x) / SR
    M, t, fr = spectra(x)
    env = onset_env(M)
    period = global_period(env)
    beats = track_beats(env, t, period)
    beats = beats[beats < dur - 0.05]

    loud = band_db(M, slice(None))
    hi = band_db(M, fr > 5000)
    low = band_db(M, fr < 150)
    clap = onset_env(M, (fr > 1500) & (fr < 6000))

    def mean_between(sig, a, b):
        m = (t >= a) & (t < b)
        return float(sig[m].mean()) if m.any() else float(sig.min())

    def peak_near(sig, tb, w=0.05):
        m = (t > tb - w) & (t < tb + w)
        return float(sig[m].max()) if m.any() else 0.0

    # downbeat: the phase (0-3) whose bar lines carry the biggest energy changes,
    # plus claps on beats 2 and 4
    beat_loud = np.array([mean_between(loud, beats[i], beats[i + 1]) for i in range(len(beats) - 1)])
    beat_clap = np.array([peak_near(clap, b) for b in beats[:-1]])
    jumps = np.abs(np.diff(beat_loud, prepend=beat_loud[0]))
    scores = []
    for o in range(4):
        on = np.arange(o, len(jumps), 4)
        back = np.concatenate([np.arange(o + 1, len(beat_clap), 4), np.arange(o + 3, len(beat_clap), 4)])
        scores.append(jumps[on].mean() / (jumps.mean() + 1e-9) + 0.5 * beat_clap[back].mean() / (beat_clap.mean() + 1e-9))
    down = int(np.argmax(scores))

    bar_idx = list(range(down, len(beats), 4))
    bar_t = [float(beats[i]) for i in bar_idx]
    bars = []
    for k, a in enumerate(bar_t):
        b = bar_t[k + 1] if k + 1 < len(bar_t) else dur
        bars.append({"t": round(a, 4), "loud": round(mean_between(loud, a, b), 1), "low": round(mean_between(low, a, b), 1), "hi": round(mean_between(hi, a, b), 1)})

    # sections: split where the bar loudness or brightness moves a lot
    top = max(b["loud"] for b in bars)
    sections = []
    for k, b in enumerate(bars):
        prev = bars[k - 1] if k else None
        cut = prev is None or abs(b["loud"] - prev["loud"]) > 4.5 or abs(b["hi"] - prev["hi"]) > 9
        if cut:
            sections.append({"bar": k, "t": b["t"], "bars": 0})
        sections[-1]["bars"] += 1
    for s in sections:
        span = bars[s["bar"] : s["bar"] + s["bars"]]
        s["loud"] = round(float(np.mean([b["loud"] for b in span])), 1)
        s["hi"] = round(float(np.mean([b["hi"] for b in span])), 1)
    for i, s in enumerate(sections):
        prev = sections[i - 1] if i else None
        nxt = sections[i + 1] if i + 1 < len(sections) else None
        rel = s["loud"] - top
        if rel < -30:
            s["kind"] = "silence" if i else "intro"
        elif i == 0:
            s["kind"] = "intro"
        elif nxt is None or (nxt["loud"] - top < -30 and rel < -8):
            s["kind"] = "outro"
        elif rel > -4 and prev and s["loud"] - prev["loud"] > 4:
            s["kind"] = "drop"
        elif rel > -4:
            s["kind"] = "groove"
        elif nxt and nxt["loud"] - s["loud"] > 4 and s["hi"] > (prev["hi"] if prev else -99):
            s["kind"] = "build"
        else:
            s["kind"] = "breakdown"

    # accents: the strongest onsets, with their position on the beat grid
    w = int(0.08 * FPS_ENV)
    from numpy.lib.stride_tricks import sliding_window_view as swv

    padded = np.pad(env, w)
    local_max = env >= swv(padded, 2 * w + 1).max(axis=1)
    cand = np.flatnonzero(local_max & (env > np.percentile(env, 99)))
    accents = []
    for i in cand:
        tb = float(t[i])
        k = int(np.searchsorted(beats, tb)) - 1
        if 0 <= k < len(beats) - 1:
            pos = (tb - beats[k]) / (beats[k + 1] - beats[k]) + k
        else:
            pos = float(k)
        accents.append({"t": round(tb, 3), "beat": round(pos, 2), "v": round(float(env[i] / env.max()), 2)})

    iv = np.diff(beats)
    return {
        "track": path.name,
        "duration": round(dur, 3),
        "bpm": round(60 / float(np.median(iv)), 2),
        "downbeat": down,
        "beats": [round(float(b), 4) for b in beats],
        "bars": bars,
        "sections": sections,
        "accents": accents,
    }


def picture(bm: dict, path: Path, png: Path) -> None:
    from PIL import Image, ImageDraw

    x = load(path)
    M, t, fr = spectra(x)
    env = onset_env(M)
    env = env / (np.percentile(env, 99.7) + 1e-9)
    loud = band_db(M, slice(None))
    rows, span = 6, bm["duration"] / 6
    Wd, Hr = 2400, 200
    img = Image.new("RGB", (Wd, Hr * rows), "white")
    d = ImageDraw.Draw(img)
    colors = {"intro": (235, 235, 245), "drop": (255, 222, 210), "groove": (255, 240, 225), "build": (225, 240, 255), "breakdown": (230, 245, 230), "outro": (240, 240, 240), "silence": (250, 250, 250)}
    ends = [s["t"] for s in bm["sections"][1:]] + [bm["duration"]]
    for r in range(rows):
        a, b = r * span, (r + 1) * span
        y0 = r * Hr
        X = lambda v: (v - a) / span * Wd
        for s, e in zip(bm["sections"], ends):
            if e > a and s["t"] < b:
                d.rectangle([X(max(a, s["t"])), y0, X(min(b, e)), y0 + Hr - 18], fill=colors[s["kind"]])
                if s["t"] >= a:
                    d.text((X(s["t"]) + 4, y0 + Hr - 34), s["kind"].upper(), fill=(90, 60, 60))
        for k, bt in enumerate(bm["beats"]):
            if a <= bt < b:
                bar = (k - bm["downbeat"]) % 4 == 0
                d.line([(X(bt), y0), (X(bt), y0 + Hr - 18)], fill=(200, 40, 40) if bar else (190, 190, 190), width=3 if bar else 1)
                if bar:
                    d.text((X(bt) + 3, y0 + 2), f"bar {(k - bm['downbeat']) // 4}", fill=(200, 40, 40))
        m = (t >= a) & (t < b)
        base = y0 + Hr - 18
        ln = (loud[m] - loud.max() + 50).clip(0, 50) / 50
        d.line(list(zip(X(t[m]), base - ln * (Hr - 40))), fill=(120, 120, 230), width=1)
        d.line(list(zip(X(t[m]), base - np.minimum(env[m], 1.2) * (Hr - 50))), fill=(0, 0, 0), width=1)
        for ac in bm["accents"]:
            if a <= ac["t"] < b:
                d.ellipse([X(ac["t"]) - 5, y0 + 14, X(ac["t"]) + 5, y0 + 24], fill=(255, 120, 0))
        s = int(a)
        while s < b:
            d.text((X(s) + 2, base + 3), f"{s}s", fill=(80, 80, 80))
            s += 1
    img.save(png)


def dump_timeline(tl: dict) -> str:
    """Timeline JSON with one scene per line and the number lists kept on one line."""
    lines = ["{"]
    keys = list(tl)
    for i, k in enumerate(keys):
        v = tl[k]
        end = "," if i < len(keys) - 1 else ""
        if k == "scenes":
            lines.append('  "scenes": [')
            lines += [f"    {json.dumps(s)}{',' if j < len(v) - 1 else ''}" for j, s in enumerate(v)]
            lines.append(f"  ]{end}")
        else:
            lines.append(f"  {json.dumps(k)}: {json.dumps(v)}{end}")
    return "\n".join(lines + ["}"]) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track", type=Path)
    ap.add_argument("-o", "--out", type=Path, help="write the beat map JSON here")
    ap.add_argument("--png", type=Path, help="draw the beat map (bar lines, sections, accents)")
    ap.add_argument("--timeline", type=Path, help="write the beat grid and accents into this film timeline JSON (scenes are kept)")
    a = ap.parse_args()
    bm = analyse(a.track)
    if a.timeline:
        tl = json.loads(a.timeline.read_text(encoding="utf-8"))
        tl["grid"] = bm["beats"]
        tl["accents"] = [[x["t"], x["v"]] for x in bm["accents"]]
        tl["musicOffset"] = bm["beats"][0]  # beat 0 lands on film frame 0
        tl["bpm"] = bm["bpm"]
        a.timeline.write_text(dump_timeline(tl), encoding="utf-8")
        print(f"beat grid written into {a.timeline}")
    print(f"{bm['track']}: {bm['duration']:.1f}s, {bm['bpm']} BPM, {len(bm['beats'])} beats, downbeat at beat {bm['downbeat']}")
    for s in bm["sections"]:
        print(f"  bar {s['bar']:3d}  {s['t']:6.2f}s  {s['bars']:2d} bars  {s['kind']:9s} loud {s['loud']:5.1f}  hi {s['hi']:5.1f}")
    print("  accents:", " ".join(f"{x['t']:.2f}@{x['beat']:.2f}" for x in bm["accents"]))
    if a.out:
        a.out.write_text(json.dumps(bm, indent=1), encoding="utf-8")
        print(f"wrote {a.out}")
    if a.png:
        picture(bm, a.track, a.png)
        print(f"drew {a.png}")


if __name__ == "__main__":
    main()
