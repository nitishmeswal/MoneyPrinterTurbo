"""New daily series for @daily.sensory (account folder "sensory"): ids g01-g46.

g42-g46 are challenge videos: image-ball battles/races with real free-licensed photos
and logos (console battle, Xbox vs PlayStation, tech giants), an algorithm maze race
and the fastest-ramp (brachistochrone) race (engine/challenge.py).

Will It Break Out? continues daily (Day 5-10 here; Day 1-4 are a01-a04), plus
five days each of: shrinking arena, colour mix, spike wall, gravity flip,
sand fill, ball drawing (guess the flag) and HP battle. Same rules as the rest:
physics are never edited, the seed is the only curation.
"""

from __future__ import annotations

from catalog import ARENA_MUSIC, C, balls

YES_NO = {"sub": "Did you call it?"}
SENSORY_MUSIC = {"bpm": 112, "root": 47, "mode": "minor", "style": "drive", "gain": 0.32}
SOFT_MUSIC = {"bpm": 92, "root": 50, "mode": "major", "style": "soft", "gain": 0.24}

# paint mixing (RYB-style): mask bit k = ball k touched the cell
RYB = {"Red": "#E8383D", "Yellow": "#FFD23F", "Blue": "#2F6FE0"}
MIXES = {
    frozenset(["Red", "Yellow"]): ("Orange", "#FF8A2A"),
    frozenset(["Yellow", "Blue"]): ("Green", "#3DBE5A"),
    frozenset(["Red", "Blue"]): ("Purple", "#8E4FD8"),
    frozenset(["Red", "Yellow", "Blue"]): ("Brown", "#8B5A3C"),
}


def mix_table(names):
    out = {}
    for mask in range(1, 1 << len(names)):
        used = [names[k] for k in range(len(names)) if mask >> k & 1]
        if len(used) == 1:
            out[str(mask)] = [used[0], RYB[used[0]]]
        else:
            out[str(mask)] = list(MIXES[frozenset(used)])
    return out


