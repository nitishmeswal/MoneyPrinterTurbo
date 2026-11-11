"""Challenge engines: honest maths / physics races.

    python instavideos/engine/challenge.py g45-maze-race      # search maze seeds, write the best
    python instavideos/engine/challenge.py g46-fastest-ramp   # solve the ramps, write data

maze  - one maze (random backtracker + a few loops, from the seed), four real search
        algorithms on identical copies: BFS, DFS, A* (f = g + h, Manhattan) and the
        right-hand wall follower. Every algorithm checks one cell per step at the same
        speed, so the race is fair; the order is whatever the algorithms really do.
        The seed is the only curation (a close race is preferred), like the sims.
ramp  - the brachistochrone race: four frictionless ramps from the same start to the
        same finish (straight line, circle arc, drop + flat, cycloid). Times come from
        energy conservation (v = sqrt(2 g h)) integrated along each curve on a giant
        ramp (mPerPx metres per pixel, g = 9.81 m/s^2), played at real speed, then a
        photo-finish replay of the last stretch in slow motion.
"""

from __future__ import annotations

import argparse
import heapq
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import audio as A  # noqa: E402
from common import AUDIO, FPS, load_spec, write_data  # noqa: E402

# ====================================================================== maze

DIRS = [(-1, 0), (0, 1), (1, 0), (0, -1)]  # N E S W (clockwise)


def make_maze(n: int, seed: int, loops: float):
    """Block grid (2n+1)^2: 1 = wall. Random backtracker, then knock out `loops` of the inner walls."""
    rng = np.random.default_rng(seed)
    G = np.ones((2 * n + 1, 2 * n + 1), dtype=np.uint8)
    seen = np.zeros((n, n), bool)
    stack = [(0, 0)]
    seen[0, 0] = True
    G[1, 1] = 0
    while stack:
        r, c = stack[-1]
        nb = [(r + dr, c + dc, dr, dc) for dr, dc in DIRS if 0 <= r + dr < n and 0 <= c + dc < n and not seen[r + dr, c + dc]]
        if not nb:
            stack.pop()
            continue
        r2, c2, dr, dc = nb[int(rng.integers(len(nb)))]
        G[2 * r + 1 + dr, 2 * c + 1 + dc] = 0
        G[2 * r2 + 1, 2 * c2 + 1] = 0
        seen[r2, c2] = True
        stack.append((r2, c2))
    inner = [(y, x) for y in range(1, 2 * n) for x in range(1, 2 * n) if G[y, x] and (y % 2) != (x % 2)]
    for k in rng.permutation(len(inner))[: int(len(inner) * loops)]:
        G[inner[k]] = 0
    return G


def nbrs(G, n, r, c, order=DIRS):
    for dr, dc in order:
        r2, c2 = r + dr, c + dc
        if 0 <= r2 < n and 0 <= c2 < n and not G[2 * r + 1 + dr, 2 * c + 1 + dc]:
            yield r2, c2


def path_to(par, goal):
    p = [goal]
    while par.get(p[-1]) is not None:
        p.append(par[p[-1]])
    return p[::-1]


def bfs(G, n):
    goal = (n - 1, n - 1)
    from collections import deque
    q, par, order = deque([(0, 0)]), {(0, 0): None}, []
    while q:
        cur = q.popleft()
        order.append(cur)
        if cur == goal:
            break
        for nx in nbrs(G, n, *cur):
            if nx not in par:
                par[nx] = cur
                q.append(nx)
    return order, path_to(par, goal)


def dfs(G, n):
    goal = (n - 1, n - 1)
    stack, par, seen, order = [((0, 0), None)], {}, set(), []
    while stack:
        cur, p = stack.pop()
        if cur in seen:
            continue
        seen.add(cur)
        par[cur] = p
        order.append(cur)
        if cur == goal:
            break
        for nx in reversed(list(nbrs(G, n, *cur))):  # first direction (N, then E, S, W) is tried first
            if nx not in seen:
                stack.append((nx, cur))
    return order, path_to(par, goal)


