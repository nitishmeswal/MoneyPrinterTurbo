"""Turn a Kling pack into a finished Flayel video: Kling shots + motion graphics.

    .venv\\Scripts\\python.exe flayel-videos\\make_video.py feature/01            # plan only, free
    .venv\\Scripts\\python.exe flayel-videos\\make_video.py feature/01 --kling    # generate Kling shots (paid)
    .venv\\Scripts\\python.exe flayel-videos\\make_video.py feature/01 --render   # render the MP4

Steps:
1. Plan. Lines the narration's word timings (captions.srt) up with the pack's
   shots, so every shot starts on its first spoken word.
2. Kling (--kling). Generates only the shots marked KLING, at the exact length
   each needs. Every task has a stable external id: rerunning never pays twice
   for the same shot, and a run stops before it would pass KLING_BUDGET_USD.
3. Render (--render). Remotion lays Kling clips, Flayel motion graphics for the
   product shots, word-by-word captions, the voiceover and an end card into a
   1080x1920 MP4 at flayel-videos/out/<type>-<NN>.mp4.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import shutil
import subprocess
import time
from pathlib import Path

import httpx

HERE = Path(__file__).resolve().parent
PACKS = HERE / "kling"
MOTION = HERE / "motion"
OUT = HERE / "out"
LEDGER = HERE / "kling-ledger.json"
LOGO = Path(r"C:\Users\nitis\Desktop\flayel\flayel-web\public\brand\flayel-mark-512.png")

FPS = 30
USD_PER_SECOND = 0.235  # Kling 4.0, 1080p, text to video (kling.ai pricing page)
KLING_PATH = "/text-to-video/kling-4.0"
SUFFIX = (
    " Single continuous shot, photorealistic and cinematic, vertical 9:16."
    " The character's face, hair and clothes stay consistent throughout."
    " No text, no captions, no subtitles, no logos, no watermarks, no readable screens."
    " Audio: silent, no music, no dialogue."
)


# ---------------------------------------------------------------- planning


def find_pack(ref: str) -> Path:
    kind, number = ref.replace("\\", "/").split("/")
    matches = list((PACKS / kind).glob(f"{int(number):02d}-*"))
    if not matches:
        raise SystemExit(f"no pack {ref} under {PACKS}")
    return matches[0]


def written_shots(pack: Path) -> tuple[dict, list[dict]]:
    meta = json.loads((pack / "pack.json").read_text(encoding="utf-8"))
    written = json.loads((PACKS / "written.json").read_text(encoding="utf-8"))
    entry = written[f"{meta['pillar']}/{meta['number']}"]
    # The character text was filled into shots.md; reuse that exact text.
    prompts = re.findall(r"```\n(.*?)\n```", (pack / "shots.md").read_text(encoding="utf-8"), re.S)
    shots = [dict(s, kling_prompt=p.strip()) for s, p in zip(entry["shots"], prompts)]
    return meta, shots


def srt_words(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8-sig")
    words = []
    for block in re.split(r"\n\s*\n", text.strip()):
        lines = block.strip().splitlines()
        m = re.match(r"(\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)", lines[1] if len(lines) > 1 else "")
        if not m:
            continue
        g = list(map(int, m.groups()))
        start = g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000
        end = g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000
        for token in " ".join(lines[2:]).split():
            words.append({"text": token, "start": start, "end": end})
    return words


def norm(token: str) -> str:
    return re.sub(r"[^a-z0-9]", "", token.lower())


def restore_punctuation(words: list[dict], script: str) -> None:
    """TTS word timings drop punctuation; copy each word's text back from the script."""
    tokens = script.split()
    j = 0
    for word in words:
        target = norm(word["text"])
        for k in range(j, min(j + 4, len(tokens))):
            if norm(tokens[k]) == target:
                word["text"] = tokens[k]
                j = k + 1
                break


