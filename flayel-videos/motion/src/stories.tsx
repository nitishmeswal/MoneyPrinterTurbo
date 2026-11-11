/* Story scenes, part one: one visual device per idea, so no two videos feel
 * the same. Coordinates are inside the 920 x 1100 Canvas. */
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, GRADIENT, MONO, SANS, SERIF } from './brand';
import { Burst, Canvas, Heading, Spec, capAt, clamp, gradText, lerp, pop, rnd, shake, useT, when } from './fx';
import { CARD_SHADOW, INK, Logo } from './stage';
import { Word } from './types';

// ------------------------------------------------------------------ shared bits

export const Win: React.FC<{ title?: string; style?: React.CSSProperties; children?: React.ReactNode; dark?: boolean; glow?: number }> = ({ title, style, children, dark, glow = 0 }) => (
  <div style={{ position: 'absolute', background: dark ? '#0f1b2d' : '#ffffff', borderRadius: 26, boxShadow: `${CARD_SHADOW}, 0 0 0 ${glow * 8}px rgba(26,120,214,${glow * 0.35})`, overflow: 'hidden', border: `1px solid ${dark ? '#22344f' : C.border}`, ...style }}>
    <div style={{ height: 66, background: dark ? '#16263d' : '#f1ede4', display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', borderBottom: `2px solid ${dark ? '#22344f' : C.border}` }}>
      {[C.red, C.gold, C.green].map((c) => <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />)}
      <div style={{ marginLeft: 14, fontSize: 26, fontWeight: 600, color: dark ? '#9fb3cc' : C.text2, fontFamily: SANS }}>{title}</div>
    </div>
    <div style={{ position: 'relative', height: 'calc(100% - 66px)' }}>{children}</div>
  </div>
);

export const Pointer: React.FC<{ x: number; y: number; pressed?: boolean; opacity?: number }> = ({ x, y, pressed, opacity = 1 }) => (
  <svg width="64" height="82" viewBox="0 0 24 30" style={{ position: 'absolute', left: x, top: y, opacity, transform: `scale(${pressed ? 0.85 : 1})`, filter: 'drop-shadow(0 6px 10px rgba(19,35,59,0.3))' }}>
    <path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 16 L20 16 Z" fill={C.text} stroke="white" strokeWidth="1.6" />
  </svg>
);

const Chip: React.FC<{ text: string; color?: string; style?: React.CSSProperties; dark?: boolean }> = ({ text, color = C.accent, style, dark }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: dark ? color : '#fff', color: dark ? '#fff' : C.text, border: `2px solid ${dark ? color : C.border}`, borderRadius: 999, padding: '14px 28px', fontWeight: 800, fontSize: 34, boxShadow: CARD_SHADOW, whiteSpace: 'nowrap', ...style }}>
    {dark ? null : <div style={{ width: 18, height: 18, borderRadius: 9, background: color }} />}
    {text}
  </div>
);

const tone = (n?: string) => (n && (C as Record<string, string>)[n]) || C.accent;

// ------------------------------------------------------------------ counter

