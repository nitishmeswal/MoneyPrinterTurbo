/* RecapHub teaser, 1920 x 1080, ~20 s, "logo reveal to content".
 * Script (hook / problem / product / payoff / CTA):
 *   0-2 s   a keynote stage, lights cut: "Your event ended."
 *   2-6 s   the mark is built from three sheets on three stabs; "Every session, every debate, one link."
 *   6 s     the camera dives through the front sheet into the product
 *   6-15 s  three fast beats: Clips (Stage → Shorts), Pages (published recap), Answers (MCP)
 *   15-20 s "Your audience didn't." · RecapHub · Book a demo · recaphub.co
 * Music: music-rh-teaser.wav (compose.py teaser), 124 BPM, every cut on the grid. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-teaser.json';
import { Ctx, Reveal, Scene, Sfx, Soundtrack, Timeline, TypeOn, WordPush, W, H, EXPO, INOUT, count, lerp, sceneBeats, sceneStart, spr, transitionSfx } from './kit';
import { R, MONO, SANS, SHADOW, Avatar, Browser, ClipPoster, Cta, Footage, Mark, Rec, SPEAKERS, Stone, abs, card, centerRow, head, label, pill, serif } from './rh';

const tl = tlJson as Timeline;

// ------------------------------------------------------------------ hook: the lights go out

const Hook = ({ t, B }: Ctx) => {
  const off = lerp(t, B(2), B(2) + 0.1, 0, 1, EXPO);
  const zoom = 1.1 - 0.07 * lerp(t, 0, B(4.2), 0, 1, INOUT);
  const secs = 52 * 60 + 9 + Math.min(Math.floor(t), Math.floor(B(2)));
  const tc = `00:${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Footage t={t} w={W} h={H} crop={0.5} dim={0.3 + 0.55 * off} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
      <div style={abs(90, 76, { display: 'flex', alignItems: 'center', gap: 16 })}>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: off > 0.5 ? '#57534E' : R.danger, opacity: off > 0.5 ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(t * 5)) }} />
        <div style={label({ color: '#E8E6E3', fontSize: 24 })}>{off > 0.5 ? 'Ended' : 'Live'}</div>
        <div style={{ fontFamily: MONO, fontSize: 24, color: '#A8A49D', marginLeft: 12 }}>{tc}</div>
      </div>
      <div style={centerRow(400)}>
        <WordPush
          t={t}
          style={head(168, { color: '#FAFAF9', fontWeight: 600 })}
          words={[
            { text: 'Your', at: 0 },
            { text: 'event', at: B(1) },
            { text: 'ended.', at: B(2), style: serif({ fontSize: 196, color: '#FAFAF9' }) },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ reveal: three sheets, three stabs, then the dive

const STABS = [0, 0.75, 1.5];
const MARK = 520; // mark size during the reveal
const K = MARK / 500;
// where each sheet lands (mark coordinates) and where it flies in from (screen offset, rotation)
const SHEETS = [
  { x: 46, y: 106, r: 0, fx: -1300, fy: 200, fr: -38, z: 3 },
  { x: 170, y: 64, r: 13, fx: 200, fy: -1100, fr: 50, z: 2 },
  { x: 222, y: 180, r: 25, fx: 1500, fy: 300, fr: 80, z: 1 },
];

const RevealScene = ({ t, B }: Ctx) => {
  const slide = lerp(t, B(2.25), B(3), 0, 1, INOUT);
  const mx = 960 - MARK / 2 - 30 + (300 - (960 - MARK / 2 - 30)) * slide;
  const my = 540 - MARK / 2 - 20 + (250 - (540 - MARK / 2 - 20)) * slide;
  // the dive: accelerate into the front sheet's centre, its fill turning to the page colour
  const dive = lerp(t, B(6.25), B(8), 0, 1, (x) => x * x * x);
  const cx = mx + (46 + 110) * K;
  const cy = my + (106 + 140) * K;
  const scale = 1 + dive * 26;
  const fillMix = lerp(t, B(6.6), B(7.6));
  const wordIn = lerp(t, B(2.4), B(3.1), 0, 1, EXPO);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transformOrigin: `${cx}px ${cy}px`, transform: `scale(${scale})` }}>
        <div style={abs(mx, my, { width: MARK, height: MARK })}>
          {SHEETS.map((s, i) => {
            const p = spr(t, B(STABS[i]), 14, 0.7, 170);
            const land = Math.min(1, p);
            const bump = t >= B(STABS[i]) && t < B(STABS[i]) + 0.18 ? 1 - (t - B(STABS[i])) / 0.18 : 0;
            const fill = i === 0 ? mix(R.mark, R.page, fillMix) : R.mark;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: s.x * K + s.fx * (1 - land),
                  top: s.y * K + s.fy * (1 - land),
                  width: 220 * K,
                  height: 280 * K,
                  background: fill,
                  border: `${7 * K}px solid #fff`,
                  boxSizing: 'border-box',
                  transform: `rotate(${s.r + s.fr * (1 - land)}deg) scale(${1 + 0.06 * bump})`,
                  zIndex: s.z,
                  opacity: t >= B(STABS[i]) - 0.2 ? 1 : 0,
                  boxShadow: '0 30px 60px rgba(26,23,20,0.18)',
                }}
              />
            );
          })}
        </div>
        <div style={abs(860, 400, { opacity: wordIn, transform: `translateX(${(1 - wordIn) * 80}px)` })}>
          <div style={head(180, { fontWeight: 700, letterSpacing: '-0.045em' })}>
            <TypeOn t={t} at={B(2.5)} cps={20} caret={R.brand} caretOff={B(3.5)} parts={[{ text: 'RecapHub' }]} />
          </div>
          <div style={{ marginTop: 26 }}>
            <WordPush
              justify="flex-start"
              t={t}
              style={head(46, { fontWeight: 500, color: R.ink2, letterSpacing: '-0.02em' })}
              gap="0.24em"
              words={[
                { text: 'Every', at: B(3.75) },
                { text: 'session,', at: B(4) },
                { text: 'every', at: B(4.5) },
                { text: 'debate,', at: B(4.75) },
                { text: 'one', at: B(5.25) },
                { text: 'link.', at: B(5.5), style: serif({ fontSize: 56, color: R.ink }) },
              ]}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const mix = (a: string, b: string, p: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * p)).join(',')})`;
};

// ------------------------------------------------------------------ the three product beats

/** Left column of every product beat: the feature tag, one serif word, one line. */
const Side: React.FC<{ t: number; B: (n: number) => number; tag: string; word: string; line: React.ReactNode; n: string }> = ({ t, B, tag, word, line, n }) => (
  <div style={abs(130, 300, { width: 600 })}>
    <Reveal t={t} at={0} y={16} dur={0.35}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: R.brand, fontWeight: 600 }}>{n}</div>
        <div style={label({ color: R.ink2, fontSize: 22 })}>{tag}</div>
      </div>
    </Reveal>
    <div style={{ marginTop: 8 }}>
      <WordPush justify="flex-start" t={t} style={serif({ fontSize: 172, color: R.ink, lineHeight: 1.05 })} words={[{ text: word, at: B(0.1) }]} />
    </div>
    <Reveal t={t} at={B(1)} y={20} dur={0.45}>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 40, color: R.ink2, lineHeight: 1.3, letterSpacing: '-0.015em', marginTop: 6 }}>{line}</div>
    </Reveal>
  </div>
);

