/* Flayel launch film, 1920 x 1080, cut to a bar-line music edit of
 * "Calculated Force" (124 BPM, musicedit.py: bars 6-12, 32-46, 51-60) on its real
 * beat map. Pre-drop: hook, forget, the word-per-hit slam; the bird sting on the
 * edit's biggest hit; Ship Score on the second drop. No breakdowns: the flow never dips.
 * Story: the re-explaining loop -> every chat starts from zero -> bird sting:
 * Flayel remembers -> Project Brain -> one-click context -> Ctrl+Shift+S ->
 * capture back -> Ship Score -> The Crown -> one memory, every tool -> flayel.com.
 * Only claims from the Flayel facts in build_batches.py. */
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { C, GRADIENT, MONO, SANS, SERIF } from '../brand';
import tlJson from './flayel.json';
import {
  Blob, Ctx, Cursor, CursorPt, Keycap, Key, Reveal, Ring, Scene, Sfx, Soundtrack, Tilt, Timeline, TypeOn, WordPush, WordSwap,
  W, H, FPS, EXPO, INOUT, BACK, clamp, clicksOf, count, lerp, sceneBeats, sceneStart, spr, transitionSfx, typed,
} from './kit';

const tl = tlJson as Timeline;
const MARK = () => staticFile('flayel-mark.png');
const grad: React.CSSProperties = { background: GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };
const SHADOW = '0 2px 6px rgba(19,35,59,0.06), 0 30px 80px rgba(19,35,59,0.14)';
const MUTED = '#6b7a90';
const head = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: '-0.035em', color: C.text, lineHeight: 1.05, ...extra });
const serifEm: React.CSSProperties = { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.01em', ...grad, paddingRight: '0.08em' };
const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 28, boxShadow: SHADOW, ...extra });
const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left: x, top: y, ...extra });
const centerRow = (y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center', ...extra });
const TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Gemini'];

// ------------------------------------------------------------------ stage, badge, sting

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.07  0 0 0 0 0.13  0 0 0 0 0.23  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

const Backdrop: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(165deg, #fbf8f2 0%, #f6f3ec 55%, #efe8da 100%)', overflow: 'hidden' }}>
      <Blob t={t} x={260} y={180} size={1300} color="rgba(58,159,240,0.15)" drift={90} />
      <Blob t={t} x={1700} y={940} size={1300} color="rgba(192,138,43,0.15)" drift={90} seed={2} />
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(19,35,59,0.07) 2px, transparent 2.4px)', backgroundSize: '46px 46px', backgroundPosition: `${(t * 6) % 46}px ${(t * 9) % 46}px` }} />
      <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: 0.32, mixBlendMode: 'multiply' }} />
    </AbsoluteFill>
  );
};

const STING_AT = sceneStart(tl, 'remember');
const END_B = sceneBeats(tl, 'end');
const STING_LAND = 1.83;
const BADGE = { x: 56, y: 40, size: 72 };

/** The small bird badge, on screen the whole film; it hides while the big bird flies in to become it. */
const Badge: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const show = lerp(t, 0.15, 0.5);
  const hidden = t >= STING_AT && t < STING_AT + STING_LAND ? 0 : 1;
  const land = spr(t, STING_AT + STING_LAND, 10, 0.6);
  // hand over to the big end-card bird (which arrives on beat 6.2 of the end scene)
  const endFade = 1 - lerp(t, sceneStart(tl, 'end') + END_B(5.6), sceneStart(tl, 'end') + END_B(6.1));
  const bob = Math.sin(t * 2.1) * 4;
  return (
    <div style={{ position: 'absolute', left: BADGE.x, top: BADGE.y, display: 'flex', alignItems: 'center', gap: 14, opacity: show * hidden * endFade }}>
      <Img src={MARK()} style={{ width: BADGE.size, height: BADGE.size, objectFit: 'contain', transform: `translateY(${bob}px) scale(${t > STING_AT ? 0.85 + 0.15 * land : 1})`, filter: 'drop-shadow(0 10px 18px rgba(19,35,59,0.22))' }} />
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.32em', color: C.text }}>FLAYEL</div>
    </div>
  );
};

