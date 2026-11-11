/* RecapHub brand pieces shared by the teaser, the Stage → Shorts promo and the
 * MCP story film (recaphub_3.0 DESIGN.md / PRODUCT.md): warm stone, ink,
 * brand blue #4361EE for action and focus only, Geist + Crimson Pro italic.
 * No violet gradients, no glow, no gradient text.
 *
 * Screen recordings: every product shot sits in a <Rec id> slot. Until a
 * recording is listed in recordings.json the slot shows a motion-graphic
 * mock of the real screen; once it is listed, the recording plays instead. */
import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { loadFont as loadGeist } from '@remotion/google-fonts/Geist';
import { loadFont as loadGeistMono } from '@remotion/google-fonts/GeistMono';
import { loadFont as loadCrimson } from '@remotion/google-fonts/CrimsonPro';
import recs from './recordings.json';
import { FPS, W, lerp, spr } from './kit';

export const SANS = loadGeist('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] }).fontFamily;
export const MONO = loadGeistMono('normal', { weights: ['400', '500', '600'], subsets: ['latin'] }).fontFamily;
export const SERIF = loadCrimson('italic', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily;

export const R = {
  page: '#FAFAF9',
  card: '#FFFFFF',
  subtle: '#F5F4F2',
  muted: '#E8E6E3',
  border: '#E8E6E3',
  ink: '#1A1714',
  ink2: '#57534E',
  ink3: '#A8A49D',
  brand: '#4361EE',
  brand50: '#F0F4FF',
  brand100: '#E0E9FF',
  brand600: '#3347CC',
  success: '#22C55E',
  warning: '#F59E0B',
  warning50: '#FFFBEB',
  warning700: '#B45309',
  danger: '#F43F5E',
  mark: '#573DFF',
  sand: '#EFE6DA',
  paper: '#F6F1E9',
};
export const SHADOW = '0 1px 2px rgba(26,23,20,0.05), 0 24px 60px rgba(26,23,20,0.10)';
export const RING = 'rgba(67,97,238,0.45)';

export const head = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.035em', color: R.ink, lineHeight: 1.06, ...extra });
export const serif = (extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.01em', ...extra });
export const label = (extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: MONO, fontWeight: 500, fontSize: 20, letterSpacing: '0.12em', color: R.ink3, textTransform: 'uppercase', ...extra });
export const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({ background: R.card, border: `1px solid ${R.border}`, borderRadius: 20, boxShadow: SHADOW, ...extra });
export const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left: x, top: y, ...extra });
export const centerRow = (y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center', ...extra });
export const pill = (extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: 22, color: R.brand600, background: R.brand50, border: `1px solid ${R.brand100}`, borderRadius: 99, padding: '8px 18px', whiteSpace: 'nowrap', ...extra });

export const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1  0 0 0 0 0.09  0 0 0 0 0.08  0 0 0 0.45 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

/** Warm stone page with paper grain and a slow, low-contrast light. */
export const Stone: React.FC<{ tone?: 'stone' | 'paper' }> = ({ tone = 'stone' }) => {
  const t = useCurrentFrame() / FPS;
  const top = tone === 'paper' ? '#FBF8F3' : '#FCFCFB';
  const mid = tone === 'paper' ? R.paper : R.page;
  const low = tone === 'paper' ? '#EDE5D8' : '#F1EFEB';
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${top} 0%, ${mid} 50%, ${low} 100%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 1100 + Math.sin(t * 0.3) * 120, top: -500, width: 1400, height: 1400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 62%)' }} />
      <div style={{ position: 'absolute', left: -500, top: 500 + Math.cos(t * 0.25) * 80, width: 1300, height: 1300, borderRadius: '50%', background: `radial-gradient(circle, ${tone === 'paper' ? 'rgba(232,218,198,0.9)' : 'rgba(239,230,218,0.9)'} 0%, transparent 62%)` }} />
      <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: tone === 'paper' ? 0.36 : 0.28, mixBlendMode: 'multiply' }} />
    </AbsoluteFill>
  );
};

