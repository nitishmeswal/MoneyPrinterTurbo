"""Turn a script-only batch run into a render manifest you can review first.

Step 1 (cheap, ~1 minute per 10 videos): write scripts and search terms only
    .venv\\Scripts\\python.exe cli.py --batch-file flayel-videos\\batch-1.jsonl --stop-at terms `
        | Out-File -Encoding utf8 flayel-videos\\scripts-1.json

Step 2: build the files to review
    .venv\\Scripts\\python.exe flayel-videos\\to_render.py 1

    -> flayel-videos/review-1.md     every script, numbered, easy to read
    -> flayel-videos/render-1.jsonl  one line per video, script and terms fixed

Edit a script inside render-1.jsonl, or delete a line to drop that video.

Step 3: render exactly what you approved (no LLM calls)
    .venv\\Scripts\\python.exe cli.py --batch-file flayel-videos\\render-1.jsonl
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def read_text(path: Path) -> str:
    raw = path.read_bytes()
    if raw[:2] in (b"\xff\xfe", b"\xfe\xff"):
        return raw.decode("utf-16")
    return raw.decode("utf-8-sig")


def load_summary(path: Path) -> dict:
    # The CLI prints one JSON summary on stdout; skip anything else that got in.
    for line in reversed(read_text(path).splitlines()):
        line = line.strip()
        if line.startswith("{") and '"tasks"' in line:
            return json.loads(line)
    raise SystemExit(f"no batch summary found in {path}")


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: to_render.py <batch number>, e.g. to_render.py 1")
    n = sys.argv[1]
    batch_path = HERE / f"batch-{n}.jsonl"
    summary_path = HERE / f"scripts-{n}.json"
    entries = [json.loads(l) for l in read_text(batch_path).splitlines() if l.strip()]
    summary = load_summary(summary_path)

    rendered, review, skipped = [], [f"# Flayel videos, batch {n}\n"], []
    for task in summary["tasks"]:
        index = task["index"]
        result = task.get("result") or {}
        script, terms = result.get("script"), result.get("terms")
        entry = entries[index - 1]
        if task["status"] != "succeeded" or not script or not terms:
            skipped.append(f"{index}: {entry['video_subject']} ({task.get('error')})")
            continue
        entry = {k: v for k, v in entry.items() if k != "video_script_prompt"}
        entry["video_script"] = script
        entry["video_terms"] = terms
        rendered.append(entry)
        words = len(script.split())
        review.append(
            f"## {index}. {entry['video_subject']}\n"
            f"*{entry['voice_name']} · {words} words · footage: {', '.join(terms)}*\n\n"
            f"{script}\n"
        )

    render_path = HERE / f"render-{n}.jsonl"
    with render_path.open("w", encoding="utf-8", newline="\n") as handle:
        for entry in rendered:
            handle.write(json.dumps(entry, ensure_ascii=False) + "\n")
    (HERE / f"review-{n}.md").write_text("\n".join(review), encoding="utf-8")

    print(f"{len(rendered)} ready in {render_path.name}; read review-{n}.md")
    if skipped:
        print(f"{len(skipped)} skipped (rerun them later):")
        print("\n".join(f"  {s}" for s in skipped))


if __name__ == "__main__":
    main()