def plan(pack: Path) -> dict:
    meta, shots = written_shots(pack)
    words = srt_words(pack / "captions.srt")
    restore_punctuation(words, (pack / "script.txt").read_text(encoding="utf-8"))
    total = max(w["end"] for w in words)

    # Walk the caption words in order and give each shot its share.
    cursor = 0
    for shot in shots:
        tokens = [norm(t) for t in shot["voiceover"].split() if norm(t)]
        start_index = cursor
        for token in tokens:
            # Skip caption tokens that split differently (e.g. "app." vs "app").
            probe = cursor
            while probe < len(words) and norm(words[probe]["text"]) != token and probe - cursor < 3:
                probe += 1
            if probe < len(words) and norm(words[probe]["text"]) == token:
                cursor = probe + 1
        shot["start"] = words[min(start_index, len(words) - 1)]["start"]
    motion_path = PACKS / "motion.json"
    specs = json.loads(motion_path.read_text(encoding="utf-8")) if motion_path.exists() else {}
    spec = specs.get(f"{meta['pillar']}/{meta['number']}") or []
    if spec and len(spec) != len(shots):
        raise SystemExit(f"motion.json has {len(spec)} scenes for {len(shots)} shots")
    for i, shot in enumerate(shots):
        if spec:
            shot["motion"] = spec[i]
        shot["start"] = 0.0 if i == 0 else shot["start"]
        shot["end"] = shots[i + 1]["start"] if i + 1 < len(shots) else total + 1.2
        if shot["type"] == "kling":
            shot["kling_seconds"] = min(30, max(3, math.ceil(shot["end"] - shot["start"] + 0.4)))

    return {
        "id": f"{meta['pillar']}-{meta['number']:02d}",
        "subject": meta["subject"],
        "fps": FPS,
        "duration": total + 1.2,
        "shots": shots,
        "words": words,
    }


# ---------------------------------------------------------------- kling


def load_env() -> dict:
    env = {}
    for line in (HERE / ".env").read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            env[key.strip()] = value.strip()
    return env


def external_id(video_id: str, index: int, prompt: str, seconds: int) -> str:
    digest = hashlib.sha1(f"{prompt}|{seconds}|1080p|9:16".encode()).hexdigest()[:10]
    return f"flayel-{video_id}-s{index}-{digest}"


def kling_shots(timeline: dict, assets: Path) -> None:
    env = load_env()
    base = env.get("KLING_API_BASE", "https://api-singapore.klingai.com").rstrip("/")
    budget = float(env.get("KLING_BUDGET_USD", "6"))
    client = httpx.Client(
        base_url=base,
        headers={"Authorization": f"Bearer {env['KLING_API_KEY']}", "Content-Type": "application/json"},
        timeout=60,
    )
    ledger = json.loads(LEDGER.read_text(encoding="utf-8")) if LEDGER.exists() else {}

    def find(ext: str) -> dict | None:
        r = client.get("/tasks", params={"external_task_ids": ext})
        r.raise_for_status()
        data = r.json().get("data") or []
        return data[0] if data else None

    pending: dict[int, str] = {}
    spend = 0.0
    for i, shot in enumerate(timeline["shots"], 1):
        if shot["type"] != "kling":
            continue
        clip = assets / f"shot{i}.mp4"
        seconds = shot["kling_seconds"]
        ext = external_id(timeline["id"], i, shot["kling_prompt"], seconds)
        shot["external_id"] = ext
        if clip.exists() and ledger.get(ext, {}).get("file") == clip.name:
            print(f"shot {i}: already downloaded")
            continue
        task = find(ext)
        if task is None:
            cost = seconds * USD_PER_SECOND
            if spend + cost > budget:
                raise SystemExit(
                    f"stopping: shot {i} would bring this run to ${spend + cost:.2f}, "
                    f"over KLING_BUDGET_USD=${budget:.2f}"
                )
            body = {
                "prompt": shot["kling_prompt"] + SUFFIX,
                "settings": {"resolution": "1080p", "aspect_ratio": "9:16", "duration": seconds},
                "options": {"external_task_id": ext, "watermark_info": {"enabled": False}},
            }
            r = client.post(KLING_PATH, json=body)
            data = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
            if r.status_code != 200 or data.get("code") != 0:
                raise SystemExit(f"Kling refused shot {i}: HTTP {r.status_code} {r.text[:300]}")
            spend += cost
            ledger[ext] = {"video": timeline["id"], "shot": i, "seconds": seconds, "usd_estimate": round(cost, 3), "submitted": time.strftime("%Y-%m-%d %H:%M")}
            LEDGER.write_text(json.dumps(ledger, indent=1), encoding="utf-8")
            print(f"shot {i}: submitted {seconds}s (~${cost:.2f})")
        else:
            print(f"shot {i}: found existing task ({task.get('status')}), not paying again")
        pending[i] = ext

    print(f"new spend this run: ~${spend:.2f} (budget ${budget:.2f})")
    started = time.time()
    while pending:
        time.sleep(10)
        for i, ext in list(pending.items()):
            task = find(ext)
            status = (task or {}).get("status")
            if status == "succeeded":
                video = next(o for o in task["outputs"] if o.get("type") == "video")
                clip = assets / f"shot{i}.mp4"
                with httpx.stream("GET", video["url"], timeout=300, follow_redirects=True) as resp:
                    resp.raise_for_status()
                    with clip.open("wb") as fh:
                        for chunk in resp.iter_bytes():
                            fh.write(chunk)
                ledger[ext]["file"] = clip.name
                LEDGER.write_text(json.dumps(ledger, indent=1), encoding="utf-8")
                print(f"shot {i}: downloaded ({clip.stat().st_size // 1024} KB)")
                del pending[i]
            elif status == "failed":
                print(f"shot {i}: FAILED: {task.get('message')}")
                del pending[i]
        if pending and time.time() - started > 1800:
            raise SystemExit(f"still waiting after 30 minutes on shots {sorted(pending)}; rerun to resume")
        if pending:
            print(f"  waiting on shots {sorted(pending)}... {int(time.time() - started)}s")


