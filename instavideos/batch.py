"""Spec -> data (sim / trick / reveal / reflex) -> sound -> render -> finish, for many shorts.

    python instavideos/batch.py all                     # everything (skips finished videos)
    python instavideos/batch.py a01-break-out b05-...   # just these
    python instavideos/batch.py all --rebuild           # re-run seed searches and designs
    python instavideos/batch.py all --redo              # re-render and re-finish existing videos
    python instavideos/batch.py --posts                 # only rewrite posts.csv

Stops on the first failure and says which step and video failed. Finished
videos land in out/<account>/<id>.mp4; posts.csv holds captions, a posting
plan (one per account per day) and empty tracking columns from PLAYBOOK.md.
"""

from __future__ import annotations

import argparse
import csv
import json
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "engine"))
import challenge  # noqa: E402
import designed  # noqa: E402
import run_sim  # noqa: E402
import sand  # noqa: E402
from common import DATA, MOTION, OUT, all_specs, load_spec  # noqa: E402
from finish import finish  # noqa: E402

# One caption per video type (spec "idea"), reused for every video of that type.
CAPTIONS = {
    # Ball Arena
    "break-out": "Every bounce breaks a brick 🧱 Will it get out before time runs out? YES or NO 👇",
    "colour-escape": "4 balls, 1 tiny gap. Which colour gets out first? Comment yours before it ends 👇",
    "grow-stuck": "It gets bigger with every bounce 😳 Will it escape or get stuck?",
    "paint-war": "Every hit paints the wall 🎨 Which colour takes over the ring? Pick yours 👇",
    "nested-rings": "Ring after ring after ring 🔁 Can it break through every layer?",
    "hunter-prey": "The hunter wakes up in 4 seconds 👀 Who survives? Pick your ball 👇",
    # Mind Reader
    "vanishing-card": "Pick a card. Remember it. Now watch… 🃏 Did your card disappear?",
    "number-force": "Follow the steps and keep your number secret 🤫 I already know where you landed 🔮",
    "1089-prediction": "Think of any 3-digit number. The answer was sealed from the start ✉️ Did it match?",
    "finger-walk": "Put your finger on the screen and follow every move 👆 I'll find you.",
    "shell-tracker": "Keep your eye on the ball 👀 Which shell is it under? Comment before the reveal.",
    "mirror-morph": "Pick a shape and follow along 🔷 Watch what yours turns into.",
    "weighted-wheel": "I'll call it before it even spins 🎡 Was I right?",
    # Capsule World
    "pause-to-pick": "Pause anywhere to pick your capsule 🫧 Comment what you got!",
    "100-pull": "100 pulls. Can we find a Mythic? ✨ Real odds shown on screen.",
    "gold-box": "Only one box has the gold 🎁 Which one? Comment your number 👇",
    "egg-hatch": "What's inside this egg? 🥚 Guess the rarity before it hatches.",
    "rarity-ladder": "Common to Secret 💎 Which one would you keep?",
    "mystery-layers": "Layer after layer… what's at the very centre? 📦",
    # Reflex Lab
    "stop-on-green": "Pause the second it turns green ⏱️ Comment your time!",
    "count-the-balls": "Count fast 👀 How many did you see? Comment your number.",
    "odd-one-out": "Find the odd one out before time's up. It gets harder every round 👁️",
    "colour-word": "Say the COLOUR, not the word 🧠 Harder than it looks. How far did you get?",
    "memory-flash": "Memorise the sequence 🧠 How far did you get?",
    "pause-at-10": "Pause at exactly 10.00 ⏱️ Comment your time!",
    # Bounce Melody
    "name-the-song": "Every bounce plays the next note 🎵 Name the song before it ends!",
    "escape-before-song-ends": "Every bounce plays a note 🎶 Will it escape before the song ends?",
    "piano-ring": "Each colour plays its own note 🎹 Can it hit every single one?",
    # Marble Kingdom
    "countries-cup": "Countries Cup 🏆 Only the first ones out go through. Which country are you cheering for? Next round tomorrow.",
    "colour-league": "Colour League 🏁 Points every race, standings at the end. Who's your team? New race every day.",
    "bracket-flags": "Knockout bracket ⚔️ Lose and you're out. Who are you backing? Next round tomorrow.",
    "bracket-colours": "Colour knockout ⚔️ Lose and you're out. Who are you backing? Next round tomorrow.",
    "champion-of-champions": "Cup champion vs League champion 👑 One race decides it all. Who takes it?",
    # Daily Sensory (new series)
    "shrinking-arena": "The wall closes in every second 😬 Will it escape before it's crushed? YES or NO 👇",
    "colour-mix": "Where colours cross, they mix 🎨 Which colour covers the most? Pick one 👇",
    "spike-wall": "Every spike costs a life ❤️ Will it escape before it pops?",
    "gravity-flip": "Gravity turns every time it bounces 🌀 Will it find the exit?",
    "sand-fill": "So satisfying 😌 Which cup fills to the line first? Comment your number 👇",
    "ball-drawing": "The ball reveals a flag as it bounces 🏳️ Guess it before the end! 👇",
    "hp-battle": "Harder hits do more damage 💥 Which ball is the last one standing? Pick yours 👇",
    # Challenges (real images / real maths)
    "console-battle": "PS5, Xbox, Switch or Steam Deck? 🎮 Harder hits do more damage. Which console is the last one standing? 👇\n\nPhotos: Osh33m / Soberian, Der. Bellemer, Liam Dawe / GamingOnLinux (CC BY-SA 4.0), Evan-Amos (public domain), via Wikimedia Commons",
    "xbox-vs-playstation": "Xbox vs PlayStation 🎮 Three generations each, one arena. Which side are you on? 👇",
    "tech-race": "Apple, Google, Microsoft, Nvidia, Meta or Amazon? 💻 Only one gets out first. Who's your pick? 👇",
    "maze-race": "Same maze, same speed, 4 algorithms 🧠 BFS, DFS, A* or the right-hand rule. Which one finds the exit first? 👇",
    "fastest-ramp": "Same start, same finish, 4 ramps 🎢 The straight line is the shortest… but is it the fastest? Real physics at real speed, no friction. Watch the photo finish 👇",
}
HASHTAGS = {
    "ball-arena": "#dailysensory #satisfying #oddlysatisfying #physics #simulation",
    "mind-reader": "#dailysensory #magic #mindreading #magictrick #illusion",
    "capsule-world": "#dailysensory #mysterybox #cute #collectibles #surprise",
    "reflex-lab": "#dailysensory #braintest #reflex #challenge #focus",
    "bounce-melody": "#dailysensory #satisfying #music #oddlysatisfying #asmr",
    "marble-kingdom": "#dailysensory #marblerace #countryballs #race #tournament",
    "sensory": "#dailysensory #satisfying #oddlysatisfying #physics #asmr",
}
# The post heading per video type: "<series> | Day n" (one channel, so each type is a daily series).
SERIES = {
    "break-out": "Will It Break Out?", "colour-escape": "Colour Escape", "grow-stuck": "Grow Or Get Stuck", "paint-war": "Paint War",
    "nested-rings": "Ring Breaker", "hunter-prey": "Hunter vs Prey",
    "vanishing-card": "Vanishing Card Trick", "number-force": "I Know Your Number", "1089-prediction": "Sealed Prediction",
    "finger-walk": "Finger Walk Mind Trick", "shell-tracker": "Track The Ball", "mirror-morph": "Shape Morph Trick", "weighted-wheel": "Wheel Prediction",
    "pause-to-pick": "Pause To Pick", "100-pull": "100 Pull Challenge", "gold-box": "Find The Gold Box", "egg-hatch": "Mystery Egg",
    "rarity-ladder": "Rarity Ladder", "mystery-layers": "Mystery Box Layers",
    "stop-on-green": "Stop On Green", "count-the-balls": "Count The Balls", "odd-one-out": "Odd One Out", "colour-word": "Colour Word Test",
    "memory-flash": "Memory Flash", "pause-at-10": "Stop At 10.00",
    "name-the-song": "Name The Song", "escape-before-song-ends": "Escape Before The Song Ends", "piano-ring": "Play Every Note",
    "countries-cup": "Countries Cup", "colour-league": "Colour League", "bracket-flags": "World Knockout", "bracket-colours": "Colour Knockout",
    "champion-of-champions": "Champion Of Champions",
    "shrinking-arena": "Shrinking Arena", "colour-mix": "Colour Mix", "spike-wall": "Spike Wall", "gravity-flip": "Gravity Flip",
    "sand-fill": "Sand Fill", "ball-drawing": "Guess The Flag", "hp-battle": "Ball HP Battle",
    "console-battle": "Console Battle", "xbox-vs-playstation": "Xbox vs PlayStation", "tech-race": "Tech Giants Race",
    "maze-race": "Algorithm Maze Race", "fastest-ramp": "Fastest Ramp Challenge",
}
# hashtags per video type where the account default does not fit
TAGS = {
    "break-out": "#dailysensory #satisfying #oddlysatisfying #physics #asmr",
    "console-battle": "#dailysensory #gaming #playstation #xbox #nintendoswitch",
    "xbox-vs-playstation": "#dailysensory #gaming #xbox #playstation #consolewars",
    "tech-race": "#dailysensory #tech #apple #google #nvidia",
    "maze-race": "#dailysensory #algorithm #coding #maze #satisfying",
    "fastest-ramp": "#dailysensory #physics #science #brachistochrone #satisfying",
}
# series that go first in the sheet (the channel's daily lead series), then the rest in catalog order
LEAD = ["break-out", "shrinking-arena", "colour-mix", "spike-wall", "gravity-flip", "sand-fill", "ball-drawing", "hp-battle",
        "console-battle", "xbox-vs-playstation", "tech-race", "maze-race", "fastest-ramp"]


