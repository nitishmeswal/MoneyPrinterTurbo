/* Story scenes, part two: chats, tabs, blueprints, clocks, towers, blanks. */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, GRADIENT, MONO, SANS, SERIF } from './brand';
import { Burst, Canvas, Heading, Spec, capAt, clamp, gradText, lerp, pop, rnd, shake, useT, when } from './fx';
import { CARD_SHADOW, INK, Logo } from './stage';
import { Pointer, Win } from './stories';
import { Word } from './types';

const tone = (n?: string) => (n && (C as Record<string, string>)[n]) || C.accent;

// ------------------------------------------------------------------ sidebar

const CHAT_TITLES = [
  'Fix login redirect', 'Pricing page copy', 'Untitled chat', 'Supabase RLS help', 'Why is build failing', 'Landing hero ideas',
  'Stripe test mode', 'Rename the app?', 'Untitled chat', 'Email templates', 'CSS grid question', 'Onboarding flow v3',
  'Untitled chat', 'Refactor invoices', 'Cron jobs', 'Dark mode toggle', 'Untitled chat', 'Deploy to Vercel', 'Seed data script', 'API rate limits',
];

/** Chat history racing past; the one great chat scrolls away with the rest. */
export const SidebarScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const off = 60 * t + 210 * t * t;
  const speed = 60 + 420 * t;
  const titleAt = when(words, s.at, 1.6);
  const title = pop(t, titleAt, 11);
  const rows = [...CHAT_TITLES.slice(0, 4), '★ ' + (s.gold ?? 'The chat that solved billing'), ...CHAT_TITLES.slice(4), ...CHAT_TITLES, ...CHAT_TITLES];
  return (
    <Canvas>
      <Win title="Chats" style={{ left: 140, top: 0, width: 640, height: 1060 }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 20, right: 20, top: 20 - off, filter: `blur(${Math.min(5, speed / 300)}px)` }}>
            {rows.map((r, i) => {
              const gold = r.startsWith('★');
              return (
                <div key={i} style={{ padding: '22px 22px', borderRadius: 16, marginBottom: 8, background: gold ? '#fff3d6' : i % 7 === 0 ? '#f4f1ea' : 'transparent', border: gold ? `3px solid ${C.gold}` : '3px solid transparent' }}>
                  <div style={{ fontSize: 32, fontWeight: gold ? 800 : 600, color: gold ? C.amber : C.text }}>{r}</div>
                  <div style={{ fontSize: 22, color: '#a39a8a', marginTop: 4 }}>{`${1 + ((i * 3) % 11)} weeks ago`}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Win>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', opacity: Math.min(1, title * 1.5), transform: `scale(${1.3 - title * 0.3})` }}>
        <div style={{ background: 'rgba(255,255,255,0.94)', borderRadius: 34, padding: '30px 50px', boxShadow: CARD_SHADOW, textAlign: 'center' }}>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 104, lineHeight: 1 }}>{s.title ?? 'Gone.'}</div>
          {s.sub ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: INK.muted, marginTop: 12 }}>{s.sub}</div> : null}
        </div>
      </div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ redact

/** A captured chat: secrets get blacked out, what you learned glows and stays. */
export const RedactScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const at = when(words, s.at, 0.6);
  const keepAt = when(words, s.keepAt, at + 1.2);
  const privAt = when(words, s.privAt, keepAt + 0.8);
  const lines: Spec[] = s.lines ?? [
    { text: 'You: Webhooks or polling for payments?' },
    { text: 'AI: Webhooks. Verify every signature.', keep: true },
    { key: 'STRIPE_SECRET=', secret: 'sk_live_51Hx9fQ2mZ' },
    { key: 'DB_PASSWORD=', secret: 'hunter2-prod' },
    { text: 'Decided: retry failed webhooks 3 times', keep: true },
  ];
  let secretIndex = 0;
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={0} kicker="Capturing to your Project Brain" /></div>
      <Win title="Captured chat" style={{ left: 0, top: 90, width: 920, height: 900 }}>
        <div style={{ padding: '30px 34px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          {lines.map((ln, i) => {
            const appear = pop(t, 0.1 + i * 0.12, 13);
            if (ln.secret) {
              const k = secretIndex++;
              const bar = lerp(t, at + k * 0.18, at + k * 0.18 + 0.35, 0, 1, Easing.inOut(Easing.cubic));
              const lock = pop(t, privAt + k * 0.15, 10);
              return (
                <div key={i} style={{ fontFamily: MONO, fontSize: 34, display: 'flex', alignItems: 'center', gap: 6, opacity: appear, background: '#fdf1ef', borderRadius: 16, padding: '18px 20px' }}>
                  <span style={{ color: C.red, fontWeight: 700 }}>{ln.key}</span>
                  <span style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{ color: C.text }}>{ln.secret}</span>
                    <span style={{ position: 'absolute', left: -4, top: -4, bottom: -4, width: `calc(${bar * 100}% + 8px)`, background: C.text, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 700, letterSpacing: '0.2em', overflow: 'hidden' }}>{bar > 0.9 ? 'REDACTED' : ''}</span>
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 40, opacity: lock, transform: `scale(${0.4 + lock * 0.6})` }}>🔒</span>
                </div>
              );
            }
            const keep = ln.keep ? lerp(t, keepAt + i * 0.05, keepAt + i * 0.05 + 0.4) : 0;
            return (
              <div key={i} style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.3, opacity: appear, position: 'relative', borderRadius: 16, padding: '18px 20px', background: `rgba(38,143,83,${keep * 0.14})`, border: `3px solid rgba(38,143,83,${keep})` }}>
                {ln.text}
                {ln.keep ? <span style={{ position: 'absolute', right: -10, top: -18, background: C.green, color: 'white', fontSize: 22, fontWeight: 800, borderRadius: 999, padding: '6px 14px', opacity: keep, transform: `scale(${0.5 + keep * 0.5})` }}>✓ KEPT</span> : null}
              </div>
            );
          })}
        </div>
      </Win>
    </Canvas>
  );
};

