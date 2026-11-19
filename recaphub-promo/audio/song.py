"""Compose the RecapHub film soundtracks in code: neat, fast, punchy, not loud.

Every note sits exactly on the beat grid, so the films need no beat map: a
film's timeline only needs the tempo. Each track follows its film's story
(hook, reveal hit, groove under the product, a stop before the payoff, the end
chord on the end card), and this script writes the hits it placed into the
film's timeline as `accents`, so the picture can punch in on them.

    python recaphub-videos/compose.py teaser     # -> motion/public/launch/music-rh-teaser.wav
    python recaphub-videos/compose.py shorts
    python recaphub-videos/compose.py story
    python recaphub-videos/compose.py all        # every track, plus the UI sound effects
    python recaphub-videos/compose.py sfx        # just the sound effects (snip, tick, pop, key)

Sound: a tight kick (short decay, so it is punchy rather than boomy), a
layered clap, crisp hats and shakers, a sub bass that ducks under the kick,
additive-synth plucks whose filter closes on every note, a soft pad and, for
the story film, felt keys and a ticking clock. A gentle glue clip, then the
peak sits at -1 dBFS. The finished film is loudness-normalised in polish.py.
"""

from __future__ import annotations

import argparse
import json
import wave
from pathlib import Path

import numpy as np

SR = 44100
HERE = Path(__file__).resolve().parent
PUB = HERE / "motion" / "public" / "launch"
TLDIR = HERE / "motion" / "src"
rng = np.random.default_rng(7)


# ------------------------------------------------------------------ dsp helpers

def hz(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


def _fft_filter(x: np.ndarray, mask_fn) -> np.ndarray:
    n = len(x)
    pad = np.concatenate([x, np.zeros(min(n, SR))])
    X = np.fft.rfft(pad)
    f = np.fft.rfftfreq(len(pad), 1 / SR)
    return np.fft.irfft(X * mask_fn(f), len(pad))[:n]


def lowpass(x, fc, order=2):
    return _fft_filter(x, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order)))


def highpass(x, fc, order=2):
    return _fft_filter(x, lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * order)))


def bandpass(x, lo, hi, order=2):
    return highpass(lowpass(x, hi, order), lo, order)


def tt(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * SR)) / SR


def fade_edges(x: np.ndarray, a=0.002, r=0.006) -> np.ndarray:
    n = len(x)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e = np.ones(n)
    e[: min(na, n)] = np.linspace(0, 1, min(na, n))
    e[-min(nr, n):] *= np.linspace(1, 0, min(nr, n))
    return x * e


def norm(x: np.ndarray, peak=1.0) -> np.ndarray:
    m = np.max(np.abs(x)) or 1.0
    return x * (peak / m)


# ------------------------------------------------------------------ instruments (mono, normalised)

def kick(punch=1.0) -> np.ndarray:
    t = tt(0.3)
    f = 47 + 125 * punch * np.exp(-t * 34)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)
    click = highpass(rng.standard_normal(len(t)) * np.exp(-t * 1100), 2500) * 0.22
    x = np.tanh(1.9 * (body + click)) / np.tanh(1.9)
    return fade_edges(x, 0.0005, 0.02)


def clap() -> np.ndarray:
    t = tt(0.32)
    e = np.zeros_like(t)
    for d in (0.0, 0.008, 0.017):
        on = t >= d
        e += on * np.exp(-np.clip(t - d, 0, None) * 230)
    on = t >= 0.024
    e += on * np.exp(-np.clip(t - 0.024, 0, None) * 17) * 0.6
    x = bandpass(rng.standard_normal(len(t)) * e, 950, 4600)
    return fade_edges(norm(x), 0.0005, 0.02)


def hat(open_=False) -> np.ndarray:
    t = tt(0.36 if open_ else 0.07)
    x = highpass(rng.standard_normal(len(t)), 7200 if not open_ else 6400, 3) * np.exp(-t * (9 if open_ else 75))
    return fade_edges(norm(x), 0.0005, 0.01)


def shaker() -> np.ndarray:
    t = tt(0.1)
    e = np.minimum(t / 0.006, 1) * np.exp(-t * 48)
    x = bandpass(rng.standard_normal(len(t)), 4200, 10500) * e
    return fade_edges(norm(x), 0.001, 0.01)


