"""Deterministic 2D physics for the Sim engine (Ball Arena, Bounce Melody, Marble Kingdom).

Fixed step 1/240 s (4 substeps per 60 fps frame). Same spec + seed gives the
same output on every run. Walls are rings of equal arc segments (a ring with a
gap is a ring whose gap segments start dead; bricks are segments that die when
hit; paint rings store an owner per segment). Balls bounce elastically off
segments and each other. Every collision, escape, catch and near-miss is an
event with a frame number; the Remotion player only draws what this writes.
"""

from __future__ import annotations

import math

import numpy as np

FPS = 60
SUB = 4
DT = 1.0 / (FPS * SUB)
TAU = 2 * math.pi
W, H = 1080, 1920
# arena centre: keeps the right 15% (like/share buttons) and bottom 25% (caption) clear
CX, CY = 468, 940


class Ring:
    def __init__(self, i: int, cfg: dict, cx: float, cy: float):
        self.i = i
        self.cx, self.cy = cx, cy
        self.R = float(cfg["R"])
        self.w = float(cfg.get("w", 14))
        self.n = int(cfg.get("n", 720))
        self.kind = cfg.get("kind", "wall")  # wall | bricks | paint | notes
        self.rot = math.radians(cfg.get("rot", 0.0))
        self.rot0 = math.radians(cfg.get("rot0", 0.0))
        self.seg = TAU / self.n
        self.alive = [True] * self.n
        self.owner = [-1] * self.n
        gap = cfg.get("gap")  # [centre deg, width deg]
        if gap:
            c, wdeg = math.radians(gap[0]), math.radians(gap[1])
            for j in range(self.n):
                mid = (j + 0.5) * self.seg
                dd = abs((mid - c + math.pi) % TAU - math.pi)
                if dd < wdeg / 2:
                    self.alive[j] = False
        self.dead0 = [j for j in range(self.n) if not self.alive[j]]
        # spikes: [[centre deg, width deg], ...]; hitting one costs a life
        self.spike = [False] * self.n
        for c, wdeg in cfg.get("spikes", []):
            c, wdeg = math.radians(c), math.radians(wdeg)
            for j in range(self.n):
                mid = (j + 0.5) * self.seg
                if self.alive[j] and abs((mid - c + math.pi) % TAU - math.pi) < wdeg / 2:
                    self.spike[j] = True
        # shrinking arena: R(t) = max(Rmin, R0 - shrink * t); the wall moves inward at `shrink` px/s
        self.R0 = self.R
        self.shrink = float(cfg.get("shrink", 0.0))
        self.Rmin = float(cfg.get("Rmin", 0.0))
        self.vin = 0.0

    def update(self, t: float):
        if self.shrink:
            R = self.R0 - self.shrink * t
            self.vin = self.shrink if R > self.Rmin else 0.0
            self.R = max(self.Rmin, R)

    def offset(self, t: float) -> float:
        return self.rot0 + self.rot * t

    def hit(self, phi: float, delta: float):
        """Alive segment under the angular span [phi-delta, phi+delta] (closest to phi), or None."""
        i0 = math.floor((phi - delta) / self.seg)
        i1 = math.floor((phi + delta) / self.seg)
        ic = math.floor(phi / self.seg)
        best, bestd = None, 1 << 30
        for i in range(i0, i1 + 1):
            j = i % self.n
            if self.alive[j]:
                dd = abs(i - ic)
                if dd < bestd:
                    best, bestd = j, dd
        return best

    def near_opening(self, phi: float, delta: float) -> bool:
        """An opening the ball could fit through lies within ~1.5 ball widths of the hit point."""
        span = int(math.ceil(2 * delta / self.seg)) + 1  # segments a ball needs
        i0 = math.floor((phi - 4 * delta) / self.seg)
        i1 = math.floor((phi + 4 * delta) / self.seg)
        run = 0
        for i in range(i0, i1 + 1):
            if not self.alive[i % self.n]:
                run += 1
                if run >= span:
                    return True
            else:
                run = 0
        return False

    def opening_arc(self) -> float:
        """Widest opening, as an arc length in px (for 'too big to fit')."""
        best = run = 0
        for i in range(2 * self.n):
            if not self.alive[i % self.n]:
                run += 1
                best = max(best, run)
            else:
                run = 0
        return min(best, self.n) * self.seg * self.R


