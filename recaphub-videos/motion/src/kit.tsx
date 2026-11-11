/* Launch-film kit (1920 x 1080): the techniques of a SaaS launch film —
 * beat-locked scenes with paired transitions, type-on with a caret, words that
 * push the line open, a real macOS cursor that clicks, 3D-tilted UI cards,
 * counters, orbits, keycaps — shared by every brand's film. */
import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { MacOSCursor } from '@remotion/mac-cursors';

export const W = 1920;
export const H = 1080;
export const FPS = 30;
/** How long a scene's exit overlaps the next scene's entrance. */
export const OVER = 0.42;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.7, 0, 0.3, 1);
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

export const lerp = (t: number, a: number, b: number, from = 0, to = 1, easing: (x: number) => number = EXPO) =>
  interpolate(t, [a, b], [from, to], { ...clamp, easing });

/** A spring that starts at `at` seconds (0 before). */
export const spr = (t: number, at: number, damping = 15, mass = 0.7, stiffness = 140) =>
  t < at ? 0 : spring({ frame: (t - at) * FPS, fps: FPS, config: { damping, mass, stiffness } });

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ------------------------------------------------------------------ timeline

export type Exit = 'zoom' | 'push' | 'whip' | 'cut' | 'end';
/** A scene starts on a bar (fixed-BPM films) or on a beat of the track's beat map. */
export type SceneDef = { id: string; bar?: number; bars?: number; beat?: number; beats?: number; exit: Exit; cue?: 'flash' | 'leak' };
export type Timeline = {
  id: string;
  music: string;
  bpm: number;
  musicOffset: number;
  tail: number;
  scenes: SceneDef[];
  /** Beat map from beatmap.py: the real time (music seconds) of every beat. Without it, beats are 60/bpm apart. */
  grid?: number[];
  /** Strongest hits in the track: [music seconds, strength 0-1]. */
  accents?: number[][];
  /** Start transitions a little early so they land on the beat instead of after it. */
  lead?: boolean;
  /** How much the picture punches in on each strong hit (0 = off). */
  pulse?: number;
  /** Extra polish flashes on these beats (for hits inside a scene, like a drop). */
  flashBeats?: number[];
  /** Music fade-in in frames (default 6). Tracks composed to start on a hit use 1. */
  fadeIn?: number;
};

export const barSec = (tl: Timeline) => 240 / tl.bpm;
export const beatSec = (tl: Timeline) => 60 / tl.bpm;

/** Film time (seconds) of a beat, fractional beats included, following the beat map when there is one. */
export const beatTime = (tl: Timeline, b: number) => {
  const g = tl.grid;
  if (!g || g.length < 2) return b * beatSec(tl);
  const n = g.length;
  let x: number;
  if (b <= 0) x = g[0] + b * (g[1] - g[0]);
  else if (b >= n - 1) x = g[n - 1] + (b - (n - 1)) * (g[n - 1] - g[n - 2]);
  else {
    const i = Math.floor(b);
    x = g[i] + (b - i) * (g[i + 1] - g[i]);
  }
  return x - tl.musicOffset;
};
export const startBeat = (s: SceneDef) => s.beat ?? (s.bar ?? 0) * 4;
export const lenBeats = (s: SceneDef) => s.beats ?? (s.bars ?? 0) * 4;
const sceneOf = (tl: Timeline, id: string) => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`no scene ${id}`);
  return s;
};
export const sceneStart = (tl: Timeline, id: string) => beatTime(tl, startBeat(sceneOf(tl, id)));
/** The scene's own beat clock: seconds from the scene's start to its n-th beat. */
export const sceneBeats = (tl: Timeline, id: string) => {
  const s = sceneOf(tl, id);
  const t0 = beatTime(tl, startBeat(s));
  return (n: number) => beatTime(tl, startBeat(s) + n) - t0;
};
export const totalSec = (tl: Timeline) => {
  const last = tl.scenes[tl.scenes.length - 1];
  return beatTime(tl, startBeat(last) + lenBeats(last)) + tl.tail;
};
/** Accents in film time. */
export const accentsOf = (tl: Timeline) => (tl.accents ?? []).map(([t, v]) => ({ t: t - tl.musicOffset, v }));

