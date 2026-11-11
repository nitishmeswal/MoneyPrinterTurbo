import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { C, GRADIENT, MONO, SANS, SERIF } from './brand';
import { Shot, Word, timeOf } from './types';
import * as T from './templates';
import * as S1 from './stories';
import * as S2 from './stories2';
import * as S3 from './stories3';
import { KineticScene } from './fx';
import { CARD_SHADOW, Card, INK, Label, Logo, Stage, TEXT_GRADIENT } from './stage';

// ------------------------------------------------------------------ helpers

const usePop = (atSeconds: number, damping = 13) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(atSeconds * fps), fps, config: { damping, mass: 0.7 } });
};

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

const typed = (text: string, t: number, start: number, cps = 55) =>
  text.slice(0, Math.max(0, Math.floor((t - start) * cps)));

// ------------------------------------------------------------------ scenes

export const IntroScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const t = useT();
  const bird = usePop(0.05, 11);
  const name = usePop(0.45);
  const tag = usePop(Math.max(0.6, timeOf(words, 'thirty', 0.9) - 0.1));
  return (
    <Stage>
      <div style={{ transform: `translateY(${(1 - bird) * 260 + Math.sin(t * 2.2) * 10}px) rotate(${(1 - bird) * -25}deg) scale(${0.6 + bird * 0.4})`, opacity: bird }}>
        <Logo size={430} />
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 118, letterSpacing: '0.3em', marginTop: 10, opacity: name, transform: `translateY(${(1 - name) * 40}px)` }}>
        FLAYEL
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, marginTop: 30, opacity: tag, transform: `scale(${0.8 + tag * 0.2})`, background: TEXT_GRADIENT, WebkitBackgroundClip: 'text', color: 'transparent' }}>
        in 30 seconds
      </div>
    </Stage>
  );
};

const TOOLS: { name: string; color: string }[] = [
  { name: 'Claude', color: C.amber },
  { name: 'ChatGPT', color: C.green },
  { name: 'Cursor', color: C.text },
  { name: 'Gemini', color: C.blue },
];

export const ToolsScene: React.FC<{ shot: Shot; words: Word[] }> = ({ shot, words }) => {
  const t = useT();
  const head = usePop(0);
  const tools = TOOLS.filter((x) => shot.voiceover.toLowerCase().includes(x.name.toLowerCase()));
  return (
    <Stage>
      <div style={{ opacity: head, transform: `translateY(${(1 - head) * 30}px)`, textAlign: 'center' }}>
        <Label>Every day you build with</Label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, marginTop: 70, width: 900 }}>
        {tools.map((tool, i) => {
          const at = timeOf(words, tool.name, 0.4 + i * 0.4) - 0.1;
          const p = spring({ frame: Math.round((t - at) * 30), fps: 30, config: { damping: 11, mass: 0.6 } });
          return (
            <Card key={tool.name} style={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: Math.min(1, p * 1.4), transform: `scale(${0.5 + p * 0.5}) translateY(${Math.sin(t * 2 + i) * 6}px)` }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: tool.color }} />
              <div style={{ fontSize: 70, fontWeight: 800 }}>{tool.name}</div>
            </Card>
          );
        })}
      </div>
    </Stage>
  );
};

type Spec = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const ForgetScene: React.FC<{ words: Word[]; s?: Spec }> = ({ words, s = {} }) => {
  const t = useT();
  const forget = timeOf(words, s.at ?? 'forgets', 1.0);
  const notes: string[] = s.notes ?? ['Stack: Next.js + Supabase', 'Decided: no Firebase', 'Next: the billing page'];
  const after = usePop(forget + 0.6);
  return (
    <Stage>
      <div>
        <Label>{s.label ?? 'What your AI knew yesterday'}</Label>
      </div>
      <div style={{ marginTop: 70, display: 'flex', flexDirection: 'column', gap: 34, width: 860, position: 'relative' }}>
        {notes.map((note, i) => {
          const inP = spring({ frame: Math.round((t - i * 0.18) * 30), fps: 30, config: { damping: 14 } });
          const gone = interpolate(t, [forget + i * 0.15, forget + 0.9 + i * 0.15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad) });
          return (
            <Card key={note} style={{ padding: '38px 44px', alignSelf: i % 2 ? 'flex-end' : 'flex-start', opacity: inP * (1 - gone), filter: `blur(${gone * 14}px) grayscale(${gone})`, transform: `translateY(${(1 - inP) * 40 - gone * 120}px)` }}>
              <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 500 }}>{note}</div>
            </Card>
          );
        })}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, opacity: after, transform: `scale(${0.85 + after * 0.15})` }}>
          {s.outro ?? '...gone.'}
        </div>
      </div>
    </Stage>
  );
};

