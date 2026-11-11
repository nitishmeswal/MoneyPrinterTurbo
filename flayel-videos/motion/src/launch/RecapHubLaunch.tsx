/* RecapHub launch film, 1920 x 1080, cut to "Precision Point" (107 BPM) on its
 * real beat map (recaphub.json `grid`, from beatmap.py): ticking-clock intro for
 * the hook, the logo on the first drop, the breakdown for the quote and
 * speakers, the question sent on the second drop.
 * Brand (recaphub_3.0 DESIGN.md / PRODUCT.md): editorial, warm, considered.
 * Warm stone surfaces, ink, brand blue #4361EE for action and focus only,
 * Geist + Crimson Pro italic for the display moment. No violet gradients, no
 * glow, no gradient text. Features only from the README / PRODUCT.md. */
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { loadFont as loadGeist } from '@remotion/google-fonts/Geist';
import { loadFont as loadGeistMono } from '@remotion/google-fonts/GeistMono';
import { loadFont as loadCrimson } from '@remotion/google-fonts/CrimsonPro';
import tlJson from './recaphub.json';
import {
  Ctx, Cursor, CursorPt, Reveal, Scene, Sfx, Soundtrack, Tilt, Timeline, TypeOn, WordPush,
  W, H, FPS, EXPO, INOUT, BACK, clicksOf, count, lerp, sceneBeats, sceneStart, spr, transitionSfx,
} from './kit';

const tl = tlJson as Timeline;
const SANS = loadGeist('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] }).fontFamily;
const MONO = loadGeistMono('normal', { weights: ['400', '500', '600'], subsets: ['latin'] }).fontFamily;
const SERIF = loadCrimson('italic', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily;

const R = {
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
  danger: '#F43F5E',
  mark: '#573DFF',
  sand: '#EFE6DA',
};
const SHADOW = '0 1px 2px rgba(26,23,20,0.05), 0 24px 60px rgba(26,23,20,0.10)';
const head = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.035em', color: R.ink, lineHeight: 1.06, ...extra });
const serif = (extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.01em', ...extra });
const label = (extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: MONO, fontWeight: 500, fontSize: 20, letterSpacing: '0.12em', color: R.ink3, textTransform: 'uppercase', ...extra });
const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({ background: R.card, border: `1px solid ${R.border}`, borderRadius: 20, boxShadow: SHADOW, ...extra });
const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left: x, top: y, ...extra });
const centerRow = (y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center', ...extra });
const LOGO = () => staticFile('launch/recaphub-logo.png');
const RING = 'rgba(67,97,238,0.45)';

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1  0 0 0 0 0.09  0 0 0 0 0.08  0 0 0 0.45 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

/** Warm stone page with paper grain and a slow, low-contrast light. */
const Stone: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, #FCFCFB 0%, ${R.page} 50%, #F1EFEB 100%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 1100 + Math.sin(t * 0.3) * 120, top: -500, width: 1400, height: 1400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 62%)' }} />
      <div style={{ position: 'absolute', left: -500, top: 500 + Math.cos(t * 0.25) * 80, width: 1300, height: 1300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,230,218,0.9) 0%, transparent 62%)' }} />
      <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: 0.28, mixBlendMode: 'multiply' }} />
    </AbsoluteFill>
  );
};

/** Warm ink stage for the dark beats. */
const Ink: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: R.ink, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 960 - 900 + Math.sin(t * 0.4) * 80, top: 300, width: 1800, height: 1400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(87,83,78,0.55) 0%, transparent 60%)' }} />
    <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: 0.5, mixBlendMode: 'screen' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.45) 100%)' }} />
  </AbsoluteFill>
);

// ------------------------------------------------------------------ shared pieces

const SESSIONS = [
  ['Opening keynote', '52:14'], ['Panel: The cost of compliance', '47:30'], ['Fireside with ops leaders', '38:02'], ['Workshop: Audits that ship', '1:12:44'],
  ['Breakout: Supplier risk', '44:18'], ['Pilot results', '31:55'], ['Lightning talks', '58:40'], ['Closing remarks', '21:09'],
];

const SPEAKERS = [
  { i: 'PR', name: 'Priya Raman', bg: R.brand100, fg: R.brand600 },
  { i: 'TO', name: 'Tom Okafor', bg: R.sand, fg: R.ink },
  { i: 'MA', name: 'Mei Arai', bg: R.muted, fg: R.ink },
  { i: 'JL', name: 'Jonas Lind', bg: R.brand100, fg: R.brand600 },
  { i: 'SK', name: 'Sara Kim', bg: R.sand, fg: R.ink },
  { i: 'DB', name: 'Dev Bose', bg: R.muted, fg: R.ink },
  { i: 'LM', name: 'Lena Moss', bg: R.brand100, fg: R.brand600 },
  { i: 'AC', name: 'Ana Cruz', bg: R.sand, fg: R.ink },
];

const Avatar: React.FC<{ s: (typeof SPEAKERS)[number]; size: number; ring?: boolean }> = ({ s, size, ring }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: s.bg, color: s.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: size * 0.36, letterSpacing: '-0.02em', boxShadow: ring ? `0 0 0 4px #fff, 0 0 0 6px ${R.brand}` : '0 0 0 4px #fff', flexShrink: 0 }}>{s.i}</div>
);

const TRANSCRIPT = [
  { s: 0, tc: '00:00:04', text: 'Welcome back. Today is about what we actually learned.' },
  { s: 1, tc: '00:00:19', text: 'Three things surprised us in the pilot.' },
  { s: 0, tc: '00:00:31', text: "Let's start with the cost data." },
  { s: 2, tc: '00:00:44', text: 'And the part nobody wanted to talk about.' },
];

