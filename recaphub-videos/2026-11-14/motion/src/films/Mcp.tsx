/* RecapHub MCP, ~34 s, 142 BPM. Hook: "Ask your event anything."  Payoff: "Your conference, inside Claude."
 * Real screens only (recaphub_3.0 Storybook captures): the "Continue in RecapHub MCP" pill, the MCP connect
 * dialog in event mode, the workspace assistant answering, the recap page's MCP card, and the chat's
 * suggestion cards. No mock assistant window. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, Chip, Dark, EndCard, FilmDef, Flash, Head, Lift, Light, Pop, Region, SHADOW, SHADOW_DEEP, ShotCtx, Swap, W, focus, lerp, spr, INOUT } from '../kit';
import { shot } from '../assets';

const Title: React.FC<{ t: number; text: string }> = ({ t, text }) => (
  <div style={{ position: 'absolute', left: 0, width: W, top: 50, display: 'flex', justifyContent: 'center' }}>
    <Head t={t} at={0.05} text={text} size={66} color={C.ink} accent={C.violet} align="center" />
  </div>
);

const PILL = shot('continue-pill');
const Hook = ({ t, B }: ShotCtx) => {
  const el: [number, number, number, number] = [26, 62, 592, 106];
  const w = 760;
  const h = (w * el[3]) / el[2];
  return (
    <AbsoluteFill>
      <Dark t={t} />
      <Cam t={t} keys={[{ t: 0, s: 1, x: 0, y: 0 }, { t: B(6.2), s: 1.04, x: 0, y: 0 }, { t: B(8), ...focus(960, 700 + h / 2, 10), ease: 'in' }]}>
        <div style={{ position: 'absolute', left: 0, width: W, top: 300 }}>
          <Head t={t} at={0.05} text="Ask your event *anything.*" size={130} align="center" accent={C.violetSoft} step={0.16} />
        </div>
        <div style={{ position: 'absolute', left: 960 - w / 2, top: 700 }}>
          <Pop t={t} at={B(4.5)}>
            <Region file={PILL.file} sw={PILL.sw} sh={PILL.sh} rect={el} box={[0, 0, w, h]} radius={h / 2} shadow="0 20px 60px rgba(0,0,0,0.4)" />
          </Pop>
        </div>
      </Cam>
      <Flash t={t} at={B(7.6)} dur={0.5} />
    </AbsoluteFill>
  );
};

const DLG = shot('mcp-event');
const Dialog = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Your event, *in your AI tool.*" />
    <Pop t={t} at={B(0.5)} style={{ position: 'absolute', left: 560, top: 180 }}>
      <Region file={DLG.file} sw={DLG.sw} sh={DLG.sh} rect={[928, 493, 1024, 1011]} box={[0, 0, 800, 790]} radius={22} shadow={SHADOW} style={{ transform: `scale(${1 + lerp(t, B(1), B(12), 0, 0.06)})` }} />
    </Pop>
  </AbsoluteFill>
);

const Askable = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Sessions. Summaries. Speakers. *All askable.*" />
    <Region file={DLG.file} sw={DLG.sw} sh={DLG.sh} rect={[950, 890, 980, 400]} box={[330, 250, 1260, 514]} toRect={[970, 900, 940, 384]} p={lerp(t, 0, B(10), 0, 1, INOUT)} radius={22} shadow={SHADOW} style={{ background: '#fff' }} />
    <div style={{ position: 'absolute', left: 0, width: W, top: 840, display: 'flex', justifyContent: 'center', gap: 20 }}>
      {['Claude', 'ChatGPT', 'Your editor'].map((x, i) => (
        <Pop key={x} t={t} at={B(3 + i * 0.75)}>
          <Chip tone={i === 2 ? 'grey' : 'violet'} size={1.4}>{x}</Chip>
        </Pop>
      ))}
    </div>
  </AbsoluteFill>
);

const CHAT = shot('chat-thread');
const Ask = ({ t, B }: ShotCtx) => {
  const p = lerp(t, B(3), B(6), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <Title t={t} text="Ask like you’d ask *a colleague.*" />
      <Region file={CHAT.file} sw={CHAT.sw} sh={CHAT.sh} rect={[1020, 160, 610, 120]} box={[560, 360, 800, 157]} toRect={[0, 100, 1700, 1000]} toBox={[290, 170, 1340, 788]} p={p} radius={22 - 4 * p} shadow={SHADOW} style={{ background: '#fafafa' }} />
      <div style={{ position: 'absolute', left: 1180, top: 960 }}>
        <Pop t={t} at={B(8)}>
          <Chip tone="green" size={1.2}>3 sessions found · quotes and speakers</Chip>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

const CM = shot('continue-mcp');
const OnPage = ({ t, B }: ShotCtx) => {
  const lift = spr(t, B(4), 14, 0.8);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <Title t={t} text="On every recap page, too." />
      <Region file={CM.file} sw={CM.sw} sh={CM.sh} rect={[150, 60, 2100, 400]} box={[240, 330, 1440, 274]} radius={22} shadow={SHADOW} filter={`blur(${lift * 4}px)`} />
      <div style={{ position: 'absolute', left: 1080 - lift * 220, top: 430 + lift * 160, transform: `scale(${1 + lift * 0.9})`, transformOrigin: '0 50%', opacity: lift > 0.02 ? 1 : 0 }}>
        <Region file={CM.file} sw={CM.sw} sh={CM.sh} rect={[1577, 217, 577, 85]} box={[0, 0, 396, 58]} radius={29} shadow={lift > 0.02 ? '0 30px 80px rgba(16,16,22,0.3)' : undefined} />
      </div>
    </AbsoluteFill>
  );
};

const SUG = shot('suggestions');
const Inside = ({ t, B }: ShotCtx) => {
  const el = SUG.el;
  const w = 1100;
  const h = (w * el[3]) / el[2];
  return (
    <AbsoluteFill>
      <Dark t={t} tint={1.2} />
      <div style={{ position: 'absolute', left: 0, width: W, top: 230 }}>
        <Swap t={t} at={B(0.3)} swapAt={B(8.5)} from={'Your conference,\n*inside Claude.*'} to={'Ask your event\n*anything.*'} size={124} accent={C.violetSoft} align="center" style={{ width: W, height: 280 }} />
      </div>
      <div style={{ position: 'absolute', left: 960 - w / 2, top: 640 }}>
        <Pop t={t} at={B(2.5)}>
          <Region file={SUG.file} sw={SUG.sw} sh={SUG.sh} rect={el} box={[0, 0, w, h]} radius={18} shadow={SHADOW_DEEP} />
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

export const mcpFilm: FilmDef = {
  bpm: 142,
  music: 'music/mcp.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 8, render: Hook, name: 'hook' },
    { from: 8, to: 20, render: Dialog, name: 'dialog' },
    { from: 20, to: 30, render: Askable, name: 'askable' },
    { from: 30, to: 44, render: Ask, name: 'ask' },
    { from: 44, to: 56, render: OnPage, name: 'onpage' },
    { from: 56, to: 72, render: Inside, name: 'inside' },
    { from: 72, to: 80, render: ({ t }) => <EndCard t={t} line="RecapHub MCP. Works in Claude and ChatGPT." />, name: 'end' },
  ],
  sfx: [
    { at: 4.5, src: 'pop', vol: 0.3 },
    { at: 7, src: 'whoosh', vol: 0.4 },
    { at: 9, src: 'pop', vol: 0.2 },
    { at: 23, src: 'pop', vol: 0.2 },
    { at: 23.75, src: 'pop', vol: 0.2 },
    { at: 24.5, src: 'pop', vol: 0.2 },
    { at: 33, src: 'whoosh', vol: 0.2 },
    { at: 48, src: 'pop', vol: 0.25 },
    { at: 58.5, src: 'pop', vol: 0.25 },
    { at: 72, src: 'page-turn', vol: 0.35 },
  ],
};
