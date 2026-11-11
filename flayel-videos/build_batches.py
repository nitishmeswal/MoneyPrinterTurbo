"""Build MoneyPrinterTurbo batch manifests for Flayel marketing videos.

Run from the MoneyPrinterTurbo folder:
    .venv\\Scripts\\python.exe flayel-videos\\build_batches.py

Writes flayel-videos/batch-1.jsonl and batch-2.jsonl (100 videos each; the
CLI accepts at most 100 tasks per manifest). Edit FACTS, CTA, STYLE or the
topic lists below, then run it again.
"""

from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
BATCH_SIZE = 100  # MoneyPrinterTurbo's per-manifest limit
PROMPT_LIMIT = 2000  # VideoParams.video_script_prompt max_length

CTA = "Try Flayel free at flayel dot com."

# Everything the script writer is allowed to claim. Keep it factual: the LLM
# is told to use nothing else, so a wrong line here becomes 200 wrong videos.
FACTS = f"""Write the voiceover for a 30-45 second vertical video about Flayel. Use ONLY these facts. Never invent features, numbers, prices, customers or stories.

FLAYEL: "Your AI tools forget. Flayel remembers."
- A memory layer for people who build with AI: solo builders, indie hackers, founders.
- Problem: Claude, ChatGPT, Cursor and Gemini start every chat knowing nothing about your project, so you re-explain your vision, stack, decisions and progress again and again. Projects die quietly between sessions.
- Project Brain: structured memory in up to six buckets: Vision, Architecture, Progress, Decisions, User Feedback, Monetization.
- One click copies a context block formatted for Claude, ChatGPT, Cursor or Gemini.
- The bird, a Chrome extension: on ChatGPT, Claude, Gemini or Cursor press Ctrl+Shift+S to inject your project context into the prompt box. It also captures a finished AI chat back into your brain with secrets redacted, jots a thought or a paper ship (decided but not built yet) from any page, and saves pages for later. It only acts when you click.
- Ship Score: a 0-100 momentum number calculated from what you actually did, never an AI guess.
- The Crown (Pro plan): Flayel reads your memory and answers like a cofounder: remarks, missed potential, this week's todos.
- Free plan to start. Your data stays in your account; export or delete it anytime.

RULES: spoken plain English, short sentences. The first sentence is a hook. 70-110 words. No emojis, hashtags, markdown, stage directions or speaker labels. Do not state prices. End with exactly: "{CTA}\""""

# Extra facts and a format hint per content pillar, appended to FACTS.
PILLARS: dict[str, str] = {
    "pain": "FORMAT: open with a relatable frustration, then show how Flayel fixes it.",
    "feature": "FORMAT: a concrete explainer of this one feature: what it is, how you use it, why it helps.",
    "tool": "FORMAT: a practical tip for this AI tool, with Flayel as the natural way to do it.",
    "edu": "FORMAT: a genuinely useful tip that stands on its own. Mention Flayel only once, near the end.",
    "bucket": (
        "FORMAT: explain this bucket and the AI failure it stops.\n"
        "Goes stale in: Vision 90 days (one-liner, for, problem, insight); "
        "Architecture 30 (stack, data+auth, AI rules); "
        "Progress 7 (works, in progress, next, broken/mocked); "
        "Decisions 30 (decided, because, ruled out, open loops); "
        "User Feedback 14 (quotes, complaints, requests); "
        "Monetization 30 (pricing, revenue, costs, channel)."
    ),
    "myth": "FORMAT: answer the question or compare honestly, and be fair to the alternative.",
    "pov": "FORMAT: a short, funny, relatable scene told in second person, then the Flayel twist.",
    "momentum": (
        "FORMAT: motivating and practical, about shipping consistently.\n"
        "SHIP SCORE inputs: filled memory, logged sessions and how recent they are, "
        "todos done, milestones hit, progress updates, and traction."
    ),
}