const Transcript: React.FC<{ t: number; at: number; step: number; focus?: number; width?: number }> = ({ t, at, step, focus = -1, width = 700 }) => (
  <div style={{ ...card({ borderRadius: 24 }), width, padding: '30px 34px', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <div style={label({ color: R.ink2 })}>Transcript</div>
      <div style={{ marginLeft: 'auto', fontFamily: SANS, fontWeight: 500, fontSize: 18, color: R.brand600, background: R.brand50, borderRadius: 99, padding: '6px 14px' }}>Speaker identification</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {TRANSCRIPT.map((l, i) => (
        <Reveal key={i} t={t} at={at + i * step} y={18} dur={0.45}>
          <div style={{ display: 'flex', gap: 18, padding: '10px 12px', margin: '-10px -12px', borderRadius: 14, background: focus === i ? R.brand50 : 'transparent', boxShadow: focus === i ? `inset 3px 0 0 ${R.brand}` : 'none' }}>
            <Avatar s={SPEAKERS[l.s]} size={52} />
            <div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: R.ink }}>{SPEAKERS[l.s].name}</span>
                <span style={{ fontFamily: MONO, fontSize: 18, color: R.ink3 }}>{l.tc}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 26, lineHeight: 1.4, color: R.ink2, marginTop: 4 }}>{l.text}</div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </div>
);

/** The RecapHub mark as three sheets that fan out from one stack. */
const Sheets: React.FC<{ t: number; at: number; size: number; steps?: [number, number] }> = ({ t, at, size, steps = [0.35, 0.6] }) => {
  const k = size / 500;
  const s0 = spr(t, at, 13, 0.8);
  const s1 = spr(t, at + steps[0], 12, 0.8);
  const s2 = spr(t, at + steps[1], 12, 0.8);
  const sheet = (x: number, y: number, rot: number, p: number, z: number) => (
    <div style={{ position: 'absolute', left: x * k, top: y * k, width: 220 * k, height: 280 * k, background: R.mark, border: `${7 * k}px solid #fff`, boxSizing: 'border-box', transform: `rotate(${rot}deg)`, transformOrigin: '50% 50%', zIndex: z, opacity: Math.min(1, p * 2) }} />
  );
  const lerpP = (p: number, a: number, b: number) => a + (b - a) * p;
  return (
    <div style={{ position: 'relative', width: size, height: size, transform: `scale(${0.6 + 0.4 * s0})` }}>
      {sheet(lerpP(s2, 46, 222), lerpP(s2, 106, 180), lerpP(s2, 0, 25), s0, 1)}
      {sheet(lerpP(s1, 46, 170), lerpP(s1, 106, 64), lerpP(s1, 0, 13), s0, 2)}
      {sheet(46, 106, 0, s0, 3)}
    </div>
  );
};

// ------------------------------------------------------------------ scenes

// the track opens on a ticking clock: the timecode jumps on each tick
const HOOK_TICKS = [0, 2, 4, 5, 6, 7];
const HOOK_STEP = [0.03, 0.14, 0.33, 0.55, 0.8, 1];

const Hook = ({ t, B }: Ctx) => {
  const ticks = HOOK_TICKS.map(B);
  const k = ticks.filter((x) => t >= x).length - 1;
  const since = t - ticks[Math.max(0, k)];
  const tick = since < 0.25 ? (1 - since / 0.25) ** 2 : 0;
  const secs = Math.round((31 * 3600 + 24 * 60 + 7) * HOOK_STEP[Math.max(0, k)]);
  const tc = [Math.floor(secs / 3600), Math.floor((secs % 3600) / 60), secs % 60].map((n) => String(n).padStart(2, '0')).join(':');
  const row = (y: number, dir: number, offset: number, items: string[][]) => (
    <div style={abs(-400 + ((t * 150 * dir + offset) % 470) - 470 * (dir > 0 ? 1 : 0), y, { display: 'flex', gap: 30, opacity: 0.55 * lerp(t, 0, 0.5) })}>
      {[...items, ...items].map(([title, d], i) => (
        <div key={i} style={{ width: 440, height: 130, borderRadius: 18, background: '#2A2622', border: '1px solid #3A3530', display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', boxSizing: 'border-box', flexShrink: 0 }}>
          <div style={{ width: 120, height: 84, borderRadius: 10, background: 'linear-gradient(160deg, #57534E, #2A2622)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8A49D', fontSize: 28 }}>▶</div>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, color: '#E8E6E3', width: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            <div style={{ fontFamily: MONO, fontSize: 18, color: '#A8A49D', marginTop: 6 }}>{d}</div>
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <AbsoluteFill>
      <Ink t={t} />
      <div style={{ filter: 'blur(2px)' }}>
        {row(700, -1, 0, SESSIONS.slice(0, 4))}
        {row(860, 1, 200, SESSIONS.slice(4))}
      </div>
      <div style={centerRow(170, { alignItems: 'center', gap: 14, opacity: lerp(t, 0, 0.3) })}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: R.danger, opacity: 0.35 + 0.65 * tick }} />
        <div style={label({ color: '#A8A49D', fontSize: 22 })}>Recorded</div>
      </div>
      <div style={centerRow(230)}>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 200, letterSpacing: '-0.04em', color: '#F5F4F2', fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.035 * tick + 0.02 * (k / 5)})` }}>{tc}</div>
      </div>
      <div style={centerRow(500)}>
        <div style={head(56, { color: '#E8E6E3', fontWeight: 500 })}>
          <TypeOn t={t} at={0.35} cps={24} caret="#F5F4F2" parts={[{ text: '38 sessions. Three days. ' }, { text: 'One event.', style: serif({ color: '#fff', fontSize: 64 }) }]} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// every word on a tick of the clock; the click on the last tick before the drop
const NOBODY_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(5.2), x: 1700, y: 1060 },
  { t: B(6.7), x: 1450, y: 660 },
  { t: B(7), x: 1450, y: 660, click: true },
  { t: B(8.6), x: 1520, y: 720 },
];

const Nobody = ({ t, B }: Ctx) => {
  const up = lerp(t, B(3), B(3.7), 0, 1, INOUT);
  const hit = lerp(t, B(7), B(7.5), 0, 1, EXPO);
  return (
    <AbsoluteFill>
      <div style={centerRow(330 - up * 90, { opacity: 1 - up * 0.55 })}>
        <WordPush t={t} style={head(132)} words={[{ text: 'Nobody', at: 0 }, { text: 'watches', at: B(1) }, { text: '31 hours.', at: B(2) }]} />
      </div>
      <div style={centerRow(480)}>
        <WordPush
          t={t}
          style={serif({ fontSize: 190, color: R.ink, lineHeight: 1.1 })}
          gap="0.22em"
          words={[
            { text: 'They', at: B(4) },
            { text: 'read', at: B(5) },
            { text: 'the', at: B(5.5) },
            { text: 'recap.', at: B(6), style: { color: R.brand, background: `rgba(67,97,238,${0.1 * hit})`, borderRadius: 24, padding: '0 0.12em', margin: '0 -0.12em' } },
          ]}
        />
      </div>
      <Cursor t={t} path={NOBODY_CURSOR(B)} ring={RING} />
    </AbsoluteFill>
  );
};

// the drop: three stabs (on the beat, 3/4 and 1 1/2 beats later), one per sheet
const LOGO_STABS: [number, number, number] = [0, 0.75, 1.5];

const Logo = ({ t, B }: Ctx) => {
  const line = lerp(t, B(3), B(3.8), 0, 1, EXPO);
  const morph = lerp(t, B(4), B(4.8), 0, 1, INOUT);
  const textIn = lerp(t, B(4.6), B(5.2));
  return (
    <AbsoluteFill>
      <div style={abs(330, 290)}>
        <Sheets t={t} at={B(LOGO_STABS[0])} size={460} steps={[B(LOGO_STABS[1]), B(LOGO_STABS[2])]} />
      </div>
      <div style={abs(840, 380)}>
        <div style={head(176, { fontWeight: 700, letterSpacing: '-0.045em' })}>
          <TypeOn t={t} at={B(2)} cps={14} caret={R.brand} caretOff={B(3.4)} parts={[{ text: 'RecapHub' }]} />
        </div>
        <div style={{ position: 'relative', height: 110, marginTop: 18 }}>
          <div style={{ position: 'absolute', left: 0, top: 50 - morph * 46, width: 760 * line - morph * 0, height: 4 + morph * 92, borderRadius: 2 + morph * 48, background: morph > 0 ? R.card : R.ink3, border: morph > 0.05 ? `1px solid ${R.border}` : 'none', boxShadow: morph > 0.05 ? SHADOW : 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 40px', overflow: 'hidden' }}>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 44, color: R.ink2, whiteSpace: 'nowrap', opacity: textIn, transform: `translateY(${(1 - textIn) * 20}px)` }}>
              From recording to <span style={serif({ fontSize: 54, color: R.brand })}>recap.</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// clicks on beats 1 and 3; the three steps tick off on beats 4, 5 and 6
const UPLOAD_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(0.5), x: 1560, y: 1000 },
  { t: B(1), x: 1560, y: 950, click: true },
  { t: B(2.7), x: 830, y: 560 },
  { t: B(3), x: 830, y: 560, click: true },
  { t: B(4), x: 1000, y: 1080 },
];

const Upload = ({ t, B }: Ctx) => {
  const carried = lerp(t, B(1), B(2.7), 0, 1, INOUT);
  const dropped = t >= B(3);
  const drop = spr(t, B(3), 10, 0.6);
  // linear between the beats so each step completes exactly on one
  const prog = interpolate(t, [B(3), B(4), B(5), B(6)], [0, 1 / 3, 2 / 3, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const aside = lerp(t, B(6), B(6.8), 0, 1, INOUT);
  const swap = lerp(t, B(5.9), B(6.3));
  const steps = ['Upload', 'Transcribe', 'Summarise'];
  const zoneX = 510 - aside * 400;
  const fileX = 1300 + (zoneX + 190 - 1300) * carried;
  const fileY = 890 + (450 - 890) * carried;
  return (
    <AbsoluteFill>
      <div style={abs(140, 90, { opacity: 1 - swap })}>
        <WordPush justify="flex-start" t={t} style={head(80)} words={[{ text: 'Drop', at: 0 }, { text: 'in', at: B(0.25) }, { text: 'a', at: B(0.5) }, { text: 'recording.', at: B(0.75), style: serif({ fontSize: 92, color: R.ink }) }]} />
      </div>
      <div style={abs(140, 90, { opacity: swap })}>
        <WordPush justify="flex-start" t={t} style={head(80)} words={[{ text: 'Transcribed.', at: B(6) }, { text: 'Every', at: B(6.75) }, { text: 'speaker', at: B(7) }, { text: 'named.', at: B(7.5), style: serif({ fontSize: 92, color: R.ink }) }]} />
      </div>
      <div style={abs(zoneX, 250, { transform: `scale(${1 - aside * 0.16})`, transformOrigin: '0 0' })}>
        <Tilt t={t} rx={6} ry={4 + aside * 6} float={0.5}>
          <div style={{ width: 900, height: 640, borderRadius: 28, background: dropped ? R.card : 'rgba(255,255,255,0.6)', border: `3px ${dropped ? 'solid' : 'dashed'} ${dropped ? R.brand : R.ink3}`, boxSizing: 'border-box', position: 'relative', boxShadow: dropped ? SHADOW : 'none' }}>
            {!dropped ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                <div style={{ width: 96, height: 96, borderRadius: 48, background: R.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, color: R.ink2 }}>↑</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 38, color: R.ink }}>Drop session recordings</div>
                <div style={{ fontFamily: SANS, fontSize: 26, color: R.ink3 }}>Video or audio</div>
              </div>
            ) : (
              <div style={{ position: 'absolute', inset: 0, padding: '60px 64px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${0.9 + 0.1 * drop})`, transformOrigin: '0 50%' }}>
                  <div style={{ width: 120, height: 84, borderRadius: 12, background: R.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>▶</div>
                  <div>
                    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, color: R.ink }}>day1-keynote.mp4</div>
                    <div style={{ fontFamily: MONO, fontSize: 22, color: R.ink3, marginTop: 4 }}>52:14 · 1.2 GB</div>
                  </div>
                </div>
                <div style={{ marginTop: 70, height: 14, borderRadius: 7, background: R.subtle, overflow: 'hidden' }}>
                  <div style={{ width: `${prog * 100}%`, height: '100%', borderRadius: 7, background: R.brand }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 34 }}>
                  {steps.map((s, i) => {
                    const done = prog >= (i + 1) / 3 - 0.001;
                    const active = !done && prog >= i / 3;
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: done || active ? R.ink : R.ink3 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 20, background: done ? R.brand : 'transparent', border: `2px solid ${done ? R.brand : active ? R.brand : R.muted}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, transform: `scale(${done ? 1 + 0.15 * Math.max(0, 1 - (prog - (i + 1) / 3) * 12) : 1})` }}>{done ? '✓' : ''}</div>
                        {s}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 56, display: 'flex', gap: 14, opacity: lerp(t, B(5.4), B(5.8)) }}>
                  {['Transcript', 'Summary', 'Key quotes', 'Chapters'].map((x) => (
                    <div key={x} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, color: R.ink2, background: R.subtle, borderRadius: 99, padding: '10px 20px' }}>{x}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Tilt>
      </div>
      {!dropped ? (
        <div style={abs(fileX, fileY, { transform: `rotate(${(1 - carried) * 0 + Math.sin(carried * Math.PI) * -4}deg) scale(${t >= B(1) && t < B(3) ? 1.04 : 1})`, opacity: spr(t, B(0.2), 13) })}>
          <div style={{ ...card({ borderRadius: 18 }), width: 520, padding: '22px 26px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 18, boxShadow: t >= B(1) ? '0 40px 80px rgba(26,23,20,0.2)' : SHADOW }}>
            <div style={{ width: 84, height: 60, borderRadius: 10, background: R.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>▶</div>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: R.ink }}>day1-keynote.mp4</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: R.ink3 }}>52:14 · 1.2 GB</div>
            </div>
          </div>
        </div>
      ) : null}
      <div style={abs(1080, 250, { opacity: lerp(t, B(6.5), B(7)), transform: `translateX(${(1 - lerp(t, B(6.5), B(7.3), 0, 1, EXPO)) * 200}px)` })}>
        <Transcript t={t} at={B(7)} step={B(8) - B(7)} />
      </div>
      <Cursor t={t} path={UPLOAD_CURSOR(B)} ring={RING} />
    </AbsoluteFill>
  );
};

const CHAPTERS = [
  ['00:00', 'Opening'],
  ['06:12', 'Pilot results'],
  ['18:40', 'Cost data'],
  ['31:05', 'Q&A'],
];
// takeaways on beats 3-5, chapters on the fill (5.75 ... 7.5), the click on the hit at beat 9
const TAKEAWAY_AT = [3, 4, 5];
const CHAPTER_AT = [5.75, 6.25, 7, 7.5];
const SUMMARY_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(7.4), x: 1600, y: 1080 },
  { t: B(8.6), x: 1480, y: 668 },
  { t: B(9), x: 1480, y: 668, click: true },
  { t: B(11.2), x: 1600, y: 900 },
];

const Summary = ({ t, B }: Ctx) => {
  const enter = spr(t, B(0.4), 16, 0.9);
  const picked = t >= B(9);
  return (
    <AbsoluteFill>
      <div style={centerRow(70)}>
        <WordPush t={t} style={head(72)} words={[{ text: 'Summaries,', at: 0 }, { text: 'takeaways', at: B(0.5) }, { text: 'and', at: B(1) }, { text: 'chapters.', at: B(1.25), style: serif({ fontSize: 84 }) }]} />
      </div>
      <div style={abs(80, 300, { opacity: 0.75 })}>
        <Tilt t={t} rx={4} ry={22} float={0.4}>
          <Transcript t={t} at={-10} step={0} focus={picked ? 2 : -1} width={660} />
        </Tilt>
      </div>
      <div style={abs(780 + (1 - enter) * 500, 230, { opacity: Math.min(1, enter * 1.5) })}>
        <Tilt t={t} rx={3} ry={-6} float={0.5}>
          <div style={{ ...card({ borderRadius: 26 }), width: 1040, padding: '36px 44px', boxSizing: 'border-box' }}>
            <div style={label()}>Summary</div>
            <div style={{ fontFamily: SANS, fontSize: 34, lineHeight: 1.45, color: R.ink, marginTop: 12, minHeight: 100 }}>
              <TypeOn t={t} at={B(1)} cps={80} caret={false} style={{ whiteSpace: 'normal' }} parts={[{ text: 'The pilot cut audit prep from weeks to days. Costs fell most where teams fixed data entry first.' }]} />
            </div>
            <div style={{ display: 'flex', gap: 40, marginTop: 30 }}>
              <div style={{ flex: 1 }}>
                <div style={label()}>Key takeaways</div>
                {['Fix data entry before tooling', 'Small pilots beat big rollouts', 'Share results with suppliers early'].map((x, i) => (
                  <Reveal key={x} t={t} at={B(TAKEAWAY_AT[i])} y={16} dur={0.4}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', fontFamily: SANS, fontSize: 31, color: R.ink, marginTop: 22 }}>
                      <span style={{ fontFamily: MONO, fontSize: 20, color: R.brand }}>0{i + 1}</span>
                      {x}
                    </div>
                  </Reveal>
                ))}
              </div>
              <div style={{ width: 420 }}>
                <div style={label()}>Chapters</div>
                {CHAPTERS.map(([tc, name], i) => {
                  const on = picked && i === 2;
                  return (
                    <Reveal key={tc} t={t} at={B(CHAPTER_AT[i])} y={16} dur={0.4}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, padding: '14px 16px', borderRadius: 12, background: on ? R.brand50 : 'transparent', fontFamily: SANS, fontSize: 30, color: on ? R.brand600 : R.ink }}>
                        <span style={{ width: 30, height: 30, borderRadius: 15, background: on ? R.brand : R.subtle, color: on ? '#fff' : R.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>▶</span>
                        <span style={{ fontFamily: MONO, fontSize: 22, color: on ? R.brand600 : R.ink3 }}>{tc}</span>
                        {name}
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </Tilt>
      </div>
      <Cursor t={t} path={SUMMARY_CURSOR(B)} ring={RING} />
    </AbsoluteFill>
  );
};

// the groove ends on a stab fill (beats 48, 48.75, 49.5, 50, then 51): one word per stab
const SLAM_WORDS = ['quotes.', 'speakers.', 'themes.', 'answers.'];
const SLAM_AT = [0, 0.74, 1.49, 2];

const Slam = ({ t, B }: Ctx) => {
  const times = SLAM_AT.map(B);
  const k = times.filter((x) => t >= x).length - 1;
  return (
    <AbsoluteFill>
      <div style={centerRow(270)}>
        <Reveal t={t} at={-0.1} y={14} dur={0.35}>
          <div style={head(62, { fontWeight: 500, color: R.ink2 })}>Every session, turned into</div>
        </Reveal>
      </div>
      {SLAM_WORDS.map((w, i) => {
        const a = times[i];
        const b = times[i + 1] ?? 99;
        if (t < a - 0.01 || t > b + 0.16) return null;
        const pin = lerp(t, a, a + 0.2, 0, 1, EXPO);
        const pout = lerp(t, b, b + 0.15, 0, 1, INOUT);
        return (
          <div key={w} style={centerRow(370, { opacity: pin * (1 - pout), transform: `translateY(${(1 - pin) * 50 - pout * 60}px) scale(${1.06 - 0.06 * pin})`, filter: `blur(${(1 - pin) * 10 + pout * 10}px)` })}>
            <div style={serif({ fontSize: 250, color: R.ink, lineHeight: 1.1 })}>{w}</div>
          </div>
        );
      })}
      <div style={centerRow(720, { gap: 16 })}>
        {SLAM_WORDS.map((w, i) => (
          <div key={w} style={{ width: 84, height: 6, borderRadius: 3, background: i <= k && t >= times[0] ? R.brand : R.muted }} />
        ))}
      </div>
      <div style={centerRow(800)}>
        <Reveal t={t} at={B(3)} y={16} dur={0.4}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 40, color: R.ink2 }}>All in one recap.</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

const Quote = ({ t, B }: Ctx) => {
  const mark = spr(t, 0, 12);
  const under = lerp(t, B(3.6), B(4.4), 0, 1, EXPO);
  return (
    <AbsoluteFill>
      <Ink t={t} />
      <div style={centerRow(170)}>
        <Reveal t={t} at={0} y={14}>
          <div style={label({ color: '#A8A49D', fontSize: 22 })}>Key quote</div>
        </Reveal>
      </div>
      <div style={abs(220, 150, { ...serif({ fontSize: 360, color: R.brand, lineHeight: 1 }), opacity: mark, transform: `scale(${0.6 + 0.4 * mark})` })}>“</div>
      <div style={abs(300, 300, { width: 1320 })}>
        <div style={serif({ fontSize: 104, lineHeight: 1.16, color: '#F5F4F2' })}>
          <TypeOn
            t={t}
            at={B(0.6)}
            cps={30}
            caret="#F5F4F2"
            caretOff={B(3.4)}
            parts={[
              { text: 'The cheapest fix was the one we ' },
              { text: 'almost skipped.', style: { backgroundImage: `linear-gradient(${R.brand}, ${R.brand})`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 92%', backgroundSize: `${under * 100}% 6px` } },
            ]}
            style={{ whiteSpace: 'normal' }}
          />
        </div>
      </div>
      <div style={abs(300, 720)}>
        <Reveal t={t} at={B(4.6)} y={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Avatar s={SPEAKERS[1]} size={72} />
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: '#F5F4F2' }}>Tom Okafor</div>
              <div style={{ fontFamily: MONO, fontSize: 22, color: '#A8A49D', marginTop: 4 }}>Pilot results · 18:40</div>
            </div>
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

const Speakers = ({ t, B }: Ctx) => {
  const shift = lerp(t, B(3.6), B(4.6), 0, 1, INOUT);
  const cx = 960 - shift * 380;
  const cy = 610;
  const hub = spr(t, 0, 12);
  const profile = spr(t, B(4.4), 15, 0.8);
  return (
    <AbsoluteFill>
      <div style={centerRow(70)}>
        <WordPush t={t} style={head(84)} words={[{ text: 'Every', at: 0 }, { text: 'speaker,', at: B(0.5) }, { text: 'profiled.', at: B(1), style: serif({ fontSize: 96 }) }]} />
      </div>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, opacity: hub }}>
        <ellipse cx={cx} cy={cy} rx={500 - shift * 120} ry={260 - shift * 40} fill="none" stroke={R.muted} strokeWidth={2} />
        <ellipse cx={cx} cy={cy} rx={300 - shift * 60} ry={150 - shift * 20} fill="none" stroke={R.muted} strokeWidth={2} strokeDasharray="4 10" />
      </svg>
      {SPEAKERS.map((s, i) => {
        const a = (i / SPEAKERS.length) * Math.PI * 2 + t * 0.28;
        const rx = 500 - shift * 120;
        const ry = 260 - shift * 40;
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        const depth = (Math.sin(a) + 1) / 2;
        const p = spr(t, B(0.5 + i * 0.25), 12);
        const chosen = i === 0 && t >= B(4);
        return (
          <div key={s.i} style={abs(x, y, { transform: `translate(-50%, -50%) scale(${(0.8 + depth * 0.3) * p})`, opacity: Math.min(1, p * 1.5), zIndex: Math.round(depth * 10) })}>
            <Avatar s={s} size={110} ring={chosen} />
          </div>
        );
      })}
      <div style={abs(cx - 140, cy - 140, { width: 280, height: 280, borderRadius: 140, background: R.brand, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${hub * (1 - shift * 0.15)})`, zIndex: 5 })}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 96, letterSpacing: '-0.04em', lineHeight: 1 }}>{count(t, B(0.5), B(2.5), 0, 12)}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, opacity: 0.85 }}>speakers</div>
      </div>
      <div style={abs(1090, 300, { opacity: profile, transform: `translateX(${(1 - profile) * 160}px)` })}>
        <div style={{ ...card({ borderRadius: 26 }), width: 700, padding: '40px 44px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <Avatar s={SPEAKERS[0]} size={120} />
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 44, color: R.ink, letterSpacing: '-0.02em' }}>Priya Raman</div>
              <div style={{ fontFamily: SANS, fontSize: 28, color: R.ink2, marginTop: 4 }}>Head of Operations</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 34 }}>
            {['3 sessions', '14 quotes'].map((x, i) => (
              <Reveal key={x} t={t} at={B(5 + i * 0.4)} y={12} dur={0.35}>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: R.brand600, background: R.brand50, borderRadius: 99, padding: '10px 22px' }}>{x}</div>
              </Reveal>
            ))}
          </div>
          <Reveal t={t} at={B(5.9)} y={12}>
            <div style={label({ marginTop: 30 })}>Talks about</div>
            <div style={{ fontFamily: SANS, fontSize: 30, color: R.ink, marginTop: 10 }}>Audits · Data quality · Supplier risk</div>
          </Reveal>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const THEMES = [
  ['Cost of compliance', 34],
  ['AI in operations', 27],
  ['Hiring', 19],
  ['Supplier risk', 12],
] as const;
const INSIGHT_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(7.8), x: 1700, y: 1080 },
  { t: B(8.8), x: 1240, y: 735 },
  { t: B(9), x: 1240, y: 735, click: true },
  { t: B(11.5), x: 1480, y: 900 },
];

