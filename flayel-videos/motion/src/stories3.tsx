/* Story scenes, part three: people, money, time, docs, windows, orbits,
 * paper ships, calendars, terminals, graves, graphs, slots and streaks. */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, GRADIENT, MONO, SANS, SERIF } from './brand';
import { Burst, Canvas, Confetti, Heading, Spec, capAt, clamp, gradText, lerp, pop, rnd, shake, useT, when } from './fx';
import { CARD_SHADOW, INK, Logo } from './stage';
import { Pointer, Win } from './stories';
import { Word } from './types';

const tone = (n?: string) => (n && (C as Record<string, string>)[n]) || C.accent;

// ------------------------------------------------------------------ quotes

/** Users: faceless (your AI never met them), guesses (thought bubbles), or real quotes. */
export const QuotesScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const items: Spec[] = s.items ?? [];
  if (s.phase === 'empty') {
    const title = pop(t, when(words, s.at, 0.8), 11);
    return (
      <Canvas>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 180, display: 'flex', justifyContent: 'center', gap: 26 }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const p = pop(t, 0.1 + i * 0.12, 10);
            return (
              <div key={i} style={{ width: 150, height: 210, opacity: p, transform: `translateY(${(1 - p) * 60 + Math.sin(t * 2 + i) * 6}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 110, height: 110, borderRadius: 55, background: '#ddd5c6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 60, color: '#fff' }}>?</div>
                <div style={{ width: 150, height: 90, borderRadius: '75px 75px 20px 20px', background: '#ddd5c6', marginTop: 10 }} />
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', opacity: title, transform: `scale(${1.2 - title * 0.2})` }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.26em', color: INK.muted }}>{s.kicker ?? 'YOUR USERS'}</div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, lineHeight: 1.02, marginTop: 10 }}>{s.title ?? 'Never met them.'}</div>
        </div>
      </Canvas>
    );
  }
  if (s.phase === 'guess') {
    return (
      <Canvas>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={0} kicker={s.kicker ?? 'Your AI, guessing'} /></div>
        {items.map((it, i) => {
          const at = when(words, it.at, 0.3 + i * 0.6);
          const p = pop(t, at, 9);
          const x = [60, 380, 120][i % 3];
          const y = [120, 420, 720][i % 3];
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y + Math.sin(t * 2.2 + i) * 12, width: 480, opacity: Math.min(1, p * 1.5), transform: `scale(${0.5 + p * 0.5}) rotate(${Math.sin(t * 1.5 + i) * 2}deg)` }}>
              <div style={{ background: '#fff', borderRadius: 80, padding: '40px 46px', boxShadow: CARD_SHADOW, fontFamily: SERIF, fontStyle: 'italic', fontSize: 52, lineHeight: 1.1, textAlign: 'center' }}>{it.text}</div>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: '#fff', boxShadow: CARD_SHADOW, marginLeft: 90, marginTop: 10 }} />
              <div style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', boxShadow: CARD_SHADOW, marginLeft: 70, marginTop: 6 }} />
            </div>
          );
        })}
        <div style={{ position: 'absolute', right: 20, top: 980, fontFamily: MONO, fontWeight: 700, fontSize: 64, color: C.amber, transform: 'rotate(-6deg)', opacity: pop(t, Math.max(1.2, (typeof s.dur === 'number' ? s.dur : 3) - 1.2)) }}>{s.stamp ?? 'JUST GUESSES'}</div>
      </Canvas>
    );
  }
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', flexDirection: 'column', gap: 30 }}>
        {items.map((it, i) => {
          const at = when(words, it.at, 0.3 + i * 0.6);
          const p = pop(t, at, 11);
          const right = i % 2 === 1;
          const c = tone(it.color);
          return (
            <div key={i} style={{ display: 'flex', flexDirection: right ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 18, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * (right ? 140 : -140)}px)` }}>
              <div style={{ width: 96, height: 96, borderRadius: 48, background: c, color: 'white', fontWeight: 800, fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{it.who}</div>
              <div style={{ background: '#fff', borderRadius: 30, padding: '24px 30px', boxShadow: CARD_SHADOW, maxWidth: 720, borderBottom: `6px solid ${c}` }}>
                <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, letterSpacing: '0.18em', color: c }}>{it.tag}</div>
                <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.2, marginTop: 6 }}>“{it.text}”</div>
              </div>
            </div>
          );
        })}
      </div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ receipt

/** A receipt that prints line by line, then gets stamped. */
export const ReceiptScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const frame = useCurrentFrame();
  const lines: Spec[] = s.lines;
  const ats = lines.map((l, i) => when(words, l.at, 0.4 + i * 0.6));
  const shown = ats.filter((a) => t >= a).length;
  const totalAt = capAt(s, when(words, s.totalAt, ats[ats.length - 1] + 0.8), 1.2);
  const totalOn = t >= totalAt;
  const stamp = pop(t, totalAt + 0.35, 9, 0.7);
  const h = 150 + shown * 96 + (totalOn ? 170 : 0);
  const good = s.phase === 'good';
  return (
    <Canvas>
      {s.title ? <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={0} kicker={s.title} /></div> : null}
      <div style={{ position: 'absolute', left: 100, top: 80, width: 720, height: 56, borderRadius: 28, background: C.text, boxShadow: CARD_SHADOW, zIndex: 2 }} />
      <div style={{ position: 'absolute', left: 140, top: 110, width: 640, height: h, background: '#fffdf8', boxShadow: CARD_SHADOW, clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 18px), 95% 100%, 90% calc(100% - 18px), 85% 100%, 80% calc(100% - 18px), 75% 100%, 70% calc(100% - 18px), 65% 100%, 60% calc(100% - 18px), 55% 100%, 50% calc(100% - 18px), 45% 100%, 40% calc(100% - 18px), 35% 100%, 30% calc(100% - 18px), 25% 100%, 20% calc(100% - 18px), 15% 100%, 10% calc(100% - 18px), 5% 100%, 0 calc(100% - 18px))', transform: `translateY(${t < (ats[shown - 1] ?? 0) + 0.15 ? ((frame % 2) - 0.5) * 3 : 0}px)` }}>
        <div style={{ padding: '60px 40px 0', fontFamily: MONO }}>
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 26, letterSpacing: '0.24em', color: C.text2 }}>{s.header ?? 'FEATURE IDEA · RECEIPT'}</div>
          {lines.slice(0, shown).map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 34, fontSize: 30, fontWeight: 700, color: l.color ? tone(l.color) : C.text }}>
              <span style={{ whiteSpace: 'nowrap' }}>{l.text}</span>
              <span style={{ flex: 1, borderBottom: `3px dotted ${C.border}` }} />
              <span style={{ whiteSpace: 'nowrap' }}>{l.value}</span>
            </div>
          ))}
          {totalOn ? (
            <div style={{ marginTop: 40, borderTop: `4px double ${C.text}`, paddingTop: 22, display: 'flex', justifyContent: 'space-between', fontSize: 40, fontWeight: 700, color: good ? C.green : C.red }}>
              <span>TOTAL</span><span>{s.total}</span>
            </div>
          ) : null}
        </div>
      </div>
      {totalOn ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 160 + h - 80, display: 'flex', justifyContent: 'center', opacity: Math.min(1, stamp * 2), transform: `rotate(-10deg) scale(${2.3 - 1.3 * stamp}) translateX(${shake(t, totalAt + 0.45, 10)}px)` }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 60, letterSpacing: '0.12em', color: good ? C.green : C.red, border: `8px solid ${good ? C.green : C.red}`, borderRadius: 16, padding: '8px 26px', background: 'rgba(255,255,255,0.85)' }}>{s.verdict}</div>
        </div>
      ) : null}
    </Canvas>
  );
};

