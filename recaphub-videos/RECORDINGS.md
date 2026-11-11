# Recording guide (Recordly): every video, step by step

Every product screen in the 11 videos is a **slot**. Until you record it, the slot plays a motion-graphic mock I drew from the real recaphub_3.0 screens. That includes the Claude-style chat windows, which are only stand-ins. Once a recording is in its slot, **the mock disappears completely** and your real screen plays inside the same frame, on the same beat, with the same text around it.

So to remove every drawn Claude window, record the 6 Claude clips (marked 🟣 below): `mcp-connect`, `mcp-ask`, `teaser-ask`, `mcp-quotes`, `mcp-summary` and `mcp-empty`.

---

## Before you record anything

**Recordly settings (every clip)**
- 16:9, **1920×1080 or larger**, 60 fps, no webcam, no microphone.
- **Auto-zoom OFF, cursor effects OFF, click sounds OFF.** The videos add their own motion and sounds.
- One clip per slot, saved as `<slot>.mp4` (the names below).

**Browser**
- Chrome, a clean profile, bookmarks bar hidden, extensions hidden.
- Window maximised, **page zoom 125%** so text reads on a phone.
- Light theme in the app (the dark Terminal theme only appears where a step asks for it).

**Data: one demo event used everywhere**
- An event with realistic content: about 30+ sessions, 10+ speakers with photos, quotes, themes and debates. Use the client-approved event if Prakhar/Raj say yes (e.g. ONE Conference), otherwise a demo event. The mocks call it "Harbor Summit 2026"; that's fine to replace.
- Check before recording: clips generated on one keynote, the recap page published, insights computed, a press room set up with at least one journalist invite, and Drive connected on a test account.

**How to move**
- Slow, deliberate mouse moves. **Pause about 1 second after every click.**
- Record 2–3 seconds of stillness at the start and end of every clip.
- Long waits (rendering, processing) are fine: keep recording and I cut them.
- Hide anything private: other clients' events in the sidebar, emails, tokens, MCP URLs.

---

## 1 · Teaser (20 s) · `Teaser`

| Slot | On screen in the video | Length used |
|---|---|---|
| `event-footage` | Opening stage shot, all 12 clip slices, and every vertical clip in the Shorts video too | 20 s+ |
| `page-live` | "Pages." beat (8.7–11.6 s) | 3 s |
| `teaser-ask` 🟣 | "Answers." beat (11.6–14.5 s) | 3 s |

**`event-footage`: real stage footage, not a screen recording**
1. Pick 20–40 s of the real keynote video: a wide shot, speaker near the centre, slide wall behind, steady camera, no cuts.
2. Export as 1920×1080 MP4 with no audio needed. That's it.

**`page-live`**
1. Open the published recap page (`/share/<event>`), scrolled to the top.
2. Wait 1 s, then scroll smoothly down to **Topics and sessions** (the treemap) and pause 1 s.
3. Keep scrolling to **What was argued** (the mind map) and pause 2 s.

**`teaser-ask` 🟣** is the same recording as `mcp-ask` below. Just tell me and I'll set a later in-point so the teaser shows the answer arriving.

---

## 2 · Stage → Shorts promo (36 s) · `Shorts`

| Slot | Video moment | Length used |
|---|---|---|
| `shorts-render` | 7.5–10.3 s | 3 s |
| `shorts-carousel` | 14.1–19.7 s | 6 s |
| `shorts-edit` | 19.7–24.4 s | 5 s |

**`shorts-render`**
1. Dashboard → **Chat**, a new conversation.
2. Attach or pick the keynote session and type: *"Cut the keynote into shorts."* Send.
3. Keep recording through the **"Rendering session clips"** loader (with its quips) until the **Session clips** card shows **12 ready**. Cut nothing: I trim the wait.

**`shorts-carousel`**
1. The finished **Session clips** card, the first clip on stage.
2. Click the **›** next arrow, pause, click it again, landing on a clip that shows **Needs a look**.
3. Hover the "Needs a look" notes, then the virality score. Pause 2 s.

**`shorts-edit`**
1. Same chat, under the clip card.
2. Type a fix for that clip, e.g. *"Start clip 3 at 'Pricing is a story you tell twice' and end it on the laugh."* Send.
3. Record **Re-rendering…** until the new version lands, then hover the clip.

---

## 3 · MCP story (53 s) · `Story`

| Slot | Video moment | Length used |
|---|---|---|
| `mcp-connect` 🟣 | Step 01 Connect (14.5–20.7 s), also the MCP promo | 6 s |
| `mcp-ask` 🟣 | Step 02 Ask (20.7–29.0 s), also the MCP promo and the teaser | 8 s |

