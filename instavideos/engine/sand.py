"""Sand engine: "Which cup fills first?" - falling sand through a peg field into cups.

    python instavideos/engine/sand.py g27-sand-fill            # search seeds, write the best
    python instavideos/engine/sand.py g27-sand-fill --seed 5   # write one seed

A cellular automaton on a 6 px grid, 4 steps per 60 fps frame. Each step a
grain falls one cell if the cell below is empty, else slides one cell
diagonally (left or right, chosen at random from the seed) if that is empty.
Pegs and cup walls are solid cells. A spout sweeps across the top. The first
cup to reach `full` of its capacity wins; nothing is ever edited, the seed is
the only curation (same as the sim engine).

Output: data/<id>.json (geometry, spout path, cup fills per frame, result),
frames/<id>/0000.png ... (the sand layer, one small indexed PNG per frame) and
audio/<id>.wav.
"""

from __future__ import annotations

import argparse
import math
import shutil
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import audio as A  # noqa: E402
from common import AUDIO, FPS, PUBLIC, load_spec, write_data  # noqa: E402

STEPS = 4
FRAMES = PUBLIC / "frames"
X0, Y0, CELL, COLS, ROWS = 72, 470, 6, 134, 150


class Sand:
    def __init__(self, spec: dict, seed: int, frames: int):
        r = spec["rules"]
        self.spec, self.frames = spec, frames
        self.rng = np.random.default_rng(seed)
        g = np.zeros((ROWS, COLS), dtype=np.int16)
        g[:, 0] = g[:, -1] = -1
        g[-1, :] = -1
        # cups along the bottom
        n = int(r.get("cups", 4))
        self.cup_top = int(r.get("cupTop", 96))
        edges = [round(1 + k * (COLS - 2) / n) for k in range(n + 1)]
        edges[-1] = COLS - 1
        self.walls = edges[1:-1]
        for c in self.walls:
            g[self.cup_top:, c] = -1
        self.cups = [(edges[k] + (1 if k else 0), edges[k + 1] - 1) for k in range(n)]  # interior cols, inclusive
        self.cap = [(b - a + 1) * (ROWS - 1 - self.cup_top) for a, b in self.cups]
        # staggered pegs (2 x 2 cells)
        self.pegs = []
        rows_ = r.get("pegRows", [20, 30, 40, 50, 60, 70, 80])
        dx = int(r.get("pegDx", 14))
        for k, pr in enumerate(rows_):
            off = (dx // 2) * (k % 2)
            for c in range(4 + off, COLS - 4, dx):
                g[pr : pr + 2, c : c + 2] = -1
                self.pegs.append((c, pr))
        self.g = g
        self.rate = float(r.get("rate", 0.85))
        self.band = float(r.get("band", 1.6))
        self.ncol = int(r.get("colours", 6))
        self.full = float(r.get("full", 0.86))
        # spout sweep: seed sets the phase and period (the viewer sees the spout move)
        self.amp = float(r.get("sweep", 22))
        self.period = float(self.rng.uniform(*r.get("period", [6.0, 10.0])))
        self.phase = float(self.rng.uniform(0, 2 * math.pi))
        self.spout: list[float] = []
        self.fills: list[list[float]] = []
        self.result = None
        self.events: list[dict] = []
        self.snap: list[np.ndarray] | None = None

    def spout_col(self, t: float) -> float:
        return COLS / 2 + self.amp * math.sin(2 * math.pi * t / self.period + self.phase)

    def step(self, t: float, pour: bool):
        g = self.g
        rng = self.rng
        if pour and rng.random() < self.rate:
            c = int(round(self.spout_col(t) + rng.integers(-1, 2)))
            if g[0, c] == 0:
                g[0, c] = 1 + int(t / self.band) % self.ncol
        # fall straight down
        sand = g[:-1] > 0
        mv = sand & (g[1:] == 0)
        g[1:][mv] = g[:-1][mv]
        g[:-1][mv] = 0
        # slide diagonally: a random half try left first this step, the rest right
        left = rng.random((ROWS - 1, COLS)) < 0.5
        for go_left in (True, False):
            sand = g[:-1] > 0
            blocked = g[1:] != 0
            if go_left:
                tgt = np.zeros_like(sand)
                tgt[:, 1:] = (g[1:, :-1] == 0) & (g[:-1, :-1] == 0)
                mv = sand & blocked & tgt & left
                src = np.argwhere(mv)
                g[src[:, 0] + 1, src[:, 1] - 1] = g[src[:, 0], src[:, 1]]
            else:
                tgt = np.zeros_like(sand)
                tgt[:, :-1] = (g[1:, 1:] == 0) & (g[:-1, 1:] == 0)
                mv = sand & blocked & tgt & ~left
                src = np.argwhere(mv)
                g[src[:, 0] + 1, src[:, 1] + 1] = g[src[:, 0], src[:, 1]]
            g[src[:, 0], src[:, 1]] = 0

    def fill(self) -> list[float]:
        body = self.g[self.cup_top : ROWS - 1]
        return [float((body[:, a : b + 1] > 0).sum()) / cap for (a, b), cap in zip(self.cups, self.cap)]

    def run(self, keep: bool = False, timer_frac: float = 0.999):
        if keep:
            self.snap = []
        stop_pour = None
        marks = [set() for _ in self.cups]
        for f in range(self.frames):
            t0 = f / FPS
            for s in range(STEPS):
                self.step(t0 + s / (FPS * STEPS), stop_pour is None or f < stop_pour)
            fl = self.fill()
            self.fills.append([round(x, 3) for x in fl])
            self.spout.append(round(self.spout_col(t0), 2))
            for k, x in enumerate(fl):
                for m in (0.25, 0.5, 0.75):
                    if x >= m and m not in marks[k]:
                        marks[k].add(m)
                        self.events.append({"f": f, "type": "mark", "cup": k, "m": m})
            if self.result is None:
                best = max(range(len(fl)), key=lambda k: fl[k])
                if fl[best] >= self.full:
                    self.result = {"f": f, "outcome": "cup", "winner": best, "fills": [round(x, 3) for x in fl]}
                    stop_pour = f + 20
                elif f >= int(self.frames * timer_frac):
                    self.result = {"f": f, "outcome": "cup", "winner": best, "fills": [round(x, 3) for x in fl], "reason": "timer"}
                    stop_pour = f + 20
            if keep:
                self.snap.append(self.g.copy())
        return self


def frames_for(spec):
    return int(spec.get("maxSec", 40) * FPS)


def score(spec, s: Sand):
    r = s.result
    if r is None or r.get("reason"):
        return None
    total = r["f"] / spec.get("target", 0.86)
    if not (spec.get("minSec", 22) * FPS <= total <= spec.get("maxSec", 40) * FPS):
        return None
    fl = sorted(r["fills"], reverse=True)
    lead, leader = 0, None
    for f, row in enumerate(s.fills[: r["f"]]):
        if f % 15:
            continue
        top = max(range(len(row)), key=lambda k: row[k])
        if leader is not None and top != leader and f > 0.4 * r["f"] and row[top] > 0.2:
            lead += 1
        leader = top
    close = fl[1] / fl[0]
    sc = min(lead, 6) * 3 + close * 10 - abs(total / FPS - spec.get("idealSec", 30)) * 0.3
    return sc, {"lead": lead, "close": round(close, 2), "sec": round(total / FPS, 1)}


def _try(args):
    spec, seed = args
    s = Sand(spec, seed, frames_for(spec)).run()
    sc = score(spec, s)
    return (seed, sc) if sc else None


def search(spec, workers: int = 10):
    seeds = range(spec.get("seed0", 1), spec.get("seed0", 1) + spec.get("seeds", 60))
    with ProcessPoolExecutor(workers) as ex:
        res = [x for x in ex.map(_try, [(spec, s) for s in seeds]) if x]
    res.sort(key=lambda x: -x[1][0])
    return [(s, sc[0], sc[1]) for s, sc in res]


def build(spec: dict, seed: int, meta: dict | None = None):
    from PIL import Image

    s0 = Sand(spec, seed, frames_for(spec)).run()
    total = int(round(s0.result["f"] / spec.get("target", 0.86)))
    s = Sand(spec, seed, total).run(keep=True)
    pal_hex = spec["palette"]
    pal = [0, 0, 0]
    for h in pal_hex:
        pal += [int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)]
    pal += [0, 0, 0] * (256 - len(pal) // 3)
    out = FRAMES / spec["id"]
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    for f, g in enumerate(s.snap):
        im = Image.fromarray(np.clip(g, 0, 255).astype(np.uint8), "P")
        im.putpalette(pal)
        im.save(out / f"{f:04d}.png", transparency=0)
    data = {
        "id": spec["id"], "engine": "sand", "spec": {k: v for k, v in spec.items() if k != "rules"}, "fps": FPS, "frames": total, "seed": seed, "meta": meta or {},
        "full": s.full, "grid": {"x0": X0, "y0": Y0, "cell": CELL, "cols": COLS, "rows": ROWS},
        "pegs": s.pegs, "walls": s.walls, "cupTop": s.cup_top, "cups": s.cups,
        "spout": s.spout, "fills": s.fills, "events": s.events, "result": s.result,
    }
    write_data(spec["id"], data)
    sound(spec, data)
    return data


def _hiss(seconds: float, seed: int) -> np.ndarray:
    n = int(A.SR * seconds)
    x = np.random.default_rng(seed).standard_normal(n)
    # cheap band-limited hiss: difference of two moving averages
    k1, k2 = 3, 40
    c = np.cumsum(np.concatenate([[0], x]))
    a = (c[k1:] - c[:-k1])[: n - k2] / k1
    b = (c[k2:] - c[:-k2])[: n - k2] / k2
    y = a - b
    t = np.arange(len(y)) / A.SR
    y *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * t)
    return y / (np.max(np.abs(y)) or 1)