// ------------------------------------------------------------------ timers

/** One ring timer per bucket: how long each kind of memory stays fresh. */
export const TimersScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const items: Spec[] = s.items;
  const max = s.max ?? 90;
  const R = 108;
  const circ = 2 * Math.PI * R;
  return (
    <Canvas>
      {s.label ? <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={0} kicker={s.label} /></div> : null}
      <div style={{ position: 'absolute', left: 0, top: 70, width: 920, display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 30 }}>
        {items.map((it, i) => {
          const at = when(words, it.at, 0.3 + i * 0.5);
          const appear = pop(t, at, 11);
          const fill = lerp(t, at, at + 1.0, 0, 1, Easing.out(Easing.cubic));
          const days = Math.round(fill * it.days);
          const c = tone(it.color);
          const hl = s.highlight === it.name && t > at;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, appear * 1.5), transform: `scale(${(0.6 + appear * 0.4) * (hl ? 1.06 : 1)})` }}>
              <div style={{ position: 'relative', width: 2 * R + 40, height: 2 * R + 40 }}>
                <svg width={2 * R + 40} height={2 * R + 40}>
                  <circle cx={R + 20} cy={R + 20} r={R} stroke={INK.track} strokeWidth={22} fill="none" />
                  <circle cx={R + 20} cy={R + 20} r={R} stroke={c} strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - (fill * it.days) / max)} transform={`rotate(-90 ${R + 20} ${R + 20})`} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 70, lineHeight: 1, color: c }}>{days}</div>
                  <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: INK.muted }}>DAYS</div>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 36, marginTop: 4 }}>{it.name}</div>
            </div>
          );
        })}
      </div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ aging doc

const AGES = ['today', '2 days ago', '1 week ago', '2 weeks ago', '3 weeks ago'];

