/* Audience Analytics, ~35 s, 138 BPM. HOLD until real data flows (after #436).
 * The analytics screens are not built yet (docs/plans/PLAN-analytics-overview.md), so this uses the real
 * published pages and dashboard with the plan's metrics overlaid, every number tagged as a preview.
 * Hook: "Finally know what your attendees cared about." */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Chip, Dark, EndCard, FilmDef, Head, Light, OUTFIT, Pill, Pop, Region, SHADOW, ShotCtx, W, lerp, INOUT } from '../kit';
import { SCREEN, shot } from '../assets';

const Title: React.FC<{ t: number; text: string }> = ({ t, text }) => (
  <div style={{ position: 'absolute', left: 0, width: W, top: 50, display: 'flex', justifyContent: 'center' }}>
    <Head t={t} at={0.05} text={text} size={66} color={C.ink} accent={C.violet} align="center" />
  </div>
);
const Preview = () => (
  <div style={{ position: 'absolute', right: 40, bottom: 34 }}>
    <Chip tone="grey" size={0.9}>Preview · illustrative numbers</Chip>
  </div>
);
const count = (t: number, a: number, b: number, to: number) => Math.round(lerp(t, a, b, 0, to, INOUT));

const Hook = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Dark t={t} />
    <div style={{ position: 'absolute', left: 140, top: 340 }}>
      <Head t={t} at={0.05} text="Finally know what" size={130} />
      <Head t={t} at={B(4)} text="your attendees *cared about.*" size={130} accent={C.violetSoft} />
    </div>
  </AbsoluteFill>
);

const WEF = SCREEN.wefPage;
const Then = ({ t, B }: ShotCtx) => {
  const sweep = lerp(t, B(2), B(9), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <Title t={t} text="You published the recap. *Then what?*" />
      <div style={{ position: 'absolute', left: 360, top: 170, width: 1200, height: 825, borderRadius: 20, overflow: 'hidden', boxShadow: SHADOW }}>
        <Region file={WEF.file} sw={WEF.sw} sh={WEF.sh} rect={[0, 0, WEF.sw, WEF.sh]} box={[0, 0, 1200, 825]} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: `${sweep * 100}%`, background: 'linear-gradient(180deg, rgba(245,170,36,0.42) 0%, rgba(245,120,36,0.25) 45%, rgba(91,61,245,0.12) 80%, transparent 100%)', mixBlendMode: 'multiply' }} />
      </div>
      <Preview />
    </AbsoluteFill>
  );
};

const DASH = SCREEN.dashboard;
const STATS: [string, number][] = [['Visits', 412], ['Page views', 1290], ['Sessions opened', 233], ['Plays', 140]];
const Who = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Who came back, *and what they opened.*" />
    <Region file={DASH.file} sw={DASH.sw} sh={DASH.sh} rect={[0, 0, DASH.sw, DASH.sh]} box={[260, 190, 1400, 756]} radius={20} shadow={SHADOW} filter="blur(4px) brightness(0.96)" />
    <div style={{ position: 'absolute', left: 0, width: W, top: 420, display: 'flex', justifyContent: 'center', gap: 26 }}>
      {STATS.map(([k, v], i) => (
        <Pop key={k} t={t} at={B(1 + i * 0.75)}>
          <div style={{ background: '#fff', borderRadius: 26, padding: '26px 34px', boxShadow: '0 30px 80px rgba(16,16,22,0.2)', minWidth: 250, fontFamily: OUTFIT }}>
            <div style={{ fontWeight: 600, fontSize: 22, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.grey }}>{k}</div>
            <div style={{ fontWeight: 700, fontSize: 84, letterSpacing: '-0.04em', color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{count(t, B(1 + i * 0.75), B(3 + i * 0.75), v).toLocaleString('en-US')}</div>
          </div>
        </Pop>
      ))}
    </div>
    <Preview />
  </AbsoluteFill>
);

const MAPS = shot('topicmaps');
const REACH: [string, number][] = [['Hero', 100], ['Sessions', 82], ['What was argued', 58], ['Where the time went', 41]];
const Reach = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="How far *they read.*" />
    <Region file={MAPS.file} sw={MAPS.sw} sh={MAPS.sh} rect={[0, 0, 2880, 2000]} box={[200, 180, 1100, 764]} toRect={[0, 800, 2880, 2000]} p={lerp(t, B(1), B(9), 0, 1, INOUT)} radius={18} shadow={SHADOW} />
    <div style={{ position: 'absolute', left: 1360, top: 220, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {REACH.map(([k, v], i) => (
        <Pop key={k} t={t} at={B(1 + i * 1.5)}>
          <div style={{ width: 400, fontFamily: OUTFIT }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 30, color: C.ink }}>
              <span>{k}</span>
              <span style={{ color: C.violet }}>{count(t, B(1 + i * 1.5), B(2.5 + i * 1.5), v)}%</span>
            </div>
            <div style={{ height: 14, borderRadius: 7, background: '#E6E5EE', marginTop: 10 }}>
              <div style={{ width: `${lerp(t, B(1 + i * 1.5), B(2.5 + i * 1.5), 0, v)}%`, height: '100%', borderRadius: 7, background: C.violet }} />
            </div>
          </div>
        </Pop>
      ))}
    </div>
    <Preview />
  </AbsoluteFill>
);

const AGENDA = shot('agenda');
const Watched = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="What they *actually watched.*" />
    <Region file={AGENDA.file} sw={AGENDA.sw} sh={AGENDA.sh} rect={[0, 200, 2880, 1700]} box={[260, 180, 1400, 826]} radius={18} shadow={SHADOW} />
    <div style={{ position: 'absolute', left: 1180, top: 330 }}>
      <Pop t={t} at={B(1.5)}>
        <Pill size={1} bg={C.violet} color="#fff">▶ 54 opens · 31 watched half</Pill>
      </Pop>
    </div>
    <Preview />
  </AbsoluteFill>
);

const Payoff = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Dark t={t} tint={1.2} />
    <div style={{ position: 'absolute', left: 0, width: W, top: 330 }}>
      <Head t={t} at={0.1} text="Know what landed." size={130} align="center" />
      <Head t={t} at={B(3)} text="*Make more of it.*" size={130} align="center" accent={C.violetSoft} />
    </div>
  </AbsoluteFill>
);

export const analyticsFilm: FilmDef = {
  bpm: 138,
  music: 'music/analytics.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 8, render: Hook, name: 'hook' },
    { from: 8, to: 20, render: Then, name: 'then' },
    { from: 20, to: 34, render: Who, name: 'who' },
    { from: 34, to: 44, render: Reach, name: 'reach' },
    { from: 44, to: 52, render: Watched, name: 'watched' },
    { from: 52, to: 68, render: Payoff, name: 'payoff' },
    { from: 68, to: 76, render: ({ t }) => <EndCard t={t} line="Audience analytics for every recap." />, name: 'end' },
  ],
  sfx: [
    { at: 21, src: 'pop', vol: 0.2 },
    { at: 21.75, src: 'pop', vol: 0.2 },
    { at: 22.5, src: 'pop', vol: 0.2 },
    { at: 23.25, src: 'pop', vol: 0.2 },
    { at: 45.5, src: 'pop', vol: 0.25 },
    { at: 68, src: 'page-turn', vol: 0.35 },
  ],
};
