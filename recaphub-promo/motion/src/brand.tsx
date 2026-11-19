/* The EventLabs × RecapHub brand, as film pieces (source: the brand doc, claude.ai/artifact/GVbWNRF98qchtLxwniP1Ux).
 *  - ground: off-white `surface`; gradients only as the brand's image files (horizon, fade-bright, card-back)
 *  - type: League Spartan Bold headings, Ubuntu text (Geist + Crimson Pro only inside product UI)
 *  - deep-blue is the one highlight colour; orange is the one action colour (the end card's CTA bar)
 *  - white boxes with soft shadows, corners 10–13 px at 1×, sentence case, no emoji, no all caps */
import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { loadFont as loadSpartan } from '@remotion/google-fonts/LeagueSpartan';
import { loadFont as loadUbuntu } from '@remotion/google-fonts/Ubuntu';
import { loadFont as loadGeist } from '@remotion/google-fonts/Geist';
import { loadFont as loadCrimson } from '@remotion/google-fonts/CrimsonPro';
import { BACK, EIO, EXPO, INQ, LIN, Layer, Rise, lerp, mix, spr, src } from './kit';

export const DISPLAY = loadSpartan('normal', { weights: ['700'], subsets: ['latin'] }).fontFamily;
export const SANS = loadUbuntu('normal', { weights: ['400', '500', '700'], subsets: ['latin'] }).fontFamily;
export const UI = loadGeist('normal', { weights: ['400', '500', '600'], subsets: ['latin'] }).fontFamily;
export const SERIF = loadCrimson('normal', { weights: ['500'], subsets: ['latin'] }).fontFamily;

export const BR = {
  surface: '#f6f3ee', raised: '#ffffff', line: '#e2dcd2', ink: '#1a1a1a', inkMuted: '#4d4d4d', inkSubtle: '#6b6b6b',
  onAccent: '#ffffff', deep: '#1e6f8c', blue: '#2483a5', yellow: '#e0b94b', green: '#477459', orange: '#c45408',
  slate: '#6e9091', cream: '#efe3d1',
};
/** brand shadows (shadow-box / shadow-float / shadow-cta) scaled for 1080p */
export const SH = {
  box: '0 3px 9px rgba(30,60,80,0.06), 0 34px 64px -34px rgba(30,60,80,0.42)',
  float: '0 5px 14px rgba(20,45,60,0.12), 0 22px 56px rgba(20,45,60,0.30)',
  cta: '0 34px 60px -30px rgba(196,84,8,0.6)',
};

// ------------------------------------------------------------------ stages
/** The off-white page with fade-bright laid over it (multiply), drifting slowly. */
// stages are drawn oversized (a 1-frame margin all round) so big camera moves never reach their edge
const M = { position: 'absolute', left: -960, top: -540, width: 3840, height: 2160, overflow: 'hidden' } as const;
export const Paper: React.FC<{ t: number; flip?: boolean; y?: number; depth?: number; strength?: number }> = ({ t, flip, y = -460, depth = 0.25, strength = 1 }) => (
  <AbsoluteFill style={{ background: BR.surface }}>
    <Layer depth={depth}>
      <div style={{ ...M, background: BR.surface }}>
        <Img src={src('brand/fade-bright.jpg')} style={{ position: 'absolute', left: 960 - 120 + Math.sin(t * 0.12) * 60, top: 540 + y + Math.cos(t * 0.1) * 30, width: 2160, maxWidth: 'none', mixBlendMode: 'multiply', opacity: strength, transform: flip ? 'scaleX(-1)' : undefined }} />
      </div>
    </Layer>
  </AbsoluteFill>
);
export type GradImg = 'horizon' | 'card-back';
/** A full-bleed brand gradient (behind white type). `x`, `y`, `w` place the image; it breathes slowly. */
export const Grad: React.FC<{ t: number; img?: GradImg; x?: number; y?: number; w?: number; depth?: number }> = ({ t, img = 'horizon', x = 0, y = -430, w = 2800, depth = 0.3 }) => (
  <AbsoluteFill style={{ background: BR.cream, overflow: 'hidden' }}>
    <Layer depth={depth}>
      <div style={{ ...M, background: img === 'horizon' ? BR.blue : BR.cream }}>
        <Img src={src(`brand/${img}.jpg`)} style={{ position: 'absolute', left: 960 + x - 60 + Math.sin(t * 0.14) * 70, top: 540 + y + Math.cos(t * 0.11) * 40, width: w * (1.03 + 0.02 * Math.sin(t * 0.2)), maxWidth: 'none' }} />
      </div>
    </Layer>
  </AbsoluteFill>
);
/**
 * The brand transition between the page and a gradient: the gradient image sweeps across the frame as a
 * diagonal band, covering it at p = 0.5. Put it over the end of one shot and the start of the next.
 */
