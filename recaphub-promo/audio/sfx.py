"""The sound-effect kit for the promo films, synthesised (no samples, nothing licensed).

Every animated event in a film has a cue: a card arriving (whoosh-soft), a pop, a click, a key, a tick,
a whip between shots, a riser into a payoff, an impact on it. Short, clean and quiet, so they sit under
the music like a real editor's sound design rather than on top of it.

    python recaphub-promo/audio/sfx.py        # -> recaphub-promo/motion/public/sfx/*.wav
"""
from __future__ import annotations

import importlib.util
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("song", HERE / "song.py")
S = importlib.util.module_from_spec(spec)
spec.loader.exec_module(S)
SR, tt, norm, fade_edges, lowpass, highpass, bandpass, write_wav = S.SR, S.tt, S.norm, S.fade_edges, S.lowpass, S.highpass, S.bandpass, S.write_wav
OUT = HERE.parent / "motion" / "public" / "sfx"
rng = np.random.default_rng(11)


def sweep_noise(dur, f0, f1, width=0.5, shape=1.0):
    """Noise through a moving band (log sweep f0 -> f1), windowed STFT."""
    n = int(dur * SR)
    noise = rng.standard_normal(n + 4096)
    win, hop = 1024, 256
    w = np.sqrt(np.hanning(win))
    out = np.zeros(n + 4096)
    lf = np.log(np.fft.rfftfreq(win, 1 / SR) + 1)
    for i in range(0, n, hop):
        p = (i / n) ** shape
        fc = f0 * (f1 / f0) ** p
        mask = np.exp(-((lf - np.log(fc)) ** 2) / (2 * width ** 2))
        out[i:i + win] += np.fft.irfft(np.fft.rfft(noise[i:i + win] * w) * mask, win) * w
    return out[:n]


def env(n, attack, release, peak=0.5):
    """Swell to `peak` (fraction of length) then fall."""
    x = np.linspace(0, 1, n)
    up = np.clip(x / max(peak, 1e-3), 0, 1) ** attack
    down = np.clip((1 - x) / max(1 - peak, 1e-3), 0, 1) ** release
    return up * down


def stereo(x, width=0.25):
    d = int(0.004 * SR)
    l = x
    r = np.concatenate([np.zeros(d), x[:-d]]) if d else x
    return np.stack([l * (1 - width / 2), r * (1 - width / 2) + l * width / 2])


def whoosh():
    x = sweep_noise(0.62, 300, 2600, 0.6, 0.8) * env(int(0.62 * SR), 1.6, 1.4, 0.55)
    return stereo(norm(lowpass(x, 6000), 0.8))


def whoosh_soft():
    x = sweep_noise(0.5, 250, 1500, 0.55) * env(int(0.5 * SR), 1.5, 1.6, 0.5)
    return stereo(norm(lowpass(x, 3500), 0.55))


def whip():
    n = int(0.26 * SR)
    x = sweep_noise(0.26, 900, 7000, 0.5, 0.6) * env(n, 2.2, 1.0, 0.7)
    t = tt(0.26)
    x += np.sin(2 * np.pi * np.cumsum(180 + 400 * t / 0.26) / SR) * env(n, 1, 3, 0.75) * 0.25
    return stereo(norm(x, 0.8), 0.5)


def swish():
    n = int(0.3 * SR)
    x = highpass(sweep_noise(0.3, 2000, 6000, 0.6), 1500) * env(n, 1.3, 2.0, 0.4)
    return stereo(norm(x, 0.45))


def pop():
    return norm(S.sfx_pop(), 0.7)


def pop_soft():
    t = tt(0.1)
    f = 330 + 360 * (1 - np.exp(-t * 45))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 42)
    return fade_edges(norm(x, 0.55), 0.001, 0.01)


def click():
    t = tt(0.12)
    x = np.zeros_like(t)
    for d, g in ((0.0, 1.0), (0.055, 0.55)):
        tau = np.clip(t - d, 0, None)
        on = t >= d
        x += on * g * (bandpass(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-tau * 900) + 0.6 * np.sin(2 * np.pi * 1900 * tau) * np.exp(-tau * 700))
    return fade_edges(norm(x, 0.8), 0.0002, 0.01)


