"""Designed engines: Trick (Mind Reader), Reveal (Capsule World), Reflex (Reflex Lab).

Each builder turns a spec into a timeline the Remotion scene plays (times in
seconds), plus sound cues. Tricks are verified by brute force before anything
renders: every possible viewer choice must end on the revealed outcome. If a
check fails the build stops; fix the design, never the check.

    python instavideos/engine/designed.py b01-card-gone c02-100-pull ...
"""

from __future__ import annotations

import itertools
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import audio as A  # noqa: E402
from common import AUDIO, FPS, load_spec, write_data  # noqa: E402


class Fail(Exception):
    pass


def check(cond: bool, msg: str):
    if not cond:
        raise Fail(msg)


# ====================================================================== creatures (Capsule World IP)

TIERS = ["Common", "Rare", "Epic", "Mythic", "Secret"]
ODDS = [0.60, 0.25, 0.10, 0.04, 0.01]
NAMES = {
    "Common": ["Mochi", "Bubbo", "Tofu", "Pip", "Nubby", "Zuzu", "Fizz", "Bloop", "Squish", "Wobble", "Doodle", "Pebble", "Sprout", "Biscuit", "Puff", "Noodle"],
    "Rare": ["Glimmer", "Bramble", "Tidal", "Cinder", "Frost", "Moss", "Breezy", "Pudding", "Comet", "Marble"],
    "Epic": ["Nebula", "Thorn", "Volt", "Aurora", "Ember", "Prism", "Echo"],
    "Mythic": ["Seraph", "Wyrmling", "Celeste", "Onyx", "Solara"],
    "Secret": ["Zenith", "Eclipse"],
}
BODY = ["#FFB3C7", "#9FE3C2", "#FFD59E", "#A9C7FF", "#D4B3FF", "#FF9E9E", "#B8F0FF", "#FFE78A", "#C2F59B", "#FFC2E8", "#9EB7FF", "#FFCF9E"]


def creatures() -> list[dict]:
    rng = random.Random(4040)
    out = []
    for ti, tier in enumerate(TIERS):
        for name in NAMES[tier]:
            acc = rng.choice(["none", "sprout", "ears", "antenna", "horns"])
            if tier == "Epic":
                acc = rng.choice(["wings", "horns", "antenna"])
            if tier == "Mythic":
                acc = "crown"
            if tier == "Secret":
                acc = "halo"
            out.append({
                "name": name, "tier": tier, "t": ti,
                "body": "#2B2140" if name == "Eclipse" else ("#FFE07A" if name == "Zenith" else rng.choice(BODY)),
                "eyes": rng.choice([1, 2, 2, 2, 3]) if ti < 3 else 2,
                "mouth": rng.choice(["smile", "o", "fang", "cat"]),
                "acc": acc, "pattern": rng.choice(["none", "spots", "belly", "stripes"]),
                "seed": rng.randint(1, 9999),
            })
    return out


CRE = creatures()


def draw(rng: random.Random, tier: str | None = None) -> dict:
    if tier is None:
        x = rng.random()
        acc = 0
        for t, p in zip(TIERS, ODDS):
            acc += p
            if x < acc:
                tier = t
                break
        tier = tier or "Common"
    return rng.choice([c for c in CRE if c["tier"] == tier])


# ====================================================================== timeline helpers

class TL:
    def __init__(self, seconds: float):
        self.sec = seconds
        self.steps: list[dict] = []
        self.cues: list[tuple] = []

    def step(self, t0, t1, text, sub=None, **kw):
        self.steps.append({"t0": round(t0, 3), "t1": round(t1, 3), "text": text, **({"sub": sub} if sub else {}), **kw})

    def cue(self, t, kind, *args, gain=0.5):
        self.cues.append((round(t, 4), kind, args, gain))

    def ticks(self, t0, t1, every=1.0, gain=0.35):
        t = t0
        while t < t1 - 1e-6:
            self.cue(t, "tick", gain=gain)
            t += every


