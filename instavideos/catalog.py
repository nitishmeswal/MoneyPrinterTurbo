"""The 120-video slate: 20 per account, written as spec files into specs/<account>/.

    python instavideos/catalog.py            # (re)write every spec

Each idea is a repeatable series with variants (palette, count, speed, title),
following PLAYBOOK.md. Titles are questions of 6 words or fewer. Marble Kingdom
episodes chain: an episode's line-up comes from the previous episode's result.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SPECS = ROOT / "specs"

C = {
    "Red": "#FF4D4D", "Blue": "#4D9DFF", "Green": "#3DDC84", "Yellow": "#FFD23F", "Purple": "#B07CFF",
    "Orange": "#FF9F43", "Pink": "#FF6FB5", "Cyan": "#2EE6D6", "White": "#F2F2F2", "Gold": "#F2C14E",
}


def balls(names, r, speed, **kw):
    return [{"name": n, "hex": C[n], "r": r, "speed": speed, **kw} for n in names]


ARENA_MUSIC = {"bpm": 120, "root": 45, "mode": "minor", "style": "drive", "gain": 0.34}
MELODY_MUSIC = {"bpm": 96, "root": 48, "mode": "major", "style": "soft", "gain": 0.2}
MARBLE_MUSIC = {"bpm": 128, "root": 43, "mode": "major", "style": "drive", "gain": 0.34}


# ====================================================================== A. Ball Arena

def ball_arena():
    out = []
    yes_no = {"sub": "Did you call it?"}
    # break-out: every bounce removes the brick it hits
    for i, (title, rings, ball, dur, prefer) in enumerate([
        ("Will It Break Out?", [(250, 40), (330, 48), (410, 56)], ("Gold", 22), 35, None),
        ("4 Walls. Will It Escape?", [(200, 32), (270, 40), (340, 48), (410, 56)], ("Cyan", 20), 40, None),
        ("Can It Escape In 30s?", [(300, 64), (400, 80)], ("Pink", 20), 30, None),
        ("Will It Break Free?", [(250, 44), (330, 52), (410, 60)], ("Orange", 22), 35, {"outcome": "no"}),
    ]):
        out.append({
            "id": f"a{i + 1:02d}-break-out", "idea": "break-out", "variant": i + 1, "title": title, "subtitle": "every bounce removes a brick",
            "durationSec": dur, "hud": "bricks", "seeds": 160, "prefer": prefer or {},
            "rules": {"gravity": 1300, "rings": [{"R": R, "w": 24, "n": n, "kind": "bricks"} for R, n in rings], "balls": balls([ball[0]], ball[1], 950), "on_bounce": ["remove_brick"], "win": "escape"},
            "choice": {"label": "Yes or no?", "options": [{"text": "YES", "color": "#3DDC84"}, {"text": "NO", "color": "#FF4D4D"}]},
            "payoff": {"yes": "IT BROKE OUT!", "no": "TRAPPED!", **yes_no},
        })
    # colour escape: one rotating gap, first out wins
    for k, (title, names, gap, rot, dur) in enumerate([
        ("Which Colour Escapes First?", ["Red", "Blue", "Green", "Yellow"], 11, 45, 30),
        ("6 Balls, 1 Exit. Who Wins?", ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"], 10, -35, 35),
        ("Pick One. Who Gets Out?", ["Pink", "Cyan", "Yellow", "Purple"], 9, 70, 30),
        ("8 Colours. Who Escapes First?", ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Cyan"], 11, 30, 35),
    ]):
        out.append({
            "id": f"a{k + 5:02d}-colour-escape", "idea": "colour-escape", "variant": k + 1, "title": title, "durationSec": dur, "hud": "timer", "seeds": 200,
            "rules": {"gravity": 1200, "rings": [{"R": 400, "w": 16, "n": 720, "gap": [90, gap], "rot": rot}], "balls": balls(names, 24 if len(names) <= 6 else 21, 800), "collide": True, "win": "first_escape"},
            "choice": {"label": "Pick a colour"},
            "payoff": {"yes": "{name} WINS!", "sub": "Did your colour win?", "no": "NOBODY ESCAPED!"},
            "prefer": {"outcome": "yes"},
        })
    # grow or get stuck
    for k, (title, grow, gapx, rot, color) in enumerate([
        ("Grow Or Get Stuck?", 1.02, 3.0, 25, "Green"),
        ("3% Bigger Every Bounce. Escape?", 1.03, 3.4, 30, "Purple"),
        ("Will It Fit Through?", 1.02, 2.6, -20, "Yellow"),
    ]):
        r0, R = 18, 400
        gapdeg = gapx * 2 * r0 / R * 57.2958
        out.append({
            "id": f"a{k + 9:02d}-grow-stuck", "idea": "grow-stuck", "variant": k + 1, "title": title, "subtitle": "it grows every bounce", "durationSec": 30, "hud": "grow", "seeds": 200,
            "rules": {"gravity": 1250, "rings": [{"R": R, "w": 16, "n": 720, "gap": [90, gapdeg], "rot": rot}], "balls": balls([color], r0, 900), "grow": grow, "win": "grow_escape"},
            "choice": {"label": "Escape or stuck?", "options": [{"text": "ESCAPE", "color": "#3DDC84"}, {"text": "STUCK", "color": "#FF4D4D"}]},
            "payoff": {"yes": "IT SQUEEZED OUT!", "no": "TOO BIG!", "no_timer": "STILL INSIDE!", **yes_no},
        })
    # paint war
    for k, (title, names, dur) in enumerate([
        ("Who Paints More?", ["Pink", "Cyan"], 30),
        ("3 Colours. Who Paints Most?", ["Pink", "Cyan", "Yellow"], 30),
        ("Which Colour Takes Over?", ["Red", "Blue", "Green", "Yellow"], 35),
    ]):
        out.append({
            "id": f"a{k + 12:02d}-paint-war", "idea": "paint-war", "variant": k + 1, "title": title, "subtitle": "every hit paints the wall", "durationSec": dur, "hud": "paint", "seeds": 160,
            "rules": {"gravity": 1200, "rings": [{"R": 405, "w": 30, "n": 72, "kind": "paint"}], "balls": balls(names, 24, 850), "collide": True, "win": "most_paint"},
            "choice": {"label": "Pick a colour"},
            "payoff": {"paint": "{name} WINS!", "sub": "{pct} of the wall"},
        })
    # nested rings
    for k, (title, radii, gap, dur) in enumerate([
        ("Can It Escape 5 Rings?", [160, 220, 280, 340, 400], 30, 35),
        ("7 Rings. Can It Escape?", [120, 170, 220, 270, 320, 370, 420], 30, 40),
        ("How Many Rings Can It Break?", [160, 220, 280, 340, 400], 26, 35),
    ]):
        out.append({
            "id": f"a{k + 15:02d}-nested-rings", "idea": "nested-rings", "variant": k + 1, "title": title, "durationSec": dur, "hud": "layers", "seeds": 200,
            "rules": {"gravity": 1100, "rings": [{"R": R, "w": 12, "n": 720, "gap": [90 + 70 * j, gap], "rot": (30 + 9 * j) * (1 if j % 2 else -1)} for j, R in enumerate(radii)], "balls": balls(["White"], 15, 900), "win": "all_rings"},
            "choice": {"label": "Yes or no?", "options": [{"text": "YES", "color": "#3DDC84"}, {"text": "NO", "color": "#FF4D4D"}]},
            "payoff": {"yes": "ALL {n} RINGS!", "no": "STUCK AT {layers}/{n}", **yes_no},
        })
    # hunter and prey
    for k, (title, names, dur) in enumerate([
        ("Who Survives The Hunter?", ["Blue", "Green", "Yellow", "Pink"], 30),
        ("6 Balls vs 1 Hunter. Who Lasts?", ["Blue", "Green", "Yellow", "Pink", "Cyan", "Orange"], 35),
        ("Last One Standing?", ["Blue", "Green", "Yellow", "Purple", "Cyan"], 30),
    ]):
        prey = balls(names, 14, 520)
        hunter = {"name": "Hunter", "hex": "#FF3B3B", "r": 18, "speed": 340, "hunter": True}
        out.append({
            "id": f"a{k + 18:02d}-hunter", "idea": "hunter-prey", "variant": k + 1, "title": title, "subtitle": "the hunt starts in 4 seconds", "durationSec": dur, "hud": "survivors", "seeds": 300,
            "rules": {"gravity": 200, "rings": [{"R": 410, "w": 16, "n": 720}], "balls": [hunter] + prey, "collide": True, "hunter_grow": 1.25, "hunt_start": 4.0, "win": "survivor"},
            "choice": {"label": "Pick a survivor"},
            "prefer": {"outcome": "survivor", "reason": None},
            "payoff": {"survivor": "{name} SURVIVES!", "survivor_timer": "{left} SURVIVED!", "sub": "Did you pick the survivor?"},
        })
    for s in out:
        s.update(account="ball-arena", engine="sim", music=ARENA_MUSIC, instrument="marimba")
    return out


# ====================================================================== E. Bounce Melody

MELODIES = {
    "Ode to Joy": [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62, 64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 62, 60, 60],
    "Twinkle Twinkle Little Star": [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60, 67, 67, 65, 65, 64, 64, 62, 67, 67, 65, 65, 64, 64, 62, 60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60],
    "Für Elise": [76, 75, 76, 75, 76, 71, 74, 72, 69, 60, 64, 69, 71, 64, 68, 71, 72, 64, 76, 75, 76, 75, 76, 71, 74, 72, 69, 60, 64, 69, 71, 64, 72, 71, 69],
    "Jingle Bells": [64, 64, 64, 64, 64, 64, 64, 67, 60, 62, 64, 65, 65, 65, 65, 65, 64, 64, 64, 64, 62, 62, 64, 62, 67, 64, 64, 64, 64, 64, 64, 64, 67, 60, 62, 64, 65, 65, 65, 65, 65, 64, 64, 64, 67, 67, 65, 62, 60],
    "Mary Had a Little Lamb": [64, 62, 60, 62, 64, 64, 64, 62, 62, 62, 64, 67, 67, 64, 62, 60, 62, 64, 64, 64, 64, 62, 62, 64, 62, 60],
    "Frère Jacques": [60, 62, 64, 60, 60, 62, 64, 60, 64, 65, 67, 64, 65, 67, 67, 69, 67, 65, 64, 60, 67, 69, 67, 65, 64, 60, 60, 55, 60, 60, 55, 60],
    "London Bridge": [67, 69, 67, 65, 64, 65, 67, 62, 64, 65, 64, 65, 67, 67, 69, 67, 65, 64, 65, 67, 62, 67, 64, 60],
    "When the Saints Go Marching In": [60, 64, 65, 67, 60, 64, 65, 67, 60, 64, 65, 67, 64, 60, 64, 62, 64, 64, 62, 60, 60, 64, 67, 67, 65, 64, 65, 67, 64, 60, 62, 60],
    "In the Hall of the Mountain King": [59, 61, 62, 64, 66, 62, 66, 65, 61, 65, 64, 60, 64, 59, 61, 62, 64, 66, 62, 66, 71, 69, 66, 62, 66, 69],
    "Greensleeves": [57, 60, 62, 64, 65, 64, 62, 59, 55, 57, 59, 60, 57, 57, 56, 57, 59, 56, 52, 57, 60, 62, 64, 65, 64, 62, 59, 55, 57, 59, 60, 59, 57, 56, 54, 56, 57, 57],
    "Amazing Grace": [62, 67, 71, 67, 71, 69, 67, 64, 62, 62, 67, 71, 67, 71, 69, 74, 71, 74, 71, 74, 71, 67, 62, 64, 67, 67, 64, 62, 62, 67, 71, 67, 71, 69, 67],
    "Old MacDonald": [67, 67, 67, 62, 64, 64, 62, 71, 71, 69, 69, 67, 62, 67, 67, 67, 62, 64, 64, 62, 71, 71, 69, 69, 67],
    "Row, Row, Row Your Boat": [60, 60, 60, 62, 64, 64, 62, 64, 65, 67, 72, 72, 72, 67, 67, 67, 64, 64, 64, 60, 60, 60, 67, 65, 64, 62, 60],
}


def bounce_melody():
    out = []
    names = ["Pink", "Cyan", "Yellow", "Purple", "Orange", "Green", "Blue", "Red"]
    guess = ["Can You Name This Song?", "Name This Song?", "Guess The Song?", "Know This Tune?"]
    for k, song in enumerate(["Ode to Joy", "Twinkle Twinkle Little Star", "Für Elise", "Jingle Bells", "Mary Had a Little Lamb", "Frère Jacques", "London Bridge", "When the Saints Go Marching In"]):
        mel = MELODIES[song]
        reps = 1 if len(mel) >= 40 else 2
        notes = mel * reps
        g = (190 / 16) ** (1 / len(notes))
        out.append({
            "id": f"e{k + 1:02d}-name-song", "idea": "name-the-song", "variant": k + 1, "title": guess[k % 4], "subtitle": "every bounce plays the next note", "song": song,
            "durationSec": "auto", "minSec": 20, "maxSec": 45, "hud": "melody", "seeds": 200, "instrument": ["marimba", "bell", "pluck"][k % 3],
            "rules": {"gravity": 950, "rings": [{"R": 400, "w": 14, "n": 720}], "balls": balls([names[k % 8]], 16, 700), "grow": g, "melody": notes, "melody_len": len(notes), "win": "fill"},
            "choice": {"label": "Comment your guess", "options": []},
            "payoff": {"yes": "{song}", "sub": "Did you get it?"},
        })
    for k, song in enumerate(["In the Hall of the Mountain King", "Greensleeves", "Amazing Grace", "Old MacDonald", "Row, Row, Row Your Boat", "Ode to Joy"]):
        mel = MELODIES[song]
        notes = mel * (2 if len(mel) > 30 else 3)
        out.append({
            "id": f"e{k + 9:02d}-song-escape", "idea": "escape-before-song-ends", "variant": k + 1, "title": "Escape Before The Song Ends?", "subtitle": "every bounce plays the next note", "song": song,
            "durationSec": "auto", "minSec": 22, "maxSec": 45, "hud": "melody", "seeds": 260, "instrument": ["bell", "marimba", "pluck"][k % 3],
            "rules": {"gravity": 1100 + 40 * k, "rings": [{"R": 400, "w": 14, "n": 720, "gap": [[90, 30, 150, 210, 270, 330][k], 9.5], "rot": [40, -50, 60, -45, 55, -38][k]}], "balls": balls([names[(k + 3) % 8]], 21, 820 + 20 * k), "melody": notes, "melody_len": len(notes), "win": "song_escape"},
            "choice": {"label": "Yes or no?", "options": [{"text": "YES", "color": "#3DDC84"}, {"text": "NO", "color": "#FF4D4D"}]},
            "payoff": {"yes": "ESCAPED!", "no": "SONG OVER!", "sub": "The song: {song}"},
        })
    scale24 = [48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98, 100, 103]
    for k, (title, nb, rot, inst) in enumerate([
        ("Will It Play All 24 Notes?", 1, 0, "marimba"),
        ("Can One Ball Play Every Note?", 1, 20, "bell"),
        ("2 Balls. All 24 Notes?", 2, 0, "pluck"),
        ("Will It Hit Every Note?", 1, -25, "marimba"),
        ("Every Note Before Time's Up?", 1, 35, "bell"),
        ("3 Balls. Every Note?", 3, 15, "pluck"),
    ]):
        out.append({
            "id": f"e{k + 15:02d}-every-note", "idea": "piano-ring", "variant": k + 1, "title": title, "subtitle": "each colour plays its own note", "durationSec": 35, "hud": "lit", "seeds": 200, "instrument": inst, "scale": scale24,
            "rules": {"gravity": 1150, "rings": [{"R": 400, "w": 30, "n": 24, "kind": "notes", "rot": rot}], "balls": balls(names[k % 3: k % 3 + nb], 22, 850), "collide": True, "win": "all_notes"},
            "choice": {"label": "Yes or no?", "options": [{"text": "YES", "color": "#3DDC84"}, {"text": "NO", "color": "#FF4D4D"}]},
            "payoff": {"yes": "ALL 24 NOTES!", "no": "TIME'S UP!", "sub": "Did you call it?"},
        })
    for s in out:
        s.update(account="bounce-melody", engine="sim", music=MELODY_MUSIC)
    return out


# ====================================================================== F. Marble Kingdom

CUP = ["BR", "AR", "FR", "DE", "ES", "IT", "GB", "US", "MX", "JP", "IN", "CN", "NL", "PT", "BE", "PL", "UA", "TR", "SE", "NO", "DK", "CH", "CA", "NG", "GH", "SN", "CM", "MA", "EG", "CO", "CL", "PE"]
LEAGUE = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Cyan"]
POINTS = [10, 7, 5, 3, 1]  # first five out score; the race ends when five are out


def marble_kingdom():
    out = []
    # Countries Cup: 32 -> 16 -> 8 -> 4 -> 2 -> 1, each episode's line-up from the last result
    rounds = [(32, 16, "32 Countries. Only 16 Survive", 20, 45), (16, 8, "Round 2: 16 Left. Who's Out?", 24, 40), (8, 4, "Quarterfinal: Who Goes Through?", 27, 38), (4, 2, "Semifinal: Who Makes The Final?", 30, 35), (2, 1, "The Final: Who Wins?", 32, 32)]
    for k, (n, adv, title, r, dur) in enumerate(rounds):
        s = {
            "id": f"f{k + 1:02d}-cup-r{k + 1}", "idea": "countries-cup", "variant": k + 1, "title": title, "subtitle": f"first {adv} out go through" if adv > 1 else "first one out is champion",
            "durationSec": "auto", "minSec": 22, "maxSec": 45, "prefer": {"timer": None}, "hud": "race", "advance": adv, "advanceLabel": "through", "seeds": 200, "series": "COUNTRIES CUP",
            "rules": {"gravity": 1200, "rings": [{"R": 405, "w": 16, "n": 720, "gap": [270, 18], "rot": 7 if k % 2 == 0 else -7}], "balls": [{"flag": c, "name": c, "hex": "#FFFFFF", "r": r, "speed": 780} for c in CUP[:n]], "collide": True, "win": "race", "advance": adv},
            "choice": {"label": "Pick your country"},
            "payoff": {"race": "{name} WINS!" if adv == 1 else "{name} FIRST OUT!", "sub": "Part {next} tomorrow" if adv > 1 else "Champion of the Countries Cup", "next": k + 2},
        }
        if k:
            s["fromPrev"] = {"id": out[-1]["id"], "take": n}
        if adv == 1:
            s["rules"]["win"] = "first_escape"
            s["prefer"] = {"outcome": "yes"}
            s["payoff"] = {"yes": "{name} WINS THE CUP!", "sub": "Champion of the Countries Cup"}
        out.append(s)
    # Colour League: 8 races, points 10-8-6-5-4-3-2-1, a standings table after each race
    for k in range(8):
        out.append({
            "id": f"f{k + 6:02d}-league-r{k + 1}", "idea": "colour-league", "variant": k + 1,
            "title": ["League Race 1: Who Wins?", "Race 2: Can Anyone Catch Up?", "Race 3: Who Takes The Lead?", "Race 4: Halfway. Who Leads?", "Race 5: Is The Leader Slipping?", "Race 6: Who Wins Today?", "Race 7: Who Takes Control?", "Final Race: Who Is Champion?"][k],
            "durationSec": "auto", "minSec": 22, "maxSec": 42, "prefer": {"timer": None}, "hud": "race", "advance": 5, "advanceLabel": "scored", "seeds": 220, "series": f"STANDINGS · RACE {k + 1}/8",
            "league": {"race": k + 1, "prev": f"f{k + 5:02d}-league-r{k}" if k else None, "points": POINTS},
            "rules": {"gravity": 500, "rings": [{"R": 405, "w": 16, "n": 720, "gap": [90 + 45 * k, 16], "rot": [30, -36, 32, -30, 34, -33, 31, -34][k]}], "balls": balls(LEAGUE, 25, 800), "collide": True, "win": "race", "advance": 5},
            "choice": {"label": "Who's your team?"},
            "payoff": {"race": "{name} WINS RACE {race}!", "sub": ""},
        })
    # Knockout brackets: quarterfinals (4 duels at once), semis (2), final
    def bracket(prefix, start, title_name, entrants, flags):
        eps = []
        grids = {4: [(255, 760), (680, 760), (255, 1170), (680, 1170)], 2: [(255, 950), (680, 950)]}
        for j, (duels, title) in enumerate([(4, "Quarterfinals: Who Wins?"), (2, "Semifinals: Who Advances?"), (1, "The Final: Who Wins?")]):
            vid = f"f{start + j:02d}-{prefix}-{['qf', 'sf', 'final'][j]}"
            n = duels * 2
            if duels > 1:
                arenas = [{"cx": x, "cy": y} for x, y in grids[duels]]
                rings = [{"arena": a, "R": 175 if duels == 4 else 190, "w": 12, "n": 720, "gap": [90 + 45 * a, 26], "rot": 50 * (1 if a % 2 else -1)} for a in range(duels)]
                bl = []
                for a in range(duels):
                    for m in range(2):
                        e = entrants[a * 2 + m]
                        bl.append({**({"flag": e, "name": e, "hex": "#FFFFFF"} if flags else {"name": e, "hex": C[e]}), "r": 22, "speed": 650, "arena": a})
                rules = {"gravity": 1100, "arenas": arenas, "rings": rings, "balls": bl, "collide": True, "win": "duels"}
                hud, payoff = "duels", {"duels": "TO THE {stage}!", "sub": ""}
            else:
                rules = {"gravity": 1200, "rings": [{"R": 400, "w": 16, "n": 720, "gap": [270, 18], "rot": 7}], "balls": [{**({"flag": e, "name": e, "hex": "#FFFFFF"} if flags else {"name": e, "hex": C[e]}), "r": 30, "speed": 800} for e in entrants[:2]], "collide": True, "win": "first_escape"}
                hud, payoff = "timer", {"yes": "{name} IS CHAMPION!", "sub": f"{title_name} winner"}
            s = {"id": vid, "idea": f"bracket-{prefix}", "variant": j + 1, "title": title, "subtitle": title_name, "durationSec": [36, 32, "auto"][j], "minSec": 22, "maxSec": 40, "hud": hud, "seeds": 200, "rules": rules, "choice": {"label": "Pick a winner"}, "payoff": payoff, "stage": ["SEMIS", "FINAL", ""][j]}
            if duels == 1:
                s["prefer"] = {"outcome": "yes"}
            if j:
                s["fromPrev"] = {"id": eps[-1]["id"], "take": n, "winners": True}
            eps.append(s)
        return eps

    out += bracket("flags", 14, "World Duel", ["JP", "VN", "FR", "ES", "BR", "AR", "IN", "US"], True)
    out += bracket("colours", 17, "Colour Duel", ["Red", "Cyan", "Yellow", "Purple", "Green", "Pink", "Blue", "Orange"], False)
    out.append({
        "id": "f20-champions", "idea": "champion-of-champions", "variant": 1, "title": "Cup Champ vs League Champ?", "subtitle": "the two champions meet", "durationSec": "auto", "minSec": 22, "maxSec": 40, "hud": "timer", "seeds": 200, "prefer": {"outcome": "yes"},
        "champions": {"cup": "f05-cup-r5", "league": "f13-league-r8"},
        "rules": {"gravity": 1200, "rings": [{"R": 400, "w": 16, "n": 720, "gap": [270, 18], "rot": -7}], "balls": [], "collide": True, "win": "first_escape"},
        "choice": {"label": "Pick a champion"},
        "payoff": {"yes": "{name} RULES THE KINGDOM!", "sub": "Champion of champions"},
    })
    for s in out:
        s.update(account="marble-kingdom", engine="sim", music=MARBLE_MUSIC, instrument="pluck")
    return out


def write(specs):
    days: dict[str, int] = {}
    for i, s in enumerate(specs):
        # every video searches its own seed range, so no two share a trajectory
        s.setdefault("seed0", 1 + 1000 * (i + 1))
        # "DAY n" badge: videos of one idea are numbered in catalog order (a01-a04 then g01-g06 for break-out)
        days[s["idea"]] = days.get(s["idea"], 0) + 1
        s["day"] = days[s["idea"]]
        d = SPECS / s["account"]
        d.mkdir(parents=True, exist_ok=True)
        (d / f"{s['id']}.json").write_text(json.dumps(s, indent=1, ensure_ascii=False), encoding="utf-8")


def everything():
    from catalog_designed import capsule_world, mind_reader, reflex_lab  # noqa: E402
    from catalog_sensory import sensory  # noqa: E402

    return ball_arena() + mind_reader() + capsule_world() + reflex_lab() + bounce_melody() + marble_kingdom() + sensory()


if __name__ == "__main__":
    sys.path.insert(0, str(ROOT))
    try:
        specs = everything()
    except ImportError:
        specs = ball_arena() + bounce_melody() + marble_kingdom()
    write(specs)
    by = {}
    for s in specs:
        by[s["account"]] = by.get(s["account"], 0) + 1
    print(f"wrote {len(specs)} specs: {by}")