/** A project doc: crisp on day one, then it yellows, gathers dust and goes wrong. */
export const AgingScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const stale = s.phase === 'stale';
  const ageEnd = stale ? capAt(s, when(words, s.ageAt, 2.0), 2.0) : 0;
  const age = stale ? lerp(t, 0.3, ageEnd, 0, 1, Easing.inOut(Easing.quad)) : 0;
  const label = AGES[Math.min(AGES.length - 1, Math.floor(age * (AGES.length - 0.01)))];
  const stickerAt = stale ? capAt(s, when(words, s.at, ageEnd + 0.6), 1.2) : 99;
  const sticker = pop(t, stickerAt, 9);
  const appear = pop(t, 0, 12);
  const lines = s.lines ?? ['Vision: invoices for freelancers', 'Stack: Next.js · FastAPI · Postgres', 'Next: build the billing page', 'Decided: no team accounts yet'];
  const paper = `rgb(${Math.round(255 - age * 16)}, ${Math.round(255 - age * 30)}, ${Math.round(255 - age * 70)})`;
  return (
    <Canvas>
      {s.title ? <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={when(words, s.titleAt, 0.2)} text={s.title} serif size={92} /></div> : null}
      <div style={{ position: 'absolute', left: 90, top: 170, width: 740, height: 830, background: paper, borderRadius: 14, boxShadow: CARD_SHADOW, transform: `rotate(${-age * 3}deg) translateY(${(1 - appear) * 80}px) skewY(${age * 1.2}deg)`, opacity: appear, padding: '50px 54px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 54, height: 66, borderRadius: 8, background: C.accent, opacity: 0.85 }} />
          <div>
            <div style={{ fontSize: 40, fontWeight: 800 }}>Beam · project doc</div>
            <div style={{ fontFamily: MONO, fontSize: 24, color: age > 0.5 ? C.red : C.green, fontWeight: 700 }}>Last edited: {label}</div>
          </div>
        </div>
        <div style={{ marginTop: 50, display: 'flex', flexDirection: 'column', gap: 34 }}>
          {lines.map((l: string, i: number) => {
            const target = i === (s.wrongLine ?? 2);
            const k = target ? lerp(t, stickerAt, stickerAt + 0.3) : 0;
            return (
              <div key={i} style={{ position: 'relative', fontSize: 38, fontWeight: 600, color: k > 0.5 ? '#9aa6b6' : C.text, filter: `blur(${age * (i % 2 ? 0.8 : 0.3)}px)` }}>
                {l}
                {target ? <div style={{ position: 'absolute', left: -6, top: '52%', height: 7, width: `${k * 100}%`, background: C.red, borderRadius: 4 }} /> : null}
              </div>
            );
          })}
        </div>
        {/* coffee ring and dust */}
        <div style={{ position: 'absolute', right: 70, bottom: 90, width: 210, height: 210, borderRadius: 105, border: '14px solid rgba(120,80,40,0.2)', opacity: age }} />
        {Array.from({ length: 30 }).map((_, i) => <div key={i} style={{ position: 'absolute', left: rnd(i) * 740, top: rnd(i + 7) * 830, width: 4 + (i % 3) * 3, height: 4 + (i % 3) * 3, borderRadius: 4, background: 'rgba(90,70,40,0.35)', opacity: age }} />)}
      </div>
      {stale ? (
        <div style={{ position: 'absolute', left: 430, top: 470, opacity: Math.min(1, sticker * 1.5), transform: `rotate(8deg) scale(${2 - sticker})` }}>
          <div style={{ background: C.red, color: 'white', fontWeight: 800, fontSize: 38, borderRadius: 14, padding: '18px 26px', boxShadow: CARD_SHADOW }}>{s.sticker ?? 'Shipped 2 weeks ago!'}</div>
        </div>
      ) : null}
      {!stale ? <Burst t={t} at={0.4} x={460} y={580} color={C.green} size={700} /> : null}
    </Canvas>
  );
};

// ------------------------------------------------------------------ context window

const POUR = ['messages', 'files', 'notes', 'code', 'docs', 'logs'];

/** A glass context window: grows and fills, empties on "New chat", or refills from the brain. */
export const WindowScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const at = capAt(s, when(words, s.at, 1.0), 1.6);
  const phase = s.phase ?? 'grow';
  const grow = phase === 'grow' ? lerp(t, 0.2, at + 0.6, 0, 1, Easing.inOut(Easing.cubic)) : 1;
  const W = interpolate(grow, [0, 1], [440, 820]);
  const H = interpolate(grow, [0, 1], [440, 760]);
  const left = 460 - W / 2;
  const top = 140 + (760 - H) / 2;
  const cols = 6;
  const bw = (W - 40) / cols;
  const fallT = phase === 'reset' ? Math.max(0, t - at - 0.2) : 0;
  const labelP = pop(t, phase === 'reset' ? at + 0.8 : at + 0.3, 11);
  const blocks = phase === 'refill' ? 0 : phase === 'reset' ? 36 : Math.min(36, Math.floor(lerp(t, 0.3, Math.max(1, (typeof s.dur === 'number' ? s.dur : 4) - 0.4)) * 36));
  const tiles = [
    { name: 'Vision', c: C.blue }, { name: 'Stack', c: C.purple }, { name: 'Progress', c: C.green }, { name: 'Decisions', c: C.amber },
  ];
  const click = phase === 'reset' ? at : -1;
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.26em', color: INK.muted }}>{phase === 'grow' ? `CONTEXT WINDOW · ${grow > 0.6 ? 'BIGGER' : 'BIG'}` : 'NEW CHAT · CONTEXT WINDOW'}</div>
      <div style={{ position: 'absolute', left, top, width: W, height: H, borderRadius: 34, border: '6px solid rgba(26,120,214,0.55)', background: 'linear-gradient(160deg, rgba(255,255,255,0.75), rgba(166,220,255,0.18))', boxShadow: `${CARD_SHADOW}, inset 0 0 60px rgba(58,159,240,0.12)`, overflow: phase === 'reset' && fallT > 0 ? 'visible' : 'hidden' }}>
        {Array.from({ length: blocks }).map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const bx = 20 + col * bw;
          const by = H - 20 - (row + 1) * 74;
          const dy = fallT > 0 ? 1600 * fallT * fallT * (0.7 + rnd(i) * 0.6) : 0;
          const rot = fallT > 0 ? (rnd(i + 3) - 0.5) * 300 * fallT : 0;
          return <div key={i} style={{ position: 'absolute', left: bx + 4, top: by + dy, width: bw - 8, height: 66, borderRadius: 12, background: [C.blue, C.purple, C.green, C.amber, '#9aa6b6', C.accent][i % 6], opacity: 0.85, transform: `rotate(${rot}deg)`, color: 'white', fontFamily: MONO, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{POUR[i % POUR.length]}</div>;
        })}
        {phase === 'refill' ? tiles.map((tile, i) => {
          const p = pop(t, at + 0.5 + i * 0.18, 9);
          return (
            <div key={i} style={{ position: 'absolute', left: 30 + (i % 2) * ((W - 60) / 2), top: 30 + Math.floor(i / 2) * ((H - 60) / 2), width: (W - 60) / 2 - 20, height: (H - 60) / 2 - 20, borderRadius: 24, background: tile.c, color: 'white', fontWeight: 800, fontSize: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: Math.min(1, p * 1.5), transform: `scale(${0.4 + p * 0.6})` }}>{tile.name}</div>
          );
        }) : null}
        {(phase === 'reset' && t > at + 0.8) || (phase === 'refill' && t < at + 0.5) ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 130, color: C.text2, opacity: phase === 'reset' ? labelP : 1 }}>Empty.</div>
        ) : null}
      </div>
      {phase === 'reset' ? (
        <>
          <div style={{ position: 'absolute', right: 40, top: 90, background: C.text, color: 'white', fontWeight: 800, fontSize: 34, borderRadius: 18, padding: '16px 26px', transform: `scale(${t > click && t < click + 0.2 ? 0.92 : 1})` }}>+ New chat</div>
          <Pointer x={interpolate(t, [0, click], [500, 760], clamp)} y={interpolate(t, [0, click], [600, 110], clamp)} pressed={t > click && t < click + 0.2} opacity={lerp(t, click + 0.4, click + 0.8, 1, 0)} />
        </>
      ) : null}
      {phase === 'refill' ? (
        <>
          <div style={{ position: 'absolute', left: interpolate(lerp(t, at - 0.4, at + 0.4, 0, 1, Easing.out(Easing.cubic)), [0, 1], [980, 620]), top: interpolate(lerp(t, at - 0.4, at + 0.4, 0, 1, Easing.out(Easing.cubic)), [0, 1], [1000, 40]), opacity: lerp(t, at - 0.4, at - 0.2) }}><Logo size={170} /></div>
          <Burst t={t} at={at + 0.5} x={460} y={520} size={800} />
        </>
      ) : null}
    </Canvas>
  );
};

// ------------------------------------------------------------------ orbit

const NODES: Record<string, { x: number; y: number; c: string }> = {
  Claude: { x: 460, y: 170, c: C.amber },
  Cursor: { x: 760, y: 560, c: C.text },
  Gemini: { x: 460, y: 950, c: C.blue },
  ChatGPT: { x: 160, y: 560, c: C.green },
};