export const GradWipe: React.FC<{ t: number; at: number; dur?: number; img?: GradImg }> = ({ t, at, dur = 0.7, img = 'horizon' }) => {
  const p = lerp(t, at, at + dur, 0, 1, EIO);
  if (p <= 0 || p >= 1) return null;
  const a = mix(-0.35, 1.35, p);
  const l = (a - 0.35) * 1920, r = (a + 0.35) * 1920;
  return (
    <AbsoluteFill style={{ clipPath: `polygon(${l + 300}px 0, ${r + 300}px 0, ${r - 300}px 1080px, ${l - 300}px 1080px)` }}>
      <Img src={src(`brand/${img}.jpg`)} style={{ position: 'absolute', left: -200 - p * 300, top: -500, width: 2800, maxWidth: 'none' }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ type
type Chunk = { text: string; kind: 'plain' | 'accent' | 'key' | 'dim' };
const parseLine = (line: string): Chunk[] => {
  const out: Chunk[] = [];
  const re = /\[([^\]]+)\]|\*([^*]+)\*|~([^~]+)~|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1]) out.push({ text: m[1], kind: 'key' });
    else if (m[2]) m[2].split(' ').forEach((w) => out.push({ text: w, kind: 'accent' }));
    else if (m[3]) m[3].split(' ').forEach((w) => out.push({ text: w, kind: 'dim' }));
    else out.push({ text: m[4], kind: 'plain' });
  }
  return out;
};

/**
 * A League Spartan headline that arrives word by word (rise + blur + slight scale, each on its own curve).
 * Markup: *accent* words (deep-blue on the page), [key words] get a white box that slides under them
 * (on gradients), ~dim~ words stay soft. Lines split on "\n". `out` blurs it away.
 */
