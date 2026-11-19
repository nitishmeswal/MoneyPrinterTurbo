/* "Ask your event anything with MCP": educative story, ~55 s, 124 BPM.
 * Monday 9:02. Dana (CEO) needs the top 3 debates from day 2 before a 10:00 board meeting; there are 31 hours
 * of video. Maya (producer) asks the event instead, in three steps on the real product: 01 Connect (the real
 * MCP dialog, then the real tool calls), 02 Ask (the answer streams with its sources), 03 Answer (the debate
 * with each speaker's stance). 9:06: the reply goes back. Maya and Dana are fictional; the debates are the
 * app's fixtures. Music: stabs 0 / 8, build 16, lifts 40 / 60, drop 88, end 106. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Cue, EIO, FilmDef, INOUT, Region, Rise, SHADOW, Typed, focus, lerp, spr, Cursor, Pop } from '../kit';
import { BR, Box, DISPLAY, Head, SANS, Steps } from '../brand';
import { Chat, Debate, McpPill, Z } from '../ui';
import { Scene, Top, chain, end, endSfx, title, titleSfx } from '../shots';
import { BOX, cap } from '../assets';

const STEPS3 = [
  { name: 'Connect', text: 'Add the event to her AI assistant, once' },
  { name: 'Ask', text: 'A plain question, in her own words' },
  { name: 'Answer', text: 'Debates, stances and the sessions to watch' },
];

/** A message card (a phone-style notification, in brand boxes). */
const Msg: React.FC<{ t: number; at: number; from: string; text: string; me?: boolean; status?: string }> = ({ t, at, from, text, me, status }) => (
  <Rise t={t} at={at} y={60} spring="soft">
    <Box pad="26px 34px" radius={30} style={{ width: 860, background: me ? BR.deep : BR.raised, color: me ? '#fff' : BR.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 700, fontSize: 26, opacity: 0.8 }}>
        <span style={{ width: 44, height: 44, borderRadius: 22, background: me ? 'rgba(255,255,255,0.2)' : BR.cream, display: 'grid', placeItems: 'center', fontSize: 20 }}>{from[0]}</span>
        {from}
        {status ? <span style={{ marginLeft: 'auto', fontWeight: 500, fontSize: 22 }}>{status}</span> : null}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 38, lineHeight: 1.3, marginTop: 14 }}><Typed t={t} at={at + 0.3} text={text} cps={42} caret={false} /></div>
    </Box>
  </Rise>
);
const Clock: React.FC<{ t: number; at: number; time: string }> = ({ t, at, time }) => (
  <Rise t={t} at={at} y={40}>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 40, color: BR.inkSubtle }}>Monday</div>
    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 230, lineHeight: 0.95, letterSpacing: '-0.03em', color: BR.ink, fontVariantNumeric: 'tabular-nums' }}>{time}</div>
  </Rise>
);
const Eyebrow: React.FC<{ t: number; at: number; n: string; name: string }> = ({ t, at, n, name }) => (
  <Rise t={t} at={at} y={20}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <span style={{ width: 64, height: 64, borderRadius: 32, background: BR.deep, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 32 }}>{n}</span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: BR.ink }}>{name}</span>
    </div>
  </Rise>
);

const DLG = cap('mcp-event');
const TOOLS = cap('mcp-tools');
const k = 860 / BOX.mcpDialog[3];
const dlgBox: [number, number, number, number] = [930, 110, BOX.mcpDialog[2] * k, 860];
const next = [dlgBox[0] + (BOX.mcpNext[0] - BOX.mcpDialog[0]) * k, dlgBox[1] + (BOX.mcpNext[1] - BOX.mcpDialog[1]) * k];