// ------------------------------------------------------------------ tabs

/** Forty open tabs; the bird plucks the one worth keeping and a thought, into the project. */
export const TabsScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const saveAt = capAt(s, when(words, s.saveAt, 0.8), 3.0);
  const jotAt = capAt(s, Math.max(saveAt + 1.2, when(words, s.jotAt, saveAt + 1.6)), 1.6);
  const n = Math.min(40, Math.round(6 + t * 14));
  const tabW = 900 / n;
  const fly1 = lerp(t, saveAt + 0.4, saveAt + 1.1, 0, 1, Easing.inOut(Easing.cubic));
  const bird = lerp(t, saveAt - 0.4, saveAt + 0.2, 0, 1, Easing.out(Easing.cubic));
  const note = pop(t, jotAt, 12);
  const fly2 = lerp(t, jotAt + 0.9, jotAt + 1.5, 0, 1, Easing.inOut(Easing.cubic));
  const count = (fly1 >= 1 ? 1 : 0) + (fly2 >= 1 ? 1 : 0);
  const typed = (s.thought ?? '').slice(0, Math.max(0, Math.floor((t - jotAt - 0.1) * 40)));
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 920, height: 720, background: '#fff', borderRadius: 26, boxShadow: CARD_SHADOW, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        <div style={{ height: 64, background: '#ece6da', display: 'flex', alignItems: 'flex-end', padding: '0 10px', gap: 2, overflow: 'hidden' }}>
          {Array.from({ length: n }).map((_, i) => <div key={i} style={{ width: tabW - 2, height: 46, borderRadius: '10px 10px 0 0', background: i === 2 ? '#fff' : '#ddd5c6', flex: 'none' }} />)}
        </div>
        <div style={{ position: 'absolute', right: 20, top: 76, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: n >= 40 ? C.red : C.amber }}>{n} tabs</div>
        <div style={{ padding: '70px 50px', opacity: 1 - fly1 * 0.5 }}>
          <div style={{ fontFamily: MONO, fontSize: 22, color: C.text2, letterSpacing: '0.16em' }}>GEMINI · RESEARCH</div>
          <div style={{ fontSize: 54, fontWeight: 800, marginTop: 14, lineHeight: 1.1 }}>{s.page ?? 'How freelancers chase late invoices'}</div>
          {[92, 86, 95, 70, 88, 60].map((w, i) => <div key={i} style={{ height: 22, borderRadius: 11, background: '#ece6da', marginTop: 26, width: `${w}%` }} />)}
        </div>
      </div>
      {/* the saved page shrinking into the folder */}
      {fly1 > 0 && fly1 < 1 ? <div style={{ position: 'absolute', left: interpolate(fly1, [0, 1], [60, 300]), top: interpolate(fly1, [0, 1], [120, 900]), width: interpolate(fly1, [0, 1], [800, 120]), height: interpolate(fly1, [0, 1], [560, 90]), background: '#fff', border: `3px solid ${C.accent}`, borderRadius: 18, boxShadow: CARD_SHADOW }} /> : null}
      <div style={{ position: 'absolute', left: interpolate(bird, [0, 1], [1000, 640]), top: interpolate(bird, [0, 1], [900, 60]) + Math.sin(t * 6) * 6, opacity: lerp(t, saveAt - 0.4, saveAt - 0.2) * lerp(t, jotAt + 1.5, jotAt + 1.9, 1, 0), transform: `rotate(${(1 - bird) * -25}deg)` }}><Logo size={150} /></div>
      {/* the thought note */}
      <div style={{ position: 'absolute', left: interpolate(fly2, [0, 1], [120, 330]), top: interpolate(fly2, [0, 1], [300, 920]), width: 680, opacity: Math.min(1, note * 1.5) * (fly2 >= 1 ? 0 : 1), transform: `rotate(${-3 + fly2 * 3}deg) scale(${(0.6 + note * 0.4) * (1 - fly2 * 0.82)})`, transformOrigin: 'left top' }}>
        <div style={{ background: '#fff2c2', borderRadius: 10, padding: '30px 34px', boxShadow: CARD_SHADOW }}>
          <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.amber, letterSpacing: '0.16em' }}>THOUGHT · JOTTED BY THE BIRD</div>
          <div style={{ fontSize: 40, fontWeight: 700, marginTop: 10, lineHeight: 1.25, minHeight: 100 }}>{typed}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 180, top: 870, width: 560, height: 170, background: '#fff', borderRadius: 26, boxShadow: `${CARD_SHADOW}, 0 0 0 ${count ? Math.max(0, 8 - (t - (fly2 >= 1 ? jotAt + 1.5 : saveAt + 1.1)) * 16) : 0}px rgba(58,159,240,0.3)`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px', borderTop: `10px solid ${C.accent}` }}>
        <div style={{ fontSize: 64 }}>📁</div>
        <div>
          <div style={{ fontSize: 38, fontWeight: 800 }}>Beam · your project</div>
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.text2 }}>{count} saved</div>
        </div>
      </div>
      <Burst t={t} at={saveAt + 1.1} x={460} y={950} size={420} />
      <Burst t={t} at={jotAt + 1.5} x={460} y={950} size={420} color={C.gold} />
    </Canvas>
  );
};

