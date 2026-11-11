"""Make ready-to-use Kling packs for Flayel videos with MoneyPrinterTurbo.

For each topic in build_batches.py this writes, under flayel-videos/kling/:

    <type>/<NN>-<slug>/
        script.txt      the voiceover script (MoneyPrinterTurbo's script stage)
        voiceover.mp3   the read-out voice (Edge TTS, free)
        captions.srt    word-timed captions to drop into your editor
        shots.md        Kling scene prompts that cover the voiceover in order
        post.md         title, caption and hashtags for posting

plus kling/SCRIPTS.md, every pack in one file for reading.

Run from the MoneyPrinterTurbo folder:
    .venv\\Scripts\\python.exe flayel-videos\\kling_pack.py --per-type 3   # a sample
    .venv\\Scripts\\python.exe flayel-videos\\kling_pack.py --all          # everything

Finished packs are skipped on later runs, so --all after a sample only does the
rest. Delete a pack's folder to make it again.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import shutil
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = HERE / "kling"
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(HERE))
os.chdir(ROOT)

import build_batches as bb  # noqa: E402  (topics, facts, voices, style)

# One recurring character per video, matched to the narrator's voice, so the
# shots feel like one story. Kling keeps faces steadier when the description
# is repeated word for word in every shot.
CHARACTERS = {
    "en-IN-Male": "a South Asian man in his mid-20s with short black hair and a light beard, wearing a charcoal hoodie",
    "en-IN-Female": "a South Asian woman in her late 20s with shoulder-length dark hair, wearing a mustard knit sweater",
    "en-US-Male": "a man in his early 30s with short brown hair and stubble, wearing a navy crewneck sweater",
    "en-US-Female": "a woman in her early 30s with curly auburn hair, wearing a cream cable-knit sweater",
}

SHOTS_PROMPT = """You are directing a vertical 9:16 short video about Flayel, a memory layer for people who build with AI tools. Each shot will be generated separately in Kling AI and cut to this voiceover.

VOICEOVER ({seconds} seconds when spoken):
{script}