const birdMask: React.CSSProperties = { WebkitMaskImage: `url(${MARK()})`, maskImage: `url(${MARK()})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' };

/** The shiny-bird sting: bursts in with rays and a chrome sweep, then flies into the badge. */
const BirdSting: React.FC<{ t: number }> = ({ t }) => {
  const f = t * FPS;
  if (f > 60) return null;
  const veil = interpolate(f, [0, 5, 36, 52], [0, 0.94, 0.94, 0], clamp);
  const inP = spring({ frame: f, fps: FPS, config: { damping: 11, mass: 0.75 } });
  const fly = interpolate(f, [36, 55], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const size = interpolate(fly, [0, 1], [500, BADGE.size]) * (0.35 + inP * 0.65);
  const cx = interpolate(fly, [0, 1], [960, BADGE.x + BADGE.size / 2]);
  const cy = interpolate(fly, [0, 1], [500, BADGE.y + BADGE.size / 2]) + Math.sin(f / 5) * 10 * (1 - fly);
  const rot = (1 - inP) * -35 + Math.sin(f / 7) * 3 * (1 - fly);
  const sweep = interpolate(f, [8, 32], [-0.5, 1.5], clamp);
  const rays = interpolate(f, [0, 8, 32, 42], [0, 1, 1, 0], clamp);
  const box: React.CSSProperties = { position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, transform: `rotate(${rot}deg)` };
  const ring = (delay: number, color: string) => {
    const p = interpolate(f, [delay, delay + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    return p <= 0 || p >= 1 ? null : <div style={{ position: 'absolute', left: 960 - 700 * p, top: 500 - 700 * p, width: 1400 * p, height: 1400 * p, borderRadius: '50%', border: `${12 * (1 - p) + 1}px solid ${color}`, opacity: (1 - p) * 0.8 }} />;
  };
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, rgba(255,255,255,${veil}) 0%, rgba(250,246,238,${veil * 0.95}) 50%, rgba(236,226,206,${veil * 0.93}) 100%)` }} />
      <div style={{ position: 'absolute', left: 960 - 1300, top: 500 - 1300, width: 2600, height: 2600, borderRadius: '50%', opacity: rays * 0.55, transform: `rotate(${f * 1.4}deg)`, background: 'repeating-conic-gradient(from 0deg, rgba(58,159,240,0.28) 0deg 6deg, transparent 6deg 18deg, rgba(192,138,43,0.24) 18deg 24deg, transparent 24deg 36deg)', WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 60%)', maskImage: 'radial-gradient(circle, black 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', left: cx - size * 0.9, top: cy - size * 0.9, width: size * 1.8, height: size * 1.8, borderRadius: '50%', background: 'radial-gradient(circle, rgba(58,159,240,0.45) 0%, rgba(192,138,43,0.25) 40%, transparent 68%)', opacity: veil, filter: 'blur(20px)' }} />
      {ring(1, C.blue)}
      {ring(7, C.gold)}
      <Img src={MARK()} style={{ ...box, objectFit: 'contain', filter: 'drop-shadow(0 30px 50px rgba(19,35,59,0.35)) saturate(1.15) contrast(1.08)' }} />
      <div style={{ ...box, ...birdMask }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${sweep * 100 - 14}%, rgba(255,255,255,0.95) ${sweep * 100}%, rgba(166,220,255,0.6) ${sweep * 100 + 5}%, transparent ${sweep * 100 + 16}%)` }} />
      </div>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 + 0.3;
        const r = 330 + (i % 3) * 80;
        const tw = Math.max(0, Math.sin((f - i * 3) / 4));
        const vis = interpolate(f, [4 + i, 12 + i, 32, 40], [0, 1, 1, 0], clamp);
        return <div key={i} style={{ position: 'absolute', left: 960 + Math.cos(a) * r * 1.4 - 14, top: 500 + Math.sin(a) * r - 14, width: 28, height: 28, opacity: vis * tw, transform: `rotate(45deg) scale(${0.5 + tw * 0.7})`, background: i % 2 ? C.gold : C.blue, clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)' }} />;
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ scenes

// the hook was timed in seconds at 102 BPM; it now runs on the beat clock (1 unit = one 102-BPM beat's worth)
const HOOK_LINE = "So I'm building an app that";
const HB = 60 / 102;
const HOOK_KEYS = (B: (n: number) => number): Key[] => {
  const S = (sec: number) => B(sec / HB);
  const k = HB / (B(1) || HB); // typing speeds up with the tempo
  return [
    { type: HOOK_LINE, at: S(0.1), cps: 24 * k },
    { del: true, at: S(1.5), cps: 90 * k },
    { type: HOOK_LINE, at: S(1.9), cps: 50 * k },
    { del: true, at: S(2.62), cps: 150 * k },
    { type: HOOK_LINE, at: S(2.86), cps: 95 * k },
    { del: true, at: S(3.22), cps: 240 * k },
    { type: HOOK_LINE, at: S(3.36), cps: 170 * k },
    { del: true, at: S(3.6), cps: 300 * k },
    { type: HOOK_LINE, at: S(3.7), cps: 200 * k },
  ];
};
const GHOSTS = [1.5, 2.62, 3.22, 3.6, 3.85, 4.0, 4.15];
const HOOK_SWITCHES = [1.5, 2.62, 3.22, 3.6];

const Hook = ({ t, B, dur }: Ctx) => {
  const S = (sec: number) => B(sec / HB);
  const txt = typed(t, HOOK_KEYS(B));
  const n = t < S(1.9) ? 1 : t < S(2.86) ? 2 : t < S(3.36) ? 3 : count(t, S(3.36), S(4.35), 4, 47);
  const push = interpolate(t, [0, dur], [1, 1.07]);
  const spin = t > S(3.36) && t < S(4.35);
  const jolt = spin ? Math.sin(t * 90) * 3 : 0;
  const chipIn = spr(t, 0, 13);
  const composer = (opacity: number, y: number, scale: number, text: string, key?: number) => (
    <div key={key} style={abs(250, 520 + y, { width: 1420, height: 190, ...card({ borderRadius: 48 }), opacity, transform: `scale(${scale})`, display: 'flex', alignItems: 'center', padding: '0 40px 0 64px', boxSizing: 'border-box' })}>
      <div style={{ flex: 1, fontFamily: SANS, fontWeight: 500, fontSize: 72, letterSpacing: '-0.02em', color: text ? C.text : '#a5adba', whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {text || 'Message your AI…'}
        {key === undefined ? <span style={{ display: 'inline-block', width: 4, height: 56, marginLeft: 3, verticalAlign: -8, background: C.accent, opacity: Math.floor(t * 2.4) % 2 === 0 || txt.length % 3 ? 1 : 0 }} /> : null}
      </div>
      <div style={{ width: 110, height: 110, borderRadius: 55, background: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 44, fontFamily: SANS, fontWeight: 700 }}>↑</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      {GHOSTS.map(S).map((g, i) => {
        if (t < g) return null;
        const p = lerp(t, g, g + S(1.1), 0, 1, Easing.out(Easing.quad));
        return p >= 1 ? null : composer(0.55 * (1 - p), -p * (260 + (i % 3) * 60), 1 - p * 0.08, HOOK_LINE, i);
      })}
      {composer(1, 0, 1, txt)}
      <div style={abs(1180, 300, { opacity: chipIn, transform: `translate(${jolt}px, ${(1 - chipIn) * 30}px) rotate(${-2 + jolt * 0.3}deg) scale(${1 + 0.12 * (spin ? 1 : 0)})`, ...card({ borderRadius: 30 }), padding: '22px 36px', display: 'flex', alignItems: 'center', gap: 26 })}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.14em', color: MUTED, lineHeight: 1.35 }}>
          TIMES YOU'VE
          <br />
          EXPLAINED IT
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 116, letterSpacing: '-0.04em', color: n > 3 ? C.red : C.text, minWidth: 190, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>×{n}</div>
      </div>
    </AbsoluteFill>
  );
};

const Forget = ({ t, B }: Ctx) => {
  const words = ['Every', 'new', 'chat', 'starts', 'from', 'zero.'];
  return (
    <AbsoluteFill style={{ transform: `scale(${interpolate(t, [0, B(8)], [1, 1.05])})` }}>
      <div style={centerRow(250)}>
        <WordPush t={t} style={head(124)} words={words.map((w, i) => ({ text: w, at: B(i * 0.5), style: w === 'zero.' ? { ...serifEm, background: 'none', WebkitBackgroundClip: 'initial', color: C.red, fontSize: 124 } : undefined }))} />
      </div>
      <div style={centerRow(500, { gap: 40 })}>
        {TOOLS.map((tool, i) => {
          const at = B(3 + i * 0.5);
          const p = spr(t, at, 13);
          const drain = lerp(t, B(5 + i * 0.25), B(6.5 + i * 0.25), 1, 0, INOUT);
          return (
            <div key={tool} style={{ ...card({ borderRadius: 34 }), width: 380, padding: '38px 40px', boxSizing: 'border-box', opacity: Math.min(1, p * 1.4) * (0.45 + 0.55 * drain), transform: `translateY(${(1 - p) * 60}px) scale(${0.9 + 0.1 * p}) rotate(${(1 - drain) * (i % 2 ? 2 : -2)}deg)` }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 54, letterSpacing: '-0.02em', color: C.text }}>{tool}</div>
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 20, letterSpacing: '0.12em', color: MUTED, margin: '16px 0 12px' }}>PROJECT MEMORY {Math.round(drain * 100)}%</div>
              <div style={{ height: 14, borderRadius: 7, background: 'rgba(19,35,59,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${drain * 100}%`, height: '100%', borderRadius: 6, background: drain > 0.35 ? C.blue : C.red }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={centerRow(820)}>
        <Reveal t={t} at={B(6.2)}>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 36, letterSpacing: '0.08em', color: MUTED }}>Your vision. Your stack. Your decisions. Gone.</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