const BUCKETS = [
  { name: 'Vision', role: 'The North Star', color: C.blue, line: 'Invoices for freelancers' },
  { name: 'Architecture', role: 'The Blueprint', color: C.purple, line: 'Next.js · FastAPI · Postgres' },
  { name: 'Progress', role: 'The Pulse', color: C.green, line: 'Auth done · billing next' },
  { name: 'Decisions', role: 'The Ledger', color: C.amber, line: 'Postgres, not Firebase' },
];

export const BrainScene: React.FC<{ words: Word[]; s?: Spec }> = ({ words, s = {} }) => {
  const t = useT();
  const head = usePop(0);
  const highlight: string[] | undefined = s.highlight;
  return (
    <Stage>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: head }}>
        <Label color={INK.accent}>Flayel · Project Brain</Label>
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, marginTop: 10, opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>
        {s.title ?? 'One memory.'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34, marginTop: 50, width: 920 }}>
        {BUCKETS.map((b, i) => {
          // Cards arrive with "brain", then each one pulses as its name is spoken.
          const arrive = Math.min(0.9, Math.max(0.3, timeOf(words, 'brain', 1.0) - 0.3)) + i * 0.14;
          const named = timeOf(words, b.name, arrive + 1 + i * 0.5);
          const p = spring({ frame: Math.round((t - arrive) * 30), fps: 30, config: { damping: 12, mass: 0.6 } });
          const lit = !highlight || highlight.includes(b.name);
          const pulse = lit ? interpolate(t, [named - 0.05, named + 0.15, named + 0.6], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
          return (
            <Card key={b.name} style={{ padding: '34px 34px 38px', opacity: Math.min(1, p * 1.5) * (lit ? 1 : 0.45), transform: `translateY(${(1 - p) * 80}px) scale(${0.85 + p * 0.15 + pulse * 0.06})`, borderTop: `10px solid ${b.color}`, boxShadow: `${CARD_SHADOW}, 0 0 0 ${pulse * 8}px ${b.color}55` }}>
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.2em', color: b.color, fontWeight: 700, textTransform: 'uppercase' }}>{b.role}</div>
              <div style={{ fontSize: 52, fontWeight: 800, marginTop: 10 }}>{b.name}</div>
              <div style={{ fontSize: 28, color: C.text2, marginTop: 12 }}>{b.line}</div>
            </Card>
          );
        })}
      </div>
    </Stage>
  );
};

const CONTEXT_LINES = [
  '# Project: Beam',
  'Vision: invoices for freelancers',
  'Stack: Next.js · FastAPI · Postgres',
  'Works: auth, invoices',
  'Next: the billing page',
  'Decided: Postgres, not Firebase',
];

