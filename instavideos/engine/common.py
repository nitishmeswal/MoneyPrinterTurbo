"""Paths and small helpers shared by every engine."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # instavideos/
REPO = ROOT.parent
MOTION = ROOT / "motion"
PUBLIC = MOTION / "public"
DATA = PUBLIC / "data"
AUDIO = PUBLIC / "audio"
SPECS = ROOT / "specs"
OUT = ROOT / "out"
FFMPEG = REPO / ".venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe"
FPS = 60

ACCOUNTS = ["ball-arena", "mind-reader", "capsule-world", "reflex-lab", "bounce-melody", "marble-kingdom", "sensory"]


def load_spec(vid: str) -> dict:
    for p in SPECS.rglob(f"{vid}.json"):
        return json.loads(p.read_text(encoding="utf-8"))
    raise SystemExit(f"no spec {vid} in {SPECS}")


def all_specs() -> list[dict]:
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted(SPECS.rglob("*.json"))]


def write_data(vid: str, data: dict) -> Path:
    DATA.mkdir(parents=True, exist_ok=True)
    p = DATA / f"{vid}.json"
    p.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    return p
