/* Real-time / Live, ~37 s, 144 BPM. HOLD: check with Prakhar what is live today before this ships.
 * Hook: "Post the keynote clip before the keynote ends."  Payoff: "Live event. Live content."
 * Real: the HumanX stage, the stage wall, the live console marking a chapter (recording), the OBS → RecapHub
 * stream (recording), the on-air timer, ingest health, and Stefan Weitz's reel from that same stage. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, Dark, EndCard, FilmDef, Flash, Head, Lift, Light, LiveBadge, Media, Pop, Reel, Region, SHADOW, ShotCtx, W, focus, lerp, INOUT } from '../kit';
import { DEMO, FOOT, REEL, shot } from '../assets';

const Title: React.FC<{ t: number; text: string }> = ({ t, text }) => (
  <div style={{ position: 'absolute', left: 0, width: W, top: 50, display: 'flex', justifyContent: 'center' }}>
    <Head t={t} at={0.05} text={text} size={66} color={C.ink} accent={C.violet} align="center" />
  </div>
);
const tc = (s: number) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), Math.floor(s % 60)].map((n) => String(n).padStart(2, '0')).join(':');

const Hook = ({ t, B }: ShotCtx) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Cam t={t} keys={[{ t: 0, s: 1.06, x: 0, y: 0 }, { t: B(8), s: 1, x: 0, y: 0 }, { t: B(10), ...focus(200, 116, 12), ease: 'in' }]}>
      <Media file={FOOT.humanx.file} w={W} h={1080} rate={0.9} style={{ filter: 'brightness(0.42) saturate(0.9)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 30% 60%, transparent 30%, rgba(0,0,0,0.6) 100%)' }} />
      <div style={{ position: 'absolute', left: 120, top: 92, display: 'flex', alignItems: 'center', gap: 18 }}>
        <LiveBadge size={1.1} glow={0.6} />
        <div style={{ fontFamily: 'monospace', fontSize: 30, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{tc(41 * 60 + 12 + t)}</div>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 380 }}>
        <Head t={t} at={0.1} text="Post the keynote clip" size={124} />
        <Head t={t} at={B(4)} text="before the keynote *ends.*" size={124} accent={C.red} />
      </div>
    </Cam>
    <Flash t={t} at={B(9.6)} dur={0.5} />
  </AbsoluteFill>
);

const WALL = shot('stage-wall');
const Wall = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Every stage. *Live.*" />
    <Lift file={WALL.file} sw={WALL.sw} sh={WALL.sh} box={[240, 170, 1440, 900]} el={[1082, 208, 710, 450]} p={lerp(t, B(1.5), B(3.5), 0, 1, INOUT)} scale={1.5} dx={-40} dy={60} blur={5} />
  </AbsoluteFill>
);

const ING = DEMO.liveIngest;
const Console = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Mark chapters *while it happens.*" />
    <Region file={ING.file} sw={ING.sw} sh={ING.sh} rect={[90, 110, 850, 480]} box={[400, 200, 1120, 632]} toRect={[0, 0, ING.sw, ING.sh]} toBox={[290, 160, 1340, 886]} p={lerp(t, B(3), B(5.5), 0, 1, INOUT)} radius={18} shadow={SHADOW} />
  </AbsoluteFill>
);

const AV = DEMO.plugAv;
const Av = ({ t }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Straight from your *AV desk.*" />
    <Region file={AV.file} sw={AV.sw} sh={AV.sh} rect={[0, 0, AV.sw, AV.sh]} box={[290, 170, 1340, 838]} rate={0.82} radius={18} shadow={SHADOW} />
  </AbsoluteFill>
);

const AIR = shot('onair-live');
const HEALTH = shot('ingest-healthy');
const Health = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="On air. *All checks green.*" />
    <div style={{ position: 'absolute', left: 300, top: 300 }}>
      <Pop t={t} at={B(0.5)}>
        <Region file={AIR.file} sw={AIR.sw} sh={AIR.sh} rect={[975, 596, 445, 399]} box={[0, 0, 560, 502]} radius={26} shadow={SHADOW} />
      </Pop>
    </div>
    <div style={{ position: 'absolute', left: 950, top: 430 }}>
      <Pop t={t} at={B(2.5)}>
        <Region file={HEALTH.file} sw={HEALTH.sw} sh={HEALTH.sh} rect={HEALTH.el} box={[0, 0, 680, (680 * HEALTH.el[3]) / HEALTH.el[2]]} radius={20} shadow={SHADOW} />
      </Pop>
    </div>
  </AbsoluteFill>
);

const Payoff = ({ t, B }: ShotCtx) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Media file={FOOT.humanx.file} w={W} h={1080} from={4} rate={0.9} style={{ filter: 'blur(10px) brightness(0.45)' }} />
    <div style={{ position: 'absolute', left: 60, top: 50 }}>
      <LiveBadge size={0.9} />
    </div>
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1030, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)' }}>
      <div style={{ width: `${88 + t * 0.6}%`, height: '100%', borderRadius: 3, background: C.red }} />
    </div>
    <div style={{ position: 'absolute', left: 70, top: 1000, fontFamily: 'Outfit', fontSize: 20, color: '#fff', opacity: 0.8 }}>● Live edge</div>
    <div style={{ position: 'absolute', left: 520, top: 110 }}>
      <Pop t={t} at={0.05}>
        <Reel file={REEL('humanx-stefan-weitz')} w={480} from={3} />
      </Pop>
    </div>
    <div style={{ position: 'absolute', left: 1080, top: 400 }}>
      <Head t={t} at={B(1)} text="Live event." size={120} />
      <Head t={t} at={B(3)} text="*Live content.*" size={120} accent={C.violetSoft} />
    </div>
  </AbsoluteFill>
);

export const liveFilm: FilmDef = {
  bpm: 144,
  music: 'music/live.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 10, render: Hook, name: 'hook' },
    { from: 10, to: 22, render: Wall, name: 'wall' },
    { from: 22, to: 36, render: Console, name: 'console' },
    { from: 36, to: 48, render: Av, name: 'av' },
    { from: 48, to: 60, render: Health, name: 'health' },
    { from: 60, to: 76, render: Payoff, name: 'payoff' },
    { from: 76, to: 84, render: ({ t }) => <EndCard t={t} line="Live event. Live content." />, name: 'end' },
  ],
  sfx: [
    { at: 8.8, src: 'whoosh', vol: 0.4 },
    { at: 11.5, src: 'pop', vol: 0.2 },
    { at: 25, src: 'whoosh', vol: 0.2 },
    { at: 48.5, src: 'pop', vol: 0.25 },
    { at: 50.5, src: 'ding', vol: 0.2 },
    { at: 76, src: 'page-turn', vol: 0.35 },
  ],
};
