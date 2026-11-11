"""Specs for the designed accounts: Mind Reader (tricks), Capsule World (reveals), Reflex Lab."""

from __future__ import annotations

MIND_MUSIC = {"bpm": 84, "root": 45, "mode": "dark", "style": "soft", "gain": 0.26}
CAPSULE_MUSIC = {"bpm": 104, "root": 48, "mode": "major", "style": "soft", "gain": 0.24}
REFLEX_MUSIC = {"bpm": 124, "root": 45, "mode": "minor", "style": "drive", "gain": 0.26}


def mind_reader():
    out = []
    card_sets = [
        (["KS", "QH", "JC", "KD", "QC", "JH"], ["KC", "QS", "JD", "KH", "JS"], "Your Card Is Gone"),
        (["AS", "KH", "QD", "AC", "KS", "QH"], ["AH", "KD", "QS", "AD", "KC"], "I Removed Your Card"),
        (["7H", "8S", "9D", "7C", "8H", "9S"], ["7S", "8D", "9H", "7D", "8C"], "Pick A Card. It's Gone."),
        (["JD", "QS", "KH", "JS", "QD", "KC"], ["JH", "QC", "KS", "JC", "QH"], "Watch Your Card Vanish"),
    ]
    for i, (s1, s2, title) in enumerate(card_sets):
        out.append({"id": f"b{i + 1:02d}-card-gone", "idea": "vanishing-card", "variant": i + 1, "format": "card-gone", "title": title, "set1": s1, "set2": s2, "back": ["#8B1E2D", "#1E3A8B", "#1F5B3A", "#4A2A6B"][i]})
    for i, (k, title) in enumerate([(10, "I Know Your Number"), (14, "Think Of A Number"), (8, "Your Number Is…?"), (18, "I Can Read Your Mind")]):
        out.append({"id": f"b{i + 5:02d}-your-number", "idea": "number-force", "variant": i + 1, "format": "number-force", "title": title, "add": k})
    for i, title in enumerate(["Your Answer Is In Here", "I Predicted Your Answer"]):
        out.append({"id": f"b{i + 9:02d}-1089", "idea": "1089-prediction", "variant": i + 1, "format": "1089", "title": title})
    for i, title in enumerate(["Finger On A Ball", "I'll Find Your Finger", "Where Is Your Finger?"]):
        out.append({"id": f"b{i + 11:02d}-finger-walk", "idea": "finger-walk", "variant": i + 1, "format": "finger-walk", "title": title, "designSeed": [7, 19, 31][i]})
    for i, title in enumerate(["Can You Track The Ball?", "Follow The Ball. Which Cup?", "Eyes On The Ball. Where?"]):
        out.append({"id": f"b{i + 14:02d}-shells", "idea": "shell-tracker", "variant": i + 1, "format": "shells", "title": title, "designSeed": [3, 11, 23][i]})
    shapes = ["circle", "square", "triangle", "star", "heart", "hexagon"]
    for i, (title, target) in enumerate([("Pick A Shape. Watch It Change", "diamond"), ("Is Your Shape A Moon?", "moon")]):
        out.append({"id": f"b{i + 17:02d}-morph", "idea": "mirror-morph", "variant": i + 1, "format": "morph", "title": title, "shapes": shapes, "target": target})
    for i, title in enumerate(["Pause The Wheel. I'll Guess", "Stop The Wheel. Which Colour?"]):
        rng_layout = []
        others = ["red", "green", "yellow"]
        for k in range(60):
            rng_layout.append("blue" if (k * 7 + i) % 15 not in (0, 4, 8, 11) else others[k % 3])
        out.append({"id": f"b{i + 19:02d}-wheel", "idea": "weighted-wheel", "variant": i + 1, "format": "wheel", "title": title, "slices": rng_layout})
    for s in out:
        s.update(account="mind-reader", engine="trick", music=MIND_MUSIC)
    return out


