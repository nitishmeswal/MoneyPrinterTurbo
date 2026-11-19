"""Soundtracks for the promo films: neat, fast, punchy and quiet (mastered to -16 LUFS in render.ps1).

Each track follows its film's cut plan, in beats: a sparse intro with a stab on each hook line, a build
where the product starts, a half-beat stop and a drop on the payoff, the end chord on the end card. The
film and its track share the tempo, so every cut and every cue lands on the grid.

KEEP IN SYNC: `bpm` and the beat numbers here must match the film's FilmDef (motion/src/films/<Film>.tsx).
To use a licensed track instead, drop it at motion/public/music/<name>.wav at the same tempo, starting on
beat 0, and skip this script for that film.

    python recaphub-promo/audio/score.py all
    python recaphub-promo/audio/score.py launch shorts
"""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("song", HERE / "song.py")
cm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cm)
Song, P, write_wav, SR = cm.Song, cm.P, cm.write_wav, cm.SR
OUT = HERE.parent / "motion" / "public" / "music"


def arc(bpm, total, prog, *, stabs=(), build, drop, end, lead=None, lead2=None, tail=1.6, hits=(), lifts=()):
    lead = lead or P(0, 3, 6, 10, 13)
    lead2 = lead2 or P(0, 3, 6, 8, 11, 14)
    s = Song(bpm, total, tail, prog)
    s.groove(0, build, kick="none", clap=False, hats=True, shaker=True, bass="long", pluck=lead, bright=0.5, pad=True, bar_accent=0, v=0.7)
    for i, b in enumerate(stabs):
        s.impact(b, 0.5 if i else 0.7, 0.8)
        s.stab(b, s.chord_at(b)[1], 0.8)
    s.riser(max(0, build - 4), build, 0.6)
    s.groove(build, drop - 0.5, kick="four", clap=False, bass="off", pluck=lead, bright=0.85, open_hats=False, bar_accent=0.42, v=0.85)
    for b in lifts:  # a small lift inside the build (a new act), without stopping the groove
        s.riser(b - 4, b, 0.4)
        s.impact(b, 0.4, 0.7)
    s.riser(max(build, drop - 6), drop, 0.8)
    s.fill(drop - 1.5, 1, 0.7)
    s.mute(drop - 0.5, drop)
    s.impact(drop, 0.9, 1.0)
    s.stab(drop, s.chord_at(drop)[1], 0.9)
    s.groove(drop, end, pluck=lead2, bright=1.15, bass="drive", open_hats=True)
    for b in hits:
        s.impact(b, 0.45, 0.85)
    s.fill(end - 1, 1, 0.7)
    root, chord = s.chord_at(end)
    s.impact(end, 0.75)
    s.stab(end, chord + [chord[0] + 12], 0.95)
    s.pad(end, [c - 12 for c in chord], 5, 1.0)
    s.bass(end, root, 4, 0.8)
    return s


KEYS = {
    "Fm": [(41, [65, 68, 72]), (37, [65, 68, 73]), (44, [63, 68, 72]), (39, [63, 67, 70])],
    "Am": [(45, [64, 69, 72]), (41, [65, 69, 72]), (36, [64, 67, 72]), (43, [62, 67, 71])],
    "Dm": [(38, [62, 65, 69]), (34, [62, 65, 70]), (41, [60, 65, 69]), (36, [60, 64, 67])],
    "Em": [(40, [64, 67, 71]), (36, [64, 67, 72]), (43, [62, 67, 71]), (38, [62, 66, 69])],
    "Bm": [(35, [62, 66, 71]), (31, [62, 67, 71]), (38, [62, 66, 69]), (33, [61, 64, 69])],
    "Gm": [(43, [62, 67, 70]), (39, [63, 67, 70]), (34, [62, 65, 70]), (41, [60, 65, 69])],
    "Cm": [(36, [60, 63, 67]), (32, [60, 63, 68]), (39, [63, 67, 70]), (34, [62, 65, 70])],
    "C#m": [(37, [61, 64, 68]), (33, [61, 64, 69]), (40, [59, 64, 68]), (35, [59, 63, 66])],
    "F#m": [(42, [61, 66, 69]), (38, [62, 66, 69]), (45, [61, 64, 69]), (40, [59, 64, 68])],
    "Ebm": [(39, [63, 66, 70]), (35, [63, 66, 71]), (42, [61, 66, 70]), (37, [61, 65, 68])],
    "G#m": [(44, [63, 68, 71]), (40, [64, 68, 71]), (47, [63, 66, 71]), (42, [61, 66, 70])],
    "Bbm": [(46, [65, 70, 73]), (42, [66, 70, 73]), (37, [65, 68, 73]), (44, [63, 68, 72])],
}

# film -> its cut plan in beats (see each film's header comment)
TRACKS = {
    "launch": dict(bpm=128, total=200, key="Dm", stabs=[0, 8, 16], build=24, lifts=[42, 76, 116, 146], drop=100, end=188, lead=P(0, 3, 7, 10, 14)),
    "teaser": dict(bpm=132, total=52, key="Fm", stabs=[0, 4], build=8, drop=14, end=44, lead=P(0, 3, 6, 10, 13)),
    "shorts": dict(bpm=136, total=88, key="Am", stabs=[0, 4, 10], build=18, drop=56, end=78, lead=P(2, 6, 10, 13, 14)),
    "story": dict(bpm=124, total=114, key="Gm", stabs=[0, 8], build=16, lifts=[40, 60], drop=88, end=106, lead=P(0, 3, 7, 10, 14)),
    "pages": dict(bpm=130, total=78, key="Em", stabs=[0, 2, 4], build=8, drop=54, end=70, lead=P(0, 3, 6, 8, 11)),
    "press": dict(bpm=132, total=80, key="Bm", stabs=[0, 4], build=8, drop=62, end=72, lead=P(0, 2, 6, 10, 12, 14)),
    "intel": dict(bpm=126, total=76, key="Cm", stabs=[0, 4], build=8, drop=60, end=68, lead=P(0, 3, 7, 10, 14)),
    "mcp": dict(bpm=136, total=64, key="C#m", stabs=[0, 4], build=8, drop=48, end=56, lead=P(2, 6, 10, 13, 14)),
    "live": dict(bpm=140, total=70, key="F#m", stabs=[0, 4], build=8, drop=54, end=62, lead=P(0, 2, 4, 6, 8, 10, 12, 14)),
    "drive": dict(bpm=134, total=76, key="Ebm", stabs=[0, 4], build=8, drop=60, end=68, lead=P(0, 3, 6, 9, 12)),
    "analytics": dict(bpm=134, total=68, key="Bbm", stabs=[0, 4], build=8, drop=52, end=60, lead=P(0, 3, 6, 10, 12)),
    "publish": dict(bpm=124, total=96, key="G#m", stabs=[0], build=8, lifts=[30, 50], drop=80, end=88, lead=P(0, 3, 6, 10, 13)),
}


def build(name: str) -> None:
    c = dict(TRACKS[name])
    key = c.pop("key")
    s = arc(c.pop("bpm"), c.pop("total"), KEYS[key], **c)
    audio = s.render()
    write_wav(OUT / f"{name}.wav", audio)
    print(f"{name}: {audio.shape[1] / SR:.1f}s  {s.bpm} BPM  {key}", flush=True)


if __name__ == "__main__":
    names = sys.argv[1:] or ["all"]
    for n in (TRACKS if names == ["all"] else names):
        build(n)
