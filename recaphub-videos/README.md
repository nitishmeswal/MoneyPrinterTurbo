# RecapHub videos

Eleven RecapHub marketing films (1920×1080, music only), one for every feature in the product brief plus a teaser and two explainers. They're built with Remotion and finished in EffectCraft. Run Python from the `MoneyPrinterTurbo` folder and Node from `recaphub-videos\motion`.

- `SCRIPTS.md`: every script, shot by shot, plus notes from the product brief
- `RECORDINGS.md`: step-by-step Recordly instructions for every product screen, and how to drop recordings in
- `out\recaphub-<film>.mp4`: the finished films (not in git, because several are over GitHub's 100 MB limit; run `render_all.ps1` to make them)

| Film | Composition / `<film>` | BPM | Status |
|---|---|---|---|
| Teaser (20 s, logo reveal → content) | `Teaser` / `teaser` | 124 | ready |
| Stage → Shorts (36 s, kinetic motion graphics) | `Shorts` / `shorts` | 128 | ready |
| MCP story (53 s, storytelling) | `Story` / `story` | 116 | ready |
| Recap Pages (38 s, theme-switch montage) | `Pages` / `pages` | 120 | ready |
| Press Room (38 s, newsroom) | `Press` / `press` | 112 | ready |
| Event Intelligence (38 s, data map) | `Intel` / `intel` | 110 | ready |
| MCP promo (32 s, rapid-fire Q&A) | `Mcp` / `mcp` | 126 | ready |
| Real-time / Live (30 s, live broadcast) | `Live` / `live` | 132 | hold: check with Prakhar |
| Integrations, Drive (35 s, pipeline) | `Drive` / `drive` | 118 | ready |
| Audience Analytics (31 s, dashboard reveal) | `Analytics` / `analytics` | 122 | hold: after #436 |
| Publish in 3 steps (51 s, guided tutorial) | `Publish` / `publish` | 112 | ready |

Each film is `motion\src\RecapHub<Film>.tsx` + `motion\src\recaphub-<film>.json` (its beat timeline) + `motion\public\launch\music-rh-<film>.wav`.

## Render everything (or some)

```powershell
powershell -File recaphub-videos\render_all.ps1                # all 11: raw render + polish
powershell -File recaphub-videos\render_all.ps1 pages press    # just these
```

## Make a film step by step

```powershell
# 1. music (only when a track changes; also writes its hits into the timeline)
.\.venv\Scripts\python.exe recaphub-videos\compose.py shorts      # or teaser / story / all

# 2. check moments, then render
cd recaphub-videos\motion
node scripts\stills.mjs Shorts ..\out\shorts-sheet.png 1 5 10 20
npx remotion render src/index.ts Shorts ..\out\shorts-raw.mp4 --codec h264 --crf 14
cd ..\..

# 3. finishing pass + audio master at -16 LUFS
$env:PYTHONIOENCODING='utf-8'; .\.venv\Scripts\python.exe recaphub-videos\polish.py shorts
```

## How it fits together

- `motion\src\kit.tsx` is the launch-film toolkit: beat-locked scenes and transitions, type-on, word push, the macOS cursor, tilt. It is copied from `flayel-videos`, plus a `fadeIn` option and four new sound effects.
- `motion\src\rh.tsx` holds the RecapHub brand pieces: tokens, stone/ink/paper stages, the mark, the CTA, the browser frame, the recording slot (`Rec`) and the drawn keynote stage (`Footage`) that stands in until `event-footage.mp4` arrives.
- `motion\src\ui.tsx` holds the shared mocks of the real screens: the dashboard shell, the published recap site (Recap/Spotlight/Digest, Light/Terminal, desktop/phone), the treemap, the debate map, the session page, plus `Film`, `EndCard`, `Lead`, `Slam` and `Toast`.
- `motion\src\RecapHub<Film>.tsx` are the films. Every timing is in beats (`B(n)`), so the picture follows the music.
- `compose.py` writes the soundtracks in code (kick, clap, hats, sub bass, plucks, pad, keys, clock), exactly on the grid, so the timelines need no beat map.
- `polish.py` uses the EffectCraft CLI from `flayel-videos\effectcraft-bin`.
- `motion\node_modules` is a junction to `flayel-videos\motion\node_modules`, which has the same package.json. If that folder ever goes, run `npm ci` in `motion`.
- Brand rules (recaphub_3.0 DESIGN.md): warm stone and ink, brand blue `#4361EE` for action only, Geist + Crimson Pro italic, **no violet gradients, no glow, no gradient text**. Domain: recaphub.co.

## Swap in a produced track

The composed tracks are clean and exactly on the beat. To use a track from Suno or Gemini instead, keep the same tempo, put the file in `motion\public\launch\`, and point the timeline's `music` at it. If the track drifts, run `flayel-videos\beatmap.py track.mp3 --timeline <timeline>` to write its real beat grid.