// ------------------------------------------------------------------ handoff

/** ChatGPT above, Claude below, the Project Brain between: capture up, inject down. */
export const HandoffScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const at = capAt(s, when(words, s.at, 0.8), 2.2);
  const capture = s.phase !== 'inject';
  const fly = lerp(t, at, at + 0.9, 0, 1, Easing.inOut(Easing.cubic));
  const pulse = interpolate(t, [at + 0.85, at + 1.0, at + 1.6], [0, 1, 0], clamp);
  const chip = pop(t, at + 1.0, 11);
  const fromY = capture ? 210 : 520;
  const toY = capture ? 520 : 900;
  const px = 460 + Math.sin(fly * Math.PI) * 300;
  const py = interpolate(fly, [0, 1], [fromY, toY]);
  const ctx = ['# Project: Beam', 'Stack: Next.js · FastAPI · Postgres', 'Progress: webhooks done · retries next', 'Formatted for Claude'];
  return (
    <Canvas>
      <Win title="ChatGPT" style={{ left: 60, top: 0, width: 800, height: 340, opacity: capture ? 1 : 0.4 }} glow={capture ? interpolate(t, [at - 0.3, at, at + 0.6], [0, 1, 0], clamp) : 0}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ alignSelf: 'flex-end', background: C.accent, color: 'white', borderRadius: 20, padding: '14px 22px', fontSize: 30, fontWeight: 600 }}>Let's add Stripe webhooks.</div>
          <div style={{ alignSelf: 'flex-start', background: '#f4f1ea', borderRadius: 20, padding: '14px 22px', fontSize: 30, fontWeight: 600 }}>Step one done. Next: retries.</div>
        </div>
      </Win>
      <div style={{ position: 'absolute', left: 310, top: 400, width: 300, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#fff', borderRadius: 40, boxShadow: `${CARD_SHADOW}, 0 0 0 ${pulse * 18}px rgba(58,159,240,0.25)`, transform: `scale(${1 + pulse * 0.06})` }}>
        <Logo size={140} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.18em', color: C.accent }}>PROJECT BRAIN</div>
      </div>
      <Win title="Claude · New chat" style={{ left: 60, top: 700, width: 800, height: 380, opacity: capture ? 0.45 : 1 }} glow={!capture ? interpolate(t, [at + 0.7, at + 0.9, at + 1.6], [0, 1, 0], clamp) : 0}>
        <div style={{ margin: 22, padding: 22, borderRadius: 18, border: `3px solid ${!capture && t > at + 0.9 ? C.accent : C.border}`, minHeight: 230, background: '#fbfaf7' }}>
          {!capture && t > at + 0.9 ? ctx.map((l, i) => (
            <div key={i} style={{ fontFamily: MONO, fontSize: 27, lineHeight: 1.6, color: i === 0 ? C.accent : i === 3 ? C.green : C.text, fontWeight: i === 0 || i === 3 ? 700 : 500 }}>{l.slice(0, Math.max(0, Math.floor((t - at - 0.9 - i * 0.15) * 90)))}</div>
          )) : <div style={{ fontSize: 30, color: '#b6ae9f' }}>Message Claude…</div>}
        </div>
      </Win>
      {fly > 0 && fly < 1 ? (
        <div style={{ position: 'absolute', left: px - 150, top: py - 50, width: 300, background: '#fff', border: `3px solid ${capture ? C.green : C.accent}`, borderRadius: 18, padding: '14px 18px', boxShadow: CARD_SHADOW, transform: `rotate(${Math.sin(fly * Math.PI) * 10}deg) scale(${1 - Math.sin(fly * Math.PI) * 0.1})` }}>
          <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: capture ? C.green : C.accent }}>{capture ? 'SESSION' : 'CONTEXT'}</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{capture ? 'Webhooks · retries next' : 'Beam · full project'}</div>
        </div>
      ) : null}
      {fly > 0 && fly < 1 ? Array.from({ length: 6 }).map((_, i) => {
        const f2 = Math.max(0, fly - i * 0.05);
        return <div key={i} style={{ position: 'absolute', left: 460 + Math.sin(f2 * Math.PI) * 300 - 8, top: interpolate(f2, [0, 1], [fromY, toY]) - 8, width: 16, height: 16, borderRadius: 8, background: capture ? C.green : C.accent, opacity: 0.5 - i * 0.07 }} />;
      }) : null}
      <div style={{ position: 'absolute', left: 0, right: 0, top: capture ? 652 : 652, display: 'flex', justifyContent: 'center', opacity: chip, transform: `scale(${0.6 + chip * 0.4})` }}>
        <div style={{ background: capture ? C.green : C.accent, color: 'white', fontWeight: 800, fontSize: 30, borderRadius: 999, padding: '10px 26px', boxShadow: CARD_SHADOW }}>{capture ? '✓ Captured · secrets redacted' : '✓ Injected with Ctrl + Shift + S'}</div>
      </div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ blueprint

