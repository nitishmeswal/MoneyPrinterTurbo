/* Product fragments: small pieces of the real RecapHub app, rebuilt from its own tokens (recaphub_3.0
 * app/globals.css) and its Storybook fixture copy, so they can move inside: timers tick, checklists tick,
 * progress fills, answers stream, buttons press. Drawn at product size and scaled with `scale`. */
import React from 'react';
import { BACK, EIO, EXPO, OUTQ, Pop, Rise, Stream, Typed, lerp, mix, spr, src } from './kit';
import { BR, DISPLAY, SANS, SERIF, UI } from './brand';
import { Img } from 'remotion';

export const P = {
  b50: '#F0F4FF', b100: '#E0E9FF', b500: '#4361EE', b600: '#3347CC', b700: '#2535A8',
  page: '#FAFAF9', card: '#FFFFFF', subtle: '#F5F4F2', muted: '#E8E6E3',
  t1: '#1A1714', t2: '#57534E', t3: '#A8A49D', tb: '#3347CC', border: '#E8E6E3', strong: '#D1CEC9',
  ok50: '#F0FDF4', ok500: '#22C55E', ok700: '#15803D', warn50: '#FFFBEB', warn700: '#B45309', red50: '#FFF1F2', red500: '#F43F5E', red700: '#BE123C',
};
const SHC = '0 1px 2px rgba(28,25,23,0.05), 0 2px 6px -1px rgba(28,25,23,0.06), 0 30px 70px -24px rgba(30,60,80,0.36)';

