/* After Effects-style building blocks: kinetic type, shape-layer bursts,
 * confetti, speed streaks, shake, and a timing helper tied to the narration. */
import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, GRADIENT, MONO, SANS, SERIF } from './brand';
import { INK } from './stage';
import { Word } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Spec = Record<string, any>;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

export const pop = (t: number, at: number, damping = 13, mass = 0.65) =>
  spring({ frame: Math.round((t - at) * 30), fps: 30, config: { damping, mass } });

export const lerp = (t: number, a: number, b: number, from = 0, to = 1, easing?: (x: number) => number) =>
  interpolate(t, [a, b], [from, to], { ...clamp, easing });

const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Seconds into the shot when `key` is spoken ("word" or "word#2" for the 2nd time). */
export const when = (words: Word[], key: string | undefined, fallback: number): number => {
  if (!key) return fallback;
  const [k, nth] = key.split('#');
  const target = clean(k);
  const hits = words.filter((w) => clean(w.text).startsWith(target));
  const hit = hits[(Number(nth) || 1) - 1];
  return hit ? Math.max(0, hit.start - 0.1) : fallback;
};

/** Latest a triggered moment may start so its payoff is still on screen. */
export const capAt = (s: Spec, at: number, payoff: number) =>
  typeof s.dur === 'number' ? Math.min(at, Math.max(0.3, s.dur - payoff)) : at;

/** A decaying shake after an impact at `at`. */
export const shake = (t: number, at: number, amp = 14, len = 0.35) => {
  if (t < at || t > at + len) return 0;
  const k = 1 - (t - at) / len;
  return Math.sin((t - at) * 80) * amp * k;
};

/** Deterministic pseudo-random in [0, 1). */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** The 920 x 1100 content box between the badge and the captions. */
export const Canvas: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill>
    <div style={{ position: 'absolute', left: 80, top: 200, width: 920, height: 1100, fontFamily: SANS, color: C.text, ...style }}>{children}</div>
  </AbsoluteFill>
);

/** Shape-layer burst: an expanding ring and rays, like an AE impact. */
export const Burst: React.FC<{ t: number; at: number; x: number; y: number; color?: string; size?: number; rays?: number }> = ({ t, at, x, y, color = C.accent, size = 340, rays = 10 }) => {
  const p = lerp(t, at, at + 0.6, 0, 1, Easing.out(Easing.cubic));
  if (t < at || p >= 1) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: (-size / 2) * p, top: (-size / 2) * p, width: size * p, height: size * p, borderRadius: '50%', border: `${Math.max(1, 12 * (1 - p))}px solid ${color}`, opacity: 1 - p }} />
      {Array.from({ length: rays }).map((_, i) => {
        const a = (i / rays) * 360;
        const r = size * (0.22 + p * 0.38);
        return (
          <div key={i} style={{ position: 'absolute', left: 0, top: 0, width: size * 0.16 * (1 - p) + 4, height: 7, borderRadius: 4, background: i % 2 ? C.gold : color, transformOrigin: '0 50%', transform: `rotate(${a}deg) translateX(${r}px)`, opacity: 1 - p }} />
        );
      })}
    </div>
  );
};

/** Confetti from (x, y) at `at`, falling with gravity. */
export const Confetti: React.FC<{ t: number; at: number; x: number; y: number; count?: number }> = ({ t, at, x, y, count = 44 }) => {
  const dt = t - at;
  if (dt < 0 || dt > 2.4) return null;
  const colors = [C.blue, C.accent, C.gold, C.green, C.purple, C.amber];
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => {
        const a = rnd(i) * Math.PI * 2;
        const v = 500 + rnd(i + 50) * 900;
        const px = Math.cos(a) * v * dt * 0.8;
        const py = Math.sin(a) * v * dt * 0.8 - 400 * dt + 1400 * dt * dt;
        return (
          <div key={i} style={{ position: 'absolute', left: px, top: py, width: 14 + (i % 3) * 6, height: 8 + (i % 2) * 8, borderRadius: i % 4 ? 3 : 10, background: colors[i % colors.length], transform: `rotate(${dt * (300 + rnd(i + 9) * 600)}deg)`, opacity: Math.min(1, (2.4 - dt) * 2) }} />
        );
      })}
    </div>
  );
};

