"""Sim engine: search seeds for drama, write the frames for Remotion and the sound track.

    python instavideos/engine/run_sim.py a01-break-out          # search, print top 5, write the best
    python instavideos/engine/run_sim.py a01-break-out --seed 17 # write one seed

Drama score: the outcome lands late (between `lo` and `hi` of the video), many
near-misses before it, lead changes in races and paint wars, no dull stretch
over 2 s. Seed choice is the only curation: the sim is never edited.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import audio as A  # noqa: E402
from common import AUDIO, DATA, FPS, load_spec, write_data  # noqa: E402
from sim import World  # noqa: E402

ACTION = ("bounce", "collide", "catch", "escape", "paint", "brick", "lit")


def frames_for(spec: dict) -> int:
    d = spec["durationSec"]
    return int((spec.get("maxSec", 45) if d == "auto" else d) * FPS)


def simulate(spec: dict, seed: int, frames: int | None = None) -> World:
    frames = frames or frames_for(spec)
    timer = 0.999 if spec["durationSec"] == "auto" else spec.get("timerFrac", 0.86)
    return World(spec["rules"], seed, frames).run(timer_frac=timer)


def score(spec: dict, w: World) -> tuple[float, dict] | None:
    r = w.result
    if r is None:
        return None
    rf = r["f"]
    auto = spec["durationSec"] == "auto"
    total = rf / spec.get("target", 0.86) if auto else w.frames
    if auto and not (spec.get("minSec", 20) * FPS <= total <= spec.get("maxSec", 45) * FPS):
        return None
    rho = rf / total
    lo, hi = spec.get("window", [0.78, 0.93])
    if not auto and not (lo <= rho <= hi):
        return None
    want = spec.get("prefer", {})
    for k, v in want.items():
        if r.get(k) != v:
            return None
    if spec["rules"].get("win") == "duels" and r.get("outcome") != "duels":
        return None
    ev = w.events
    near = sum(1 for e in ev if e["type"] == "near" and 0.45 * rf <= e["f"] < rf)
    times = sorted({e["f"] for e in ev if e["type"] in ACTION and e["f"] <= rf})
    quiet = max((b - a for a, b in zip([0] + times, times + [rf])), default=rf) / FPS
    lead = 0
    if r.get("outcome") == "paint":
        counts, leader = {}, None
        for e in ev:
            if e["type"] == "paint":
                counts[e["owner"]] = counts.get(e["owner"], 0) + 1
                prev = e.get("prev")
                if prev is not None and prev >= 0:
                    counts[prev] -= 1
                top = max(counts, key=counts.get)
                if leader is not None and top != leader and e["f"] > 0.4 * rf:
                    lead += 1
                leader = top
    pr = spec.get("pctRange")
    if pr and not (pr[0] <= r.get("pct", -1) <= pr[1]):
        return None
    if r.get("outcome") == "mix" and w.grid is not None:
        leader = None
        for k, c in enumerate(w.grid["track"]):
            c = {m: v for m, v in c.items() if m > 0}
            if not c:
                continue
            top = max(c, key=c.get)
            if leader is not None and top != leader and k * 30 > 0.4 * rf:
                lead += 1
            leader = top
        if spec.get("mixWinner") == "mixed" and bin(r.get("mask", 1)).count("1") < 2:
            return None
    if r.get("outcome") == "battle":
        pops = sorted(e["f"] for e in ev if e["type"] == "pop")
        lead += 2 if r.get("hp", 99) <= spec.get("closeHp", 25) else 0
        lead += 2 if len(pops) >= 2 and pops[-1] > 0.6 * rf else 0
    if spec["rules"].get("lives"):
        near += sum(1 for e in ev if e["type"] == "spike" and e["f"] < rf)
    if r.get("outcome") == "race" and r.get("order"):
        esc = [e["f"] for e in ev if e["type"] == "escape"]
        if len(esc) >= 2:
            lead += 3 if (esc[-1] - esc[-2]) < 40 else 0
    s = min(near, 6) * 3 + min(lead, 8) * 2 - max(0.0, quiet - 2) * 4 - abs(rho - 0.86) * 20
    if r.get("reason") == "timer" and r.get("outcome") != "paint":
        s -= 6  # an outcome that happens beats the clock running out
    return s, {"near": near, "quiet": round(quiet, 2), "lead": lead, "rho": round(rho, 3), "sec": round(total / FPS, 1)}


def _try(args):
    spec, seed = args
    w = simulate(spec, seed)
    sc = score(spec, w)
    return (seed, sc) if sc else None


def search(spec: dict, workers: int = 10) -> list[tuple[int, float, dict]]:
    seeds = range(spec.get("seed0", 1), spec.get("seed0", 1) + spec.get("seeds", 200))
    with ProcessPoolExecutor(workers) as ex:
        res = [r for r in ex.map(_try, [(spec, s) for s in seeds], chunksize=4) if r]
    res.sort(key=lambda r: -r[1][0])
    return [(s, sc[0], sc[1]) for s, sc in res]


# ------------------------------------------------------------------ outputs

def ring_json(w: World):
    out = []
    for r in w.rings:
        d = {"R": r.R0, "w": r.w, "n": r.n, "kind": r.kind, "rot": math.degrees(r.rot), "rot0": math.degrees(r.rot0), "cx": r.cx, "cy": r.cy, "dead": r.dead0}
        if r.shrink:
            d.update(shrink=r.shrink, Rmin=r.Rmin)
        if any(r.spike):
            d["spike"] = [j for j in range(r.n) if r.spike[j]]
        out.append(d)
    return out


def grid_json(w: World):
    G = w.grid
    if G is None:
        return None
    flat = [x for ch in G["changes"] for x in ch]
    return {"mode": G["mode"], "cell": G["cell"], "n": G["n"], "x0": G["x0"], "y0": G["y0"], "ch": flat, "track": G["track"]}


def build(spec: dict, seed: int, meta: dict | None = None) -> dict:
    w0 = simulate(spec, seed)
    total = frames_for(spec)
    if spec["durationSec"] == "auto":
        total = int(round(w0.result["f"] / spec.get("target", 0.86)))
        w0 = simulate(spec, seed, total)
    w = w0
    balls = []
    for i, b in enumerate(spec["rules"]["balls"]):
        balls.append({"id": i, "color": b.get("hex", "#ffffff"), "name": b.get("name", ""), "flag": b.get("flag"), "img": b.get("img"), "hunter": bool(b.get("hunter")), "r0": b["r"]})
    data = {
        "id": spec["id"],
        "engine": "sim",
        "spec": {k: v for k, v in spec.items() if k != "rules"},
        "fps": FPS,
        "frames": total,
        "seed": seed,
        "meta": meta or {},
        "rings": ring_json(w),
        "arenas": w.arenas,
        "balls": balls,
        "melody": spec["rules"].get("melody"),
        "pos": w.out[:total],
        "events": [e for e in w.events if e["f"] < total],
        "result": w.result,
    }
    if w.grid is not None:
        data["grid"] = grid_json(w)
    if spec["rules"].get("hp"):
        data["hp0"] = spec["rules"]["hp"]
    if spec["rules"].get("lives"):
        data["lives0"] = spec["rules"]["lives"]
    write_data(spec["id"], data)
    league_table(spec, data)
    sound(spec, data)
    return data


def sound(spec: dict, data: dict):
    sec = data["frames"] / FPS
    mix = A.Mix(sec)
    res = data["result"] or {}
    hit = res.get("f", data["frames"] * 0.86) / FPS
    m = spec.get("music", {})
    A.music_bed(mix, sec, bpm=m.get("bpm", 120), root=m.get("root", 45), mode=m.get("mode", "minor"), hit=hit, gain=m.get("gain", 0.38), style=m.get("style", "drive"), seed=spec.get("musicSeed", 1))
    melody = data.get("melody")
    inst = spec.get("instrument", "marimba")
    base = spec.get("noteBase", 60)
    last_collide = -10
    for e in data["events"]:
        t = e["f"] / FPS
        pan = max(-0.8, min(0.8, (e.get("x", 540) - 540) / 540))
        ty = e["type"]
        if ty == "bounce":
            if melody:
                k = e["n"] - 1
                if res.get("f") is not None and e["f"] > res["f"]:
                    note = melody[-1] - 12 + A.PENTA[k % 5]
                    mix.add(A.tone(inst, note), t, 0.22, pan)
                    continue
                note = melody[k % len(melody)]
            elif "note" in e:
                note = spec.get("scale", [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86])[e["note"] % 12]
            else:
                note = A.penta_climb(e["n"] - 1, base)
            mix.add(A.tone(inst, note), t, 0.55, pan)
        elif ty == "collide":
            if e["f"] - last_collide >= 3:
                mix.add(A.fx("tick", e["f"] % 3), t, 0.12, pan)
                last_collide = e["f"]
        elif ty == "brick":
            mix.add(A.fx("brick", e["seg"] % 4), t, 0.3, pan)
        elif ty == "catch":
            mix.add(A.fx("pop"), t, 0.6, pan)
            mix.add(A.fx("thud"), t, 0.4, pan)
        elif ty == "escape":
            mix.add(A.fx("whoosh", e.get("place", 0) % 3), t - 0.15, 0.35, pan)
            mix.add(A.tone("bell", 84 + A.PENTA[e.get("place", 1) % 5]), t, 0.3, pan)
        elif ty == "lit":
            mix.add(A.tone("bell", 72 + A.PENTA[e["seg"] % 5] + 12 * (e["seg"] // 5 % 2), 1.0), t, 0.25, pan)
        elif ty == "layer":
            mix.add(A.sparkle(e.get("ring", 0)), t, 0.4, pan)
        elif ty == "spike":
            mix.add(A.fx("crack", e["f"] % 3), t, 0.5, pan)
            mix.add(A.tone("bass", 40, 0.3), t, 0.4, pan)
        elif ty in ("pop", "crush"):
            mix.add(A.fx("pop"), t, 0.7, pan)
            mix.add(A.fx("thud"), t, 0.5, pan)
            mix.add(A.sparkle(e.get("ball", 0) + 3), t, 0.3, pan)
        elif ty == "gflip":
            mix.add(A.fx("whoosh", e["dir"]), t - 0.05, 0.16, pan)
            mix.add(A.tone("pluck", [52, 55, 59, 62][e["dir"]], 0.4), t, 0.25, pan)
        elif ty == "dmg":
            mix.add(A.fx("thud"), t, min(0.6, 0.15 + e["d"] / 40), pan)
            mix.add(A.fx("brick", e["d"] % 4), t, min(0.4, 0.1 + e["d"] / 60), pan)
        elif ty == "result":
            mix.add(A.sting(m.get("root", 45) + 15, 3), t, 0.7)
    mix.write(AUDIO / f"{spec['id']}.wav", sec)


def _prev(vid: str) -> dict:
    p = DATA / f"{vid}.json"
    if not p.exists():
        raise SystemExit(f"build {vid} first: this episode's line-up comes from its result")
    return json.loads(p.read_text(encoding="utf-8"))


def _entrant(b: dict) -> dict:
    return {"flag": b["flag"], "name": b["flag"], "hex": "#FFFFFF"} if b.get("flag") else {"name": b["name"], "hex": b["color"]}


def resolve(spec: dict) -> dict:
    """Series episodes: fill in the line-up from earlier episodes' real results."""
    spec = json.loads(json.dumps(spec))
    rules = spec["rules"]
    fp = spec.get("fromPrev")
    if fp:
        prev = _prev(fp["id"])
        pres = prev["result"]
        tmpl = rules["balls"][0]
        if fp.get("winners"):
            ids = pres.get("winners") or [pres["winner"]]
        else:
            ids = (pres.get("order") or [])[: fp["take"]]
        ent = [_entrant(prev["balls"][i]) for i in ids]
        if rules.get("win") == "duels":
            per = len(rules["balls"]) // len(rules["arenas"])
            rules["balls"] = [{**ent[k], "r": tmpl["r"], "speed": tmpl["speed"], "arena": k // per} for k in range(len(ent))]
        else:
            rules["balls"] = [{**e, "r": tmpl["r"], "speed": tmpl["speed"]} for e in ent]
    ch = spec.get("champions")
    if ch:
        cup = _prev(ch["cup"])
        league = _prev(ch["league"])
        champ = cup["balls"][cup["result"]["winner"]]
        top = league["spec"]["standings"][0]
        rules["balls"] = [
            {**_entrant(champ), "r": 32, "speed": 800},
            {"name": top["name"], "hex": top["color"], "r": 32, "speed": 800},
        ]
        spec["subtitle"] = f"{champ['flag'] and FLAG_NAMES.get(champ['flag'], champ['flag'])} vs {top['name']}"
    return spec


FLAG_NAMES = {"BR": "Brazil", "AR": "Argentina", "FR": "France", "DE": "Germany", "ES": "Spain", "IT": "Italy", "GB": "United Kingdom", "US": "USA", "MX": "Mexico", "JP": "Japan", "IN": "India", "CN": "China", "NL": "Netherlands", "PT": "Portugal", "BE": "Belgium", "PL": "Poland", "UA": "Ukraine", "TR": "Turkey", "SE": "Sweden", "NO": "Norway", "DK": "Denmark", "CH": "Switzerland", "CA": "Canada", "NG": "Nigeria", "GH": "Ghana", "SN": "Senegal", "CM": "Cameroon", "MA": "Morocco", "EG": "Egypt", "CO": "Colombia", "CL": "Chile", "PE": "Peru", "VN": "Vietnam"}


def league_table(spec: dict, data: dict):
    lg = spec.get("league")
    if not lg:
        return
    res = data["result"] or {}
    order = list(res.get("order") or []) + list(res.get("out") or [])
    seen = set(order)
    order += [b["id"] for b in data["balls"] if b["id"] not in seen]
    prev = _prev(lg["prev"])["spec"]["standings"] if lg.get("prev") else []
    pts = {r["name"]: r["pts"] for r in prev}
    rows = []
    for pos, bid in enumerate(order):
        b = data["balls"][bid]
        add = lg["points"][pos] if pos < len(lg["points"]) else 0
        rows.append({"name": b["name"], "color": b["color"], "pts": pts.get(b["name"], 0) + add, "add": add})
    rows.sort(key=lambda r: -r["pts"])
    data["spec"]["standings"] = rows
    data["spec"]["race"] = lg["race"]
    write_data(spec["id"], data)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="+")
    ap.add_argument("--seed", type=int)
    a = ap.parse_args()
    for vid in a.ids:
        spec = resolve(load_spec(vid))
        if a.seed is not None:
            w = simulate(spec, a.seed)
            print(vid, "seed", a.seed, "result", w.result, "score", score(spec, w))
            build(spec, a.seed)
            continue
        top = search(spec)
        if not top:
            raise SystemExit(f"{vid}: no seed met the drama rules in {spec.get('seeds', 200)} tries; widen 'window' or change the rules")
        for s, sc, m in top[:5]:
            print(f"  {vid} seed {s:4d}  score {sc:6.2f}  {m}")
        s, sc, m = top[0]
        d = build(spec, s, {"score": round(sc, 2), **m})
        print(f"{vid}: wrote seed {s}, {d['frames'] / FPS:.1f}s, result {d['result']}")


if __name__ == "__main__":
    main()