/** Scale a product-size fragment for video (origin top-left unless given). */
export const Z: React.FC<{ s: number; children: React.ReactNode; origin?: string; style?: React.CSSProperties }> = ({ s, children, origin = '0 0', style }) => (
  <div style={{ transform: `scale(${s})`, transformOrigin: origin, ...style }}>{children}</div>
);
export const UCard: React.FC<{ children: React.ReactNode; w?: number; pad?: string; style?: React.CSSProperties }> = ({ children, w, pad = '14px 16px', style }) => (
  <div style={{ width: w, background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, boxShadow: SHC, padding: pad, fontFamily: UI, fontSize: 14, lineHeight: 1.5, color: P.t1, ...style }}>{children}</div>
);
type Tone = 'grey' | 'ok' | 'live' | 'brand' | 'warn';
export const Badge: React.FC<{ tone?: Tone; children: React.ReactNode; dot?: boolean; style?: React.CSSProperties }> = ({ tone = 'grey', children, dot, style }) => {
  const c = { grey: [P.subtle, P.t2], ok: [P.ok50, P.ok700], live: [P.red50, P.red700], brand: [P.b50, P.tb], warn: [P.warn50, P.warn700] }[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 22, padding: '0 8px', borderRadius: 999, fontFamily: UI, fontSize: 12, fontWeight: 500, background: c[0], color: c[1], whiteSpace: 'nowrap', ...style }}>
      {dot ? <span style={{ width: 6, height: 6, borderRadius: 3, background: 'currentColor' }} /> : null}
      {children}
    </span>
  );
};
export const Btn: React.FC<{ children: React.ReactNode; primary?: boolean; pressed?: number; style?: React.CSSProperties }> = ({ children, primary, pressed = 0, style }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 8, fontFamily: UI, fontSize: 14, fontWeight: 500, border: `1px solid ${primary ? P.b500 : P.border}`, background: primary ? (pressed > 0 ? P.b700 : P.b500) : '#fff', color: primary ? '#fff' : P.t1, whiteSpace: 'nowrap', transform: `scale(${1 - 0.06 * pressed})`, boxShadow: pressed > 0 ? `0 0 0 ${4 * pressed}px rgba(67,97,238,0.25)` : undefined, ...style }}>{children}</span>
);
/** press amount (0..1, peaks just after `at`) for a button the cursor clicks */
export const pressOf = (t: number, at?: number) => (at === undefined || t < at ? 0 : Math.max(0, 1 - (t - at) / 0.35));
const Av: React.FC<{ txt: string; size?: number; alt?: boolean; img?: string }> = ({ txt, size = 28, alt, img }) => (
  <span style={{ width: size, height: size, borderRadius: '50%', background: alt ? P.muted : P.b100, color: alt ? P.t1 : P.b700, display: 'inline-grid', placeItems: 'center', fontFamily: UI, fontSize: size * 0.39, fontWeight: 600, flex: 'none', overflow: 'hidden' }}>
    {img ? <Img src={src(img)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%' }} /> : txt}
  </span>
);
const hms = (s: number) => [Math.floor(s / 3600), Math.floor(s / 60) % 60, Math.floor(s) % 60].map((n) => String(n).padStart(2, '0')).join(':');

// ------------------------------------------------------------------ capture
/** The live stage card: LIVE pulses, the timer ticks in real time from `start` seconds. */
export const StageCard: React.FC<{ t: number; start?: number; name?: string; chapters?: number }> = ({ t, start = 5076, name = 'Main Stage · Day 1', chapters = 3 }) => (
  <UCard w={320} pad="14px">
    <div style={{ background: '#16141c', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', color: '#fff' }}>
      <Badge tone="live" style={{ background: '#3a1620', color: '#ff8aa0' }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: 'currentColor', opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 3)) }} />LIVE
      </Badge>
      <span style={{ marginLeft: 'auto', fontFamily: UI, fontWeight: 600, fontSize: 20, fontVariantNumeric: 'tabular-nums' }}>{hms(start + t)}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}><b>{name}</b><Badge tone="live" dot style={{ marginLeft: 'auto' }}>Live</Badge></div>
    <div style={{ fontSize: 12, fontWeight: 500, color: P.t3 }}>Started 08:02 · live/main-stage-d1</div>
    <div style={{ display: 'flex', gap: 28, marginTop: 10, borderTop: `1px solid ${P.border}`, paddingTop: 10 }}>
      <div><b style={{ fontVariantNumeric: 'tabular-nums' }}>{chapters}</b><div style={{ fontSize: 12, fontWeight: 500, color: P.t3 }}>chapters</div></div>
      <div><b style={{ fontVariantNumeric: 'tabular-nums' }}>{hms(start + t).slice(0, 5)}</b><div style={{ fontSize: 12, fontWeight: 500, color: P.t3 }}>uptime</div></div>
    </div>
  </UCard>
);
export const Ingest: React.FC<{ t: number; okAt?: number }> = ({ t, okAt = 0 }) => (
  <UCard w={380} pad="16px 18px">
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <b style={{ fontSize: 15 }}>Ingest host health</b>
      <span style={{ marginLeft: 'auto' }}>{t >= okAt ? <Pop t={t} at={okAt}><Badge tone="ok" dot>Healthy</Badge></Pop> : <Badge tone="grey">Checking…</Badge>}</span>
    </div>
    <div style={{ color: P.t2, marginTop: 4 }}>All checks green — safe to go live.</div>
  </UCard>
);
/** The chapter controls; Start turns active when pressed at `pressAt`. */
export const Controls: React.FC<{ t: number; pressAt?: number }> = ({ t, pressAt }) => {
  const on = pressAt !== undefined && t >= pressAt;
  const pr = pressOf(t, pressAt);
  // primary: the blue action; enabled: white with ink; disabled: white with grey
  const tile = (icon: string, label: string, mode: 'primary' | 'on' | 'off', press = 0) => (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 72, height: 52, borderRadius: 8, border: `1px solid ${mode === 'primary' ? P.b500 : P.border}`, background: mode === 'primary' ? (press > 0 ? P.b700 : P.b500) : '#fff', color: mode === 'primary' ? '#fff' : mode === 'on' ? P.t1 : P.t3, fontFamily: UI, fontSize: 12, fontWeight: 500, transform: `scale(${1 - 0.07 * press})`, boxShadow: press > 0 ? `0 0 0 ${4 * press}px rgba(67,97,238,0.25)` : undefined }}>
      <span style={{ fontSize: 14 }}>{icon}</span>{label}
    </span>
  );
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {tile('▶', 'Start', on ? 'on' : 'primary', pr)}
      {tile('⏭', 'Next', on ? 'primary' : 'off')}
      {tile('■', 'Stop', on ? 'on' : 'off')}
      <UCard pad="8px 14px" style={{ boxShadow: 'none' }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', color: P.t3 }}>{on ? 'CHAPTER 1' : 'READY TO MARK'}</div>
        <b style={{ fontSize: 13 }}>{on ? 'Opening keynote: The year ahead' : 'Hit Start when the first talk begins'}</b>
      </UCard>
    </div>
  );
};
/** Transcript lines that type in one after another. */
export const TRANSCRIPT: [string, string, string, boolean][] = [
  ['ML', 'Maria Lopez', 'Welcome everyone, and thanks for joining us this morning.', false],
  ['DC', 'David Chen', 'The short version: slower than the hype, faster than most expected.', true],
  ['ML', 'Maria Lopez', 'Say more about that. Where did teams get stuck first?', false],
];
export const Transcript: React.FC<{ t: number; at: number; step?: number }> = ({ t, at, step = 1.1 }) => (
  <UCard w={380} pad="16px 18px" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {TRANSCRIPT.map(([i, n, line, alt], k) => {
      const a = at + k * step;
      if (t < a) return null;
      return (
        <Rise key={k} t={t} at={a} y={14} blur={6} dur={0.45}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Pop t={t} at={a}><Av txt={i} alt={alt} /></Pop>
            <div>
              <b>{n}</b> <span style={{ fontSize: 12, fontWeight: 500, color: P.t3 }}>{['00:12', '00:24', '00:37'][k]}</span>
              <div style={{ color: P.t2 }}><Typed t={t} at={a + 0.15} text={line} cps={46} caret={k === TRANSCRIPT.length - 1} /></div>
            </div>
          </div>
        </Rise>
      );
    })}
  </UCard>
);

