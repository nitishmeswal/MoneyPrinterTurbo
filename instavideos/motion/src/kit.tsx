/* Shared pieces for every short: data loading, the account frame (background,
 * title, handle), choice chips, the payoff (flash + caption) and the loop fade.
 * Safe zones (1080 x 1920): title in the top 20%, nothing important in the
 * bottom 25% (caption, buttons) or the right 15% (like / share icons). */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, Easing, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { LOOKS, Look } from './accounts';

export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const SAFE = { top: 384, bottom: 1440, right: 918 };

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.7, 0, 0.3, 1);
export const lerp = (t: number, a: number, b: number, from = 0, to = 1, easing: (x: number) => number = EXPO) => interpolate(t, [a, b], [from, to], { ...clamp, easing });
export const spr = (f: number, at: number, damping = 13, mass = 0.6) => (f < at ? 0 : spring({ frame: f - at, fps: FPS, config: { damping, mass, stiffness: 160 } }));
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ------------------------------------------------------------------ data

const cache = new Map<string, unknown>();
/** Loads public/data/<id>.json once per render tab (never step a sim in the component). */
export function useData<T>(id: string): T | null {
  const [data, setData] = useState<T | null>((cache.get(id) as T) ?? null);
  const [handle] = useState(() => (cache.has(id) ? null : delayRender(`data ${id}`)));
  useEffect(() => {
    if (cache.has(id)) return;
    fetch(staticFile(`data/${id}.json`))
      .then((r) => r.json())
      .then((j) => {
        cache.set(id, j);
        setData(j as T);
        if (handle !== null) continueRender(handle);
      });
  }, [id, handle]);
  return data;
}

export type Spec = {
  id: string;
  account: string;
  title: string;
  subtitle?: string;
  day?: number;
  choice?: { label: string; options?: { text: string; color?: string }[] };
  payoff?: Record<string, string>;
  hud?: string;
  [k: string]: unknown;
};

export const lookOf = (spec: Spec): Look => LOOKS[spec.account] ?? LOOKS['ball-arena'];

// ------------------------------------------------------------------ frame

export const Backdrop: React.FC<{ look: Look; f: number; pulse?: number }> = ({ look, f, pulse = 0 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 120% 70% at 45% 48%, ${look.bg2} 0%, ${look.bg} 70%)` }}>
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${45 + Math.sin(f / 240) * 6}% ${46 + Math.cos(f / 300) * 4}%, ${look.glow} 0%, transparent ${48 + pulse * 10}%)` }} />
  </AbsoluteFill>
);

/** Title question, top of frame from frame 0. Two lines max, at least 64 px. */
export const Title: React.FC<{ look: Look; text: string; sub?: string; f: number; size?: number; y?: number; day?: number }> = ({ look, text, sub, f, size, y = 150, day }) => {
  const s = size ?? look.title.size;
  const bob = Math.sin(f / 26) * 3;
  return (
    <div style={{ position: 'absolute', left: 60, width: SAFE.right - 60 + 40, top: y + bob, textAlign: 'center' }}>
      {day ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: -66, display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '6px 22px', borderRadius: 14, background: look.accent, color: '#111', fontFamily: look.body, fontWeight: 800, fontSize: 32, letterSpacing: '0.14em', boxShadow: `0 4px 22px ${look.accent}55` }}>DAY {day}</div>
        </div>
      ) : null}
      <div style={{ fontFamily: look.title.font, fontWeight: look.title.weight, fontSize: s, lineHeight: 1.02, letterSpacing: look.title.tracking, color: look.ink, textTransform: look.title.upper ? 'uppercase' : 'none', fontStyle: look.title.italic ? 'italic' : 'normal', textShadow: '0 6px 30px rgba(0,0,0,0.45)' }}>{text}</div>
      {sub ? <div style={{ fontFamily: look.body, fontWeight: 600, fontSize: 38, color: look.sub, marginTop: 14, letterSpacing: '0.01em' }}>{sub}</div> : null}
    </div>
  );
};

