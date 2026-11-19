/* Press Room, ~38 s, 132 BPM. Hook: "Journalists don't wait. Neither should your press kit."
 * Real screens (recaphub_3.0 Storybook captures): the press gate, the RAISE Summit Paris press room,
 * the quote wall, the journalist's "Your lane" email, trusted publications, and the room's MCP card. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, Check, Chip, Dark, EndCard, FilmDef, Flash, Head, Lift, Light, Pill, Pop, Region, SHADOW, SHADOW_DEEP, ShotCtx, Swap, W, focus, lerp, INOUT } from '../kit';
import { shot } from '../assets';

const Title: React.FC<{ t: number; text: string; size?: number }> = ({ t, text, size = 66 }) => (
  <div style={{ position: 'absolute', left: 0, width: W, top: 48, display: 'flex', justifyContent: 'center' }}>
    <Head t={t} at={0.05} text={text} size={size} color={C.ink} accent={C.violet} align="center" />
  </div>
);

const Hook = ({ t, B }: ShotCtx) => {
  const secs = 58 * 60 + 2 + Math.floor(Math.max(0, t - B(2)) / B(1));
  return (
    <AbsoluteFill>
      <Dark t={t} />
      <Cam t={t} keys={[{ t: 0, s: 1, x: 0, y: 0 }, { t: B(8), s: 1.03, x: 0, y: 0 }, { t: B(10), ...focus(305, 740, 10), ease: 'in' }]}>
        <div style={{ position: 'absolute', left: 140, top: 300, width: 1500, height: 380 }}>
          <Swap t={t} at={0.1} swapAt={B(4.5)} from={'Journalists\ndon’t *wait.*'} to={'Neither should\nyour *press* *kit.*'} size={140} accent={C.red} style={{ width: 1500, height: 300 }} />
        </div>
        <div style={{ position: 'absolute', left: 140, top: 690 }}>
          <Pop t={t} at={B(2)}>
            <Pill size={1} bg="rgba(255,255,255,0.1)" color={C.white} style={{ boxShadow: 'none', border: '1px solid rgba(255,255,255,0.18)' }}>
              <span style={{ width: 14, height: 14, borderRadius: 7, background: C.red }} /> Deadline <span style={{ fontVariantNumeric: 'tabular-nums' }}>17:{String(Math.floor(secs / 60) % 60).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}</span>
            </Pill>
          </Pop>
        </div>
      </Cam>
      <Flash t={t} at={B(9.6)} dur={0.5} />
    </AbsoluteFill>
  );
};

const GATE = shot('press-gate');
const Gate = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="A press room, *for press only.*" />
    <Lift file={GATE.file} sw={GATE.sw} sh={GATE.sh} box={[240, 175, 1440, 900]} el={[1560, 520, 1180, 720]} p={lerp(t, B(2.5), B(4.5), 0, 1, INOUT)} scale={1.25} dx={-60} blur={6} />
    <div style={{ position: 'absolute', left: 1180, top: 900 }}>
      <Pop t={t} at={B(5.5)}>
        <Chip tone="green" size={1.3}><Check size={26} /> Verified at the door</Chip>
      </Pop>
    </div>
  </AbsoluteFill>
);

const ROOM = shot('press-room');
const Room = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text={'Quotes, clips and transcripts.\n*Minutes after the talk.*'} size={58} />
    <Cam t={t} keys={[{ t: 0, s: 1.04, x: 0, y: 20 }, { t: B(12), s: 1, x: 0, y: 0, ease: 'inout' }]}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 1080 }}>
        <Lift file={ROOM.file} sw={ROOM.sw} sh={ROOM.sh} box={[330, 230, 1260, 875]} el={[60, 700, 1960, 300]} p={lerp(t, B(4.5), B(6.5), 0, 1, INOUT)} scale={1.14} dy={-30} blur={5} />
      </div>
    </Cam>
    <div style={{ position: 'absolute', left: 380, top: 248 }}>
      <Pop t={t} at={B(2)}>
        <Chip tone="red" size={1.1}><span style={{ width: 12, height: 12, borderRadius: 6, background: C.red }} /> Live news coming in</Chip>
      </Pop>
    </div>
  </AbsoluteFill>
);

const QUOTES = shot('press-quotes');
const Quotes = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Every quote, *ready to copy.*" />
    <Lift file={QUOTES.file} sw={QUOTES.sw} sh={QUOTES.sh} box={[240, 170, 1440, 1000]} el={[10, 520, 2840, 330]} p={lerp(t, B(1.5), B(3.5), 0, 1, INOUT)} scale={1.1} dy={30} blur={5} />
    <div style={{ position: 'absolute', left: 1420, top: 420 }}>
      <Pop t={t} at={B(5.5)}>
        <Chip tone="violet" size={1.3}><Check size={26} /> Copied</Chip>
      </Pop>
    </div>
  </AbsoluteFill>
);

const LANE = shot('press-lane-email');
const Lane = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Their own *lane*, in their inbox." />
    <Region file={LANE.file} sw={LANE.sw} sh={LANE.sh} rect={[180, 0, 1440, 1040]} box={[480, 180, 960, 693]} toRect={[180, 900, 1440, 1040]} p={lerp(t, B(1), B(7.5), 0, 1, INOUT)} radius={18} shadow={SHADOW} />
  </AbsoluteFill>
);

const ACCESS = shot('press-access');
const Access = ({ t }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Trusted mastheads get in. *Nobody else.*" />
    <Region file={ACCESS.file} sw={ACCESS.sw} sh={ACCESS.sh} rect={[0, 0, 2200, 900]} box={[300, 220, 1320, 540]} radius={18} shadow={SHADOW} style={{ transform: `scale(${1 + t * 0.012})` }} />
  </AbsoluteFill>
);

const Mcp = ({ t, B }: ShotCtx) => {
  const p = lerp(t, 0, B(2), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Dark t={t} tint={1.2} />
      <Region file={ROOM.file} sw={ROOM.sw} sh={ROOM.sh} rect={[2010, 140, 850, 690]} box={[1040 + (1 - p) * 300, 230, 740, 601]} radius={22} shadow={SHADOW_DEEP} style={{ opacity: p }} />
      <div style={{ position: 'absolute', left: 140, top: 330, width: 900, height: 400 }}>
        <Swap t={t} at={B(0.5)} swapAt={B(8.5)} from={'And they can\n*ask it* themselves.'} to={'Journalists don’t wait.\n*Now they don’t have to.*'} size={84} accent={C.violetSoft} style={{ width: 900, height: 300 }} />
      </div>
    </AbsoluteFill>
  );
};

export const pressFilm: FilmDef = {
  bpm: 132,
  music: 'music/press.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 10, render: Hook, name: 'hook' },
    { from: 10, to: 20, render: Gate, name: 'gate' },
    { from: 20, to: 32, render: Room, name: 'room' },
    { from: 32, to: 42, render: Quotes, name: 'quotes' },
    { from: 42, to: 50, render: Lane, name: 'lane' },
    { from: 50, to: 56, render: Access, name: 'access' },
    { from: 56, to: 72, render: Mcp, name: 'mcp' },
    { from: 72, to: 80, render: ({ t }) => <EndCard t={t} line="Press rooms that keep up." />, name: 'end' },
  ],
  sfx: [
    { at: 2, src: 'tick', vol: 0.3 },
    { at: 8.8, src: 'whoosh', vol: 0.4 },
    { at: 15.5, src: 'ding', vol: 0.2 },
    { at: 22, src: 'pop', vol: 0.25 },
    { at: 37.5, src: 'mouse-click', vol: 0.4 },
    { at: 56, src: 'whoosh', vol: 0.3 },
    { at: 72, src: 'page-turn', vol: 0.35 },
  ],
};