// ------------------------------------------------------------------ clip
export const ClipsLoader: React.FC<{ t: number; a: number; b: number; quips?: string[] }> = ({ t, a, b, quips = ['Finding the moments worth sharing…', 'Cutting to your brand…', 'Adding captions…'] }) => {
  const p = lerp(t, a, b, 0.08, 1, (x) => x);
  const qi = Math.min(quips.length - 1, Math.floor(lerp(t, a, b, 0, quips.length - 0.01, (x) => x)));
  const done = t >= b;
  const ang = t * 280;
  return (
    <UCard w={480} pad="16px">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 8, background: P.b50, color: P.b600, display: 'grid', placeItems: 'center', fontSize: 16 }}>✂</span>
        <div><b>Session clips</b><div style={{ fontSize: 12, fontWeight: 500, color: P.t3 }}>{done ? '6 clips ready' : 'Rendering…'}</div></div>
        <span style={{ marginLeft: 'auto' }}>{done ? <Pop t={t} at={b}><Badge tone="ok" dot>Ready</Badge></Pop> : <Badge tone="brand">◌ Generating</Badge>}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: P.subtle, marginTop: 14 }}><div style={{ width: `${p * 100}%`, height: '100%', borderRadius: 3, background: done ? P.ok500 : P.b500 }} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, height: 30 }}>
        <svg width={24} height={30} style={{ flex: 'none' }}><rect x={2} y={2} width={20} height={26} rx={4} fill="none" stroke={P.border} strokeWidth={2.5} /><rect x={2} y={2} width={20} height={26} rx={4} fill="none" stroke={P.b500} strokeWidth={2.5} strokeDasharray="22 70" strokeDashoffset={-ang / 4} strokeLinecap="round" /></svg>
        <i key={qi} style={{ color: P.t2, opacity: lerp(t, a + qi * ((b - a) / quips.length), a + qi * ((b - a) / quips.length) + 0.25) }}>{done ? 'Ready to review.' : quips[qi]}</i>
      </div>
    </UCard>
  );
};
/** the real clip studio's nine checks (clip-qc-passed.png), shortened */
export const QC_ITEMS = ['Speaker name, role and company match the agenda', 'First 2 s: clean cut, full sentence', 'Last 2 s: ends on a complete thought', 'Speaker on screen the whole clip', 'Captions match the audio word for word', 'No mid-sentence start', 'Self-contained: makes sense on its own', 'Right aspect; nothing in the platform rails', 'Loudness matches the other clips'];
/** The QC checklist; item k ticks at ticks[k]. */
export const QcList: React.FC<{ t: number; ticks: number[] }> = ({ t, ticks }) => {
  const n = ticks.filter((x) => t >= x).length;
  return (
    <UCard w={340} pad="14px 16px">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <b>QC checklist</b>
        <span style={{ marginLeft: 'auto' }}>{n >= QC_ITEMS.length ? <Pop t={t} at={ticks[QC_ITEMS.length - 1]}><Badge tone="ok" dot>QC passed</Badge></Pop> : <Badge>{n}/{QC_ITEMS.length}</Badge>}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10, fontSize: 12 }}>
        {QC_ITEMS.map((it, k) => {
          const on = t >= ticks[k];
          const p = spr(t, ticks[k], 'bouncy');
          return (
            <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'center', color: on ? P.t3 : P.t1 }}>
              <span style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${on ? P.b500 : P.strong}`, background: on ? P.b500 : '#fff', display: 'grid', placeItems: 'center', flex: 'none' }}>
                {on ? <svg width={11} height={11} viewBox="0 0 24 24" style={{ transform: `scale(${p})` }}><path d="M20 6 9 17l-5-5" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
              </span>
              <span style={{ position: 'relative' }}>
                {it}
                <span style={{ position: 'absolute', left: 0, top: '52%', height: 1.2, width: `${lerp(t, ticks[k], ticks[k] + 0.3, 0, 100, EXPO)}%`, background: P.t3 }} />
              </span>
            </div>
          );
        })}
      </div>
    </UCard>
  );
};

// ------------------------------------------------------------------ approve / publish
export const PublishDialog: React.FC<{ t: number; selectAt?: number; pressAt?: number }> = ({ t, selectAt = 0, pressAt }) => {
  const sel = t >= selectAt;
  return (
    <UCard w={440} pad="18px">
      <b style={{ fontSize: 15 }}>Publish your event page</b>
      <div style={{ color: P.t2, fontSize: 12, marginTop: 2 }}>Choose how attendees see this event.</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <div style={{ flex: 1, border: `${sel ? 2 : 1}px solid ${sel ? P.b500 : P.border}`, background: sel ? P.b50 : '#fff', borderRadius: 10, padding: 10, transform: `scale(${1 + 0.03 * pressOf(t, selectAt)})` }}><b style={{ fontSize: 13 }}>Event page</b><div style={{ fontSize: 11, color: P.t3, fontWeight: 500 }}>Hero, recap, sessions and speakers.</div></div>
        <div style={{ flex: 1, border: `1px solid ${P.border}`, borderRadius: 10, padding: 10 }}><b style={{ fontSize: 13 }}>Quartz</b><div style={{ fontSize: 11, color: P.t3, fontWeight: 500 }}>A linked knowledge base.</div></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
        <Btn style={{ borderColor: 'transparent', color: P.t2 }}>Cancel</Btn>
        <Btn primary pressed={pressOf(t, pressAt)}>Save layout &amp; open</Btn>
      </div>
    </UCard>
  );
};
const HERO_TILES: [string, string, string][] = [
  ['footage/pd-hx-1.jpg', 'Keynote', '30% 50%'], ['footage/pd-hx-2.jpg', 'Main stage', '60% 50%'], ['footage/pd-hx-3.jpg', 'Panel', '50% 50%'], ['footage/pd-hx-4.jpg', 'Expo floor', '50% 50%'],
];
/** The published event page hero (the app's Crimson Pro title); photo tiles cascade in. */
export const Hero: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <div style={{ width: 1460, height: 720, background: '#fff', borderRadius: 28, boxShadow: SHC, padding: 70, display: 'flex', gap: 60, fontFamily: UI }}>
    <div style={{ flex: 1, paddingTop: 70 }}>
      <Rise t={t} at={at} y={20}><Badge style={{ transform: 'scale(1.4)', transformOrigin: '0 0' }}>● 12 May 2026 · Lisbon</Badge></Rise>
      <Rise t={t} at={at + 0.12} y={40}><div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 96, lineHeight: 1.0, letterSpacing: '-0.02em', marginTop: 34, color: P.t1 }}>Northwind<br />Summit 2026</div></Rise>
      <Rise t={t} at={at + 0.3} y={20}><div style={{ fontSize: 26, color: P.t2, marginTop: 24 }}>AI in regulated industries, from pilot to practice</div></Rise>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: 560 }}>
      {HERO_TILES.map(([f, l, pos], i) => (
        <Rise key={i} t={t} at={at + 0.25 + i * 0.1} y={60} s={0.85} blur={10}>
          <div style={{ height: 282, borderRadius: 14, overflow: 'hidden', position: 'relative', background: '#2b3a40' }}>
            <Img src={src(f)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${1.08 - 0.06 * lerp(t, at, at + 4, 0, 1, (x) => x)})` }} />
            <b style={{ position: 'absolute', left: 14, bottom: 12, color: '#fff', fontSize: 18, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{l}</b>
          </div>
        </Rise>
      ))}
    </div>
  </div>
);
/** The link box with the brand arrow. */
export const LinkBox: React.FC<{ url: string; size?: number }> = ({ url, size = 34 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 22, background: '#fff', borderRadius: 22, padding: `${size * 0.6}px ${size}px`, boxShadow: '0 5px 14px rgba(20,45,60,0.12), 0 22px 56px rgba(20,45,60,0.30)', fontFamily: DISPLAY, fontWeight: 700, fontSize: size, color: BR.ink }}>
    {url}
    <svg width={size * 1.4} height={size * 0.9} viewBox="0 0 30 18"><line x1={2} y1={9} x2={27} y2={9} stroke={BR.orange} strokeWidth={2.4} strokeLinecap="round" /><path d="M21 3 L27.5 9 L21 15" fill="none" stroke={BR.orange} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);