def astar(G, n):
    goal = (n - 1, n - 1)
    h = lambda c: abs(goal[0] - c[0]) + abs(goal[1] - c[1])  # noqa: E731
    heap, gs, par, closed, order, k = [(h((0, 0)), h((0, 0)), 0, (0, 0))], {(0, 0): 0}, {(0, 0): None}, set(), [], 0
    while heap:
        _, _, _, cur = heapq.heappop(heap)
        if cur in closed:
            continue
        closed.add(cur)
        order.append(cur)
        if cur == goal:
            break
        for nx in nbrs(G, n, *cur):
            g = gs[cur] + 1
            if g < gs.get(nx, 1 << 30):
                gs[nx], par[nx] = g, cur
                k += 1
                heapq.heappush(heap, (g + h(nx), h(nx), k, nx))
    return order, path_to(par, goal)


def wall_follower(G, n):
    """Right hand on the wall: try right, straight, left, back. Every move is a step (revisits count)."""
    goal = (n - 1, n - 1)
    cur, d, order = (0, 0), 2, [(0, 0)]  # facing south
    while cur != goal and len(order) < 20 * n * n:
        for turn in (1, 0, -1, 2):
            nd = (d + turn) % 4
            dr, dc = DIRS[nd]
            r2, c2 = cur[0] + dr, cur[1] + dc
            if 0 <= r2 < n and 0 <= c2 < n and not G[2 * cur[0] + 1 + dr, 2 * cur[1] + 1 + dc]:
                cur, d = (r2, c2), nd
                order.append(cur)
                break
    # the route it found, with dead-end detours folded away
    path = []
    for c in order:
        if c in path:
            path = path[: path.index(c) + 1]
        else:
            path.append(c)
    return order, path


ALGOS = [
    ("BFS", "explores by distance", "#4DA3FF", bfs),
    ("DFS", "goes deep, backtracks", "#FF6B6B", dfs),
    ("A*", "f = g + h", "#F2C14E", astar),
    ("RIGHT-HAND RULE", "hand on the wall", "#3DDC84", wall_follower),
]


def maze_run(spec: dict, seed: int):
    r = spec["rules"]
    n = r["n"]
    G = make_maze(n, seed, r.get("loops", 0.06))
    runs = []
    for name, sub, color, fn in ALGOS:
        order, path = fn(G, n)
        runs.append({"name": name, "sub": sub, "color": color, "order": [a * n + b for a, b in order], "path": [a * n + b for a, b in path]})
    return G, runs


def maze_score(spec: dict, seed: int):
    _, runs = maze_run(spec, seed)
    steps = sorted(len(x["order"]) for x in runs)
    s1, s2 = steps[0], steps[1]
    n = spec["rules"]["n"]
    if s1 < n * n * 0.25:  # too easy: the winner barely explores
        return None
    margin = (s2 - s1) / s1
    if margin < 0.02:  # near tie is unreadable on screen
        return None
    lead_changes = 0
    # who leads (closest to finishing, by share of its own run done) at each 5% of the winner's run
    lead = None
    for k in range(1, 20):
        t = s1 * k / 20
        prog = [min(1, t / len(x["order"])) for x in runs]
        cur = int(np.argmax(prog))
        lead_changes += lead is not None and cur != lead
        lead = cur
    winner = min(range(4), key=lambda i: len(runs[i]["order"]))
    score = 3.0 * (1 - min(1, margin / 0.25)) + 0.4 * lead_changes - 1.5 * max(0, steps[3] / s1 - 2.6) + (1.0 if runs[winner]["name"] != "A*" else 0)
    return score, {"steps": [len(x["order"]) for x in runs], "margin": round(margin, 3)}