/** How early each kind of transition starts so it lands on the cut beat (EXPO zooms land fast; INOUT pushes peak mid-way). */
export const LEAD: Record<Exit | 'none', number> = { zoom: 0.12, push: 0.21, whip: 0.21, cut: 0, end: 0, none: 0 };
const leadOf = (tl: Timeline, k: Exit | 'none') => (tl.lead ? LEAD[k] : 0);

/** Everything a scene needs: local time, its beat clock, its length, and the track's hits. */
export type Ctx = {
  t: number;
  B: (beats: number) => number;
  dur: number;
  /** Strong hits inside the scene, in local seconds. */
  hits: number[];
  /** 1 on a hit, falling to 0 over `decay` seconds: for things that bump on the music. */
  hit: (t: number, decay?: number) => number;
};

const transform = (kind: Exit | 'none', p: number, dir: 'in' | 'out'): React.CSSProperties => {
  // p: 1 = fully on screen
  if (kind === 'none' || kind === 'cut' || kind === 'end' || p >= 1) return {};
  const q = 1 - p;
  if (kind === 'zoom') {
    const s = dir === 'in' ? 0.84 + 0.16 * p : 1 + 0.32 * q;
    return { opacity: p, transform: `scale(${s})`, filter: `blur(${(dir === 'in' ? 16 : 20) * q}px)` };
  }
  const span = kind === 'whip' ? W * 1.05 : W;
  const x = dir === 'in' ? span * q : -span * q;
  const blur = kind === 'whip' ? Math.sin(Math.PI * q) * 38 : Math.sin(Math.PI * q) * 10;
  return { transform: `translateX(${x}px)`, filter: `blur(${blur}px)` };
};

/** One scene on the beat grid, with its entrance paired to the previous scene's exit. */
export const Scene: React.FC<{
  tl: Timeline;
  index: number;
  render: (c: Ctx) => React.ReactNode;
}> = ({ tl, index, render }) => {
  const def = tl.scenes[index];
  const prev = tl.scenes[index - 1];
  const enter: Exit | 'none' = prev ? prev.exit : 'none';
  const start = beatTime(tl, startBeat(def));
  const dur = beatTime(tl, startBeat(def) + lenBeats(def)) - start + (def.exit === 'end' ? tl.tail : 0);
  const leadIn = leadOf(tl, enter);
  const leadOut = leadOf(tl, def.exit);
  const over = def.exit === 'cut' || def.exit === 'end' ? 0 : OVER - leadOut;
  const from = Math.round((start - leadIn) * FPS);
  const to = Math.round((start + dur + over) * FPS);
  const B = sceneBeats(tl, def.id);
  const hits = accentsOf(tl)
    .filter((a) => a.t >= start - 0.05 && a.t < start + dur && a.v >= 0.4)
    .map((a) => ({ t: a.t - start, v: a.v }));
  return (
    <Sequence from={from} durationInFrames={to - from} name={def.id}>
      <SceneBody origin={from / FPS - start} dur={dur} enter={enter} exit={def.exit} leadIn={leadIn} leadOut={leadOut} B={B} hits={hits} pulse={tl.pulse ?? 0} render={render} />
    </Sequence>
  );
};