/** The same sentence typed again and again: copies pile up while a counter races. */
export const CounterScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const end = capAt(s, when(words, s.at, 3), 1.0);
  const p = lerp(t, 0.15, end, 0, 1, Easing.in(Easing.quad));
  const n = Math.max(1, Math.round(1 + p * ((s.to ?? 100) - 1)));
  const thresholds = [1, 2, 3, 5, 8, 12, 17, 23, 30, 38, 47, 57, 68, 80, 92, 100];
  const landed = t >= end;
  const sx = shake(t, end, 18);
  return (
    <Canvas>
      <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', transform: `translateX(${sx}px)` }}>
        <div style={{ fontWeight: 800, fontSize: 250, lineHeight: 1, letterSpacing: '-0.04em', ...(landed ? { color: C.red } : gradText()), transform: `scale(${landed ? 1 + Math.max(0, 0.15 - (t - end) * 0.4) : 1})` }}>×{n}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: '0.3em', color: INK.muted, marginTop: 6 }}>{landed ? (s.landLabel ?? 'AND COUNTING') : (s.label ?? 'TIMES')}</div>
      </div>
      {thresholds.map((th, k) => {
        if (n < th) return null;
        const at = k === 0 ? 0.15 : 0.15 + (end - 0.15) * Math.sqrt((th - 1) / ((s.to ?? 100) - 1));
        const d = pop(t, at, 11, 0.5);
        const rot = (rnd(k) - 0.5) * 16;
        const x = (rnd(k + 20) - 0.5) * 160;
        return (
          <div key={k} style={{ position: 'absolute', left: 80 + x, top: 470 + k * 26 - (1 - d) * 400, width: 760, opacity: Math.min(1, d * 2), transform: `rotate(${rot * d}deg)` }}>
            <div style={{ background: k === thresholds.length - 1 || n < (thresholds[k + 1] ?? 999) ? C.accent : '#4f8fd0', color: 'white', borderRadius: 30, padding: '28px 36px', fontSize: 46, fontWeight: 700, boxShadow: CARD_SHADOW }}>{s.phrase}</div>
          </div>
        );
      })}
      <Burst t={t} at={end} x={460} y={140} color={C.red} size={600} />
    </Canvas>
  );
};

// ------------------------------------------------------------------ typing

/** A prompt box filling with the same long explanation, scrolling, word count climbing. */
export const TypingScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const frame = useCurrentFrame();
  const typed = s.text.slice(0, Math.max(0, Math.floor((t - 0.2) * (s.cps ?? 34))));
  const count = typed.trim() ? typed.trim().split(/\s+/).length : 0;
  const tags: Spec[] = s.tags ?? [];
  return (
    <Canvas>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {tags.map((tag, i) => {
          const p = pop(t, when(words, tag.at, 0.4 + i * 0.7), 10);
          return <div key={i} style={{ opacity: Math.min(1, p * 1.5), transform: `scale(${0.6 + p * 0.4})` }}><Chip text={tag.text} color={tone(tag.color)} style={{ width: '100%', justifyContent: 'center', fontSize: 34 }} /></div>;
        })}
      </div>
      <Win title={s.title ?? 'New chat'} style={{ left: 0, top: 230, width: 920, height: 780 }}>
        <div style={{ position: 'absolute', right: 24, top: 18, fontFamily: MONO, fontSize: 26, fontWeight: 700, color: count > 60 ? C.red : C.text2, background: '#f4f1ea', borderRadius: 12, padding: '6px 14px' }}>{count} words</div>
        <div style={{ position: 'absolute', left: 36, right: 36, top: 80, bottom: 36, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 40, lineHeight: 1.45, fontWeight: 500, color: C.text }}>
            {typed}
            <span style={{ display: 'inline-block', width: 4, height: 46, background: C.accent, marginLeft: 4, verticalAlign: 'middle', opacity: frame % 20 < 10 ? 1 : 0 }} />
          </div>
        </div>
      </Win>
    </Canvas>
  );
};

// ------------------------------------------------------------------ scatter

const SCATTER = [
  [250, 150, -7], [680, 290, 5], [230, 540, 4], [690, 670, -6], [290, 880, 6], [660, 960, -3],
];