/** Horizontal speed streaks across the stage. */
export const Streaks: React.FC<{ t: number; opacity?: number }> = ({ t, opacity = 1 }) => (
  <AbsoluteFill style={{ overflow: 'hidden', opacity }}>
    {Array.from({ length: 16 }).map((_, i) => {
      const y = 180 + rnd(i) * 1150;
      const len = 160 + rnd(i + 3) * 360;
      const speed = 1600 + rnd(i + 7) * 1800;
      const x = 1200 - ((t * speed + rnd(i + 11) * 2000) % 2600);
      return <div key={i} style={{ position: 'absolute', left: x, top: y, width: len, height: 5 + (i % 3) * 3, borderRadius: 6, background: i % 3 ? 'rgba(26,120,214,0.22)' : 'rgba(192,138,43,0.24)' }} />;
    })}
  </AbsoluteFill>
);

/** A small mono kicker plus a big line that pops in at `at`. */
export const Heading: React.FC<{ t: number; at: number; kicker?: string; text?: string; serif?: boolean; size?: number; color?: string }> = ({ t, at, kicker, text, serif, size = 84, color }) => {
  const p = pop(t, at, 12);
  if (!kicker && !text) return null;
  return (
    <div style={{ textAlign: 'center', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 30}px)` }}>
      {kicker ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.26em', textTransform: 'uppercase', color: INK.muted, marginBottom: 12 }}>{kicker}</div> : null}
      {text ? <div style={{ fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 400 : 800, fontSize: size, lineHeight: 1.05, color: color ?? C.text }}>{text}</div> : null}
    </div>
  );
};

/** Gradient text style. */
export const gradText = (bg = GRADIENT): React.CSSProperties => ({ background: bg, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' });

// ------------------------------------------------------------------ kinetic type

type Tok = { text: string; emph: boolean; strike: boolean; serif: boolean; line: number; at: number };

/** "How many / *times* have you ~typed~ _this_?" -> tokens with styles, timed to the words. */
const tokenize = (text: string, words: Word[], stagger?: number): Tok[] => {
  const out: Tok[] = [];
  let emph = false;
  let strike = false;
  let serif = false;
  text.split(' / ').forEach((line, li) => {
    line.split(/\s+/).filter(Boolean).forEach((raw) => {
      let w = raw;
      while (w && '*~_'.includes(w[0])) {
        if (w[0] === '*') emph = true;
        if (w[0] === '~') strike = true;
        if (w[0] === '_') serif = true;
        w = w.slice(1);
      }
      const m = w.match(/^(.*?)([*~_]+)([.,!?:;'"…)]*)$/);
      const closers = m ? m[2] : '';
      if (m) w = m[1] + m[3];
      out.push({ text: w, emph, strike, serif, line: li, at: 0 });
      if (closers.includes('*')) emph = false;
      if (closers.includes('~')) strike = false;
      if (closers.includes('_')) serif = false;
    });
  });
  let j = 0;
  let prev = 0;
  out.forEach((tok, i) => {
    if (stagger !== undefined) {
      tok.at = 0.15 + i * stagger;
      return;
    }
    const c = clean(tok.text);
    let found = -1;
    for (let k = j; c && k < Math.min(words.length, j + 7); k++) {
      const wc = clean(words[k].text);
      if (wc === c || wc.startsWith(c) || c.startsWith(wc)) {
        found = k;
        break;
      }
    }
    if (found >= 0) {
      tok.at = Math.max(prev, words[found].start - 0.06);
      j = found + 1;
    } else {
      tok.at = i === 0 ? 0 : prev + 0.1;
    }
    prev = tok.at;
  });
  return out;
};

/**
 * Kinetic typography: every word lands as it is spoken (scale, blur, rise),
 * *emphasis* gets the brand gradient and a marker swipe, ~strike~ gets a red
 * line drawn through it, _serif_ switches to italic. Options: stamp, slam,
 * glitch, speed streaks.
 */
export const KineticScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const toks = tokenize(s.text, words, s.stagger);
  const lines = Array.from(new Set(toks.map((x) => x.line))).map((li) => toks.filter((x) => x.line === li));
  const longest = Math.max(...lines.map((l) => l.reduce((n, x) => n + x.text.length + 1, 0)));
  const size = Math.min(s.size ?? 160, Math.floor(900 / (0.5 * Math.max(4, longest))));
  const dur = typeof s.dur === 'number' ? s.dur : 4;
  const push = 1 + 0.06 * Math.min(1, t / Math.max(1, dur));
  const stampAt = s.stamp ? when(words, s.stampAt, 0.7) : 99;
  const stampP = pop(t, stampAt, 9, 0.7);
  const firstEmph = toks.find((x) => x.emph);
  const impact = s.slam ? toks.filter((x) => x.emph).map((x) => x.at + 0.12) : [];
  const shk = [stampAt + 0.12, ...impact].reduce((a, at) => a + shake(t, at, 16), 0);
  return (
    <AbsoluteFill>
      {s.speed ? <Streaks t={t} /> : null}
      <Canvas>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: size * 0.08, transform: `scale(${push}) rotate(${s.tilt ?? 0}deg) translateX(${shk}px)` }}>
          {s.kicker ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: '0.3em', color: INK.muted, textTransform: 'uppercase', marginBottom: 20, opacity: pop(t, 0) }}>{s.kicker}</div> : null}
          {lines.map((line, li) => (
            <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.26, lineHeight: 1.04 }}>
              {line.map((tok, i) => {
                const p = pop(t, tok.at, s.slam ? 9 : 12, 0.6);
                const fs = tok.serif ? size * 1.12 : size;
                const scale = s.slam && tok.emph ? 2.3 - 1.3 * p : 1.3 - 0.3 * p;
                const strikeP = tok.strike ? lerp(t, tok.at + 0.35, tok.at + 0.7, 0, 1, Easing.inOut(Easing.cubic)) : 0;
                const marker = tok.emph ? lerp(t, tok.at + 0.12, tok.at + 0.45, 0, 1, Easing.out(Easing.cubic)) : 0;
                const glitching = s.glitch && tok.emph && (t - tok.at < 0.5 || (t - tok.at) % 1.6 < 0.12);
                const dx = glitching ? ((frame % 3) - 1) * 7 : 0;
                return (
                  <span key={i} style={{ position: 'relative', display: 'inline-block', isolation: 'isolate', opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 50}px) scale(${scale})`, filter: `blur(${Math.max(0, (1 - p) * 9)}px)` }}>
                    {tok.emph ? <span style={{ position: 'absolute', left: -8, right: -8, bottom: '6%', height: '34%', borderRadius: 8, background: 'rgba(240,184,102,0.42)', transformOrigin: 'left', transform: `scaleX(${marker}) skewX(-8deg)`, zIndex: -1 }} /> : null}
                    <span style={{ fontFamily: tok.serif ? SERIF : SANS, fontStyle: tok.serif ? 'italic' : 'normal', fontWeight: tok.serif ? 400 : 800, fontSize: fs, letterSpacing: tok.serif ? 0 : '-0.02em', color: tok.strike ? interpolate(strikeP, [0, 1], [0, 1]) > 0.5 ? '#9aa6b6' : C.text : C.text, ...(tok.emph ? gradText() : {}), textShadow: glitching ? `${dx}px 0 rgba(214,64,60,0.75), ${-dx}px 0 rgba(58,159,240,0.75)` : undefined, padding: tok.emph ? '0 4px 8px' : undefined }}>
                      {tok.text}
                    </span>
                    {tok.strike ? <span style={{ position: 'absolute', left: -6, top: '52%', height: Math.max(8, size * 0.09), width: `calc(${strikeP * 100}% + 12px)`, background: C.red, borderRadius: 6, transform: 'rotate(-4deg)' }} /> : null}
                  </span>
                );
              })}
            </div>
          ))}
          {s.stamp ? (
            <div style={{ marginTop: 50, fontFamily: MONO, fontWeight: 700, fontSize: 84, letterSpacing: '0.18em', color: C.red, border: `9px solid ${C.red}`, borderRadius: 18, padding: '10px 34px', opacity: t < stampAt ? 0 : Math.min(1, stampP * 2), transform: `rotate(-9deg) scale(${2.4 - 1.4 * stampP})` }}>{s.stamp}</div>
          ) : null}
        </div>
        {firstEmph ? <Burst t={t} at={firstEmph.at + 0.1} x={460} y={550} size={760} color={C.blue} /> : null}
        {s.stamp ? <Burst t={t} at={stampAt + 0.12} x={460} y={760} size={520} color={C.red} /> : null}
      </Canvas>
    </AbsoluteFill>
  );
};