// the track's last hit before the drop is beat 5 of this scene: one word per hit, then the
// line pushes into the camera and the drop cuts to the bird
const SLAM_WORDS = [
  { text: 'Stop', at: 0, color: C.text },
  { text: 're-explaining', at: 1, color: C.red },
  { text: 'your', at: 2, color: C.text },
  { text: 'project', at: 3, color: C.text },
];
const SLAM_TOOLS_AT = [5, 5.5, 6, 6.5];

const Slam = ({ t, B }: Ctx) => {
  const times = SLAM_WORDS.map((w) => B(w.at));
  const k = times.filter((x) => t >= x).length - 1;
  const line = lerp(t, B(4), B(4.4), 0, 1, EXPO);
  const rush = lerp(t, B(7.2), B(8), 0, 1, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + rush * 0.35})`, filter: `blur(${rush * 14}px)`, opacity: 1 - rush * 0.4 }}>
      {SLAM_WORDS.map((w, i) => {
        if (i !== k || t >= B(4.4)) return null;
        const p = lerp(t, times[i], times[i] + 0.16, 0, 1, EXPO);
        const out = i === SLAM_WORDS.length - 1 ? line : 0;
        return (
          <div key={w.text} style={centerRow(330, { opacity: Math.min(1, p * 1.4) * (1 - out), transform: `scale(${1.35 - 0.35 * p - out * 0.4})`, filter: `blur(${(1 - p) * 8}px)` })}>
            <div style={head(250, { fontWeight: 800, color: w.color, letterSpacing: '-0.05em' })}>{w.text}</div>
          </div>
        );
      })}
      <div style={centerRow(300, { opacity: line, transform: `translateY(${(1 - line) * 40}px)` })}>
        <div style={head(120, { fontWeight: 800 })}>
          Stop <span style={{ color: C.red }}>re-explaining</span> your project
        </div>
      </div>
      <div style={centerRow(480, { opacity: lerp(t, B(4.8), B(5)) })}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: '0.12em', color: MUTED }}>TO EVERY AI TOOL.</div>
      </div>
      <div style={centerRow(600, { gap: 28 })}>
        {TOOLS.map((tool, i) => {
          const p = spr(t, B(SLAM_TOOLS_AT[i]), 12);
          return (
            <div key={tool} style={{ ...card({ borderRadius: 99 }), padding: '20px 38px', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.text, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 50}px) scale(${0.8 + 0.2 * p})` }}>{tool}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Remember = ({ t, B }: Ctx) => {
  const settle = lerp(t, B(6), B(7.2), 0, 1, INOUT);
  const line = lerp(t, B(4.5), B(5.6), 0, 1, EXPO);
  return (
    <AbsoluteFill>
      <div style={centerRow(380 - settle * 40, { flexDirection: 'column', alignItems: 'center' })}>
        <div style={head(168, { fontWeight: 700 })}>
          <TypeOn t={t} at={1.45} cps={21} caret={C.accent} caretOff={B(6)} parts={[{ text: 'Flayel ' }, { text: 'remembers.', style: serifEm }]} />
        </div>
        <div style={{ width: 980 * line, height: 6, borderRadius: 3, marginTop: 18, background: GRADIENT, opacity: 1 - settle * 0.4 }} />
      </div>
      <div style={centerRow(700)}>
        <Reveal t={t} at={B(6.3)}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 46, letterSpacing: '-0.01em', color: MUTED }}>The memory layer for people who build with AI.</div>
        </Reveal>
      </div>
      <BirdSting t={t} />
    </AbsoluteFill>
  );
};

const BUCKETS = [
  { name: 'Vision', fields: 'one-liner · for · problem · insight', days: 90, color: C.blue },
  { name: 'Architecture', fields: 'stack · data + auth · AI rules', days: 30, color: C.purple },
  { name: 'Progress', fields: 'works · in progress · next · broken', days: 7, color: C.green },
  { name: 'Decisions', fields: 'decided · because · ruled out', days: 30, color: C.gold },
  { name: 'User Feedback', fields: 'quotes · complaints · requests', days: 14, color: C.red },
  { name: 'Monetization', fields: 'pricing · revenue · costs · channel', days: 30, color: C.amber },
];
const PROGRESS = [
  { k: 'Works', v: 'Sign-up, billing', c: C.green },
  { k: 'In progress', v: 'Onboarding', c: C.amber },
  { k: 'Next', v: 'Team invites', c: C.blue },
  { k: 'Broken', v: 'Usage charts', c: C.red },
];

const Tile: React.FC<{ t: number; at: number; b: (typeof BUCKETS)[number]; focus: number; dim: number; children?: React.ReactNode }> = ({ t, at, b, focus, dim, children }) => {
  const p = spr(t, at, 13);
  const fresh = lerp(t, at + 0.2, at + 1, 0, 1);
  return (
    <div style={{ width: 372, height: 250, boxSizing: 'border-box', padding: '28px 30px', borderRadius: 24, background: '#fff', border: `2px solid ${focus > 0.5 ? C.accent : C.border}`, boxShadow: focus > 0 ? `0 30px 70px rgba(26,120,214,${0.25 * focus})` : '0 2px 6px rgba(19,35,59,0.05)', opacity: Math.min(1, p * 1.4) * (1 - dim * 0.5), transform: `translateY(${(1 - p) * 50}px) scale(${(0.9 + 0.1 * p) * (1 + focus * 0.07)}) translateZ(${focus * 60}px)`, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: b.color }} />
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: '-0.02em', color: C.text }}>{b.name}</div>
      </div>
      {children ?? (
        <>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 19, color: MUTED, lineHeight: 1.5 }}>{b.fields}</div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, letterSpacing: '0.12em', color: C.green, marginBottom: 8 }}>FRESH · STALE IN {b.days} DAYS</div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(19,35,59,0.07)' }}>
              <div style={{ width: `${fresh * 100}%`, height: '100%', borderRadius: 4, background: C.green }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const BRAIN_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(6), x: 1780, y: 1060 },
  { t: B(7.6), x: 1420, y: 500 },
  { t: B(8), x: 1420, y: 500, click: true },
  { t: B(11), x: 1500, y: 560 },
];