/** Warm ink stage for the dark beats. */
export const Ink: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: R.ink, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 960 - 900 + Math.sin(t * 0.4) * 80, top: 300, width: 1800, height: 1400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(87,83,78,0.55) 0%, transparent 60%)' }} />
    <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: 0.5, mixBlendMode: 'screen' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.45) 100%)' }} />
  </AbsoluteFill>
);

// ------------------------------------------------------------------ people and the mark

export const SPEAKERS = [
  { i: 'PR', name: 'Priya Raman', role: 'Head of Operations', bg: R.brand100, fg: R.brand600 },
  { i: 'TO', name: 'Tom Okafor', role: 'VP Procurement', bg: R.sand, fg: R.ink },
  { i: 'MA', name: 'Mei Arai', role: 'Chief Data Officer', bg: R.muted, fg: R.ink },
  { i: 'JL', name: 'Jonas Lind', role: 'Founder, Lind Labs', bg: R.brand100, fg: R.brand600 },
  { i: 'SK', name: 'Sara Kim', role: 'Head of People', bg: R.sand, fg: R.ink },
  { i: 'DB', name: 'Dev Bose', role: 'CFO', bg: R.muted, fg: R.ink },
];
export type Speaker = (typeof SPEAKERS)[number];

export const Avatar: React.FC<{ s: { i: string; bg: string; fg: string }; size: number; ring?: boolean; edge?: string }> = ({ s, size, ring, edge = '#fff' }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: s.bg, color: s.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: size * 0.36, letterSpacing: '-0.02em', boxShadow: ring ? `0 0 0 4px ${edge}, 0 0 0 6px ${R.brand}` : `0 0 0 4px ${edge}`, flexShrink: 0 }}>{s.i}</div>
);

/** The RecapHub mark: three sheets fanned from one stack. `p` = [front, middle, back] fan progress 0-1. */
export const Mark: React.FC<{ size: number; fan?: [number, number]; show?: [number, number, number]; fill?: string }> = ({ size, fan = [1, 1], show = [1, 1, 1], fill = R.mark }) => {
  const k = size / 500;
  const L = (p: number, a: number, b: number) => a + (b - a) * p;
  const sheet = (x: number, y: number, rot: number, o: number, z: number) => (
    <div style={{ position: 'absolute', left: x * k, top: y * k, width: 220 * k, height: 280 * k, background: fill, border: `${7 * k}px solid #fff`, boxSizing: 'border-box', transform: `rotate(${rot}deg)`, zIndex: z, opacity: o }} />
  );
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {sheet(L(fan[1], 46, 222), L(fan[1], 106, 180), L(fan[1], 0, 25), show[2], 1)}
      {sheet(L(fan[0], 46, 170), L(fan[0], 106, 64), L(fan[0], 0, 13), show[1], 2)}
      {sheet(46, 106, 0, show[0], 3)}
    </div>
  );
};

/** The mark unfolding on a beat clock: the stack lands, then the sheets fan on two beats. */
export const Sheets: React.FC<{ t: number; at: number; size: number; steps?: [number, number] }> = ({ t, at, size, steps = [0.35, 0.6] }) => {
  const s0 = spr(t, at, 13, 0.8);
  return (
    <div style={{ transform: `scale(${0.6 + 0.4 * s0})`, opacity: Math.min(1, s0 * 2) }}>
      <Mark size={size} fan={[spr(t, at + steps[0], 12, 0.8), spr(t, at + steps[1], 12, 0.8)]} />
    </div>
  );
};

export const Wordmark: React.FC<{ size: number; color?: string }> = ({ size, color = R.ink }) => (
  <div style={head(size, { fontWeight: 700, letterSpacing: '-0.045em', color })}>RecapHub</div>
);