const SceneBody: React.FC<{
  origin: number;
  dur: number;
  enter: Exit | 'none';
  exit: Exit;
  leadIn: number;
  leadOut: number;
  B: (n: number) => number;
  hits: { t: number; v: number }[];
  pulse: number;
  render: (c: Ctx) => React.ReactNode;
}> = ({ origin, dur, enter, exit, leadIn, leadOut, B, hits, pulse, render }) => {
  // local time: 0 is the scene's beat; the entrance may start a little before it
  const t = useCurrentFrame() / FPS + origin;
  const ease = (k: Exit | 'none') => (k === 'zoom' ? EXPO : INOUT);
  const inEnd = -leadIn + OVER;
  const pin = enter === 'cut' || enter === 'none' ? 1 : lerp(t, -leadIn, inEnd, 0, 1, ease(enter));
  const pout = exit === 'cut' || exit === 'end' ? 1 : 1 - lerp(t, dur - leadOut, dur - leadOut + OVER, 0, 1, ease(exit));
  const style = t < inEnd ? transform(enter, pin, 'in') : transform(exit, pout, 'out');
  const hit = (x: number, decay = 0.28) => hits.reduce((m, h) => (x >= h.t && x < h.t + decay ? Math.max(m, (1 - (x - h.t) / decay) ** 2) : m), 0);
  const punch = pulse ? hits.reduce((m, h) => (t >= h.t && t < h.t + 0.3 ? Math.max(m, h.v * (1 - (t - h.t) / 0.3) ** 3) : m), 0) : 0;
  return (
    <AbsoluteFill style={{ ...style, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: punch ? `scale(${1 + pulse * punch})` : undefined }}>
        {render({ t, B, dur, hits: hits.map((h) => h.t), hit })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ type

export type Part = { text: string; style?: React.CSSProperties };

/** Text typed one character at a time from `at`, with a blinking caret. */
export const TypeOn: React.FC<{
  t: number;
  at: number;
  parts: Part[];
  cps?: number;
  caret?: string | false;
  caretOff?: number;
  style?: React.CSSProperties;
}> = ({ t, at, parts, cps = 18, caret = 'currentColor', caretOff = 99, style }) => {
  const total = parts.reduce((n, p) => n + p.text.length, 0);
  const shown = Math.max(0, Math.min(total, Math.floor((t - at) * cps)));
  const typing = t >= at && shown < total;
  const blinkOn = typing || Math.floor((t - at) * 2.2) % 2 === 0;
  let left = shown;
  return (
    <span style={{ whiteSpace: 'pre', ...style }}>
      {parts.map((p, i) => {
        const n = Math.max(0, Math.min(p.text.length, left));
        left -= n;
        return n ? (
          <span key={i} style={p.style}>
            {p.text.slice(0, n)}
          </span>
        ) : null;
      })}
      {caret && t >= at - 0.4 && t < caretOff ? (
        <span style={{ display: 'inline-block', width: '0.06em', height: '0.95em', marginLeft: '0.05em', verticalAlign: '-0.1em', background: caret, opacity: blinkOn ? 1 : 0 }} />
      ) : null}
    </span>
  );
};

export type Key = { type?: string; del?: boolean; at: number; cps: number };

/** A typing script with backspaces: what the field holds at time t. */
export const typed = (t: number, steps: Key[]) => {
  let s = '';
  for (const k of steps) {
    if (t < k.at) break;
    const n = Math.floor((t - k.at) * k.cps);
    if (k.del) s = s.slice(0, Math.max(0, s.length - n));
    else s += (k.type ?? '').slice(0, n);
  }
  return s;
};

export type PushWord = { text: string; at: number; style?: React.CSSProperties };

/** Words that arrive one by one and push the centred line open (reference: "Give your team superpowers"). */
export const WordPush: React.FC<{ t: number; words: PushWord[]; style?: React.CSSProperties; gap?: string; justify?: React.CSSProperties['justifyContent'] }> = ({
  t,
  words,
  style,
  gap = '0.26em',
  justify = 'center',
}) => (
  <div style={{ display: 'flex', justifyContent: justify, alignItems: 'baseline', whiteSpace: 'nowrap', ...style }}>
    {words.map((w, i) => {
      const open = lerp(t, w.at, w.at + 0.42, 0, 1, EXPO);
      const p = lerp(t, w.at + 0.05, w.at + 0.5, 0, 1, EXPO);
      return (
        <span key={i} style={{ display: 'inline-grid', gridTemplateColumns: `minmax(0, ${open}fr)` }}>
          <span style={{ minWidth: 0, overflow: 'visible', paddingRight: i < words.length - 1 ? gap : 0 }}>
            <span style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 0.35}em) scale(${0.92 + 0.08 * p})`, filter: `blur(${(1 - p) * 10}px)`, ...w.style }}>{w.text}</span>
          </span>
        </span>
      );
    })}
  </div>
);

/** One slot that rolls through words on the given times. */
export const WordSwap: React.FC<{ t: number; words: string[]; times: number[]; style?: React.CSSProperties }> = ({ t, words, times, style }) => {
  let i = 0;
  times.forEach((at, k) => {
    if (t >= at) i = k;
  });
  const p = lerp(t, times[i], times[i] + 0.35, 0, 1, EXPO);
  const prev = i > 0 ? words[i - 1] : null;
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      {prev && p < 1 ? <span style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - p, transform: `translateY(${-p * 0.6}em)`, filter: `blur(${p * 8}px)` }}>{prev}</span> : null}
      <span style={{ display: 'inline-block', opacity: i === 0 && t < times[0] ? 0 : p, transform: `translateY(${(1 - p) * 0.6}em)`, filter: `blur(${(1 - p) * 8}px)` }}>{words[i]}</span>
    </span>
  );
};

/** Blur-rise reveal for any block. */
export const Reveal: React.FC<{ t: number; at: number; children: React.ReactNode; y?: number; dur?: number; style?: React.CSSProperties; scale?: number }> = ({ t, at, children, y = 40, dur = 0.55, style, scale = 0.96 }) => {
  const p = lerp(t, at, at + dur, 0, 1, EXPO);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * y}px) scale(${scale + (1 - scale) * p})`, filter: `blur(${(1 - p) * 12}px)`, ...style }}>{children}</div>;
};

// ------------------------------------------------------------------ cursor

export type CursorPt = { t: number; x: number; y: number; click?: boolean };

const cursorAt = (t: number, path: CursorPt[]) => {
  if (t <= path[0].t) return path[0];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (t <= b.t) {
      const k = INOUT((t - a.t) / Math.max(0.001, b.t - a.t));
      // a slight arc, like a hand moving a mouse
      const arc = Math.sin(Math.PI * k) * Math.min(60, Math.hypot(b.x - a.x, b.y - a.y) * 0.08);
      return { t, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k - arc };
    }
  }
  return path[path.length - 1];
};

export const clicksOf = (path: CursorPt[]) => path.filter((p) => p.click).map((p) => p.t);

/** The macOS pointing hand from @remotion/mac-cursors, moving along a path and clicking with a ripple. */
export const Cursor: React.FC<{ t: number; path: CursorPt[]; scale?: number; ring?: string; show?: [number, number] }> = ({ t, path, scale = 2.1, ring = 'rgba(26,120,214,0.45)', show }) => {
  const from = show ? show[0] : path[0].t - 0.3;
  const to = show ? show[1] : 999;
  const vis = Math.min(lerp(t, from, from + 0.25), 1 - lerp(t, to - 0.25, to));
  if (vis <= 0) return null;
  const pos = cursorAt(t, path);
  const clicks = clicksOf(path);
  const squash = clicks.reduce((s, c) => (t >= c - 0.06 && t < c + 0.14 ? Math.min(s, 0.82 + 0.18 * Math.abs((t - c - 0.04) / 0.1)) : s), 1);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none' }}>
      {clicks.map((c, i) => {
        const p = lerp(t, c, c + 0.55, 0, 1, EXPO);
        if (t < c || p >= 1) return null;
        const pt = cursorAt(c, path);
        const r = 26 + 70 * p;
        return <div key={i} style={{ position: 'absolute', left: pt.x - r, top: pt.y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `${4 * (1 - p) + 1}px solid ${ring}`, background: ring.replace(/[\d.]+\)$/, `${0.18 * (1 - p)})`), opacity: 1 - p }} />;
      })}
      <div style={{ position: 'absolute', left: pos.x, top: pos.y, opacity: vis, transform: `scale(${scale * squash})`, transformOrigin: '0 0', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.25))' }}>
        <MacOSCursor cursor="pointer" />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ 3D, counters, shapes

/** A 3D stage: children tilt in perspective and float a little. */
export const Tilt: React.FC<{ t: number; rx: number; ry: number; rz?: number; z?: number; float?: number; children: React.ReactNode; style?: React.CSSProperties; perspective?: number }> = ({
  t,
  rx,
  ry,
  rz = 0,
  z = 0,
  float = 1,
  children,
  style,
  perspective = 2200,
}) => (
  <div style={{ perspective, perspectiveOrigin: '50% 40%', ...style }}>
    <div style={{ transformStyle: 'preserve-3d', transform: `translateZ(${z}px) rotateX(${rx + Math.sin(t * 0.9) * 1.2 * float}deg) rotateY(${ry + Math.cos(t * 0.7) * 1.6 * float}deg) rotateZ(${rz}deg) translateY(${Math.sin(t * 1.1) * 6 * float}px)` }}>{children}</div>
  </div>
);

export const count = (t: number, a: number, b: number, from: number, to: number) => Math.round(lerp(t, a, b, from, to, Easing.bezier(0.25, 0.1, 0.25, 1)));

/** A ring gauge whose arc fills to `value` (0-100). */
export const Ring: React.FC<{ value: number; size: number; stroke: number; color: string; track: string }> = ({ value, size, stroke, color, track }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
    </svg>
  );
};

/** A keyboard key that presses down at `at` and stays lit. */
export const Keycap: React.FC<{ t: number; at: number; label: string; font: string; width?: number; lit: string; ink: string }> = ({ t, at, label, font, width = 150, lit, ink }) => {
  const show = spr(t, at - 0.5, 13);
  const down = t >= at && t < at + 0.16 ? 1 : 0;
  const on = t >= at;
  return (
    <div style={{ opacity: Math.min(1, show * 1.4), transform: `translateY(${(1 - show) * 40 + down * 10}px) scale(${0.85 + 0.15 * show})` }}>
      <div style={{ width, height: 132, borderRadius: 26, background: on ? lit : '#ffffff', color: on ? '#ffffff' : ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 600, fontSize: 46, boxShadow: on ? `0 ${12 - down * 8}px 0 rgba(0,0,0,0.18), 0 30px 60px rgba(0,0,0,0.18)` : `0 ${12 - down * 8}px 0 #d9d2c3, 0 30px 60px rgba(19,35,59,0.14)`, border: '1px solid rgba(0,0,0,0.06)' }}>{label}</div>
    </div>
  );
};

/** Items riding an elliptical orbit around a centre. */
export const Orbit: React.FC<{ t: number; cx: number; cy: number; rx: number; ry: number; speed: number; phase?: number; items: React.ReactNode[]; appear?: number[] }> = ({ t, cx, cy, rx, ry, speed, phase = 0, items, appear }) => (
  <>
    {items.map((node, i) => {
      const a = phase + (i / items.length) * Math.PI * 2 + t * speed;
      const x = cx + Math.cos(a) * rx;
      const y = cy + Math.sin(a) * ry;
      const depth = (Math.sin(a) + 1) / 2;
      const p = appear ? spr(t, appear[i] ?? 0, 12) : 1;
      return (
        <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${(0.82 + depth * 0.22) * p})`, opacity: Math.min(1, p * 1.5), zIndex: Math.round(depth * 10) }}>
          {node}
        </div>
      );
    })}
  </>
);

/** A soft drifting colour blob (the reference's gradient light), brand colours only. */
export const Blob: React.FC<{ t: number; x: number; y: number; size: number; color: string; drift?: number; opacity?: number; seed?: number }> = ({ t, x, y, size, color, drift = 60, opacity = 1, seed = 0 }) => (
  <div style={{ position: 'absolute', left: x - size / 2 + Math.sin(t * 0.4 + seed) * drift, top: y - size / 2 + Math.cos(t * 0.33 + seed * 2) * drift, width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, transparent 66%)`, opacity }} />
);

// ------------------------------------------------------------------ sound

export type Sfx = { at: number; src: 'whoosh' | 'whip' | 'mouse-click' | 'switch' | 'ding' | 'page-turn' | 'snip' | 'pop' | 'key' | 'tick'; vol?: number };

/** Music under everything (beat-aligned, faded at both ends) plus one-shot effects. */
export const Soundtrack: React.FC<{ tl: Timeline; sfx: Sfx[] }> = ({ tl, sfx }) => {
  const { durationInFrames } = useVideoConfig();
  const end = durationInFrames;
  const fade = Math.max(1, tl.fadeIn ?? 6);
  return (
    <>
      <Audio
        src={staticFile(tl.music)}
        trimBefore={Math.round(tl.musicOffset * FPS)}
        volume={(f) => interpolate(f, [0, fade, end - 45, end - 2], [fade > 1 ? 0 : 0.72, 0.72, 0.72, 0], clamp)}
      />
      {sfx.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.at * FPS))} durationInFrames={60} name={`sfx ${s.src}`}>
          <Audio src={staticFile(`launch/sfx/${s.src}.wav`)} volume={s.vol ?? 0.5} />
        </Sequence>
      ))}
    </>
  );
};

/** Whooshes on every moving transition, from the timeline. */
export const transitionSfx = (tl: Timeline): Sfx[] =>
  tl.scenes.flatMap((s): Sfx[] => {
    const at = beatTime(tl, startBeat(s) + lenBeats(s)) - leadOf(tl, s.exit) - 0.12;
    if (s.exit === 'whip') return [{ at, src: 'whip', vol: 0.35 }];
    if (s.exit === 'zoom' || s.exit === 'push') return [{ at, src: 'whoosh', vol: 0.4 }];
    return [];
  });