/** Ideas scattered across apps; they drift away, or fly together into one home. */
export const ScatterScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const items: Spec[] = s.items;
  const loseAt = s.loseAt ? when(words, s.loseAt, 99) : 99;
  const lose = lerp(t, loseAt - 0.3, loseAt + 1.0, 0, 1, Easing.inOut(Easing.cubic));
  const ga = s.gatherAt ?? 0.35;
  const g = s.gather ? lerp(t, ga, ga + 1.0, 0, 1, Easing.inOut(Easing.cubic)) : 0;
  const home = pop(t, ga + 0.85, 10);
  return (
    <Canvas>
      {items.map((it, i) => {
        const [x, y, r] = SCATTER[i % SCATTER.length];
        const at = s.gather ? -1 : when(words, it.at, 0.2 + i * 0.5);
        const p = at < 0 ? 1 : pop(t, at, 11);
        const bob = Math.sin(t * 1.7 + i) * 8;
        const dx = (x - 460) * 0.55 * lose;
        const dy = (y - 550) * 0.45 * lose;
        const cx = interpolate(g, [0, 1], [x + dx, 460]);
        const cy = interpolate(g, [0, 1], [y + dy + bob, 560]);
        const sc = interpolate(g, [0, 1], [1, 0.12]) * (0.5 + p * 0.5);
        return (
          <div key={i} style={{ position: 'absolute', left: cx - 200, top: cy - 90, width: 400, opacity: Math.min(1, p * 1.6) * (1 - lose * 0.7) * (g > 0.95 ? 0 : 1), transform: `rotate(${r * (1 - g) + (1 - p) * 25}deg) scale(${sc})`, filter: `blur(${lose * 6}px) grayscale(${lose})` }}>
            <div style={{ background: it.paper ?? '#fff', borderRadius: 22, padding: '22px 26px', boxShadow: CARD_SHADOW, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 21, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: tone(it.color) }}>
                <div style={{ width: 14, height: 14, borderRadius: 7, background: tone(it.color) }} />{it.src}
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 10, lineHeight: 1.2 }}>{it.text}</div>
            </div>
          </div>
        );
      })}
      {s.loseText ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 140, opacity: lerp(t, loseAt, loseAt + 0.4), transform: `scale(${0.85 + lerp(t, loseAt, loseAt + 0.5) * 0.15})` }}>{s.loseText}</div>
      ) : null}
      {s.gather ? (
        <div style={{ position: 'absolute', left: 160, top: 330, width: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: Math.min(1, home * 1.5), transform: `scale(${0.6 + home * 0.4})` }}>
          <div style={{ background: '#fff', borderRadius: 40, padding: '40px 60px', boxShadow: `${CARD_SHADOW}, 0 0 0 10px rgba(58,159,240,0.15)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Logo size={200} />
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: '0.24em', color: C.accent }}>PROJECT BRAIN</div>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 92 }}>{s.homeText ?? 'One home.'}</div>
          </div>
        </div>
      ) : null}
      {s.gather ? <Burst t={t} at={ga + 0.9} x={460} y={560} size={820} /> : null}
    </Canvas>
  );
};

// ------------------------------------------------------------------ decay

/** An endless chat: the early rule scrolls away and blurs while focus drains. */
export const DecayScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const dur = typeof s.dur === 'number' ? s.dur : 8;
  const prog = lerp(t, 0.2, dur - 0.6);
  const n = Math.round(3 + prog * (Number(s.count ?? 200) - 3));
  const scroll = t * 240 + t * t * 18;
  const tags: Spec[] = s.tags ?? [];
  const focus = interpolate(prog, [0, 1], [1, 0.22]);
  return (
    <Canvas>
      <Win title={s.title ?? 'Claude · one long chat'} style={{ left: 0, top: 0, width: 920, height: 800 }}>
        <div style={{ position: 'absolute', right: 24, top: -50, fontFamily: MONO, fontSize: 26, fontWeight: 700, color: C.red }}>message {n}</div>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 30, right: 30, top: 30 - scroll }}>
            <div style={{ background: '#fff7e6', border: `3px solid ${C.gold}`, borderRadius: 22, padding: '20px 24px', marginBottom: 26, filter: `blur(${prog * 6}px)`, opacity: 1 - prog * 0.6 }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.amber }}>MESSAGE 3 · YOUR RULE</div>
              <div style={{ fontSize: 36, fontWeight: 700, marginTop: 6 }}>{s.rule}</div>
            </div>
            {Array.from({ length: 60 }).map((_, i) => {
              const you = i % 2 === 0;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: you ? 'flex-end' : 'flex-start', marginBottom: 22 }}>
                  <div style={{ width: you ? 420 : 640, background: you ? 'rgba(26,120,214,0.14)' : '#f4f1ea', borderRadius: 22, padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Array.from({ length: you ? 1 : 2 + (i % 3) }).map((__, k) => <div key={k} style={{ height: 16, borderRadius: 8, background: you ? 'rgba(26,120,214,0.35)' : '#ddd6c8', width: `${70 + rnd(i * 7 + k) * 30}%` }} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ position: 'absolute', right: 26, top: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 18 }}>
          {tags.map((tag, i) => {
            const at = when(words, tag.at, 1 + i);
            const p = pop(t, at, 9);
            return <div key={i} style={{ opacity: Math.min(1, p * 2), transform: `scale(${1.6 - 0.6 * p}) rotate(${(i % 2 ? 3 : -3) * p}deg) translateX(${shake(t, at + 0.1, 10)}px)` }}><Chip dark text={tag.text} color={C.red} style={{ fontSize: 36 }} /></div>;
          })}
        </div>
      </Win>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 850 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 34 }}>
          <span>{s.meter ?? 'Focus on your project'}</span>
          <span style={{ fontFamily: MONO, color: focus < 0.5 ? C.red : C.green }}>{Math.round(focus * 100)}%</span>
        </div>
        <div style={{ height: 30, borderRadius: 15, background: INK.track, marginTop: 14 }}>
          <div style={{ height: '100%', width: `${focus * 100}%`, borderRadius: 15, background: `linear-gradient(90deg, ${C.red}, ${focus < 0.5 ? C.red : C.green})` }} />
        </div>
      </div>
    </Canvas>
  );
};

// ------------------------------------------------------------------ cycle

/** A loop that draws itself node by node around the Project Brain. */
export const CycleScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const nodes: Spec[] = s.nodes;
  const R = 330;
  const cx = 460;
  const cy = 540;
  const ats = nodes.map((n, i) => capAt(s, when(words, n.at, 0.5 + i * 0.8), 1.4 - i * 0.2));
  const sorted = ats.map((a, i) => Math.max(a, i ? ats[i - 1] + 0.3 : 0));
  const prog = interpolate(t, [...sorted, sorted[sorted.length - 1] + 0.8], [0, 0.25, 0.5, 0.75, 1].slice(0, sorted.length + 1), clamp);
  const circ = 2 * Math.PI * R;
  const done = t > sorted[sorted.length - 1] + 0.8;
  const comet = (t - (sorted[sorted.length - 1] + 0.8)) * 1.8 - Math.PI / 2;
  const center = pop(t, 0.05, 11);
  return (
    <Canvas>
      <svg width="920" height="1100" style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <linearGradient id="cyc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.blue} /><stop offset="60%" stopColor={C.accent} /><stop offset="100%" stopColor={C.gold} />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R} stroke={INK.track} strokeWidth={22} fill="none" />
        <circle cx={cx} cy={cy} r={R} stroke="url(#cyc)" strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)} transform={`rotate(-90 ${cx} ${cy})`} />
        {done ? <circle cx={cx + Math.cos(comet) * R} cy={cy + Math.sin(comet) * R} r={22} fill="white" stroke={C.accent} strokeWidth={8} /> : null}
      </svg>
      <div style={{ position: 'absolute', left: cx - 170, top: cy - 150, width: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: center, transform: `scale(${0.6 + center * 0.4})` }}>
        <Logo size={190} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: C.accent }}>{s.center ?? 'PROJECT BRAIN'}</div>
      </div>
      {nodes.map((n, i) => {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / nodes.length;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        const p = pop(t, sorted[i], 10);
        return (
          <div key={i} style={{ position: 'absolute', left: Math.min(920 - 330, Math.max(0, x - 165)), top: y - 62, width: 330, opacity: Math.min(1, p * 1.6), transform: `scale(${0.5 + p * 0.5})` }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: '18px 22px', boxShadow: CARD_SHADOW, borderLeft: `10px solid ${tone(n.color)}`, textAlign: 'left' }}>
              <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: tone(n.color), letterSpacing: '0.14em' }}>STEP {i + 1}</div>
              <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, marginTop: 4 }}>{n.text}</div>
            </div>
          </div>
        );
      })}
    </Canvas>
  );
};

// ------------------------------------------------------------------ install / connect

/** Add the bird to Chrome (it flies into the toolbar), or watch it connect with no token. */
export const InstallScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const at = capAt(s, when(words, s.at, 1.0), 2.2);
  if (s.phase === 'connect') {
    const line = lerp(t, 0.3, at, 0, 1, Easing.inOut(Easing.cubic));
    const ok = pop(t, at, 10);
    const noAt = capAt(s, when(words, s.noAt, at + 1), 1.0);
    const no = pop(t, noAt, 11);
    const strike = lerp(t, noAt + 0.25, noAt + 0.6);
    return (
      <Canvas>
        <Win title="flayel.com · Beam" style={{ left: 110, top: 0, width: 700, height: 300 }}>
          <div style={{ padding: 30, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: C.green, boxShadow: `0 0 0 ${6 + Math.sin(t * 5) * 4}px rgba(38,143,83,0.2)` }} />
            <div><div style={{ fontSize: 44, fontWeight: 800 }}>Project open</div><div style={{ fontSize: 28, color: C.text2 }}>Signed in to Flayel</div></div>
          </div>
        </Win>
        <svg width="920" height="1100" style={{ position: 'absolute', left: 0, top: 0 }}>
          <line x1={460} y1={300} x2={460} y2={300 + 240 * line} stroke={C.accent} strokeWidth={10} strokeDasharray="22 16" strokeDashoffset={-t * 80} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', left: 310, top: 540, width: 300, height: 300, borderRadius: 150, background: '#fff', boxShadow: `${CARD_SHADOW}, 0 0 0 ${ok * 14}px rgba(38,143,83,0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo size={210} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', opacity: ok, transform: `scale(${0.6 + ok * 0.4})` }}>
          <Chip dark text="✓ Connected" color={C.green} style={{ fontSize: 40 }} />
        </div>
        <div style={{ position: 'absolute', left: 110, top: 900, width: 700, opacity: no, transform: `translateY(${(1 - no) * 30}px)` }}>
          <div style={{ position: 'relative', border: `3px dashed ${C.border}`, borderRadius: 20, padding: '22px 28px', fontFamily: MONO, fontSize: 32, color: '#a39a8a', background: '#fff' }}>
            Paste API token here…
            <div style={{ position: 'absolute', left: 16, top: '50%', height: 8, width: `${strike * 94}%`, background: C.red, borderRadius: 4, transform: 'rotate(-3deg)' }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontWeight: 800, fontSize: 40, color: C.red, opacity: strike }}>No tokens to paste</div>
        </div>
        <Burst t={t} at={at} x={460} y={690} color={C.green} size={520} />
      </Canvas>
    );
  }
  const click = at;
  const cx = interpolate(t, [0, click], [780, 470], { ...clamp, easing: Easing.out(Easing.cubic) });
  const cy = interpolate(t, [0, click], [980, 640], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pressed = t > click && t < click + 0.18;
  const fly = lerp(t, click + 0.2, click + 1.0, 0, 1, Easing.inOut(Easing.cubic));
  const bx = interpolate(fly, [0, 1], [400, 770]);
  const by = interpolate(fly, [0, 0.5, 1], [470, 120, 18]);
  const bs = interpolate(fly, [0, 1], [150, 54]);
  const landed = t > click + 1.0;
  const toast = pop(t, click + 1.1, 11);
  return (
    <Canvas>
      <Win title="Chrome Web Store" style={{ left: 0, top: 0, width: 920, height: 980 }}>
        <div style={{ position: 'absolute', right: 24, top: -54, display: 'flex', gap: 14, alignItems: 'center' }}>
          {['#d9d2c4', '#d9d2c4'].map((c, i) => <div key={i} style={{ width: 34, height: 34, borderRadius: 10, background: c }} />)}
          <div style={{ width: 44, height: 44, borderRadius: 12, background: landed ? 'rgba(58,159,240,0.18)' : 'transparent', boxShadow: landed ? `0 0 0 ${Math.max(0, 10 - (t - click - 1) * 20)}px rgba(58,159,240,0.25)` : undefined }} />
        </div>
        <div style={{ padding: '60px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 230, height: 230, borderRadius: 50, background: '#f6f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fly > 0 ? 0.25 : 1 }}><Logo size={190} /></div>
          <div style={{ fontSize: 72, fontWeight: 800 }}>Flayel</div>
          <div style={{ fontSize: 32, color: C.text2 }}>Your project, in every AI chat</div>
          <div style={{ marginTop: 40, background: GRADIENT, color: 'white', fontWeight: 800, fontSize: 46, padding: '26px 60px', borderRadius: 20, transform: `scale(${pressed ? 0.93 : 1})`, boxShadow: CARD_SHADOW }}>{landed ? '✓ Added' : 'Add to Chrome'}</div>
        </div>
      </Win>
      {fly > 0 ? <div style={{ position: 'absolute', left: bx - bs / 2 + 60, top: by - bs / 2 + 60, transform: `rotate(${(1 - fly) * -20}deg)` }}><Logo size={bs} /></div> : null}
      <Pointer x={cx} y={cy} pressed={pressed} opacity={lerp(t, click + 0.5, click + 0.9, 1, 0)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', justifyContent: 'center', opacity: toast, transform: `translateY(${(1 - toast) * 30}px)` }}>
        <Chip dark text="✓ Bird pinned to Chrome" color={C.green} />
      </div>
      <Burst t={t} at={click + 1.0} x={830} y={78} size={260} />
    </Canvas>
  );
};

// ------------------------------------------------------------------ roll

/** "Same three keys on ___": the tool name rolls like a ticker, then they all line up. */
export const RollScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const items: Spec[] = s.items;
  const ats = items.map((it, i) => when(words, it.at, 0.6 + i * 0.6));
  const cur = Math.max(0, ats.reduce((k, a, i) => (t >= a ? i : k), 0));
  const since = t - ats[cur];
  const p = Math.min(1, Math.max(0, since / 0.25));
  const allAt = capAt(s, ats[ats.length - 1] + 0.9, 1.2);
  const all = pop(t, allAt, 12);
  const pressing = Math.floor(t / 0.9) % 2 === 0 && (t % 0.9) < 0.18;
  return (
    <Canvas>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {['Ctrl', 'Shift', 'S'].map((k) => (
          <div key={k} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 52, padding: '22px 36px', background: '#fff', border: `3px solid ${C.border}`, borderBottom: `${pressing ? 4 : 13}px solid ${C.border}`, borderRadius: 20, transform: `translateY(${pressing ? 9 : 0}px)`, boxShadow: CARD_SHADOW }}>{k}</div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 400, left: 0, right: 0, textAlign: 'center', fontWeight: 800, fontSize: 60, opacity: pop(t, 0) }}>{s.prefix}</div>
      <div style={{ position: 'absolute', top: 500, left: 0, right: 0, height: 190, overflow: 'hidden', opacity: 1 - all }}>
        <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 800, fontSize: 150, lineHeight: '190px', transform: `translateY(${(1 - p) * 190}px)`, filter: `blur(${(1 - p) * 8}px)`, ...gradText() }}>{items[cur].text}</div>
        {cur > 0 && p < 1 ? <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 800, fontSize: 150, lineHeight: '190px', transform: `translateY(${-p * 190}px)`, opacity: 1 - p, color: C.text }}>{items[cur - 1].text}</div> : null}
      </div>
      <div style={{ position: 'absolute', top: 540, left: 0, right: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22, opacity: all, transform: `scale(${0.8 + all * 0.2})` }}>
        {items.map((it, i) => <Chip key={i} text={it.text} color={tone(it.color)} style={{ fontSize: 46, padding: '20px 36px' }} />)}
      </div>
    </Canvas>
  );
};
