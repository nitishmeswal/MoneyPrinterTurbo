r"""Live ASCII progress screen for batch renders (read-only: it never touches the batch).

    .\.venv\Scripts\python.exe instavideos\progress.py              # follows the newest out\batch*.log
    .\.venv\Scripts\python.exe instavideos\progress.py out\batch3.log

Leave it open: it refreshes every 2 s, shows the batch (what this run plans to render),
the video rendering right now with its own % bar (out\render_status.json from render.mjs),
speed, ETA, GPU / encoder use, the latest log lines and the whole library on disk.
When a batch ends it says so and keeps watching; a new batch*.log is picked up by itself.
Ctrl+C to quit.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
DATA = ROOT / "motion" / "public" / "data"
SPECS = ROOT / "specs"
STATUS = OUT / "render_status.json"
NVSMI = r"C:\Windows\System32\nvidia-smi.exe"
ACCOUNTS = {"a": "ball-arena", "b": "mind-reader", "c": "capsule-world", "d": "reflex-lab", "e": "bounce-melody", "f": "marble-kingdom", "g": "sensory"}
STALL = 300  # seconds without any log or render activity before we call it stalled

C = {"r": "\x1b[0m", "b": "\x1b[1m", "dim": "\x1b[2m", "y": "\x1b[33m", "g": "\x1b[32m", "c": "\x1b[36m", "m": "\x1b[35m", "red": "\x1b[31m", "w": "\x1b[97m"}

FONT = {
    "D": [" ____  ", "|  _ \\ ", "| | | |", "| |_| |", "|____/ "],
    "A": ["    _    ", "   / \\   ", "  / _ \\  ", " / ___ \\ ", "/_/   \\_\\"],
    "I": [" ___ ", "|_ _|", " | | ", " | | ", "|___|"],
    "L": [" _     ", "| |    ", "| |    ", "| |___ ", "|_____|"],
    "Y": ["__   __", "\\ \\ / /", " \\ V / ", "  | |  ", "  |_|  "],
    "S": [" ____  ", "/ ___| ", "\\___ \\ ", " ___) |", "|____/ "],
    "E": [" _____ ", "| ____|", "|  _|  ", "| |___ ", "|_____|"],
    "N": [" _   _ ", "| \\ | |", "|  \\| |", "| |\\  |", "|_| \\_|"],
    "O": ["  ___  ", " / _ \\ ", "| | | |", "| |_| |", " \\___/ "],
    "R": [" ____  ", "|  _ \\ ", "| |_) |", "|  _ < ", "|_| \\_\\"],
    ".": ["  ", "  ", "  ", " _", "(_)"],
}
BANNER = ["".join(FONT[ch][row] for ch in "DAILY.SENSORY") for row in range(5)]
BALL = ["(o    )", "( o   )", "(  o  )", "(   o )", "(    o)", "(   o )", "(  o  )", "( o   )"]


def newest_log() -> Path | None:
    logs = sorted(OUT.glob("batch*.log"), key=lambda p: p.stat().st_mtime)
    return logs[-1] if logs else None


def read_text(p: Path) -> str:
    """Tee-Object in Windows PowerShell 5.1 writes UTF-16; python -u | Tee writes whatever the console gives."""
    b = p.read_bytes()
    if b[:2] in (b"\xff\xfe", b"\xfe\xff"):
        return b.decode("utf-16", errors="replace")
    if len(b) > 3 and b[1:2] == b"\x00" and b[3:4] == b"\x00":
        return b.decode("utf-16-le", errors="replace")
    return b.decode("utf-8-sig", errors="replace")


def all_ids() -> list[str]:
    return sorted((p.stem for p in SPECS.rglob("*.json")), key=lambda v: ("abcdefg".index(v[0]), v))


def account_of(vid: str) -> str:
    return ACCOUNTS.get(vid[0], "?")


_secs: dict[str, float] = {}


def video_secs(vid: str) -> float:
    if vid not in _secs:
        try:
            with open(DATA / f"{vid}.json", encoding="utf-8") as fh:
                head = fh.read(600)
            m = re.search(r'"frames":(\d+)', head) or re.search(r'"frames":(\d+)', (DATA / f"{vid}.json").read_text(encoding="utf-8"))
            _secs[vid] = int(m.group(1)) / 60 if m else 30.0
        except OSError:
            _secs[vid] = 30.0
    return _secs[vid]


def gpu() -> str:
    try:
        r = subprocess.run([NVSMI, "--query-gpu=utilization.gpu,utilization.encoder,memory.used,temperature.gpu", "--format=csv,noheader,nounits"], capture_output=True, text=True, timeout=3)
        g, e, mem, t = [x.strip() for x in r.stdout.strip().split(",")]
        return f"RTX 5070  gpu {bar(int(g) / 100, 12, 'g')} {g:>3}%   nvenc {bar(int(e) / 100, 12, 'm')} {e:>3}%   vram {int(mem) / 1024:.1f} GB   {t}°C"
    except Exception:  # noqa: BLE001
        return "GPU: nvidia-smi not available"


def bar(p: float, width: int, color: str = "y") -> str:
    p = max(0.0, min(1.0, p))
    full = int(p * width)
    part = "▏▎▍▌▋▊▉"[min(6, int((p * width - full) * 7))] if full < width and p * width - full > 0.07 else ""
    return f"{C[color]}{'█' * full}{part}{C['dim']}{'·' * (width - full - len(part))}{C['r']}"


def fmt_t(s: float) -> str:
    s = int(max(0, s))
    return f"{s // 3600}h {s % 3600 // 60:02d}m" if s >= 3600 else f"{s // 60}m {s % 60:02d}s"


def render_status() -> dict | None:
    try:
        return json.loads(STATUS.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def frame(log: Path, tick: int) -> tuple[str, bool]:
    text = read_text(log)
    lines = [ln for ln in text.splitlines() if ln.strip()]
    rendered = []
    for ln in lines:
        m = re.match(r"rendered (\S+) \(([\d.]+)s\) in (\d+)s", ln)
        if m:
            rendered.append((m.group(1), float(m.group(2)), int(m.group(3))))
    done = {r[0] for r in rendered}
    finished = any(ln.startswith("done:") for ln in lines)
    failed = next((ln for ln in lines if ln.startswith("FAILED")), None)
    plan_ln = next((ln for ln in lines if ln.startswith("plan:")), None)
    if plan_ln is not None:
        plan = plan_ln[5:].split()
    elif finished or failed:
        plan = [r[0] for r in rendered]  # older logs have no plan line: the batch was what it rendered
    else:
        plan = all_ids()
    building = plan_ln is None and not rendered and not finished and not failed
    st = render_status()
    now = time.time()
    last_activity = max(log.stat().st_mtime, STATUS.stat().st_mtime if STATUS.exists() else 0)
    stalled = not finished and not failed and now - last_activity > STALL
    running = not finished and not failed and not stalled

    started = log.stat().st_ctime
    elapsed = (log.stat().st_mtime if not running else now) - started
    recent = rendered[-15:]
    ratio = sum(r[2] for r in recent) / max(1.0, sum(r[1] for r in recent)) if recent else 1.3
    left = [v for v in plan if v not in done]
    current = st["id"] if st and st.get("id") in left and running else (left[0] if left and running else None)
    cur_p = (st["rendered"] / max(1, st["total"])) if st and current == st.get("id") else 0.0
    eta = max(0.0, sum(video_secs(v) for v in left) * ratio - (video_secs(current) * ratio * cur_p if current else 0))
    p = (len(done & set(plan)) + cur_p) / max(1, len(plan))

    out = [C["c"] + C["b"] + "\n".join("  " + row for row in BANNER) + C["r"], ""]
    if finished:
        state = f"{C['g']}{C['b']}FINISHED{C['r']} at {time.strftime('%I:%M %p', time.localtime(log.stat().st_mtime))}  {C['dim']}(waiting for the next batch){C['r']}"
    elif failed:
        state = f"{C['red']}{C['b']}STOPPED{C['r']}"
    elif stalled:
        state = f"{C['red']}{C['b']}NO ACTIVITY for {fmt_t(now - last_activity)}{C['r']}  {C['dim']}(batch closed or stuck?){C['r']}"
    elif building:
        state = f"{C['y']}{C['b']}BUILDING DATA {BALL[tick % len(BALL)]}{C['r']}  {C['dim']}(seed searches, sound){C['r']}"
    else:
        state = f"{C['y']}{C['b']}RENDERING {BALL[tick % len(BALL)]}{C['r']}"
    out.append(f"  {state}   log: {log.name}   elapsed {fmt_t(elapsed)}")
    out.append("")
    out.append(f"  THIS BATCH  {bar(p, 40)}  {C['w']}{C['b']}{len(done & set(plan)):>3}/{len(plan):<3}{C['r']} {p * 100:5.1f}%")
    if current:
        cur_bar = bar(cur_p, 40, "m")
        fr = f"frame {st['rendered']}/{st['total']}" if st and current == st.get("id") else "starting…"
        out.append(f"  NOW         {cur_bar}  {C['w']}{current}{C['r']}  {C['dim']}{fr}{C['r']}")
    out.append("")
    for k, acc in ACCOUNTS.items():
        mine = [v for v in plan if v[0] == k]
        if not mine:
            continue
        n = sum(1 for v in mine if v in done)
        mark = f"{C['g']}✔{C['r']}" if n == len(mine) else (f"{C['y']}◀{C['r']}" if current and current[0] == k else " ")
        out.append(f"  {acc:<15} {bar(n / len(mine), 26, 'g' if n == len(mine) else 'c')} {n:>3}/{len(mine):<3} {mark}")
    out.append("")
    if running and not building:
        out.append(f"  speed   {ratio:.2f}s of render per 1s of video   last: " + (f"{rendered[-1][0]} in {rendered[-1][2]}s" if rendered else "-"))
        out.append(f"  ETA     {C['b']}{fmt_t(eta)}{C['r']}  (about {time.strftime('%I:%M %p', time.localtime(now + eta))}, plus ~15 s to finish the last file)")
    elif failed:
        out.append(f"  {C['red']}{failed}{C['r']}")
    elif finished:
        out.append(f"  {C['g']}This batch: {len(plan)} video(s) rendered and finished -> instavideos\\out\\<account>\\<id>.mp4{C['r']}")
    # the whole library on disk, whatever the batch
    ids = all_ids()
    have = sum(1 for v in ids if (OUT / ACCOUNTS.get(v[0], "?") / f"{v}.mp4").exists())
    out.append(f"  library {bar(have / max(1, len(ids)), 26, 'g')} {have}/{len(ids)} finished videos on disk")
    out.append("")
    out.append("  " + gpu())
    out.append("")
    out.append(f"  {C['dim']}── latest log ─────────────────────────────────────────────{C['r']}")
    for ln in lines[-6:]:
        if ln.startswith("plan:"):
            ln = f"plan: {len(plan)} video(s) to render"
        ln = re.sub(r" -> .*", "", ln)
        out.append(f"  {C['dim']}{ln[:100]}{C['r']}")
    out.append("")
    out.append(f"  {C['dim']}refreshes every 2 s · Ctrl+C to quit · read-only (never touches the batch){C['r']}")
    return "\n".join(out), running


def main():
    os.system("")  # turn on ANSI colours in Windows consoles
    fixed = None
    if len(sys.argv) > 1:
        fixed = Path(sys.argv[1])
        if not fixed.is_absolute():
            fixed = (ROOT / fixed) if (ROOT / fixed).exists() else Path.cwd() / fixed
    tick = 0
    try:
        while True:
            log = fixed or newest_log()
            if not log or not log.exists():
                screen = "\n  No batch log yet in instavideos\\out. Start one with:\n\n    .\\.venv\\Scripts\\python.exe -u instavideos\\batch.py all | Tee-Object instavideos\\out\\batch6.log\n\n  (waiting… Ctrl+C to quit)"
            else:
                try:
                    screen, _ = frame(log, tick)
                except Exception as e:  # noqa: BLE001  (log being written / replaced mid-read: just try again)
                    screen = f"\n  reading {log.name}… ({type(e).__name__}: {e})"
            sys.stdout.write("\x1b[H\x1b[2J" + screen + "\n")
            sys.stdout.flush()
            tick += 1
            time.sleep(2)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
