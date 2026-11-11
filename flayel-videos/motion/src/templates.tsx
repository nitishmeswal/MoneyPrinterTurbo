/* Reusable, data-driven motion-graphic scenes. Each shot in kling/motion.json
 * names one of these with its content; items appear when their keyword is
 * spoken (`at`), using the narration's word timings. */
import React from 'react';
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, GRADIENT, MONO, SERIF } from './brand';
import { CARD_SHADOW as SHADOW, Card, INK, Label, Logo, Stage as BaseStage, TEXT_GRADIENT } from './stage';
import { Word, timeOf } from './types';
import { Confetti } from './fx';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Spec = Record<string, any>;

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
const pop = (t: number, at: number, damping = 13) =>
  spring({ frame: Math.round((t - at) * 30), fps: 30, config: { damping, mass: 0.65 } });
const when = (words: Word[], key: string | undefined, fallback: number) =>
  key ? Math.max(0, timeOf(words, key, fallback) - 0.12) : fallback;
/** Shrink long text gently (it wraps onto more lines) instead of to a sliver. */
const fit = (text: string, base: number, perLine: number) =>
  Math.round(base * Math.min(1, Math.sqrt(perLine / Math.max(1, text.length))));

/** Latest a triggered moment may start so its payoff is still on screen. */
const cap = (s: Spec, at: number, payoff: number) =>
  typeof s.dur === 'number' ? Math.min(at, Math.max(0.4, s.dur - payoff)) : at;

const TONE: Record<string, string> = {
  blue: C.blue, accent: C.accent, amber: C.amber, green: C.green, purple: C.purple, red: C.red, gold: C.gold, text: C.text,
};
const tone = (name?: string) => (name && TONE[name]) || C.accent;

/** Tones for text sitting straight on the cream stage. */
const LIGHT: Record<string, string> = {
  blue: C.blue, accent: C.accent, amber: C.amber, green: C.green, purple: C.purple, red: C.red, gold: C.gold, text: INK.text,
};
const light = (name?: string) => (name && LIGHT[name]) || INK.accent;

// The backdrop is drawn once for the whole video (FlayelVideo); scenes only lay out content.
const Stage: React.FC<{ children: React.ReactNode; cool?: boolean; dark?: boolean; align?: 'center' | 'top' }> = ({ children, align }) => (
  <BaseStage align={align}>{children}</BaseStage>
);

// ------------------------------------------------------------------ headline