// ------------------------------------------------------------------ intelligence
/** "Where the time went" as brand colour fields that grow from their corners. */
export const Treemap: React.FC<{ t: number; at: number; step?: number }> = ({ t, at, step = 0.45 }) => {
  const g = (k: number) => lerp(t, at + k * step, at + k * step + 0.7, 0, 1, EIO);
  const tile = (k: number, w: number, h: number, bg: string, fg: string, title: string, meta: string, big: number, extra?: React.ReactNode) => (
    <div style={{ width: w, height: h, position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: w * g(k), height: h * g(k), borderRadius: 24, background: bg, overflow: 'hidden', boxShadow: '0 3px 9px rgba(30,60,80,0.06), 0 34px 64px -34px rgba(30,60,80,0.42)' }}>
        <div style={{ padding: 38, color: fg, opacity: lerp(t, at + k * step + 0.45, at + k * step + 0.8), width: w }}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 25 }}>Theme</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: big, lineHeight: 1.02, letterSpacing: '-0.02em', marginTop: 8 }}>{title}</div>
          <div style={{ fontFamily: SANS, fontSize: 27, marginTop: 12 }}>{meta}</div>
          {extra}
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: 18 }}>
      {tile(0, 980, 660, BR.blue, '#fff', 'Operationalising AI', '2 h 48 min · 3 sessions', 64,
        <div style={{ position: 'absolute', left: 38, bottom: 34, display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontSize: 26 }}><Av txt="ML" size={52} /><span style={{ marginLeft: -26 }}><Av txt="TA" size={52} alt /></span>Mara Lindqvist and 2 others</div>)}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {tile(1, 620, 410, BR.green, '#fff', 'Compliance by design', '2 h 12 min · 2 sessions', 52)}
        {tile(2, 620, 232, BR.yellow, BR.ink, 'Liability', '42 min · 1 session', 48)}
      </div>
    </div>
  );
};
const STANCES: [string, string, string, string, boolean][] = [
  ['M', 'Mara Lindqvist', 'CISO, Nordline Bank', 'Locked down by default; adoption follows trust.', false],
  ['T', 'Theo Adeyemi', 'Head of Product, Kitecloud', 'Ship open, then tighten with usage data.', true],
  ['I', 'Ines Carvalho', 'Researcher, Lisbon Tech', 'Defaults should depend on who the user is.', false],
];
/** The debate: a question, lines drawing out to three stances (positions in a 1920 x 1080 frame). */
export const Debate: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
      {[410, 590, 770].map((y, i) => {
        const p = lerp(t, at + 0.5 + i * 0.22, at + 1.1 + i * 0.22, 0, 1, EIO);
        return <path key={i} d={`M760 570 C 900 570, 900 ${y}, 1060 ${y}`} pathLength={1} fill="none" stroke={BR.deep} strokeWidth={5} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={i === 2 ? 0.45 : 1} />;
      })}
      <circle cx={760} cy={570} r={16 * spr(t, at + 0.45, 'bouncy')} fill={BR.deep} />
    </svg>
    <div style={{ position: 'absolute', left: 160, top: 450 }}>
      <Rise t={t} at={at} x={-60} y={0}>
        <UCard w={600} pad="30px 34px" style={{ borderRadius: 24 }}>
          <Badge style={{ transform: 'scale(1.4)', transformOrigin: '0 0', marginBottom: 12 }}>Unresolved</Badge>
          <b style={{ display: 'block', fontSize: 34, lineHeight: 1.2 }}>Should products ship locked down, even if it slows adoption?</b>
        </UCard>
      </Rise>
    </div>
    {STANCES.map(([a, n, r, s, alt], i) => (
      <div key={i} style={{ position: 'absolute', left: 1060, top: 355 + i * 180 }}>
        <Rise t={t} at={at + 0.95 + i * 0.22} x={80} y={0}>
          <UCard w={700} pad="18px 24px" style={{ borderRadius: 20, display: 'flex', gap: 16, alignItems: 'center', opacity: i === 2 ? 0.6 : 1 }}>
            <Av txt={a} size={56} alt={alt} />
            <div><b style={{ fontSize: 22 }}>{n}</b> <span style={{ fontSize: 18, color: P.t3 }}>{r}</span><div style={{ fontSize: 21, color: P.t2 }}>{s}</div></div>
          </UCard>
        </Rise>
      </div>
    ))}
  </div>
);