def step(name: str, vid: str, fn):
    try:
        return fn()
    except SystemExit as e:
        raise SystemExit(f"FAILED at {name} for {vid}: {e}")
    except Exception as e:  # noqa: BLE001
        raise SystemExit(f"FAILED at {name} for {vid}: {type(e).__name__}: {e}")


def build(spec: dict, rebuild: bool):
    vid = spec["id"]
    if spec["engine"] == "sim":
        s = run_sim.resolve(spec)
        p = DATA / f"{vid}.json"
        if p.exists() and not rebuild:
            # keep the searched run; refresh the text fields from the current spec
            data = json.loads(p.read_text(encoding="utf-8"))
            keep = {k: data["spec"][k] for k in ("standings", "race") if k in data["spec"]}
            if s.get("champions"):
                keep["subtitle"] = data["spec"].get("subtitle", s.get("subtitle"))
            data["spec"] = {**{k: v for k, v in s.items() if k != "rules"}, **keep}
            p.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
            return
        top = run_sim.search(s)
        if not top:
            raise SystemExit("no seed met the drama rules")
        seed, sc, meta = top[0]
        run_sim.build(s, seed, {"score": round(sc, 2), **meta})
    elif spec["engine"] == "sand":
        p = DATA / f"{vid}.json"
        if p.exists() and (sand.FRAMES / vid).exists() and not rebuild:
            data = json.loads(p.read_text(encoding="utf-8"))
            data["spec"] = {k: v for k, v in spec.items() if k != "rules"}
            p.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
            return
        top = sand.search(spec)
        if not top:
            raise SystemExit("no seed met the sand rules")
        seed, sc, meta = top[0]
        sand.build(spec, seed, {"score": round(sc, 2), **meta})
    elif spec["engine"] in ("maze", "ramp"):
        p = DATA / f"{vid}.json"
        if p.exists() and not rebuild:
            data = json.loads(p.read_text(encoding="utf-8"))
            data["spec"] = {k: v for k, v in spec.items() if k != "rules"}
            p.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
            return
        challenge.build(spec)
    else:
        designed.build(spec)