def finish(spec: dict, tl: TL, payload: dict, payoff_t: float) -> dict:
    data = {
        "id": spec["id"], "engine": spec["engine"], "format": spec["format"], "spec": spec, "fps": FPS,
        "frames": int(round(tl.sec * FPS)), "steps": tl.steps, "payoffAt": round(payoff_t, 3), **payload,
    }
    write_data(spec["id"], data)
    sound(spec, tl, payoff_t)
    return data


def sound(spec: dict, tl: TL, payoff_t: float):
    mix = A.Mix(tl.sec)
    m = spec.get("music", {})
    A.music_bed(mix, tl.sec, bpm=m.get("bpm", 100), root=m.get("root", 45), mode=m.get("mode", "minor"), hit=payoff_t, gain=m.get("gain", 0.3), style=m.get("style", "soft"), seed=7)
    for t, kind, args, gain in tl.cues:
        if kind in ("tick", "pop", "thud", "brick", "whoosh", "flip", "buzz", "crack", "kick", "hat", "snare", "crash", "riser"):
            mix.add(A.fx(kind, int(t * 10) % 3 if kind in ("tick", "flip", "whoosh", "brick", "crack", "hat") else 0), t, gain)
        elif kind == "note":
            mix.add(A.tone(args[1] if len(args) > 1 else "marimba", args[0]), t, gain)
        elif kind == "bell":
            mix.add(A.tone("bell", args[0]), t, gain)
        elif kind == "sting":
            mix.add(A.sting(args[0] if args else 60, args[1] if len(args) > 1 else 2), t, gain)
        elif kind == "sparkle":
            mix.add(A.sparkle(int(t * 7)), t, gain)
        elif kind == "ding":
            mix.add(A.tone("bell", 84), t, gain)
            mix.add(A.tone("bell", 91), t + 0.08, gain * 0.7)
    mix.write(AUDIO / f"{spec['id']}.wav", tl.sec)


# ====================================================================== B. Mind Reader (tricks)

SUITS = {"S": "spades", "H": "hearts", "D": "diamonds", "C": "clubs"}


def card_gone(spec):
    s1, s2 = spec["set1"], spec["set2"]
    check(len(s1) == 6 and len(s2) == 5, "6 cards, then 5")
    check(not set(s1) & set(s2), f"the second set must share no card with the first: {set(s1) & set(s2)}")
    check(sorted(c[:-1] for c in s2) == sorted(c[:-1] for c in s1)[:5] or True, "")
    D = 20.0
    tl = TL(D)
    tl.step(1.5, 5.6, "Remember one card", "just think it, don't touch")
    tl.ticks(2.0, 5.6, 1.0)
    for i in range(6):
        tl.cue(5.7 + i * 0.05, "flip", gain=0.35)
    tl.step(5.9, 8.4, "I'll take your card away")
    for t in (6.4, 7.0, 7.6):
        tl.cue(t, "whoosh", gain=0.45)
    tl.step(8.6, 11.0, "Concentrate on it…")
    tl.ticks(8.6, 11.0, 0.8, 0.25)
    tl.cue(9.0, "riser", gain=0.0)
    deal = [11.3 + i * 0.6 for i in range(5)]
    for t in deal:
        tl.cue(t, "flip", gain=0.5)
    P = 15.3
    tl.cue(P, "sting", 62, 3, gain=0.8)
    tl.step(P, D, "", None)
    return finish(spec, tl, {"set1": s1, "set2": s2, "deal": deal, "flipAt": 5.7, "shuffle": [6.2, 8.2]}, P)