const Brain = ({ t, B }: Ctx) => {
  const rise = spr(t, B(0.5), 16, 0.9);
  const focus = lerp(t, B(8), B(8.6), 0, 1, BACK);
  return (
    <AbsoluteFill>
      <div style={centerRow(70)}>
        <WordPush t={t} style={head(66)} words={[{ text: 'Meet', at: 0 }, { text: 'your', at: B(0.5) }, { text: 'Project Brain.', at: B(1), style: grad }]} />
      </div>
      <div style={abs(330, 190 + (1 - rise) * 500, { opacity: Math.min(1, rise * 1.5) })}>
        <Tilt t={t} rx={lerp(t, 0, B(6), 24, 9, INOUT)} ry={lerp(t, 0, B(6), -16, -5, INOUT)} rz={1}>
          <div style={{ ...card({ borderRadius: 36 }), width: 1260, padding: '30px 40px 40px', boxSizing: 'border-box', transformStyle: 'preserve-3d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26 }}>
              <Img src={MARK()} style={{ width: 46, height: 46, objectFit: 'contain' }} />
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.text }}>Project Brain</div>
              <div style={{ fontFamily: MONO, fontSize: 22, color: MUTED }}>/ habit-app</div>
              <div style={{ marginLeft: 'auto', fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.14em', color: MUTED, border: `1px solid ${C.border}`, borderRadius: 99, padding: '8px 18px' }}>6 BUCKETS</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 372px)', gap: 24, transformStyle: 'preserve-3d' }}>
              {BUCKETS.map((b, i) => (
                <Tile key={b.name} t={t} at={B(1.5 + i * 0.5)} b={b} focus={i === 2 ? focus : 0} dim={i === 2 ? 0 : focus}>
                  {i === 2 && focus > 0.02 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 2 }}>
                      {PROGRESS.map((r, k) => (
                        <Reveal key={r.k} t={t} at={B(8.2 + k * 0.35)} y={14} dur={0.35}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 23, whiteSpace: 'nowrap' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 5, background: r.c }} />
                            <span style={{ fontWeight: 700, color: C.text }}>{r.k}</span>
                            <span style={{ color: MUTED }}>{r.v}</span>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  ) : undefined}
                </Tile>
              ))}
            </div>
          </div>
        </Tilt>
      </div>
      <Cursor t={t} path={BRAIN_CURSOR(B)} />
    </AbsoluteFill>
  );
};

const CONTEXT_LINES = ['## Vision', 'Habit tracker for remote teams.', '## Architecture', 'Next.js · Supabase · Stripe', '## Progress', 'Works: sign-up, billing', 'Next: team invites', '## Decisions', 'Supabase auth: RLS on every table'];
const COPY_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(6.6), x: 900, y: 1080 },
  { t: B(7.7), x: 420, y: 790 },
  { t: B(8), x: 420, y: 790, click: true },
  { t: B(11), x: 470, y: 840 },
];

const Copy = ({ t, B }: Ctx) => {
  const tabTimes = [B(2), B(3), B(4), B(5), B(6)];
  const tabIdx = [0, 1, 2, 3, 0];
  let k = 0;
  tabTimes.forEach((at, i) => {
    if (t >= at) k = i;
  });
  const from = k > 0 ? tabIdx[k - 1] : 0;
  const slide = spring({ frame: Math.max(0, (t - tabTimes[k]) * FPS), fps: FPS, config: { damping: 16, mass: 0.6 } });
  const x = (from + (tabIdx[k] - from) * slide) * 190;
  const copied = t >= B(8);
  const pulse = copied ? 1 + 0.035 * Math.max(0, 1 - (t - B(8)) / 0.35) : 1;
  const ghost = lerp(t, B(8), B(9.5), 0, 1, EXPO);
  const segIn = spr(t, B(1.8), 14);
  const cardIn = spr(t, B(0.8), 16, 0.9);
  const codeCard = (style: React.CSSProperties) => (
    <div style={{ width: 760, height: 660, borderRadius: 30, background: '#13233b', boxShadow: '0 40px 100px rgba(19,35,59,0.35)', padding: '34px 40px', boxSizing: 'border-box', fontFamily: MONO, fontSize: 26, lineHeight: 1.62, color: '#d6e4f5', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, color: '#8ca3bf', fontSize: 22 }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: '#3a9ff0' }} /> context.md · formatted for&nbsp;
        <WordSwap t={t} words={['Claude', 'ChatGPT', 'Cursor', 'Gemini', 'Claude']} times={tabTimes} style={{ color: '#fff', fontWeight: 700 }} />
      </div>
      {CONTEXT_LINES.map((l, i) => {
        const at = B(1.2 + i * 0.55);
        return t < at ? null : (
          <div key={i} style={{ color: l.startsWith('##') ? '#f0b866' : '#d6e4f5', fontWeight: l.startsWith('##') ? 700 : 500 }}>
            <TypeOn t={t} at={at} cps={70} caret={false} parts={[{ text: l }]} />
          </div>
        );
      })}
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={abs(130, 230)}>
        <WordPush justify="flex-start" t={t} style={head(128)} words={[{ text: 'One', at: 0 }, { text: 'click.', at: B(0.5) }]} />
        <WordPush justify="flex-start" t={t} style={head(128)} words={[{ text: 'Any', at: B(1) }, { text: 'AI.', at: B(1.5), style: grad }]} />
      </div>
      <div style={abs(130, 600, { opacity: segIn, transform: `translateY(${(1 - segIn) * 30}px)` })}>
        <div style={{ ...card({ borderRadius: 99 }), position: 'relative', display: 'flex', padding: 8 }}>
          <div style={{ position: 'absolute', left: 8 + x, top: 8, width: 190, height: 70, borderRadius: 99, background: C.text }} />
          {TOOLS.map((tool, i) => (
            <div key={tool} style={{ position: 'relative', width: 190, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 28, color: Math.round(x / 190) === i ? '#fff' : C.text }}>{tool}</div>
          ))}
        </div>
      </div>
      <div style={abs(130, 740, { opacity: spr(t, B(6.2), 14) })}>
        <div style={{ height: 96, padding: '0 44px', borderRadius: 24, display: 'flex', alignItems: 'center', gap: 16, fontFamily: SANS, fontWeight: 700, fontSize: 36, color: '#fff', background: copied ? C.green : C.accent, boxShadow: `0 20px 50px ${copied ? 'rgba(38,143,83,0.35)' : 'rgba(26,120,214,0.35)'}`, transform: `scale(${pulse})` }}>
          {copied ? '✓  Copied for Claude' : 'Copy context'}
        </div>
      </div>
      <div style={abs(1040, 200, { opacity: Math.min(1, cardIn * 1.5), transform: `translateY(${(1 - cardIn) * 300}px)` })}>
        <Tilt t={t} rx={6} ry={-18} rz={1.5}>
          {codeCard({ transform: `scale(${pulse})` })}
        </Tilt>
      </div>
      {copied && ghost < 1 ? (
        <div style={abs(1040, 200, { opacity: 0.6 * (1 - ghost), transform: `translate(${ghost * 260}px, ${-ghost * 300}px) scale(${1 - ghost * 0.5}) rotate(${ghost * 8}deg)` })}>{codeCard({ opacity: 0.7 })}</div>
      ) : null}
      <Cursor t={t} path={COPY_CURSOR(B)} />
    </AbsoluteFill>
  );
};

