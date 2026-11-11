# Flayel videos

200 short vertical videos about Flayel, made with MoneyPrinterTurbo.
Run every command from the `MoneyPrinterTurbo` folder.

## One-time setup

In `config.toml`, fill in:
- `pexels_api_keys = ["..."]`: free from https://www.pexels.com/api/ (stock footage)
- `openrouter_api_key = "..."`: writes the scripts (~200 short calls)

The voice (Edge TTS) needs no key.

## Make the videos

```powershell
# 0. Try one video first and watch it
.\.venv\Scripts\python.exe cli.py --video-subject "What Flayel is, explained in 30 seconds" --video-language en-US --voice-name en-IN-PrabhatNeural-Male --font-name BeVietnamPro-Bold.ttf --subtitle-display-mode word_by_word --subtitle-animation pop_spring

# 1. Write all scripts for batch 1 (no rendering yet)
.\.venv\Scripts\python.exe cli.py --batch-file flayel-videos\batch-1.jsonl --stop-at terms | Out-File -Encoding utf8 flayel-videos\scripts-1.json

# 2. Build the review files, then read review-1.md and fix or delete lines in render-1.jsonl
.\.venv\Scripts\python.exe flayel-videos\to_render.py 1

# 3. Render what you approved (takes hours; leave it running)
.\.venv\Scripts\python.exe cli.py --batch-file flayel-videos\render-1.jsonl | Out-File -Encoding utf8 flayel-videos\videos-1.json
```

Repeat steps 1–3 with `2` for the second hundred.

Videos land in `storage\tasks\<task-id>\final-1.mp4`.

## Kling packs (you make the visuals)