**`mcp-connect` 🟣 (Claude)**
1. claude.ai → **Settings → Connectors**.
2. Click **Add custom connector**, add **RecapHub MCP**, and complete the sign-in/authorise screen. Blur or skip the URL if you don't want it public.
3. Show the connector **on/connected**, and if Claude lists them, the events it can read. Pause 2 s.

**`mcp-ask` 🟣 (Claude)**
1. A new Claude chat with RecapHub MCP enabled.
2. Type slowly: **"What were the top 3 debates on day 2?"** and send.
3. Keep recording while the tool call runs and the full answer arrives with **quotes and timestamps**. Then scroll slowly through the answer. Pause 2 s.

The phone message scenes (9:02 / 9:06) are part of the story, not product UI, so they need no recording.

---

## 4 · Recap Pages promo (38 s) · `Pages`

| Slot | Video moment | Length used |
|---|---|---|
| `pages-publish` | "One click to publish." 6–10 s | 4 s |
| `pages-theme` | Re-skin montage 10–14 s | 4 s |
| `pages-live` | "Live in one link." 14–18 s | 4 s |
| `pages-treemap` | 18–22 s | 4 s |
| `pages-mindmap` | 22–25 s | 3 s |
| `pages-session` | 25–28 s | 3 s |
| `pages-mobile` | 28–31 s | 3 s |
| `pages-embed` | 31–33 s | 2 s |

1. **`pages-publish`**: event → **Overview**. Show the publish card, click **Publish** (or open the publish dialog and confirm), and hold on the published state with its link.
2. **`pages-theme`**: open the publish/layout dialog or Settings → Design with the live preview. Switch page style **Recap → Spotlight → Digest**, then the theme **Light → Terminal**, about 1 s apart, so each change is visible in the preview.
3. **`pages-live`**: open the live page (`/share/<event>`) at the top and scroll slowly into the sessions.
4. **`pages-treemap`**: start just above **Topics and sessions** and hover 2–3 tiles.
5. **`pages-mindmap`**: start at **What was argued**, hover a question, then a speaker stance.
6. **`pages-session`**: open one session page with the video playing **captions on**, and click a transcript line.
7. **`pages-mobile`**: Chrome DevTools device mode (iPhone 14 Pro, 390×844, zoom to fit), or a real phone screen recording. Scroll the recap page top to bottom.
8. **`pages-embed`**: a test web page with the recap embedded in an `<iframe>`. Scroll it a little.

---

## 5 · Press Room promo (38 s) · `Press`

| Slot | Video moment | Length used |
|---|---|---|
| `press-signin` | 6.4–10.7 s | 4 s |
| `press-room` | 10.7–16.1 s | 5 s |
| `press-copy` | 16.1–20.4 s | 4 s |
| `press-lane` | 20.4–24.6 s | 4 s |

Use a **test journalist account** (an approved/trusted publication) in a separate Chrome profile.
1. **`press-signin`**: open `/press/<event>` signed out. Type the journalist's work email, continue, and land inside the room.
2. **`press-room`**: the press room feed. Open the filters (**All Sessions / All Topics / All Speakers / Newest first**) and scroll slowly past the quote cards.
3. **`press-copy`**: on one strong quote, click **Copy** and wait for the toast, then **save it to My lane**.
4. **`press-lane`**: open **My lane** and click **Download PDF**. Wait for the "Lane downloaded as PDF" toast, then open the PDF for 2 s.

The MCP prompts and the newspaper page are motion graphics and need no recording.

---

## 6 · Event Intelligence promo (38 s) · `Intel`

| Slot | Video moment | Length used |
|---|---|---|
| `intel-themes` | 6.5–12 s | 5.5 s |
| `intel-mindmap` | "The questions people argued over" 12–17.5 s | 5.5 s |
| `intel-stances` | "Where each speaker stood" 17.5–23 s | 5.5 s |
| `intel-debates` | 23–28.4 s | 5.5 s |

Event → **Insights** (`/dashboard/<event>/insights`).
1. **`intel-themes`**: the event-wide themes view, then hover the top 2–3 themes.
2. **`intel-mindmap`**: open the mind map. Click into one theme so it branches into its questions.
3. **`intel-stances`**: click one question so the speaker stances appear, then hover two speakers.
4. **`intel-debates`**: the debates list showing their state (Split / Emerging consensus / Unresolved). Hover an **Unresolved** one.

⚠ Don't show the contradictions view, even if you have it locally: the brief says it isn't in the app yet.

---

## 7 · MCP promo (32 s) · `Mcp` (all Claude 🟣)

| Slot | Video moment | Length used |
|---|---|---|
| `mcp-empty` 🟣 | "Your team is in Claude." 2–5.7 s | 3 s |
| `mcp-connect` 🟣 | 5.7–9.5 s (same clip as the story) | 4 s |
| `mcp-ask` 🟣 | Maya's question 9.5–14.3 s (same clip as the story) | 5 s |
| `mcp-quotes` 🟣 | Jo's question 14.3–18.1 s | 4 s |
| `mcp-summary` 🟣 | Dana's question 18.1–21.9 s | 4 s |