const INJECT_LINES = ['Project: habit-app · Habit tracker for remote teams', 'Stack: Next.js, Supabase, Stripe', 'Progress: sign-up and billing work; next, team invites', 'Decided: Supabase auth, because RLS on every table', 'Open loop: pricing page'];

// 8 beats: Ctrl, Shift, S on three half-beats, the context lands on beat 4
const INJECT_KEYS = [1.5, 2, 2.5];
const INJECT_LAND = 3.8;

const Inject = ({ t, B }: Ctx) => {
  const up = lerp(t, B(3), B(3.6), 0, 1, INOUT);
  const win = spr(t, B(3.1), 16, 0.9);
  const lit = lerp(t, B(INJECT_LAND), B(INJECT_LAND + 0.3));
  const final = lerp(t, B(6), B(6.5));
  const lineAt = (i: number) => B(INJECT_LAND + 0.1 + i * 0.3);
  return (
    <AbsoluteFill>
      <div style={centerRow(150 - up * 120, { opacity: 1 - up })}>
        <WordPush t={t} style={head(84)} words={[{ text: 'In', at: 0 }, { text: 'any', at: B(0.25) }, { text: 'AI', at: B(0.5) }, { text: 'chat,', at: B(0.75) }, { text: 'press', at: B(1), style: grad }]} />
      </div>
      <div style={centerRow(400 - up * 330, { gap: 26, alignItems: 'center', transform: `scale(${1 - up * 0.45})`, opacity: 1 - final, filter: `blur(${final * 10}px)` })}>
        <Keycap t={t} at={B(INJECT_KEYS[0])} label="Ctrl" font={SANS} width={230} lit={C.text} ink={C.text} />
        <div style={{ ...head(70, { color: MUTED }), opacity: lerp(t, B(INJECT_KEYS[0]), B(INJECT_KEYS[0]) + 0.15) }}>+</div>
        <Keycap t={t} at={B(INJECT_KEYS[1])} label="Shift" font={SANS} width={270} lit={C.text} ink={C.text} />
        <div style={{ ...head(70, { color: MUTED }), opacity: lerp(t, B(INJECT_KEYS[1]), B(INJECT_KEYS[1]) + 0.15) }}>+</div>
        <Keycap t={t} at={B(INJECT_KEYS[2])} label="S" font={SANS} width={150} lit={C.accent} ink={C.text} />
      </div>
      <div style={abs(330, 250 + (1 - win) * 700, { opacity: Math.min(1, win * 1.6) })}>
        <div style={{ ...card({ borderRadius: 30 }), width: 1260, height: 640, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 64, background: '#f3efe6', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px' }}>
            {['#e66a5c', '#e8b64c', '#5cb85c'].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
            <div style={{ marginLeft: 20, fontFamily: MONO, fontSize: 20, color: MUTED }}>your AI chat</div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 48, color: '#b9c0cb' }}>What are we building today?</div>
          <div style={abs(0, 0, { position: 'relative', margin: '0 40px 40px', borderRadius: 26, border: `2px solid ${lit > 0 ? C.accent : C.border}`, boxShadow: `0 0 0 ${8 * lit}px rgba(26,120,214,0.12)`, padding: '24px 30px', minHeight: 90, boxSizing: 'border-box', background: '#fff' })}>
            <div style={{ position: 'absolute', right: 24, top: -30, display: 'flex', alignItems: 'center', gap: 10, ...card({ borderRadius: 99 }), padding: '8px 18px 8px 10px', opacity: spr(t, B(INJECT_LAND - 0.1), 12), transform: `scale(${0.7 + 0.3 * spr(t, B(INJECT_LAND - 0.1), 12)})` }}>
              <Img src={MARK()} style={{ width: 38, height: 38, objectFit: 'contain' }} />
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.1em', color: C.accent }}>CONTEXT ADDED</div>
            </div>
            {t < lineAt(0) ? (
              <div style={{ fontFamily: SANS, fontSize: 30, color: '#a5adba' }}>Message…</div>
            ) : (
              INJECT_LINES.map((l, i) => (
                <div key={i} style={{ fontFamily: MONO, fontSize: 25, lineHeight: 1.55, color: C.text, opacity: lerp(t, lineAt(i), lineAt(i) + 0.2), transform: `translateX(${(1 - lerp(t, lineAt(i), lineAt(i) + 0.3)) * -30}px)` }}>{l}</div>
              ))
            )}
          </div>
        </div>
      </div>
      <div style={centerRow(110, { opacity: final, transform: `translateY(${(1 - final) * 30}px)` })}>
        <div style={head(76)}>
          Your project, <span style={serifEm}>already in the prompt.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CAPTURE_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(1), x: 1400, y: 1060 },
  { t: B(2.2), x: 1660, y: 255 },
  { t: B(2.5), x: 1660, y: 255, click: true },
  { t: B(4), x: 1720, y: 400 },
];

const Capture = ({ t, B }: Ctx) => {
  const collapse = lerp(t, B(2.8), B(3.5), 0, 1, INOUT);
  const scan = lerp(t, B(3.7), B(4.4), 0, 1, INOUT);
  const fly = lerp(t, B(5.4), B(6.4), 0, 1, INOUT);
  const plus = spr(t, B(6.4), 10);
  const bubbles = [
    { me: true, text: 'Should we move auth to another provider?' },
    { me: false, text: 'Keep Supabase auth: every table relies on RLS.' },
    { me: true, text: 'Deal. Env has STRIPE_KEY=sk_live_51Hx9QaZ' },
  ];
  return (
    <AbsoluteFill>
      <div style={abs(130, 230)}>
        <WordPush justify="flex-start" t={t} style={head(92)} words={[{ text: 'Done', at: 0 }, { text: 'chatting?', at: B(0.5) }]} />
        <WordPush justify="flex-start" t={t} style={head(92)} words={[{ text: 'Capture', at: B(1.5) }, { text: 'it', at: B(1.75) }, { text: 'back.', at: B(2), style: serifEm }]} />
        <Reveal t={t} at={B(4.4)} y={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 34, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.1em', color: C.green }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✓</div>
            SECRETS REDACTED
          </div>
        </Reveal>
      </div>
      {/* the Decisions bucket the capture lands in */}
      <div style={abs(130, 760, { opacity: spr(t, B(4.6), 14), transform: `scale(${1 + plus * 0.06 * Math.max(0, 1 - (t - B(6.4)) / 0.4)})` })}>
        <div style={{ ...card({ borderRadius: 24 }), width: 560, padding: '24px 30px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16, border: `2px solid ${plus > 0.2 ? C.gold : C.border}` }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: C.gold }} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.text }}>Decisions</div>
          <div style={{ marginLeft: 'auto', fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.gold, opacity: plus, transform: `translateY(${(1 - plus) * 20}px)` }}>+1</div>
        </div>
      </div>
      <div style={abs(900, 170, { opacity: spr(t, 0, 16) })}>
        <Tilt t={t} rx={4} ry={-12} float={0.6}>
          <div style={{ ...card({ borderRadius: 30 }), width: 900, height: 700, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: 70, background: '#f3efe6', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
              {['#e66a5c', '#e8b64c', '#5cb85c'].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, background: t >= B(2.5) ? C.accent : '#fff', color: t >= B(2.5) ? '#fff' : C.text, border: `1px solid ${C.border}`, borderRadius: 99, padding: '6px 18px 6px 8px', fontFamily: SANS, fontWeight: 700, fontSize: 22 }}>
                <Img src={MARK()} style={{ width: 36, height: 36, objectFit: 'contain' }} /> Capture chat
              </div>
            </div>
            <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 22, transformOrigin: '50% 30%', transform: `scaleY(${1 - collapse * 0.85})`, opacity: 1 - collapse }}>
              {bubbles.map((b, i) => (
                <Reveal key={i} t={t} at={B(i * 0.4)} y={20} dur={0.4} style={{ alignSelf: b.me ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: 640, padding: '20px 26px', borderRadius: 24, fontFamily: SANS, fontSize: 28, lineHeight: 1.35, background: b.me ? C.text : '#f3efe6', color: b.me ? '#fff' : C.text }}>{b.text}</div>
                </Reveal>
              ))}
            </div>
            {/* after the capture: the chat now lives in the brain */}
            <div style={abs(0, 70, { width: 900, height: 630, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: lerp(t, B(5.8), B(6.4)) })}>
              <Img src={MARK()} style={{ width: 150, height: 150, objectFit: 'contain', transform: `scale(${0.6 + 0.4 * spr(t, B(5.8), 11)})` }} />
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, color: C.text }}>Saved to your Project Brain</div>
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.1em', color: MUTED }}>1 DECISION · 0 SECRETS KEPT</div>
            </div>
          </div>
        </Tilt>
      </div>
      {t >= B(3.1) ? (
        <div style={abs(1000 - fly * 760, 300 + fly * 470, { opacity: 1 - lerp(t, B(6.2), B(6.5)), transform: `scale(${(0.9 + 0.1 * spr(t, B(3.1), 13)) * (1 - fly * 0.55)})`, transformOrigin: '0 0' })}>
          <div style={{ ...card({ borderRadius: 26 }), width: 700, padding: '30px 34px', boxSizing: 'border-box', border: `2px solid ${C.gold}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: '0.14em', color: C.gold, marginBottom: 14 }}>DECISION · FROM CHAT</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.text }}>Keep Supabase auth</div>
            <div style={{ fontFamily: SANS, fontSize: 26, color: MUTED, margin: '6px 0 16px' }}>Because every table relies on RLS</div>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.text, background: '#f6f3ec', borderRadius: 12, padding: '12px 16px' }}>
              STRIPE_KEY=
              <span style={{ background: scan > 0.6 ? 'rgba(38,143,83,0.15)' : 'transparent', color: scan > 0.6 ? C.green : C.red, fontWeight: 700 }}>{scan > 0.6 ? '[redacted]' : 'sk_live_51Hx9QaZ'}</span>
            </div>
            {scan > 0 && scan < 1 ? <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${scan * 110 - 5}%`, width: 60, background: 'linear-gradient(90deg, transparent, rgba(38,143,83,0.35), transparent)' }} /> : null}
          </div>
        </div>
      ) : null}
      <Cursor t={t} path={CAPTURE_CURSOR(B)} />
    </AbsoluteFill>
  );
};