`kling\` holds one folder per video: `script.txt`, `voiceover.mp3`, `captions.srt`, `shots.md` (Kling prompts, shot by shot) and `post.md`. Read every script in one place in `kling\SCRIPTS.md`.

In Kling:
1. Generate each **KLING** shot in `shots.md` at 9:16, with the length it says.
2. Screen-record each **SCREEN RECORDING** shot in the real Flayel app.
3. In CapCut or Premiere, lay the clips over `voiceover.mp3`, import `captions.srt`, then add the on-screen text and the logo in the space left at the top of the last shot.

To make more packs:
```powershell
.\.venv\Scripts\python.exe flayel-videos\kling_pack.py --per-type 6   # next 3 of each type
.\.venv\Scripts\python.exe flayel-videos\kling_pack.py --all          # all 200
```
Topics written in `kling\written.json` only get voiced, with no AI cost. All other topics are written by the AI in `config.toml` (OpenRouter), which needs credits. Finished packs are skipped. Delete a pack's folder to remake it.

## Finished videos (Kling + motion graphics)

`make_video.py` turns a pack into a finished 1080×1920 MP4. It uses Kling clips for the story shots and Flayel motion graphics (Remotion, in `motion\`) for the product shots and end card. A Kling shot with no clip yet gets a motion-graphic scene instead.

```powershell
.\.venv\Scripts\python.exe flayel-videos\make_video.py feature/01            # plan + cost, free
.\.venv\Scripts\python.exe flayel-videos\make_video.py feature/01 --kling    # Kling shots (paid)
.\.venv\Scripts\python.exe flayel-videos\make_video.py feature/01 --render   # -> out\feature-01.mp4
```

Each shot's motion graphic is set in `kling\motion.json`. A shot names a template (`headline`, `list`, `versus`, `stat`, `chat`, `bucket`, `freshness`, `recap`, `todo`, `keys`, `bird`, `birdAction`, `brain`, `context`, `score`, `forget`) plus its content. Each item appears on the word given in its `at` field. Edit a line, then re-render that one video.

```powershell
powershell -File flayel-videos\render_all.ps1                     # every video in motion.json
powershell -File flayel-videos\render_all.ps1 pov/1 myth/2        # just these
.\.venv\Scripts\python.exe flayel-videos\contact_sheet.py pov-01  # one frame per shot, for review
```

The Kling key, endpoint and per-run budget cap live in `flayel-videos\.env` (git ignores it). Every Kling request is logged in `kling-ledger.json`. A rerun reuses finished shots and never pays twice for one.

## Launch films (Remotion + EffectCraft)

1920×1080 product launch films in the style of `Best-SaaS-Product-SnapYT.App.mp4`: beat-cut kinetic type, a clicking cursor, 3D-tilted UI cards, then a finishing pass in EffectCraft (an open-source After Effects-style compositor).

- `motion\src\launch\kit.tsx`: shared techniques (beat-locked scenes and transitions, type-on, word push, macOS cursor, tilt, keycaps, orbit, soundtrack).
- `motion\src\launch\FlayelLaunch.tsx` and `RecapHubLaunch.tsx`: one film each.
- `motion\src\launch\<film>.json`: the beat timeline (BPM, scenes in bars, transition and polish cues). Remotion and `polish.py` both read it.
- `polish.py`: builds `out\launch\<film>-launch.ecproj` (open it in EffectCraft to tweak) and renders the final MP4: a light sweep on `leak` cues, an exposure hit on `flash` cues, curves, sharpening, vignette and grain.
- `remotion\` and `effectcraft\` are the cloned source repos (for reference). `effectcraft-bin\` holds the prebuilt CLI that does the rendering.

```powershell
cd flayel-videos\motion
npx remotion render src/index.ts FlayelLaunch ..\out\launch\flayel-raw.mp4 --codec h264 --crf 14
node scripts\stills.mjs FlayelLaunch ..\out\launch\sheet.png 1 5 10 20   # quick contact sheet of any moments
cd ..\..
python flayel-videos\polish.py flayel            # -> flayel-videos\out\launch\flayel-launch.mp4
python flayel-videos\polish.py flayel --frame 21  # one polished still
```
Use `RecapHubLaunch` / `recaphub` for the RecapHub film.

### Sync a film to a new track (beat map)

AI-made tracks (Gemini, Suno) drift and jump phase between the chunks they are stitched from, so a fixed BPM grid puts cuts off the beat. `beatmap.py` tracks every real beat and finds the sections (intro, drop, breakdown, build, outro) and the strongest hits:

```powershell
.\.venv\Scripts\python.exe flayel-videos\beatmap.py track.mp3 --png flayel-videos\out\beatmap.png   # look at the song first
.\.venv\Scripts\python.exe flayel-videos\beatmap.py track.mp3 -o flayel-videos\motion\src\launch\recaphub.beats.json --timeline flayel-videos\motion\src\launch\recaphub.json
```

`--timeline` writes the beat grid (`grid`), the hits (`accents`) and `musicOffset` into the timeline and keeps its scenes. Then place scenes with `beat`/`beats` (beat numbers from the map) on the song's sections: the reveal on a drop, calm scenes in the breakdown. In the scene code, `B(n)` follows the real beats, so word pops, clicks and card reveals land on the music. Timeline options: `lead` starts transitions early so they land on the cut beat, `pulse` punches the picture in on each strong hit, `flashBeats` adds EffectCraft flashes on beats inside a scene (a drop mid-scene). `polish.py` reads the same grid.

The RecapHub film is cut to `music-precision-point.mp3` this way.

### Cut the track down to its driving parts (music edit)

When a track has breakdowns or long intros that would make the film dip, keep only the bars you want. `musicedit.py` splices on bar lines (numbers from the `--png` picture), crossfades for 25 ms just before each kept downbeat so the hit stays intact, and writes the edit's exact beat grid into the timeline:

```powershell
.\.venv\Scripts\python.exe flayel-videos\musicedit.py flayel-videos\out\Calculated_Force.mp3 --bars 6-12,32-46,51-60 -o flayel-videos\motion\public\launch\music-flayel-cf.wav --timeline flayel-videos\motion\src\launch\flayel.json
```

The Flayel film uses this edit of `Calculated_Force.mp3` (56 s, 124 BPM, no breakdowns).

## Change what the videos say

Edit `build_batches.py`, then run `.\.venv\Scripts\python.exe flayel-videos\build_batches.py`:
- `FACTS` is the only thing the script writer may claim.
- `CTA` is the closing line.
- `TOPICS` holds the 200 video ideas.
- `VOICES` and `STYLE` set the voices and caption style.
