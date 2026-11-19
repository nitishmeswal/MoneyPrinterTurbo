# RecapHub promo films, v3 (2026-11-19)

Twelve product films, one per topic, each in its own format, built with an upgraded pipeline aimed at the
polish of the Teamble reference (`flayel-videos/Best-SaaS-Product-SnapYT.App.mp4`), in the EventLabs ×
RecapHub brand. The previous sets are untouched for comparison:

| Set | Folder | Look |
|---|---|---|
| v1 | `recaphub-videos/out/` | drawn UI mocks |
| v2 | `recaphub-videos/2026-11-14/out/` | real captures, violet + Outfit (from recaphub.co) |
| **v3** | **`recaphub-promo/out/`** | **real captures + animated product fragments, brand doc look, Teamble-style motion** |

## What changed from v2, and why

| Gap against Teamble | v3 |
|---|---|
| Hard cuts between shots | Shots overlap one beat and hand over with designed transitions: whip pans (directional blur), the brand-gradient wipe, push-ins, dives into an element, zooms |
| Screenshots moved as a whole | Every element arrives on its own (cards, chips, rows, avatars, numbers), and product pieces move inside: timers tick, the QC list ticks its real 9 checks, progress fills, answers stream, buttons press |
| One spring for everything | A curve per job: long soft landings for arrivals, strong in-out for camera and whips, a small overshoot for pops |
| Flat, still frames | A camera with depth (background layers move slower than the UI) that never fully stops |
| No motion blur | Film-camera motion blur (6 sub-frame samples) on every fast move in the final render |
| Few sound effects | A cue on every event (20 synthesised effects: whoosh, whip, pop, click, tick, key, ding, chime, riser, impact…) |
| Cursor as a flat icon | A solid extruded cursor that arcs, leans into its motion, squashes on a click and ripples |
| Violet marketing look | The brand doc: off-white page, the brand gradient images, League Spartan + Ubuntu, deep-blue highlight, one orange CTA |

## Measured against Teamble (`review/measure.py`)

| | Hard cuts / min | Motion per frame | Still frames |
|---|---|---|---|
| Teamble reference | 6.7 | 3.37 | 6.1% |
| v2 (11 films) | 4.3–13.0 | 0.83–2.94 | 51–79% |
| **v3 (12 films)** | **1.1–3.9** | **1.17–1.93** | **1.6–7.1%** (Story 13%) |

Still frames are now at or below the reference in 11 of 12 films; hand-overs are transitions, not cuts.
The remaining gap is motion per frame: Teamble throws whole interfaces across the screen on most beats;
v3 moves are shorter and calmer. Audio: every film lands at about -15.4 LUFS (single-pass loudnorm, -16 target).

## The films

| # | File | Topic | Format | Length | Real material |
|---|---|---|---|---|---|
| 1 | `recaphub-launch.mp4` | Flagship | Continuous product story (the approved style frames) | 95 s | reel, fixtures, MCP pill |
| 2 | `recaphub-teaser.mp4` | Teaser | Logo reveal, three-beat montage | 25 s | RAISE reels, hero |
| 3 | `recaphub-shorts.mp4` | Stage → Shorts | Process film on the step timeline | 40 s | B&P panel footage, clip agent + QC recordings, B&P reels |
| 4 | `recaphub-story.mp4` | MCP (educative) | Storytelling: Monday 9:02 → 9:06 | 56 s | MCP dialog, tool calls |
| 5 | `recaphub-pages.mp4` | Recap Pages | Page builds itself in a browser | 37 s | hero, at a glance, topic maps, speakers, themes, phone layouts |
| 6 | `recaphub-press.mp4` | Press Room | Newsroom feed | 37 s | press gate, lane email, access settings |
| 7 | `recaphub-intel.mp4` | Event Intelligence | Data film | 37 s | mind map, opened theme, at a glance |
| 8 | `recaphub-mcp.mp4` | MCP | Chat demo | 29 s | continue card, connect dialog, tool calls |
| 9 | `recaphub-live.mp4` | Real-time (**HOLD**: Prakhar) | Countdown film | 31 s | HumanX footage, live ingest recording, on-air timer, Stefan Weitz reel |
| 10 | `recaphub-drive.mp4` | Integrations | Flow film | 35 s | download, agenda parse, brand panel |
| 11 | `recaphub-analytics.mp4` | Audience Analytics (**HOLD**: #436) | Stats film, numbers tagged illustrative | 31 s | event dashboard |
| 12 | `recaphub-publish.mp4` | Publish in 3 steps (educative) | Tutorial on the step timeline | 47 s | publish dialog, themes, insight + MCP editors |

Defaults used for the open style-frame decisions: white box behind key words on gradients, black lockup,
fixture event (Northwind Summit 2026) plus real RecapHub reels, the page end card with the orange "Book a
demo" bar, no QR code.

## Pipeline

```
brief → script → style frames (approve) → beat plan → shots → review loop → final render
                                            │            │         │
                                    audio/score.py   motion/src  stills sheet · motion strip ·
                                    review/times.py  films/*.tsx side by side with Teamble · measure.py
```

Commands and the kit are in `CLAUDE.md`. Re-render everything: `powershell -File recaphub-promo\render.ps1`.

## What only you can add (each one lifts the polish further)

1. **Music.** The tracks are composed in code on each film's beat grid. A licensed track at the same tempo
   dropped at `motion/public/music/<film>.wav` replaces one; nothing else changes.
2. **A real 3D cursor** rendered in Blender (D:\tools) would replace the drawn extruded one.
3. **Recordings** still missing (see `recaphub-videos/RECORDINGS.md`): the Drive picker, Claude answering
   through RecapHub MCP, the clip carousel being edited, a journalist downloading the lane PDF.
4. **The official recaphub.co QR code** for the end card's CTA bar.