/** Four tools around one brain: walled garden, the week's spread, then beams to all. */
export const OrbitScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const phase = s.phase ?? 'hub';
  const items: Spec[] = s.items ?? [];
  if (phase === 'walled') {
    const wall = lerp(t, when(words, s.wallAt, 1.6), when(words, s.wallAt, 1.6) + 0.8, 0, 1, Easing.inOut(Easing.cubic));
    const per = 2 * (700 + 700);
    return (
      <Canvas>
        <div style={{ position: 'absolute', left: 160, top: 160, width: 600, height: 600, borderRadius: 50, background: '#fff', boxShadow: CARD_SHADOW, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, gap: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ width: 28, height: 28, borderRadius: 14, background: C.amber }} /><div style={{ fontSize: 60, fontWeight: 800 }}>Claude Project</div></div>
          {items.map((it, i) => {
            const p = pop(t, when(words, it.at, 0.4 + i * 0.5), 11);
            return <div key={i} style={{ width: '100%', background: '#fbf3e6', borderRadius: 20, padding: '22px 28px', fontSize: 40, fontWeight: 700, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 60}px)` }}>{it.text}</div>;
          })}
        </div>
        <svg width="920" height="1100" style={{ position: 'absolute', left: 0, top: 0 }}>
          <rect x={110} y={110} width={700} height={700} rx={70} fill="none" stroke={C.amber} strokeWidth={10} strokeDasharray={per} strokeDashoffset={per * (1 - wall)} />
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 80, opacity: wall }}>{s.caption ?? 'Great, inside Claude.'}</div>
      </Canvas>
    );
  }
  const names = Object.keys(NODES);
  const hubAt = phase === 'hub' ? when(words, s.at, 0.6) : 99;
  const center = pop(t, phase === 'hub' ? Math.max(0, hubAt - 0.3) : 99, 10);
  const wall = phase === 'closed' ? lerp(t, 0.2, 1.0, 0, 1, Easing.inOut(Easing.cubic)) : 0;
  return (
    <Canvas>
      <svg width="920" height="1100" style={{ position: 'absolute', left: 0, top: 0 }}>
        {phase === 'hub' ? names.map((n, i) => {
          const b = lerp(t, hubAt + i * 0.22, hubAt + i * 0.22 + 0.5, 0, 1, Easing.out(Easing.cubic));
          const node = NODES[n];
          return <line key={n} x1={460} y1={560} x2={460 + (node.x - 460) * b} y2={560 + (node.y - 560) * b} stroke="url(#beam)" strokeWidth={12} strokeLinecap="round" strokeDasharray="26 14" strokeDashoffset={-t * 120} />;
        }) : null}
        <defs><linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={C.blue} /><stop offset="100%" stopColor={C.gold} /></linearGradient></defs>
        {phase === 'closed' ? <rect x={260} y={70} width={400} height={200} rx={40} fill="none" stroke={C.amber} strokeWidth={10} strokeDasharray={1240} strokeDashoffset={1240 * (1 - wall)} /> : null}
      </svg>
      {names.map((n, i) => {
        const node = NODES[n];
        const it = items.find((x) => x.name === n) ?? {};
        const at = phase === 'week' ? when(words, it.at, 0.3 + i * 0.6) : -1;
        const p = at < 0 ? 1 : pop(t, at, 10);
        const dim = phase === 'closed' && n !== 'Claude';
        const ok = phase === 'hub' ? pop(t, hubAt + i * 0.22 + 0.5, 10) : 0;
        return (
          <div key={n} style={{ position: 'absolute', left: node.x - 140, top: node.y - 70, width: 280, opacity: Math.min(1, p * 1.5) * (dim ? 0.45 : 1), transform: `scale(${0.5 + p * 0.5})` }}>
            <div style={{ background: '#fff', borderRadius: 26, padding: '18px 20px', boxShadow: CARD_SHADOW, textAlign: 'center', border: `4px solid ${ok > 0.5 ? C.green : 'transparent'}` }}>
              {it.verb ? <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: '0.18em', color: node.c === C.text ? C.text2 : node.c }}>{it.verb}</div> : null}
              <div style={{ fontSize: 46, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}><div style={{ width: 20, height: 20, borderRadius: 10, background: node.c }} />{n}</div>
            </div>
            {dim ? <div style={{ position: 'absolute', right: -10, top: -30, fontWeight: 800, fontSize: 60, color: C.red, transform: `rotate(${Math.sin(t * 3 + i) * 8}deg)` }}>?</div> : null}
            {ok > 0 ? <div style={{ position: 'absolute', left: 0, right: 0, top: 128, textAlign: 'center', opacity: ok, fontFamily: MONO, fontSize: 20, fontWeight: 700, color: C.green }}>✓ FORMATTED FOR {n.toUpperCase()}</div> : null}
          </div>
        );
      })}
      {phase === 'hub' ? (
        <div style={{ position: 'absolute', left: 310, top: 420, width: 300, height: 280, borderRadius: 50, background: '#fff', boxShadow: `${CARD_SHADOW}, 0 0 0 ${12 + Math.sin(t * 4) * 6}px rgba(58,159,240,0.15)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: center, transform: `scale(${0.5 + center * 0.5})` }}>
          <Logo size={170} />
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.18em', color: C.accent }}>ONE BRAIN</div>
        </div>
      ) : phase === 'closed' ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, opacity: wall }}>{s.caption ?? 'Stays inside Claude.'}</div>
      ) : null}
    </Canvas>
  );
};

// ------------------------------------------------------------------ contribution grid

const Boat: React.FC<{ size: number; color?: string; draw?: number }> = ({ size, color = C.text, draw = 1 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 100 75" style={{ overflow: 'visible' }}>
    <path d="M4 42 L96 42 L78 68 L22 68 Z" fill={draw >= 1 ? '#ffffff' : 'none'} stroke={color} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <path d="M50 4 L50 42 L18 42 Z" fill={draw >= 1 ? '#fff6e0' : 'none'} stroke={color} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <path d="M54 12 L82 42 L54 42 Z" fill={draw >= 1 ? '#e6f2ff' : 'none'} stroke={color} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
  </svg>
);

/** Three weeks of empty squares and "0 lines of code"; decisions light some up. */
export const GridScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const items: Spec[] = s.items ?? [];
  const zero = pop(t, when(words, s.zeroAt, 1.0), 9);
  const lit = new Map<number, number>();
  items.forEach((it, i) => lit.set(it.cell ?? [3, 9, 17][i % 3], when(words, it.at, 0.5 + i * 0.7)));
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={0} kicker={s.kicker ?? 'Your side project · last 3 weeks'} /></div>
      <div style={{ position: 'absolute', left: 54, top: 80, display: 'grid', gridTemplateColumns: 'repeat(7, 100px)', gap: 16 }}>
        {Array.from({ length: 21 }).map((_, i) => {
          const p = pop(t, 0.05 + (i % 7) * 0.04 + Math.floor(i / 7) * 0.08, 12);
          const on = lit.has(i) ? pop(t, lit.get(i)!, 9) : 0;
          return (
            <div key={i} style={{ width: 100, height: 100, borderRadius: 16, background: on > 0.05 ? C.gold : '#e4ddcf', opacity: p, transform: `scale(${(0.6 + p * 0.4) * (1 + on * 0.08)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: on > 0.05 ? `0 0 0 ${on * 8}px rgba(192,138,43,0.25)` : undefined }}>
              {on > 0.05 ? <Boat size={66} /> : null}
            </div>
          );
        })}
      </div>
      {s.phase !== 'decided' ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', opacity: zero, transform: `scale(${1.4 - zero * 0.4})` }}>
          <div style={{ fontWeight: 800, fontSize: 200, lineHeight: 1, color: C.red }}>0</div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 84 }}>{s.zeroLabel ?? 'lines of code'}</div>
        </div>
      ) : (
        <div style={{ position: 'absolute', left: 60, right: 60, top: 470, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {items.map((it, i) => {
            const p = pop(t, when(words, it.at, 0.5 + i * 0.7) + 0.1, 11);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, background: '#fff', borderRadius: 24, padding: '20px 28px', boxShadow: CARD_SHADOW, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 100}px)`, borderLeft: `10px solid ${C.gold}` }}>
                <Boat size={80} />
                <div><div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: C.amber, letterSpacing: '0.16em' }}>DECIDED</div><div style={{ fontSize: 44, fontWeight: 800 }}>{it.text}</div></div>
              </div>
            );
          })}
        </div>
      )}
    </Canvas>
  );
};