1. **`mcp-empty`**: a fresh, empty Claude chat in **dark mode**, cursor blinking in the input. 3–5 s, no typing.
2. **`mcp-quotes`**: a new chat with RecapHub MCP. Type **"Three quotes on pricing for LinkedIn."**, send, and record until the quotes with speakers and timestamps are fully shown.
3. **`mcp-summary`**: a new chat. Type **"Summarise day 1 for the board, in 5 bullets."**, send, and record until the answer finishes.

---

## 8 · Real-time / Live promo (30 s) · `Live` (HOLD: confirm with Prakhar first)

| Slot | Video moment | Length used |
|---|---|---|
| `live-stage` | 7.3–11.8 s | 4.5 s |

1. Ask Prakhar which live features are real today. Record only those.
2. Event → **Stages** (`/dashboard/<event>/stages`) during a live or simulated stream. Show the stage cards with **LIVE** state, then open the main stage to its live transcript/stream view.

The split screen (live keynote + transcript + "clip ready") and the posted phone are motion graphics. If live clips are real, a 5 s recording of a clip appearing while the stream runs would make it much stronger; send it and I'll add a slot.

---

## 9 · Integrations (Drive) promo (35 s) · `Drive`

| Slot | Video moment | Length used |
|---|---|---|
| `drive-connect` | 6.1–10.2 s | 4 s |
| `drive-import` | 10.2–15.3 s | 5 s |
| `drive-assets` | 21.4–26.4 s | 5 s |

1. **`drive-connect`**: on a test account with Drive disconnected, go to **Integrations** (`/dashboard/integrations`). Click **Connect** on Google Drive, finish Google's consent screen (I'll cut it), and land back on **Connected**.
2. **`drive-import`**: open the Drive source browser, go into the recordings folder, tick 2–3 videos (ideally the big 26 GB one), and click **Import**. Hold on the toast *"Import queued. Sessions will appear here once processing completes."*
3. **`drive-assets`**: once processed, open the imported session and click through **Transcript → Summary → Key quotes → Clips**, about 1 s each.

Send me the real processing time for the big file too. The video says "about 5 minutes" (Prakhar's figure), and I'll match whatever is true.

---

## 10 · Audience Analytics promo (31 s) · `Analytics` (HOLD until #436, when real data flows)

| Slot | Video moment | Length used |
|---|---|---|
| `analytics-overview` | 5.9–10.8 s | 5 s |
| `analytics-sections` | 10.8–15.7 s | 5 s |

1. **`analytics-overview`**: event → **Overview**, the analytics card (visits, page views, sessions opened, plays, top sessions), last 30 days. Hover a top session.
2. **`analytics-sections`**: **Settings → Analytics**, the section-reach / scroll view. Change the date range once.

The numbers in the mock (412 visits, etc.) are placeholders. The real recording replaces them.

---

## 11 · "Publish your recap in 3 steps" (51 s) · `Publish`

| Slot | Video moment | Length used |
|---|---|---|
| `publish-layout` | Step 1 (4.3–15 s) | 10 s |
| `publish-design` | Step 2 (15–25.7 s) | 10 s |
| `publish-share` | Step 3 (25.7–36.4 s) | 10 s |

Each step is 10 s, so record it slowly, about 3 s per action.
1. **`publish-layout`**: open the publish/layout dialog. Pick layout **Event**, pause, then page style **Spotlight**, pause, then theme **Terminal**. Let the preview update after each.
2. **`publish-design`**: **Settings → Design**. Turn on, about 2.5 s apart: the topic treemap, the mind map ("What was argued"), speaker search, and the **Continue in RecapHub MCP** button. Show the preview changing if there is one.
3. **`publish-share`**: click **Publish** and wait for it to go live. **Copy link**, pause, open the **Embed** option, then copy the iframe code.

---

## After recording

1. Put the files in `recaphub-videos/motion/public/rec/` (names exactly as the slots).
2. Either send them to me and I'll trim, set the in-points and re-render, or do it yourself in `motion/src/recordings.json`:
   ```json
   "shorts-carousel": {"file": "rec/shorts-carousel.mp4", "from": 2.5, "rate": 1}
   ```
   `from` is the second the slot starts playing from, and `rate` 1.5 plays it 1.5× faster (fine for slow UI moves). Then run `powershell -File recaphub-videos\render_all.ps1 shorts`.

**Minimum set for the biggest win (about 20 minutes of recording):** `event-footage`, the 5 Claude clips (`mcp-connect`, `mcp-ask`, `mcp-quotes`, `mcp-summary`, `mcp-empty`), `shorts-carousel`, `pages-live` and `press-room`. That covers every Claude screen and the most visible product moments.
