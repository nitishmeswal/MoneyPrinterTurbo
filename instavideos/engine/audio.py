"""All sound for the shorts, synthesised with numpy (so every note is original).

- Instruments: pluck / marimba / bell notes, tick, pop, whoosh, brick crack,
  flip, thud, buzz, ding, sparkle, sting chords.
- Mixer: places every cue sample-accurately on one stereo track, quieter when
  many voices overlap (max 24 at once).
- Music bed: a procedural loop in a minor key that builds in layers, rises into
  the payoff and hits on it, then settles for the loop point.
"""

from __future__ import annotations

import math
import wave
from functools import lru_cache
from pathlib import Path

import numpy as np

SR = 48000
PENTA = [0, 2, 4, 7, 9]


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def penta_climb(n: int, base: int = 60, octaves: int = 2) -> int:
    """n-th note of a rising major pentatonic, wrapping at the top."""
    steps = len(PENTA) * octaves
    k = n % steps
    return base + 12 * (k // len(PENTA)) + PENTA[k % len(PENTA)]


def _env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.minimum(1.0, t / max(attack, 1e-4))
    return a * np.exp(-t / decay)


def _noise(n: int, seed: int = 0) -> np.ndarray:
    return np.random.default_rng(seed).standard_normal(n).astype(np.float64)


def _lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    a = math.exp(-2 * math.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


@lru_cache(maxsize=4096)
def tone(kind: str, midi: float = 60, dur: float = 0.0) -> np.ndarray:
    """One mono sample (float, peak about 1)."""
    f = hz(midi)
    if kind == "pluck":
        n = int(SR * (dur or 0.7))
        t = np.arange(n) / SR
        x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.08) + 0.12 * np.sin(6 * np.pi * f * t) * np.exp(-t / 0.04)
        return x * _env(n, 0.002, 0.22)
    if kind == "marimba":
        n = int(SR * (dur or 0.6))
        t = np.arange(n) / SR
        x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.25) + 0.45 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.035) + 0.2 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.012)
        return x * _env(n, 0.001, 10)
    if kind == "bell":
        n = int(SR * (dur or 1.6))
        t = np.arange(n) / SR
        parts = [(1, 1, 0.9), (2.76, 0.5, 0.45), (5.4, 0.25, 0.2), (8.93, 0.12, 0.1)]
        x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / d) for m, a, d in parts)
        return x * _env(n, 0.002, 10)
    if kind == "bass":
        n = int(SR * (dur or 0.4))
        t = np.arange(n) / SR
        x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
        return np.tanh(1.6 * x) * _env(n, 0.004, (dur or 0.4) * 0.6)
    if kind == "pad":
        n = int(SR * (dur or 2.0))
        t = np.arange(n) / SR
        x = sum(np.sin(2 * np.pi * f * dt * t + ph) for dt, ph in ((1, 0), (1.004, 1.3), (0.996, 2.1), (2.002, 0.7)))
        e = np.minimum(1, t / 0.4) * np.minimum(1, (n / SR - t) / 0.6)
        return x * e * 0.25
    raise ValueError(kind)