// ------------------------------------------------------------------ paper ship

/** A paper ship draws itself and bobs on the waves; or a fleet sails to build day. */
export const PaperScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const at = when(words, s.at, 1.2);
  const label = pop(t, at, 11);
  const wave = (k: number, amp: number, y: number, color: string, speed: number) => {
    const pts = Array.from({ length: 25 }).map((_, i) => {
      const x = i * 40;
      return `${x},${y + Math.sin(i * 0.7 + t * speed + k) * amp}`;
    });
    return <polyline key={k} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" opacity={0.75} />;
  };
  if (s.phase === 'fleet') {
    const items: Spec[] = s.items ?? [];
    return (
      <Canvas>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={0} kicker={s.kicker} text={s.title} serif size={92} /></div>
        <div style={{ position: 'absolute', right: 30, top: 380, width: 16, height: 520, background: C.text, borderRadius: 8 }} />
        <div style={{ position: 'absolute', right: 46, top: 380, width: 200, height: 120, background: GRADIENT, clipPath: 'polygon(0 0, 100% 50%, 0 100%)', transformOrigin: 'right', transform: `scaleX(${0.9 + Math.sin(t * 4) * 0.1})` }} />
        <div style={{ position: 'absolute', right: 70, top: 520, fontFamily: MONO, fontSize: 24, fontWeight: 700, color: C.text2 }}>BUILD DAY</div>
        <svg width="920" height="1100" style={{ position: 'absolute', left: 0, top: 0 }}>
          {wave(0, 18, 880, C.blue, 2.2)}{wave(2, 14, 940, C.accent, 1.7)}{wave(4, 10, 1000, '#7cc4ff', 2.6)}
        </svg>
        {items.map((it, i) => {
          const start = when(words, it.at, 0.3 + i * 0.4);
          const x = interpolate(t, [start, start + 2.6], [-200, 520 - i * 40], { ...clamp, easing: Easing.out(Easing.cubic) });
          const y = 520 + i * 120 + Math.sin(t * 2.4 + i) * 10;
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 12, transform: `rotate(${Math.sin(t * 2.4 + i) * 5}deg)` }}>
              <Boat size={150} />
              <div style={{ background: '#fff', borderRadius: 14, padding: '8px 16px', fontWeight: 800, fontSize: 30, boxShadow: CARD_SHADOW, whiteSpace: 'nowrap' }}>{it.text}</div>
            </div>
          );
        })}
      </Canvas>
    );
  }
  const draw = lerp(t, 0.1, 1.1, 0, 1, Easing.inOut(Easing.cubic));
  const bob = Math.sin(t * 2.4) * 14;
  return (
    <Canvas>
      <svg width="920" height="1100" style={{ position: 'absolute', left: 0, top: 0 }}>
        {wave(0, 22, 760, C.blue, 2.2)}{wave(2, 16, 830, C.accent, 1.7)}{wave(4, 12, 900, '#7cc4ff', 2.6)}
      </svg>
      <div style={{ position: 'absolute', left: 230, top: 330 + bob, transform: `rotate(${Math.sin(t * 2.4 + 0.6) * 6}deg)` }}><Boat size={460} draw={draw} /></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', opacity: label, transform: `translateY(${(1 - label) * 30}px)` }}>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 130, lineHeight: 1 }}>{s.title ?? 'A paper ship.'}</div>
        <div style={{ display: 'inline-block', marginTop: 20, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: '0.16em', background: C.text, color: 'white', borderRadius: 999, padding: '12px 28px' }}>{s.sub ?? 'DECIDED · NOT BUILT YET'}</div>
      </div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ calendar

/** Tear-off calendar racing through the days away, then fog where your memory was. */
export const CalendarScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const days = s.days ?? 14;
  const flipEnd = 2.2;
  const prog = lerp(t, 0.15, flipEnd, 0, 1, Easing.inOut(Easing.quad));
  const cur = Math.min(days, 1 + Math.floor(prog * days));
  const fogAt = capAt(s, when(words, s.at, 2.6), 1.4);
  const fog = lerp(t, fogAt, fogAt + 0.9);
  const title = pop(t, fogAt + 0.2, 11);
  const sinceFlip = (prog * days) % 1;
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 190, top: 60, width: 540, height: 620, perspective: 1400 }}>
        <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 30, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
          <div style={{ height: 130, background: C.red, color: 'white', fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: '0.3em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>DAY</div>
          <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 300, lineHeight: '440px', filter: `blur(${fog * 10}px)` }}>{cur}</div>
        </div>
        {cur < days ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 130, height: 490, background: '#fff', borderRadius: '0 0 30px 30px', transformOrigin: 'top', transform: `rotateX(${sinceFlip * 110}deg)`, opacity: 1 - sinceFlip * 0.6, boxShadow: '0 20px 40px rgba(19,35,59,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 300 }}>{cur}</div>
        ) : null}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: '0.24em', color: C.text2, opacity: lerp(t, flipEnd, flipEnd + 0.3) }}>{s.label ?? `${days} DAYS AWAY`}</div>
      <div style={{ position: 'absolute', left: -80, right: -80, top: 0, height: 900, background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.95) 0%, rgba(246,243,236,0.7) 45%, transparent 70%)', opacity: fog, filter: 'blur(20px)', transform: `translateX(${Math.sin(t) * 30}px)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, opacity: title, transform: `scale(${1.2 - title * 0.2})` }}>{s.title ?? 'Remember nothing.'}</div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ terminal

