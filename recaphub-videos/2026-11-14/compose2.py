"""Soundtracks for the 2026-11-14 films, in the shape of the reference (preview.mp4):
140-ish BPM, a sparse intro under the hook, a build through the product, a half-beat
stop and a drop on the payoff, and the end chord on the end card. Mastered quiet
(the finished films are loudness-normalised to -18 LUFS; the reference sits at -19.5).

    python recaphub-videos/2026-11-14/compose2.py all
    python recaphub-videos/2026-11-14/compose2.py teaser shorts
"""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("compose", HERE.parent / "compose.py")
cm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cm)
Song, P, write_wav, SR = cm.Song, cm.P, cm.write_wav, cm.SR
OUT = HERE / "motion" / "public" / "music"


def ref_style(bpm, total, prog, *, stabs=(), build, drop, end, lead=None, lead2=None, tail=1.6, hits=()):
    lead = lead or P(0, 3, 6, 10, 13)
    lead2 = lead2 or P(0, 3, 6, 8, 11, 14)
    s = Song(bpm, total, tail, prog)
    # intro: air, a soft pluck line, a sub under it; a hit on every hook line
    s.groove(0, build, kick="none", clap=False, hats=True, shaker=True, bass="long", pluck=lead, bright=0.5, pad=True, bar_accent=0, v=0.7)
    for i, b in enumerate(stabs):
        s.impact(b, 0.55 if i else 0.75, 0.8)
        s.stab(b, s.chord_at(b)[1], 0.8)
    s.riser(max(0, build - 4), build, 0.7)
    # build: four on the floor, no clap, the lead opening up
    s.groove(build, drop - 0.5, kick="four", clap=False, bass="off", pluck=lead, bright=0.85, open_hats=False, bar_accent=0.42, v=0.85)
    s.riser(max(build, drop - 6), drop, 0.85)
    s.fill(drop - 1.5, 1, 0.7)
    s.mute(drop - 0.5, drop)
    # drop: the payoff
    s.impact(drop, 0.95, 1.0)
    s.stab(drop, s.chord_at(drop)[1], 0.9)
    s.groove(drop, end, pluck=lead2, bright=1.15, bass="drive", open_hats=True)
    for b in hits:
        s.impact(b, 0.5, 0.85)
    # end card
    s.fill(end - 1, 1, 0.7)
    root, chord = s.chord_at(end)
    s.impact(end, 0.8)
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
}

# Each film's music follows its cut plan (beats): stabs on hook lines, the build where the product starts, the drop on the payoff, the end card.
TRACKS = {
    "teaser": dict(bpm=140, total=50, key="Fm", stabs=[0, 4], build=8, drop=18, end=42, lead=P(0, 3, 6, 10, 13)),
    "shorts": dict(bpm=140, total=84, key="Am", stabs=[0, 3], build=10, drop=60, end=76, lead=P(2, 6, 10, 13, 14)),
    "story": dict(bpm=128, total=112, key="Dm", stabs=[0], build=24, drop=84, end=104, lead=P(0, 3, 7, 10, 14)),
    "pages": dict(bpm=136, total=84, key="Em", stabs=[0, 2, 4], build=8, drop=60, end=76, lead=P(0, 3, 6, 8, 11)),
    "press": dict(bpm=132, total=80, key="Bm", stabs=[0, 2, 4], build=10, drop=56, end=72, lead=P(0, 2, 6, 10, 12, 14)),
    "intel": dict(bpm=126, total=80, key="Gm", stabs=[0, 3], build=10, drop=56, end=72, lead=P(0, 3, 7, 10, 14)),
    "mcp": dict(bpm=142, total=80, key="Cm", stabs=[0, 2, 4], build=8, drop=56, end=72, lead=P(2, 6, 10, 13, 14)),
    "live": dict(bpm=144, total=84, key="C#m", stabs=[0, 2, 4, 6], build=10, drop=60, end=76, lead=P(0, 2, 4, 6, 8, 10, 12, 14)),
    "drive": dict(bpm=134, total=80, key="F#m", stabs=[0, 4], build=10, drop=56, end=72, lead=P(0, 3, 6, 9, 12)),
    "analytics": dict(bpm=138, total=76, key="Ebm", stabs=[0, 4], build=8, drop=52, end=68, lead=P(0, 3, 6, 10, 12)),
    "publish": dict(bpm=124, total=112, key="G#m", stabs=[0, 4], build=10, drop=84, end=104, lead=P(0, 3, 6, 10, 13)),
}


def build(name: str) -> None:
    c = dict(TRACKS[name])
    key = c.pop("key")
    s = ref_style(c.pop("bpm"), c.pop("total"), KEYS[key], **c)
    audio = s.render()
    OUT.mkdir(parents=True, exist_ok=True)
    write_wav(OUT / f"{name}.wav", audio)
    print(f"{name}: {audio.shape[1] / SR:.1f}s  {s.bpm} BPM  {key}")


if __name__ == "__main__":
    names = sys.argv[1:] or ["all"]
    for n in (TRACKS if names == ["all"] else names):
        build(n)