// ------------------------------------------------------------------ press
export const QuoteCard: React.FC<{ t: number; copyAt?: number; who?: string; time?: string; quote?: string; tags?: string[] }> = ({ t, copyAt, who = 'Freja Lindqvist · Co-founder, Nordbyte', time = '11:34', quote = '“The AI Act didn’t slow us down. Not knowing how it would be enforced did.”', tags = ['#AI Act', '#Regulation', '#Nordbyte'] }) => {
  const copied = copyAt !== undefined && t >= copyAt;
  return (
    <UCard w={620} pad="18px 20px">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><b>{who}</b><span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 500, color: P.t3 }}>{time}</span></div>
      <div style={{ borderLeft: `3px solid ${P.b500}`, paddingLeft: 12, marginTop: 8, fontStyle: 'italic' }}>{quote}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
        {tags.map((g) => <Badge key={g}>{g}</Badge>)}
        <Btn pressed={pressOf(t, copyAt)} style={{ marginLeft: 'auto', height: 28, background: copied ? P.ok50 : P.b50, borderColor: copied ? P.ok50 : P.b100, color: copied ? P.ok700 : P.tb }}>{copied ? 'Copied' : 'Copy'}</Btn>
        <Btn style={{ height: 28 }}>Save</Btn>
      </div>
    </UCard>
  );
};
export const Toast: React.FC<{ t: number; at: number; text: string; out?: number }> = ({ t, at, text, out }) => (
  <Rise t={t} at={at} y={40} spring="snap" out={out}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#1A1714', color: '#fff', borderRadius: 12, padding: '14px 22px', fontFamily: UI, fontWeight: 500, fontSize: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
      <span style={{ color: P.ok500 }}>✓</span>{text}
    </div>
  </Rise>
);