/** A terminal full of questions you can't answer about your own project. */
export const TerminalScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const frame = useCurrentFrame();
  const blocks: Spec[] = s.blocks;
  return (
    <Canvas>
      <Win dark title="~/beam" style={{ left: 0, top: 0, width: 920, height: 1040 }}>
        <div style={{ padding: '26px 30px', fontFamily: MONO, fontSize: 32, lineHeight: 1.55, color: '#d6e2f0' }}>
          {blocks.map((b, i) => {
            const at = when(words, b.at, 0.3 + i * 1.0);
            if (t < at) return null;
            const typed = b.cmd.slice(0, Math.floor((t - at) * 30));
            const outOn = t > at + b.cmd.length / 30 + 0.15;
            const q = pop(t, at + b.cmd.length / 30 + 0.4, 9);
            return (
              <div key={i} style={{ marginBottom: 22, position: 'relative' }}>
                <div><span style={{ color: '#5fd08e' }}>$ </span>{typed}{!outOn ? <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>▌</span> : null}</div>
                {outOn ? b.out.map((o: string, k: number) => {
                  const hl = b.hl && o.includes(b.hl);
                  return <div key={k} style={{ display: 'block' }}><span style={{ color: hl ? '#1a1a1a' : '#9fb3cc', background: hl ? '#f0c33c' : undefined, display: 'inline-block', padding: hl ? '0 10px' : undefined, borderRadius: 6, transform: hl ? `rotate(${Math.sin(t * 9) * 2}deg)` : undefined, whiteSpace: 'pre' }}>{o}</span></div>;
                }) : null}
                {outOn ? <div style={{ position: 'absolute', right: 10, top: 10, fontFamily: SANS, fontWeight: 800, fontSize: 96, color: '#f0b866', opacity: q, transform: `scale(${0.4 + q * 0.6}) rotate(${Math.sin(t * 3 + i) * 10}deg)` }}>?</div> : null}
              </div>
            );
          })}
        </div>
      </Win>
    </Canvas>
  );
};

// ------------------------------------------------------------------ grave

/** A tombstone rises for the decision you buried; the AI's question drifts by like a ghost. */
export const GraveScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const at = when(words, s.at, 0.5);
  const rise = lerp(t, at, at + 0.9, 0, 1, Easing.out(Easing.back(1.4)));
  const ghostAt = when(words, s.ghostAt, at + 1.4);
  const ghost = lerp(t, ghostAt, ghostAt + 0.6);
  const lines: string[] = s.lines ?? ['HERE LIES', 'That database', 'Ruled out yesterday', 'after a two-hour debate'];
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={when(words, s.titleAt, 0.1)} text={s.title} serif size={100} /></div>
      <div style={{ position: 'absolute', left: 0, top: 220, width: 920, height: 760, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 210, top: 140 + (1 - rise) * 640, width: 500, height: 600, borderRadius: '250px 250px 20px 20px', background: 'linear-gradient(170deg, #d5d8de 0%, #aab0bb 100%)', boxShadow: 'inset -20px -20px 40px rgba(0,0,0,0.12), 0 30px 60px rgba(19,35,59,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 140, gap: 16, color: '#4a5260' }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: '0.3em' }}>{lines[0]}</div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 82, color: '#2f3642' }}>{lines[1]}</div>
          <div style={{ width: 200, height: 4, background: '#7d8594', borderRadius: 2 }} />
          <div style={{ fontSize: 32, fontWeight: 700 }}>{lines[2]}</div>
          <div style={{ fontSize: 28 }}>{lines[3]}</div>
        </div>
        <div style={{ position: 'absolute', left: -100, right: -100, top: 650, height: 300, borderRadius: '50% 50% 0 0', background: '#d9cfb8' }} />
        {[250, 330, 600, 660].map((x, i) => <div key={i} style={{ position: 'absolute', left: x, top: 640 - (i % 2) * 10, width: 34, height: 34, borderRadius: 17, background: [C.red, C.gold, C.purple, C.red][i], opacity: rise, boxShadow: '0 0 0 6px rgba(255,255,255,0.4)' }} />)}
      </div>
      <div style={{ position: 'absolute', left: 470 + Math.sin(t * 1.6) * 40, top: 230 - ghost * 30 + Math.sin(t * 2.4) * 12, opacity: ghost * 0.85, transform: `rotate(${Math.sin(t * 1.8) * 4}deg)` }}>
        <div style={{ background: 'rgba(255,255,255,0.9)', border: `3px dashed ${C.text2}`, borderRadius: 30, padding: '20px 26px', fontSize: 34, fontWeight: 700, color: C.text2 }}>{s.ghost ?? 'Have you considered…?'}</div>
      </div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ graph

/** Busy vs shipped as two lines, or the score line going cold then climbing. */
export const GraphScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const dur = typeof s.dur === 'number' ? s.dur : 5;
  const W = 800;
  const H = 620;
  const items: Spec[] = s.items ?? [];
  const toPts = (fn: (x: number) => number, upTo: number) => {
    const n = Math.max(2, Math.floor(80 * upTo));
    return Array.from({ length: n }).map((_, i) => {
      const x = (i / 79) * W;
      return `${x},${fn(i / 79)}`;
    }).join(' ');
  };
  if (s.phase === 'score') {
    const dropAt = when(words, s.dropAt, 0.8);
    const climbAt = Math.max(dropAt + 1.0, when(words, s.climbAt, dropAt + 1.6));
    const u = interpolate(t, [0, dropAt, dropAt + 0.8, climbAt, climbAt + 1.1], [0.05, 0.35, 0.55, 0.62, 1], clamp);
    const y = (x: number) => (x < 0.35 ? 260 + Math.sin(x * 30) * 10 : x < 0.55 ? interpolate(x, [0.35, 0.55], [260, 520]) : x < 0.65 ? 520 + Math.sin(x * 40) * 6 : interpolate(x, [0.65, 1], [520, 70], { easing: Easing.out(Easing.quad) }));
    const cold = t > dropAt + 0.4 && t < climbAt + 0.3;
    const up = t > climbAt + 0.6;
    const hx = u * W;
    return (
      <Canvas>
        <div style={{ position: 'absolute', left: 60, top: 160, width: W, height: H, background: '#fff', borderRadius: 30, boxShadow: CARD_SHADOW }} />
        <svg width={W} height={H} style={{ position: 'absolute', left: 60, top: 160, overflow: 'visible' }}>
          <defs><linearGradient id="sc" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={C.accent} /><stop offset="45%" stopColor="#8fb7d9" /><stop offset="65%" stopColor="#8fb7d9" /><stop offset="100%" stopColor={C.gold} /></linearGradient></defs>
          <polyline points={toPts(y, u)} fill="none" stroke="url(#sc)" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={hx} cy={y(u)} r={22} fill={up ? C.gold : cold ? '#8fb7d9' : C.accent} stroke="white" strokeWidth={8} />
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 30 }}><Heading t={t} at={0} kicker="Ship Score over time" /></div>
        <div style={{ position: 'absolute', left: 120, top: 860, opacity: cold ? 1 : 0, transform: `scale(${cold ? 1 : 0.8})` }}><div style={{ background: '#5b7a99', color: 'white', fontWeight: 800, fontSize: 44, borderRadius: 999, padding: '16px 36px' }}>Going cold</div></div>
        <div style={{ position: 'absolute', right: 80, top: 860, opacity: up ? 1 : 0, transform: `scale(${up ? 1 : 0.8})` }}><div style={{ background: C.green, color: 'white', fontWeight: 800, fontSize: 44, borderRadius: 999, padding: '16px 36px' }}>You're moving</div></div>
        {cold ? Array.from({ length: 14 }).map((_, i) => <div key={i} style={{ position: 'absolute', left: 60 + rnd(i) * W, top: 160 + ((t * 80 + rnd(i + 4) * H) % H), width: 8, height: 8, borderRadius: 4, background: '#a9c6e0' }} />) : null}
      </Canvas>
    );
  }
  const draw = lerp(t, 0.1, dur - 0.5);
  const busy = (x: number) => 200 + Math.sin(x * 44) * 70 + Math.sin(x * 17) * 40;
  const shipped = () => 520;
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 60, top: 160, width: W, height: H, background: '#fff', borderRadius: 30, boxShadow: CARD_SHADOW }} />
      <svg width={W} height={H} style={{ position: 'absolute', left: 60, top: 160, overflow: 'visible' }}>
        <polyline points={toPts(busy, draw)} fill="none" stroke="#b9b0a0" strokeWidth={10} strokeLinejoin="round" />
        <polyline points={toPts(shipped, draw)} fill="none" stroke={C.accent} strokeWidth={14} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: 60 + draw * W - 60, top: 120 + 200, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: '#8c8372' }}>BUSY</div>
      <div style={{ position: 'absolute', left: 60 + draw * W - 120, top: 160 + 540, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.accent }}>SHIPPED</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 30 }}><Heading t={t} at={0} kicker={s.kicker ?? 'This week'} /></div>
      {items.map((it, i) => {
        const p = pop(t, when(words, it.at, 0.5 + i * 0.6), 9);
        return <div key={i} style={{ position: 'absolute', left: [80, 350, 600][i % 3], top: [220, 170, 240][i % 3], opacity: Math.min(1, p * 1.5), transform: `scale(${0.5 + p * 0.5}) rotate(${[-5, 4, -3][i % 3]}deg)` }}><div style={{ background: C.text, color: 'white', fontWeight: 800, fontSize: 32, borderRadius: 999, padding: '12px 26px', whiteSpace: 'nowrap' }}>{it.text}</div></div>;
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 850, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, opacity: pop(t, when(words, s.flatAt, Math.max(1, dur - 1.2))) }}>{s.flat ?? 'Still flat.'}</div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ lever

/** Pull the biggest lever: the switch drops, the lights come on, the next move appears. */
export const LeverScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const at = capAt(s, when(words, s.at, 1.0), 1.8);
  const pull = pop(t, at, 9, 0.8);
  const card = pop(t, at + 0.6, 11);
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={0} kicker={s.kicker ?? 'Your biggest lever'} /></div>
      <div style={{ position: 'absolute', left: 120, top: 100, display: 'flex', gap: 40 }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const on = t > at + 0.15 + i * 0.1;
          return <div key={i} style={{ width: 100, height: 100, borderRadius: 50, background: on ? 'radial-gradient(circle, #fff3c4, #f0b866)' : '#e4ddcf', boxShadow: on ? '0 0 50px 14px rgba(240,184,102,0.6)' : undefined }} />;
        })}
      </div>
      <div style={{ position: 'absolute', left: 310, top: 330, width: 300, height: 380, borderRadius: 40, background: 'linear-gradient(160deg, #2a3446, #13233b)', boxShadow: CARD_SHADOW }}>
        <div style={{ position: 'absolute', left: 135, top: 60, width: 30, height: 260, borderRadius: 15, background: '#0b1424' }} />
        <div style={{ position: 'absolute', left: 140, top: 190, width: 20, height: 280, transformOrigin: '10px 0px', transform: `rotate(${180 + interpolate(pull, [0, 1], [-40, 40])}deg)` }}>
          <div style={{ width: 20, height: 240, borderRadius: 10, background: '#c9ccd2' }} />
          <div style={{ position: 'absolute', left: -40, top: 220, width: 100, height: 100, borderRadius: 50, background: C.red, boxShadow: 'inset -8px -8px 0 rgba(0,0,0,0.2)' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 800, width: 760, opacity: card, transform: `translateY(${(1 - card) * 50}px)` }}>
        <div style={{ background: '#fff', borderRadius: 28, padding: '28px 34px', boxShadow: CARD_SHADOW, borderTop: `10px solid ${C.green}` }}>
          <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: '0.18em', color: C.green }}>NEXT MOVE</div>
          <div style={{ fontSize: 50, fontWeight: 800, marginTop: 6 }}>{s.card ?? 'Log a session today'}</div>
        </div>
      </div>
      <Burst t={t} at={at + 0.1} x={460} y={600} color={C.gold} size={640} />
    </Canvas>
  );
};