/** The "pick one" moment: chips pop in from 1.5 s and stay small afterwards. */
export const Chooser: React.FC<{ look: Look; f: number; label: string; options: { text: string; color?: string; node?: React.ReactNode }[]; y?: number; at?: number; until?: number; picked?: number; keep?: boolean }> = ({ look, f, label, options, y = 1300, at = 90, until = 240, picked = -1, keep = false }) => {
  const p = spr(f, at, 14);
  if (p <= 0) return null;
  const big = 1 - lerp(f, until, until + 30, 0, 1, INOUT);
  const gone = keep ? 0 : lerp(f, until, until + 18, 0, 1, INOUT);
  if (gone >= 1) return null;
  return (
    <div style={{ position: 'absolute', left: 40, width: SAFE.right - 40, top: y - big * 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * big + 6, opacity: Math.min(1, p * 1.4) * (0.75 + 0.25 * big) * (1 - gone), transform: `scale(${0.8 + 0.2 * p})` }}>
      {big > 0.05 ? <div style={{ fontFamily: look.body, fontWeight: 800, fontSize: 44 * big + 0.01, color: look.ink, letterSpacing: '0.02em', textTransform: 'uppercase', opacity: big }}>{label}</div> : null}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        {options.map((o, i) => {
          const q = spr(f, at + 6 + i * 5, 12);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: `${10 + 6 * big}px ${18 + 8 * big}px`, borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: `2px solid ${i === picked ? look.accent : 'rgba(255,255,255,0.16)'}`, fontFamily: look.body, fontWeight: 700, fontSize: 28 + 8 * big, color: look.ink, transform: `scale(${q})` }}>
              {o.node ?? (o.color ? <div style={{ width: 26 + 8 * big, height: 26 + 8 * big, borderRadius: 99, background: o.color, boxShadow: `0 0 18px ${o.color}` }} /> : null)}
              {o.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** White flash + big caption on the result frame; the caption stays until the loop fade. */
export const Payoff: React.FC<{ look: Look; f: number; at: number; text: string; sub?: string; color?: string; y?: number }> = ({ look, f, at, text, sub, color, y = 760 }) => {
  if (f < at) return null;
  const flash = 1 - lerp(f, at, at + 18, 0, 1, Easing.out(Easing.quad));
  const pop = spr(f, at + 2, 9, 0.7);
  const subIn = lerp(f, at + 24, at + 40);
  return (
    <>
      <AbsoluteFill style={{ background: 'white', opacity: flash * 0.55, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', left: 40, width: SAFE.right - 40, top: y, textAlign: 'center', transform: `scale(${0.6 + 0.4 * pop}) rotate(${(1 - pop) * -6}deg)`, opacity: Math.min(1, pop * 1.5) }}>
        <div style={{ display: 'inline-block', padding: '18px 40px', borderRadius: 28, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', border: `3px solid ${color ?? look.accent}`, boxShadow: `0 0 60px ${color ?? look.accent}55` }}>
          <div style={{ fontFamily: look.title.font, fontWeight: look.title.weight, fontSize: text.length > 16 ? 74 : text.length > 12 ? 90 : 112, lineHeight: 1, letterSpacing: look.title.tracking, color: color ?? look.accent, textTransform: look.title.upper ? 'uppercase' : 'none' }}>{text}</div>
        </div>
        {sub ? <div style={{ fontFamily: look.body, fontWeight: 700, fontSize: 42, color: look.ink, marginTop: 22, opacity: subIn }}>{sub}</div> : null}
      </div>
    </>
  );
};

/** Wraps a scene: plays the sound track and crossfades the last 0.35 s into frame 0 so the video loops. */
export const Short: React.FC<{ id: string; render: (f: number) => React.ReactNode }> = ({ id, render }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fade = 21;
  const loopAt = durationInFrames - fade;
  return (
    <AbsoluteFill>
      {render(f)}
      {f >= loopAt ? <AbsoluteFill style={{ opacity: (f - loopAt) / fade }}>{render(0)}</AbsoluteFill> : null}
      <Audio src={staticFile(`audio/${id}.wav`)} />
    </AbsoluteFill>
  );
};

export const Handle: React.FC<{ look: Look }> = ({ look }) => (
  <div style={{ position: 'absolute', left: 60, top: 1395, fontFamily: look.body, fontWeight: 700, fontSize: 30, color: look.sub, letterSpacing: '0.04em' }}>{look.handle}</div>
);

export const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.max(0, Math.floor(sec % 60))).padStart(2, '0')}`;