def sound(spec: dict, data: dict):
    sec = data["frames"] / FPS
    mix = A.Mix(sec)
    res = data["result"]
    hit = res["f"] / FPS
    m = spec.get("music", {})
    A.music_bed(mix, sec, bpm=m.get("bpm", 92), root=m.get("root", 50), mode=m.get("mode", "major"), hit=hit, gain=m.get("gain", 0.24), style=m.get("style", "soft"), seed=spec.get("musicSeed", 3))
    pour = _hiss(hit + 0.4, 7)
    fade = np.minimum(1, np.arange(len(pour)) / (0.3 * A.SR)) * np.minimum(1, (len(pour) - np.arange(len(pour))) / (0.3 * A.SR))
    mix.add(pour * fade, 0.0, 0.16, 0.0, limit=False)
    ncup = len(data["cups"])
    for e in data["events"]:
        t = e["f"] / FPS
        pan = (e["cup"] - (ncup - 1) / 2) / max(1, ncup) * 1.2
        if e["type"] == "mark" and e["f"] <= res["f"]:
            mix.add(A.tone("bell", 72 + A.PENTA[e["cup"] % 5] + int(e["m"] * 16)), t, 0.22 + e["m"] * 0.2, pan)
    # soft grain ticks while pouring
    rng = np.random.default_rng(5)
    t = 0.2
    while t < hit:
        mix.add(A.fx("tick", int(rng.integers(0, 3))), t, 0.05, float(rng.uniform(-0.5, 0.5)))
        t += float(rng.uniform(0.06, 0.16))
    mix.add(A.sting(m.get("root", 50) + 12, 3), hit, 0.7)
    mix.write(AUDIO / f"{spec['id']}.wav", sec)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="+")
    ap.add_argument("--seed", type=int)
    a = ap.parse_args()
    for vid in a.ids:
        spec = load_spec(vid)
        if a.seed is not None:
            d = build(spec, a.seed)
        else:
            top = search(spec)
            if not top:
                raise SystemExit(f"{vid}: no seed met the rules")
            for s_, sc, m_ in top[:5]:
                print(f"  {vid} seed {s_:4d} score {sc:6.2f} {m_}")
            d = build(spec, top[0][0], {"score": round(top[0][1], 2), **top[0][2]})
        print(f"{vid}: {d['frames'] / FPS:.1f}s result {d['result']}")


if __name__ == "__main__":
    main()