// ------------------------------------------------------------------ slot machine

/** "AI's opinion" as a slot machine: spin, land on whatever, say please, hit 100. */
export const SlotScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const frame = useCurrentFrame();
  const at = capAt(s, when(words, s.at, 1.6), 1.4);
  const digits = String(s.value ?? 73).padStart(3, '0').split('');
  const askAt = s.ask ? when(words, s.askAt, 0.4) : -1;
  const ask = askAt >= 0 ? pop(t, askAt, 11) : 0;
  const spinFrom = askAt >= 0 ? askAt + 0.5 : 0.1;
  const done = t > at + 0.6;
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 50, top: 160, width: 820, height: 640, borderRadius: 50, background: 'linear-gradient(170deg, #1a78d6 0%, #13233b 70%)', boxShadow: CARD_SHADOW }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 42, letterSpacing: '0.24em', color: '#f0c33c' }}>{s.label ?? "AI'S OPINION"}</div>
        {Array.from({ length: 16 }).map((_, i) => <div key={i} style={{ position: 'absolute', left: 30 + i * 49, top: 108, width: 18, height: 18, borderRadius: 9, background: (Math.floor(frame / 4) + i) % 2 ? '#f0c33c' : '#7a6420' }} />)}
        <div style={{ position: 'absolute', left: 60, top: 170, display: 'flex', gap: 30 }}>
          {digits.map((d, i) => {
            const land = at + i * 0.22;
            const spinning = t > spinFrom && t < land;
            const shown = spinning ? String((Math.floor(frame * 1.3) + i * 3) % 10) : t >= land ? d : s.initial?.[i] ?? '–';
            const lp = t >= land ? pop(t, land, 8) : 1;
            return (
              <div key={i} style={{ width: 210, height: 300, borderRadius: 24, background: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 20px 30px rgba(0,0,0,0.18), inset 0 -20px 30px rgba(0,0,0,0.18)' }}>
                <div style={{ fontWeight: 800, fontSize: 220, color: C.text, filter: spinning ? 'blur(5px)' : undefined, transform: `translateY(${spinning ? ((frame % 3) - 1) * 40 : (1 - lp) * -40}px)` }}>{shown}</div>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 510, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#9fd2ff', opacity: done ? 1 : 0 }}>{s.verdict ?? 'TOTALLY OBJECTIVE'}</div>
      </div>
      {s.ask ? (
        <div style={{ position: 'absolute', left: 60, top: 0, opacity: ask, transform: `scale(${0.6 + ask * 0.4})`, transformOrigin: 'left' }}>
          <div style={{ background: C.accent, color: 'white', fontWeight: 700, fontSize: 44, borderRadius: 30, padding: '22px 34px' }}>{s.ask}</div>
        </div>
      ) : null}
      {s.jackpot ? <Confetti t={t} at={at + 0.5} x={460} y={480} /> : null}
      {s.jackpot ? <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, opacity: pop(t, at + 0.7) }}>{s.jackpot}</div> : null}
    </Canvas>
  );
};

// ------------------------------------------------------------------ equation

/** The score as a formula: each input slides in as it's named, then "= 82". Or three runs, same answer. */
export const EquationScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  if (s.phase === 'repeat') {
    const at = when(words, s.at, 0.4);
    return (
      <Canvas>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center', gap: 34 }}>
          {[0, 1, 2].map((i) => {
            const p = pop(t, at + i * 0.45, 9, 0.7);
            return (
              <div key={i} style={{ width: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: INK.muted }}>RUN {i + 1}</div>
                {[C.blue, C.green, C.gold, C.purple, C.amber].map((c, k) => <div key={k} style={{ width: 220, height: 34, borderRadius: 10, background: c, opacity: 0.8 }} />)}
                <div style={{ fontWeight: 800, fontSize: 150, lineHeight: 1, opacity: t < at + i * 0.45 ? 0 : Math.min(1, p * 2), transform: `scale(${2 - p})`, ...gradText() }}>{s.result ?? 82}</div>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 86, opacity: pop(t, at + 1.5) }}>{s.caption ?? 'Same inputs. Same score.'}</div>
      </Canvas>
    );
  }
  const terms: Spec[] = s.terms;
  const ats = terms.map((x, i) => when(words, x.at, 0.4 + i * 0.5));
  const resAt = capAt(s, when(words, s.resultAt, ats[ats.length - 1] + 0.7), 1.0);
  const res = pop(t, resAt, 9);
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {terms.map((x, i) => {
          const p = pop(t, ats[i], 11);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 160}px)` }}>
              <div style={{ width: 70, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 60, ...gradText() }}>{i === 0 ? '' : x.op ?? '+'}</div>
              <div style={{ flex: 1, background: '#fff', borderRadius: 22, padding: '18px 26px', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', gap: 18, borderLeft: `10px solid ${tone(x.color)}` }}>
                <div style={{ fontSize: 42, fontWeight: 800 }}>{x.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 870, height: 8, borderRadius: 4, background: C.text, transformOrigin: 'left', transform: `scaleX(${lerp(t, resAt - 0.3, resAt)})` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 890, textAlign: 'center', opacity: Math.min(1, res * 1.5), transform: `scale(${1.6 - res * 0.6})` }}>
        <span style={{ fontWeight: 800, fontSize: 170, ...gradText() }}>= {s.result ?? 82}</span>
      </div>
      <Burst t={t} at={resAt + 0.1} x={460} y={980} size={600} />
    </Canvas>
  );
};

// ------------------------------------------------------------------ streak

/** Small wins stacking up, one column per day. */
export const StreakScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const stacks: number[] = s.stacks ?? [1, 1, 2, 1, 2, 2, 3];
  const todayAt = when(words, s.todayAt, 0.3);
  const tomorrowAt = Math.max(todayAt + 0.5, when(words, s.tomorrowAt, todayAt + 0.8));
  const restAt = capAt(s, Math.max(tomorrowAt + 0.5, when(words, s.restAt, tomorrowAt + 1)), 2.2);
  const dayAt = (d: number) => (d === 0 ? todayAt : d === 1 ? tomorrowAt : restAt + (d - 2) * 0.28);
  const total = stacks.reduce((n, k, d) => n + (t > dayAt(d) ? k : 0), 0);
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.26em', color: INK.muted }}>SMALL WINS</div>
        <div style={{ fontWeight: 800, fontSize: 150, lineHeight: 1.05, ...gradText() }}>{total}</div>
      </div>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 1000, height: 8, borderRadius: 4, background: '#cfc6b4' }} />
      {days.map((d, i) => {
        const at = dayAt(i);
        return (
          <div key={d} style={{ position: 'absolute', left: 50 + i * 120, top: 300, width: 100, height: 700 }}>
            {Array.from({ length: stacks[i] }).map((_, k) => {
              const p = lerp(t, at + k * 0.12, at + k * 0.12 + 0.3, 0, 1, Easing.in(Easing.quad));
              const land = pop(t, at + k * 0.12 + 0.3, 8);
              if (t < at + k * 0.12) return null;
              return <div key={k} style={{ position: 'absolute', left: 0, top: interpolate(p, [0, 1], [-400, 700 - (k + 1) * 104]), width: 100, height: 96, borderRadius: 16, background: C.green, transform: `scaleY(${0.8 + land * 0.2})`, transformOrigin: 'bottom', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 48 }}>✓</div>;
            })}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 26, color: i < 2 && t > at ? C.text : INK.muted }}>{d}</div>
            {i < 2 ? <div style={{ position: 'absolute', left: -20, right: -20, top: 760, textAlign: 'center', fontWeight: 800, fontSize: 26, color: C.accent, opacity: pop(t, at) }}>{i === 0 ? 'Today' : 'Tomorrow'}</div> : null}
          </div>
        );
      })}
    </Canvas>
  );
};

// ------------------------------------------------------------------ the button

/** One giant checkbox, a cursor circling it: the tease before the tick. */
export const BigCheckScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const p = pop(t, 0.05, 10);
  const glow = 10 + Math.sin(t * 5) * 8;
  const cx = 600 + Math.cos(t * 2.2) * 90;
  const cy = 620 + Math.sin(t * 2.2) * 60;
  return (
    <Canvas>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><Heading t={t} at={when(words, s.at, 0.3)} kicker={s.kicker} text={s.title} serif size={92} /></div>
      <div style={{ position: 'absolute', left: 260, top: 330, width: 400, height: 400, borderRadius: 70, border: `22px solid ${C.green}`, background: '#fff', boxShadow: `${CARD_SHADOW}, 0 0 0 ${glow}px rgba(38,143,83,0.18)`, transform: `scale(${0.5 + p * 0.5}) rotate(${(1 - p) * -20}deg)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontWeight: 800, fontSize: 58, opacity: pop(t, 0.6) }}>{s.todo ?? 'Ship the billing page'}</div>
      <Pointer x={cx} y={cy} />
    </Canvas>
  );
};
