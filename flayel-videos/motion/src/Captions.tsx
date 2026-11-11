import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SANS } from './brand';
import { Word } from './types';

type Chunk = { words: Word[]; start: number; end: number };

/** Group words into short phrases (max 3 words, broken at punctuation). */
const chunk = (words: Word[]): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const breakHere = cur.length >= 3 || /[.,!?:;]$/.test(w.text) || i === words.length - 1;
    if (breakHere) {
      out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    }
  });
  return out.map((c, i) => ({ ...c, end: i + 1 < out.length ? out[i + 1].start : c.end + 0.6 }));
};

/** Word-by-word captions: the phrase on screen, the spoken word lit up. */
export const Captions: React.FC<{ words: Word[]; until: number }> = ({ words, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t >= until) return null;
  const chunks = chunk(words.filter((w) => w.start < until));
  const current = chunks.find((c) => t >= c.start && t < c.end);
  if (!current) return null;
  const pop = spring({ frame: frame - Math.round(current.start * fps), fps, config: { damping: 14, mass: 0.5 } });
  return (
    <div style={{ position: 'absolute', top: 1340, width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 940,
          background: 'rgba(255,255,255,0.96)', borderRadius: 30, padding: '20px 36px',
          transform: `scale(${0.9 + pop * 0.1})`, opacity: Math.min(1, pop * 1.5),
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
        }}
      >
        {current.words.map((w, i) => {
          const active = t >= w.start && t < (current.words[i + 1]?.start ?? current.end);
          return (
            <span
              key={i}
              style={{
                fontFamily: SANS, fontWeight: 800, fontSize: 66, lineHeight: 1.15,
                color: active ? '#1a78d6' : '#13233b',
                transform: active ? 'translateY(-3px)' : undefined,
                display: 'inline-block',
              }}
            >
              {w.text.replace(/[.,!?:;]$/, '')}
            </span>
          );
        })}
      </div>
    </div>
  );
};