/** The architecture as a blueprint: wrong code bounces off, right code snaps in. */
export const BlueprintScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const slots: Spec[] = s.slots ?? [
    { label: 'STACK', value: 'Next.js · FastAPI · Postgres' },
    { label: 'DATA & AUTH', value: 'Postgres with row-level security' },
    { label: 'AI RULES', value: 'Models only called from the server' },
  ];
  const blocks: Spec[] = s.blocks ?? [];
  const phase = s.phase ?? 'draw';
  const W = 820;
  const H = 190;
  const per = 2 * (W + H);
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, top: 40, width: 920, height: 960, borderRadius: 30, background: '#0f4c8a', boxShadow: CARD_SHADOW, overflow: 'hidden', backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.08) 2px, transparent 2px)', backgroundSize: '46px 46px' }}>
        <div style={{ position: 'absolute', left: 40, top: 30, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.8)' }}>ARCHITECTURE · BEAM</div>
        {slots.map((sl, i) => {
          const at = phase === 'draw' ? when(words, sl.at, 0.4 + i * 0.9) : -1;
          const draw = at < 0 ? 1 : lerp(t, at, at + 0.7, 0, 1, Easing.inOut(Easing.cubic));
          const show = phase === 'clash' ? 0 : 1;
          const typed = at < 0 ? sl.value : sl.value.slice(0, Math.max(0, Math.floor((t - at - 0.3) * 50)));
          const y = 110 + i * 280;
          return (
            <div key={i} style={{ position: 'absolute', left: 50, top: y, width: W, height: H }}>
              <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
                <rect x={3} y={3} width={W - 6} height={H - 6} rx={18} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={4} strokeDasharray={phase === 'clash' ? '14 12' : `${per}`} strokeDashoffset={phase === 'clash' ? 0 : per * (1 - draw)} opacity={phase === 'clash' ? 0.35 : 1} />
              </svg>
              <div style={{ position: 'absolute', left: 30, top: 26, fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: '0.2em', color: '#9fd2ff', opacity: phase === 'clash' ? 0.4 : draw }}>{sl.label}</div>
              <div style={{ position: 'absolute', left: 30, top: 74, fontSize: 42, fontWeight: 800, color: 'white', opacity: show }}>{phase === 'clash' ? '' : typed}</div>
              {phase === 'clash' ? <div style={{ position: 'absolute', right: 34, top: 50, fontSize: 80, fontWeight: 800, color: 'rgba(255,255,255,0.25)' }}>?</div> : null}
            </div>
          );
        })}
        {blocks.map((b, i) => {
          const at = when(words, b.at, 0.5 + i * 0.9);
          const y0 = 110 + (b.slot ?? i) * 280 + 30;
          const drop = lerp(t, at - 0.35, at, 0, 1, Easing.in(Easing.quad));
          const fit = phase === 'fit';
          const after = t - at;
          const bounce = !fit && after > 0 ? after : 0;
          const x = 300 + (fit ? 0 : bounce * 500 * (i % 2 ? 1 : -1));
          const y = interpolate(drop, [0, 1], [-200, y0]) + (!fit ? 900 * bounce * bounce - 300 * bounce : 0);
          const rot = fit ? 0 : bounce * 140 * (i % 2 ? 1 : -1);
          const snap = fit ? pop(t, at, 9) : 0;
          if (t < at - 0.35) return null;
          // A fitting block lands on the slot's top edge, right-aligned, clear of the value text.
          const pos: React.CSSProperties = fit ? { right: 70, top: y - 58 } : { left: x + shake(t, at, 10), top: y };
          return (
            <div key={i} style={{ position: 'absolute', ...pos, transform: `rotate(${rot}deg) scale(${fit ? 0.9 + snap * 0.1 : 1})`, opacity: !fit && after > 1.2 ? 0 : 1 }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: 'white', background: fit ? C.green : C.red, borderRadius: 16, padding: '20px 26px', boxShadow: '0 16px 40px rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>{fit ? '✓ ' : '✕ '}{b.text}</div>
            </div>
          );
        })}
        {phase === 'fit' ? blocks.map((b, i) => <Burst key={i} t={t} at={when(words, b.at, 0.5 + i * 0.9)} x={460} y={110 + (b.slot ?? i) * 280 + 95} color="#5fd08e" size={420} />) : null}
      </div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ clock

/** A countdown ring (the last five minutes) or a clock face spinning through an hour. */
export const ClockScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const dur = typeof s.dur === 'number' ? s.dur : 4;
  if (s.mode === 'spin') {
    const p = lerp(t, 0.2, Math.max(0.8, dur - 0.6), 0, 1, Easing.inOut(Easing.quad));
    const label = pop(t, when(words, s.at, 0.8), 11);
    return (
      <Canvas>
        <div style={{ position: 'absolute', left: 160, top: 60, width: 600, height: 600, borderRadius: 300, background: '#fff', boxShadow: `${CARD_SHADOW}, inset 0 0 0 16px #f1ede4` }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: 296, top: 30, width: 8, height: i % 3 ? 26 : 50, borderRadius: 4, background: C.text, transformOrigin: '4px 270px', transform: `rotate(${i * 30}deg)` }} />
          ))}
          <div style={{ position: 'absolute', left: 291, top: 140, width: 18, height: 170, borderRadius: 9, background: C.text, transformOrigin: '9px 160px', transform: `rotate(${300 + p * 30}deg)` }} />
          <div style={{ position: 'absolute', left: 294, top: 70, width: 12, height: 240, borderRadius: 6, background: C.red, transformOrigin: '6px 230px', transform: `rotate(${p * 360 * (s.turns ?? 1)}deg)`, filter: `blur(${Math.sin(p * Math.PI) * 2}px)` }} />
          <div style={{ position: 'absolute', left: 280, top: 280, width: 40, height: 40, borderRadius: 20, background: C.text }} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', opacity: label, transform: `translateY(${(1 - label) * 30}px)` }}>
          <div style={{ fontWeight: 800, fontSize: 110, ...gradText() }}>{s.label ?? '1 hour later'}</div>
          {s.sub ? <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 70, marginTop: 8 }}>{s.sub}</div> : null}
        </div>
      </Canvas>
    );
  }
  const total = s.from ?? 300;
  const p = lerp(t, 0.3, Math.max(1, dur - 0.4), 0, 1);
  const left = Math.max(0, Math.round(total * (1 - p)));
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const R = 280;
  const circ = 2 * Math.PI * R;
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={when(words, s.titleAt, 0.1)} text={s.title} serif size={86} /></div>
      <svg width="920" height="760" style={{ position: 'absolute', left: 0, top: 200 }}>
        <circle cx={460} cy={360} r={R} stroke={INK.track} strokeWidth={30} fill="none" />
        <circle cx={460} cy={360} r={R} stroke={p > 0.8 ? C.red : C.accent} strokeWidth={30} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * p} transform="rotate(-90 460 360)" />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 455, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 170, color: p > 0.8 ? C.red : C.text }}>{mm}:{ss}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 890, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: '0.24em', color: INK.muted }}>{s.label ?? 'LAST FIVE MINUTES'}</div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ path

