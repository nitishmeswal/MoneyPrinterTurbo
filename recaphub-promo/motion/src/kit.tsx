/* RecapHub promo kit, v3 (2026-11-19): the motion layer.
 *
 * What changed from v2, and why (the gaps against the Teamble reference):
 *  - Continuity: shots overlap and hand over with designed transitions (whip, dive, push, rise, the brand
 *    gradient wipe). Teamble has 11 hard cuts in 98 s; everything else is one moving camera.
 *  - Depth: Cam + Layer give real parallax (background layers move slower than the UI), and the camera
 *    always drifts a little, so no frame is ever still.
 *  - Every element animates on its own: Rise / Stagger / Pop / Count / Typed / Draw, each with its own curve.
 *  - Motion blur: shots flagged `mb` are rendered as several sub-frame samples averaged together (a film
 *    camera's shutter), only in the final render (`--props '{"mb":true}'`), so drafts stay fast.
 *  - Sound is part of the timeline: every shot lists its cues next to its visuals (pop, click, whoosh...).
 *  - The cursor is a solid extruded arrow that arcs, leans into its motion, squashes on a click and ripples. */
import React, { createContext, useContext, useId } from 'react';
import { AbsoluteFill, Audio, Easing, Freeze, Img, OffthreadVideo, Sequence, getInputProps, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// ------------------------------------------------------------------ curves
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1); // fast start, long soft landing: arrivals
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1); // camera moves
export const EIO = Easing.bezier(0.83, 0, 0.17, 1); // strong in-out: whips, dives, cursor travel
export const OUTQ = Easing.bezier(0.25, 1, 0.5, 1);
export const INQ = Easing.bezier(0.5, 0, 0.75, 0); // exits
export const BACK = Easing.bezier(0.34, 1.5, 0.64, 1); // a small overshoot: pops, boxes
export const LIN = (x: number) => x;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const lerp = (t: number, a: number, b: number, from = 0, to = 1, ease: (x: number) => number = EXPO) =>
  b <= a ? (t >= b ? to : from) : interpolate(t, [a, b], [from, to], { ...clamp, easing: ease });
/** A spring from 0 to ~1 starting at `at`. Presets: soft (arrivals), snap (UI), bouncy (pops). */
export const spr = (t: number, at: number, kind: 'soft' | 'snap' | 'bouncy' = 'soft') => {
  if (t < at) return 0;
  const config = kind === 'snap' ? { damping: 22, mass: 0.6, stiffness: 220 } : kind === 'bouncy' ? { damping: 11, mass: 0.6, stiffness: 190 } : { damping: 17, mass: 0.85, stiffness: 140 };
  return spring({ frame: (t - at) * FPS, fps: FPS, config });
};
export const src = (p: string) => staticFile(p);
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Keyframes on any number: keys(t, [[0, 0], [1.2, 300, EIO], [2, 280]]). The ease on a key shapes the move INTO it. */
export const keys = (t: number, ks: [number, number, ((x: number) => number)?][]) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) if (t <= ks[i + 1][0]) return interpolate(t, [ks[i][0], ks[i + 1][0]], [ks[i][1], ks[i + 1][1]], { ...clamp, easing: ks[i + 1][2] ?? INOUT });
  return ks[ks.length - 1][1];
};

// ------------------------------------------------------------------ film + shots on a beat grid
export type Sfx =
  | 'whoosh' | 'whoosh-soft' | 'whip' | 'swish' | 'pop' | 'pop-soft' | 'click' | 'tick' | 'key' | 'ding' | 'chime'
  | 'riser' | 'impact' | 'thud' | 'shimmer' | 'snap' | 'slide' | 'bubble' | 'page' | 'stamp';
export type Cue = [number, Sfx, number?];
export type ShotCtx = { t: number; B: (n: number) => number; dur: number };
export type ShotDef = {
  from: number;
  to: number;
  name: string;
  render: (c: ShotCtx) => React.ReactNode;
  /** sound cues in shot time (seconds; use B(n) for beats) */
  sfx?: (B: (n: number) => number) => Cue[];
  /** render with motion blur in the final pass (camera moves, whips, dives) */
  mb?: boolean;
};
export type FilmDef = { id: string; bpm: number; music: string; shots: ShotDef[]; tail?: number; musicVol?: number };