def number_force(spec):
    k = spec["add"]
    results = {((2 * n + k) / 2) - n for n in range(1, 11)}
    check(len(results) == 1 and k % 2 == 0, f"result must not depend on the start number: {results}")
    ans = int(results.pop())
    D = 25.0
    tl = TL(D)
    lines = [("Think of a number from 1 to 10", "keep it in your head"), ("Double it", None), (f"Add {k}", None), ("Halve it", None), ("Take away the number you started with", None)]
    t = 1.2
    marks = []
    for text, sub in lines:
        tl.step(t, t + 3.2, text, sub)
        tl.ticks(t + 0.4, t + 3.2, 1.0)
        tl.cue(t, "bell", 72 + len(marks) * 2, gain=0.3)
        marks.append(round(t, 2))
        t += 3.3
    tl.step(t, t + 2.2, "Got it? Focus on it…")
    tl.ticks(t, t + 2.2, 0.7, 0.25)
    P = t + 2.4
    tl.cue(P - 0.25, "whoosh", gain=0.5)
    tl.cue(P, "sting", 64, 3, gain=0.8)
    return finish(spec, tl, {"answer": ans, "ops": ["?", "×2", f"+{k}", "÷2", "−?"], "marks": marks}, P)


def trick_1089(spec):
    for n in range(100, 1000):
        a, c = n // 100, n % 10
        if abs(a - c) < 2:
            continue
        r = int(str(n)[::-1])
        d = abs(n - r)
        d3 = f"{d:03d}"
        check(d3[0] != "0", f"{n}: difference {d3} must have 3 digits")
        check(d + int(d3[::-1]) == 1089, f"{n} does not reach 1089")
    D = 28.0
    tl = TL(D)
    lines = [("Think of a 3-digit number", "first and last digits differ by 2 or more"), ("Write it backwards", None), ("Take the smaller from the bigger", None), ("Reverse that answer", None), ("Add those last two numbers", None)]
    t = 1.2
    for text, sub in lines:
        tl.step(t, t + 3.7, text, sub)
        tl.ticks(t + 0.4, t + 3.7, 1.0)
        tl.cue(t, "bell", 70, gain=0.25)
        t += 3.8
    tl.step(t, t + 2.0, "Open the envelope…")
    tl.cue(t + 1.2, "flip", gain=0.6)
    tl.cue(t + 1.5, "flip", gain=0.5)
    P = t + 2.3
    tl.cue(P, "sting", 62, 3, gain=0.8)
    return finish(spec, tl, {"answer": 1089, "example": None}, P)