/** Steps on a line that draws itself down the screen. */
export const PathScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const items: Spec[] = s.items;
  const ats = items.map((it, i) => (i < (s.from ?? 0) ? -1 : when(words, it.at, 0.4 + i * 0.9)));
  const shown = s.upTo ?? items.length;
  const top = s.title ? 200 : 60;
  const gap = Math.min(290, (1050 - top) / Math.max(1, shown));
  const lastAt = Math.max(...ats.slice(0, shown));
  const lineEnd = top + 45 + (shown - 1) * gap * lerp(t, Math.max(0, (ats[s.from ?? 0] ?? 0) - 0.4), lastAt + 0.1);
  return (
    <Canvas>
      {s.title ? <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={0} kicker={s.kicker} text={s.title} size={70} /></div> : null}
      <svg width="920" height="1100" style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={90} y1={top + 45} x2={90} y2={Math.max(top + 45, lineEnd)} stroke="url(#pg)" strokeWidth={10} strokeLinecap="round" />
        <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.blue} /><stop offset="100%" stopColor={C.gold} /></linearGradient></defs>
      </svg>
      {items.slice(0, shown).map((it, i) => {
        const p = ats[i] < 0 ? 1 : pop(t, ats[i], 11);
        const y = top + i * gap;
        return (
          <div key={i}>
            <div style={{ position: 'absolute', left: 45, top: y, width: 90, height: 90, borderRadius: 45, background: GRADIENT, color: 'white', fontWeight: 800, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 10px #f6f3ec, ${CARD_SHADOW}`, transform: `scale(${p})` }}>{i + 1}</div>
            <div style={{ position: 'absolute', left: 170, top: y - 10, width: 740, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 120}px)` }}>
              <div style={{ background: '#fff', borderRadius: 24, padding: '22px 30px', boxShadow: CARD_SHADOW }}>
                <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>{it.text}</div>
                {it.sub ? <div style={{ fontSize: 30, color: C.text2, marginTop: 6 }}>{it.sub}</div> : null}
              </div>
            </div>
          </div>
        );
      })}
    </Canvas>
  );
};

// ------------------------------------------------------------------ sunrise

/** The laptop closes, night passes, the sun comes up and tomorrow's note is waiting. */
export const SunriseScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const at = capAt(s, when(words, s.at, 2.0), 1.6);
  const close = lerp(t, 0, 0.6, 0, 1, Easing.inOut(Easing.cubic));
  const dawn = lerp(t, 0.6, at, 0, 1, Easing.inOut(Easing.quad));
  const open = lerp(t, at, at + 0.6, 0, 1, Easing.out(Easing.cubic));
  const lid = close * (1 - open);
  const sunA = Math.PI * (1 - dawn);
  const title = pop(t, at + 0.3, 11);
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 920, height: 1040, borderRadius: 36, overflow: 'hidden', background: `linear-gradient(180deg, ${dawn < 0.5 ? '#1d2b4a' : '#ffd9a8'} 0%, ${dawn < 0.5 ? '#2f4470' : '#fbeed8'} 100%)`, boxShadow: CARD_SHADOW }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #ffcf96 0%, #fbeed8 70%)', opacity: dawn }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #16223c 0%, #2c416b 100%)', opacity: 1 - dawn }} />
        {Array.from({ length: 24 }).map((_, i) => <div key={i} style={{ position: 'absolute', left: rnd(i) * 900, top: rnd(i + 3) * 500, width: 5, height: 5, borderRadius: 3, background: 'white', opacity: (1 - dawn) * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))) }} />)}
        <div style={{ position: 'absolute', left: 460 + Math.cos(Math.PI - sunA) * 340 - 80, top: 640 - Math.sin(sunA) * 420 - 80, width: 160, height: 160, borderRadius: 80, background: 'radial-gradient(circle, #fff3c4 0%, #f0b866 60%, #e09a3c 100%)', boxShadow: '0 0 120px 40px rgba(240,184,102,0.6)', opacity: dawn }} />
        <div style={{ position: 'absolute', left: 140, top: 140 + dawn * 500, width: 120, height: 120, borderRadius: 60, boxShadow: 'inset -30px -10px 0 0 #e9eef7', opacity: 1 - dawn }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, bottom: 0, background: dawn > 0.5 ? '#e8dcc4' : '#1a2540', opacity: 1 }} />
        <div style={{ position: 'absolute', left: 210, top: 470, width: 500, perspective: 1200 }}>
          <div style={{ height: 320, borderRadius: '20px 20px 0 0', background: '#2a3446', transformOrigin: 'bottom', transform: `rotateX(${lid * 88}deg)`, border: '10px solid #3a465c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff2c2', borderRadius: 8, padding: '18px 22px', transform: 'rotate(-3deg)', opacity: open, fontWeight: 800, fontSize: 30, color: C.text, maxWidth: 380 }}>{s.note ?? 'Next: fix the login redirect'}</div>
          </div>
          <div style={{ height: 34, margin: '0 -50px', borderRadius: '0 0 24px 24px', background: '#9aa6b8' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', opacity: title, transform: `translateY(${(1 - title) * 30}px)`, fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, color: C.text }}>{s.title ?? 'Just begin.'}</div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ tower

/** Building on a mocked block: the stack topples. Labelled or fixed, it holds. */
export const TowerScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const base: Spec[] = s.base ?? [{ text: 'Auth ✓' }, { text: 'Invoices ✓' }, { text: 'Payments', mock: true }];
  const blocks: Spec[] = s.blocks ?? [];
  const phase = s.phase ?? 'fall';
  const fallAt = phase === 'fall' ? capAt(s, when(words, s.fallAt, 3), 1.4) : 99;
  const fixAt = phase === 'fixed' ? when(words, s.fixAt, 0.4) : 99;
  const BH = 112;
  const ground = 1040;
  const all: Spec[] = [...base.map((b) => ({ ...b, at: -1 })), ...blocks.map((b, i) => ({ ...b, at: b.at ? when(words, b.at, 0.5 + i * 0.6) : phase === 'fixed' ? fixAt + 0.6 + i * 0.45 : 0.5 + i * 0.6 }))];
  const mockIndex = base.findIndex((b) => b.mock);
  const ff = Math.max(0, t - fallAt);
  const labels: Spec[] = s.labels ?? [];
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 40, right: 40, top: ground, height: 10, borderRadius: 5, background: '#cfc6b4' }} />
      {all.map((b, i) => {
        const y0 = ground - BH * (i + 1);
        const drop = b.at < 0 ? 1 : lerp(t, b.at - 0.3, b.at, 0, 1, Easing.in(Easing.quad));
        const land = b.at < 0 ? 1 : pop(t, b.at, 9);
        if (b.at >= 0 && t < b.at - 0.3) return null;
        const above = i > mockIndex;
        const dir = i % 2 ? 1 : -1;
        const fx = above ? dir * (180 + (i - mockIndex) * 90) * ff : 0;
        const fy = above ? 1400 * ff * ff - 200 * ff : 0;
        const fr = above ? dir * (40 + i * 12) * ff : 0;
        const isMock = Boolean(b.mock);
        const fixed = isMock && t > fixAt;
        const crumble = isMock && phase === 'fall' ? lerp(t, fallAt, fallAt + 0.5) : 0;
        const tape = isMock && phase === 'labeled' ? lerp(t, when(words, labels[0]?.at, 0.5), when(words, labels[0]?.at, 0.5) + 0.4) : 0;
        const w = 560 - (i % 2) * 40;
        return (
          <div key={i} style={{ position: 'absolute', left: 460 - w / 2 + fx + shake(t, b.at, 6), top: interpolate(drop, [0, 1], [-200, y0]) + fy, width: w, height: BH - 8, transform: `rotate(${fr}deg) scaleY(${b.at < 0 ? 1 : 0.85 + land * 0.15})`, transformOrigin: 'bottom', opacity: 1 - crumble }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: fixed ? C.green : isMock ? 'repeating-linear-gradient(135deg, rgba(214,64,60,0.10) 0 16px, rgba(214,64,60,0.02) 16px 32px)' : b.at < 0 ? '#ffffff' : phase === 'fixed' ? '#e7f5ec' : '#fff6e0', border: isMock && !fixed ? `4px dashed ${C.red}` : `3px solid ${b.at < 0 ? C.border : phase === 'fixed' ? C.green : C.gold}`, boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 40, color: fixed ? 'white' : isMock ? C.red : C.text }}>
              {fixed ? 'Payments ✓ real' : isMock ? `${b.text} (mocked)` : b.text}
            </div>
            {tape > 0 ? <div style={{ position: 'absolute', left: -30, right: -30, top: 30, height: 46, background: 'repeating-linear-gradient(45deg, #f0c33c 0 26px, #13233b 26px 52px)', transformOrigin: 'left', transform: `rotate(-4deg) scaleX(${tape})`, opacity: 0.92 }} /> : null}
          </div>
        );
      })}
      {phase === 'fall' ? <Burst t={t} at={fallAt} x={460} y={ground - BH * (mockIndex + 0.5)} color={C.red} size={700} /> : null}
      {phase === 'fixed' ? <Burst t={t} at={fixAt} x={460} y={ground - BH * (mockIndex + 0.5)} color={C.green} size={600} /> : null}
      {labels.map((l, i) => {
        const at = when(words, l.at, 0.5 + i * 0.8);
        const p = pop(t, at + 0.2, 10);
        return (
          <div key={i} style={{ position: 'absolute', left: i % 2 ? 420 : 40, top: 120 + i * 200, width: 470, opacity: Math.min(1, p * 1.5), transform: `rotate(${i % 2 ? 4 : -4}deg) scale(${0.6 + p * 0.4})` }}>
            <div style={{ background: '#fff2c2', borderRadius: 8, padding: '24px 28px', boxShadow: CARD_SHADOW, fontWeight: 800, fontSize: 38, lineHeight: 1.2 }}>{l.text}</div>
          </div>
        );
      })}
      {s.title ? <div style={{ position: 'absolute', left: 0, right: 0, top: 40 }}><Heading t={t} at={when(words, s.titleAt, fallAt + 0.4)} text={s.title} serif size={110} color={C.red} /></div> : null}
    </Canvas>
  );
};

// ------------------------------------------------------------------ strike

/** Lines that get a hand-drawn red strike, then a stamp slams down. */
export const StrikeScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const items: Spec[] = s.items;
  const stampAt = s.stamp ? capAt(s, when(words, s.stampAt, 1.6), 1.0) : 99;
  const st = pop(t, stampAt, 9, 0.7);
  return (
    <Canvas>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 50, transform: `translateX(${shake(t, stampAt + 0.1, 16)}px)` }}>
        {items.map((it, i) => {
          const at = when(words, it.at, 0.2 + i * 0.7);
          const p = pop(t, at, 12);
          const sa = capAt(s, when(words, it.strikeAt, at + 0.8), 1.2);
          const k = lerp(t, sa, sa + 0.4, 0, 1, Easing.inOut(Easing.cubic));
          return (
            <div key={i} style={{ position: 'relative', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px)`, textAlign: 'center' }}>
              <div style={{ fontFamily: it.serif === false ? SANS : SERIF, fontStyle: it.serif === false ? 'normal' : 'italic', fontWeight: it.serif === false ? 800 : 400, fontSize: it.size ?? 92, lineHeight: 1.1, color: k > 0.5 ? '#9aa6b6' : C.text, maxWidth: 880 }}>{it.text}</div>
              <svg width="100%" height="60" viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: 'absolute', left: -10, right: -10, top: '42%', width: 'calc(100% + 20px)', overflow: 'visible' }}>
                <path d="M0 6 Q 25 2, 50 5 T 100 4" stroke={C.red} strokeWidth={1.6} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} vectorEffect="non-scaling-stroke" style={{ strokeWidth: 12 }} />
              </svg>
            </div>
          );
        })}
        {s.stamp ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: s.stampSize ?? 70, letterSpacing: '0.14em', color: s.stampColor === 'green' ? C.green : C.red, border: `9px solid ${s.stampColor === 'green' ? C.green : C.red}`, borderRadius: 18, padding: '12px 30px', opacity: t < stampAt ? 0 : Math.min(1, st * 2), transform: `rotate(-8deg) scale(${2.4 - 1.4 * st})`, textAlign: 'center' }}>{s.stamp}</div> : null}
      </div>
      <Burst t={t} at={stampAt + 0.1} x={460} y={800} color={s.stampColor === 'green' ? C.green : C.red} size={560} />
    </Canvas>
  );
};