// clips: one keynote frame, cut into 12 strips, which open into 12 vertical clips
const FRAME = { x: 780, y: 250, w: 1010, h: 568 };
const GRID = { x: 800, y: 214, w: 138, gap: 22 };
const CUTS_AT = 0.5;
const SCORES = [91, 74, 87, 66, 82, 79, 70, 88, 63, 77, 85, 72];

const Clips = ({ t, B }: Ctx) => {
  const frameIn = spr(t, 0, 16, 0.8);
  const sw = FRAME.w / 12;
  const gh = (GRID.w * 16) / 9;
  const n = count(t, B(2.25), B(3.25), 0, 12);
  return (
    <AbsoluteFill>
      <Side t={t} B={B} n="01" tag="Stage → Shorts" word="Clips." line={<>One keynote. <span style={{ color: R.ink, fontVariantNumeric: 'tabular-nums' }}>{n || 12} clips.</span></>} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${1.25 - 0.25 * frameIn})`, transformOrigin: '1285px 534px' }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const p = spr(t, B(2.25 + i * 0.06), 15, 0.75);
          const col = i % 6;
          const row = Math.floor(i / 6);
          const tx = GRID.x + col * (GRID.w + GRID.gap);
          const ty = GRID.y + row * (gh + GRID.gap);
          const x = FRAME.x + i * sw + (tx - FRAME.x - i * sw) * p;
          const y = FRAME.y + (ty - FRAME.y) * p;
          const w = sw + (GRID.w - sw) * p;
          const h = FRAME.h + (gh - FRAME.h) * p;
          const cut = t >= B(CUTS_AT + i * 0.12);
          return (
            <div key={i} style={abs(x, y, { width: w, height: h, overflow: 'hidden', borderRadius: 14 * p, boxShadow: p > 0.05 ? SHADOW : 'none' })}>
              <div style={{ position: 'absolute', left: 0, top: 0 }}>
                <ClipStrip t={t} w={w} h={h} i={i} />
              </div>
              {i > 0 && cut && p < 0.5 ? <div style={{ position: 'absolute', left: 0, top: 0, width: 3, height: '100%', background: R.brand, opacity: 1 - lerp(t, B(2), B(2.3)) }} /> : null}
              <Reveal t={t} at={B(3.3 + i * 0.05)} y={8} dur={0.3} style={{ position: 'absolute', left: 8, top: 8 }}>
                <div style={{ background: R.warning50, color: R.warning700, borderRadius: 99, padding: '3px 10px', fontFamily: SANS, fontWeight: 600, fontSize: 17 }}>{SCORES[i]}</div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ClipStrip: React.FC<{ t: number; w: number; h: number; i: number }> = ({ t, w, h, i }) => {
  // the crop keeps each strip on its own slice of the stage, then centres it as it becomes a clip
  return <Footage t={t} w={w} h={h} crop={i / 11} speaker={0} />;
};

// pages: the published recap with its topic treemap and the debate map
const TILES = [
  { x: 0, y: 0, w: 430, h: 270, name: 'Cost of compliance', m: '4h 12m', bg: R.ink, fg: '#F5F4F2' },
  { x: 440, y: 0, w: 300, h: 160, name: 'AI in operations', m: '3h 05m', bg: R.brand100, fg: R.brand600 },
  { x: 750, y: 0, w: 230, h: 160, name: 'Hiring', m: '1h 48m', bg: R.sand, fg: R.ink },
  { x: 440, y: 170, w: 230, h: 100, name: 'Supplier risk', m: '1h 10m', bg: R.muted, fg: R.ink },
  { x: 680, y: 170, w: 300, h: 100, name: 'Data quality', m: '1h 32m', bg: R.subtle, fg: R.ink },
];

const Page = ({ t, B }: Ctx) => {
  const win = spr(t, 0, 16, 0.85);
  const scroll = lerp(t, B(3.25), B(4), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Side t={t} B={B} n="02" tag="Published recap pages" word="Pages." line="Every session, every debate, one link." />
      <div style={abs(790, 200 + (1 - win) * 500, { opacity: Math.min(1, win * 1.5) })}>
        <Browser w={1040} h={680} url="recaphub.co/harbor-summit-2026" rec="page-live">
          <div style={{ transform: `translateY(${-scroll * 330}px)` }}>
            <div style={{ padding: '40px 30px 10px', background: `linear-gradient(180deg, ${R.page}, #fff)` }}>
              <div style={label({ fontSize: 16 })}>Event recap</div>
              <div style={serif({ fontSize: 66, color: R.ink, marginTop: 4, lineHeight: 1.05 })}>Harbor Summit 2026</div>
              <div style={{ fontFamily: SANS, fontSize: 22, color: R.ink2, marginTop: 8 }}>38 sessions · 12 speakers · 3 days</div>
            </div>
            <div style={{ padding: '18px 30px 0' }}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: R.ink, letterSpacing: '-0.02em' }}>Topics and sessions</div>
              <div style={{ position: 'relative', height: 280, marginTop: 14 }}>
                {TILES.map((tile, i) => {
                  const p = spr(t, B(0.75 + i * 0.25), 14, 0.7);
                  return (
                    <div key={tile.name} style={abs(tile.x, tile.y, { width: tile.w, height: tile.h, borderRadius: 14, background: tile.bg, color: tile.fg, padding: '16px 18px', boxSizing: 'border-box', opacity: Math.min(1, p * 1.6), transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: '0 0' })}>
                      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tile.h > 150 ? 26 : 20, letterSpacing: '-0.01em' }}>{tile.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 16, opacity: 0.7, marginTop: 4 }}>{tile.m}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: '34px 30px 0' }}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: R.ink, letterSpacing: '-0.02em' }}>What was argued</div>
              <DebateMap t={t} at={B(3.75)} step={B(4) - B(3.75)} />
            </div>
          </div>
        </Browser>
      </div>
    </AbsoluteFill>
  );
};