def capsule_world():
    out = []
    for i, title in enumerate(["Pause To Pick Your Capsule", "Pause Now. What Did You Get?", "Which Capsule Is Yours?", "Stop On A Capsule!", "Pause. Comment What You Got"]):
        out.append({"id": f"c{i + 1:02d}-pick-capsule", "idea": "pause-to-pick", "variant": i + 1, "format": "pick-capsule", "title": title, "designSeed": 100 + i * 17})
    for i, title in enumerate(["Will We Pull A Mythic?", "100 Pulls. Any Mythic?", "Mythic Before Pull 100?", "Can We Get A Mythic?"]):
        out.append({"id": f"c{i + 6:02d}-100-pull", "idea": "100-pull", "variant": i + 1, "format": "100-pull", "title": title, "seed0": 1 + 9000 * (i + 1)})
    for i, (n, gold, title) in enumerate([(3, 1, "Which Box Has The Gold?"), (3, 0, "Pick A Box. Gold Or Empty?"), (3, 2, "Where's The Golden One?"), (5, 3, "5 Boxes. Which Has Gold?")]):
        out.append({"id": f"c{i + 10:02d}-gold-box", "idea": "gold-box", "variant": i + 1, "format": "gold-box", "title": title, "boxes": n, "gold": gold})
    for i, (tier, title) in enumerate([("Epic", "What Will Hatch?"), ("Mythic", "Guess The Rarity?"), ("Secret", "Rare Egg. What's Inside?")]):
        out.append({"id": f"c{i + 14:02d}-egg-hatch", "idea": "egg-hatch", "variant": i + 1, "format": "egg-hatch", "title": title, "tier": tier, "designSeed": 300 + i})
    for i, title in enumerate(["Which One Would You Keep?", "Common To Secret. Your Pick?"]):
        out.append({"id": f"c{i + 17:02d}-rarity-ladder", "idea": "rarity-ladder", "variant": i + 1, "format": "rarity-ladder", "title": title, "designSeed": 500 + i * 3})
    for i, (title, tier) in enumerate([("What's In The Last Box?", "Epic"), ("4 Boxes Deep. What's Inside?", "Mythic")]):
        out.append({"id": f"c{i + 19:02d}-box-layers", "idea": "mystery-layers", "variant": i + 1, "format": "box-layers", "title": title, "tier": tier, "layers": ["kraft", "velvet", "glass", "gold"] if i == 0 else ["wood", "candy", "ice", "star"], "designSeed": 700 + i})
    for s in out:
        s.update(account="capsule-world", engine="reveal", music=CAPSULE_MUSIC)
    return out


def reflex_lab():
    out = []
    for i, (title, rounds) in enumerate([
        ("Can You Stop It On Green?", [(0.6, 30), (0.9, 22), (1.3, 15), (1.8, 9)]),
        ("Pause On Green. What Round?", [(0.7, 28), (1.0, 20), (1.4, 13), (2.0, 8)]),
        ("Only Green Counts. Can You?", [(0.5, 32), (0.85, 24), (1.25, 16), (1.7, 10)]),
        ("How Far Can You Get?", [(0.65, 26), (1.0, 18), (1.5, 12), (2.1, 7)]),
    ]):
        out.append({"id": f"d{i + 1:02d}-stop-green", "idea": "stop-on-green", "variant": i + 1, "format": "stop-green", "title": title, "rounds": rounds})
    for i, (title, counts, flash) in enumerate([("Count Them In 1 Second?", [9, 17, 28], 1.0), ("How Many Balls? Quick!", [11, 19, 33], 1.0), ("Can You Count This Fast?", [8, 16, 25], 0.8), ("Count Before They Vanish?", [12, 22, 36], 1.2)]):
        out.append({"id": f"d{i + 5:02d}-count", "idea": "count-the-balls", "variant": i + 1, "format": "count-balls", "title": title, "counts": counts, "flash": flash, "designSeed": 40 + i})
    for i, (title, shape) in enumerate([("Find The Odd One Out?", "circle"), ("Spot The Different One?", "square"), ("Which One Is Different?", "triangle"), ("Can You Find It In 4s?", "star")]):
        out.append({"id": f"d{i + 9:02d}-odd-one", "idea": "odd-one-out", "variant": i + 1, "format": "odd-one", "title": title, "shape": shape, "grids": [[5, 0.16], [6, 0.10], [8, 0.065]], "designSeed": 60 + i})
    for i, title in enumerate(["Can You Beat This Test?", "Say The Colour, Not The Word", "Your Brain Will Glitch?"]):
        out.append({"id": f"d{i + 13:02d}-stroop", "idea": "colour-word", "variant": i + 1, "format": "stroop", "title": title, "count": [21, 23, 25][i], "designSeed": 80 + i})
    for i, title in enumerate(["Can You Remember The Order?", "Memory Test: How Far?", "Repeat The Colours?"]):
        out.append({"id": f"d{i + 16:02d}-memory", "idea": "memory-flash", "variant": i + 1, "format": "memory-flash", "title": title, "lengths": [[3, 5, 7], [4, 6, 8], [3, 5, 8]][i], "designSeed": 90 + i})
    for i, (title, rate) in enumerate([("Can You Pause At 10.00?", [1.0, 1.5]), ("Pause At 10.00. Faster Each Time", [1.5, 2.0, 3.0])]):
        out.append({"id": f"d{i + 19:02d}-pause-ten", "idea": "pause-at-10", "variant": i + 1, "format": "pause-ten", "title": title, "rates": rate})
    for s in out:
        s.update(account="reflex-lab", engine="reflex", music=REFLEX_MUSIC)
    return out