// ------------------------------------------------------------------ ask (MCP)
export const McpPill: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 16px 6px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.96)', fontFamily: UI, fontWeight: 600, fontSize: 14, color: '#111', boxShadow: `0 8px 22px rgba(20,45,60,0.28)${glow ? `, 0 0 0 ${glow * 6}px rgba(255,255,255,${0.35 * glow})` : ''}` }}>
    <span style={{ display: 'flex' }}>
      <span style={{ width: 24, height: 24, borderRadius: 12, background: '#fff', border: '1px solid #e5e5e5', display: 'grid', placeItems: 'center', color: '#D97757', fontSize: 13 }}>✳</span>
      <span style={{ width: 24, height: 24, borderRadius: 12, background: '#fff', border: '1px solid #e5e5e5', display: 'grid', placeItems: 'center', fontSize: 12, marginLeft: -6 }}>◎</span>
    </span>
    Continue in RecapHub MCP <span style={{ color: '#9ca3af' }}>→</span>
  </span>
);
/** A question that types, then an answer that streams with its source chips. */
export const Chat: React.FC<{ t: number; at: number; q: string; a: string; sources: string[]; w?: number; ansAt?: number }> = ({ t, at, q, a, sources, w = 660, ansAt }) => {
  const qa = at;
  const aa = ansAt ?? at + q.length / 34 + 0.5;
  const thinking = t >= qa + q.length / 34 && t < aa;
  const srcAt = aa + a.split(' ').length / 16 + 0.1;
  return (
    <div style={{ width: w, display: 'flex', flexDirection: 'column', gap: 10, fontFamily: UI, fontSize: 14, lineHeight: 1.5, color: P.t1 }}>
      <Rise t={t} at={qa - 0.2} y={16} style={{ alignSelf: 'flex-end' }}>
        <div style={{ background: P.muted, borderRadius: 14, padding: '8px 14px', maxWidth: w * 0.8 }}><Typed t={t} at={qa} text={q} cps={34} caret={t < aa} /></div>
      </Rise>
      {thinking ? <div style={{ display: 'flex', gap: 5, padding: '10px 4px' }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 4, background: P.t3, opacity: 0.3 + 0.7 * Math.abs(Math.sin(t * 5 + i)) }} />)}</div> : null}
      {t >= aa ? (
        <Rise t={t} at={aa} y={20}>
          <UCard pad="14px 16px">
            <Stream t={t} at={aa} text={a} wps={16} />
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {sources.map((s, i) => <Pop key={s} t={t} at={srcAt + i * 0.12}><Badge tone="brand">{s}</Badge></Pop>)}
            </div>
          </UCard>
        </Rise>
      ) : null}
    </div>
  );
};