def sensory():
    out = []
    n = 0

    def add(s):
        nonlocal n
        n += 1
        s["id"] = f"g{n:02d}-{s.pop('slug')}"
        out.append(s)

    # ---------------------------------------------------------------- Will It Break Out? Day 5-10 (harder every day)
    for day, (rings, ball, dur, prefer) in enumerate([
        ([(250, 44), (330, 52), (410, 60)], ("Gold", 22), 35, None),
        ([(230, 40), (300, 48), (370, 56), (430, 64)], ("Cyan", 21), 38, None),
        ([(250, 52), (330, 60), (410, 68)], ("Pink", 20), 36, {"outcome": "no"}),
        ([(200, 36), (270, 44), (340, 52), (410, 60)], ("Green", 20), 40, None),
        ([(260, 56), (340, 66), (420, 76)], ("Orange", 21), 38, None),
        ([(180, 32), (240, 40), (300, 48), (360, 56), (420, 64)], ("Purple", 19), 42, None),
    ], start=5):
        walls = len(rings)
        add({
            "slug": "break-out", "idea": "break-out", "title": "Will It Break Out?", "subtitle": f"{walls} walls, {sum(b for _, b in rings)} bricks",
            "durationSec": dur, "hud": "bricks", "seeds": 160, "prefer": prefer or {},
            "rules": {"gravity": 1300, "rings": [{"R": R, "w": 24, "n": k, "kind": "bricks"} for R, k in rings], "balls": balls([ball[0]], ball[1], 950), "on_bounce": ["remove_brick"], "win": "escape"},
            "payoff": {"yes": "IT BROKE OUT!", "no": "TRAPPED!", **YES_NO}, "music": ARENA_MUSIC,
        })

    # ---------------------------------------------------------------- shrinking arena
    for title, gap, rot, shrink, color, prefer in [
        ("Escape Before It's Crushed?", 16, 40, 13, "Gold", {}),
        ("The Walls Are Closing In!", 14, -50, 12, "Cyan", {"outcome": "no"}),
        ("Can It Get Out In Time?", 18, 60, 14, "Pink", {"outcome": "yes"}),
        ("Escape Or Get Crushed?", 15, -35, 12, "Green", {}),
        ("The Arena Is Shrinking!", 17, 45, 13, "Orange", {"outcome": "yes"}),
    ]:
        add({
            "slug": "shrinking", "idea": "shrinking-arena", "title": title, "subtitle": "the wall closes in every second",
            "durationSec": "auto", "minSec": 18, "maxSec": 40, "hud": "arena", "seeds": 200, "prefer": prefer,
            "rules": {"gravity": 1100, "rings": [{"R": 420, "w": 16, "n": 720, "gap": [90, gap], "rot": rot, "shrink": shrink, "Rmin": 30}], "balls": balls([color], 22, 900), "win": "shrink_escape", "max_speed": 1700, "crush": 1.25},
            "payoff": {"yes": "IT ESCAPED!", "no": "CRUSHED!", **YES_NO}, "music": SENSORY_MUSIC,
        })

    # ---------------------------------------------------------------- colour mix
    for title, names, dur in [
        ("Red + Blue. Which Colour Wins?", ["Red", "Blue"], 28),
        ("Yellow + Blue. Which Wins?", ["Yellow", "Blue"], 28),
        ("3 Colours Mix. Who Wins?", ["Red", "Yellow", "Blue"], 30),
        ("Red + Yellow. Which Wins?", ["Red", "Yellow"], 28),
        ("Which Colour Covers The Most?", ["Red", "Yellow", "Blue"], 32),
    ]:
        add({
            "slug": "colour-mix", "idea": "colour-mix", "title": title, "subtitle": "where colours cross, they mix",
            "durationSec": dur, "hud": "mix", "seeds": 160, "mixes": mix_table(names),
            "rules": {"gravity": 900, "rings": [{"R": 410, "w": 16, "n": 720}], "balls": [{"name": x, "hex": RYB[x], "r": 26, "speed": 850} for x in names], "collide": True, "grid": {"cell": 6, "mode": "mix", "brush": 1.0}, "win": "mix"},
            "payoff": {"mix": "{mixname} WINS!", "sub": "{pct} of the canvas"}, "music": SOFT_MUSIC, "instrument": "pluck",
        })

    # ---------------------------------------------------------------- spike wall
    # the ring turns slowly, so the spikes creep down towards the bouncing ball (fast spins pop it in seconds)
    for title, lives, spikes, gap, rot, color, prefer in [
        ("3 Lives. Will It Escape?", 3, [[250, 50]], [60, 11], 8, "Gold", {}),
        ("Dodge The Spikes. Escape?", 3, [[330, 40]], [270, 12], 8, "Cyan", {"outcome": "yes"}),
        ("Only 2 Lives. Escape?", 2, [[250, 40]], [60, 10], 7, "Pink", {}),
        ("5 Lives vs The Spike Wall", 5, [[200, 40], [300, 40]], [70, 10], 8, "Green", {}),
        ("Will It Pop Before It Escapes?", 3, [[330, 40]], [270, 12], 8, "Orange", {"outcome": "yes"}),
    ]:
        add({
            "slug": "spike-wall", "idea": "spike-wall", "title": title, "subtitle": "every spike costs a life",
            "durationSec": "auto", "minSec": 20, "maxSec": 40, "hud": "lives", "seeds": 200, "prefer": prefer,
            "rules": {"gravity": 1200, "rings": [{"R": 410, "w": 16, "n": 720, "gap": gap, "rot": rot, "spikes": spikes}], "balls": balls([color], 20, 900), "lives": lives, "win": "spike_escape"},
            "payoff": {"yes": "IT ESCAPED!", "no": "POPPED!", **YES_NO}, "music": SENSORY_MUSIC,
        })

    # ---------------------------------------------------------------- gravity flip
    for title, names, gap, rot, win in [
        ("Gravity Flips Every Bounce. Escape?", ["Gold"], 14, 30, "escape"),
        ("Gravity Keeps Turning. Escape?", ["Cyan"], 13, -35, "escape"),
        ("Gravity Flips! Which Colour Escapes?", ["Red", "Blue", "Green"], 12, 25, "first_escape"),
        ("Which Way Is Down? Escape!", ["Pink"], 12, 40, "escape"),
        ("Gravity Flips! Who Gets Out?", ["Yellow", "Purple", "Cyan", "Orange"], 11, -30, "first_escape"),
    ]:
        add({
            "slug": "gravity-flip", "idea": "gravity-flip", "title": title, "subtitle": "gravity turns on every bounce",
            "durationSec": "auto", "minSec": 20, "maxSec": 40, "hud": "gravity", "seeds": 200, "prefer": {"timer": None},
            "rules": {"gravity": 1300, "gravity_flip": True, "rings": [{"R": 410, "w": 16, "n": 720, "gap": [90, gap], "rot": rot}], "balls": balls(names, 22, 850), "collide": True, "win": win},
            "payoff": {"yes": "IT ESCAPED!" if len(names) == 1 else "{name} WINS!", "no": "STILL TRAPPED!", "sub": "Did you call it?" if len(names) == 1 else "Did your colour win?"},
            "music": SENSORY_MUSIC,
        })

    # ---------------------------------------------------------------- sand fill (sand engine)
    pal1 = ["#FF5E7E", "#FF9A4D", "#FFD84D", "#9BE15D", "#4DD8E6", "#A66BFF"]
    pal2 = ["#F4D35E", "#EE964B", "#F95738", "#0D9488", "#38BDF8", "#F0ABFC"]
    for title, cups, sweep, pal in [
        ("Which Cup Fills First?", 4, 46, pal1),
        ("3 Cups. Which Fills First?", 3, 50, pal2),
        ("5 Cups. Which One Wins?", 5, 52, pal1),
        ("Sand Race: Which Cup Wins?", 4, 46, pal2),
        ("Which Jar Fills Up First?", 3, 50, pal1),
    ]:
        add({
            "slug": "sand-fill", "idea": "sand-fill", "engine": "sand", "title": title, "subtitle": "first cup to 100% wins",
            "minSec": 24, "maxSec": 40, "idealSec": 32, "seeds": 60, "palette": pal,
            "rules": {"cups": cups, "rate": 0.8, "sweep": sweep, "full": 0.86, "colours": len(pal)},
            "payoff": {"cup": "CUP {n} WINS!", "sub": "Did you pick it?"}, "music": SOFT_MUSIC,
        })

    # ---------------------------------------------------------------- ball drawing: guess the flag
    for title, flag, nb in [
        ("Guess The Flag Before It's Revealed", "BR", 1),
        ("The Ball Draws A Flag. Guess It!", "IN", 1),
        ("Guess The Flag Before It's Revealed", "CA", 1),
        ("Which Flag Is It? Guess Fast!", "TR", 1),
        ("Guess The Flag Before It's Revealed", "GB", 1),
    ]:
        add({
            "slug": "ball-drawing", "idea": "ball-drawing", "title": title, "subtitle": "the ball reveals it as it bounces",
            "durationSec": 28, "hud": "reveal", "seeds": 200, "flag": flag, "pctRange": [0.42, 0.7],
            "rules": {"gravity": 1000, "rings": [{"R": 410, "w": 16, "n": 720}], "balls": balls(["White"] * nb, 24, 900), "collide": True, "grid": {"cell": 6, "mode": "reveal", "brush": 1.25 if nb == 1 else 0.8}, "win": "reveal"},
            "payoff": {"reveal": "{flagname}!", "sub": "Did you guess it?"}, "music": SOFT_MUSIC, "instrument": "pluck",
        })

    # ---------------------------------------------------------------- HP battle
    for title, names, r, hp in [
        ("Ball HP Battle: Who Wins?", ["Red", "Blue", "Green", "Yellow"], 34, 100),
        ("4 Balls, 100 HP. Last One?", ["Pink", "Cyan", "Orange", "Purple"], 34, 100),
        ("6 Ball Battle Royale!", ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"], 30, 100),
        ("Who Has The Last HP?", ["Cyan", "Pink", "Gold", "Green"], 36, 120),
        ("5 Balls Enter. One Wins.", ["Red", "Blue", "Yellow", "Purple", "Cyan"], 32, 100),
    ]:
        add({
            "slug": "hp-battle", "idea": "hp-battle", "title": title, "subtitle": "harder hits do more damage",
            "durationSec": "auto", "minSec": 22, "maxSec": 40, "hud": "hp", "seeds": 200, "prefer": {"outcome": "battle", "reason": None},
            "rules": {"gravity": 300, "rings": [{"R": 410, "w": 16, "n": 720}], "balls": balls(names, r, 800), "collide": True, "hp": hp, "dmg_k": 0.012, "win": "battle"},
            "payoff": {"battle": "{name} WINS!", "sub": "{hp} HP left"}, "music": SENSORY_MUSIC,
        })

    # ---------------------------------------------------------------- challenges (real images / real maths)
    # image balls use motion/public/img/<key>.png (engine/ballimg.py; sources in CREDITS.md)
    def img(name, key, hexc, r, speed=800):
        return {"name": name, "img": key, "hex": hexc, "r": r, "speed": speed}

    add({
        "slug": "console-battle", "idea": "console-battle", "title": "Console Battle: Who Survives?", "subtitle": "PS5 vs Xbox vs Switch vs Steam Deck",
        # small balls + light damage = a long fight with comebacks
        "durationSec": "auto", "minSec": 32, "maxSec": 55, "hud": "hp", "seeds": 300, "prefer": {"outcome": "battle", "reason": None},
        "rules": {"gravity": 300, "rings": [{"R": 410, "w": 16, "n": 720}], "collide": True, "hp": 100, "dmg_k": 0.0055, "win": "battle",
                  "balls": [img("PS5", "ps5", "#2E6DF6", 40), img("Xbox", "xsx", "#2CB742", 40), img("Switch", "switch", "#E60012", 40), img("Deck", "deck", "#9AA3B5", 40)]},
        "payoff": {"battle": "{name} WINS!", "sub": "{hp} HP left"}, "music": SENSORY_MUSIC,
    })
    add({
        "slug": "xbox-vs-playstation", "idea": "xbox-vs-playstation", "title": "Xbox vs PlayStation. Who Wins?", "subtitle": "3 generations each, one arena",
        "durationSec": "auto", "minSec": 34, "maxSec": 58, "hud": "hp", "seeds": 300, "prefer": {"outcome": "battle", "reason": None},
        "rules": {"gravity": 300, "rings": [{"R": 410, "w": 16, "n": 720}], "collide": True, "hp": 100, "dmg_k": 0.005, "win": "battle",
                  "balls": [img("PS2", "ps2", "#3D7BFF", 36), img("Xbox", "xbox", "#2CB742", 36), img("PS3", "ps3", "#8FB0FF", 36),
                            img("Xbox 360", "x360", "#9BE15D", 36), img("PS4", "ps4", "#1E50D8", 36), img("Xbox One", "xone", "#138A36", 36)]},
        "payoff": {"battle": "{name} WINS!", "sub": "{hp} HP left"}, "music": SENSORY_MUSIC,
    })
    add({
        "slug": "tech-race", "idea": "tech-race", "title": "Which Tech Giant Escapes First?", "subtitle": "one gap, six companies",
        "durationSec": "auto", "minSec": 28, "maxSec": 48, "hud": "timer", "seeds": 300, "prefer": {"outcome": "yes"},
        "rules": {"gravity": 1200, "rings": [{"R": 405, "w": 16, "n": 720, "gap": [270, 13], "rot": 7}], "collide": True, "win": "first_escape",
                  "balls": [img("Apple", "apple", "#A2AAAD", 34, 780), img("Google", "google", "#4285F4", 34, 780), img("Microsoft", "microsoft", "#F25022", 34, 780),
                            img("Nvidia", "nvidia", "#76B900", 34, 780), img("Meta", "meta", "#0081FB", 34, 780), img("Amazon", "amazon", "#FF9900", 34, 780)]},
        "payoff": {"yes": "{name} WINS!", "sub": "Did your pick win?", "no": "NOBODY ESCAPED!"}, "music": SENSORY_MUSIC,
    })
    add({
        "slug": "maze-race", "idea": "maze-race", "engine": "maze", "title": "Which Algorithm Solves The Maze?", "subtitle": "same maze, same speed",
        "seeds": 400, "rules": {"n": 16, "loops": 0.06, "winnerSec": 13, "capSec": 24, "startSec": 1.4},
        "payoff": {"win": "{name} WINS!", "sub": "{steps} cells checked"}, "music": SENSORY_MUSIC,
    })
    add({
        "slug": "fastest-ramp", "idea": "fastest-ramp", "engine": "ramp", "title": "Which Ramp Is The Fastest?", "subtitle": "a 30 m drop, real speed, no friction",
        # 1 px = 5 cm: a 38 m x 30 m ramp under real gravity, played 1:1, then a 4x slower photo finish
        "rules": {"A": [130, 600], "B": [880, 1210], "mPerPx": 0.05, "replaySlow": 4, "replayLead": 0.8, "startSec": 3.0},
        "payoff": {"win": "{name} WINS!", "sub": "the brachistochrone curve"}, "music": {"bpm": 100, "root": 48, "mode": "minor", "style": "drive", "gain": 0.28},
    })

    for s in out:
        s.setdefault("engine", "sim")
        s.setdefault("instrument", "marimba")
        s["account"] = "sensory"
    return out
