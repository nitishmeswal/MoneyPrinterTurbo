/* Event Intelligence, ~38 s, 126 BPM. Hook: "What did 40 speakers actually agree on?"
 * Real screens (Storybook captures of the published topic maps and insights): the mind map pulling out from its
 * centre, an opened theme, an opened debate ("Unresolved", three perspectives, "Watch the session"),
 * the "Where the time went" treemap and its speaker filter, and "The event at a glance".
 * Contradictions between speakers are not in the app yet, so they never appear. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, Chip, Dark, EndCard, FilmDef, Flash, Head, Lift, Light, Media, Pop, Region, SHADOW, SHADOW_DEEP, ShotCtx, Swap, W, focus, lerp, INOUT } from '../kit';
import { REELS, shot } from '../assets';

const Title: React.FC<{ t: number; text: string }> = ({ t, text }) => (
  <div style={{ position: 'absolute', left: 0, width: W, top: 50, display: 'flex', justifyContent: 'center' }}>
    <Head t={t} at={0.05} text={text} size={66} color={C.ink} accent={C.violet} align="center" />
  </div>
);
const FACES = [...REELS.raise, ...REELS.kayan, ...REELS.bnp, ...REELS.other].slice(0, 18);

const Hook = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Dark t={t} />
    <Cam t={t} keys={[{ t: 0, s: 1.08, x: 0, y: 0 }, { t: B(8), s: 1, x: 0, y: 0 }, { t: B(10), ...focus(960, 540, 6), ease: 'in' }]}>
      <div style={{ position: 'absolute', left: -40, top: -60, width: 2000, display: 'flex', flexWrap: 'wrap', gap: 18, opacity: 0.32, filter: 'blur(3px)', transform: `translateX(${-t * 14}px)` }}>
        {[...FACES, ...FACES].slice(0, 27).map((f, i) => (
          <div key={i} style={{ width: 205, height: 364, borderRadius: 16, overflow: 'hidden', opacity: lerp(t, (i % 9) * 0.05, (i % 9) * 0.05 + 0.4) }}>
            <Media file={`reels/${f}.jpg`} w={205} h={364} />
          </div>
        ))}
      </div>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(8,7,15,0.55) 0%, rgba(8,7,15,0.85) 70%)' }} />
      <div style={{ position: 'absolute', left: 0, width: W, top: 360 }}>
        <Head t={t} at={0.1} text="What did *40* speakers" size={120} accent={C.violetSoft} align="center" />
        <Head t={t} at={B(3)} text="actually *agree* on?" size={120} accent={C.violetSoft} align="center" />
      </div>
    </Cam>
    <Flash t={t} at={B(9.5)} dur={0.5} />
  </AbsoluteFill>
);

const MAP = shot('mindmap');
const Themes = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Every theme across *the whole event.*" />
    <Region file={MAP.file} sw={MAP.sw} sh={MAP.sh} rect={[1060, 230, 880, 550]} box={[240, 170, 1440, 900]} toRect={[0, 0, 2880, 1800]} p={lerp(t, B(1.5), B(6), 0, 1, INOUT)} radius={18} shadow={SHADOW} />
  </AbsoluteFill>
);

const THEME = shot('mindmap-theme');
const Theme = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="The questions people *argued over.*" />
    <Lift file={THEME.file} sw={THEME.sw} sh={THEME.sh} box={[240, 170, 1440, 900]} el={[832, 1050, 1216, 492]} p={lerp(t, B(1.5), B(3.5), 0, 1, INOUT)} scale={1.45} dx={140} dy={-200} blur={6} />
  </AbsoluteFill>
);

const Q = shot('mindmap-question');
const Debate = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Where each speaker *stood.*" />
    <Lift file={Q.file} sw={Q.sw} sh={Q.sh} box={[240, 170, 1440, 900]} el={[770, 1040, 1360, 760]} p={lerp(t, B(1), B(3), 0, 1, INOUT)} scale={1.3} dy={-300} blur={6} />
    <div style={{ position: 'absolute', left: 1450, top: 330 }}>
      <Pop t={t} at={B(4.5)}>
        <Chip tone="violet" size={1.5}>Unresolved</Chip>
      </Pop>
    </div>
  </AbsoluteFill>
);

const TREE = shot('treemap');
const TREE_S = shot('treemap-speaker');
const Time = ({ t, B }: ShotCtx) => {
  const x = lerp(t, B(5.5), B(6.5), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <div style={{ position: 'absolute', left: 0, width: W, top: 50 }}>
        <Swap t={t} at={0.05} swapAt={B(5.5)} from="Where the time *went.*" to="And who was *in the room.*" size={66} color={C.ink} accent={C.violet} align="center" style={{ width: W, height: 90 }} />
      </div>
      <Region file={TREE.file} sw={TREE.sw} sh={TREE.sh} rect={[0, 0, 2880, 1800]} box={[240, 170, 1440, 900]} radius={18} shadow={SHADOW} style={{ opacity: 1 - x }} />
      <Region file={TREE_S.file} sw={TREE_S.sw} sh={TREE_S.sh} rect={[900, 0, 1980, 1238]} box={[240, 170, 1440, 900]} radius={18} shadow={SHADOW} style={{ opacity: x }} />
    </AbsoluteFill>
  );
};

const GLANCE = shot('recap-insights');
const Glance = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Dark t={t} tint={1.2} />
    <Cam t={t} keys={[{ t: 0, s: 1.06, x: 0, y: 40 }, { t: B(16), s: 1, x: 0, y: 0, ease: 'inout' }]}>
      <Region file={GLANCE.file} sw={GLANCE.sw} sh={GLANCE.sh} rect={[120, 140, 2640, 1340]} box={[300, 330, 1320, 670]} radius={20} shadow={SHADOW_DEEP} style={{ opacity: lerp(t, 0, B(1)) }} />
    </Cam>
    <div style={{ position: 'absolute', left: 0, width: W, top: 70 }}>
      <Swap t={t} at={B(0.5)} swapAt={B(8.5)} from={'Find the debate your\naudience is *still having.*'} to={'Know what your event\n*actually said.*'} size={82} accent={C.violetSoft} align="center" style={{ width: W, height: 200 }} />
    </div>
  </AbsoluteFill>
);

export const intelFilm: FilmDef = {
  bpm: 126,
  music: 'music/intel.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 10, render: Hook, name: 'hook' },
    { from: 10, to: 22, render: Themes, name: 'themes' },
    { from: 22, to: 32, render: Theme, name: 'theme' },
    { from: 32, to: 44, render: Debate, name: 'debate' },
    { from: 44, to: 56, render: Time, name: 'time' },
    { from: 56, to: 72, render: Glance, name: 'glance' },
    { from: 72, to: 80, render: ({ t }) => <EndCard t={t} line="Event intelligence." />, name: 'end' },
  ],
  sfx: [
    { at: 8.8, src: 'whoosh', vol: 0.4 },
    { at: 23.5, src: 'pop', vol: 0.25 },
    { at: 36.5, src: 'pop', vol: 0.3 },
    { at: 49.5, src: 'switch', vol: 0.25 },
    { at: 72, src: 'page-turn', vol: 0.35 },
  ],
};