const INPUT = getInputProps() as { mb?: boolean; samples?: number };
export const MB_ON = !!INPUT.mb;
const SAMPLES = INPUT.samples ?? 6;

export const spbOf = (f: FilmDef) => 60 / f.bpm;
export const endBeat = (f: FilmDef) => Math.max(...f.shots.map((s) => s.to));
export const framesOf = (f: FilmDef) => Math.ceil((endBeat(f) * spbOf(f) + (f.tail ?? 0)) * FPS);

const ShotBody: React.FC<{ spb: number; dur: number; render: ShotDef['render'] }> = ({ spb, dur, render }) => {
  const t = useCurrentFrame() / FPS;
  return <>{render({ t, B: (n: number) => n * spb, dur })}</>;
};

/** Film-camera motion blur: `samples` sub-frame renders across a 180° shutter, averaged. */
export const Blur: React.FC<{ children: React.ReactNode; samples?: number; shutter?: number }> = ({ children, samples = SAMPLES, shutter = 180 }) => {
  const f = useCurrentFrame();
  const frac = shutter / 360;
  if (f < 1 || samples < 2) return <>{children}</>;
  return (
    <AbsoluteFill style={{ isolation: 'isolate' }}>
      {Array.from({ length: samples }, (_, i) => (
        <AbsoluteFill key={i} style={{ mixBlendMode: 'plus-lighter', filter: `opacity(${1 / samples})` }}>
          <Freeze frame={f - frac / 2 + (frac * (i + 0.5)) / samples}>{children}</Freeze>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

/** A film: shots placed on beats (they overlap for transitions; later shots draw on top), music and cues. */
export const Film: React.FC<{ film: FilmDef; bg?: string; font?: string }> = ({ film, bg = '#f6f3ee', font }) => {
  const spb = spbOf(film);
  const total = framesOf(film);
  const last = endBeat(film);
  const B = (n: number) => n * spb;
  return (
    <AbsoluteFill style={{ background: bg, fontFamily: font }}>
      {film.shots.map((s, i) => {
        const from = Math.round(s.from * spb * FPS);
        const to = s.to === last ? total : Math.round(s.to * spb * FPS);
        const body = <ShotBody spb={spb} dur={(to - from) / FPS} render={s.render} />;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)} name={s.name}>
            {s.mb && MB_ON ? <Blur>{body}</Blur> : body}
          </Sequence>
        );
      })}
      <Audio src={src(film.music)} volume={(f) => interpolate(f, [0, 2, total - 24, total - 1], [film.musicVol ?? 0.85, film.musicVol ?? 0.85, film.musicVol ?? 0.85, 0], clamp)} />
      {film.shots.flatMap((s, i) =>
        (s.sfx?.(B) ?? []).map(([at, name, vol], k) => (
          <Sequence key={`c${i}-${k}`} from={Math.max(0, Math.round((s.from * spb + at) * FPS))} durationInFrames={Math.round(2.5 * FPS)} name={`sfx ${name}`}>
            <Audio src={src(`sfx/${name}.wav`)} volume={vol ?? 0.4} />
          </Sequence>
        )),
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ camera with depth
export type CamKey = { t: number; x?: number; y?: number; s?: number; rx?: number; ry?: number; rz?: number; ease?: (x: number) => number };
type CamV = { x: number; y: number; s: number; rx: number; ry: number; rz: number };
const NEUTRAL: CamV = { x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0 };

/** A value a key leaves out holds what it was at the previous key (so a later focus() only moves from its own key on). */
export const camAt = (t: number, ks: CamKey[]): CamV => {
  const v = { ...NEUTRAL };
  const sorted = [...ks].sort((a, b) => a.t - b.t);
  (Object.keys(NEUTRAL) as (keyof CamV)[]).forEach((p) => {
    let cur = NEUTRAL[p];
    const pk = sorted.map((k) => {
      cur = (k[p] as number | undefined) ?? cur;
      return [k.t, cur, k.ease] as [number, number, ((x: number) => number)?];
    });
    v[p] = keys(t, pk);
  });
  return v;
};
/** Camera values that put screen point (px, py) at the centre, zoomed by s. */
export const focus = (px: number, py: number, s: number) => ({ x: -(px - W / 2) * s, y: -(py - H / 2) * s, s });

const CamCtx = createContext<CamV>(NEUTRAL);
/**
 * A camera. Children are drawn inside <Layer depth> planes: depth 1 moves with the camera, 0.2 is a far
 * background, 1.2 a foreground. `drift` adds a slow handheld float so the frame is never still.
 */
export const Cam: React.FC<{ t: number; keys?: CamKey[]; drift?: number; children: React.ReactNode; perspective?: number; creep?: number }> = ({ t, keys: ks = [{ t: 0 }], drift = 1, children, perspective = 2400, creep = 1 }) => {
  const c0 = camAt(t, ks);
  const c = { ...c0, s: c0.s * creep };
  // the float: slow and smooth (periods of 7–12 s), large enough that a held frame still reads as moving
  const d = { x: c.x + Math.sin(t * 0.8) * 16 * drift, y: c.y + Math.cos(t * 0.62) * 11 * drift, s: c.s * (1 + 0.012 * drift * Math.sin(t * 0.5)), rx: c.rx, ry: c.ry, rz: c.rz + 0.22 * drift * Math.sin(t * 0.55) };
  return (
    <CamCtx.Provider value={d}>
      <AbsoluteFill style={{ perspective, overflow: 'hidden' }}>{children}</AbsoluteFill>
    </CamCtx.Provider>
  );
};
export const Layer: React.FC<{ depth?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ depth = 1, children, style }) => {
  const c = useContext(CamCtx);
  const s = 1 + (c.s - 1) * depth;
  return (
    <AbsoluteFill style={{ transform: `translate(${c.x * depth}px, ${c.y * depth}px) scale(${s}) rotateX(${c.rx * depth}deg) rotateY(${c.ry * depth}deg) rotateZ(${c.rz * depth}deg)`, transformOrigin: '50% 50%', ...style }}>
      {children}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ shot transitions (designed hand-overs, not cuts)
export type TIn = 'cut' | 'fade' | 'rise' | 'whip-l' | 'whip-r' | 'whip-u' | 'zoom' | 'push' | 'wipe';
export type TOut = 'cut' | 'fade' | 'dive' | 'whip-l' | 'whip-r' | 'whip-u' | 'sink' | 'pull';

/** Directional blur for a whip: an SVG Gaussian with separate x / y deviation. */
export const DirBlur: React.FC<{ x: number; y?: number; children: React.ReactNode }> = ({ x, y = 0, children }) => {
  const id = useId().replace(/:/g, '');
  if (x < 0.3 && y < 0.3) return <>{children}</>;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={`db${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={`${x} ${y}`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#db${id})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * The shot's own entrance and exit. `tin` plays over the first `din` seconds, `tout` over the last `dout`.
 * Overlap consecutive shots by the same amount so the hand-over is continuous.
 */
export const Shot: React.FC<{ t: number; dur: number; tin?: TIn; tout?: TOut; din?: number; dout?: number; children: React.ReactNode; bg?: string; wipeImg?: string }> = ({ t, dur, tin = 'cut', tout = 'cut', din = 0.45, dout = 0.45, children, bg, wipeImg = 'brand/horizon.jpg' }) => {
  if (tin === 'wipe' && t < din) {
    // the brand gradient sweeps across as a diagonal band; the new shot is revealed behind it
    const p = EIO(Math.max(0, Math.min(1, t / din)));
    const e = mix(-500, W + 500, p);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ clipPath: `polygon(0 0, ${e + 260}px 0, ${e - 260}px ${H}px, 0 ${H}px)`, background: bg }}>{children}</AbsoluteFill>
        <AbsoluteFill style={{ clipPath: `polygon(${e + 260}px 0, ${e + 760}px 0, ${e + 240}px ${H}px, ${e - 260}px ${H}px)` }}>
          <Img src={src(wipeImg)} style={{ position: 'absolute', left: -300 - p * 400, top: -480, width: 2800, maxWidth: 'none' }} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  const a = tin === 'cut' ? 1 : lerp(t, 0, din, 0, 1, tin === 'fade' ? LIN : EIO);
  const b = tout === 'cut' ? 0 : lerp(t, dur - dout, dur, 0, 1, tout === 'fade' ? LIN : EIO);
  let tx = 0, ty = 0, sc = 1, op = 1, bx = 0, by = 0, bl = 0;
  // entrance
  if (tin === 'fade') op *= a;
  if (tin === 'rise') { ty += (1 - a) * 260; op *= Math.min(1, a * 2.5); bl += (1 - a) * 18; }
  if (tin === 'whip-l') { tx -= (1 - a) * W; bx += Math.sin(Math.PI * a) * 60 + (1 - a) * 30; }
  if (tin === 'whip-r') { tx += (1 - a) * W; bx += Math.sin(Math.PI * a) * 60 + (1 - a) * 30; }
  if (tin === 'whip-u') { ty += (1 - a) * H; by += Math.sin(Math.PI * a) * 50 + (1 - a) * 30; }
  if (tin === 'zoom') { sc *= mix(0.72, 1, a); op *= Math.min(1, a * 2); bl += (1 - a) * 26; }
  if (tin === 'push') { sc *= mix(1.35, 1, a); op *= Math.min(1, a * 2.2); bl += (1 - a) * 22; }
  // exit
  if (tout === 'fade') op *= 1 - b;
  if (tout === 'dive') { sc *= mix(1, 3.2, b); op *= 1 - lerp(b, 0.55, 1, 0, 1, LIN); bl += b * 30; }
  if (tout === 'pull') { sc *= mix(1, 0.7, b); op *= 1 - lerp(b, 0.4, 1, 0, 1, LIN); bl += b * 18; }
  if (tout === 'sink') { ty -= b * 200; op *= 1 - b; bl += b * 16; }
  if (tout === 'whip-l') { tx -= b * W; bx += Math.sin(Math.PI * b) * 60 + b * 30; }
  if (tout === 'whip-r') { tx += b * W; bx += Math.sin(Math.PI * b) * 60 + b * 30; }
  if (tout === 'whip-u') { ty -= b * H; by += Math.sin(Math.PI * b) * 50 + b * 30; }
  return (
    <AbsoluteFill style={{ opacity: op, transform: `translate(${tx}px, ${ty}px) scale(${sc})`, filter: bl > 0.3 ? `blur(${bl}px)` : undefined, background: bg }}>
      <DirBlur x={bx} y={by}>{children}</DirBlur>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ element motion
type RiseP = { t: number; at: number; children: React.ReactNode; y?: number; x?: number; s?: number; r?: number; blur?: number; dur?: number; ease?: (x: number) => number; out?: number; outDur?: number; origin?: string; style?: React.CSSProperties; spring?: 'soft' | 'snap' | 'bouncy' };
/** Any element's arrival (and optional exit): from an offset, scale, rotation and blur, to rest. */
export const Rise: React.FC<RiseP> = ({ t, at, children, y = 70, x = 0, s = 0.94, r = 0, blur = 14, dur = 0.7, ease = EXPO, out, outDur = 0.35, origin = '50% 50%', style, spring: sp }) => {
  if (t < at) return null;
  const p = sp ? spr(t, at, sp) : lerp(t, at, at + dur, 0, 1, ease);
  const q = out === undefined ? 0 : lerp(t, out, out + outDur, 0, 1, INQ);
  if (q >= 1) return null;
  const pc = Math.min(1, p);
  return (
    <div style={{ opacity: Math.min(1, pc * 1.8) * (1 - q), transform: `translate(${(1 - p) * x}px, ${(1 - p) * y - q * 40}px) scale(${mix(s, 1, p) - q * 0.04}) rotate(${(1 - p) * r}deg)`, transformOrigin: origin, filter: pc < 0.99 || q ? `blur(${(1 - pc) * blur + q * 12}px)` : undefined, ...style }}>
      {children}
    </div>
  );
};
/** Children arrive one after another, `step` seconds apart. */
export const Stagger: React.FC<Omit<RiseP, 'children'> & { step?: number; children: React.ReactNode; gap?: number; dir?: 'row' | 'column'; wrapStyle?: React.CSSProperties }> = ({ children, step = 0.09, at, gap = 0, dir = 'column', wrapStyle, ...p }) => (
  <div style={{ display: 'flex', flexDirection: dir, gap, ...wrapStyle }}>
    {React.Children.toArray(children).map((c, i) => (
      <Rise key={i} {...p} at={at + i * step}>
        {c}
      </Rise>
    ))}
  </div>
);
/** A pop with a little overshoot. */
export const Pop: React.FC<{ t: number; at: number; children: React.ReactNode; out?: number; from?: number; style?: React.CSSProperties; origin?: string }> = ({ t, at, children, out, from = 0.4, style, origin = '50% 50%' }) => {
  if (t < at) return null;
  const p = spr(t, at, 'bouncy');
  const q = out === undefined ? 0 : lerp(t, out, out + 0.25, 0, 1, INQ);
  if (q >= 1) return null;
  return <div style={{ opacity: Math.min(1, p * 2) * (1 - q), transform: `scale(${mix(from, 1, p) - q * 0.1})`, transformOrigin: origin, filter: p < 0.9 || q ? `blur(${Math.max(0, 1 - p) * 8 + q * 10}px)` : undefined, ...style }}>{children}</div>;
};
/** A number that counts from `from` to `to`. */
export const Count: React.FC<{ t: number; at: number; dur?: number; from?: number; to: number; fmt?: (n: number) => string; style?: React.CSSProperties }> = ({ t, at, dur = 1.2, from = 0, to, fmt = (n) => String(Math.round(n)), style }) => (
  <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>{fmt(lerp(t, at, at + dur, from, to, OUTQ))}</span>
);
/** Typed text with a caret. */
export const Typed: React.FC<{ t: number; at: number; text: string; cps?: number; caret?: boolean; style?: React.CSSProperties }> = ({ t, at, text, cps = 28, caret = true, style }) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((t - at) * cps)));
  const done = n >= text.length;
  return (
    <span style={{ whiteSpace: 'pre-wrap', ...style }}>
      {text.slice(0, n)}
      {caret && t >= at && (!done || Math.floor(t * 2.2) % 2 === 0) ? <span style={{ display: 'inline-block', width: '0.07em', height: '1em', background: 'currentColor', marginLeft: '0.04em', verticalAlign: '-0.12em' }} /> : null}
    </span>
  );
};
/** Words that stream in (an AI answer). */
export const Stream: React.FC<{ t: number; at: number; text: string; wps?: number; style?: React.CSSProperties }> = ({ t, at, text, wps = 14, style }) => {
  const words = text.split(' ');
  const n = Math.max(0, (t - at) * wps);
  return (
    <span style={style}>
      {words.map((w, i) => (i < n ? <span key={i} style={{ opacity: Math.min(1, n - i), filter: n - i < 1 ? `blur(${(1 - (n - i)) * 4}px)` : undefined }}>{w} </span> : null))}
    </span>
  );
};
/** An SVG path that draws itself (p 0 → 1). */
export const Draw: React.FC<{ d: string; p: number; stroke: string; width?: number; style?: React.CSSProperties; cap?: 'round' | 'butt' }> = ({ d, p, stroke, width = 4, style, cap = 'round' }) => (
  <path d={d} pathLength={1} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap={cap} strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - Math.max(0, Math.min(1, p))} style={style} />
);

// ------------------------------------------------------------------ the cursor
export type CurKey = { t: number; x: number; y: number; click?: boolean; arc?: number };
/**
 * A solid extruded arrow cursor. It travels between keys on an arc with a strong in-out curve, leans into
 * its motion, squashes on a click and leaves a ripple. Clicks need a 'click' cue in the shot's sfx.
 */
export const Cursor: React.FC<{ t: number; path: CurKey[]; size?: number; color?: string; edge?: string; appear?: number; leave?: number }> = ({ t, path, size = 74, color = '#ffffff', edge = '#1e6f8c', appear, leave }) => {
  const at = (tt: number) => {
    if (tt <= path[0].t) return { x: path[0].x, y: path[0].y };
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      if (tt <= b.t) {
        const p = EIO((tt - a.t) / (b.t - a.t));
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const arc = (b.arc ?? 0.12) * len * Math.sin(Math.PI * p);
        return { x: a.x + dx * p - (dy / len) * arc, y: a.y + dy * p + (dx / len) * arc };
      }
    }
    const l = path[path.length - 1];
    return { x: l.x, y: l.y };
  };
  const show = appear ?? path[0].t - 0.3;
  if (t < show) return null;
  const o = lerp(t, show, show + 0.25) * (leave === undefined ? 1 : 1 - lerp(t, leave, leave + 0.25));
  const p = at(t);
  const v = at(t - 1 / FPS);
  const vx = (p.x - v.x) * FPS;
  const lean = Math.max(-16, Math.min(16, vx * 0.012));
  const clicks = path.filter((k) => k.click);
  const press = clicks.reduce((m, k) => (t >= k.t && t < k.t + 0.5 ? Math.max(m, 1 - (t - k.t) / 0.5) : m), 0);
  const sq = 1 - 0.2 * Math.sin(Math.min(1, press * 1.0) * Math.PI) * (press > 0.6 ? 1 : press / 0.6);
  const sh = 'M0 0 L0 31 L8.6 23.2 L14.2 35.6 L19.6 33.2 L14 21 L25 21 Z';
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none', opacity: o }}>
      {clicks.map((k, i) => {
        const r = lerp(t, k.t, k.t + 0.55, 0, 1, OUTQ);
        return t >= k.t && t < k.t + 0.6 ? <div key={i} style={{ position: 'absolute', left: k.x - 70 * r, top: k.y - 70 * r, width: 140 * r, height: 140 * r, borderRadius: '50%', border: `${5 * (1 - r) + 1}px solid ${edge}`, opacity: 1 - r }} /> : null;
      })}
      <div style={{ position: 'absolute', left: p.x, top: p.y, transform: `rotate(${-8 + lean}deg) scale(${sq})`, transformOrigin: '2px 2px', filter: 'drop-shadow(0 18px 18px rgba(20,45,60,0.30)) drop-shadow(0 4px 5px rgba(20,45,60,0.2))' }}>
        <svg width={size} height={size * 1.45} viewBox="-2 -2 32 44" style={{ overflow: 'visible' }}>
          {[6, 5, 4, 3, 2, 1].map((i) => (
            <path key={i} d={sh} transform={`translate(${i * 0.55} ${i * 0.75})`} fill={edge} stroke={edge} strokeWidth={1.6} strokeLinejoin="round" />
          ))}
          <path d={sh} fill={color} stroke="#1a1a1a" strokeWidth={1.7} strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ real media
export const Media: React.FC<{ file: string; w: number; h: number; fit?: 'cover' | 'contain' | 'fill'; pos?: string; from?: number; rate?: number; style?: React.CSSProperties }> = ({ file, w, h, fit = 'cover', pos = '50% 50%', from = 0, rate = 1, style }) => {
  const st: React.CSSProperties = { width: w, height: h, objectFit: fit, objectPosition: pos, display: 'block', ...style };
  return /\.(mp4|webm|mov)$/i.test(file) ? <OffthreadVideo src={src(file)} muted trimBefore={Math.round(from * FPS)} playbackRate={rate} style={st} /> : <Img src={src(file)} style={st} />;
};

export type Rect = [number, number, number, number];
const mixRect = (a: Rect, b: Rect, p: number): Rect => a.map((v, i) => v + (b[i] - v) * p) as Rect;

/** A rectangle `rect` of a source (sw x sh) shown in screen box `box`; pass toRect / toBox + p to animate (crop → uncrop). */
export const Region: React.FC<{ file: string; sw: number; sh: number; rect: Rect; box: Rect; toRect?: Rect; toBox?: Rect; p?: number; from?: number; rate?: number; radius?: number; shadow?: string; filter?: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({ file, sw, sh, rect, box, toRect, toBox, p = 0, from, rate, radius = 0, shadow, filter, style, children }) => {
  const r = toRect ? mixRect(rect, toRect, p) : rect;
  const b = toBox ? mixRect(box, toBox, p) : box;
  const kx = b[2] / r[2];
  const ky = b[3] / r[3];
  return (
    <div style={{ position: 'absolute', left: b[0], top: b[1], width: b[2], height: b[3], overflow: 'hidden', borderRadius: radius, boxShadow: shadow, ...style }}>
      <div style={{ position: 'absolute', left: -r[0] * kx, top: -r[1] * ky, width: sw * kx, height: sh * ky, filter }}>
        <Media file={file} w={sw * kx} h={sh * ky} fit="fill" from={from} rate={rate} />
      </div>
      {children}
    </div>
  );
};

export const SHADOW = '0 3px 9px rgba(30,60,80,0.07), 0 36px 80px -24px rgba(30,60,80,0.38)';
export const SHADOW_DEEP = '0 6px 14px rgba(20,45,60,0.18), 0 50px 110px -20px rgba(20,45,60,0.5)';

/** Depth of field on a real capture: the page goes soft while `el` lifts off it, sharp. */
export const Lift: React.FC<{ file: string; sw: number; sh: number; box: Rect; el: Rect; p: number; scale?: number; dx?: number; dy?: number; blur?: number; dim?: number; radius?: number; baseRadius?: number }> = ({ file, sw, sh, box, el, p, scale = 1.25, dx = 0, dy = 0, blur = 7, dim = 0.1, radius = 16, baseRadius = 18 }) => {
  const k = box[2] / sw;
  const eb: Rect = [box[0] + el[0] * k, box[1] + el[1] * k, el[2] * k, el[3] * k];
  const cx = eb[0] + eb[2] / 2;
  const cy = eb[1] + eb[3] / 2;
  const s = 1 + (scale - 1) * p;
  return (
    <>
      <Region file={file} sw={sw} sh={sh} rect={[0, 0, sw, sh]} box={box} radius={baseRadius} filter={`blur(${blur * p}px) brightness(${1 - dim * p})`} shadow={SHADOW} />
      <div style={{ position: 'absolute', left: cx - (eb[2] * s) / 2 + dx * p, top: cy - (eb[3] * s) / 2 + dy * p, width: eb[2] * s, height: eb[3] * s }}>
        <Region file={file} sw={sw} sh={sh} rect={el} box={[0, 0, eb[2] * s, eb[3] * s]} radius={radius} shadow={p > 0.02 ? `0 ${8 * p}px ${16 * p}px rgba(30,60,80,${0.08 * p}), 0 ${50 * p}px ${110 * p}px -20px rgba(30,60,80,${0.4 * p})` : undefined} />
      </div>
    </>
  );
};

/** A real RecapHub vertical clip as a card. */
export const Reel: React.FC<{ file: string; w: number; from?: number; rate?: number; radius?: number; style?: React.CSSProperties }> = ({ file, w, from = 0, rate = 1, radius = 24, style }) => (
  <div style={{ width: w, height: (w * 16) / 9, borderRadius: radius, overflow: 'hidden', boxShadow: SHADOW_DEEP, background: '#000', ...style }}>
    <Media file={file} w={w} h={(w * 16) / 9} from={from} rate={rate} />
  </div>
);

/** A plain phone body around any content (w x 16:9 portrait). */
export const Phone: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, children, style }) => {
  const h = (w * 19.5) / 9;
  const b = w * 0.035;
  return (
    <div style={{ width: w + b * 2, height: h + b * 2, borderRadius: w * 0.16, background: '#141414', padding: b, boxShadow: SHADOW_DEEP, ...style }}>
      <div style={{ width: w, height: h, borderRadius: w * 0.13, overflow: 'hidden', position: 'relative', background: '#fff' }}>{children}</div>
    </div>
  );
};

/** A clean browser window (light) with a URL. */
export const Browser: React.FC<{ w: number; h: number; url: string; children: React.ReactNode; style?: React.CSSProperties; font?: string }> = ({ w, h, url, children, style, font }) => (
  <div style={{ width: w, height: h, borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: SHADOW, position: 'relative', ...style }}>
    <div style={{ height: 52, background: '#f3f1ec', display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: '1px solid #e2dcd2' }}>
      {['#e2dcd2', '#e2dcd2', '#e2dcd2'].map((c, i) => <span key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: c }} />)}
      <div style={{ marginLeft: 22, flex: 1, maxWidth: 620, height: 32, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 14px', fontFamily: font, fontSize: 17, color: '#4d4d4d' }}>{url}</div>
    </div>
    <div style={{ position: 'absolute', left: 0, top: 52, width: w, height: h - 52, overflow: 'hidden' }}>{children}</div>
  </div>
);

export const Flash: React.FC<{ t: number; at: number; color?: string; dur?: number }> = ({ t, at, color = '#fff', dur = 0.32 }) => {
  const o = t < at ? 0 : Math.max(0, 1 - (t - at) / dur) ** 2;
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o }} /> : null;
};