TOPICS: dict[str, list[str]] = {
    "pain": [
        "Typing 'so I'm building an app that...' for the hundredth time",
        "Your best product ideas are scattered across notes, DMs and old chats",
        "Why long AI chats get worse the longer they run, and what to do instead",
        "Why your side project dies quietly between sessions",
        "You switched from Cursor to Claude mid-feature and lost all your context",
        "When Cursor rewrites code that ignores the decision you made last week",
        "Stop re-explaining your project to ChatGPT every single morning",
        "Your AI keeps suggesting the database you already ruled out",
        "Coming back to a project after two weeks and remembering nothing",
        "Your AI coding assistant has amnesia, and it costs you hours every week",
        "A week of only thinking about your project should not count as a lost week",
        "The hidden tax of a new Claude chat: ten minutes of re-explaining your stack",
        "The real reason AI-generated code does not fit your codebase",
        "Copy-pasting the same project description into four different AI tools",
        "Your AI builds a generic product because it does not know who it is for",
        "You fixed the bug yesterday; today your AI tries to fix it again",
        "Losing a brilliant AI conversation because it scrolled away",
        "The re-explaining loop that keeps solo builders from shipping",
        "Every AI tool you use knows nothing about the others",
        "Why 'just keep a doc' stops working after week two",
        "Context switching between side projects is killing your momentum",
        "Three things your AI should know before you type a single prompt",
        "When your AI redoes finished work because it does not know what already works",
        "Pasting your README into ChatGPT is not a memory system",
        "Five side projects and you remember none of them",
        "You pay for four AI tools that all forget you",
        "The new-chat panic: where did I leave off?",
        "Your AI does not know what is mocked and what is real in your app",
        "Building with AI feels fast until you count the time spent re-explaining",
        "Your AI tools need a shared memory, not a bigger context window",
    ],
    "feature": [
        "What Flayel is, explained in 30 seconds",
        "Inject your whole project into ChatGPT with one keyboard shortcut",
        "Capture a finished AI chat back into your project brain in one click",
        "How the Flayel Project Brain organises what your AI needs to know",
        "One click to copy a context block formatted for Claude, ChatGPT, Cursor or Gemini",
        "Meet the bird: the Flayel Chrome extension that lives on every page",
        "What a paper ship is, and why Flayel lets you log one",
        "Jot a thought from any web page straight into your project",
        "Ship Score: a momentum number from real activity, not an AI guess",
        "The Crown: Flayel reads your project and answers like a cofounder",
        "Save an article for later into the right project with the bird",
        "How Flayel redacts secrets when you capture an AI chat",
        "Folding a raw thought into your project memory",
        "Setting up Flayel for a new project in a few minutes",
        "Choosing which memory buckets your project runs",
        "How Flayel keeps Claude and Cursor on the same page about your project",
        "From scattered notes to one project brain",
        "Page insight: what this article means for your project",
        "Why Flayel uses six kinds of memory instead of one text box",
        "Connecting the Flayel bird to your account without pasting tokens",
        "Your context block updates the moment your progress changes",
        "What happens to your data in Flayel: your account, export and delete anytime",
        "Flayel's free plan: start remembering your project today",
        "The Crown turns this week's thinking into this week's todos",
        "Thoughts and paper ships: the inbox for ideas you have not built yet",
        "How the Ship Score rewards shipping instead of busywork",
        "Using Flayel when you only have ten minutes to work today",
        "Log a work session so tomorrow starts exactly where today stopped",
        "The welcome-back recap when you return to a project that went cold",
        "Milestones in Flayel: celebrate what you ship and share it publicly",
    ],
    "tool": [
        "Use Gemini for research without losing your project context",
        "Move a half-finished feature from ChatGPT to Claude without losing anything",
        "Keep Cursor from writing code that breaks your architecture",
        "Give Claude your full project context before your first prompt",
        "Claude, ChatGPT and Cursor: one project memory for all three",
        "Start a new Claude chat that already knows your stack",
        "The best first message to send Cursor on a new feature",
        "Make ChatGPT remember your project across every new chat",
        "Why ChatGPT memory is not the same as project memory",
        "Claude Projects are great, until you also use Cursor",
        "Feed Cursor your decisions so it stops reopening settled questions",
        "One shortcut, four AI tools: Ctrl Shift S",
        "Prompt Claude with your architecture so the code fits on the first try",
        "Get ChatGPT to write marketing copy that knows your real users",
        "Ask Gemini to review your plan with full project context",
        "The context block format that works best in Cursor",
        "Switch AI tools mid-project without starting over",
        "Claude for planning, Cursor for building, one shared brain",
        "Why ChatGPT custom instructions are not enough for a real project",
        "Three AI tools, one source of truth for your project",
        "Capture a great Claude conversation before it disappears",
        "When to start a fresh chat, and how to make it not feel fresh",
        "Make a brand-new Cursor session productive in under a minute",
        "Your AI pair programmer should know what shipped yesterday",
        "Analyse user feedback in ChatGPT with your project brain loaded",
    ],
    "edu": [
        "How to end a coding session so tomorrow is easy",
        "Write down what is mocked in your app before your AI builds on it",
        "How to write a one-line vision your AI can use",
        "Why you should write down what you decided not to build",
        "Keep a decision log and stop arguing with your AI about the same thing",
        "Six things every AI coding session should start with",
        "Context engineering for solo builders: what your AI actually needs",
        "The weekly review that keeps side projects alive",
        "Why progress notes go stale in a week and your vision lasts a quarter",
        "Give your AI feedback from real users instead of your guesses",
        "Vibe coding without the chaos: keep a project brain",
        "The difference between a prompt and context",
        "Why bigger context windows do not fix forgetting",
        "How to restart a project you abandoned three months ago",
        "Shipping every week as a solo founder",
        "What to tell your AI about your stack, auth and AI rules",
        "The open loops list: every builder needs one",
        "Turn walk-and-think time into real progress",
        "How indie hackers lose momentum, and how to get it back",
        "Stop treating AI chats as disposable",
        "Your project needs a single source of truth, and it is not your codebase",
        "Write next steps so you never wonder what to do today",
        "Build in public without spending hours writing updates",
        "Why momentum beats motivation for side projects",
        "The two memories every returning builder needs first: what this is and where it stands",
        "Keep monetization in mind while you build",
        "Do not let your AI optimise for the wrong user",
        "A simple system for working on several side projects",
        "What to do in the first five minutes of every build session",
        "Why most AI-built apps stall at eighty percent",
        "How to hand off a project to your future self",
        "The paper ship mindset: decided counts as progress",
        "Small sessions, real progress: building with ten free minutes a day",
        "Make AI your cofounder instead of your autocomplete",
        "How to stop your project from going cold",
    ],
    "bucket": [
        "Let your AI hear what real users said",
        "Remind your AI that this has to make money",
        "Vision lasts a quarter: the slowest memory to go stale",
        "The Architecture bucket: make AI code fit your stack",
        "Write your stack, data and auth in a way any AI understands",
        "Why your AI rules belong in project memory",
        "The Progress bucket: works today, in progress, next",
        "Progress goes stale in a week, and that is the point",
        "Broken or mocked: the line that stops your AI building on sand",
        "The Decisions bucket: decided, because, ruled out",
        "Open loops: the decisions you have not made yet",
        "Why your AI keeps reopening settled questions",
        "The User Feedback bucket: quotes, complaints, delights, requests",
        "The Vision bucket: stop your AI building a generic product",
        "User feedback goes stale in two weeks, and why that matters",
        "The Monetization bucket: pricing, revenue, target, costs, channel",
        "What goes in the Vision bucket: one-liner, who it is for, the problem",
        "Six kinds of memory, six ways an AI fails without them",
    ],
    "myth": [
        "Flayel versus keeping a doc of your project",
        "Myth: a bigger context window means your AI remembers",
        "Flayel versus Claude Projects",
        "Flayel versus Cursor rules files",
        "Flayel versus Notion for AI builders",
        "Is Flayel a notes app? No, and here is the difference",
        "Is Flayel a project manager? Not quite",
        "Flayel versus ChatGPT memory",
        "Myth: you only need project context for big projects",
        "Myth: thinking without shipping is wasted time",
        "Myth: pasting your whole codebase is the best context",
        "Native AI memory versus cross-tool project memory",
        "Why a structured memory beats one long prompt",
        "Copy-paste templates versus a living project brain",
        "Does Flayel read my browsing? No, the bird only acts when you click",
        "Do I need to log in inside the Flayel extension? No",
        "Flayel is not another chat app",
        "Can my AI tools share one memory? Here is how",
        "Is my project data safe in Flayel?",
        "Flayel Free versus Pro: remember versus think",
    ],
    "pov": [
        "POV: you finally ship after weeks of only thinking",
        "POV: you come back from a two-week trip to your half-built app",
        "POV: your AI suggests the exact thing you ruled out yesterday",
        "POV: you get a great product idea on a walk with no laptop",
        "POV: you switch from ChatGPT to Cursor and start explaining again",
        "POV: it is 1am and you open a new chat to finish your side project",
        "Things solo builders say: 'where was I?'",
        "Things solo builders say: 'I already told you that'",
        "The life cycle of a side project without memory",
        "The five stages of starting a new AI chat",
        "Monday morning as a solo builder: what do I work on?",
        "When your weekend project becomes a weekday project",
        "The graveyard of half-built side projects, and how to stay out of it",
        "Your AI is brilliant but has no idea what you are building",
        "Building after your day job with one hour a night",
        "Juggling three side projects with one brain",
        "The feeling of opening a project that remembers you",
        "Your notes app is full of ideas you will never build",
        "A busy week versus a shipping week",
        "From idea on a napkin, to paper ship, to shipped",
    ],
    "momentum": [
        "What a Ship Score tells you about your project",
        "Why Flayel's Ship Score is calculated, not guessed by AI",
        "How finishing a real todo moves your Ship Score",
        "Use a momentum score to beat procrastination",
        "Find the biggest lever on your Ship Score this week",
        "Why logging sessions matters even on small days",
        "Ship every week: a simple rule for indie hackers",
        "Plan your week around what actually ships",
        "Turn the Crown's todos into this week's plan",
        "The going-cold list: projects that need you back",
        "Small wins compound: tracking momentum on a side project",
        "What shipping really means for a solo builder",
        "Celebrate milestones publicly to keep going",
        "Missed potential: what the Crown notices that you do not",
        "A cofounder that remembers everything you decided",
        "From paper ship to first step with the Crown",
        "Why consistency beats intensity on side projects",
        "How to tell if your project is on track or stalled",
        "The weekly ritual: review, plan, ship",
        "Keep your vision fresh while you build fast",
        "Momentum is a habit, not a mood",
        "Your AI tools forget. Here is how to make them remember",
    ],
}