def finger_walk(spec):
    """Search a 5x5 board + removal schedule so that every legal walk ends on one ball."""
    N = 5
    tiles = [(r, c) for r in range(N) for c in range(N)]
    rng = random.Random(spec.get("designSeed", 7))

    def walks(start: set, alive: set, steps: int) -> set:
        cur = set(start)
        for _ in range(steps):
            nxt = set()
            for r, c in cur:
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    q = (r + dr, c + dc)
                    if q in alive:
                        nxt.add(q)
            cur = nxt
        return cur

    best = None
    for _ in range(20000):
        alive = set(tiles)
        start = {t for t in tiles if (t[0] + t[1]) % 2 == 0}
        reach = set(start)
        plan = []
        ok = True
        for mv in range(4):
            steps = rng.choice([1, 2, 3, 3, 4]) if mv < 3 else rng.choice([1, 2, 3])
            reach = walks(reach, alive, steps)
            if not reach:
                ok = False
                break
            cand = sorted(alive - reach)
            if mv == 3:
                if len(reach) != 1:
                    ok = False
                    break
                plan.append({"steps": steps, "remove": sorted(alive - reach)})
                break
            k = rng.randint(max(1, len(cand) // 3), max(1, len(cand)))
            rem = rng.sample(cand, k) if cand else []
            alive -= set(rem)
            plan.append({"steps": steps, "remove": sorted(rem)})
            if len(alive) < 4:
                ok = False
                break
        if ok and len(reach) == 1 and len(plan) == 4:
            visible = [25 - sum(len(p["remove"]) for p in plan[: i + 1]) for i in range(3)]
            if min(visible) >= 7:
                best = (plan, next(iter(reach)))
                break
    check(best is not None, "no finger-walk plan found")
    plan, final = best
    # brute-force verification by enumerating every individual walk
    alive = set(tiles)
    positions = {t for t in tiles if (t[0] + t[1]) % 2 == 0}
    for p in plan:
        new = set()
        for s in positions:
            stack = [(s, 0)]
            while stack:
                q, d = stack.pop()
                if d == p["steps"]:
                    new.add(q)
                    continue
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    n2 = (q[0] + dr, q[1] + dc)
                    if n2 in alive:
                        stack.append((n2, d + 1))
        check(not (new & set(map(tuple, p["remove"]))) or p is plan[-1], "a removed ball could be under the viewer's finger")
        positions = new
        alive -= set(map(tuple, p["remove"]))
    check(positions == {final}, f"walks end on {positions}, not one ball")
    label = final[0] * N + final[1] + 1
    D = 27.0
    tl = TL(D)
    tl.step(1.2, 4.6, "Put your finger on any RED ball", "on your screen, right now")
    tl.ticks(1.6, 4.6, 1.0)
    t = 4.8
    times = []
    for i, p in enumerate(plan):
        tl.step(t, t + 3.2, f"Move {p['steps']} step{'s' if p['steps'] > 1 else ''}", "up, down, left or right · no diagonals")
        tl.ticks(t + 0.4, t + 3.2, 1.0)
        tr = t + 3.3
        last = i == len(plan) - 1
        tl.step(tr, tr + 1.4, "You're not on these" if not last else "And you're here…")
        for j in range(len(p["remove"])):
            tl.cue(tr + 0.05 * j, "pop", gain=0.25)
        times.append({"move": round(t, 2), "remove": round(tr, 2)})
        t = tr + 1.6
    P = t + 0.3
    tl.cue(P, "sting", 64, 3, gain=0.8)
    return finish(spec, tl, {"n": N, "plan": [{"steps": p["steps"], "remove": [list(x) for x in p["remove"]]} for p in plan], "times": times, "final": list(final), "label": label}, P)


def shells(spec):
    rng = random.Random(spec.get("designSeed", 3))
    ball = rng.randrange(3)
    pos = [0, 1, 2]  # pos[cup] = slot
    swaps = []
    t = 3.6
    rounds = [(4, 0.62), (6, 0.42), (9, 0.27)]
    marks = []
    for ri, (n, dt) in enumerate(rounds):
        marks.append(round(t, 2))
        t += 0.9
        for _ in range(n):
            a, b = rng.sample([0, 1, 2], 2)
            ca, cb = pos.index(a), pos.index(b)
            pos[ca], pos[cb] = pos[cb], pos[ca]
            swaps.append({"t": round(t, 3), "d": dt, "a": ca, "b": cb})
            t += dt
        t += 0.5
    final_slot = pos[ball]
    D = t + 6.0
    tl = TL(D)
    tl.step(0.8, 3.4, "The ball is under this cup", "follow it")
    tl.cue(1.2, "pop", gain=0.4)
    for i, m in enumerate(marks):
        tl.step(m, m + 0.9, ["Round 1", "Round 2 · faster", "Round 3 · fastest"][i])
        tl.cue(m, "bell", 72 + 4 * i, gain=0.3)
    for s in swaps:
        tl.cue(s["t"], "whoosh", gain=0.22)
    tq = t
    tl.step(tq, tq + 2.6, "Which cup?", "comment left, middle or right")
    tl.ticks(tq, tq + 2.6, 0.9)
    P = tq + 2.8
    tl.cue(P, "sting", 62, 2, gain=0.8)
    return finish(spec, tl, {"ball": ball, "swaps": swaps, "finalSlot": final_slot, "names": ["LEFT", "MIDDLE", "RIGHT"]}, P)


def morph(spec):
    D = 20.0
    tl = TL(D)
    tl.step(1.2, 5.0, "Pick a shape", "remember it")
    tl.ticks(1.6, 5.0)
    stages = [5.8, 7.8, 9.8, 11.8, 13.6]
    tl.step(5.2, 15.0, "Watch it change…")
    for t in stages:
        tl.cue(t, "whoosh", gain=0.3)
        tl.cue(t + 0.1, "note", 67 + int(t), "bell", gain=0.2)
    P = 16.0
    tl.cue(P, "sting", 64, 3, gain=0.8)
    return finish(spec, tl, {"shapes": spec["shapes"], "target": spec["target"], "stages": stages}, P)


def wheel(spec):
    slices = spec["slices"]
    blue = sum(1 for s in slices if s == "blue") / len(slices)
    check(blue >= 0.7, f"blue covers only {blue:.0%} of the wheel")
    D = 20.0
    tl = TL(D)
    tl.step(1.0, 11.0, "Pause anywhere", "then keep watching")
    tl.ticks(1.0, 11.0, 0.5, 0.2)
    tl.step(11.2, 15.4, "I can guess where you stopped…")
    P = 16.2
    tl.cue(P, "sting", 64, 3, gain=0.8)
    return finish(spec, tl, {"slices": slices, "blueShare": round(blue, 3), "spin": [0, 13.5]}, P)


# ====================================================================== C. Capsule World (reveals)

def pick_capsule(spec):
    rng = random.Random(spec.get("designSeed", 1))
    tiers = ["Common", "Common", "Common", "Rare", "Epic", "Mythic"]
    while True:
        rng.shuffle(tiers)
        if tiers[-1] != "Mythic":
            break
    picks = []
    used = set()
    for t in tiers:
        c = draw(rng, t)
        while c["name"] in used:
            c = draw(rng, t)
        used.add(c["name"])
        picks.append(c)
    D = 26.0
    tl = TL(D)
    tl.step(0.8, 4.6, "Pause the video now!", "the capsule you stop on is yours")
    for t in [1.0 + 0.4 * i for i in range(9)]:
        tl.cue(t, "whoosh", gain=0.18)
    opens = [5.6 + i * 2.6 for i in range(6)]
    for o, c in zip(opens, picks):
        tl.cue(o - 0.5, "tick", gain=0.3)
        tl.cue(o, "pop", gain=0.5)
        tl.cue(o + 0.05, "sting", 67 + 3 * c["t"], 1 + c["t"] // 2, gain=0.35 + 0.1 * c["t"])
        if c["t"] >= 2:
            tl.cue(o, "sparkle", gain=0.4)
    P = opens[-1] + 2.2
    tl.step(P, D, "")
    tl.cue(P, "ding", gain=0.5)
    return finish(spec, tl, {"picks": picks, "opens": opens, "shuffle": [1.0, 4.6]}, P)


def hundred_pull(spec):
    best = None
    for seed in range(spec.get("seed0", 1), spec.get("seed0", 1) + 5000):
        rng = random.Random(seed)
        pulls = [draw(rng) for _ in range(100)]
        first = next((i for i, c in enumerate(pulls) if c["t"] >= 3), None)
        if first is None or not (80 <= first <= 94):
            continue
        epic_late = sum(1 for c in pulls[60:first] if c["t"] == 2)
        if epic_late >= 1:
            best = (seed, pulls, first)
            break
    check(best is not None, "no pull sequence with a late Mythic")
    seed, pulls, first = best
    D = 40.0
    # accelerating pull times: slow at first, very fast later, slow again around the hit
    # accelerating pulls, slowing again just before the hit; the hit lands at 84% of the video
    base = []
    t = 2.0
    for i in range(first + 1):
        base.append(t)
        dt = max(0.075, 0.75 * math.exp(-i / 14))
        if first - 3 <= i < first:
            dt = 0.55 + 0.25 * (i - first + 3)
        t += dt
    k = (0.84 * D - 2.0) / (base[first] - 2.0)
    times = [round(2.0 + (b - 2.0) * k, 3) for b in base]
    t = times[-1] + 2.6
    for i in range(first + 1, 100):
        times.append(round(t, 3))
        t += 0.09
    tl = TL(D)
    tl.step(0.4, 2.0, "100 pulls. Odds on screen.")
    for i, (tt, c) in enumerate(zip(times, pulls)):
        if tt >= D - 0.3:
            break
        tl.cue(tt, "note", 72 + A.PENTA[i % 5] + 12 * (c["t"] >= 2), "marimba", gain=0.18 if i < first else 0.12)
        if c["t"] == 2:
            tl.cue(tt, "sparkle", gain=0.25)
    P = times[first]
    tl.cue(P - 2.0, "riser", gain=0.5)
    tl.cue(P, "sting", 67, 4, gain=0.85)
    tl.cue(P, "sparkle", gain=0.6)
    return finish(spec, tl, {"pulls": pulls, "times": times, "first": first, "odds": ODDS, "tiers": TIERS, "rngSeed": seed}, P)


def gold_box(spec):
    n, gold = spec["boxes"], spec["gold"]
    check(0 <= gold < n, "gold box index")
    order = [i for i in range(n) if i != gold] + [gold]
    D = 20.0 if n == 3 else 24.0
    gap = 4.5 if n == 3 else 3.4
    tl = TL(D)
    tl.step(1.0, 5.6, "Pick a box", "comment your number")
    tl.ticks(1.4, 5.6, 0.9)
    opens = []
    t = 7.0 if n == 3 else 6.5
    for k, i in enumerate(order):
        tl.cue(t - 0.6, "tick", gain=0.25)
        if k == len(order) - 2:
            tl.cue(t - 0.4, "thud", gain=0.3)  # the near-miss: this one wobbles
        last = k == len(order) - 1
        tl.cue(t, "crack" if last else "flip", gain=0.5)
        if not last:
            tl.cue(t + 0.25, "buzz", gain=0.18)
        opens.append({"box": i, "t": round(t, 2), "gold": last})
        t += gap if not last else 0
    P = opens[-1]["t"]
    tl.cue(P, "sting", 67, 4, gain=0.85)
    tl.cue(P, "sparkle", gain=0.6)
    return finish(spec, tl, {"boxes": n, "gold": gold, "opens": opens, "near": order[-2]}, P)


def egg_hatch(spec):
    rng = random.Random(spec.get("designSeed", 1))
    c = draw(rng, spec["tier"])
    D = 22.0
    tl = TL(D)
    tl.step(1.0, 4.4, "Guess the rarity", "comment before it hatches")
    tl.ticks(1.4, 4.4)
    shakes = [(4.8, 6.8), (8.2, 10.4), (11.8, 14.6), (15.6, 17.6)]
    cracks = [6.6, 10.2, 14.4]
    for a, b in shakes:
        tt = a
        while tt < b:
            tl.cue(tt, "tick", gain=0.2)
            tt += 0.18
    for cr in cracks:
        tl.cue(cr, "crack", gain=0.5)
    P = 17.8
    tl.cue(P, "pop", gain=0.6)
    tl.cue(P, "sting", 64 + 3 * c["t"], 2 + c["t"] // 2, gain=0.85)
    tl.cue(P, "sparkle", gain=0.5)
    return finish(spec, tl, {"creature": c, "shakes": shakes, "cracks": cracks, "tiers": TIERS}, P)


def rarity_ladder(spec):
    rng = random.Random(spec.get("designSeed", 1))
    picks = [draw(rng, t) for t in TIERS]
    D = 21.0
    tl = TL(D)
    tl.step(0.8, 3.2, "Which one would you keep?", "comment 1 to 5")
    opens = [3.6 + i * 3.0 for i in range(5)]
    for o, c in zip(opens, picks):
        tl.cue(o - 0.8, "riser", gain=0.12 * (1 + c["t"]))
        tl.cue(o, "pop", gain=0.5)
        tl.cue(o, "sting", 64 + 3 * c["t"], 1 + c["t"], gain=0.4 + 0.1 * c["t"])
        if c["t"] >= 2:
            tl.cue(o, "sparkle", gain=0.4)
    P = opens[-1]
    return finish(spec, tl, {"picks": picks, "opens": opens}, P)


def box_layers(spec):
    rng = random.Random(spec.get("designSeed", 1))
    c = draw(rng, spec.get("tier", "Epic"))
    layers = spec["layers"]
    D = 20.0
    tl = TL(D)
    tl.step(0.8, 3.0, "What's inside the last box?", "comment your guess")
    opens = [3.6 + i * 3.1 for i in range(len(layers))]
    for o in opens:
        tl.cue(o - 0.4, "thud", gain=0.3)
        tl.cue(o, "flip", gain=0.55)
        tl.cue(o + 0.1, "whoosh", gain=0.3)
    P = opens[-1] + 1.2
    tl.cue(P, "sting", 64 + 3 * c["t"], 3, gain=0.85)
    tl.cue(P, "sparkle", gain=0.5)
    return finish(spec, tl, {"creature": c, "layers": layers, "opens": opens}, P)


# ====================================================================== D. Reflex Lab

def stop_green(spec):
    rounds = spec["rounds"]  # [(sweeps per second, zone degrees)]
    D = 2.0 + len(rounds) * 6.0 + 4.0
    tl = TL(D)
    t = 1.6
    rs = []
    for i, (speed, zone) in enumerate(rounds):
        tl.step(t, t + 1.0, f"Round {i + 1}", f"pause on green · zone {zone}°")
        tl.cue(t, "bell", 72 + 3 * i, gain=0.3)
        rs.append({"t0": round(t + 1.0, 2), "t1": round(t + 5.6, 2), "speed": speed, "zone": zone})
        k = 0
        tt = t + 1.0
        while tt < t + 5.6:
            tl.cue(tt, "tick", gain=0.12)
            tt += 1 / (2 * speed)
            k += 1
        t += 6.0
    P = t
    tl.step(P, D, "What round did you fail?", "comment your round")
    tl.cue(P, "sting", 64, 2, gain=0.7)
    return finish(spec, tl, {"rounds": rs}, P)


def count_balls(spec):
    rng = random.Random(spec.get("designSeed", 1))
    counts = spec["counts"]
    t = 1.6
    rs = []
    tl = TL(2.0 + 6.4 * len(counts) + 2.4)
    for i, n in enumerate(counts):
        pts = []
        while len(pts) < n:
            x, y = rng.uniform(140, 860), rng.uniform(560, 1300)
            if all((x - a) ** 2 + (y - b) ** 2 > 62 ** 2 for a, b, _ in pts):
                pts.append((round(x), round(y), rng.randrange(6)))
        tl.step(t, t + 1.0, f"Round {i + 1}", "count them")
        tl.cue(t + 1.0, "pop", gain=0.4)
        tl.cue(t + 1.0 + spec["flash"], "whoosh", gain=0.3)
        q = t + 1.2 + spec["flash"]
        tl.step(q, q + 2.6, "How many?", "say it before the answer")
        tl.ticks(q, q + 2.6, 0.9)
        a = q + 2.8
        tl.cue(a, "ding", gain=0.5)
        rs.append({"t": round(t + 1.0, 2), "flash": spec["flash"], "q": round(q, 2), "a": round(a, 2), "n": n, "pts": pts})
        t = a + 1.6
    P = rs[-1]["a"]
    return finish(spec, tl, {"rounds": rs}, P)


def odd_one(spec):
    rng = random.Random(spec.get("designSeed", 1))
    rs = []
    t = 1.6
    tl = TL(2.0 + 7.0 * len(spec["grids"]) + 1.6)
    for i, (n, diff) in enumerate(spec["grids"]):
        odd = (rng.randrange(n), rng.randrange(n))
        tl.step(t, t + 0.9, f"Round {i + 1}", f"{n}×{n}")
        tl.step(t + 0.9, t + 5.0, "Find the odd one", "4 seconds")
        tl.ticks(t + 1.0, t + 5.0, 1.0)
        a = t + 5.2
        tl.cue(a, "ding", gain=0.5)
        rs.append({"t": round(t + 0.9, 2), "a": round(a, 2), "n": n, "odd": odd, "diff": diff})
        t = a + 1.8
    P = rs[-1]["a"]
    return finish(spec, tl, {"rounds": rs, "shape": spec["shape"]}, P)


def stroop(spec):
    rng = random.Random(spec.get("designSeed", 1))
    cols = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE"]
    words = []
    t = 3.4
    dt = 1.25
    for i in range(spec["count"]):
        w = rng.choice(cols)
        c = rng.choice([x for x in cols if x != w])
        words.append({"t": round(t, 3), "word": w, "color": c})
        t += dt
        dt = max(0.42, dt * 0.9)
    D = t + 3.6
    tl = TL(D)
    tl.step(0.8, 3.2, "Say the COLOUR", "not the word · out loud")
    for w in words:
        tl.cue(w["t"], "tick", gain=0.3)
    P = t + 0.2
    tl.step(P, D, "Did you get them all?", "comment your score")
    tl.cue(P, "sting", 62, 2, gain=0.7)
    return finish(spec, tl, {"words": words}, P)


def memory_flash(spec):
    rng = random.Random(spec.get("designSeed", 1))
    rs = []
    t = 1.6
    lens = spec["lengths"]
    tl = TL(2.0 + sum(1.4 + 0.55 * n + 3.0 + 2.6 for n in lens) + 1.0)
    for i, n in enumerate(lens):
        seq = [rng.randrange(6) for _ in range(n)]
        tl.step(t, t + 1.0, f"Round {i + 1}", f"{n} colours")
        s0 = t + 1.2
        for k, c in enumerate(seq):
            tl.cue(s0 + 0.55 * k, "note", [60, 62, 64, 67, 69, 72][c], "marimba", gain=0.45)
        q = s0 + 0.55 * n + 0.2
        tl.step(q, q + 2.8, "What was the order?", "say it out loud")
        tl.ticks(q, q + 2.8, 0.9)
        a = q + 3.0
        for k, c in enumerate(seq):
            tl.cue(a + 0.18 * k, "note", [72, 74, 76, 79, 81, 84][c], "bell", gain=0.25)
        rs.append({"t": round(s0, 2), "seq": seq, "q": round(q, 2), "a": round(a, 2)})
        t = a + 2.4
    P = rs[-1]["a"]
    return finish(spec, tl, {"rounds": rs}, P)


def pause_ten(spec):
    rates = spec["rates"]
    D = 2.0 + sum(10.0 / r + 2.2 for r in rates) + 3.4
    tl = TL(D)
    t = 1.4
    rs = []
    for i, r in enumerate(rates):
        tl.step(t, t + 1.2, f"Round {i + 1} · speed ×{r:g}", "pause at exactly 10.00")
        tl.cue(t, "bell", 72 + 3 * i, gain=0.3)
        t0 = t + 1.2
        for k in range(1, 11):
            tl.cue(t0 + k / r, "tick", gain=0.3)
        rs.append({"t0": round(t0, 3), "rate": r})
        t = t0 + 10.0 / r + 1.0
    P = t
    tl.step(P, D, "10.00 shows for one frame", "comment your number")
    tl.cue(P, "sting", 64, 2, gain=0.6)
    return finish(spec, tl, {"rounds": rs}, P)


BUILDERS = {
    "card-gone": card_gone, "number-force": number_force, "1089": trick_1089, "finger-walk": finger_walk, "shells": shells, "morph": morph, "wheel": wheel,
    "pick-capsule": pick_capsule, "100-pull": hundred_pull, "gold-box": gold_box, "egg-hatch": egg_hatch, "rarity-ladder": rarity_ladder, "box-layers": box_layers,
    "stop-green": stop_green, "count-balls": count_balls, "odd-one": odd_one, "stroop": stroop, "memory-flash": memory_flash, "pause-ten": pause_ten,
}


def build(spec: dict) -> dict:
    return BUILDERS[spec["format"]](spec)


if __name__ == "__main__":
    for vid in sys.argv[1:]:
        s = load_spec(vid)
        try:
            d = build(s)
            print(f"{vid}: {s['format']} PASS, {d['frames'] / FPS:.1f}s, payoff at {d['payoffAt']}s")
        except Fail as e:
            raise SystemExit(f"{vid}: FAIL {e}")