export const Head: React.FC<{
  t: number; at: number; text: string; size: number; color?: string; accent?: string; step?: number;
  align?: 'left' | 'center'; out?: number; lh?: number; keyAt?: number; style?: React.CSSProperties; tracking?: string;
}> = ({ t, at, text, size, color = BR.ink, accent = BR.deep, step = 0.075, align = 'left', out, lh = 1.0, keyAt, style, tracking = '-0.03em' }) => {
  const q = out === undefined ? 0 : lerp(t, out, out + 0.34, 0, 1, INQ);
  if (q >= 1 || t < at) return null;
  let k = 0;
  return (
    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: lh, letterSpacing: tracking, color, textAlign: align, opacity: 1 - q, filter: q ? `blur(${q * 16}px)` : undefined, transform: q ? `translateY(${-q * 30}px)` : undefined, ...style }}>
      {text.split('\n').map((line, li) => (
        <div key={li} style={{ display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: '0.24em', whiteSpace: 'nowrap', marginTop: li ? size * 0.06 : 0 }}>
          {parseLine(line).map((c) => {
            const i = k++;
            const a = at + i * step;
            const p = lerp(t, a, a + 0.6, 0, 1, EXPO);
            const base: React.CSSProperties = { display: 'inline-block', position: 'relative', opacity: Math.min(1, p * 1.6), filter: p < 0.99 ? `blur(${(1 - p) * 14}px)` : undefined, transform: `translateY(${(1 - p) * 0.34}em) scale(${mix(0.96, 1, p)})`, transformOrigin: '0 100%' };
            if (c.kind === 'accent') return <span key={i} style={{ ...base, color: accent }}>{c.text}</span>;
            if (c.kind === 'dim') return <span key={i} style={{ ...base, opacity: Math.min(1, p * 1.6) * 0.42, filter: `blur(${(1 - p) * 14 + 1.4}px)` }}>{c.text}</span>;
            if (c.kind === 'key') {
              const kb = lerp(t, keyAt ?? a + 0.3, (keyAt ?? a + 0.3) + 0.42, 0, 1, BACK);
              return (
                <span key={i} style={base}>
                  <span style={{ position: 'absolute', left: '-0.13em', right: '-0.13em', top: '0.02em', bottom: '-0.06em', background: BR.raised, borderRadius: size * 0.17, transform: `scaleX(${Math.max(0, kb)})`, transformOrigin: '0 50%', boxShadow: SH.float }} />
                  <span style={{ position: 'relative', color: kb > 0.45 ? BR.ink : color }}>{c.text}</span>
                </span>
              );
            }
            return <span key={i} style={base}>{c.text}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

/** One headline blurs away as its replacement arrives. */
export const Swap: React.FC<{ t: number; at: number; swapAt: number; from: string; to: string; size: number; color?: string; accent?: string; align?: 'left' | 'center'; out?: number; style?: React.CSSProperties }> = ({ t, at, swapAt, from, to, size, color, accent, align, out, style }) => (
  <div style={{ position: 'relative', ...style }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%' }}>
      <Head t={t} at={at} text={from} size={size} color={color} accent={accent} align={align} out={swapAt} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%' }}>
      <Head t={t} at={swapAt + 0.12} step={0.06} text={to} size={size} color={color} accent={accent} align={align} out={out} />
    </div>
  </div>
);

/** Ubuntu supporting line. */
export const Sub: React.FC<{ t: number; at: number; children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties; out?: number }> = ({ t, at, children, size = 34, color = BR.inkMuted, style, out }) => (
  <Rise t={t} at={at} y={24} blur={8} out={out}>
    <div style={{ fontFamily: SANS, fontSize: size, color, lineHeight: 1.35, ...style }}>{children}</div>
  </Rise>
);

// ------------------------------------------------------------------ brand components
/** The brand arrow: a line with rounded ends and an open chevron. */
export const Arrow: React.FC<{ w: number; color: string; stroke?: number; style?: React.CSSProperties }> = ({ w, color, stroke = 4, style }) => (
  <svg width={w} height={stroke * 7} viewBox={`0 0 ${w} ${stroke * 7}`} style={{ overflow: 'visible', ...style }}>
    <line x1={stroke} y1={stroke * 3.5} x2={w - stroke * 1.2} y2={stroke * 3.5} stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    <path d={`M${w - stroke * 3.8} ${stroke * 0.9} L${w - stroke} ${stroke * 3.5} L${w - stroke * 3.8} ${stroke * 6.1}`} fill="none" stroke={color} strokeWidth={stroke * 1.1} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A white box on the page. */
export const Box: React.FC<{ children: React.ReactNode; pad?: string; radius?: number; style?: React.CSSProperties }> = ({ children, pad = '28px 36px', radius = 26, style }) => (
  <div style={{ background: BR.raised, borderRadius: radius, boxShadow: SH.box, padding: pad, color: BR.ink, ...style }}>{children}</div>
);

export type Step = { name: string; text: string };
/**
 * The brand step timeline, animated: each step's disc fills at its time in `on`, the line to the next disc
 * draws, the last line ends in the arrow. Steps not yet on sit at 28%. Drawn at `scale` × the flyer's size.
 */
export const Steps: React.FC<{ t: number; steps: Step[]; on: number[]; scale?: number; width?: number; showText?: boolean; box?: boolean }> = ({ t, steps, on, scale = 2.6, width = 560, showText = true, box = true }) => {
  const s = scale;
  const col = (width - 28) / steps.length;
  return (
    <div style={{ width: width * s, background: box ? BR.raised : undefined, borderRadius: 10 * s, boxShadow: box ? SH.box : undefined, padding: `${10 * s}px ${14 * s}px ${11 * s}px`, display: 'grid', gridTemplateColumns: `repeat(${steps.length}, ${col * s}px)` }}>
      {steps.map((st, i) => {
        const a = on[i] ?? 1e9;
        const p = spr(t, a, 'bouncy');
        const lp = lerp(t, a + 0.15, a + 0.75, 0, 1, EIO);
        const lit = t >= a;
        const last = i === steps.length - 1;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 * s, opacity: lit ? 1 : 0.28, transition: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: 20 * s }}>
              <span style={{ flex: 'none', width: 20 * s, height: 20 * s, borderRadius: 999, background: lit ? BR.deep : '#c9d8de', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 10.5 * s, transform: `scale(${lit ? mix(0.6, 1, p) : 1})` }}>{i + 1}</span>
              <div style={{ flex: 1, margin: `0 ${6 * s}px`, height: 2 * s, background: '#c9d8de', borderRadius: s, position: 'relative', overflow: 'visible' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: 2 * s, width: `${lp * 100}%`, background: BR.deep, borderRadius: s }} />
                {last ? <svg width={10 * s} height={14 * s} viewBox="0 0 9 14" style={{ position: 'absolute', right: -3 * s, top: -6 * s, opacity: lp }}><path d="M2 1.5 L8 7 L2 12.5" fill="none" stroke={BR.deep} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
              </div>
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14 * s, lineHeight: 1.05, color: BR.ink }}>{st.name}</div>
            {showText ? <div style={{ fontFamily: SANS, fontSize: 11 * s, lineHeight: 1.27, color: BR.ink, paddingRight: 6 * s }}>{st.text}</div> : null}
          </div>
        );
      })}
    </div>
  );
};
export const FOUR_STEPS: Step[] = [
  { name: 'Capture', text: 'Audio, video and slides from the AV feed' },
  { name: 'Clip', text: 'Best moments scored and cut to your brand' },
  { name: 'Approve', text: 'Your team reviews and edits together' },
  { name: 'Share', text: 'To speakers, attendees, press, social' },
];

/** The brand stat box: a label, the number in deep-blue (counting up), a companion phrase, a comparison. */
export const Stat: React.FC<{ t: number; at: number; label: string; value: (p: number) => string; with?: string; note?: string; scale?: number; dur?: number }> = ({ t, at, label, value, with: withText, note, scale = 2.6, dur = 1.1 }) => {
  const s = scale;
  const p = lerp(t, at + 0.2, at + 0.2 + dur, 0, 1, EXPO);
  return (
    <Box pad={`${10 * s}px ${16 * s}px ${11 * s}px`} radius={10 * s}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10 * s, letterSpacing: '0.04em', color: BR.inkSubtle }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 * s, marginTop: 2 * s }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 32 * s, lineHeight: 1.06, letterSpacing: '-0.02em', color: BR.deep, fontVariantNumeric: 'tabular-nums' }}>{value(p)}</span>
        {withText ? <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17 * s, color: BR.ink, opacity: lerp(t, at + 0.6, at + 1) }}>{withText}</span> : null}
      </div>
      {note ? <div style={{ fontFamily: SANS, fontSize: 11 * s, color: BR.inkMuted, marginTop: 2 * s, opacity: lerp(t, at + 0.9, at + 1.3) }}>{note}</div> : null}
    </Box>
  );
};