// ------------------------------------------------------------------ library / integrations
export const SESSIONS: [string, string][] = [
  ['Opening keynote: The year ahead', '52:14'], ['Panel: Who carries the risk?', '47:30'], ['Workshop: Prompt evaluation', '1:12:44'], ['Deep dive: Retrieval at scale', '38:02'], ['Fireside: From pilot to practice', '44:51'],
];
/** Session rows whose status turns from Processing to Ready at `ready[k]`. */
export const Library: React.FC<{ t: number; at: number; ready: number[]; w?: number; rows?: number }> = ({ t, at, ready, w = 760, rows = 5 }) => (
  <UCard w={w} pad="10px 0">
    <div style={{ padding: '6px 18px 10px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${P.border}` }}><b>Session library</b><span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 500, color: P.t3 }}>{ready.filter((r) => t >= r).length} of {rows} ready</span></div>
    {SESSIONS.slice(0, rows).map(([n, d], k) => {
      const ok = t >= ready[k];
      const pr = lerp(t, at + k * 0.15, ready[k], 0.05, 1, (x) => x);
      return (
        <Rise key={k} t={t} at={at + k * 0.1} y={18} blur={6} dur={0.45}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', borderBottom: k < rows - 1 ? `1px solid ${P.border}` : undefined }}>
            <span style={{ width: 54, height: 32, borderRadius: 6, background: ['#2b3a40', '#3a3550', '#40382b', '#2b4033', '#382b40'][k], flex: 'none', overflow: 'hidden' }}><Img src={src(['footage/pd-thumb-2.jpg', 'footage/pd-thumb-8.jpg', 'footage/pd-thumb-15.jpg', 'footage/pd-thumb-22.jpg', 'footage/pd-thumb-30.jpg'][k])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: 14 }}>{n}</b>
              {!ok ? <div style={{ height: 4, borderRadius: 2, background: P.subtle, marginTop: 6, width: 260 }}><div style={{ width: `${pr * 100}%`, height: '100%', borderRadius: 2, background: P.b500 }} /></div> : <div style={{ fontSize: 12, color: P.t3, fontWeight: 500 }}>Transcript · summary · 6 clips</div>}
            </div>
            <span style={{ fontSize: 12, color: P.t3, fontVariantNumeric: 'tabular-nums' }}>{d}</span>
            <span style={{ width: 92, display: 'flex', justifyContent: 'flex-end' }}>{ok ? <Pop t={t} at={ready[k]}><Badge tone="ok" dot>Ready</Badge></Pop> : <Badge tone="brand">Processing</Badge>}</span>
          </div>
        </Rise>
      );
    })}
  </UCard>
);
/** A source tile for the integrations flow (generic drawn icons, plain names). */
export const Source: React.FC<{ kind: 'drive' | 'upload' | 'av'; label: string; sub: string }> = ({ kind, label, sub }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 24, padding: '22px 30px 22px 22px', boxShadow: '0 3px 9px rgba(30,60,80,0.06), 0 34px 64px -34px rgba(30,60,80,0.42)', width: 470 }}>
    <span style={{ width: 76, height: 76, borderRadius: 18, background: BR.surface, display: 'grid', placeItems: 'center', flex: 'none' }}>
      <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={BR.deep} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {kind === 'drive' ? <><path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 7V6a2 2 0 0 1 2-2h4l2 2" /></> : kind === 'upload' ? <><path d="M12 16V4" /><path d="m6 10 6-6 6 6" /><path d="M4 20h16" /></> : <><rect x={3} y={6} width={18} height={12} rx={2} /><circle cx={12} cy={12} r={3} /><path d="M7 3h10" /></>}
      </svg>
    </span>
    <div><div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: BR.ink, lineHeight: 1.05 }}>{label}</div><div style={{ fontFamily: SANS, fontSize: 22, color: BR.inkMuted, marginTop: 4 }}>{sub}</div></div>
  </div>
);