# Edge TTS voices (free, no key). Indian English first: Flayel launches India-first.
VOICES = [
    "en-IN-PrabhatNeural-Male",
    "en-US-AvaNeural-Female",
    "en-IN-NeerjaNeural-Female",
    "en-US-AndrewNeural-Male",
    "en-US-EmmaNeural-Female",
    "en-US-BrianNeural-Male",
]

# Shared look: vertical, word-by-word captions with a pop, free stock footage.
STYLE = {
    "video_source": "pexels",
    "video_aspect": "9:16",
    "video_language": "en-US",
    "paragraph_number": 1,
    "video_clip_duration": 3,
    "voice_rate": 1.05,
    "bgm_type": "random",
    "bgm_volume": 0.12,
    "subtitle_enabled": True,
    "subtitle_display_mode": "word_by_word",
    "subtitle_animation": "pop_spring",
    "subtitle_position": "custom",
    "custom_position": 62.0,
    "font_name": "BeVietnamPro-Bold.ttf",
    "font_size": 72,
    "text_fore_color": "#FFFFFF",
    "stroke_color": "#000000",
    "stroke_width": 3.0,
}


def interleave(topics: dict[str, list[str]]) -> list[tuple[str, str]]:
    """Mix pillars so each batch (and each day's posts) has variety."""
    queues = {pillar: list(items) for pillar, items in topics.items()}
    mixed: list[tuple[str, str]] = []
    while any(queues.values()):
        for pillar, queue in queues.items():
            if queue:
                mixed.append((pillar, queue.pop(0)))
    return mixed