export const ContextScene: React.FC<{ words: Word[]; s?: Spec }> = ({ words, s = {} }) => {
  const t = useT();
  const spokenClick = Math.max(0.5, timeOf(words, s.at ?? 'click', 0.6));
  const click = typeof s.dur === 'number' ? Math.min(spokenClick, Math.max(0.5, s.dur - 2.6)) : spokenClick;
  const fixedTool = TOOLS.findIndex((x) => x.name === s.tool);
  // Cursor glides onto the Copy context button (centre ~540, 375), clicks, then fades.
  const cursorX = interpolate(t, [0, click], [820, 520], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const cursorY = interpolate(t, [0, click], [730, 365], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const cursorOpacity = interpolate(t, [click + 0.4, click + 0.8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pressed = t > click && t < click + 0.18;
  const sheet = usePop(click + 0.15, 14);
  const tool = fixedTool >= 0 ? fixedTool : Math.floor(Math.max(0, t - click - 0.4) / 0.55) % TOOLS.length;
  return (
    <Stage align="top">
      <div style={{ marginTop: 30 }}>
        <Label>One click</Label>
      </div>
      <div style={{ marginTop: 50, position: 'relative', width: 920, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: GRADIENT, color: 'white', fontWeight: 800, fontSize: 48, padding: '30px 64px', borderRadius: 22, boxShadow: CARD_SHADOW, transform: `scale(${pressed ? 0.94 : 1})` }}>
          Copy context
        </div>
      </div>
      <Card style={{ marginTop: 60, width: 920, padding: 40, opacity: sheet, transform: `translateY(${(1 - sheet) * 120}px)` }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 30 }}>
          {TOOLS.map((x, i) => (
            <div key={x.name} style={{ fontSize: 28, fontWeight: 600, padding: '10px 22px', borderRadius: 999, background: i === tool ? C.text : 'transparent', color: i === tool ? 'white' : C.text2, border: `2px solid ${i === tool ? C.text : C.border}` }}>
              {x.name}
            </div>
          ))}
        </div>
        {CONTEXT_LINES.map((line, i) => (
          <div key={line} style={{ fontFamily: MONO, fontSize: 32, lineHeight: 1.6, color: i === 0 ? C.accent : C.text, fontWeight: i === 0 ? 700 : 500, minHeight: 51 }}>
            {typed(line, t, click + 0.3 + i * 0.32, 70)}
          </div>
        ))}
      </Card>
      <svg width="70" height="90" viewBox="0 0 24 30" style={{ position: 'absolute', left: cursorX, top: cursorY, opacity: cursorOpacity, transform: `scale(${pressed ? 0.85 : 1})` }}>
        <path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 16 L20 16 Z" fill={C.text} stroke="white" strokeWidth="1.6" />
      </svg>
    </Stage>
  );
};

export const BirdScene: React.FC<{ words: Word[]; s?: Spec }> = ({ words, s = {} }) => {
  const t = useT();
  const keysAt = 0.25;
  const spoken = s.at ? Math.max(0.5, timeOf(words, s.at, 1.0) - 0.1) : Math.max(0.9, timeOf(words, 'drops', 1.4) - 0.5);
  // When the shortcut is named late in a long shot, inject earlier so the payoff shows.
  const pressAt = typeof s.dur === 'number' ? Math.min(spoken, Math.max(0.5, s.dur - 2.6)) : spoken;
  const flyEnd = pressAt + 0.8;
  const fly = interpolate(t, [pressAt, flyEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const birdX = interpolate(fly, [0, 1], [820, 170]);
  const birdY = interpolate(fly, [0, 0.5, 1], [1150, 700, 880]);
  const fill = flyEnd + 0.05;
  const toast = usePop(fill + 0.55);
  return (
    <Stage align="top">
      <div style={{ display: 'flex', gap: 22, marginTop: 10 }}>
        {['Ctrl', 'Shift', 'S'].map((k, i) => {
          const p = spring({ frame: Math.round((t - keysAt - i * 0.12) * 30), fps: 30, config: { damping: 12 } });
          const down = t > pressAt && t < pressAt + 0.25;
          return (
            <div key={k} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, padding: '22px 36px', background: C.surface, color: C.text, border: `2px solid ${C.border}`, borderBottom: `${down ? 3 : 10}px solid ${C.border}`, borderRadius: 18, opacity: p, transform: `translateY(${(1 - p) * 30 + (down ? 7 : 0)}px)` }}>
              {k}
            </div>
          );
        })}
      </div>
      <Card style={{ marginTop: 60, width: 920, height: 900, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 80, background: '#f1ede4', borderBottom: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 30px' }}>
          {[C.red, C.gold, C.green].map((c) => <div key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c }} />)}
          <div style={{ marginLeft: 20, fontSize: 28, color: C.text2, fontWeight: 600 }}>{s.tool ? `${s.tool} · New chat` : 'New chat'}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#b6ae9f', fontWeight: 600 }}>
          {t < fill ? 'What are we building today?' : ''}
        </div>
        <div style={{ margin: 30, padding: 30, minHeight: 120, borderRadius: 22, border: `3px solid ${t > fill ? C.accent : C.border}`, background: '#fbfaf7' }}>
          {t < fill ? (
            <div style={{ fontSize: 34, color: '#b6ae9f' }}>Message your AI...</div>
          ) : (
            CONTEXT_LINES.map((line, i) => (
              <div key={line} style={{ fontFamily: MONO, fontSize: 28, lineHeight: 1.55, color: i === 0 ? C.accent : C.text, fontWeight: i === 0 ? 700 : 500 }}>
                {typed(line, t, fill + i * 0.12, 120)}
              </div>
            ))
          )}
        </div>
      </Card>
      <div style={{ position: 'absolute', top: 600, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: toast, transform: `translateY(${(1 - toast) * 30}px)` }}>
        <div style={{ background: C.green, color: 'white', fontWeight: 800, fontSize: 40, padding: '18px 36px', borderRadius: 999, boxShadow: CARD_SHADOW }}>
          ✓ Context injected
        </div>
      </div>
      <div style={{ position: 'absolute', left: birdX, top: birdY, opacity: interpolate(t, [pressAt - 0.1, pressAt, flyEnd + 0.4, flyEnd + 0.8], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `rotate(${interpolate(fly, [0, 1], [-20, 8])}deg)` }}>
        <Logo size={200} />
      </div>
    </Stage>
  );
};

export const ScoreScene: React.FC<{ words: Word[]; s?: Spec }> = ({ words, s = {} }) => {
  const t = useT();
  const start = Math.max(0.2, timeOf(words, 'ship', 0.4) - 0.2);
  // Either count up to `value`, or follow a `path` of {v, at} keyframes (drop, climb).
  const path: { v: number; at?: string }[] = s.path ?? [{ v: 0 }, { v: s.value ?? 82 }];
  const times = path.map((k, i) => (i === 0 ? start : k.at ? timeOf(words, k.at, start + i * 1.2) : start + i * 1.6));
  const scoreNow = path.length === 2 && !path[1].at
    ? interpolate(t, [start, start + 1.6], [path[0].v, path[1].v], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
    : interpolate(t, times.flatMap((x, i) => (i === 0 ? [x] : [x, x + 0.9])), path.flatMap((k, i) => (i === 0 ? [k.v] : [path[i - 1].v, k.v])), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const target = 100;
  const p = scoreNow / target;
  const cold = path.length > 2 && scoreNow < path[0].v - 5;
  const r = 220;
  const circ = 2 * Math.PI * r;
  const pill = usePop(start + 1.4);
  const bars = [
    { name: 'Memory', v: 0.9, c: C.blue },
    { name: 'Sessions', v: 0.75, c: C.green },
    { name: 'Todos', v: 0.8, c: C.amber },
    { name: 'Milestones', v: 0.6, c: C.purple },
  ];
  return (
    <Stage>
      <div style={{ marginTop: 20 }}>
        <Label>Ship Score</Label>
      </div>
      <div style={{ position: 'relative', width: 560, height: 560, marginTop: 30 }}>
        <svg width="560" height="560" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="280" cy="280" r={r} stroke={INK.track} strokeWidth="38" fill="none" />
          <circle cx="280" cy="280" r={r} stroke="url(#g)" strokeWidth="38" fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - (p * target) / 100)} />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={C.blue} />
              <stop offset="55%" stopColor={C.accent} />
              <stop offset="100%" stopColor={C.amber} />
            </linearGradient>
          </defs>
        </svg>
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ fontSize: 200, fontWeight: 800, lineHeight: 1 }}>{Math.round(p * target)}</div>
          <div style={{ fontFamily: MONO, fontSize: 30, color: INK.muted }}>/ 100</div>
        </AbsoluteFill>
      </div>
      <div style={{ marginTop: 20, background: cold ? '#5b7a99' : C.green, color: 'white', fontWeight: 800, fontSize: 38, padding: '14px 34px', borderRadius: 999, opacity: pill, transform: `scale(${0.7 + pill * 0.3})` }}>
        {cold ? 'Going cold' : 'On track'}
      </div>
      <div style={{ marginTop: 40, width: 820, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {bars.map((b, i) => {
          const w = interpolate(t, [start + 0.3 + i * 0.12, start + 1.3 + i * 0.12], [0, b.v], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          return (
            <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 210, fontSize: 30, fontWeight: 600, color: INK.muted }}>{b.name}</div>
              <div style={{ flex: 1, height: 18, borderRadius: 9, background: INK.track }}>
                <div style={{ width: `${w * 100}%`, height: '100%', borderRadius: 9, background: b.c }} />
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

export const EndScene: React.FC<{ words: Word[]; s?: Spec }> = ({ words, s = {} }) => {
  const t = useT();
  const bird = usePop(0, 11);
  const line1: string = s.line1 ?? 'Your AI tools forget.';
  const line2: string = s.line2 ?? 'Flayel remembers.';
  const forget = usePop(s.line1 ? 0.25 : Math.max(0.1, timeOf(words, 'your', 0.2) - 0.05));
  const remembers = usePop(s.line1 ? 0.75 : Math.max(0.6, timeOf(words, 'remembers', 1.4) - 0.35));
  const cta = usePop(Math.max(1.2, timeOf(words, 'try', 2.2) - 0.1));
  return (
    <Stage>
      <div style={{ opacity: bird, transform: `translateY(${(1 - bird) * 120 + Math.sin(t * 2.4) * 10}px) scale(${0.7 + bird * 0.3})` }}>
        <Logo size={340} />
      </div>
      <div style={{ fontSize: Math.min(82, Math.round(1640 / Math.max(20, line1.length))), fontWeight: 800, marginTop: 40, textAlign: 'center', opacity: forget, transform: `translateY(${(1 - forget) * 30}px)` }}>
        {line1}
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: Math.min(132, Math.round(1900 / Math.max(14, line2.length))), marginTop: 4, textAlign: 'center', opacity: remembers, transform: `scale(${0.85 + remembers * 0.15})`, background: TEXT_GRADIENT, WebkitBackgroundClip: 'text', color: 'transparent', padding: '0 20px 10px' }}>
        {line2}
      </div>
      <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: cta, transform: `translateY(${(1 - cta) * 40}px)` }}>
        <Label>Try it free</Label>
        <div style={{ background: GRADIENT, color: 'white', fontWeight: 800, fontSize: 64, padding: '26px 60px', borderRadius: 999, boxShadow: CARD_SHADOW }}>
          flayel.com
        </div>
      </div>
    </Stage>
  );
};

export const TitleScene: React.FC<{ text: string }> = ({ text }) => {
  const p = usePop(0);
  return (
    <Stage>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, textAlign: 'center', lineHeight: 1.05, opacity: p, transform: `scale(${0.85 + p * 0.15})` }}>
        {text}
      </div>
    </Stage>
  );
};

/** A Kling clip, muted (the voiceover is the only sound), with its headline on top. */
export const KlingScene: React.FC<{ shot: Shot; end?: boolean; words: Word[] }> = ({ shot, end, words }) => {
  const t = useT();
  const head = usePop(0.15);
  const cta = usePop(Math.max(0.6, timeOf(words, 'try', 1.8) - 0.15));
  return (
    <AbsoluteFill style={{ background: 'black' }}>
      <OffthreadVideo src={staticFile(shot.clip!)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + t * 0.008})` }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,18,32,0.55) 0%, rgba(10,18,32,0) 32%, rgba(10,18,32,0) 60%, rgba(10,18,32,0.45) 100%)' }} />
      {!end && shot.on_screen_text ? (
        <div style={{ position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, color: 'white', textShadow: '0 4px 30px rgba(0,0,0,0.5)', opacity: head, transform: `translateY(${(1 - head) * 30}px)`, padding: '0 70px' }}>
          {shot.on_screen_text}
        </div>
      ) : null}
      {end ? (
        <div style={{ position: 'absolute', top: 160, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: cta, transform: `translateY(${(1 - cta) * 40}px)` }}>
          <div style={{ background: 'rgba(246,243,236,0.92)', borderRadius: 40, padding: '30px 50px', display: 'flex', alignItems: 'center', gap: 24 }}>
            <Logo size={120} />
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 64, letterSpacing: '0.28em', color: C.text }}>FLAYEL</div>
          </div>
          <div style={{ background: GRADIENT, color: 'white', fontFamily: SANS, fontWeight: 800, fontSize: 60, padding: '22px 56px', borderRadius: 999 }}>
            flayel.com
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ picker

export const pickScene = (shot: Shot, index: number, total: number, words: Word[]): React.ReactNode => {
  const last = index === total - 1;
  if (shot.clip) return <KlingScene shot={shot} end={last} words={words} />;
  if (last) return <EndScene words={words} s={shot.motion} />;
  const m: Spec | undefined = shot.motion ? { ...shot.motion, dur: shot.end - shot.start } : undefined;
  if (m) {
    const scenes: Record<string, React.ReactNode> = {
      headline: <T.HeadlineScene s={m} words={words} />,
      quote: <T.QuoteScene s={m} words={words} />,
      stat: <T.StatScene s={m} words={words} />,
      list: <T.ListScene s={m} words={words} />,
      versus: <T.VersusScene s={m} words={words} />,
      chat: <T.ChatScene s={m} words={words} />,
      bucket: <T.BucketScene s={m} words={words} />,
      freshness: <T.FreshnessScene s={m} words={words} />,
      recap: <T.RecapScene s={m} words={words} />,
      todo: <T.TodoScene s={m} words={words} />,
      keys: <T.KeysScene s={m} words={words} />,
      birdAction: <T.BirdActionScene s={m} words={words} />,
      forget: <ForgetScene s={m} words={words} />,
      brain: <BrainScene s={m} words={words} />,
      context: <ContextScene s={m} words={words} />,
      bird: <BirdScene s={m} words={words} />,
      score: <ScoreScene s={m} words={words} />,
      intro: <IntroScene words={words} />,
      tools: <ToolsScene shot={shot} words={words} />,
      kinetic: <KineticScene s={m} words={words} />,
      counter: <S1.CounterScene s={m} words={words} />,
      typing: <S1.TypingScene s={m} words={words} />,
      scatter: <S1.ScatterScene s={m} words={words} />,
      decay: <S1.DecayScene s={m} words={words} />,
      cycle: <S1.CycleScene s={m} words={words} />,
      install: <S1.InstallScene s={m} words={words} />,
      roll: <S1.RollScene s={m} words={words} />,
      sidebar: <S2.SidebarScene s={m} words={words} />,
      redact: <S2.RedactScene s={m} words={words} />,
      tabs: <S2.TabsScene s={m} words={words} />,
      handoff: <S2.HandoffScene s={m} words={words} />,
      blueprint: <S2.BlueprintScene s={m} words={words} />,
      clock: <S2.ClockScene s={m} words={words} />,
      path: <S2.PathScene s={m} words={words} />,
      sunrise: <S2.SunriseScene s={m} words={words} />,
      tower: <S2.TowerScene s={m} words={words} />,
      strike: <S2.StrikeScene s={m} words={words} />,
      madlib: <S2.MadlibScene s={m} words={words} />,
      quotes: <S3.QuotesScene s={m} words={words} />,
      receipt: <S3.ReceiptScene s={m} words={words} />,
      timers: <S3.TimersScene s={m} words={words} />,
      aging: <S3.AgingScene s={m} words={words} />,
      window: <S3.WindowScene s={m} words={words} />,
      orbit: <S3.OrbitScene s={m} words={words} />,
      grid: <S3.GridScene s={m} words={words} />,
      paper: <S3.PaperScene s={m} words={words} />,
      calendar: <S3.CalendarScene s={m} words={words} />,
      terminal: <S3.TerminalScene s={m} words={words} />,
      grave: <S3.GraveScene s={m} words={words} />,
      graph: <S3.GraphScene s={m} words={words} />,
      lever: <S3.LeverScene s={m} words={words} />,
      slot: <S3.SlotScene s={m} words={words} />,
      equation: <S3.EquationScene s={m} words={words} />,
      streak: <S3.StreakScene s={m} words={words} />,
      bigcheck: <S3.BigCheckScene s={m} words={words} />,
    };
    if (scenes[m.scene]) return scenes[m.scene];
  }
  const v = shot.voiceover.toLowerCase();
  const toolMentions = TOOLS.filter((x) => v.includes(x.name.toLowerCase())).length;
  if (/project brain|bucket/.test(v)) return <BrainScene words={words} />;
  if (/context block|copy context/.test(v)) return <ContextScene words={words} />;
  if (/\bbird\b|control shift|inject/.test(v)) return <BirdScene words={words} />;
  if (/ship score/.test(v)) return <ScoreScene words={words} />;
  if (toolMentions >= 2) return <ToolsScene shot={shot} words={words} />;
  if (/forget/.test(v)) return <ForgetScene words={words} />;
  if (index === 0) return <IntroScene words={words} />;
  return <TitleScene text={shot.on_screen_text || ''} />;
};
