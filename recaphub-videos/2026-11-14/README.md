# RecapHub films, 2026-11-14 (remade from the reference)

Eleven films rebuilt in the style of `recaphub-videos/preview.mp4`, using **real product footage and real UI**, not drawn mocks.

## What the reference does (and these films copy)

- **Stages:** dark indigo glow for the hook and problem, light grey-violet for the product, full violet for the end card.
- **Type:** Outfit, the marketing site's font. Headlines blur in word by word, and markup tunes them: `*accent*` colours words, `~grey~` makes the "bad" word shimmer, `^highlight^` sweeps a violet marker.
- **Swaps:** one line blurs out while its replacement blurs in ("lands in weeks" → "ships it before the room empties").
- **Camera:** push-ins, plus dives *into* an element (the LIVE badge, a URL pill), then a white flash cut to the next scene.
- **Crop → uncrop:** a detail of a real screen grows into the whole screen.
- **Depth of field:** the real page goes soft while one real card lifts off it, sharp.
- **Real 9:16 reels:** they float over live footage, and a UI element morphs into a phone ("Mark delivered" → the clip).
- **Live counters synced to the recording:** "QC 2/9 … QC passed" ticks with the real checklist.
- **Music:** about 140 BPM, a sparse intro, a build through the product, a stop and drop on the payoff, mastered quiet.

## Where the real material comes from

| Folder | What | Source |
|---|---|---|
| `motion/public/shots/` | 73 real recaphub_3.0 components at 2× (press room, topic maps, publish dialog, MCP dialog, stage wall, chat, themes…) | captured from the built Storybook by `capture/capture.cjs` |
| `motion/public/shots/*-1600.webp` | dashboard, knowledge hub, WEF recap pages | marketing site screenshots |
| `motion/public/demos/` | screen recordings: clip agent, clip studio QC, live ingest, OBS → RecapHub, recap report | marketing site demos |
| `motion/public/footage/` | the Bits & Pretzels panel, the HumanX stage | cropped from those recordings |
| `motion/public/reels/` | 23 real RecapHub vertical clips (RAISE, Bits & Pretzels, KAYAN, HumanX…) | marketing site reels |
| `motion/public/brand/` | the real RecapHub logo (violet and white) | marketing site |

## The films

| File | Feature | Real material it uses |
|---|---|---|
| `out/recaphub-teaser.mp4` | Teaser | LIVE→ENDED dive, HumanX stage iris, RAISE reels, published hero, assistant |
| `out/recaphub-shorts.mp4` | Stage → Shorts | B&P panel, clip agent recording, QC recording ticking to *QC passed*, Jordi Romero's reel |
| `out/recaphub-story.mp4` | MCP story (educative) | MCP connect dialog, assistant thread, debate panel with stances |
| `out/recaphub-pages.mp4` | Recap Pages | hero, page themes, publish dialog, topic maps, sessions, WEF pages + phone layouts |
| `out/recaphub-press.mp4` | Press Room | press gate, RAISE press room, quote wall, lane email, trusted mastheads, MCP card |
| `out/recaphub-intel.mp4` | Event Intelligence | mind map, opened theme, opened debate (*Unresolved*), treemap + speaker filter, at-a-glance |
| `out/recaphub-mcp.mp4` | MCP | Continue-in-MCP pill, MCP dialog, assistant, recap-page MCP card, suggestions |
| `out/recaphub-live.mp4` | Real-time (**hold**: Prakhar) | HumanX stage, stage wall, live chapter console, OBS stream, on-air timer, ingest health, HumanX reel |
| `out/recaphub-drive.mp4` | Integrations | session library, real download progress, agenda upload + review, brand panel, speaker review |
| `out/recaphub-analytics.mp4` | Audience Analytics (**hold**: #436) | real pages + dashboard, with the plan's metrics overlaid and tagged *Preview · illustrative numbers* |
| `out/recaphub-publish.mp4` | Publish in 3 steps (educative) | publish dialog, themes, topic-maps editor, MCP toggle, Preview & Publish, live hero |

## Rebuild

```powershell
# real components (serve the built Storybook first)
cd C:\Users\nitis\Desktop\recaphub_3.0\storybook-static; python -m http.server 6007
node recaphub-videos\2026-11-14\capture\capture.cjs
# music
.\.venv\Scripts\python.exe recaphub-videos\2026-11-14\compose2.py all
# films (+ audio master at -18 LUFS)
powershell -File recaphub-videos\2026-11-14\render_all.ps1            # or: render_all.ps1 Shorts Pages
# check frames first
cd recaphub-videos\2026-11-14\motion; powershell -File scripts\sheets.ps1 Shorts
```

## Still worth recording

A few product moments have no recording yet (they're shown with real stills instead): the Google Drive picker, Claude itself with RecapHub MCP answering, the clip carousel in chat being edited, and a journalist downloading the lane PDF. The step-by-step for each is in `../RECORDINGS.md`. Each recording you send can replace the still in its shot.