def maze_build(spec: dict, seed: int, meta: dict | None = None):
    G, runs = maze_run(spec, seed)
    r = spec["rules"]
    start = int(r.get("startSec", 1.2) * FPS)
    s1 = min(len(x["order"]) for x in runs)
    sps = s1 / r.get("winnerSec", 13)  # cells checked per second (same for all four)
    cap = r.get("capSec", 26)
    fin = []
    for x in runs:
        sec = len(x["order"]) / sps
        x["doneF"] = start + int(math.ceil(sec * FPS)) if sec <= cap else None
        fin.append(x["doneF"])
    ranked = sorted([i for i in range(4) if fin[i] is not None], key=lambda i: fin[i])
    end = max(f for f in fin if f is not None) if len(ranked) == 4 else start + cap * FPS
    for k, i in enumerate(ranked):
        runs[i]["rank"] = k + 1
    result = {"f": end + 20, "winner": ranked[0], "order": ranked}
    data = {
        "id": spec["id"], "engine": "maze", "spec": {k: v for k, v in spec.items() if k != "rules"}, "fps": FPS, "seed": seed, "meta": meta or {},
        "frames": result["f"] + int(spec.get("tailSec", 3.2) * FPS), "n": r["n"], "maze": ["".join(map(str, row)) for row in G.tolist()],
        "start": start, "sps": sps, "algos": runs, "result": result,
    }
    write_data(spec["id"], data)
    maze_sound(spec, data)
    return data