/** The call to action every film ends on. */
export const Cta: React.FC<{ t: number; at: number; dark?: boolean; scale?: number }> = ({ t, at, dark, scale = 1 }) => {
  const p = spr(t, at, 13);
  const q = spr(t, at + 0.25, 14);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 26 * scale }}>
      <div style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 30}px) scale(${0.85 + 0.15 * p})`, background: R.brand, color: '#fff', borderRadius: 99, padding: `${20 * scale}px ${46 * scale}px`, fontFamily: SANS, fontWeight: 600, fontSize: 40 * scale, letterSpacing: '-0.01em', boxShadow: '0 18px 44px rgba(67,97,238,0.28)' }}>Book a demo</div>
      <div style={{ opacity: Math.min(1, q * 1.5), transform: `translateY(${(1 - q) * 30}px)`, fontFamily: SANS, fontWeight: 600, fontSize: 44 * scale, color: dark ? '#F5F4F2' : R.ink, letterSpacing: '-0.01em' }}>recaphub.co</div>
    </div>
  );
};

// ------------------------------------------------------------------ screens and recordings

type RecEntry = { file: string; from?: number; rate?: number } | null;
const REC = recs as unknown as Record<string, RecEntry>;
export const hasRec = (id: string) => Boolean(REC[id]?.file);

/** A screen-recording slot: the recording when recordings.json lists one, else the mock. */
export const Rec: React.FC<{ id: string; children: React.ReactNode; fit?: 'cover' | 'contain'; position?: string }> = ({ id, children, fit = 'cover', position = '50% 0%' }) => {
  const r = REC[id];
  if (!r?.file) return <>{children}</>;
  return (
    <OffthreadVideo
      src={staticFile(r.file)}
      trimBefore={Math.max(0, Math.round((r.from ?? 0) * FPS))}
      playbackRate={r.rate ?? 1}
      muted
      style={{ width: '100%', height: '100%', objectFit: fit, objectPosition: position, display: 'block' }}
    />
  );
};

/** A recording filling its positioned parent (the frame a mock would fill). */
export const RecFill: React.FC<{ id: string }> = ({ id }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#fff', overflow: 'hidden' }}>
    <Rec id={id}>{null}</Rec>
  </div>
);

/** A browser window around a screen (mock or recording). */
export const Browser: React.FC<{ w: number; h: number; url: string; rec?: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({ w, h, url, rec, children, style }) => (
  <div style={{ ...card({ borderRadius: 22 }), width: w, height: h, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }}>
    <div style={{ height: 58, flexShrink: 0, background: R.subtle, borderBottom: `1px solid ${R.border}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px' }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: '#E2DFDB', border: '1px solid #D6D3CF' }} />)}
      <div style={{ marginLeft: 24, flex: 1, maxWidth: 640, height: 36, borderRadius: 18, background: '#fff', border: `1px solid ${R.border}`, display: 'flex', alignItems: 'center', padding: '0 18px', fontFamily: MONO, fontSize: 18, color: R.ink2, whiteSpace: 'nowrap', overflow: 'hidden' }}>{url}</div>
    </div>
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#fff' }}>{rec ? <Rec id={rec}>{children}</Rec> : children}</div>
  </div>
);

/** The chat loader: a card outline traced by a moving stroke (CardTraceLoader). */
export const TraceLoader: React.FC<{ t: number; size?: number; color?: string }> = ({ t, size = 44, color = R.brand }) => {
  const w = size;
  const h = size * 1.3;
  const per = 2 * (w + h - 16);
  return (
    <svg width={w + 6} height={h + 6}>
      <rect x={3} y={3} width={w} height={h} rx={8} fill="none" stroke={R.muted} strokeWidth={3} />
      <rect x={3} y={3} width={w} height={h} rx={8} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeDasharray={`${per * 0.28} ${per}`} strokeDashoffset={-((t * per * 0.9) % per)} />
    </svg>
  );
};

export const Spinner: React.FC<{ t: number; size?: number; color?: string; track?: string }> = ({ t, size = 28, color = R.brand, track = R.muted }) => (
  <svg width={size} height={size} style={{ transform: `rotate(${t * 360}deg)` }}>
    <circle cx={size / 2} cy={size / 2} r={size / 2 - 3} fill="none" stroke={track} strokeWidth={3} />
    <circle cx={size / 2} cy={size / 2} r={size / 2 - 3} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeDasharray={`${size * 0.8} ${size * 4}`} />
  </svg>
);