def bass(m: float, dur: float) -> np.ndarray:
    t = tt(dur)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.28 * np.sin(4 * np.pi * f * t) + 0.1 * np.sin(6 * np.pi * f * t)
    x = np.tanh(1.5 * x) / np.tanh(1.5)
    return fade_edges(x, 0.004, min(0.03, dur / 3))


def pluck(m: float, dur=0.34, bright=1.0) -> np.ndarray:
    t = tt(dur)
    f = hz(m)
    K = max(1, min(30, int(9500 / f)))
    k = np.arange(1, K + 1)[:, None]
    fc = 380 + 3600 * bright * np.exp(-t * 15)
    phase = rng.uniform(0, 2 * np.pi, (K, 1))
    x = np.sum(np.sin(2 * np.pi * f * k * t + phase) / k * np.exp(-(k * f) / fc), axis=0)
    x *= np.exp(-t * 7.5)
    return fade_edges(norm(x), 0.002, 0.03)


def keys(m: float, dur=1.6) -> np.ndarray:
    """Felt keys: soft hammer, few partials, the high ones die first."""
    t = tt(dur)
    f = hz(m)
    amps = [1, 0.42, 0.2, 0.09, 0.05]
    rates = [2.4, 3.8, 5.5, 7.5, 10]
    x = sum(a * np.sin(2 * np.pi * f * (i + 1) * (1 + 0.0004 * i) * t) * np.exp(-t * r) for i, (a, r) in enumerate(zip(amps, rates)))
    x += lowpass(rng.standard_normal(len(t)), 1400) * np.exp(-t * 220) * 0.08
    return fade_edges(norm(x), 0.004, 0.08)


def pad(chord: list[int], dur: float) -> np.ndarray:
    """Soft saw pad, two detuned voices per note, one per side (stereo, 2 x n)."""
    t = tt(dur)
    out = np.zeros((2, len(t)))
    for m in chord:
        for side, det in ((0, -0.11), (1, 0.11)):
            f = hz(m + det)
            ph = rng.uniform(0, 1)
            out[side] += 2 * ((f * t + ph) % 1) - 1
    env = np.minimum(t / 0.05, 1) * np.minimum((dur - t) / 0.18, 1).clip(0, 1)
    out = np.stack([lowpass(out[0], 1900, 2), lowpass(out[1], 1900, 2)]) * env
    return out / (np.max(np.abs(out)) or 1)


def riser(dur: float, f0=280.0, f1=9000.0) -> np.ndarray:
    n = int(dur * SR)
    noise = rng.standard_normal(n + 4096)
    win, hop = 2048, 512
    w = np.sqrt(np.hanning(win))
    out = np.zeros(n + 4096)
    fr = np.fft.rfftfreq(win, 1 / SR)
    lf = np.log(fr + 1)
    for i in range(0, n, hop):
        p = i / n
        fc = f0 * (f1 / f0) ** p
        mask = np.exp(-((lf - np.log(fc)) ** 2) / (2 * 0.55 ** 2))
        out[i:i + win] += np.fft.irfft(np.fft.rfft(noise[i:i + win] * w) * mask, win) * w
    out = out[:n]
    p = np.arange(n) / n
    sweep = np.sin(2 * np.pi * np.cumsum(220 * (6 ** p)) / SR) * 0.12
    x = (norm(out) * 0.9 + sweep) * p ** 2.4
    return fade_edges(x, 0.01, 0.01)


def impact() -> np.ndarray:
    t = tt(1.6)
    f = 31 + 40 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    hitn = lowpass(rng.standard_normal(len(t)), 2600) * np.exp(-t * 7) * 0.5
    x = np.tanh(1.6 * (boom + hitn))
    return fade_edges(norm(x), 0.0005, 0.2)


def tick() -> np.ndarray:
    t = tt(0.04)
    x = np.sin(2 * np.pi * 2700 * t) * np.exp(-t * 650) + 0.6 * np.sin(2 * np.pi * 1350 * t) * np.exp(-t * 320)
    return fade_edges(norm(x), 0.0002, 0.005)


# ------------------------------------------------------------------ sound effects for the films

def sfx_snip() -> np.ndarray:
    t = tt(0.16)
    x = np.zeros_like(t)
    for d, g in ((0.0, 1.0), (0.055, 0.8)):
        on = t >= d
        tau = np.clip(t - d, 0, None)
        x += on * g * (highpass(rng.standard_normal(len(t)), 3200) * np.exp(-tau * 420) + 0.5 * np.sin(2 * np.pi * 4300 * tau) * np.exp(-tau * 260))
    return fade_edges(norm(x, 0.9), 0.0003, 0.01)