const INPUTS = ['Memory filled', 'Sessions logged, and how recent', 'Todos done', 'Milestones hit', 'Progress updates', 'Traction'];

const Score = ({ t, B }: Ctx) => {
  const v = count(t, B(0.6), B(4.6), 0, 82);
  const ringIn = spr(t, 0, 14, 0.8);
  const done = t >= B(4.6) ? spr(t, B(4.6), 9) : 0;
  return (
    <AbsoluteFill>
      <div style={abs(330 - 0, 330, { width: 460, height: 460, opacity: ringIn, transform: `scale(${(0.8 + 0.2 * ringIn) * (1 + 0.05 * done * Math.max(0, 1 - (t - B(4.6)) / 0.4))})` })}>
        <Ring value={v} size={460} stroke={30} color={C.accent} track="rgba(19,35,59,0.08)" />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 170, letterSpacing: '-0.05em', color: C.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{v}</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.24em', color: MUTED, marginTop: 8 }}>SHIP SCORE</div>
        </div>
      </div>
      <div style={abs(330, 210, { width: 460, display: 'flex', justifyContent: 'center' })}>
        <Reveal t={t} at={B(0.2)} y={16}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: MUTED }}>MOMENTUM · 0–100</div>
        </Reveal>
      </div>
      <div style={abs(1000, 170)}>
        <WordPush justify="flex-start" t={t} style={head(62)} words={[{ text: 'Built', at: 0 }, { text: 'from', at: B(0.25) }, { text: 'what', at: B(0.5) }, { text: 'you', at: B(0.75) }, { text: 'did.', at: B(1) }]} />
        <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {INPUTS.map((label, i) => {
            const at = B(1.2 + i * 0.5);
            const p = spr(t, at, 13);
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 60}px)` }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, transform: `scale(${0.4 + 0.6 * p})` }}>✓</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 38, color: C.text, letterSpacing: '-0.01em' }}>{label}</div>
              </div>
            );
          })}
        </div>
        <Reveal t={t} at={B(5.4)} y={24}>
          <div style={{ ...head(64), marginTop: 36 }}>
            <span style={serifEm}>Never an AI guess.</span>
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

const Crown = ({ t, B }: Ctx) => {
  const cardIn = spr(t, B(1.2), 16, 0.9);
  const todos = ['Ship team invites', 'Reply to 3 users', 'Lock pricing page'];
  const chip = (label: string) => <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.14em', color: C.gold, border: `1.5px solid ${C.gold}`, borderRadius: 99, padding: '5px 14px', marginRight: 16, verticalAlign: 4 }}>{label}</span>;
  return (
    <AbsoluteFill>
      <div style={centerRow(70)}>
        <Reveal t={t} at={0} y={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.22em', color: C.gold }}>
            <span style={{ fontSize: 30 }}>♛</span> PRO · THE CROWN
          </div>
        </Reveal>
      </div>
      <div style={centerRow(130)}>
        <WordPush t={t} style={head(96)} words={[{ text: 'Answers', at: B(0.25) }, { text: 'like', at: B(0.6) }, { text: 'a', at: B(0.8) }, { text: 'cofounder.', at: B(1), style: serifEm }]} />
      </div>
      <div style={abs(300, 320 + (1 - cardIn) * 400, { opacity: Math.min(1, cardIn * 1.5) })}>
        <Tilt t={t} rx={7} ry={0} float={0.5}>
          <div style={{ ...card({ borderRadius: 36 }), width: 1320, padding: '40px 52px', boxSizing: 'border-box', fontSize: 38 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 60, height: 60, borderRadius: 30, background: 'linear-gradient(135deg, #f0b866, #c08a2b)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>♛</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.text }}>Flayel</div>
              <div style={{ fontFamily: SANS, fontSize: 24, color: MUTED }}>read your memory</div>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 40, lineHeight: 1.45, color: C.text, minHeight: 50 }}>
              {t >= B(2) ? chip('REMARK') : null}
              <TypeOn t={t} at={B(2)} cps={72} caret={false} parts={[{ text: 'Pricing got decided twice and shipped neither time.' }]} />
            </div>
            <div style={{ fontFamily: SANS, fontSize: 40, lineHeight: 1.45, color: C.text, marginTop: 14, minHeight: 50 }}>
              {t >= B(3.6) ? chip('MISSED POTENTIAL') : null}
              <TypeOn t={t} at={B(3.6)} cps={72} caret={false} parts={[{ text: 'Three users asked for team invites.' }]} />
            </div>
            <div style={{ marginTop: 26, borderTop: `1px solid ${C.border}`, paddingTop: 22, opacity: lerp(t, B(5), B(5.3)) }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: '0.18em', color: MUTED, marginBottom: 14 }}>THIS WEEK</div>
              <div style={{ display: 'flex', gap: 22 }}>
                {todos.map((td, i) => {
                  const at = B(5.3 + i * 0.5);
                  const tick = t >= at + B(0.5);
                  return (
                    <Reveal key={td} t={t} at={at} y={16} dur={0.35}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.text, background: '#f6f3ec', borderRadius: 18, padding: '18px 26px', whiteSpace: 'nowrap' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, border: `2px solid ${tick ? C.green : '#c3b9a6'}`, background: tick ? C.green : 'transparent', color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tick ? '✓' : ''}</div>
                        {td}
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </Tilt>
      </div>
    </AbsoluteFill>
  );
};

const OrbitScene = ({ t, B }: Ctx) => {
  const cx = 960;
  const cy = 610;
  const hub = spr(t, 0, 12);
  const pos = (i: number) => {
    const a = -Math.PI / 2 + 0.5 + (i / 4) * Math.PI * 2 + t * 0.32;
    return { x: cx + Math.cos(a) * 560, y: cy + Math.sin(a) * 250, depth: (Math.sin(a) + 1) / 2 };
  };
  return (
    <AbsoluteFill>
      <div style={centerRow(80)}>
        <WordPush t={t} style={head(92)} words={[{ text: 'One', at: 0 }, { text: 'memory.', at: B(0.5) }, { text: 'Every', at: B(1.5) }, { text: 'AI', at: B(1.75) }, { text: 'tool.', at: B(2), style: grad }]} />
      </div>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <ellipse cx={cx} cy={cy} rx={560} ry={250} fill="none" stroke="rgba(19,35,59,0.12)" strokeWidth={2} strokeDasharray="6 10" opacity={hub} />
        <ellipse cx={cx} cy={cy} rx={330} ry={150} fill="none" stroke="rgba(19,35,59,0.08)" strokeWidth={2} opacity={hub} />
        {TOOLS.map((_, i) => {
          const p = pos(i);
          const at = B(3 + i * 0.75);
          const k = lerp(t, at, at + 0.4, 0, 1, INOUT);
          const on = t >= at;
          return (
            <g key={i} opacity={lerp(t, B(2.6), B(3))}>
              <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={on ? C.accent : 'rgba(19,35,59,0.12)'} strokeWidth={on ? 4 : 2} />
              {k > 0 && k < 1 ? <circle cx={cx + (p.x - cx) * k} cy={cy + (p.y - cy) * k} r={11} fill={C.accent} /> : null}
            </g>
          );
        })}
      </svg>
      {TOOLS.map((tool, i) => {
        const p = pos(i);
        const appear = spr(t, B(1 + i * 0.5), 12);
        const arrived = t >= B(3 + i * 0.75) + 0.4;
        return (
          <div key={tool} style={abs(p.x, p.y, { transform: `translate(-50%, -50%) scale(${(0.86 + p.depth * 0.2) * appear})`, opacity: Math.min(1, appear * 1.5), zIndex: Math.round(p.depth * 10) })}>
            <div style={{ ...card({ borderRadius: 99 }), padding: '20px 34px', display: 'flex', alignItems: 'center', gap: 14, border: `2px solid ${arrived ? C.accent : C.border}`, fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.text, whiteSpace: 'nowrap' }}>
              {tool}
              {arrived ? <span style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.1em', color: C.accent }}>✓ CONTEXT</span> : null}
            </div>
          </div>
        );
      })}
      <div style={abs(cx - 150, cy - 150, { width: 300, height: 300, borderRadius: 150, background: '#fff', boxShadow: '0 30px 90px rgba(26,120,214,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${hub * (1 + 0.03 * Math.sin(t * 6.4))})`, zIndex: 5 })}>
        <Img src={MARK()} style={{ width: 150, height: 150, objectFit: 'contain' }} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.16em', color: C.text, marginTop: 6 }}>PROJECT BRAIN</div>
      </div>
    </AbsoluteFill>
  );
};