@lru_cache(maxsize=256)
def fx(kind: str, var: int = 0) -> np.ndarray:
    if kind == "tick":
        n = int(SR * 0.03)
        x = _noise(n, 1 + var) * _env(n, 0.0005, 0.004)
        return x * 0.6 + np.sin(2 * np.pi * 2400 * np.arange(n) / SR) * _env(n, 0.0005, 0.006) * 0.6
    if kind == "pop":
        n = int(SR * 0.09)
        t = np.arange(n) / SR
        fr = 900 * np.exp(-t / 0.02) + 180
        return np.sin(2 * np.pi * np.cumsum(fr) / SR) * _env(n, 0.001, 0.03)
    if kind == "thud":
        n = int(SR * 0.35)
        t = np.arange(n) / SR
        fr = 120 * np.exp(-t / 0.08) + 45
        return np.sin(2 * np.pi * np.cumsum(fr) / SR) * _env(n, 0.002, 0.12)
    if kind == "kick":
        n = int(SR * 0.4)
        t = np.arange(n) / SR
        fr = 160 * np.exp(-t / 0.03) + 48
        return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(fr) / SR)) * _env(n, 0.001, 0.13)
    if kind == "hat":
        n = int(SR * 0.06)
        x = _noise(n, 7 + var)
        x = x - _lowpass(x, 6000)
        return x * _env(n, 0.0005, 0.015) * 0.8
    if kind == "snare":
        n = int(SR * 0.22)
        t = np.arange(n) / SR
        x = _noise(n, 11) * _env(n, 0.001, 0.06) * 0.7 + np.sin(2 * np.pi * 190 * t) * _env(n, 0.001, 0.05)
        return x
    if kind == "brick":
        n = int(SR * 0.16)
        x = _noise(n, 21 + var)
        x = x - _lowpass(x, 1500)
        t = np.arange(n) / SR
        return x * _env(n, 0.0005, 0.03) * 0.8 + np.sin(2 * np.pi * 1300 * t) * _env(n, 0.0005, 0.04) * 0.4
    if kind == "whoosh":
        n = int(SR * 0.55)
        x = _noise(n, 31 + var)
        t = np.arange(n) / SR
        e = np.sin(np.pi * np.minimum(1, t / 0.55)) ** 2
        return _lowpass(x, 2500) * e * 1.4
    if kind == "flip":
        n = int(SR * 0.07)
        x = _noise(n, 41 + var)
        return (x - _lowpass(x, 2500)) * _env(n, 0.002, 0.018)
    if kind == "buzz":
        n = int(SR * 0.35)
        t = np.arange(n) / SR
        x = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5 + np.sign(np.sin(2 * np.pi * 116 * t)) * 0.5
        return _lowpass(x, 1800) * _env(n, 0.005, 0.2) * 0.8
    if kind == "crack":
        n = int(SR * 0.25)
        x = _noise(n, 51 + var)
        x = x - _lowpass(x, 900)
        e = np.zeros(n)
        for k, at in enumerate((0, 0.03, 0.07, 0.12)):
            i = int(at * SR)
            e[i:] += np.exp(-np.arange(n - i) / SR / 0.015) * (1 - 0.2 * k)
        return x * e * 0.7
    if kind == "riser":
        n = int(SR * 2.0)
        t = np.arange(n) / SR
        x = _noise(n, 61)
        x = x - _lowpass(x, 800)
        sweep = np.sin(2 * np.pi * np.cumsum(300 + 900 * (t / 2) ** 2) / SR) * 0.25
        return (x * 0.5 + sweep) * (t / 2) ** 2
    if kind == "crash":
        n = int(SR * 1.6)
        x = _noise(n, 71)
        x = x - _lowpass(x, 3000)
        return x * _env(n, 0.001, 0.45) * 0.7
    raise ValueError(kind)


def sting(root: int = 60, tier: int = 1) -> np.ndarray:
    """Payoff sting: arpeggio up into a held chord; higher tiers are brighter and longer."""
    chord = [0, 4, 7, 12, 16, 19, 24][: 3 + tier]
    step = 0.06
    n = int(SR * (1.6 + 0.2 * tier))
    out = np.zeros(n)
    for k, c in enumerate(chord):
        s = tone("bell", root + c)
        i = int(k * step * SR)
        m = min(len(s), n - i)
        out[i : i + m] += s[:m] * 0.5
    for c in (0, 7, 12):
        s = tone("pad", root + c - 12, 1.6)
        m = min(len(s), n)
        out[:m] += s[:m] * 0.8
    return out