Plan {low} to {high} shots that cover the whole voiceover in order. Each shot lasts 5 or 10 seconds (Kling's clip lengths), and together they must last at least {seconds} seconds.

RULES
- "kling_prompt": one continuous camera shot described visually: subject, action, setting, lighting, camera movement and mood. 40-70 words. Vertical 9:16 framing. Same setting and colour mood across shots unless the voiceover moves somewhere else.
- The main character in every shot is {character}. Repeat that description word for word in each kling_prompt where they appear.
- AI video garbles text, logos and screens. Never ask Kling for readable text, app screens, UI, code or logos. Screens face away from the camera or are softly out of focus.
- When the voiceover is about using Flayel itself (the bird extension, the Project Brain, the Ship Score, the Crown, the context block), set "type" to "screen_recording" and use "kling_prompt" to say exactly what to screen-record in the real Flayel app instead.
- "voiceover": the exact words from the script that play over this shot. Together the shots use every word once, in order.
- "on_screen_text": a punchy caption of at most 6 words to overlay in editing, or "".

Respond ONLY with minified JSON, no markdown:
{{"shots":[{{"seconds":5,"type":"kling","voiceover":"...","kling_prompt":"...","on_screen_text":"..."}}]}}"""


def slugify(text: str, limit: int = 48) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:limit].rstrip("-")


def srt_seconds(path: Path) -> float:
    stamps = re.findall(r"--> (\d+):(\d+):(\d+),(\d+)", path.read_text(encoding="utf-8-sig"))
    if not stamps:
        return 0.0
    h, m, s, ms = map(int, stamps[-1])
    return h * 3600 + m * 60 + s + ms / 1000


def character_for(voice: str) -> str:
    region = "en-IN" if voice.startswith("en-IN") else "en-US"
    gender = "Female" if voice.endswith("-Female") else "Male"
    return CHARACTERS[f"{region}-{gender}"]


def fill_character(prompt: str, voice: str) -> str:
    """Put the narrator-matched character into a hand-written shot prompt."""
    noun = "woman" if voice.endswith("-Female") else "man"
    text = prompt.replace("{character}'s", f"the {noun}'s")
    text = text.replace("{character}", character_for(voice))
    # Capitalise a description that now opens a sentence.
    return re.sub(r"(^|[.!?]\s+)([a-z])", lambda m: m.group(1) + m.group(2).upper(), text)


def fit_to_voice(shots: list[dict], seconds: float) -> list[dict]:
    """Stretch 5s shots to 10s (wordiest first) until the footage covers the voice."""
    shots = [dict(s, seconds=int(s.get("seconds", 5))) for s in shots]
    by_words = sorted(
        range(len(shots)), key=lambda i: -len(shots[i].get("voiceover", "").split())
    )
    for i in by_words:
        if sum(s["seconds"] for s in shots) >= seconds:
            break
        if shots[i]["seconds"] == 5:
            shots[i]["seconds"] = 10
    return shots


def load_written() -> dict:
    """Hand-written scripts, shots and posts (kling/written.json), keyed type/number."""
    path = OUT / "written.json"
    if not path.exists():
        return {}
    return {k: v for k, v in json.loads(path.read_text(encoding="utf-8")).items() if "/" in k}


def select_topics(per_type: int | None) -> list[dict]:
    """Every topic with its type, number within the type, and voice."""
    picked, order = [], 0
    for pillar, subject in bb.interleave(bb.TOPICS):
        number = bb.TOPICS[pillar].index(subject) + 1
        voice = bb.VOICES[order % len(bb.VOICES)]  # same voice as the batch files
        order += 1
        if per_type is None or number <= per_type:
            picked.append({"pillar": pillar, "number": number, "subject": subject, "voice": voice})
    return picked


def make_voice_and_script(
    topic: dict, tm, utils, VideoParams, script: str = ""
) -> tuple[str, Path, Path]:
    """Script -> voiceover -> captions, using MoneyPrinterTurbo's own pipeline.

    With ``script`` given, the repo skips its AI script stage and only voices it.
    """
    style = {k: v for k, v in bb.STYLE.items() if k in VideoParams.model_fields}
    style["video_source"] = "local"  # no stock footage: you make the visuals in Kling
    content = (
        {"video_script": script}
        if script
        else {"video_script_prompt": f"{bb.FACTS}\n{bb.PILLARS[topic['pillar']]}"}
    )
    params = VideoParams(
        **{
            **style,
            **content,
            "video_subject": topic["subject"],
            "voice_name": topic["voice"],
        }
    )
    task_id = utils.get_uuid()
    result = tm.start(task_id=task_id, params=params, stop_at="subtitle", allow_server_file_input=True)
    if not result or result.get("state") == tm.const.TASK_STATE_FAILED:
        error = (result or {}).get("error", "no result")
        raise RuntimeError(f"{(result or {}).get('failed_stage', '?')} stage failed: {error}")
    folder = Path(utils.task_dir(task_id))
    script = json.loads((folder / "script.json").read_text(encoding="utf-8-sig"))["script"].strip()
    return script, folder / "audio.mp3", Path(result["subtitle_path"])


def plan_shots(script: str, seconds: float, voice: str, llm) -> list[dict]:
    prompt = SHOTS_PROMPT.format(
        seconds=math.ceil(seconds),
        script=script,
        low=max(2, math.ceil(seconds / 10)),
        high=max(3, math.ceil(seconds / 5)),
        character=character_for(voice),
    )
    last_error = None
    for _ in range(3):
        response = llm._generate_response(prompt)
        if isinstance(response, str) and response.startswith("Error: "):
            raise RuntimeError(response)
        try:
            try:
                data = json.loads(llm._strip_code_fence(response))
            except json.JSONDecodeError:
                data = llm._extract_embedded_json(response, "{")
            shots = data["shots"]
            if shots and all(s.get("kling_prompt") for s in shots):
                return shots
        except (KeyError, TypeError, ValueError) as exc:
            last_error = exc
        time.sleep(1)
    raise RuntimeError(f"could not get a shot plan: {last_error}")


def shots_markdown(topic: dict, seconds: float, shots: list[dict]) -> str:
    total = sum(int(s.get("seconds", 5)) for s in shots)
    lines = [
        f"# Kling shots: {topic['subject']}",
        "",
        f"Voiceover {seconds:.0f}s · {len(shots)} shots, {total}s of footage · 9:16 · "
        f"character: {character_for(topic['voice'])}",
        "",
    ]
    for i, shot in enumerate(shots, 1):
        kind = "SCREEN RECORDING" if shot.get("type") == "screen_recording" else "KLING"
        lines += [
            f"## Shot {i} · {shot.get('seconds', 5)}s · {kind}",
            f"**Voiceover:** {shot.get('voiceover', '').strip()}",
            "",
            "```",
            shot["kling_prompt"].strip(),
            "```",
        ]
        if shot.get("on_screen_text"):
            lines.append(f"**On-screen text:** {shot['on_screen_text']}")
        lines.append("")
    return "\n".join(lines)


def post_markdown(posts: dict[str, dict]) -> str:
    labels = {
        "tiktok": "TikTok",
        "youtube_shorts": "YouTube Shorts",
        "instagram_reels": "Instagram Reels",
        "all": "TikTok · Reels · Shorts",
    }
    lines = []
    for platform, meta in posts.items():
        lines += [
            f"## {labels.get(platform, platform)}",
            f"**Title:** {meta.get('title', '')}",
            "",
            meta.get("caption", ""),
            "",
            " ".join(meta.get("hashtags", [])),
            "",
        ]
    return "\n".join(lines)


def write_index() -> int:
    """Gather every finished pack into kling/SCRIPTS.md, grouped by type."""
    sections, count = ["# Flayel video scripts for Kling", ""], 0
    for pillar in bb.TOPICS:
        packs = sorted(p for p in (OUT / pillar).glob("*") if (p / "pack.json").exists())
        if not packs:
            continue
        sections += [f"## {pillar} ({len(packs)})", ""]
        for pack in packs:
            meta = json.loads((pack / "pack.json").read_text(encoding="utf-8"))
            flags = [] if meta["has_cta"] else ["missing closing line"]
            flag = f" · ⚠ {', '.join(flags)}" if flags else ""
            sections += [
                f"### {meta['subject']}",
                f"*{meta['voice']} · {meta['seconds']:.0f}s · {meta['words']} words · "
                f"{meta['shots']} shots · folder `{pillar}/{pack.name}`{flag}*",
                "",
                meta["script"],
                "",
            ]
            count += 1
    (OUT / "SCRIPTS.md").write_text("\n".join(sections), encoding="utf-8")
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--per-type", type=int, help="first N topics of every type")
    group.add_argument("--all", action="store_true", help="all 200 topics")
    parser.add_argument(
        "--platforms",
        default="tiktok,youtube_shorts,instagram_reels",
        help="post copy to write; empty to skip",
    )
    args = parser.parse_args()

    import app.config  # noqa: F401  loads config.toml
    from app.models.schema import VideoParams
    from app.services import llm
    from app.services import task as tm
    from app.utils import utils
    from app.utils.logging_utils import configure_terminal_logger

    configure_terminal_logger(sys.stderr, level="WARNING", colorize=False)
    platforms = [p for p in args.platforms.split(",") if p.strip()]
    topics = select_topics(None if args.all else args.per_type)
    written = load_written()
    print(f"{len(topics)} topics selected ({sum(f'{t['pillar']}/{t['number']}' in written for t in topics)} hand-written)")

    made, failed = 0, []
    for i, topic in enumerate(topics, 1):
        folder = OUT / topic["pillar"] / f"{topic['number']:02d}-{slugify(topic['subject'])}"
        label = f"[{i}/{len(topics)}] {topic['pillar']} #{topic['number']}: {topic['subject']}"
        if (folder / "pack.json").exists():
            print(f"{label} -> already done")
            continue
        try:
            pack = written.get(f"{topic['pillar']}/{topic['number']}")
            if pack:  # hand-written: the repo only voices it and times the captions
                script, audio, srt = make_voice_and_script(
                    topic, tm, utils, VideoParams, script=pack["script"]
                )
                seconds = srt_seconds(srt)
                shots = [
                    {**s, "kling_prompt": fill_character(s["kling_prompt"], topic["voice"])}
                    for s in pack["shots"]
                ]
                posts = {"all": pack["post"]}
            else:  # the repo's AI writes everything
                script, audio, srt = make_voice_and_script(topic, tm, utils, VideoParams)
                seconds = srt_seconds(srt)
                shots = plan_shots(script, seconds, topic["voice"], llm)
                posts = {
                    p: llm.generate_social_metadata(topic["subject"], script, "English", p)
                    for p in platforms
                }
            shots = fit_to_voice(shots, seconds)

            folder.mkdir(parents=True, exist_ok=True)
            (folder / "script.txt").write_text(script + "\n", encoding="utf-8")
            shutil.copyfile(audio, folder / "voiceover.mp3")
            shutil.copyfile(srt, folder / "captions.srt")
            (folder / "shots.md").write_text(shots_markdown(topic, seconds, shots), encoding="utf-8")
            if posts:
                (folder / "post.md").write_text(post_markdown(posts), encoding="utf-8")
            (folder / "pack.json").write_text(
                json.dumps(
                    {
                        **topic,
                        "script": script,
                        "seconds": seconds,
                        "words": len(script.split()),
                        "shots": len(shots),
                        "has_cta": bb.CTA.rstrip(".").lower() in script.lower(),
                    },
                    ensure_ascii=False,
                    indent=1,
                ),
                encoding="utf-8",
            )
            made += 1
            print(f"{label} -> {seconds:.0f}s, {len(shots)} shots")
        except Exception as exc:  # keep going; rerun picks up failures
            failed.append(f"{label}: {exc}")
            print(f"{label} -> FAILED: {exc}")

    total = write_index()
    print(f"\nmade {made}, failed {len(failed)}; {total} packs in {OUT / 'SCRIPTS.md'}")
    for line in failed:
        print("  " + line)


if __name__ == "__main__":
    main()
