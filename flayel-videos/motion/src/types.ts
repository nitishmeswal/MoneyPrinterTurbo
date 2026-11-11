export type Word = { text: string; start: number; end: number };

export type Shot = {
  seconds: number;
  type: 'kling' | 'screen_recording';
  voiceover: string;
  kling_prompt: string;
  on_screen_text?: string;
  start: number;
  end: number;
  clip?: string | null;
  /** Motion-graphic scene for this shot, from kling/motion.json. */
  motion?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type VideoProps = {
  id: string;
  subject: string;
  fps: number;
  duration: number;
  shots: Shot[];
  words: Word[];
  voiceover: string;
};

/** Words spoken inside a shot, with times relative to the shot's start. */
export const wordsIn = (words: Word[], shot: Shot): Word[] =>
  words
    .filter((w) => w.start >= shot.start - 0.05 && w.start < shot.end)
    .map((w) => ({ ...w, start: w.start - shot.start, end: w.end - shot.start }));

const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** When (seconds into the shot) a word is first spoken, or a fallback. */
export const timeOf = (words: Word[], target: string, fallback: number): number => {
  const hit = words.find((w) => clean(w.text).startsWith(clean(target)));
  return hit ? hit.start : fallback;
};