def maze_sound(spec: dict, data: dict):
    sec = data["frames"] / FPS
    mix = A.Mix(sec)
    m = spec.get("music", {})
    res = data["result"]
    A.music_bed(mix, sec, bpm=m.get("bpm", 112), root=m.get("root", 47), mode=m.get("mode", "minor"), hit=res["f"] / FPS, gain=m.get("gain", 0.28), style=m.get("style", "drive"), seed=4)
    t0 = data["start"] / FPS
    mix.add(A.fx("whoosh", 1), t0 - 0.3, 0.3)
    pans = [-0.5, 0.5, -0.5, 0.5]
    for i, x in enumerate(data["algos"]):
        end = (x["doneF"] / FPS) if x["doneF"] else res["f"] / FPS
        k = 0
        while True:
            t = t0 + k * 7 / data["sps"]
            if t >= end:
                break
            mix.add(A.tone("pluck", 60 + [0, 4, 7, 12][i] + A.PENTA[(k // 3) % 5], 0.25), t, 0.05, pans[i])
            k += 1
        if x["doneF"]:
            mix.add(A.tone("bell", 76 - 4 * (x["rank"] - 1)), x["doneF"] / FPS, 0.45 if x["rank"] == 1 else 0.25, pans[i])
            if x["rank"] == 1:
                mix.add(A.sparkle(2), x["doneF"] / FPS, 0.3, pans[i])
    mix.add(A.sting(m.get("root", 47) + 12, 3), res["f"] / FPS, 0.7)
    mix.write(AUDIO / f"{spec['id']}.wav", sec)


def maze_search(spec: dict):
    out = []
    s0 = spec.get("seed0", 0)
    for seed in range(s0, s0 + spec.get("seeds", 300)):
        sc = maze_score(spec, seed)
        if sc:
            out.append((seed, sc[0], sc[1]))
    out.sort(key=lambda x: -x[1])
    return out


# ====================================================================== ramp (brachistochrone)

G_MM = 9810.0  # mm / s^2 (1 px = 1 mm)


def ramp_curves(A_: tuple[float, float], B: tuple[float, float]):
    (ax, ay), (bx, by) = A_, B
    W, H = bx - ax, by - ay
    N = 3000
    out = {}
    # straight line
    s = np.linspace(0, 1, N)
    out["line"] = np.stack([ax + W * s, ay + H * s], 1)
    # circle arc: starts vertical at A, centre level with A (y points down on screen)
    R = (W * W + H * H) / (2 * W)
    a1 = math.atan2(H, W - R)
    th = np.linspace(math.pi, a1, N)
    out["circle"] = np.stack([ax + R + R * np.cos(th), ay + R * np.sin(th)], 1)
    # drop + flat: a steep straight drop, a round corner (radius rc), then flat to B
    rc = 90.0
    x0 = ax + 70
    seg1 = np.stack([np.linspace(ax, x0, 400), np.linspace(ay, by - rc, 400)], 1)
    ph = np.linspace(math.pi, math.pi / 2, 200)
    seg2 = np.stack([x0 + rc + rc * np.cos(ph), by - rc + rc * np.sin(ph)], 1)
    seg3 = np.stack([np.linspace(x0 + rc, bx, 400), np.full(400, by)], 1)
    out["drop"] = np.concatenate([seg1, seg2[1:], seg3[1:]])
    # cycloid through B: x = r(t - sin t), y = r(1 - cos t)
    lo, hi = 0.01, 2 * math.pi - 0.01
    for _ in range(80):
        mid = (lo + hi) / 2
        if (mid - math.sin(mid)) / (1 - math.cos(mid)) < W / H:
            lo = mid
        else:
            hi = mid
    tend = (lo + hi) / 2
    rr = H / (1 - math.cos(tend))
    t = np.linspace(0, tend, N)
    out["cycloid"] = np.stack([ax + rr * (t - np.sin(t)), ay + rr * (1 - np.cos(t))], 1)
    return out


def travel(pts: np.ndarray, g: float = G_MM):
    """Time to reach each point, sliding from rest without friction (energy conservation). g in px/s^2."""
    d = np.hypot(*np.diff(pts, axis=0).T)
    h = np.maximum(0, pts[:, 1] - pts[0, 1])
    v = np.sqrt(2 * g * h)
    vm = (v[:-1] + v[1:]) / 2
    vm[0] = max(vm[0], 1e-6)
    return np.concatenate([[0], np.cumsum(d / vm)])


RAMPS = [
    ("line", "STRAIGHT LINE", "shortest path", "#4DA3FF"),
    ("circle", "CIRCLE ARC", "quarter-circle-ish", "#FF6B6B"),
    ("drop", "DROP + FLAT", "fall first, then roll", "#3DDC84"),
    ("cycloid", "CYCLOID", "x = r(θ − sin θ)", "#F2C14E"),
]


HZ = 240  # position samples per real second


def ramp_build(spec: dict, seed: int = 0, meta: dict | None = None):
    """Real speed: the scene is a giant ramp (mPerPx metres per pixel) under real gravity and plays
    1:1 in real time. Then a photo-finish replay of the last stretch in slow motion."""
    r = spec["rules"]
    A_, B = tuple(r["A"]), tuple(r["B"])
    curves = ramp_curves(A_, B)
    mpp = r.get("mPerPx", 0.05)
    g = 9.81 / mpp
    start = int(r.get("startSec", 3.0) * FPS)
    runs = []
    for key, name, sub, color in RAMPS:
        pts = curves[key]
        tt = travel(pts, g)
        T = float(tt[-1])
        pos = []
        for k in range(int(math.ceil(T * HZ)) + 1):
            tq = min(T, k / HZ)
            i = min(max(int(np.searchsorted(tt, tq)), 1), len(tt) - 1)
            w = (tq - tt[i - 1]) / max(1e-9, tt[i] - tt[i - 1])
            p = pts[i - 1] + (pts[i] - pts[i - 1]) * w
            pos.append([round(float(p[0]), 1), round(float(p[1]), 1)])
        draw = pts[np.linspace(0, len(pts) - 1, 160).astype(int)]
        runs.append({"key": key, "name": name, "sub": sub, "color": color, "T": round(T, 4), "doneF": start + int(math.ceil(T * FPS)), "pos": pos, "path": [[round(float(x), 1), round(float(y), 1)] for x, y in draw]})
    order = sorted(range(len(runs)), key=lambda i: runs[i]["T"])
    for k, i in enumerate(order):
        runs[i]["rank"] = k + 1
    tmin, tmax = runs[order[0]]["T"], runs[order[-1]]["T"]
    race_end = max(x["doneF"] for x in runs)
    slow = r.get("replaySlow", 4)
    t0 = max(0.0, tmin - r.get("replayLead", 0.8))
    t1 = tmax + 0.12
    replay_f = race_end + int(r.get("holdSec", 0.8) * FPS)
    replay_end = replay_f + int(math.ceil((t1 - t0) * slow * FPS))
    result = {"f": replay_end + 6, "winner": order[0], "order": order}
    data = {
        "id": spec["id"], "engine": "ramp", "spec": {k: v for k, v in spec.items() if k != "rules"}, "fps": FPS, "seed": seed, "meta": meta or {},
        "frames": result["f"] + int(spec.get("tailSec", 3.6) * FPS), "A": list(A_), "B": list(B), "hz": HZ, "start": start,
        "size": [round((B[0] - A_[0]) * mpp), round((B[1] - A_[1]) * mpp)],
        "replay": {"f": replay_f, "end": replay_end, "t0": round(t0, 4), "slow": slow}, "ramps": runs, "result": result,
    }
    write_data(spec["id"], data)
    ramp_sound(spec, data)
    return data


def ramp_sound(spec: dict, data: dict):
    sec = data["frames"] / FPS
    mix = A.Mix(sec)
    m = spec.get("music", {})
    res = data["result"]
    A.music_bed(mix, sec, bpm=m.get("bpm", 100), root=m.get("root", 48), mode=m.get("mode", "minor"), hit=res["f"] / FPS, gain=m.get("gain", 0.26), style=m.get("style", "drive"), seed=6)
    t0 = data["start"] / FPS
    mix.add(A.fx("riser"), t0 - 2.0, 0.35)
    mix.add(A.fx("kick"), t0, 0.6)
    mix.add(A.fx("whoosh", 2), t0, 0.35)
    rp = data["replay"]
    for x in data["ramps"]:
        mix.add(A.tone("bell", 79 - 3 * (x["rank"] - 1)), x["doneF"] / FPS, 0.5 if x["rank"] == 1 else 0.28, (x["rank"] - 2.5) / 3)
        # the same finish again in the slow-motion replay, lower and softer
        tr = (rp["f"] + (x["T"] - rp["t0"]) * rp["slow"] * FPS) / FPS
        mix.add(A.tone("bell", 67 - 3 * (x["rank"] - 1)), tr, 0.42 if x["rank"] == 1 else 0.2, (x["rank"] - 2.5) / 3)
        if x["rank"] == 1:
            mix.add(A.sparkle(5), x["doneF"] / FPS, 0.3)
            mix.add(A.fx("kick"), tr, 0.5)
    mix.add(A.fx("whoosh", 4), rp["f"] / FPS - 0.25, 0.4)
    mix.add(A.sting(m.get("root", 48) + 12, 3), res["f"] / FPS, 0.7)
    mix.write(AUDIO / f"{spec['id']}.wav", sec)


# ====================================================================== entry points (batch.py)


def build(spec: dict):
    if spec["engine"] == "maze":
        top = maze_search(spec)
        if not top:
            raise SystemExit("no maze seed met the rules")
        seed, sc, meta = top[0]
        return maze_build(spec, seed, {"score": round(sc, 2), **meta})
    return ramp_build(spec)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="+")
    a = ap.parse_args()
    for vid in a.ids:
        spec = load_spec(vid)
        if spec["engine"] == "maze":
            for s_, sc, m_ in maze_search(spec)[:5]:
                print(f"  {vid} seed {s_:4d} score {sc:6.2f} {m_}")
        d = build(spec)
        if spec["engine"] == "maze":
            print(f"{vid}: {d['frames'] / FPS:.1f}s winner {d['algos'][d['result']['winner']]['name']} steps {[len(x['order']) for x in d['algos']]} done {[x['doneF'] for x in d['algos']]}")
        else:
            print(f"{vid}: {d['frames'] / FPS:.1f}s times " + ", ".join(f"{x['name']} {x['T']:.3f}s" for x in d["ramps"]))


if __name__ == "__main__":
    main()