// ------------------------------------------------------------------ analytics (illustrative until #436)
export const PreviewTag: React.FC = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', border: `1px solid ${BR.line}`, borderRadius: 12, padding: '8px 16px', fontFamily: SANS, fontWeight: 500, fontSize: 22, color: BR.inkSubtle }}>Preview · illustrative numbers</span>
);
export const Bars: React.FC<{ t: number; at: number; items: [string, number][]; w?: number }> = ({ t, at, items, w = 820 }) => {
  const max = Math.max(...items.map((x) => x[1]));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: w }}>
      {items.map(([n, v], i) => {
        const p = lerp(t, at + i * 0.18, at + i * 0.18 + 0.9, 0, 1, EXPO);
        return (
          <div key={n} style={{ fontFamily: SANS }}>
            <div style={{ display: 'flex', fontSize: 26, color: BR.ink, marginBottom: 8 }}><span>{n}</span><b style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{Math.round(v * p)}%</b></div>
            <div style={{ height: 22, borderRadius: 11, background: '#e9e4db' }}><div style={{ height: 22, width: `${(v / max) * 100 * p}%`, borderRadius: 11, background: i === 0 ? BR.deep : BR.slate }} /></div>
          </div>
        );
      })}
    </div>
  );
};
/** A retention curve that draws itself. */
export const Curve: React.FC<{ t: number; at: number; w?: number; h?: number }> = ({ t, at, w = 760, h = 360 }) => {
  const p = lerp(t, at, at + 1.6, 0, 1, EIO);
  const pts = Array.from({ length: 41 }, (_, i) => { const x = i / 40; const y = 0.18 + 0.62 * Math.exp(-x * 2.2) + 0.1 * Math.exp(-((x - 0.62) ** 2) / 0.004); return [x * w, h - y * h]; });
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const peak = pts[25];
  return (
    <svg width={w} height={h + 40} style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={BR.line} strokeWidth={2} />)}
      <path d={d} pathLength={1} fill="none" stroke={BR.deep} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - p} />
      {p > 0.66 ? <g opacity={lerp(t, at + 1.1, at + 1.4)}><circle cx={peak[0]} cy={peak[1]} r={11} fill={BR.deep} /><text x={peak[0] + 20} y={peak[1] - 16} fontFamily={SANS} fontSize={24} fill={BR.ink}>Replays spike at the panel’s debate</text></g> : null}
    </svg>
  );
};

export { BACK, EXPO, OUTQ, mix };