def posts(specs: list[dict]):
    """One row per video, grouped by series in Day order: heading, caption, hashtags, file, posted."""
    order = LEAD + [i for i in dict.fromkeys(s["idea"] for s in specs) if i not in LEAD]
    rows = []
    for idea in order:
        for s in sorted((s for s in specs if s["idea"] == idea), key=lambda s: s.get("day", 0)):
            rows.append({
                "post": len(rows) + 1, "heading": f"{SERIES[idea]} | Day {s['day']}", "caption": CAPTIONS[idea],
                "hashtags": TAGS.get(idea, HASHTAGS[s["account"]]), "file": str((OUT / s["account"] / f"{s['id']}.mp4").relative_to(ROOT)), "posted": "",
            })
    with open(ROOT / "posts.csv", "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f"posts.csv: {len(rows)} rows")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--rebuild", action="store_true")
    ap.add_argument("--redo", action="store_true")
    ap.add_argument("--posts", action="store_true")
    a = ap.parse_args()
    specs = all_specs()
    if a.posts:
        posts(specs)
        return
    ids = [s["id"] for s in specs] if a.ids == ["all"] else a.ids
    # chained series must build in order
    ids.sort(key=lambda v: ("abcdefg".index(v[0]), v))
    t0 = time.time()
    for vid in ids:
        step("build", vid, lambda: build(load_spec(vid), a.rebuild))
    print(f"built {len(ids)} in {time.time() - t0:.0f}s")

    todo = [v for v in ids if a.redo or not (OUT / load_spec(v)["account"] / f"{v}.mp4").exists()]
    print(f"plan: {' '.join(todo)}")  # progress.py reads this to know what this batch will render
    if todo:
        pool = ThreadPoolExecutor(2)
        futs = []
        proc = subprocess.Popen(["node", "scripts/render.mjs", *todo], cwd=MOTION, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, errors="replace", shell=True)
        for line in proc.stdout:
            line = line.rstrip()
            if line.startswith("rendered "):
                vid = line.split()[1]
                print(line)
                futs.append((vid, pool.submit(finish, vid)))
            elif "Error" in line or "error" in line.lower():
                print(line)
        proc.wait()
        if proc.returncode:
            raise SystemExit(f"FAILED at render (exit {proc.returncode}); see the lines above")
        for vid, fu in futs:
            step("finish", vid, fu.result)
        pool.shutdown()
    posts(specs)
    print(f"done: {len(todo)} rendered and finished in {(time.time() - t0) / 60:.1f} min")


if __name__ == "__main__":
    main()
