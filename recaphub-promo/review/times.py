"""Review times for each film: one moment ~60% into every shot (for `stills.mjs sheet`).
Shot lengths in beats, as laid out by chain() in each film. Keep in sync when a film changes.

    python recaphub-promo/review/times.py            # every film: id and the seconds list
"""
FILMS = {
    "Launch": (128, [8, 8, 8, 8, 10, 8, 8, 8, 8, 8, 10, 8, 6, 8, 8, 8, 8, 8, 8, 8, 8, 10, 8, 12]),
    "Teaser": (132, [8, 6, 8, 8, 8, 6, 8]),
    "Shorts": (136, [10, 8, 8, 12, 12, 6, 12, 10, 10]),
    "Story": (124, [8, 8, 8, 16, 20, 16, 12, 10, 8, 8]),
    "Pages": (130, [8, 14, 10, 10, 12, 8, 8, 8]),
    "Press": (132, [8, 10, 12, 10, 10, 12, 10, 8]),
    "Intel": (126, [8, 12, 10, 10, 10, 10, 8, 8]),
    "Mcp": (136, [8, 8, 12, 12, 8, 8, 8]),
    "Live": (140, [8, 12, 10, 12, 12, 8, 8]),
    "Drive": (134, [8, 12, 10, 10, 12, 8, 8, 8]),
    "Analytics": (134, [8, 12, 12, 12, 8, 8, 8]),
    "Publish": (124, [8, 6, 8, 8, 4, 8, 8, 4, 8, 8, 10, 8, 8]),
}


def times(name, frac=0.6):
    bpm, lens = FILMS[name]
    spb, at, out = 60 / bpm, 0, []
    for n in lens:
        out.append(round((at + n * frac) * spb, 2))
        at += n
    return out, at * spb


if __name__ == "__main__":
    for k in FILMS:
        ts, total = times(k)
        print(k, f"{total:.1f}s", " ".join(map(str, ts)))