const DebateMap: React.FC<{ t: number; at: number; step: number }> = ({ t, at, step }) => {
  const nodes = [
    { x: 40, y: 120, text: 'AI in operations', kind: 'theme' },
    { x: 360, y: 40, text: 'Build or buy?', kind: 'q' },
    { x: 360, y: 200, text: 'Who owns the data?', kind: 'q' },
    { x: 680, y: 10, s: 0, text: 'Build', kind: 'stance' },
    { x: 680, y: 80, s: 1, text: 'Buy', kind: 'stance' },
    { x: 680, y: 190, s: 2, text: 'The customer', kind: 'stance' },
  ];
  const edges: [number, number, number][] = [[0, 1, 0], [0, 2, 0], [1, 3, 1], [1, 4, 1], [2, 5, 2]];
  const anchor = (i: number, side: 'l' | 'r') => {
    const n = nodes[i];
    const w = n.kind === 'theme' ? 230 : n.kind === 'q' ? 250 : 220;
    return { x: n.x + (side === 'r' ? w : 0), y: n.y + 28 };
  };
  return (
    <div style={{ position: 'relative', height: 280, marginTop: 16 }}>
      <svg width={980} height={280} style={{ position: 'absolute', left: 0, top: 0 }}>
        {edges.map(([a, b, d], i) => {
          const p = lerp(t, at + d * step, at + (d + 1) * step);
          const A = anchor(a, 'r');
          const Bp = anchor(b, 'l');
          const mx = (A.x + Bp.x) / 2;
          return <path key={i} d={`M ${A.x} ${A.y} C ${mx} ${A.y}, ${mx} ${Bp.y}, ${Bp.x} ${Bp.y}`} fill="none" stroke={R.ink3} strokeWidth={2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />;
        })}
      </svg>
      {nodes.map((n, i) => {
        const d = n.kind === 'theme' ? 0 : n.kind === 'q' ? 1 : 2;
        const p = spr(t, at + d * step, 14);
        const base: React.CSSProperties = { position: 'absolute', left: n.x, top: n.y, opacity: Math.min(1, p * 1.5), transform: `scale(${0.8 + 0.2 * p})`, transformOrigin: '0 50%', display: 'flex', alignItems: 'center', gap: 10, height: 56, boxSizing: 'border-box', borderRadius: 99, padding: '0 20px', fontFamily: SANS, fontWeight: 500, fontSize: 22, whiteSpace: 'nowrap' };
        if (n.kind === 'theme') return <div key={i} style={{ ...base, background: R.ink, color: '#fff', fontWeight: 600 }}>{n.text}</div>;
        if (n.kind === 'q') return <div key={i} style={{ ...base, background: R.subtle, border: `1px solid ${R.border}`, color: R.ink }}>{n.text}</div>;
        return (
          <div key={i} style={{ ...base, background: '#fff', border: `1px solid ${R.border}`, color: R.ink2, paddingLeft: 8 }}>
            <Avatar s={SPEAKERS[n.s ?? 0]} size={40} />
            {n.text}
          </div>
        );
      })}
    </div>
  );
};

// answers: the event, asked from inside an AI assistant
const ANSWERS = [
  { n: '1', title: 'Build vs buy', who: 'Priya Raman vs Tom Okafor', tc: '18:40' },
  { n: '2', title: 'Remote audits', who: 'Mei Arai vs Dev Bose', tc: '07:12' },
  { n: '3', title: 'AI in hiring', who: 'Sara Kim vs Jonas Lind', tc: '33:05' },
];

const Ask = ({ t, B }: Ctx) => {
  const win = spr(t, 0, 16, 0.85);
  const sent = t >= B(2);
  return (
    <AbsoluteFill>
      <Side t={t} B={B} n="03" tag="RecapHub MCP" word="Answers." line="Ask your event anything." />
      <div style={abs(790, 200 + (1 - win) * 500, { opacity: Math.min(1, win * 1.5) })}>
        <div style={{ ...card({ borderRadius: 24 }), width: 1040, height: 680, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Rec id="teaser-ask">
            <div style={{ height: 70, borderBottom: `1px solid ${R.border}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px', flexShrink: 0 }}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: R.ink }}>Claude</div>
              <div style={pill({ fontSize: 18, padding: '6px 14px' })}>RecapHub MCP · Harbor Summit 2026</div>
            </div>
            <div style={{ flex: 1, padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {sent ? (
                <Reveal t={t} at={B(2)} y={14} dur={0.3} style={{ alignSelf: 'flex-end' }}>
                  <div style={{ background: R.subtle, color: R.ink, fontFamily: SANS, fontSize: 28, borderRadius: 20, padding: '16px 24px' }}>What were the top 3 debates on day 2?</div>
                </Reveal>
              ) : null}
              {ANSWERS.map((a, i) => (
                <Reveal key={a.n} t={t} at={B(2.5 + i * 0.5)} y={18} dur={0.35}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '14px 4px', borderBottom: i < 2 ? `1px solid ${R.subtle}` : 'none' }}>
                    <div style={{ fontFamily: MONO, fontSize: 22, color: R.brand, width: 24 }}>{a.n}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: R.ink }}>{a.title}</div>
                      <div style={{ fontFamily: SANS, fontSize: 21, color: R.ink2, marginTop: 2 }}>{a.who}</div>
                    </div>
                    <div style={pill({ fontSize: 19 })}>
                      “quote” · <span style={{ fontFamily: MONO }}>{a.tc}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div style={{ margin: '0 30px 28px', display: 'flex', alignItems: 'center', border: `1.5px solid ${sent ? R.border : R.brand}`, borderRadius: 18, padding: '18px 22px', boxShadow: sent ? 'none' : `0 0 0 5px ${R.brand50}` }}>
              <div style={{ flex: 1, fontFamily: SANS, fontSize: 26, color: sent ? R.ink3 : R.ink }}>
                {sent ? 'Reply…' : <TypeOn t={t} at={B(0.3)} cps={34} caret={R.brand} parts={[{ text: 'What were the top 3 debates on day 2?' }]} />}
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: sent ? R.muted : R.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>↑</div>
            </div>
          </Rec>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ end: "Your audience didn't."

const End = ({ t, B }: Ctx) => {
  const up = lerp(t, B(1.75), B(2.4), 0, 1, INOUT);
  const punch = spr(t, 0, 12, 0.6, 200);
  return (
    <AbsoluteFill>
      <div style={centerRow(400 - up * 260, { transform: `scale(${(1.12 - 0.12 * punch) * (1 - up * 0.42)})`, transformOrigin: '50% 50%' })}>
        <div style={head(176, { fontWeight: 600, whiteSpace: 'nowrap' })}>
          Your audience <span style={serif({ fontSize: 196 })}>didn’t.</span>
        </div>
      </div>
      <div style={centerRow(380, { alignItems: 'center', gap: 40, opacity: lerp(t, B(2.4), B(2.7)) })}>
        <div style={{ transform: `scale(${0.6 + 0.4 * spr(t, B(2.4), 13)})` }}>
          <Mark size={250} fan={[spr(t, B(2.5), 12), spr(t, B(2.75), 12)]} />
        </div>
        <Reveal t={t} at={B(2.75)} y={24}>
          <div style={head(150, { fontWeight: 700, letterSpacing: '-0.045em' })}>RecapHub</div>
        </Reveal>
      </div>
      <div style={centerRow(790)}>
        <Cta t={t} at={B(3.75)} />
      </div>
    </AbsoluteFill>
  );
};

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = {
  hook: Hook,
  reveal: RevealScene,
  clips: Clips,
  page: Page,
  ask: Ask,
  end: End,
};

const sfx = (): Sfx[] => {
  const at = (id: string, beat: number) => sceneStart(tl, id) + sceneBeats(tl, id)(beat);
  return [
    ...transitionSfx(tl),
    { at: at('hook', 2), src: 'switch', vol: 0.5 },
    ...STABS.map((b, i) => ({ at: at('reveal', b), src: 'page-turn' as const, vol: 0.55 - i * 0.08 })),
    { at: at('reveal', 6.4), src: 'whoosh', vol: 0.45 },
    { at: at('clips', CUTS_AT), src: 'snip', vol: 0.4 },
    { at: at('clips', CUTS_AT + 0.75), src: 'snip', vol: 0.35 },
    { at: at('clips', 2.25), src: 'pop', vol: 0.3 },
    { at: at('page', 0.75), src: 'pop', vol: 0.25 },
    { at: at('page', 3.25), src: 'page-turn', vol: 0.3 },
    { at: at('ask', 2), src: 'switch', vol: 0.35 },
    { at: at('end', 2.5), src: 'page-turn', vol: 0.4 },
    { at: at('end', 3.75), src: 'ding', vol: 0.22 },
  ];
};

export const RecapHubTeaser: React.FC = () => (
  <AbsoluteFill style={{ background: R.page }}>
    <Stone />
    {tl.scenes.map((s, i) => (
      <Scene key={s.id} tl={tl} index={i} render={RENDER[s.id]} />
    ))}
    <Soundtrack tl={tl} sfx={sfx()} />
  </AbsoluteFill>
);

export const teaserTimeline = tl;