def sfx_pop() -> np.ndarray:
    t = tt(0.12)
    f = 520 + 520 * (1 - np.exp(-t * 50))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38)
    return fade_edges(norm(x, 0.8), 0.001, 0.01)


def sfx_key() -> np.ndarray:
    t = tt(0.06)
    x = bandpass(rng.standard_normal(len(t)), 1800, 6500) * np.exp(-t * 330) * 0.7 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 90) * 0.5
    return fade_edges(norm(x, 0.7), 0.0003, 0.008)


def write_wav(path: Path, x: np.ndarray) -> None:
    """x: mono (n,) or stereo (2, n), float in -1..1."""
    if x.ndim == 1:
        x = np.stack([x, x])
    data = (np.clip(x.T, -1, 1) * 32767).astype("<i2")
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def make_sfx() -> None:
    for name, fn in (("snip", sfx_snip), ("pop", sfx_pop), ("key", sfx_key), ("tick", lambda: norm(tick(), 0.7))):
        write_wav(PUB / "sfx" / f"{name}.wav", fn())
        print(f"sfx  {PUB / 'sfx' / (name + '.wav')}")


# ------------------------------------------------------------------ the song engine

BUSES = ("kick", "drums", "bass", "music", "pad", "keys", "fx", "tick")


class Song:
    def __init__(self, bpm: float, beats: float, tail: float, prog: list[tuple[int, list[int]]], bars_per_chord=1):
        self.bpm = bpm
        self.b = 60 / bpm
        self.n = int((beats * self.b + tail + 2.0) * SR)
        self.len = beats * self.b + tail
        self.bus = {k: np.zeros((2, self.n)) for k in BUSES}
        self.send = np.zeros((2, self.n))
        self.kicks: list[float] = []
        self.prog = prog
        self.bpc = bars_per_chord
        self.mutes: list[tuple[float, float]] = []
        self.accents: list[list[float]] = []

    def T(self, beat: float) -> float:
        return beat * self.b

    def chord_at(self, beat: float) -> tuple[int, list[int]]:
        return self.prog[int(beat // (4 * self.bpc)) % len(self.prog)]

    def place(self, bus: str, x: np.ndarray, beat: float, gain=1.0, pan=0.0, send=0.0) -> None:
        i = int(round(self.T(beat) * SR))
        if i >= self.n:
            return
        if x.ndim == 1:
            a = (pan + 1) * np.pi / 4
            x = np.stack([x * np.cos(a), x * np.sin(a)]) * np.sqrt(2)
        m = min(x.shape[1], self.n - i)
        self.bus[bus][:, i:i + m] += x[:, :m] * gain
        if send:
            self.send[:, i:i + m] += x[:, :m] * gain * send

    # instruments on the grid
    def kick(self, beat, v=1.0, punch=1.0):
        self.place("kick", kick(punch), beat, v)
        self.kicks.append(self.T(beat))

    def clap(self, beat, v=1.0):
        self.place("drums", clap(), beat, 0.62 * v, 0.0, 0.35)

    def hat(self, beat, v=1.0, open_=False):
        self.place("drums", hat(open_), beat, (0.17 if open_ else 0.22) * v, 0.18, 0.05)

    def shake(self, beat, v=1.0):
        self.place("drums", shaker(), beat, 0.11 * v, -0.22)

    def bass(self, beat, m, beats=0.5, v=1.0):
        self.place("bass", bass(m, beats * self.b * 0.92), beat, 0.62 * v)

    def pluck(self, beat, m, v=1.0, bright=1.0, pan=0.0):
        self.place("music", pluck(m, 0.36, bright), beat, 0.36 * v, pan, 0.3)

    def pad(self, beat, chord, beats, v=1.0):
        self.place("pad", pad(chord, beats * self.b), beat, 0.2 * v, 0.0, 0.4)

    def keys(self, beat, m, v=1.0, pan=0.0):
        self.place("keys", keys(m), beat, 0.34 * v, pan, 0.45)

    def tick(self, beat, v=1.0):
        self.place("tick", tick(), beat, 0.3 * v, 0.1, 0.12)

    def stab(self, beat, chord, v=1.0, accent=0.85):
        for i, m in enumerate(chord + [chord[0] + 12]):
            self.place("music", pluck(m, 0.6, 1.7), beat, 0.3 * v, (i - 1.5) * 0.25, 0.45)
        self.place("pad", pad(chord, 0.55), beat, 0.22 * v, 0.0, 0.5)
        self.accents.append([round(self.T(beat), 3), accent])

    def impact(self, beat, v=1.0, accent=1.0):
        self.place("fx", impact(), beat, 0.55 * v, 0.0, 0.5)
        self.kick(beat, 0.9 * v, 1.2)
        self.accents.append([round(self.T(beat), 3), accent])

    def riser(self, a, b, v=1.0):
        self.place("fx", riser(self.T(b) - self.T(a)), a, 0.3 * v, 0.0, 0.3)

    def mute(self, a, b):
        """Silence the dry instruments in [a, b): the reverb tails ring on into the gap."""
        self.mutes.append((self.T(a), self.T(b)))

    # patterns, 16 steps to the bar
    def groove(self, a: float, b: float, *, kick="four", clap=True, hats=True, shaker=True, open_hats=False,
               bass="off", pluck: list[int] | None = None, bright=1.0, pad=True, keys=False, ticks=False,
               bar_accent=0.42, v=1.0):
        step = 0.25
        s = a
        while s < b - 1e-6:
            pos = int(round((s % 4) / step))  # 0..15 within the bar
            root, chord = self.chord_at(s)
            if pos == 0 and bar_accent and kick != "none":
                self.accents.append([round(self.T(s), 3), bar_accent])
            if kick == "four" and pos % 4 == 0:
                self.kick(s, v)
            elif kick == "half" and pos in (0, 8):
                self.kick(s, 0.85 * v)
            elif kick == "pulse" and pos in (0, 10):
                self.kick(s, 0.7 * v, 0.8)
            if clap and pos in (4, 12):
                self.clap(s, v)
            if hats and pos in (2, 6, 10, 14):
                self.hat(s, v * (1.0 if pos != 14 else 0.85), open_hats and pos == 14)
            if shaker and pos % 2 == 1:
                self.shake(s, v * (0.7 + 0.3 * (pos % 4 == 3)) * (0.9 + 0.2 * rng.random()))
            if bass == "off" and pos in (2, 6, 10, 14):
                self.bass(s, root, 0.5, v)
            elif bass == "drive" and pos % 2 == 0 and pos % 4 != 0:
                self.bass(s, root + (12 if pos in (6, 14) else 0), 0.25, 0.9 * v)
            elif bass == "drive" and pos % 4 == 0:
                pass  # the kick owns the beat
            elif bass == "roll" and pos in (0, 3, 6, 10, 12):
                self.bass(s, root, 0.6, 0.85 * v)
            elif bass == "long" and pos == 0:
                self.bass(s, root, 3.8, 0.7 * v)
            if pluck and pluck[pos]:
                tones = chord + [chord[0] + 12, chord[1] + 12]
                idx = sum(pluck[:pos])
                self.pluck(s, tones[idx % len(tones)], v * (1.0 if pos % 4 == 0 else 0.82), bright, 0.28 if idx % 2 else -0.28)
            if pad and pos == 0 and (s / 4) % self.bpc < 1e-6 + 0:
                self.pad(s, chord, min(4 * self.bpc, b - s), v)
            if keys and pos in (0, 6, 10):
                tones = chord + [chord[0] + 12]
                self.keys(s, tones[{0: 0, 6: 1, 10: 2}[pos] % len(tones)] + (12 if pos else 0), v * (1 if pos == 0 else 0.7), (-0.2, 0.15, 0.25)[{0: 0, 6: 1, 10: 2}[pos]])
            if ticks and pos % 4 == 0:
                self.tick(s, v * (1 if pos == 0 else 0.75))
            s += step

    def fill(self, a: float, beats=1.0, v=1.0):
        """A clap roll that climbs into the next downbeat."""
        n = int(beats * 4)
        for i in range(n):
            self.clap(a + i * 0.25, v * (0.45 + 0.55 * (i + 1) / n))

    # ------------------------------------------------------------------ mixdown

    def render(self) -> np.ndarray:
        n = self.n
        # mutes on the dry buses
        gate = np.ones(n)
        for a, b in self.mutes:
            ia, ib = int(a * SR), int(b * SR)
            ramp = int(0.004 * SR)
            gate[ia:ib] = 0
            gate[max(0, ia - ramp):ia] *= np.linspace(1, 0, ia - max(0, ia - ramp))
            gate[ib:ib + ramp] *= np.linspace(0, 1, min(ramp, n - ib))
        # sidechain: everything melodic ducks under the kick
        imp = np.zeros(n)
        for k in self.kicks:
            i = int(k * SR)
            if i < n:
                imp[i] = 1
        kt = np.arange(int(0.35 * SR)) / SR
        kern = np.minimum(kt / 0.004, 1) * np.exp(-kt / 0.085)
        L = 1 << int(np.ceil(np.log2(n + len(kern))))
        duck = np.clip(np.fft.irfft(np.fft.rfft(imp, L) * np.fft.rfft(kern, L), L)[:n], 0, 1)
        sc_bass = 1 - 0.7 * duck
        sc_mus = 1 - 0.42 * duck

        B = self.bus
        dry = (
            B["kick"] * 0.95
            + B["drums"] * 0.9
            + B["bass"] * sc_bass
            + B["music"] * sc_mus
            + B["pad"] * sc_mus
            + B["keys"]
        ) * gate + B["fx"] + B["tick"] * gate
        # a quiet 3/16 ping-pong on the plucks
        d = int(0.75 * self.b * SR)
        mus = (B["music"] * sc_mus * gate).sum(axis=0)
        echo = lowpass(mus, 3200)
        dl = np.zeros(n)
        dr = np.zeros(n)
        dl[d:] = echo[:-d] * 0.16
        dr[2 * d:] = echo[:-2 * d] * 0.1
        dry += np.stack([dl, dr])
        # reverb: decaying noise, a little predelay, darker tail
        irl = int(1.7 * SR)
        it = np.arange(irl) / SR
        pre = int(0.014 * SR)
        rev = np.zeros((2, n))
        for c in range(2):
            ir = rng.standard_normal(irl) * np.exp(-it / 0.36)
            ir = lowpass(ir, 5200)
            ir[:pre] = 0
            ir /= np.sqrt(np.sum(ir ** 2))
            L = 1 << int(np.ceil(np.log2(n + irl)))
            src = self.send[c] * np.concatenate([gate[:1], gate[1:]])  # sends follow the gate at the source
            rev[c] = np.fft.irfft(np.fft.rfft(src, L) * np.fft.rfft(ir, L), L)[:n]
        mix = dry + rev * 0.33
        # tame the sub below 30 Hz and the air above 15 kHz
        mix = np.stack([highpass(lowpass(mix[c], 12500, 1), 28, 2) for c in range(2)])
        # glue: a soft clip that rounds the peaks without pumping
        mix = norm(mix, 1.0)
        mix = np.tanh(mix * 1.6) / np.tanh(1.6)
        # end: fade the last half second of the tail
        end = int(self.len * SR)
        fade = int(0.5 * SR)
        mix[:, end - fade:end] *= np.linspace(1, 0, fade)
        mix[:, end:] = 0
        mix = mix[:, :end]
        return norm(mix, 10 ** (-1 / 20))


# ------------------------------------------------------------------ the three tracks

def P(*steps: int) -> list[int]:
    """A 16-step pattern from the hit positions."""
    return [1 if i in steps else 0 for i in range(16)]


def teaser() -> Song:
    """124 BPM, D minor. Hook on a ticking drone, the logo on an impact with three
    stabs (one per sheet of the mark), a build, then the groove under the fast cuts,
    a half-beat stop before "Your audience didn't.", and the end chord."""
    prog = [(38, [62, 65, 69]), (34, [58, 62, 65]), (41, [60, 65, 69]), (36, [60, 64, 67])]
    s = Song(124, 38, 1.4, prog)
    # hook (0-4): low drone, clock-like hats, a riser into the reveal
    s.pad(0, [50, 57, 62], 4, 0.8)
    s.bass(0, 26, 4, 0.5)
    for b in np.arange(0, 4, 0.5):
        s.tick(b, 0.7 if b % 1 else 1.0)
    s.riser(1, 4, 1.0)
    # reveal (4-12): impact, three stabs on 4, 4.75, 5.5, then a half-time build
    s.impact(4)
    for b in (4, 4.75, 5.5):
        s.stab(b, [62, 65, 69], 1.0 if b == 4 else 0.85, 0.8)
    s.pad(6, [58, 62, 65], 2, 0.8)
    s.groove(8, 12, kick="four", clap=False, shaker=True, bass="off", pluck=None, pad=True, bar_accent=0.0, v=0.85)
    s.fill(11, 1, 0.8)
    s.riser(9, 12, 0.9)
    # drop (12-29.5): the groove under clips, pages, answers
    s.impact(12, 0.8, 0.9)
    pl = P(0, 3, 6, 10, 13)
    s.groove(12, 29.5, pluck=pl, bright=1.1, bass="drive", open_hats=True)
    s.fill(28, 1.5, 0.9)
    s.mute(29.5, 30)
    # "Your audience didn't." (30), then the end card groove and the last chord
    s.impact(30, 0.9)
    s.stab(30, [62, 65, 69], 1.0)
    s.groove(30.5, 36, pluck=P(0, 3, 6, 10, 13), bright=0.9, bass="off", clap=True, bar_accent=0.0, v=0.85)
    s.stab(36, [62, 65, 69, 74], 0.9, 0.7)
    s.pad(36, [50, 57, 62, 65], 3.2, 0.9)
    s.bass(36, 38, 2.5, 0.8)
    s.kick(36, 0.9)
    return s


def shorts() -> Song:
    """128 BPM, E minor / G. Stabs on every word of the hook, the groove from the
    problem on, the drop on the upload, a one-beat stop after "Download all" and
    the payoff on the hit after it."""
    prog = [(40, [64, 67, 71]), (36, [64, 67, 72]), (43, [62, 67, 71]), (38, [62, 66, 69])]
    s = Song(128, 74, 1.3, prog)
    # hook (0-8): "One keynote." 0, "12 clips." 2, "Before the coffee break ends." 4-7
    s.impact(0, 0.9)
    s.stab(0, [64, 67, 71])
    s.stab(2, [60, 64, 67], 0.9)
    s.stab(4, [62, 67, 71], 0.9)
    for b in np.arange(0, 8, 0.5):
        s.hat(b + 0.25, 0.8)
    for b in (2, 4, 5, 6, 7):
        s.kick(b, 0.85)
    s.stab(6, [62, 66, 69], 0.7, 0.5)
    s.fill(7, 1, 0.7)
    # problem (8-16): groove without the lead, a riser into the drop
    s.groove(8, 16, pluck=None, bass="off", open_hats=False, bar_accent=0.42, v=0.9)
    s.riser(12, 16, 0.9)
    s.fill(15, 1, 0.8)
    # product (16-55): full groove; the lead changes on the clip slice (22) and in the chat edit (42)
    s.impact(16, 0.85, 0.95)
    s.groove(16, 22, pluck=P(2, 6, 10, 13, 14), bright=1.0, bass="drive")
    s.impact(22, 0.6, 0.8)
    s.groove(22, 42, pluck=P(0, 3, 6, 8, 11, 14), bright=1.15, bass="drive", open_hats=True)
    s.fill(41, 1, 0.7)
    s.groove(42, 55, pluck=P(2, 6, 10, 13, 14), bright=1.0, bass="drive", open_hats=True)
    s.mute(55, 56)
    # payoff (56-72): the hit, the lead at full brightness
    s.impact(56)
    s.stab(56, [64, 67, 71, 76], 1.0, 0.9)
    s.groove(56.5, 72, pluck=P(0, 3, 6, 8, 11, 14), bright=1.3, bass="drive", open_hats=True)
    s.fill(71, 1, 0.8)
    s.impact(72, 0.8)
    s.stab(72, [64, 67, 71, 76], 1.0)
    s.pad(72, [52, 59, 64, 67], 2.5, 1.0)
    s.bass(72, 40, 2, 0.8)
    return s


def story() -> Song:
    """116 BPM, A minor / C. Felt keys and a ticking clock under the problem (the
    clock is the rhythm, so the energy rises instead of dipping), a build on "She
    asked.", the drop on step 01 and the groove through the three steps."""
    intro = [(45, [57, 60, 64]), (41, [57, 60, 65]), (36, [55, 60, 64]), (43, [55, 59, 62])]
    groove = [(41, [60, 65, 69]), (43, [62, 67, 71]), (40, [59, 64, 67]), (45, [60, 64, 69])]
    s = Song(116, 100, 1.6, intro, bars_per_chord=1)
    # message (0-8) and problem (8-20): keys, ticks on every beat, sub pulse, then half-time kick
    # (quiet against the drop on purpose, but never empty: keys, ticks and a shaker from the first frame)
    s.groove(0, 8, kick="none", clap=False, hats=False, shaker=True, bass="long", pluck=None, pad=True, keys=True, ticks=True, bar_accent=0, v=1.5)
    s.groove(8, 12, kick="none", clap=False, hats=True, shaker=True, bass="long", pluck=None, pad=True, keys=True, ticks=True, bar_accent=0, v=1.5)
    s.groove(12, 20, kick="pulse", clap=False, hats=True, shaker=True, bass="long", pluck=None, pad=True, keys=True, ticks=True, bar_accent=0, v=1.3)
    # turn (20-28): the build, claps quickening, a stop just before the drop
    s.groove(20, 27.5, kick="four", clap=False, hats=True, shaker=True, bass="off", pluck=None, pad=True, keys=False, ticks=True, bar_accent=0, v=0.9)
    for b in np.arange(20, 24, 0.5):
        s.clap(b, 0.4 + 0.1 * (b - 20) / 4)
    for b in np.arange(24, 27.5, 0.25):
        s.clap(b, 0.5 + 0.45 * (b - 24) / 3.5)
    s.riser(20, 28, 1.0)
    s.mute(27.5, 28)
    # the steps (28-96)
    s.prog = groove
    s.impact(28)
    s.stab(28, [60, 65, 69])
    s.groove(28, 44, pluck=P(0, 3, 6, 10, 13), bright=0.95, bass="off", keys=False)
    s.fill(43, 1, 0.7)
    s.groove(44, 56, pluck=P(0, 3, 6, 8, 11, 14), bright=1.1, bass="drive", open_hats=True)
    s.fill(55, 1, 0.75)
    s.impact(56, 0.6, 0.8)
    s.groove(56, 80, pluck=P(0, 3, 6, 8, 11, 14), bright=1.1, bass="drive", open_hats=True)
    s.fill(79, 1, 0.75)
    s.groove(80, 92, pluck=P(0, 3, 6, 10, 13), bright=1.2, bass="drive", open_hats=True, keys=True)
    s.fill(91, 1, 0.8)
    # end (92-100): the hit on the logo, groove under the CTA, last chord on 96
    s.impact(92)
    s.stab(92, [60, 64, 69])
    s.groove(92.5, 96, pluck=P(0, 3, 6, 10, 13), bright=1.0, bass="off")
    s.stab(96, [60, 64, 69, 72], 0.9, 0.7)
    s.pad(96, [57, 64, 69, 72], 4.5, 1.0)
    s.keys(96, 57, 0.9)
    s.keys(96, 64, 0.6)
    s.bass(96, 45, 3, 0.8)
    s.kick(96, 0.9)
    return s


def promo(bpm: float, total: float, prog, *, stabs, drop, end_hit, stops=(), impacts=(), switch=None,
          lead=None, lead2=None, tail=1.3, intro="half") -> Song:
    """The feature-promo shape: a stab per hook line over a light groove, a riser
    into the drop where the product starts, the lead changing halfway through the
    product, a half-beat stop before each payoff hit, and the end chord under the
    end card. Every promo track is this shape in its own key, tempo and lead."""
    lead = lead or P(0, 3, 6, 10, 13)
    lead2 = lead2 or P(0, 3, 6, 8, 11, 14)
    s = Song(bpm, total, tail, prog)
    for i, b in enumerate(stabs):
        if i == 0:
            s.impact(b, 0.8, 0.95)
        s.stab(b, s.chord_at(b)[1], 1.0 if i == 0 else 0.85)
    s.groove(0, drop, kick=intro, clap=False, bass="off", pluck=None, bar_accent=0, v=0.85)
    s.riser(max(0, drop - 4), drop, 0.9)
    s.fill(drop - 1, 1, 0.8)
    s.impact(drop, 0.9, 0.95)
    mid = switch or end_hit
    s.groove(drop, mid, pluck=lead, bass="drive", open_hats=True)
    if switch:
        s.groove(switch, end_hit, pluck=lead2, bright=1.2, bass="drive", open_hats=True)
    for b in impacts:
        s.impact(b, 0.6, 0.85)
    for b in stops:
        s.mute(b, b + 0.5)
        s.impact(b + 0.5, 0.9, 0.95)
    s.fill(end_hit - 1, 1, 0.8)
    root, chord = s.chord_at(end_hit)
    s.impact(end_hit, 0.85)
    s.stab(end_hit, chord + [chord[0] + 12], 1.0)
    s.pad(end_hit, [c - 12 for c in chord], 4, 1.0)
    s.bass(end_hit, root, 3, 0.8)
    return s


# keys: F, C minor, B minor, A, G minor, E, D, E flat (every promo in its own key and tempo)
TRACKS = {
    "teaser": teaser,
    "shorts": shorts,
    "story": story,
    "pages": lambda: promo(120, 74, [(41, [65, 69, 72]), (36, [64, 67, 72]), (38, [62, 65, 69]), (34, [62, 65, 70])],
                           stabs=[0, 3], drop=12, switch=36, stops=[61.5], end_hit=70, lead=P(0, 3, 6, 8, 10, 13)),
    "press": lambda: promo(112, 68, [(36, [60, 63, 67]), (32, [60, 63, 68]), (39, [63, 67, 70]), (34, [62, 65, 70])],
                           stabs=[0, 1.5, 3], drop=12, switch=38, stops=[51.5], end_hit=64, lead=P(0, 2, 6, 10, 12, 14)),
    "intel": lambda: promo(110, 68, [(35, [62, 66, 71]), (31, [62, 67, 71]), (38, [62, 66, 69]), (33, [61, 64, 69])],
                           stabs=[0, 2, 4], drop=12, switch=32, stops=[51.5], end_hit=64, lead=P(0, 3, 7, 10, 14)),
    "mcp": lambda: promo(126, 64, [(33, [61, 64, 69]), (40, [64, 68, 71]), (42, [61, 66, 69]), (38, [62, 66, 69])],
                         stabs=[0, 1, 2], drop=12, switch=30, stops=[45.5], end_hit=60, lead=P(2, 6, 10, 13, 14)),
    "live": lambda: promo(132, 64, [(43, [62, 67, 70]), (39, [63, 67, 70]), (34, [62, 65, 70]), (41, [60, 65, 69])],
                          stabs=[0, 2, 4, 6], drop=16, switch=36, stops=[45.5], end_hit=60, lead=P(0, 2, 4, 6, 8, 10, 12, 14)),
    "drive": lambda: promo(118, 66, [(40, [64, 68, 71]), (37, [64, 68, 73]), (45, [64, 69, 73]), (35, [63, 66, 71])],
                           stabs=[0, 3], drop=12, switch=30, stops=[51.5], end_hit=62, lead=P(0, 3, 6, 9, 12)),
    "analytics": lambda: promo(122, 60, [(38, [62, 66, 69]), (33, [61, 64, 69]), (35, [62, 66, 71]), (43, [62, 67, 71])],
                               stabs=[0, 2], drop=12, switch=32, stops=[41.5], end_hit=56, lead=P(0, 3, 6, 10, 12)),
    "publish": lambda: promo(112, 92, [(39, [63, 67, 70]), (34, [62, 65, 70]), (36, [60, 63, 67]), (32, [60, 63, 68])],
                             stabs=[0, 2, 4], drop=8, switch=48, impacts=[28, 48], stops=[67.5], end_hit=88, tail=1.5,
                             lead=P(0, 3, 6, 10, 13)),
}


def build(name: str) -> None:
    song = TRACKS[name]()
    audio = song.render()
    out = PUB / f"music-rh-{name}.wav"
    write_wav(out, audio)
    tl_path = TLDIR / f"recaphub-{name}.json"
    if tl_path.exists():
        tl = json.loads(tl_path.read_text(encoding="utf-8"))
        tl["bpm"] = song.bpm
        tl["music"] = f"launch/music-rh-{name}.wav"
        tl["musicOffset"] = 0
        tl["accents"] = sorted(song.accents)
        tl_path.write_text(json.dumps(tl, indent=1), encoding="utf-8")
    rms = 20 * np.log10(np.sqrt(np.mean(audio ** 2)) + 1e-9)
    print(f"track {out}  {audio.shape[1] / SR:.1f}s  {song.bpm} BPM  rms {rms:.1f} dBFS  {len(song.accents)} accents")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("what", choices=[*TRACKS, "sfx", "all"])
    a = ap.parse_args()
    if a.what in ("sfx", "all"):
        make_sfx()
    for name in TRACKS if a.what == "all" else ([a.what] if a.what in TRACKS else []):
        build(name)


if __name__ == "__main__":
    main()