// ------------------------------------------------------------------ event footage

/**
 * Keynote footage. With a recording listed as `event-footage` it plays that,
 * cropped at `crop` (0 = left edge, 1 = right edge); without one it draws a
 * keynote stage. The stage is one 16:9 picture, so vertical crops of it line
 * up like slices of the same shot.
 */
export const Footage: React.FC<{ t: number; w: number; h: number; crop?: number; speaker?: number; dim?: number }> = ({ t, w, h, crop = 0.5, speaker = 0, dim = 0 }) => {
  if (hasRec('event-footage')) {
    return (
      <div style={{ width: w, height: h, overflow: 'hidden', position: 'relative', background: '#000' }}>
        <Rec id="event-footage" position={`${crop * 100}% 50%`}>{null}</Rec>
        {dim ? <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} /> : null}
      </div>
    );
  }
  const k = h / 1080;
  const cw = h * (16 / 9);
  const off = -(cw - w) * crop;
  const sway = Math.sin(t * 1.3 + speaker) * 6;
  const S = SPEAKERS[speaker % SPEAKERS.length];
  return (
    <div style={{ width: w, height: h, overflow: 'hidden', position: 'relative', background: '#14110F' }}>
      <div style={{ position: 'absolute', left: off, top: 0, width: cw, height: h, transformOrigin: '0 0' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #221D19 0%, #2B2420 58%, #120F0D 100%)' }} />
        {/* the slide wall */}
        <div style={{ position: 'absolute', left: 300 * k, top: 110 * k, width: 1320 * k, height: 560 * k, borderRadius: 10 * k, background: 'linear-gradient(160deg, #2F3A52 0%, #232B3D 100%)', boxShadow: `0 0 ${80 * k}px rgba(67,97,238,0.18)`, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 90 * k, top: 90 * k, fontFamily: SANS, fontWeight: 700, fontSize: 70 * k, color: '#F5F4F2', letterSpacing: '-0.03em' }}>The next decade of events</div>
          <div style={{ position: 'absolute', left: 90 * k, top: 190 * k, fontFamily: SANS, fontSize: 34 * k, color: '#A8B3CF' }}>Harbor Summit 2026 · Main stage</div>
          <svg width={1140 * k} height={220 * k} style={{ position: 'absolute', left: 90 * k, top: 280 * k }}>
            <polyline points={[0, 190, 160, 170, 320, 150, 480, 160, 640, 110, 800, 90, 960, 50, 1140, 20].map((v, i) => v * k).join(' ')} fill="none" stroke="#7D93E8" strokeWidth={6 * k} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* the light on the speaker */}
        <div style={{ position: 'absolute', left: 560 * k, top: 180 * k, width: 900 * k, height: 900 * k, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,236,210,0.28) 0%, transparent 62%)' }} />
        {/* the speaker */}
        <div style={{ position: 'absolute', left: 860 * k + sway * k, top: 430 * k }}>
          <div style={{ position: 'absolute', left: 58 * k, top: 0, width: 124 * k, height: 150 * k, borderRadius: `${62 * k}px ${62 * k}px ${56 * k}px ${56 * k}px`, background: 'linear-gradient(170deg, #D8B596 0%, #B98F70 100%)' }} />
          <div style={{ position: 'absolute', left: 50 * k, top: -14 * k, width: 140 * k, height: 70 * k, borderRadius: `${70 * k}px ${70 * k}px ${20 * k}px ${20 * k}px`, background: '#2B201A' }} />
          <div style={{ position: 'absolute', left: 0, top: 160 * k, width: 240 * k, height: 330 * k, borderRadius: `${110 * k}px ${110 * k}px 0 0`, background: 'linear-gradient(170deg, #3A3F4D 0%, #22252E 100%)' }} />
          <div style={{ position: 'absolute', left: 104 * k, top: 160 * k, width: 32 * k, height: 90 * k, background: '#E8E6E3', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        </div>
        {/* lectern */}
        <div style={{ position: 'absolute', left: 1300 * k, top: 650 * k, width: 190 * k, height: 260 * k, background: 'linear-gradient(180deg, #3A3530, #24201C)', borderRadius: `${8 * k}px ${8 * k}px 0 0` }}>
          <div style={{ position: 'absolute', left: 70 * k, top: 40 * k, width: 50 * k, height: 50 * k, borderRadius: 8 * k, background: R.brand, opacity: 0.85 }} />
        </div>
        {/* stage edge and the audience */}
        <div style={{ position: 'absolute', left: 0, top: 900 * k, width: cw, height: 6 * k, background: 'rgba(255,236,210,0.25)' }} />
        {Array.from({ length: 22 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: (i * 92 - 30 + (i % 2) * 30) * k, top: (960 + (i % 3) * 18) * k, width: 120 * k, height: 160 * k, borderRadius: `${60 * k}px ${60 * k}px 0 0`, background: '#0A0807' }} />
        ))}
        {/* lower third */}
        <div style={{ position: 'absolute', left: 120 * k, top: 760 * k, display: 'flex', alignItems: 'center', gap: 18 * k, background: 'rgba(250,250,249,0.94)', borderRadius: 12 * k, padding: `${14 * k}px ${24 * k}px` }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30 * k, color: R.ink }}>{S.name}</div>
          <div style={{ fontFamily: SANS, fontSize: 24 * k, color: R.ink2 }}>{S.role}</div>
        </div>
      </div>
      {dim ? <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} /> : null}
    </div>
  );
};