// ------------------------------------------------------------------ madlib

const REEL = ['dashboard', 'platform', 'tool', 'everyone', 'teams', 'AI app', 'creators', 'tracker', 'saves time', 'is fast', 'helps', 'startups'];

/** "A ___ for ___ that ___." Blanks appear, then spin like slot reels and land. */
export const MadlibScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const frame = useCurrentFrame();
  const slots: Spec[] = s.slots;
  const phase = s.phase ?? 'fill';
  const yesAt = s.yesAt ? capAt(s, when(words, s.yesAt, 3), 1.0) : 99;
  const yes = pop(t, yesAt, 9);
  return (
    <Canvas>
      {s.title ? <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={0} kicker={s.kicker} text={s.title} size={64} /></div> : null}
      <div style={{ position: 'absolute', left: 0, right: 0, top: s.title ? 220 : 120, display: 'flex', flexDirection: 'column', gap: 44 }}>
        {slots.map((sl, i) => {
          const appear = phase === 'blanks' ? pop(t, when(words, sl.at, 0.4 + i * 0.7), 11) : 1;
          const land = phase === 'fill' ? when(words, sl.at, 0.5 + i * 0.8) : phase === 'test' && sl.alt ? when(words, sl.altAt, 1.0) : -1;
          const spinning = land > 0 && t > land - 0.7 && t < land;
          const landed = land > 0 && t >= land;
          const sp = landed ? pop(t, land, 9) : 0;
          const value = phase === 'blanks' ? '' : phase === 'test' && sl.alt ? (landed ? sl.alt : spinning ? REEL[(Math.floor(frame / 2) + i * 3) % REEL.length] : sl.value) : landed || land < 0 ? sl.value : spinning ? REEL[(Math.floor(frame / 2) + i * 3) % REEL.length] : '';
          const changed = phase === 'test' && sl.alt && landed;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, opacity: Math.min(1, appear * 1.5), transform: `translateX(${(1 - appear) * -80}px)` }}>
              <div style={{ width: 170, textAlign: 'right', fontWeight: 800, fontSize: 64, color: C.text2 }}>{sl.pre}</div>
              <div style={{ position: 'relative', flex: 1, height: 150, borderRadius: 24, background: '#fff', boxShadow: CARD_SHADOW, border: `4px solid ${changed ? C.gold : landed ? C.accent : C.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 30px' }}>
                <div style={{ fontWeight: 800, fontSize: Math.min(68, Math.floor(1100 / Math.max(8, value.length))), filter: spinning ? 'blur(3px)' : undefined, transform: `translateY(${spinning ? ((frame % 2) - 0.5) * 30 : 0}px) scale(${landed ? 0.9 + sp * 0.1 : 1})`, ...(landed && !spinning ? gradText() : { color: C.text }) }}>{value}</div>
                {!value ? <div style={{ width: 6, height: 70, background: C.accent, opacity: frame % 20 < 10 ? 1 : 0 }} /> : null}
                <div style={{ position: 'absolute', right: 22, bottom: 12, fontFamily: MONO, fontSize: 20, fontWeight: 700, letterSpacing: '0.18em', color: INK.muted }}>{sl.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      {s.yesAt ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', opacity: t < yesAt ? 0 : Math.min(1, yes * 2), transform: `rotate(-6deg) scale(${2.2 - 1.2 * yes})` }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 64, letterSpacing: '0.14em', color: C.green, border: `8px solid ${C.green}`, borderRadius: 18, padding: '10px 30px', background: 'rgba(255,255,255,0.8)' }}>{s.verdict ?? '✓ IT WORKS'}</div>
        </div>
      ) : null}
      <Burst t={t} at={yesAt + 0.1} x={460} y={920} color={C.green} size={560} />
    </Canvas>
  );
};