export const storyFilm: FilmDef = {
  id: 'Story',
  bpm: 124,
  music: 'music/story.wav',
  tail: 1,
  shots: chain([
    {
      len: 8, name: 'monday',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="cut" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.05, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 150, top: 300 }}><Clock t={t} at={B(0.2)} time="9:02" /></div>
            <div style={{ position: 'absolute', left: 900, top: 380 }}><Msg t={t} at={B(2)} from="Dana · CEO" text="Can I get the top 3 debates from day 2? Board meeting at 10." /></div>
          </Scene>
        );
      },
      sfx: (B) => [[B(0.2), 'whoosh-soft', 0.3], [B(2), 'bubble', 0.4], [B(2.1), 'ding', 0.22]],
    },
    {
      len: 8, name: 'problem',
      render: title({ text: '31 hours of video.\n~One hour to answer.~', size: 124, tin: 'wipe', track: 120 }),
      sfx: (B) => [[0, 'whoosh', 0.35], ...titleSfx()(B)],
    },
    {
      len: 8, name: 'steps',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.05, ease: INOUT }]}>
            <Top t={t} at={B(0.2)} text="Maya asks the event *instead.*" size={96} y={180} />
            <div style={{ position: 'absolute', left: (1920 - 520 * 2.9) / 2, top: 500 }}>
              <Rise t={t} at={B(0.9)} y={60} spring="soft"><Steps t={t} steps={STEPS3} on={[B(2), B(3), B(4)]} scale={2.9} width={520} /></Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], ...titleSfx()(B), [B(2), 'pop', 0.32], [B(3), 'pop', 0.32], [B(4), 'pop', 0.32]],
    },
    {
      len: 16, name: 'connect',
      render: (c) => {
        const { t, B } = c;
        const swap = B(8.6);
        const reveal = (i: number) => lerp(t, swap + B(0.6 + i * 0.5), swap + B(1 + i * 0.5), 0, 1, EIO);
        return (
          <Scene c={c} cam={[{ t: 0, s: 1 }, { t: B(7), ...focus(1300, 760, 1.12), ease: INOUT }, { t: B(9.5), x: 0, y: 0, s: 1, ease: EIO }, { t: c.dur, s: 1.04, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 140, top: 330 }}>
              <Eyebrow t={t} at={B(0.3)} n="1" name="Connect" />
              <div style={{ height: 30 }} />
              <Head t={t} at={B(0.8)} text={'Once. In any\n*AI assistant.*'} size={92} out={swap} />
              <div style={{ position: 'absolute', top: 94 }}><Head t={t} at={swap + B(0.2)} text={'The event becomes\nsomething to *ask.*'} size={74} /></div>
            </div>
            {t < swap + B(0.6) ? (
              <div style={{ opacity: 1 - lerp(t, swap, swap + B(0.6)) }}>
                <Rise t={t} at={B(0.6)} y={140} s={0.9} spring="soft" style={{ position: 'absolute', inset: 0 }}>
                  <Region file={DLG.file} sw={DLG.sw} sh={DLG.sh} rect={BOX.mcpDialog} box={dlgBox} radius={18} shadow={SHADOW} />
                </Rise>
              </div>
            ) : null}
            {t >= swap ? (
              <div style={{ position: 'absolute', left: 820, top: 330 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ position: 'absolute', left: 0, top: i * 80 * 1.3, opacity: reveal(i), transform: `translateX(${(1 - reveal(i)) * 80}px)` }}>
                    <Region file={TOOLS.file} sw={TOOLS.sw} sh={TOOLS.sh} rect={[63, 63 + i * 80, 770, 68]} box={[0, 0, 770 * 1.3, 68 * 1.3]} radius={14} shadow={SHADOW} />
                  </div>
                ))}
              </div>
            ) : null}
            <Cursor t={t} path={[{ t: B(5), x: 1700, y: 1060 }, { t: B(7.6), x: next[0], y: next[1] }, { t: B(8), x: next[0], y: next[1], click: true }]} leave={B(8.6)} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], [B(0.3), 'pop', 0.3], [B(0.6), 'whoosh-soft', 0.3], [B(8), 'click', 0.55], [B(8.6), 'whoosh-soft', 0.3], ...[0, 1, 2, 3].map((i) => [B(8.6) + B(0.6 + i * 0.5), 'tick', 0.32] as Cue)],
    },
    {
      len: 20, name: 'ask',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, ...focus(1100, 560, 1.06), ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 140, top: 140 }}><Eyebrow t={t} at={B(0.3)} n="2" name="Ask" /></div>
            <div style={{ position: 'absolute', left: 300, top: 260 }}>
              <Z s={2}><Chat t={t} at={B(1)} w={660} q="What were the top 3 debates on day 2?" a="Three debates split the room on day 2: whether products should ship locked down even if it slows adoption, who carries the risk when a model gets it wrong, and how much of compliance can be built in by design. Each one lists who argued what, with the session to watch." sources={['Locked down by default? · Day 2', 'Who carries the risk? · 47:30', 'Compliance by design · Day 2']} /></Z>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], [B(0.3), 'pop', 0.3], [B(1), 'key', 0.15], [B(1.8), 'key', 0.15], [B(2.6), 'key', 0.15], [B(4.4), 'bubble', 0.3], [B(12), 'pop-soft', 0.25], [B(12.3), 'pop-soft', 0.25], [B(12.6), 'pop-soft', 0.25]],
    },
    {
      len: 16, name: 'answer',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} cam={[{ t: 0, s: 0.96 }, { t: c.dur, s: 1.02, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 140, top: 110 }}><Eyebrow t={t} at={B(0.3)} n="3" name="Answer" /></div>
            <div style={{ position: 'absolute', left: 140, top: 210 }}><Head t={t} at={B(0.8)} text="Who argued *what.*" size={84} /></div>
            <Debate t={t} at={B(1.6)} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], [B(0.3), 'pop', 0.3], [B(1.6), 'whoosh-soft', 0.3], [B(1.6) + 0.95, 'pop-soft', 0.25], [B(1.6) + 1.17, 'pop-soft', 0.25], [B(1.6) + 1.39, 'pop-soft', 0.25]],
    },
    {
      len: 12, name: 'sent',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.05, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 150, top: 300 }}><Clock t={t} at={B(0.2)} time="9:06" /></div>
            <div style={{ position: 'absolute', left: 900, top: 240 }}><Msg t={t} at={B(0.8)} from="Dana · CEO" text="Can I get the top 3 debates from day 2? Board meeting at 10." /></div>
            <div style={{ position: 'absolute', left: 960, top: 560 }}><Msg t={t} at={B(2.4)} from="Maya" me status={t > B(5) ? 'Sent' : undefined} text="Here are the three, with who said what and where to watch." /></div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], [B(0.2), 'whoosh-soft', 0.3], [B(2.4), 'bubble', 0.4], [B(5), 'chime', 0.3]],
    },
    {
      len: 10, name: 'payoff',
      render: title({ text: 'Four minutes.\n[Not an hour.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 150, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.45], ...titleSfx(1.4)(B)],
    },
    {
      len: 8, name: 'pill',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.06, ease: INOUT }]}>
            <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Pop t={t} at={B(0.4)}><Z s={3} origin="50% 50%"><McpPill /></Z></Pop>
              <div style={{ height: 130 }} />
              <Head t={t} at={B(1.2)} text="Your event, inside *your AI assistant.*" size={78} align="center" />
            </AbsoluteFill>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], [B(0.4), 'pop', 0.35], [B(1.2), 'swish', 0.25]],
    },
    { len: 8, name: 'end', render: end('Ask your event anything.'), sfx: endSfx },
  ]),
};