export type Feature = { eyebrow: string; title: string; points: [string, string][] };
/** The brand's three feature cards: one fade-bright image runs across all three; they deal in left to right. */
export const FeatureCards: React.FC<{ t: number; at: number; cards: Feature[]; scale?: number; step?: number }> = ({ t, at, cards, scale = 2.7, step = 0.16 }) => {
  const s = scale;
  const rowW = 519 * s;
  const cw = (519 - 18) / 3;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${cw * s}px)`, gap: 9 * s, width: rowW }}>
      {cards.map((c, i) => (
        <Rise key={i} t={t} at={at + i * step} y={120} s={0.9} r={i === 0 ? -3 : i === 2 ? 3 : 0} blur={16}>
          <div style={{ height: 281 * s, borderRadius: 10 * s, boxShadow: SH.box, padding: `${12 * s}px ${11 * s}px`, display: 'flex', flexDirection: 'column', gap: 6 * s, color: BR.ink, backgroundColor: BR.raised, backgroundImage: `url(${src('brand/fade-bright.jpg')})`, backgroundSize: `${rowW}px ${320 * s}px`, backgroundPosition: `${-i * (cw + 9) * s}px 0`, backgroundRepeat: 'no-repeat' }}>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 10 * s, letterSpacing: '0.02em' }}>{c.eyebrow}</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 * s, lineHeight: 1.06, marginBottom: 4 * s }}>{c.title}</div>
            {c.points.map(([a, b], k) => (
              <div key={k} style={{ fontFamily: SANS, fontSize: 11 * s, lineHeight: 1.27, opacity: lerp(t, at + i * step + 0.4 + k * 0.12, at + i * step + 0.75 + k * 0.12) }}>
                <div style={{ fontWeight: 700 }}>{a}</div>
                <div>{b}</div>
              </div>
            ))}
          </div>
        </Rise>
      ))}
    </div>
  );
};
export const AUDIENCES: Feature[] = [
  { eyebrow: '01 · Speakers', title: 'Every speaker becomes a channel', points: [['Their best moments', 'Clips of their own session, ready to post.'], ['On brand, every format', 'Your templates, every aspect ratio, approved by your team.'], ['Reach beyond the room', 'Speakers carry your event to their networks.']] },
  { eyebrow: '02 · Audience', title: 'Keep attendees talking', points: [['Highlights while it’s live', 'Fresh clips from every stage while people are on site.'], ['Easy to reshare', 'Attendees post the moments they saw, in their own voice.'], ['Catch up on missed talks', 'Short clips cover sessions people couldn’t attend.']] },
  { eyebrow: '03 · Press room', title: 'A live newsroom for journalists', points: [['Live feed from every stage', 'Self-serve news, newest first. No waiting on press releases.'], ['Transcripts, summaries, MCP', 'Research sessions, save quotes, query via chat or MCP.'], ['You control access', 'Whitelisted journalists only, scoped to your event.']] },
];

/** The one orange call to action. The arrow nudges right in a loop once it has landed. */
export const CtaBar: React.FC<{ t: number; at: number; title?: string; sub?: React.ReactNode; scale?: number; width?: number }> = ({ t, at, title = 'Book a demo', sub, scale = 2.2, width = 560 }) => {
  const s = scale;
  const nudge = t > at + 0.8 ? Math.max(0, Math.sin((t - at - 0.8) * 4.2)) * 6 * s : 0;
  return (
    <Rise t={t} at={at} y={90} s={0.94} blur={10} spring="soft">
      <div style={{ width: width * s, background: BR.orange, color: BR.onAccent, borderRadius: 10 * s, boxShadow: SH.cta, padding: `${13 * s}px ${18 * s}px ${13 * s}px ${22 * s}px`, display: 'flex', alignItems: 'center', gap: 14 * s }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 * s }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22 * s, lineHeight: 1.05, letterSpacing: '-0.01em' }}>{title}</div>
          {sub ? <div style={{ fontFamily: SANS, fontSize: 11 * s, lineHeight: 1.27 }}>{sub}</div> : null}
        </div>
        <div style={{ transform: `translateX(${nudge}px)` }}>
          <Arrow w={26 * s} color={BR.onAccent} stroke={2 * s} />
        </div>
      </div>
    </Rise>
  );
};

/** The RecapHub by EventLabs lockup (the black file). The mark swings in, then the wordmark wipes on. */
export const Lockup: React.FC<{ t: number; at: number; w: number; out?: number }> = ({ t, at, w, out }) => {
  const h = (w * 294) / 899;
  const m = spr(t, at, 'soft');
  const wp = lerp(t, at + 0.22, at + 0.85, 0, 1, EIO);
  const q = out === undefined ? 0 : lerp(t, out, out + 0.35, 0, 1, INQ);
  if (t < at || q >= 1) return null;
  const markW = w * 0.315;
  return (
    <div style={{ position: 'relative', width: w, height: h, opacity: 1 - q, filter: q ? `blur(${q * 14}px)` : undefined }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: markW, height: h, overflow: 'hidden', transform: `rotate(${(1 - m) * -24}deg) scale(${mix(0.55, 1, m)})`, transformOrigin: '40% 60%', opacity: Math.min(1, m * 2) }}>
        <Img src={src('brand/recaphub-lockup-black.png')} style={{ width: w, height: h, maxWidth: 'none' }} />
      </div>
      <div style={{ position: 'absolute', left: markW, top: 0, width: w - markW, height: h, overflow: 'hidden', clipPath: `inset(0 ${(1 - wp) * 100}% 0 0)` }}>
        <Img src={src('brand/recaphub-lockup-black.png')} style={{ width: w, height: h, maxWidth: 'none', marginLeft: -markW, transform: `translateX(${(1 - wp) * -40}px)` }} />
      </div>
    </div>
  );
};

/** The end card: the page, the lockup, the film's line, the orange CTA bar to recaphub.co. */
export const EndCard: React.FC<{ t: number; line: string; sub?: string }> = ({ t, line, sub = 'See it on your next event at' }) => (
  <AbsoluteFill>
    <Paper t={t} y={-470} />
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Lockup t={t} at={0.05} w={760} />
      <div style={{ height: 46 }} />
      <Head t={t} at={0.55} text={line} size={72} align="center" step={0.05} />
      <div style={{ height: 120 }} />
      <CtaBar t={t} at={1.05} scale={2.1} sub={<>{sub} <b>recaphub.co</b></>} />
    </AbsoluteFill>
  </AbsoluteFill>
);

/** White pill link for gradients (flyer side A). */
export const PillLink: React.FC<{ cue: string; text: string; scale?: number }> = ({ cue, text, scale = 2.6 }) => {
  const s = scale;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 * s, background: BR.raised, borderRadius: 10 * s, padding: `${8 * s}px ${14 * s}px ${8 * s}px ${16 * s}px`, boxShadow: SH.float }}>
      <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 8 * s, letterSpacing: '0.16em', color: BR.orange }}>{cue}</span>
      <span style={{ width: 1, height: 16 * s, background: BR.line }} />
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14 * s, color: BR.ink }}>{text}</span>
      <Arrow w={16 * s} color={BR.orange} stroke={2 * s} />
    </div>
  );
};

export { LIN };