const Insights = ({ t, B }: Ctx) => {
  const enter = spr(t, B(0.6), 16, 0.9);
  const needle = lerp(t, B(4.5), B(6), -80, 38, BACK);
  const pop = spr(t, B(9.2), 13);
  return (
    <AbsoluteFill>
      <div style={abs(140, 70)}>
        <WordPush justify="flex-start" t={t} style={head(76)} words={[{ text: 'Themes,', at: 0 }, { text: 'debates', at: B(0.5) }, { text: 'and', at: B(1) }, { text: 'trends.', at: B(1.25), style: serif({ fontSize: 88 }) }]} />
        <Reveal t={t} at={B(1.8)} y={12}>
          <div style={{ fontFamily: SANS, fontSize: 34, color: R.ink2, marginTop: 8 }}>Across every session of the event.</div>
        </Reveal>
      </div>
      <div style={abs(140, 300 + (1 - enter) * 400, { opacity: Math.min(1, enter * 1.5) })}>
        <Tilt t={t} rx={8} ry={-4} float={0.4}>
          <div style={{ ...card({ borderRadius: 28 }), width: 1640, height: 640, padding: '44px 52px', boxSizing: 'border-box', display: 'flex', gap: 60 }}>
            <div style={{ flex: 1 }}>
              <div style={label()}>Themes · share of sessions</div>
              {THEMES.map(([name, v], i) => {
                const g = lerp(t, B(2.4 + i * 0.5), B(3.4 + i * 0.5), 0, 1, EXPO);
                return (
                  <div key={name} style={{ marginTop: 34 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 30, color: R.ink, marginBottom: 12, opacity: lerp(t, B(2.2 + i * 0.5), B(2.6 + i * 0.5)) }}>
                      <span>{name}</span>
                      <span style={{ fontFamily: MONO, color: R.ink2, fontVariantNumeric: 'tabular-nums' }}>{Math.round(v * g)}%</span>
                    </div>
                    <div style={{ height: 22, borderRadius: 11, background: R.subtle }}>
                      <div style={{ width: `${(v / 34) * 100 * g}%`, height: '100%', borderRadius: 11, background: R.brand, opacity: 1 - i * 0.2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ width: 1, background: R.border }} />
            <div style={{ width: 600, position: 'relative' }}>
              <div style={label()}>Sentiment</div>
              <div style={{ position: 'relative', width: 340, height: 180, marginTop: 20, opacity: lerp(t, B(4.2), B(4.6)) }}>
                <svg width={340} height={180}>
                  <path d="M 20 170 A 150 150 0 0 1 320 170" fill="none" stroke={R.subtle} strokeWidth={26} strokeLinecap="round" />
                  <path d="M 20 170 A 150 150 0 0 1 320 170" fill="none" stroke={R.brand} strokeWidth={26} strokeLinecap="round" strokeDasharray={471} strokeDashoffset={471 * (1 - (needle + 90) / 180)} opacity={0.85} />
                </svg>
                <div style={{ position: 'absolute', left: 168, top: 60, width: 4, height: 112, background: R.ink, borderRadius: 2, transformOrigin: '50% 100%', transform: `rotate(${needle}deg)` }} />
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: R.ink, marginTop: 10, opacity: lerp(t, B(6), B(6.4)) }}>Mostly positive</div>
              <div style={label({ marginTop: 34 })}>Debates</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
                {['Build vs buy', 'Remote audits'].map((x, i) => {
                  const on = i === 0 && t >= B(9);
                  return (
                    <div key={x} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: on ? '#fff' : R.ink, background: on ? R.brand : R.subtle, borderRadius: 99, padding: '12px 24px', opacity: spr(t, B(6.6 + i * 0.5), 13), transform: `scale(${0.8 + 0.2 * spr(t, B(6.6 + i * 0.5), 13)})` }}>{x}</div>
                  );
                })}
              </div>
              <div style={label({ marginTop: 34, opacity: lerp(t, B(7.6), B(8)) * (1 - pop) })}>Trending</div>
              <div style={{ fontFamily: SANS, fontSize: 28, color: R.ink, marginTop: 10, opacity: lerp(t, B(7.6), B(8)) * (1 - pop) }}>
                AI in operations <span style={{ color: R.brand }}>↑</span> <span style={{ color: R.ink3 }}>three days running</span>
              </div>
              {t >= B(9.2) ? (
                <div style={abs(0, 452, { ...card({ borderRadius: 18 }), padding: '22px 26px', width: 500, boxSizing: 'border-box', opacity: pop, transform: `translateY(${(1 - pop) * 20}px) scale(${0.9 + 0.1 * pop})`, transformOrigin: '20% 0', zIndex: 4 })}>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: R.ink }}>Build vs buy</div>
                  <div style={{ fontFamily: SANS, fontSize: 24, color: R.ink2, marginTop: 6 }}>4 sessions · Priya and Tom disagree</div>
                </div>
              ) : null}
            </div>
          </div>
        </Tilt>
      </div>
      <Cursor t={t} path={INSIGHT_CURSOR(B)} ring={RING} />
    </AbsoluteFill>
  );
};

