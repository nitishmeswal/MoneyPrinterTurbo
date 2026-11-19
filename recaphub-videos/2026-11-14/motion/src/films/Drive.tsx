/* Integrations & workflow, ~36 s, 134 BPM. Hook: "Drop the recording in Drive. RecapHub does the rest."
 * Real (recaphub_3.0 Storybook captures): the session library with processing states, a real download in
 * progress, the agenda upload and review table, the brand panel and speaker review; the outputs at the end.
 * "26 GB in about five minutes" is Prakhar's figure from the brief. The Drive picker itself is not in
 * Storybook: record it (RECORDINGS.md) and it replaces the file-drop graphic. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, Card, Dark, EndCard, FilmDef, Flash, Head, Light, OUTFIT, Pop, Region, SHADOW, ShotCtx, Swap, W, focus, lerp, spr, INOUT } from '../kit';
import { REEL, shot } from '../assets';
import { Reel } from '../kit';

const Title: React.FC<{ t: number; text: string }> = ({ t, text }) => (
  <div style={{ position: 'absolute', left: 0, width: W, top: 50, display: 'flex', justifyContent: 'center' }}>
    <Head t={t} at={0.05} text={text} size={66} color={C.ink} accent={C.violet} align="center" />
  </div>
);

const Hook = ({ t, B }: ShotCtx) => {
  const drop = lerp(t, B(1.5), B(3.2), 0, 1, INOUT);
  const land = t >= B(3.2);
  return (
    <AbsoluteFill>
      <Dark t={t} />
      <Cam t={t} keys={[{ t: 0, s: 1, x: 0, y: 0 }, { t: B(8), s: 1.03, x: 0, y: 0 }, { t: B(10), ...focus(1400, 600, 8), ease: 'in' }]}>
        <div style={{ position: 'absolute', left: 130, top: 330, width: 1000, height: 360 }}>
          <Swap t={t} at={0.1} swapAt={B(4.5)} from={'Drop the recording\nin *Drive.*'} to={'RecapHub does\n*the rest.*'} size={120} accent={C.violetSoft} style={{ width: 1000, height: 300 }} />
        </div>
        <div style={{ position: 'absolute', left: 1150, top: 470, width: 520, height: 300, borderRadius: 28, border: '3px dashed rgba(255,255,255,0.25)', background: land ? 'rgba(91,61,245,0.18)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 26, boxSizing: 'border-box', fontFamily: OUTFIT, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>
          Drive · Harbor Summit / Recordings
        </div>
        <div style={{ position: 'absolute', left: 1180 + (1 - drop) * 380, top: 520 - (1 - drop) * 420, transform: `rotate(${(1 - drop) * 10}deg) scale(${land ? 1 - 0.06 * spr(t, B(3.2), 10) : 1})`, opacity: Math.min(1, lerp(t, B(1.4), B(1.8))) }}>
          <div style={{ width: 460, display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 18, padding: '20px 24px', boxShadow: '0 30px 70px rgba(0,0,0,0.45)', fontFamily: OUTFIT }}>
            <div style={{ width: 64, height: 46, borderRadius: 10, background: C.violet, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>▶</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 26, color: C.ink }}>keynote-main-stage.mov</div>
              <div style={{ fontWeight: 500, fontSize: 21, color: C.grey }}>26 GB · 4K</div>
            </div>
          </div>
        </div>
      </Cam>
      <Flash t={t} at={B(9.6)} dur={0.5} />
    </AbsoluteFill>
  );
};

const LIB = shot('session-list');
const DL = shot('download-progress');
const Library = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="In the library. *Already processing.*" />
    <Region file={LIB.file} sw={LIB.sw} sh={LIB.sh} rect={LIB.el} box={[330, 180, 1260, 834]} radius={22} shadow={SHADOW} style={{ background: '#fff' }} />
    <div style={{ position: 'absolute', left: 960 - 380, top: 820 }}>
      <Pop t={t} at={B(3)}>
        <Region file={DL.file} sw={DL.sw} sh={DL.sh} rect={[DL.el[0] - 20, DL.el[1] - 20, DL.el[2] + 40, DL.el[3] + 40]} box={[0, 0, 760, 760 * ((DL.el[3] + 40) / (DL.el[2] + 40))]} radius={18} shadow="0 30px 80px rgba(16,16,22,0.25)" style={{ background: '#fff' }} />
      </Pop>
    </div>
  </AbsoluteFill>
);

const UP = shot('agenda-upload-ready');
const REV = shot('agenda-review');
const Agenda = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Your agenda, *read for you.*" />
    <div style={{ position: 'absolute', left: 960 - 520, top: 200 }}>
      <Pop t={t} at={B(0.5)}>
        <Region file={UP.file} sw={UP.sw} sh={UP.sh} rect={UP.el} box={[0, 0, 1040, (1040 * UP.el[3]) / UP.el[2]]} radius={16} shadow={SHADOW} style={{ background: '#fff' }} />
      </Pop>
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: lerp(t, B(2.5), B(3.5)), transform: `translateY(${(1 - lerp(t, B(2.5), B(4), 0, 1)) * 60}px)` }}>
      <Region file={REV.file} sw={REV.sw} sh={REV.sh} rect={REV.el} box={[240, 380, 1440, 460]} radius={18} shadow={SHADOW} style={{ background: '#fff' }} />
    </div>
  </AbsoluteFill>
);

const BRAND = shot('brand-panel');
const Brand = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Your brand, *pulled from your site.*" />
    <Region file={BRAND.file} sw={BRAND.sw} sh={BRAND.sh} rect={BRAND.el} box={[360, 190, 1200, 623]} radius={22} shadow={SHADOW} style={{ background: '#fff', transform: `scale(${1 + lerp(t, 0, B(12), 0, 0.05)})` }} />
  </AbsoluteFill>
);

const SPK = shot('speaker-review');
const Speakers = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Every speaker, *matched.*" />
    <Region file={SPK.file} sw={SPK.sw} sh={SPK.sh} rect={SPK.el} box={[480, 180, 960, 735]} radius={22} shadow={SHADOW} style={{ background: '#fff', transform: `scale(${1 + lerp(t, 0, B(12), 0, 0.05)})` }} />
  </AbsoluteFill>
);

const CLIPS = shot('clips-ready');
const GLANCE = shot('recap-insights');
const Done = ({ t, B }: ShotCtx) => {
  const items = [
    { at: 1, x: 120, y: 470, w: 560, ry: 16, node: <Region file={CLIPS.file} sw={CLIPS.sw} sh={CLIPS.sh} rect={CLIPS.el} box={[0, 0, 560, 496]} /> , h: 496 },
    { at: 1.6, x: 1240, y: 470, w: 560, ry: -16, node: <Region file={GLANCE.file} sw={GLANCE.sw} sh={GLANCE.sh} rect={[120, 140, 2640, 1340]} box={[0, 0, 560, 284]} />, h: 284 },
  ];
  return (
    <AbsoluteFill>
      <Dark t={t} tint={1.2} />
      {items.map((it, i) => {
        const p = spr(t, B(it.at), 15, 0.8);
        return (
          <div key={i} style={{ position: 'absolute', left: it.x, top: it.y + (1 - p) * 400, opacity: Math.min(1, p * 1.5) }}>
            <Card x={0} y={0} w={it.w} h={it.h} ry={it.ry} rx={4}>{it.node}</Card>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 830, top: 420 }}>
        <Pop t={t} at={B(2.2)}>
          <Reel file={REEL('kayan-steven-bartlett')} w={260} from={5} />
        </Pop>
      </div>
      <div style={{ position: 'absolute', left: 0, width: W, top: 90 }}>
        <Swap t={t} at={B(0.2)} swapAt={B(8.5)} from={'26 GB in.\n*About five minutes.*'} to={'No new tool.\n*Just your recap.*'} size={104} accent={C.violetSoft} align="center" style={{ width: W, height: 250 }} />
      </div>
    </AbsoluteFill>
  );
};

export const driveFilm: FilmDef = {
  bpm: 134,
  music: 'music/drive.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 10, render: Hook, name: 'hook' },
    { from: 10, to: 20, render: Library, name: 'library' },
    { from: 20, to: 32, render: Agenda, name: 'agenda' },
    { from: 32, to: 44, render: Brand, name: 'brand' },
    { from: 44, to: 56, render: Speakers, name: 'speakers' },
    { from: 56, to: 72, render: Done, name: 'done' },
    { from: 72, to: 80, render: ({ t }) => <EndCard t={t} line="Drop it in. RecapHub does the rest." />, name: 'end' },
  ],
  sfx: [
    { at: 3.2, src: 'pop', vol: 0.35 },
    { at: 8.8, src: 'whoosh', vol: 0.4 },
    { at: 13, src: 'pop', vol: 0.25 },
    { at: 20.5, src: 'pop', vol: 0.25 },
    { at: 57, src: 'whoosh', vol: 0.25 },
    { at: 72, src: 'page-turn', vol: 0.35 },
  ],
};