def main() -> None:
    rows = interleave(TOPICS)
    subjects = [subject for _, subject in rows]
    duplicates = {s for s in subjects if subjects.count(s) > 1}
    if duplicates:
        raise SystemExit(f"duplicate topics: {sorted(duplicates)}")

    entries = []
    for number, (pillar, subject) in enumerate(rows):
        prompt = f"{FACTS}\n{PILLARS[pillar]}"
        if len(prompt) > PROMPT_LIMIT:
            raise SystemExit(
                f"prompt for pillar {pillar!r} is {len(prompt)} chars; limit {PROMPT_LIMIT}"
            )
        entries.append(
            {
                **STYLE,
                "video_subject": subject,
                "video_script_prompt": prompt,
                "voice_name": VOICES[number % len(VOICES)],
            }
        )

    for old in HERE.glob("batch-*.jsonl"):
        old.unlink()
    for start in range(0, len(entries), BATCH_SIZE):
        path = HERE / f"batch-{start // BATCH_SIZE + 1}.jsonl"
        with path.open("w", encoding="utf-8", newline="\n") as handle:
            for entry in entries[start : start + BATCH_SIZE]:
                handle.write(json.dumps(entry, ensure_ascii=False) + "\n")
        print(f"wrote {path.name}: {len(entries[start : start + BATCH_SIZE])} videos")

    counts = ", ".join(f"{p} {len(t)}" for p, t in TOPICS.items())
    longest = max(len(f"{FACTS}\n{h}") for h in PILLARS.values())
    print(f"total {len(entries)} ({counts}); longest prompt {longest}/{PROMPT_LIMIT} chars")


if __name__ == "__main__":
    main()