const NODES = [
  { id: 'Build vs buy', x: 260, y: 220, hot: 1 },
  { id: 'Priya', x: 120, y: 90, hot: 1 },
  { id: 'Tom', x: 400, y: 90, hot: 1 },
  { id: 'Pilot results', x: 130, y: 380, hot: 2 },
  { id: 'Panel: Ops', x: 390, y: 380, hot: 2 },
  { id: 'Audits', x: 90, y: 520, hot: 0 },
  { id: 'Hiring', x: 420, y: 520, hot: 0 },
];
const EDGES = [[0, 1], [0, 2], [0, 3], [0, 4], [3, 5], [4, 6], [1, 3], [2, 4]];

// the scene starts on the riser: the question is typed as it builds and sent on the drop (beat 4);
// the citations and the graph light up on the drop's big hits (beats 6 and 8)
const ASK_SEND = 4;
const ASK_LIT = [6, 8];

const Ask = ({ t, B }: Ctx) => {
  const enter = spr(t, B(0.2), 16, 0.9);
  const sent = t >= B(ASK_SEND);
  const lit1 = t >= B(ASK_LIT[0]);
  const lit2 = t >= B(ASK_LIT[1]);
  const hot = (h: number) => (h === 1 && lit1) || (h === 2 && lit2);
  return (
    <AbsoluteFill>
      <div style={abs(140, 80)}>
        <WordPush justify="flex-start" t={t} style={head(84)} words={[{ text: 'Ask', at: 0 }, { text: 'your', at: B(0.25) }, { text: 'event', at: B(0.5) }, { text: 'anything.', at: B(0.75), style: serif({ fontSize: 98, color: R.brand }) }]} />
      </div>
      <div style={abs(140, 260 + (1 - enter) * 300, { opacity: Math.min(1, enter * 1.5) })}>
        <div style={{ ...card({ borderRadius: 26 }), width: 1080, height: 700, padding: '36px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
            {/* empty state does real work: starter prompts from the event's own content */}
            <div style={abs(0, 0, { width: '100%', opacity: 1 - lerp(t, B(ASK_SEND - 0.3), B(ASK_SEND)), display: 'flex', flexDirection: 'column', gap: 18 })}>
              <div style={label()}>Start with</div>
              {['Summarise day one', 'Top quotes on audits', 'Where did speakers disagree?', 'Explore the graph'].map((x, i) => (
                <Reveal key={x} t={t} at={B(0.3 + i * 0.25)} y={14} dur={0.35}>
                  <div style={{ display: 'inline-flex', fontFamily: SANS, fontWeight: 500, fontSize: 30, color: i === 2 && t >= B(1.2) ? R.brand600 : R.ink, background: i === 2 && t >= B(1.2) ? R.brand50 : R.subtle, border: `1px solid ${i === 2 && t >= B(1.2) ? R.brand100 : R.border}`, borderRadius: 16, padding: '16px 24px' }}>{x}</div>
                </Reveal>
              ))}
            </div>
            {sent ? (
              <Reveal t={t} at={B(ASK_SEND)} y={16} dur={0.35} style={{ alignSelf: 'flex-end' }}>
                <div style={{ background: R.ink, color: '#fff', fontFamily: SANS, fontSize: 30, borderRadius: 22, padding: '18px 26px' }}>What did speakers disagree on?</div>
              </Reveal>
            ) : null}
            {t >= B(ASK_SEND + 0.4) ? (
              <div style={{ background: R.subtle, borderRadius: 22, padding: '24px 28px', maxWidth: 900 }}>
                <div style={{ fontFamily: SANS, fontSize: 30, lineHeight: 1.45, color: R.ink }}>
                  <TypeOn t={t} at={B(ASK_SEND + 0.4)} cps={60} caret={false} parts={[{ text: 'Build vs buy. ', style: { fontWeight: 600 } }, { text: 'Priya argued for building in-house; Tom backed a vendor pilot.' }]} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                  {[['Pilot results', '18:40', B(ASK_LIT[0])], ['Panel: Ops', '22:10', B(ASK_LIT[1])]].map(([n, tc, at]) => (
                    <div key={n as string} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, color: R.brand600, background: R.brand50, border: `1px solid ${R.brand100}`, borderRadius: 99, padding: '8px 18px', opacity: spr(t, at as number, 13), transform: `scale(${0.8 + 0.2 * spr(t, at as number, 13)})` }}>
                      {n} · <span style={{ fontFamily: MONO }}>{tc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, border: `1.5px solid ${sent ? R.border : R.brand}`, borderRadius: 18, padding: '20px 24px', boxShadow: sent ? 'none' : `0 0 0 5px ${R.brand50}` }}>
            <div style={{ flex: 1, fontFamily: SANS, fontSize: 30, color: sent ? R.ink3 : R.ink }}>
              {sent ? 'Ask a follow-up…' : <TypeOn t={t} at={B(1.6)} cps={28} caret={R.brand} parts={[{ text: 'What did speakers disagree on?' }]} />}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 20, color: R.ink2, background: R.subtle, borderRadius: 8, padding: '6px 12px' }}>⌘K</div>
          </div>
        </div>
      </div>
      <div style={abs(1280, 260 + (1 - enter) * 300, { opacity: Math.min(1, enter * 1.5) })}>
        <div style={{ ...card({ borderRadius: 26 }), width: 520, height: 700, padding: '30px 0 0', boxSizing: 'border-box', position: 'relative' }}>
          <div style={label({ marginLeft: 30 })}>Knowledge graph</div>
          <svg width={520} height={640} style={{ position: 'absolute', left: 0, top: 60 }}>
            {EDGES.map(([a, b], i) => {
              const on = hot(NODES[a].hot) && hot(NODES[b].hot);
              return <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke={on ? R.brand : R.muted} strokeWidth={on ? 3.5 : 2} />;
            })}
          </svg>
          {NODES.map((n) => (
            <div key={n.id} style={abs(n.x, n.y + 60, { transform: 'translate(-50%, -50%)', fontFamily: SANS, fontWeight: 500, fontSize: 22, whiteSpace: 'nowrap', color: hot(n.hot) ? '#fff' : R.ink2, background: hot(n.hot) ? R.brand : R.card, border: `1.5px solid ${hot(n.hot) ? R.brand : R.border}`, borderRadius: 99, padding: '8px 16px' })}>{n.id}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// the click on the hit at beat 4; then the track claps on every beat (6-11): one session card per clap
const PUBLISH_CLICK = 4;
const PUBLISH_CARDS = [6, 7, 8, 9, 10, 11];
const PUBLISH_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(1.6), x: 1500, y: 1000 },
  { t: B(3.6), x: 980, y: 560 },
  { t: B(PUBLISH_CLICK), x: 980, y: 560, click: true },
  { t: B(5), x: 1100, y: 1080 },
];

const Publish = ({ t, B }: Ctx) => {
  const morph = lerp(t, B(PUBLISH_CLICK + 0.1), B(PUBLISH_CLICK + 0.7), 0, 1, INOUT);
  const fly = lerp(t, B(5), B(5.6), 0, 1, INOUT);
  const win = spr(t, B(5), 16, 0.9);
  const scroll = lerp(t, B(9), B(13.5), 0, 1, INOUT);
  const btnW = 520 - morph * 400;
  return (
    <AbsoluteFill>
      <div style={centerRow(220, { opacity: 1 - fly })}>
        <WordPush t={t} style={head(80)} words={[{ text: 'Publish', at: 0 }, { text: 'a', at: B(0.25) }, { text: 'recap', at: B(0.5) }, { text: 'attendees', at: B(0.75) }, { text: 'can', at: B(1) }, { text: 'explore.', at: B(1.25), style: serif({ fontSize: 92 }) }]} />
      </div>
      <div style={abs(960 - btnW / 2, 500 - fly * 200, { width: btnW, height: 120, borderRadius: 60, background: R.brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 42, opacity: spr(t, B(0.2), 13) * (1 - fly), transform: `scale(${0.85 + 0.15 * spr(t, B(0.2), 13)})`, boxShadow: '0 24px 60px rgba(67,97,238,0.28)', overflow: 'hidden', whiteSpace: 'nowrap' })}>
        {morph < 0.5 ? <span style={{ opacity: 1 - morph * 2 }}>Publish recap</span> : <span style={{ fontSize: 56, opacity: morph * 2 - 1 }}>✓</span>}
      </div>
      <div style={abs(260, 130 + (1 - win) * 900, { opacity: Math.min(1, win * 1.6) })}>
        <Tilt t={t} rx={5} ry={0} float={0.4}>
          <div style={{ ...card({ borderRadius: 26 }), width: 1400, height: 880, overflow: 'hidden' }}>
            <div style={{ height: 70, background: R.subtle, borderBottom: `1px solid ${R.border}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px' }}>
              {['#E8E6E3', '#E8E6E3', '#E8E6E3'].map((c, i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: c, border: '1px solid #D6D3CF' }} />)}
              <div style={{ marginLeft: 30, flex: 1, maxWidth: 700, height: 42, borderRadius: 21, background: '#fff', border: `1px solid ${R.border}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', fontFamily: MONO, fontSize: 20, color: R.ink2 }}>
                <span style={{ fontSize: 16 }}>🔒</span> recaphub.co<span style={{ color: R.ink3 }}>/harbor-summit-2026</span>
              </div>
            </div>
            <div style={{ transform: `translateY(${-scroll * 160}px)` }}>
              <div style={{ padding: '60px 70px 40px', background: `linear-gradient(180deg, ${R.page}, #fff)` }}>
                <div style={label()}>Event recap</div>
                <div style={serif({ fontSize: 96, color: R.ink, marginTop: 6, lineHeight: 1.05 })}>Harbor Summit 2026</div>
                <div style={{ fontFamily: SANS, fontSize: 28, color: R.ink2, marginTop: 14 }}>38 sessions · 12 speakers · 3 days</div>
                <div style={{ display: 'flex', gap: 36, marginTop: 40, borderBottom: `1px solid ${R.border}` }}>
                  {['Sessions', 'Speakers', 'Insights', 'Ask'].map((x, i) => (
                    <div key={x} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: i === 0 ? R.ink : R.ink3, paddingBottom: 14, borderBottom: i === 0 ? `3px solid ${R.brand}` : '3px solid transparent' }}>{x}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, padding: '10px 70px' }}>
                {SESSIONS.slice(0, 6).map(([title, d], i) => (
                  <Reveal key={title} t={t} at={B(PUBLISH_CARDS[i])} y={24} dur={0.35}>
                    <div style={{ borderRadius: 18, border: `1px solid ${R.border}`, overflow: 'hidden', background: '#fff' }}>
                      <div style={{ height: 150, background: i % 2 ? '#2A2622' : '#3A3530', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8E6E3', fontSize: 36 }}>▶</div>
                      <div style={{ padding: '18px 20px' }}>
                        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: R.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                        <div style={{ fontFamily: MONO, fontSize: 18, color: R.ink3, marginTop: 6 }}>{d} · summary · quotes</div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Tilt>
      </div>
      <Cursor t={t} path={PUBLISH_CURSOR(B)} ring={RING} />
    </AbsoluteFill>
  );
};

const End = ({ t, B, dur }: Ctx) => {
  const push = interpolate(t, [0, dur], [1, 1.04]);
  return (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      <div style={centerRow(150)}>
        <Sheets t={t} at={0} size={300} steps={[B(0.5), B(1)]} />
      </div>
      <div style={centerRow(470)}>
        <Reveal t={t} at={B(1.5)} y={30}>
          <div style={head(150, { fontWeight: 700, letterSpacing: '-0.045em' })}>RecapHub</div>
        </Reveal>
      </div>
      <div style={centerRow(650)}>
        <Reveal t={t} at={B(2)} y={24}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 52, color: R.ink2 }}>
            From recording to <span style={serif({ fontSize: 64, color: R.brand })}>recap.</span>
          </div>
        </Reveal>
      </div>
      <div style={centerRow(790)}>
        <Reveal t={t} at={B(3)} y={20}>
          <div style={{ ...card({ borderRadius: 99 }), padding: '20px 54px', fontFamily: SANS, fontWeight: 600, fontSize: 44, color: R.ink, letterSpacing: '-0.01em' }}>recaphub.co</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = {
  hook: Hook,
  nobody: Nobody,
  logo: Logo,
  upload: Upload,
  summary: Summary,
  slam: Slam,
  quote: Quote,
  speakers: Speakers,
  insights: Insights,
  ask: Ask,
  publish: Publish,
  end: End,
};

// every effect is placed on the same beat clock as the picture it belongs to
const sfx = (): Sfx[] => {
  const at = (id: string, beat: number) => sceneStart(tl, id) + sceneBeats(tl, id)(beat);
  const clicks = (id: string, path: (B: (n: number) => number) => CursorPt[]) =>
    clicksOf(path(sceneBeats(tl, id))).map((c) => ({ at: sceneStart(tl, id) + c, src: 'mouse-click' as const, vol: 0.55 }));
  return [
    ...transitionSfx(tl),
    ...clicks('nobody', NOBODY_CURSOR),
    ...LOGO_STABS.map((x, i) => ({ at: at('logo', x), src: 'page-turn' as const, vol: 0.5 - i * 0.08 })),
    ...clicks('upload', UPLOAD_CURSOR),
    ...[4, 5, 6].map((x) => ({ at: at('upload', x), src: 'switch' as const, vol: 0.3 })),
    { at: at('summary', 0.4), src: 'page-turn', vol: 0.45 },
    ...clicks('summary', SUMMARY_CURSOR),
    ...clicks('insights', INSIGHT_CURSOR),
    { at: at('ask', ASK_SEND), src: 'switch', vol: 0.4 },
    ...clicks('publish', PUBLISH_CURSOR),
    { at: at('publish', PUBLISH_CLICK + 0.6), src: 'ding', vol: 0.35 },
    { at: at('end', 0), src: 'page-turn', vol: 0.45 },
    { at: at('end', 3), src: 'ding', vol: 0.25 },
  ];
};

export const RecapHubLaunch: React.FC = () => (
  <AbsoluteFill style={{ background: R.page }}>
    <Stone />
    {tl.scenes.map((s, i) => (
      <Scene key={s.id} tl={tl} index={i} render={RENDER[s.id]} />
    ))}
    <Soundtrack tl={tl} sfx={sfx()} />
  </AbsoluteFill>
);

export const recaphubTimeline = tl;