def sparkle(seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(SR * 0.9)
    out = np.zeros(n)
    for k in range(7):
        s = tone("bell", 84 + PENTA[int(rng.integers(0, 5))] + 12 * int(rng.integers(0, 2)), 0.6)
        i = int(k * 0.06 * SR)
        m = min(len(s), n - i)
        out[i : i + m] += s[:m] * 0.25
    return out


class Mix:
    def __init__(self, seconds: float):
        self.n = int(SR * seconds) + SR
        self.buf = np.zeros((self.n, 2))
        self.starts: list[tuple[int, int]] = []

    def add(self, x: np.ndarray, t: float, gain: float = 0.5, pan: float = 0.0, limit: bool = True):
        i = int(round(t * SR))
        if i >= self.n or i < -len(x):
            return
        if limit:
            active = sum(1 for a, b in self.starts if a <= i < b)
            if active >= 24:
                return
            gain *= min(1.0, 3.0 / math.sqrt(active + 1))
            self.starts = [(a, b) for a, b in self.starts if b > i]
            self.starts.append((i, i + len(x)))
        x0 = max(0, -i)
        i = max(0, i)
        m = min(len(x) - x0, self.n - i)
        l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
        self.buf[i : i + m, 0] += x[x0 : x0 + m] * gain * l * 1.414
        self.buf[i : i + m, 1] += x[x0 : x0 + m] * gain * r * 1.414

    def write(self, path: Path, seconds: float):
        y = self.buf[: int(SR * seconds)]
        peak = np.max(np.abs(y)) or 1.0
        y = y / max(1.0, peak / 0.9)
        y = np.tanh(y * 1.1) / math.tanh(1.1)
        path.parent.mkdir(parents=True, exist_ok=True)
        with wave.open(str(path), "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((np.clip(y, -1, 1) * 32000).astype("<i2").tobytes())


# ------------------------------------------------------------------ music bed

PROGS = {
    "minor": [[0, 3, 7], [-4, 0, 3], [-9, -5, -2], [-2, 2, 5]],  # i  VI  III  VII
    "major": [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]],  # I  V  vi  IV
    "dark": [[0, 3, 7], [1, 5, 8], [0, 3, 7], [-2, 2, 5]],
}


def music_bed(mix: Mix, seconds: float, *, bpm: float = 120, root: int = 45, mode: str = "minor", hit: float | None = None, gain: float = 0.42, style: str = "drive", seed: int = 0):
    """Layered loop: pad + soft kick from the start (hook), bass + hats from 20%,
    16th hats and a riser in the 2 s before `hit`, a crash and kick on `hit`, then calm."""
    beat = 60.0 / bpm
    bar = 4 * beat
    prog = PROGS[mode]
    end = seconds
    hit = hit if hit is not None else seconds * 0.86
    rng = np.random.default_rng(seed)
    nbars = int(math.ceil(end / bar)) + 1
    for k in range(nbars):
        t0 = k * bar
        if t0 >= end:
            break
        ch = prog[k % len(prog)]
        after = t0 >= hit + 0.05
        # pad
        for c in ch:
            mix.add(tone("pad", root + 12 + c, bar + 0.4), t0, gain * (0.35 if not after else 0.25), pan=0.0, limit=False)
        for b in range(4):
            tb = t0 + b * beat
            if tb >= end:
                break
            frac = tb / max(hit, 1e-3)
            # kick: half-time at the start, four-on-the-floor once it builds
            if style != "soft" and not after and (b % 2 == 0 or frac > 0.2):
                mix.add(fx("kick"), tb, gain * 0.9, limit=False)
            if style == "soft" and b == 0 and not after:
                mix.add(fx("kick"), tb, gain * 0.5, limit=False)
            # bass
            if frac > 0.2 and not after:
                mix.add(tone("bass", root + ch[0], beat * 0.9), tb, gain * 0.55, limit=False)
                mix.add(tone("bass", root + ch[0] + (12 if b % 2 else 0), beat * 0.4), tb + beat / 2, gain * 0.35, limit=False)
            # hats, denser near the hit
            if frac > 0.2 and not after:
                div = 4 if frac > 0.7 else 2
                for h in range(div):
                    th = tb + h * beat / div
                    if th < hit:
                        mix.add(fx("hat", int(rng.integers(0, 3))), th, gain * (0.25 if h else 0.35), pan=0.3 * (1 if h % 2 else -1), limit=False)
            if frac > 0.45 and not after and b in (1, 3) and style == "drive":
                mix.add(fx("snare"), tb, gain * 0.35, limit=False)
            # a soft melodic bell on the bar for the calm accounts
            if style == "soft" and b == 0:
                mix.add(tone("bell", root + 24 + ch[1], 1.2), tb, gain * 0.25, limit=False)
    # riser into the payoff, then the hit
    if hit < end:
        mix.add(fx("riser"), max(0, hit - 2.0), gain * 0.55, limit=False)
        mix.add(fx("crash"), hit, gain * 0.9, limit=False)
        mix.add(fx("kick"), hit, gain * 1.1, limit=False)