def tick():
    return norm(S.tick(), 0.5)


def key():
    return norm(S.sfx_key(), 0.5)


def bell(freqs, dur, decay, gains=None):
    t = tt(dur)
    gains = gains or [1] * len(freqs)
    x = sum(g * np.sin(2 * np.pi * f * t) * np.exp(-t * decay * (1 + i * 0.6)) for i, (f, g) in enumerate(zip(freqs, gains)))
    return fade_edges(norm(x), 0.001, 0.05)


def ding():
    f = 1318.5
    return stereo(norm(bell([f, f * 2.76, f * 5.4], 1.2, 3.2, [1, 0.35, 0.12]), 0.5))


def chime():
    a = bell([1318.5, 1318.5 * 2.76], 1.0, 3.5, [1, 0.3])
    b = bell([1975.5, 1975.5 * 2.76], 1.0, 3.5, [1, 0.3])
    d = int(0.09 * SR)
    x = np.zeros(len(a) + d)
    x[: len(a)] += a
    x[d:] += b * 0.8
    return stereo(norm(x, 0.5), 0.4)


def riser():
    return stereo(norm(S.riser(1.6, 300, 7000), 0.6), 0.4)


def impact():
    t = tt(1.1)
    f = 34 + 46 * np.exp(-t * 11)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.4)
    air = lowpass(rng.standard_normal(len(t)), 3000) * np.exp(-t * 14) * 0.45
    x = np.tanh(1.5 * (boom + air))
    return stereo(fade_edges(norm(x, 0.85), 0.0005, 0.2), 0.3)


def thud():
    t = tt(0.28)
    f = 55 + 70 * np.exp(-t * 40)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16)
    x += lowpass(rng.standard_normal(len(t)), 1200) * np.exp(-t * 80) * 0.3
    return fade_edges(norm(x, 0.7), 0.0005, 0.02)


def shimmer():
    t = tt(1.0)
    x = np.zeros_like(t)
    for k in range(14):
        a = rng.uniform(0, 0.45)
        f = rng.uniform(2600, 7600)
        tau = np.clip(t - a, 0, None)
        x += (t >= a) * np.sin(2 * np.pi * f * tau) * np.exp(-tau * rng.uniform(7, 14)) * rng.uniform(0.3, 1)
    return stereo(fade_edges(norm(x, 0.35), 0.002, 0.1), 0.7)


def snap():
    t = tt(0.07)
    x = bandpass(rng.standard_normal(len(t)), 1800, 5200) * np.exp(-t * 160)
    return fade_edges(norm(x, 0.65), 0.0002, 0.01)


def slide():
    n = int(0.4 * SR)
    x = bandpass(rng.standard_normal(n), 400, 3000) * env(n, 1.2, 1.8, 0.35)
    return stereo(norm(x, 0.4))


def bubble():
    t = tt(0.12)
    f = 500 + 900 * (t / 0.12) ** 1.5
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26)
    return fade_edges(norm(x, 0.5), 0.002, 0.01)


def page():
    n = int(0.32 * SR)
    x = sweep_noise(0.32, 1200, 4500, 0.7) * env(n, 0.9, 2.5, 0.3)
    return stereo(norm(x, 0.45))


def stamp():
    a = thud()
    b = click()
    x = np.zeros(max(len(a), len(b)))
    x[: len(a)] += a
    x[: len(b)] += b * 0.6
    return norm(x, 0.7)


KIT = {
    "whoosh": whoosh, "whoosh-soft": whoosh_soft, "whip": whip, "swish": swish, "pop": pop, "pop-soft": pop_soft,
    "click": click, "tick": tick, "key": key, "ding": ding, "chime": chime, "riser": riser, "impact": impact,
    "thud": thud, "shimmer": shimmer, "snap": snap, "slide": slide, "bubble": bubble, "page": page, "stamp": stamp,
}

if __name__ == "__main__":
    for name, fn in KIT.items():
        write_wav(OUT / f"{name}.wav", fn())
    print(f"{len(KIT)} effects -> {OUT}")