class Ball:
    __slots__ = ("id", "x", "y", "vx", "vy", "r", "color", "arena", "state", "hunter", "notes", "out_f", "hp", "inv", "px", "py")

    def __init__(self, i, x, y, vx, vy, r, color, arena=0, hunter=False, hp=0):
        self.id, self.x, self.y, self.vx, self.vy, self.r = i, x, y, vx, vy, r
        self.color, self.arena, self.hunter = color, arena, hunter
        self.state = "in"  # in | out (escaped, flying away) | gone | dead (caught / popped / crushed)
        self.notes = 0
        self.out_f = -1
        self.hp = hp  # lives (spike wall) or hit points (HP battle)
        self.inv = -1.0  # invulnerable until this time (spikes)
        self.px, self.py = x, y  # position at the end of the previous frame (grid painting)


class World:
    """One simulation run. `rules` is the spec's rules block (see rules.md in CLAUDE.md)."""

    def __init__(self, rules: dict, seed: int, frames: int):
        self.rules = rules
        self.rng = np.random.default_rng(seed)
        self.frames = frames
        self.g = float(rules.get("gravity", 0.0))
        self.collide = bool(rules.get("collide", True))
        self.on_bounce = rules.get("on_bounce", [])
        self.grow = float(rules.get("grow", 1.0))
        self.grow_max = float(rules.get("grow_max", 1e9))
        self.win = rules.get("win", "escape")
        self.arenas = rules.get("arenas", [{"cx": CX, "cy": CY}])
        self.rings: list[Ring] = []
        for k, rc in enumerate(rules["rings"]):
            a = self.arenas[rc.get("arena", 0)]
            self.rings.append(Ring(k, rc, a["cx"], a["cy"]))
        self.balls: list[Ball] = []
        self.events: list[dict] = []
        self.out = []  # per frame: [[id, x, y, r], ...]
        self.f = 0
        self.t = 0.0
        self.result = None
        self.escape_order: list[int] = []
        self.caught: list[int] = []
        self.bounces = 0
        self.lit: set[int] = set()
        self.melody_len = int(rules.get("melody_len", 0))
        # gravity as a vector; "gravity_flip" turns it 90 degrees clockwise on every wall bounce
        self.gx, self.gy = 0.0, self.g
        self.gflip = bool(rules.get("gravity_flip"))
        self.gflip_t = -1.0
        self.gdir = 0  # 0 down, 1 left, 2 up, 3 right
        self.max_speed = float(rules.get("max_speed", 1e9))
        self.dmg_k = float(rules.get("dmg_k", 0.0))  # HP battle: damage = velocity change x dmg_k
        self._place_balls(rules["balls"])
        for b in self.balls:
            b.hp = int(rules.get("lives", rules.get("hp", 0)))
        self.grid = None
        if rules.get("grid"):
            self._grid_init(rules["grid"])

    # ------------------------------------------------------------------ paint grid (colour mix, reveal)
    def _grid_init(self, cfg: dict):
        ring = self.rings[0]
        cell = float(cfg.get("cell", 10))
        inner = ring.R - ring.w / 2
        n = int(math.ceil(2 * inner / cell))
        x0, y0 = ring.cx - n * cell / 2, ring.cy - n * cell / 2
        ys, xs = np.mgrid[0:n, 0:n]
        cx_, cy_ = x0 + (xs + 0.5) * cell, y0 + (ys + 0.5) * cell
        self.grid = {
            "mode": cfg.get("mode", "mix"), "cell": cell, "n": n, "x0": x0, "y0": y0,
            "inside": ((cx_ - ring.cx) ** 2 + (cy_ - ring.cy) ** 2) < inner ** 2,
            "v": np.zeros((n, n), dtype=np.int16), "brush": float(cfg.get("brush", 1.0)), "changes": [], "track": [],
        }

    def _grid_paint(self):
        G = self.grid
        cell, n, v = G["cell"], G["n"], G["v"]
        for b in self.balls:
            if b.state != "in":
                b.px, b.py = b.x, b.y
                continue
            rad = b.r * G["brush"]
            steps = max(1, int(math.hypot(b.x - b.px, b.y - b.py) / max(2.0, rad * 0.5)))
            cells = set()
            for s in range(steps + 1):
                x = b.px + (b.x - b.px) * s / steps
                y = b.py + (b.y - b.py) * s / steps
                c0, c1 = int((x - rad - G["x0"]) / cell), int((x + rad - G["x0"]) / cell)
                r0, r1 = int((y - rad - G["y0"]) / cell), int((y + rad - G["y0"]) / cell)
                for rr in range(max(0, r0), min(n, r1 + 1)):
                    cyy = G["y0"] + (rr + 0.5) * cell
                    for cc in range(max(0, c0), min(n, c1 + 1)):
                        cxx = G["x0"] + (cc + 0.5) * cell
                        if (cxx - x) ** 2 + (cyy - y) ** 2 <= rad * rad:
                            cells.add(rr * n + cc)
            b.px, b.py = b.x, b.y
            bit = 1 << b.id
            for idx in cells:
                rr, cc = divmod(idx, n)
                if not G["inside"][rr, cc]:
                    continue
                old = int(v[rr, cc])
                new = old | bit if G["mode"] == "mix" else 1
                if new != old:
                    v[rr, cc] = new
                    G["changes"].append((self.f, idx, new))
        if self.f % 30 == 0:
            G["track"].append(self._grid_counts())

    def _grid_counts(self) -> dict:
        G = self.grid
        vals, counts = np.unique(G["v"][G["inside"]], return_counts=True)
        return {int(a): int(c) for a, c in zip(vals, counts)}

    # ------------------------------------------------------------------ setup
    def _place_balls(self, defs):
        for i, b in enumerate(defs):
            ar = b.get("arena", 0)
            a = self.arenas[ar]
            inner = min(r.R - r.w / 2 for r in self.rings if self._arena_of(r) == ar)
            spawn = float(self.rules.get("spawn_frac", 0.55)) * inner
            for _ in range(500):
                ang = self.rng.uniform(0, TAU)
                rad = spawn * math.sqrt(self.rng.uniform(0, 1))
                x, y = a["cx"] + rad * math.cos(ang), a["cy"] + rad * math.sin(ang)
                if all(math.hypot(x - o.x, y - o.y) > b["r"] + o.r + 4 for o in self.balls if o.arena == ar):
                    break
            sp = float(b.get("speed", 700))
            th = self.rng.uniform(0, TAU)
            self.balls.append(Ball(i, x, y, sp * math.cos(th), sp * math.sin(th), float(b["r"]), b.get("color", i), ar, bool(b.get("hunter"))))

    def _arena_of(self, ring: Ring) -> int:
        for k, a in enumerate(self.arenas):
            if a["cx"] == ring.cx and a["cy"] == ring.cy:
                return k
        return 0

    def ev(self, type_, b: Ball | None = None, **kw):
        e = {"f": self.f, "type": type_}
        if b is not None:
            e.update(ball=b.id, x=round(b.x, 1), y=round(b.y, 1))
        e.update(kw)
        self.events.append(e)

    def decide(self, **res):
        if self.result is None:
            self.result = {"f": self.f, **res}
            self.ev("result", **res)

    # ------------------------------------------------------------------ step
    def step(self):
        t = self.t
        for ring in self.rings:
            ring.update(t)
        live = [b for b in self.balls if b.state in ("in", "out")]
        for b in live:
            b.vx += self.gx * DT
            b.vy += self.gy * DT
            sp = math.hypot(b.vx, b.vy)
            if sp > self.max_speed:
                b.vx *= self.max_speed / sp
                b.vy *= self.max_speed / sp
            b.x += b.vx * DT
            b.y += b.vy * DT
            if b.state == "out" and (b.y > H + 200 or b.y < -200 or b.x < -200 or b.x > W + 200):
                b.state = "gone"
        inside = [b for b in live if b.state == "in"]
        for b in inside:
            self._walls(b, t)
        if self.collide:
            self._pairs([b for b in self.balls if b.state == "in"])
        self._escapes()
        if self.win == "shrink_escape" and self.result is None:
            ring = self.rings[0]
            for b in self.balls:
                if b.state == "in" and ring.R - ring.w / 2 < b.r * float(self.rules.get("crush", 1.25)):
                    b.state = "dead"
                    self.ev("crush", b)
                    self.decide(outcome="no", winner=b.id, reason="crushed")

    def _walls(self, b: Ball, t: float):
        for ring in self.rings:
            if ring.cx != self.arenas[b.arena]["cx"] or ring.cy != self.arenas[b.arena]["cy"]:
                continue
            dx, dy = b.x - ring.cx, b.y - ring.cy
            d = math.hypot(dx, dy)
            if d < 1e-6:
                continue
            inner, outer = ring.R - ring.w / 2, ring.R + ring.w / 2
            inside = d < ring.R
            if inside and d + b.r <= inner:
                continue
            if not inside and d - b.r >= outer:
                continue
            delta = math.asin(min(1.0, b.r / d))
            phi = (math.atan2(dy, dx) - ring.offset(t)) % TAU
            j = ring.hit(phi, delta * 0.97)
            if j is None:
                continue
            nx, ny = dx / d, dy / d
            vn = b.vx * nx + b.vy * ny
            bounced = False
            if inside:
                # a shrinking wall moves inward at ring.vin: reflect the velocity relative to the wall
                if vn + ring.vin > 0:
                    dv = 2 * vn + 2 * ring.vin
                    b.vx -= dv * nx
                    b.vy -= dv * ny
                    bounced = True
                nd = inner - b.r
            else:
                if vn < 0:
                    b.vx -= 2 * vn * nx
                    b.vy -= 2 * vn * ny
                    bounced = True
                nd = outer + b.r
            b.x, b.y = ring.cx + nx * nd, ring.cy + ny * nd
            if bounced:
                self._bounce(b, ring, j, phi, delta)

    def _bounce(self, b: Ball, ring: Ring, j: int, phi: float, delta: float):
        self.bounces += 1
        b.notes += 1
        kw = {"ring": ring.i, "seg": j, "n": self.bounces, "bn": b.notes}
        if ring.kind == "notes":
            kw["note"] = int(j)
        self.ev("bounce", b, **kw)
        if ring.near_opening(phi, delta) and 2 * b.r < ring.opening_arc():
            self.ev("near", b, ring=ring.i)
        decided = self.result is not None
        if self.gflip and not decided and self.t - self.gflip_t > 0.18:
            self.gflip_t = self.t
            self.gdir = (self.gdir + 1) % 4
            self.gx, self.gy = [(0, self.g), (-self.g, 0), (0, -self.g), (self.g, 0)][self.gdir]
            self.ev("gflip", b, dir=self.gdir)
        if ring.spike[j] and not decided and self.t >= b.inv and b.state == "in":
            b.hp -= 1
            b.inv = self.t + 0.3
            self.ev("spike", b, hp=b.hp)
            if b.hp <= 0:
                b.state = "dead"
                self.ev("pop", b)
                if not any(x.state == "in" for x in self.balls):
                    self.decide(outcome="no", winner=b.id, reason="popped")
        if ring.kind == "bricks" and "remove_brick" in self.on_bounce:
            ring.alive[j] = False
            self.ev("brick", b, ring=ring.i, seg=j)
        if ring.kind == "paint" and not decided:
            if ring.owner[j] != b.color:
                prev = ring.owner[j]
                ring.owner[j] = b.color
                self.ev("paint", b, ring=ring.i, seg=j, owner=b.color, prev=prev)
        if ring.kind == "notes" and not decided:
            if j not in self.lit:
                self.lit.add(j)
                self.ev("lit", b, ring=ring.i, seg=j)
            if self.win == "all_notes" and len(self.lit) == ring.n:
                self.decide(outcome="yes", winner=b.id)
        if self.grow != 1.0 and not decided:
            b.r = min(b.r * self.grow, self.grow_max)
            if self.win == "grow_escape":
                opening = max(r.opening_arc() for r in self.rings)
                if 2 * b.r >= opening * 0.98:
                    self.decide(outcome="no", winner=b.id, reason="stuck")
        if self.melody_len and not decided and self.bounces >= self.melody_len:
            if self.win == "fill":
                self.decide(outcome="yes", winner=b.id)
            elif self.win == "song_escape":
                self.decide(outcome="no", winner=b.id, reason="song_over")

    def _pairs(self, balls: list[Ball]):
        n = len(balls)
        if n < 2:
            return
        P = np.array([[b.x, b.y] for b in balls])
        Rr = np.array([b.r for b in balls])
        A = np.array([b.arena for b in balls])
        diff = P[:, None, :] - P[None, :, :]
        d2 = (diff ** 2).sum(-1)
        hit = (d2 < (Rr[:, None] + Rr[None, :]) ** 2) & (A[:, None] == A[None, :])
        ii, jj = np.nonzero(np.triu(hit, 1))
        for i, j in zip(ii.tolist(), jj.tolist()):
            a, c = balls[i], balls[j]
            if a.state != "in" or c.state != "in":
                continue
            hunting = self.t >= float(self.rules.get("hunt_start", 0.0))
            if (a.hunter or c.hunter) and not (a.hunter and c.hunter) and self.result is None and hunting:
                prey = c if a.hunter else a
                hunter = a if a.hunter else c
                prey.state = "dead"
                self.caught.append(prey.id)
                self.ev("catch", prey, by=hunter.id)
                hunter.r = min(hunter.r * float(self.rules.get("hunter_grow", 1.1)), self.grow_max)
                left = [b for b in self.balls if b.state == "in" and not b.hunter]
                if len(left) == 1:
                    self.decide(outcome="survivor", winner=left[0].id)
                continue
            dx, dy = c.x - a.x, c.y - a.y
            d = math.hypot(dx, dy) or 1e-6
            nx, ny = dx / d, dy / d
            ma, mc = a.r * a.r, c.r * c.r
            rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny
            if rv < 0:
                imp = 2 * rv / (ma + mc)
                a.vx += imp * mc * nx
                a.vy += imp * mc * ny
                c.vx -= imp * ma * nx
                c.vy -= imp * ma * ny
                self.ev("collide", a, other=c.id)
                if self.dmg_k and self.result is None:
                    self._damage(a, abs(imp) * mc, c)
                    self._damage(c, abs(imp) * ma, a)
                    alive = [x for x in self.balls if x.state == "in"]
                    if len(alive) == 1:
                        self.decide(outcome="battle", winner=alive[0].id, hp=alive[0].hp)
                    elif not alive:
                        self.decide(outcome="draw")
            overlap = a.r + c.r - d
            if overlap > 0:
                a.x -= nx * overlap * mc / (ma + mc)
                a.y -= ny * overlap * mc / (ma + mc)
                c.x += nx * overlap * ma / (ma + mc)
                c.y += ny * overlap * ma / (ma + mc)

    def _damage(self, b: Ball, dv: float, by: Ball):
        """HP battle: a hit costs HP in proportion to how hard it changed this ball's velocity."""
        d = int(dv * self.dmg_k)
        if d < 1 or b.state != "in":
            return
        b.hp = max(0, b.hp - d)
        self.ev("dmg", b, hp=b.hp, d=d, by=by.id)
        if b.hp <= 0:
            b.state = "dead"
            self.ev("pop", b)

    def _escapes(self):
        for b in self.balls:
            if b.state != "in":
                continue
            rings = [r for r in self.rings if r.cx == self.arenas[b.arena]["cx"] and r.cy == self.arenas[b.arena]["cy"]]
            outer = max(r.R + r.w / 2 for r in rings)
            ring0 = rings[0]
            dist = math.hypot(b.x - ring0.cx, b.y - ring0.cy) - b.r
            if len(rings) > 1:
                passed = self.__dict__.setdefault("_passed", set())
                for r in rings:
                    if (b.id, r.i) not in passed and dist > r.R + r.w / 2 + 1:
                        passed.add((b.id, r.i))
                        self.ev("layer", b, ring=r.i, count=sum(1 for p in passed if p[0] == b.id))
            if dist > outer + 2:
                b.state = "out"
                b.out_f = self.f
                self.escape_order.append(b.id)
                self.ev("escape", b, place=len(self.escape_order))
                self._on_escape(b)

    def _on_escape(self, b: Ball):
        w = self.win
        if w in ("escape", "first_escape", "grow_escape", "all_rings", "song_escape", "shrink_escape", "spike_escape"):
            self.decide(outcome="yes", winner=b.id)
        elif w == "race":
            adv = int(self.rules.get("advance", len(self.balls) - 1))
            if len(self.escape_order) >= adv:
                left = [x.id for x in self.balls if x.state == "in"]
                self.decide(outcome="race", winner=self.escape_order[0], order=list(self.escape_order), out=left)
        elif w == "duels":
            # one winner per arena: the first to escape it
            arenas_done = {self.balls[i].arena for i in self.escape_order}
            if b.arena in arenas_done and sum(1 for i in self.escape_order if self.balls[i].arena == b.arena) == 1:
                self.ev("duel", b, arena=b.arena)
            if len(arenas_done) == len(self.arenas):
                winners = []
                for k in range(len(self.arenas)):
                    winners.append(next(i for i in self.escape_order if self.balls[i].arena == k))
                self.decide(outcome="duels", winners=winners)

    # ------------------------------------------------------------------ run
    def run(self, timer_frac: float = 0.86):
        timer_f = int(self.frames * timer_frac)
        for f in range(self.frames):
            self.f = f
            for _ in range(SUB):
                self.step()
                self.t += DT
            if self.grid is not None and self.result is None:
                self._grid_paint()
            if self.result is None and f >= timer_f:
                self._timer()
            self.out.append([[b.id, round(b.x, 1), round(b.y, 1), round(b.r, 1)] for b in self.balls if b.state in ("in", "out")])
        return self

    def _timer(self):
        w = self.win
        if w == "most_paint":
            ring = next(r for r in self.rings if r.kind == "paint")
            counts = {}
            for o in ring.owner:
                if o >= 0:
                    counts[o] = counts.get(o, 0) + 1
            best = max(counts, key=counts.get) if counts else 0
            self.decide(outcome="paint", winner=best, counts={str(k): v for k, v in counts.items()}, total=ring.n)
        elif w == "mix":
            counts = {k: v for k, v in self._grid_counts().items() if k > 0}
            best = max(counts, key=counts.get) if counts else 0
            self.decide(outcome="mix", mask=best, counts={str(k): v for k, v in counts.items()}, total=int(self.grid["inside"].sum()))
        elif w == "reveal":
            c = self._grid_counts()
            self.decide(outcome="reveal", pct=round(c.get(1, 0) / int(self.grid["inside"].sum()), 3))
        elif w == "battle":
            alive = sorted((b for b in self.balls if b.state == "in"), key=lambda b: -b.hp)
            self.decide(outcome="battle", winner=alive[0].id if alive else -1, hp=alive[0].hp if alive else 0, reason="timer")
        elif w in ("escape", "grow_escape", "all_rings", "song_escape", "first_escape", "all_notes", "shrink_escape", "spike_escape"):
            layers = len(self.__dict__.get("_passed", ()))
            self.decide(outcome="no", reason="timer", layers=layers)
        elif w == "fill":
            self.decide(outcome="yes", winner=0)
        elif w == "survivor":
            left = [b.id for b in self.balls if b.state == "in" and not b.hunter]
            self.decide(outcome="survivor", reason="timer", winner=left[0] if left else -1, left=left)
        elif w == "race":
            left = [x.id for x in self.balls if x.state == "in"]
            self.decide(outcome="race", winner=self.escape_order[0] if self.escape_order else -1, order=list(self.escape_order), out=left, timer=True)
        elif w == "duels":
            self.decide(outcome="timer")