export const HeadlineScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const k = pop(t, 0);
  const title = pop(t, 0.15);
  const sub = pop(t, when(words, s.at, 0.9));
  return (
    <Stage dark={s.dark}>
      <div style={{ flex: 1, maxHeight: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
        {s.logo ? <div style={{ opacity: k, transform: `translateY(${(1 - k) * 80 + Math.sin(t * 2.3) * 8}px)` }}><Logo size={300} /></div> : null}
        {s.kicker ? <div style={{ opacity: k }}><Label color={INK.accent}>{s.kicker}</Label></div> : null}
        <div style={{ fontWeight: 800, fontSize: fit(s.title, 104, 16), lineHeight: 1.05, textAlign: 'center', opacity: title, transform: `translateY(${(1 - title) * 40}px)` }}>
          {s.title}
        </div>
        {s.sub ? (
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: fit(s.sub, 120, 16), lineHeight: 1.05, textAlign: 'center', opacity: sub, transform: `scale(${0.85 + sub * 0.15})`, background: TEXT_GRADIENT, WebkitBackgroundClip: 'text', color: 'transparent', padding: '0 12px 12px' }}>
            {s.sub}
          </div>
        ) : null}
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ quote

export const QuoteScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const a = pop(t, 0.05);
  const b = pop(t, when(words, s.at, 0.8));
  return (
    <Stage cool={s.cool}>
      <div style={{ flex: 1, maxHeight: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: fit(s.text, 124, 18), lineHeight: 1.08, textAlign: 'center', opacity: a, transform: `scale(${0.88 + a * 0.12})` }}>{s.text}</div>
        {s.sub ? <div style={{ fontWeight: 800, fontSize: fit(s.sub, 80, 20), textAlign: 'center', color: light(s.color), opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>{s.sub}</div> : null}
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ stat

export const StatScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const a = pop(t, 0.05, 11);
  const start = when(words, s.at, 0.2);
  const p = interpolate(t, [start, start + (s.countSeconds ?? 1.4)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const value = typeof s.count === 'number' ? `${s.prefix ?? ''}${Math.round(p * s.count)}${s.suffix ?? ''}` : s.value;
  const lbl = pop(t, start + 0.35);
  return (
    <Stage dark={s.dark}>
      <div style={{ flex: 1, maxHeight: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        {s.kicker ? <Label color={INK.accent}>{s.kicker}</Label> : null}
        <div style={{ fontWeight: 800, fontSize: Math.min(260, Math.round(1450 / Math.max(1, String(s.value ?? `${s.count}${s.suffix ?? ''}`).length))), whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1, opacity: a, transform: `scale(${0.7 + a * 0.3})`, background: TEXT_GRADIENT, WebkitBackgroundClip: 'text', color: 'transparent', padding: '0 10px 16px' }}>
          {value}
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: fit(s.label, 86, 22), textAlign: 'center', opacity: lbl, transform: `translateY(${(1 - lbl) * 30}px)` }}>{s.label}</div>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ list

const MARK: Record<string, { glyph: string; color: string }> = {
  check: { glyph: '✓', color: C.green },
  warn: { glyph: '✕', color: C.red },
  question: { glyph: '?', color: C.amber },
};

/** Chips or rows that appear as each is spoken. `upTo` shows a running checklist. */
export const ListScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const items: Spec[] = s.items.map((x: any) => (typeof x === 'string' ? { text: x } : x));
  const shown = s.upTo ?? items.length;
  const firstNew = s.from ?? 0; // items before this index are already on screen
  const head = pop(t, 0);
  const chips = s.style === 'chips';
  return (
    <Stage>
      {s.label ? <div style={{ marginTop: 40, opacity: head }}><Label>{s.label}</Label></div> : null}
      <div style={{ marginTop: 60, width: 920, display: chips ? 'grid' : 'flex', gridTemplateColumns: chips ? '1fr 1fr' : undefined, flexDirection: 'column', gap: chips ? 36 : 24 }}>
        {items.slice(0, shown).map((item, i) => {
          const at = i < firstNew ? -1 : when(words, item.at, 0.3 + (i - firstNew) * 0.5);
          const p = i < firstNew ? 1 : pop(t, at, 12);
          const fresh = i >= firstNew ? interpolate(t, [at, at + 0.2, at + 0.9], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
          const mark = s.mark ? MARK[s.mark] : null;
          const color = tone(item.color);
          if (chips) {
            return (
              <Card key={i} style={{ height: items.length > 4 ? 170 : 220, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 20px', opacity: Math.min(1, p * 1.5), transform: `scale(${0.5 + p * 0.5}) translateY(${Math.sin(t * 2 + i) * 5}px)`, gridColumn: items.length % 2 && i === items.length - 1 ? 'span 2' : undefined }}>
                <div style={{ width: 26, height: 26, borderRadius: 13, background: color, flex: 'none' }} />
                <div style={{ fontSize: fit(item.text, 60, 11), fontWeight: 800, textAlign: 'center' }}>{item.text}</div>
              </Card>
            );
          }
          return (
            <Card key={i} style={{ padding: '30px 36px', display: 'flex', alignItems: 'center', gap: 28, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 120}px) scale(${1 + fresh * 0.03})`, borderLeft: `10px solid ${mark ? mark.color : color}` }}>
              {s.numbered ? (
                <div style={{ width: 74, height: 74, borderRadius: 37, background: i < shown - 1 && s.upTo ? C.text : GRADIENT, color: 'white', fontWeight: 800, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{i + 1}</div>
              ) : mark ? (
                <div style={{ width: 74, height: 74, borderRadius: 37, background: `${mark.color}1a`, color: mark.color, fontWeight: 800, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{mark.glyph}</div>
              ) : null}
              <div style={{ fontSize: fit(item.text, 52, 24), fontWeight: 700, lineHeight: 1.15 }}>{item.text}</div>
            </Card>
          );
        })}
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ versus

export const VersusScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const sides = [s.left, s.right];
  return (
    <Stage>
      {s.label ? <div style={{ marginTop: 40 }}><Label>{s.label}</Label></div> : null}
      <div style={{ marginTop: 60, width: 940, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
        {sides.map((side: Spec, si: number) => {
          const at = when(words, side.at, si * 0.9 + 0.1);
          const p = pop(t, at, 12);
          const brand = si === 1 && s.rightBrand !== false;
          return (
            <div key={si} style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 80}px)`, background: brand ? 'linear-gradient(160deg, #1a78d6 0%, #13233b 75%)' : C.surface, color: brand ? 'white' : C.text, border: `2px solid ${brand ? '#3a9ff0' : C.border}`, borderRadius: 30, padding: '40px 34px', boxShadow: SHADOW, minHeight: 620 }}>
              <div style={{ fontSize: fit(side.title, 58, 12), fontWeight: 800, lineHeight: 1.05 }}>{side.title}</div>
              <div style={{ height: 6, width: 90, borderRadius: 3, background: brand ? GRADIENT : C.border, margin: '26px 0 30px' }} />
              {side.points.map((pt: string, i: number) => {
                const q = pop(t, at + 0.25 + i * 0.2);
                return (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', fontSize: fit(pt, 40, 16), fontWeight: 600, lineHeight: 1.2, marginBottom: 26, opacity: q, transform: `translateX(${(1 - q) * 30}px)` }}>
                    <span style={{ color: brand ? '#7cc4ff' : C.text2, fontWeight: 800 }}>{brand ? '✓' : '•'}</span>
                    <span>{pt}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ chat

/** A generic AI chat window; `you` lines slide in, `ai` lines type out. */
export const ChatScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const head = pop(t, 0);
  const msgs: Spec[] = s.messages;
  return (
    <Stage cool={s.cool}>
      {s.label ? <div style={{ marginBottom: 30, opacity: head }}><Label color={INK.accent}>{s.label}</Label></div> : null}
      <Card style={{ width: 920, height: s.label ? 980 : 1040, overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: head, transform: `translateY(${(1 - head) * 40}px)` }}>
        <div style={{ height: 80, background: '#f1ede4', borderBottom: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 30px', flex: 'none' }}>
          {[C.red, C.gold, C.green].map((c) => <div key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c }} />)}
          <div style={{ marginLeft: 20, fontSize: 28, color: C.text2, fontWeight: 600 }}>{s.title ?? 'New chat'}</div>
        </div>
        <div style={{ flex: 1, padding: 34, display: 'flex', flexDirection: 'column', gap: 26, justifyContent: 'flex-end' }}>
          {msgs.map((m, i) => {
            const at = when(words, m.at, 0.3 + i * 0.9);
            if (t < at) return null;
            const p = pop(t, at, 14);
            const ai = m.from === 'ai';
            const text = ai ? m.text.slice(0, Math.floor((t - at) * 45)) : m.text;
            return (
              <div key={i} style={{ alignSelf: ai ? 'flex-start' : 'flex-end', maxWidth: '82%', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, display: 'flex', gap: 16, alignItems: 'flex-end', flexDirection: ai ? 'row' : 'row-reverse' }}>
                <div style={{ width: 54, height: 54, borderRadius: 27, flex: 'none', background: ai ? '#e9e3d6' : C.text, color: ai ? C.text2 : 'white', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ai ? 'AI' : 'You'}</div>
                <div style={{ background: ai ? '#f4f1ea' : C.accent, color: ai ? C.text : 'white', borderRadius: 28, padding: '24px 30px', fontSize: Math.max(34, fit(m.text, 40, 40)), fontWeight: 600, lineHeight: 1.3 }}>{text || ' '}</div>
              </div>
            );
          })}
        </div>
        <div style={{ margin: '0 30px 30px', padding: '24px 30px', borderRadius: 22, border: `2px solid ${C.border}`, background: '#fbfaf7', fontSize: 32, color: '#b6ae9f', flex: 'none' }}>Message your AI...</div>
      </Card>
    </Stage>
  );
};

// ------------------------------------------------------------------ bucket

/** One memory bucket; members fill in as they are spoken. */
export const BucketScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const head = pop(t, 0);
  const color = tone(s.color);
  return (
    <Stage>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: head }}>
        <Label color={light(s.color)}>{`Project Brain · ${s.role}`}</Label>
      </div>
      <Card style={{ marginTop: 40, width: 940, padding: '44px 44px 20px', borderTop: `14px solid ${color}`, opacity: head, transform: `translateY(${(1 - head) * 50}px)` }}>
        <div style={{ fontSize: 84, fontWeight: 800, marginBottom: 30 }}>{s.name}</div>
        {s.members.map((m: Spec, i: number) => {
          const filled = m.filled || !m.at ? -1 : when(words, m.at, 0.4 + i * 0.6);
          const shown = filled < 0 || t >= filled;
          const text = filled < 0 ? m.value : shown ? m.value.slice(0, Math.floor((t - filled) * 55)) : '';
          const glow = filled >= 0 ? interpolate(t, [filled, filled + 0.2, filled + 1], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
          return (
            <div key={i} style={{ padding: '24px 0', borderTop: i ? `2px solid ${C.border}` : undefined, display: 'flex', flexDirection: 'column', gap: 10, background: `${color}${Math.round(glow * 24).toString(16).padStart(2, '0')}`, margin: '0 -20px', paddingLeft: 20, paddingRight: 20, borderRadius: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color }}>{m.label}</div>
              <div style={{ fontSize: 42, fontWeight: 600, minHeight: 52, color: text ? C.text : '#c9c1b2' }}>{text || '—'}</div>
            </div>
          );
        })}
      </Card>
    </Stage>
  );
};

// ------------------------------------------------------------------ freshness

/** How long each kind of memory stays fresh, as growing bars. */
export const FreshnessScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const max = s.max ?? 90;
  return (
    <Stage>
      <div style={{ marginTop: 40 }}><Label>{s.label ?? 'Stays fresh for'}</Label></div>
      <div style={{ marginTop: 70, width: 920, display: 'flex', flexDirection: 'column', gap: 40 }}>
        {s.items.map((it: Spec, i: number) => {
          const at = it.shown ? -1 : when(words, it.at, 0.3 + i * 0.6);
          const p = at < 0 ? 1 : interpolate(t, [at, at + 1.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          const vis = at < 0 ? 1 : pop(t, at);
          const hl = s.highlight === it.name;
          return (
            <div key={i} style={{ opacity: vis }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: hl ? 52 : 44, fontWeight: 800, marginBottom: 14 }}>
                <span>{it.name}</span>
                <span style={{ fontFamily: MONO, color: light(it.color) }}>{Math.round(p * it.days)} days</span>
              </div>
              <div style={{ height: hl ? 40 : 30, borderRadius: 20, background: INK.track }}>
                <div style={{ height: '100%', width: `${(p * it.days * 100) / max}%`, borderRadius: 20, background: tone(it.color) }} />
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ recap

export const RecapScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const at = when(words, s.at, 0.3);
  const p = pop(t, at, 12);
  return (
    <Stage>
      <Card style={{ marginTop: 80, width: 920, padding: 50, opacity: p, transform: `translateY(${(1 - p) * 100}px) scale(${0.9 + p * 0.1})`, borderTop: `14px solid ${C.accent}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Logo size={100} />
          <div>
            <Label color={C.accent}>{s.kicker ?? 'Flayel'}</Label>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, lineHeight: 1 }}>{s.title}</div>
          </div>
        </div>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 26 }}>
          {s.lines.map((line: string, i: number) => {
            const q = pop(t, at + 0.5 + i * 0.35);
            const [k, v] = line.split(': ');
            return (
              <div key={i} style={{ opacity: q, transform: `translateX(${(1 - q) * 40}px)`, background: '#f8f5ee', borderRadius: 20, padding: '24px 28px' }}>
                <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.text2 }}>{k}</div>
                <div style={{ fontSize: 44, fontWeight: 700, marginTop: 6 }}>{v}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </Stage>
  );
};

// ------------------------------------------------------------------ todo

/** Ticking a real todo moves the Ship Score at once. */
export const TodoScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const tick = when(words, s.at, 1.0);
  const done = t >= tick;
  const score = Math.round(interpolate(t, [tick, tick + 0.7], [s.from, s.to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const bump = interpolate(t, [tick, tick + 0.2, tick + 0.8], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const head = pop(t, 0);
  return (
    <Stage>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30, opacity: head }}>
        <Label>Ship Score</Label>
        <div style={{ fontSize: 140, fontWeight: 800, background: TEXT_GRADIENT, WebkitBackgroundClip: 'text', color: 'transparent', transform: `scale(${1 + bump * 0.18})`, padding: '0 6px 10px' }}>{score}</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: LIGHT.green, opacity: bump > 0 || done ? 1 : 0 }}>{done ? `+${s.to - s.from}` : ''}</div>
      </div>
      <Card style={{ marginTop: 30, width: 920, padding: '20px 40px', opacity: head }}>
        <div style={{ padding: '24px 0' }}><Label>This week</Label></div>
        {s.todos.map((todo: string, i: number) => {
          const isTick = (i === (s.tick ?? 0) && done) || (s.done ?? []).includes(i);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '28px 0', borderTop: `2px solid ${C.border}` }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, border: `4px solid ${isTick ? C.green : C.border}`, background: isTick ? C.green : 'transparent', color: 'white', fontSize: 44, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${isTick ? 1 + bump * 0.25 : 1})` }}>{isTick ? '✓' : ''}</div>
              <div style={{ fontSize: 44, fontWeight: 600, color: isTick ? C.text2 : C.text, textDecoration: isTick ? 'line-through' : 'none' }}>{todo}</div>
            </div>
          );
        })}
      </Card>
      <Confetti t={t} at={tick} x={540} y={760} count={60} />
    </Stage>
  );
};

// ------------------------------------------------------------------ bird actions

const ACTIONS: Record<string, { button: string; toast: string; page: 'chat' | 'article' }> = {
  capture: { button: 'Capture this AI chat → brain', toast: '✓ Session saved · secrets redacted', page: 'chat' },
  thought: { button: 'Jot a thought  ·  Log a paper ship', toast: '✓ Saved to Thoughts & paper ships', page: 'article' },
  save: { button: 'Scan & save for later', toast: '✓ Saved to your project', page: 'article' },
};

/** The bird on any page: capture a chat, jot a thought, or save the page. */
export const BirdActionScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const action = ACTIONS[s.mode] ?? ACTIONS.capture;
  const arrive = cap(s, when(words, s.at, 0.6), 2.3);
  const fly =interpolate(t, [arrive - 0.6, arrive + 0.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const menu = pop(t, arrive + 0.35, 12);
  const click = arrive + 1.1;
  const pressed = t > click && t < click + 0.2;
  const toast = pop(t, click + 0.25, 12);
  const page = pop(t, 0);
  const highlight = interpolate(t, [arrive - 0.4, arrive + 0.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Stage align="top">
      <Card style={{ width: 920, height: 1080, overflow: 'hidden', opacity: page }}>
        <div style={{ height: 80, background: '#f1ede4', borderBottom: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 30px' }}>
          {[C.red, C.gold, C.green].map((c) => <div key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c }} />)}
          <div style={{ marginLeft: 20, flex: 1, height: 40, borderRadius: 20, background: '#e9e3d6' }} />
        </div>
        {action.page === 'chat' ? (
          <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 26 }}>
            {[
              { ai: false, text: 'How should I add billing with my current stack?' },
              { ai: true, text: 'Use your Postgres invoices table and add a payments service...' },
              { ai: false, text: 'My key is sk-•••••••• (redacted)' },
            ].map((m, i) => (
              <div key={i} style={{ alignSelf: m.ai ? 'flex-start' : 'flex-end', maxWidth: '80%', background: m.ai ? '#f4f1ea' : C.accent, color: m.ai ? C.text : 'white', borderRadius: 26, padding: '22px 28px', fontSize: 36, fontWeight: 600, lineHeight: 1.3 }}>{m.text}</div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 50 }}>
            <div style={{ height: 26, width: 220, borderRadius: 13, background: '#e9e3d6' }} />
            <div style={{ fontSize: 58, fontWeight: 800, marginTop: 24, lineHeight: 1.1 }}>How to keep users after day one</div>
            {[0, 1, 2].map((i) => <div key={i} style={{ height: 22, borderRadius: 11, background: '#ece6da', marginTop: 26, width: `${[96, 88, 92][i]}%` }} />)}
            <div style={{ fontSize: 40, lineHeight: 1.35, marginTop: 34, fontWeight: 500, background: `rgba(58,159,240,${0.22 * highlight})`, borderRadius: 10, padding: '6px 10px' }}>
              Users stick when setup takes under three minutes.
            </div>
            {[0, 1].map((i) => <div key={i} style={{ height: 22, borderRadius: 11, background: '#ece6da', marginTop: 26, width: `${[90, 70][i]}%` }} />)}
          </div>
        )}
      </Card>
      <div style={{ position: 'absolute', left: interpolate(fly, [0, 1], [1100, 680]), top: interpolate(fly, [0, 1], [1300, 960]), transform: `rotate(${interpolate(fly, [0, 1], [-25, 0])}deg)`, opacity: fly }}>
        <Img src={staticFile('flayel-mark.png')} style={{ width: 210, height: 210, objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(19,35,59,0.25))' }} />
      </div>
      <div style={{ position: 'absolute', right: 120, top: 860, opacity: menu, transform: `translateY(${(1 - menu) * 30}px) scale(${pressed ? 0.95 : 1})` }}>
        <div style={{ background: C.text, color: 'white', fontWeight: 800, fontSize: 34, padding: '22px 30px', borderRadius: 22, boxShadow: SHADOW }}>{action.button}</div>
      </div>
      <div style={{ position: 'absolute', top: 1110, left: 110, opacity: toast, transform: `translateY(${(1 - toast) * 30}px)` }}>
        <div style={{ background: C.green, color: 'white', fontWeight: 800, fontSize: 38, padding: '18px 34px', borderRadius: 999, boxShadow: SHADOW }}>{action.toast}</div>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ keys

export const KeysScene: React.FC<{ s: Spec; words: Word[] }> = ({ s, words }) => {
  const t = useT();
  const press = when(words, s.at, 0.9);
  const title = pop(t, press + 0.3);
  return (
    <Stage>
      <div style={{ flex: 1, maxHeight: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 80 }}>
        <div style={{ display: 'flex', gap: 30 }}>
          {['Ctrl', 'Shift', 'S'].map((k, i) => {
            const p = pop(t, 0.1 + i * 0.15, 11);
            const down = t > press + i * 0.05 && t < press + 0.35;
            return (
              <div key={k} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 84, padding: '40px 54px', background: C.surface, color: C.text, border: `3px solid ${C.border}`, borderBottom: `${down ? 4 : 16}px solid ${C.border}`, borderRadius: 26, opacity: p, transform: `translateY(${(1 - p) * 60 + (down ? 12 : 0)}px)`, boxShadow: SHADOW }}>{k}</div>
            );
          })}
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: fit(s.title, 116, 18), textAlign: 'center', lineHeight: 1.05, opacity: title, transform: `translateY(${(1 - title) * 30}px)` }}>{s.title}</div>
      </div>
    </Stage>
  );
};