# ---------------------------------------------------------------- render


def stage_assets(pack: Path, timeline: dict) -> Path:
    assets = MOTION / "public" / timeline["id"]
    assets.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(pack / "voiceover.mp3", assets / "voiceover.mp3")
    if LOGO.exists():  # on other machines, the copy committed in motion/public is used
        shutil.copyfile(LOGO, MOTION / "public" / "flayel-mark.png")
    return assets


def write_props(timeline: dict, assets: Path) -> Path:
    for i, shot in enumerate(timeline["shots"], 1):
        clip = assets / f"shot{i}.mp4"
        shot["clip"] = f"{timeline['id']}/shot{i}.mp4" if clip.exists() else None
    timeline["voiceover"] = f"{timeline['id']}/voiceover.mp3"
    props = assets / "props.json"
    props.write_text(json.dumps(timeline, indent=1), encoding="utf-8")
    return props


def render(timeline: dict, props: Path) -> Path:
    OUT.mkdir(exist_ok=True)
    out = OUT / f"{timeline['id']}.mp4"
    npx = shutil.which("npx.cmd") or shutil.which("npx")
    cmd = [npx, "remotion", "render", "src/index.ts", "FlayelVideo", str(out), f"--props={props}", "--log=warn"]
    subprocess.run(cmd, cwd=MOTION, check=True)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("pack", help="type/number, e.g. feature/01")
    parser.add_argument("--kling", action="store_true", help="generate the Kling shots (paid)")
    parser.add_argument("--render", action="store_true", help="render the final MP4")
    args = parser.parse_args()

    pack = find_pack(args.pack)
    timeline = plan(pack)
    assets = stage_assets(pack, timeline)
    kling_total = 0
    for i, s in enumerate(timeline["shots"], 1):
        span = f"{s['start']:5.1f}-{s['end']:5.1f}s"
        extra = f" -> Kling {s['kling_seconds']}s (~${s['kling_seconds'] * USD_PER_SECOND:.2f})" if s["type"] == "kling" else " -> motion graphic"
        kling_total += s.get("kling_seconds", 0)
        print(f"shot {i} {span} {s['type']:16}{extra} | {s['voiceover'][:50]}")
    print(f"Kling total {kling_total}s, about ${kling_total * USD_PER_SECOND:.2f}")

    if args.kling:
        kling_shots(timeline, assets)
    props = write_props(timeline, assets)
    if args.render:
        missing = [i for i, s in enumerate(timeline["shots"], 1) if s["type"] == "kling" and not s.get("clip")]
        if missing:
            print(f"note: no Kling clip yet for shots {missing}; rendering a placeholder there")
        print(f"rendered {render(timeline, props)}")


if __name__ == "__main__":
    main()