/** A vertical clip as a poster: footage crop, a caption bar and the clip length. */
export const ClipPoster: React.FC<{ t: number; w: number; crop: number; speaker?: number; n?: number; len?: string; score?: number; active?: boolean; radius?: number }> = ({ t, w, crop, speaker = 0, n, len, score, active, radius = 14 }) => {
  const h = (w * 16) / 9;
  return (
    <div style={{ width: w, height: h, borderRadius: radius, overflow: 'hidden', position: 'relative', background: '#000', outline: active ? `${Math.max(3, w / 60)}px solid ${R.brand}` : 'none', outlineOffset: active ? Math.max(3, w / 70) : 0, flexShrink: 0 }}>
      <Footage t={t} w={w} h={h} crop={crop} speaker={speaker} />
      {score !== undefined ? (
        <div style={{ position: 'absolute', left: w * 0.06, top: w * 0.06, display: 'flex', alignItems: 'center', gap: w * 0.025, background: R.warning50, color: R.warning700, borderRadius: 99, padding: `${w * 0.02}px ${w * 0.05}px`, fontFamily: SANS, fontWeight: 600, fontSize: w * 0.075 }}>
          <Flame size={w * 0.07} />
          {score}
        </div>
      ) : null}
      {n !== undefined ? (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', background: 'rgba(26,23,20,0.7)', color: '#fff', fontFamily: SANS, fontWeight: 500, fontSize: Math.max(12, w * 0.085), padding: `${w * 0.025}px ${w * 0.06}px` }}>
          <span>{n}</span>
          <span>{len}</span>
        </div>
      ) : null}
    </div>
  );
};

export const Flame: React.FC<{ size: number; color?: string }> = ({ size, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export const Scissors: React.FC<{ size: number; color?: string }> = ({ size, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <path d="M8.12 8.12 12 12" />
    <path d="M20 4 8.12 15.88" />
    <circle cx="6" cy="18" r="3" />
    <path d="M14.8 14.8 20 20" />
  </svg>
);

export const Check: React.FC<{ size: number; color?: string; w?: number }> = ({ size, color = 'currentColor', w = 2.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/** Stroke drawn on from 0 to 1 (for underlines and arrows). */
export const fade = (t: number, a: number, b: number, c: number, d: number) => Math.min(lerp(t, a, b), 1 - lerp(t, c, d));