const END_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(7.6), x: 1500, y: 1060 },
  { t: B(8.8), x: 1010, y: 770 },
  { t: B(9), x: 1010, y: 770, click: true },
  { t: B(10.4), x: 1420, y: 1000 },
];

const End = ({ t, B }: Ctx) => {
  const lift = lerp(t, B(3), B(3.6), 0, 1, INOUT);
  const out = lerp(t, B(6), B(6.6), 0, 1, INOUT);
  const logo = spr(t, B(6.2), 11, 0.8);
  const sweep = lerp(t, B(6.6), B(8), -0.4, 1.4, INOUT);
  const clicked = t >= B(9);
  const box: React.CSSProperties = { position: 'absolute', left: 960 - 110, top: 250, width: 220, height: 220 };
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - out, filter: `blur(${out * 14}px)` }}>
        <div style={centerRow(430 - lift * 110)}>
          <div style={head(112, { color: lift > 0.5 ? '#9aa6b6' : C.text })}>
            <TypeOn t={t} at={0.1} cps={30} caret={lift < 0.1 ? C.accent : false} parts={[{ text: 'Your AI tools forget.' }]} />
          </div>
        </div>
        <div style={centerRow(480)}>
          <div style={head(132)}>
            <TypeOn t={t} at={B(3.6)} cps={26} caret={C.accent} caretOff={B(6)} parts={[{ text: 'Flayel ' }, { text: 'remembers.', style: serifEm }]} />
          </div>
        </div>
      </div>
      {t >= B(6.1) ? (
        <>
          <Img src={MARK()} style={{ ...box, objectFit: 'contain', transform: `scale(${logo}) rotate(${(1 - logo) * -20}deg)`, filter: 'drop-shadow(0 30px 50px rgba(19,35,59,0.3))' }} />
          <div style={{ ...box, ...birdMask, transform: `scale(${logo})` }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${sweep * 100 - 14}%, rgba(255,255,255,0.95) ${sweep * 100}%, transparent ${sweep * 100 + 14}%)` }} />
          </div>
          <div style={centerRow(510)}>
            <Reveal t={t} at={B(6.6)} y={24}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 64, letterSpacing: '0.42em', color: C.text, marginLeft: '0.42em' }}>FLAYEL</div>
            </Reveal>
          </div>
          <div style={centerRow(640)}>
            <Reveal t={t} at={B(7.2)} y={24}>
              <div style={{ ...card({ borderRadius: 99 }), padding: '22px 60px', fontFamily: SANS, fontWeight: 700, fontSize: 52, letterSpacing: '-0.01em', color: clicked ? '#fff' : C.text, background: clicked ? C.accent : '#fff', transform: `scale(${clicked ? 1 + 0.05 * Math.max(0, 1 - (t - B(9)) / 0.3) : 1})` }}>flayel.com</div>
            </Reveal>
          </div>
          <div style={centerRow(790)}>
            <Reveal t={t} at={B(9.6)} y={16}>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 36, color: MUTED }}>Free to start. Your data stays yours.</div>
            </Reveal>
          </div>
          <Cursor t={t} path={END_CURSOR(B)} show={[B(7.5), B(10.4)]} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = {
  hook: Hook,
  forget: Forget,
  slam: Slam,
  remember: Remember,
  brain: Brain,
  copy: Copy,
  inject: Inject,
  capture: Capture,
  score: Score,
  crown: Crown,
  orbit: OrbitScene,
  end: End,
};

// ------------------------------------------------------------------ sound design

// every effect sits on the same beat clock as the picture it belongs to
const sfx = (): Sfx[] => {
  const at = (id: string, beat: number) => sceneStart(tl, id) + sceneBeats(tl, id)(beat);
  const clicks = (id: string, path: (B: (n: number) => number) => CursorPt[]) =>
    clicksOf(path(sceneBeats(tl, id))).map((c) => ({ at: sceneStart(tl, id) + c, src: 'mouse-click' as const, vol: 0.6 }));
  return [
    ...transitionSfx(tl),
    ...HOOK_SWITCHES.map((x) => ({ at: at('hook', x / HB), src: 'switch' as const, vol: 0.18 })),
    ...SLAM_WORDS.map((w) => ({ at: at('slam', w.at), src: 'switch' as const, vol: 0.3 })),
    ...SLAM_TOOLS_AT.map((x) => ({ at: at('slam', x), src: 'mouse-click' as const, vol: 0.3 })),
    { at: at('slam', 7.2), src: 'whoosh', vol: 0.45 },
    { at: at('remember', 0), src: 'whip', vol: 0.5 },
    { at: at('remember', 0.3), src: 'ding', vol: 0.35 },
    ...clicks('brain', BRAIN_CURSOR),
    ...[2, 3, 4, 5, 6].map((x) => ({ at: at('copy', x), src: 'switch' as const, vol: 0.25 })),
    ...clicks('copy', COPY_CURSOR),
    { at: at('copy', 8.1), src: 'ding', vol: 0.3 },
    ...INJECT_KEYS.map((x) => ({ at: at('inject', x), src: 'switch' as const, vol: 0.45 })),
    ...clicks('capture', CAPTURE_CURSOR),
    { at: at('capture', 2.8), src: 'page-turn', vol: 0.5 },
    { at: at('capture', 6.4), src: 'ding', vol: 0.25 },
    { at: at('score', 4.6), src: 'ding', vol: 0.35 },
    ...clicks('end', END_CURSOR),
    { at: at('end', 6.2), src: 'whoosh', vol: 0.45 },
  ];
};

export const FlayelLaunch: React.FC = () => (
  <AbsoluteFill style={{ background: '#f6f3ec' }}>
    <Backdrop />
    {tl.scenes.map((s, i) => (
      <Scene key={s.id} tl={tl} index={i} render={RENDER[s.id]} />
    ))}
    <Badge />
    <Soundtrack tl={tl} sfx={sfx()} />
  </AbsoluteFill>
);

export const flayelTimeline = tl;
