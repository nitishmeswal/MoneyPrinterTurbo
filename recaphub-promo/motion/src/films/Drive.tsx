/* Integrations & workflow, ~34 s, 134 BPM. Flow film. "Drop the recording in Drive. RecapHub does the rest."
 * Three sources (a Drive folder, an upload, the AV feed) wire into RecapHub, pulses travelling the lines; then
 * the real screens: a download in progress ("26 GB in about five minutes" is Prakhar's figure from the brief),
 * the agenda being read then ready, the session library turning ready row by row, the brand panel.
 * The Drive picker itself is not captured yet (RECORDINGS.md in recaphub-videos). Generic icons, plain names.
 * Music: stabs 0 / 4, build 8, drop 60 (payoff), end 68. */
import React from 'react';
import { Img } from 'remotion';
import { Draw, EIO, FilmDef, INOUT, Rise, lerp, src } from '../kit';
import { BR, Box } from '../brand';
import { Library, Source, Z } from '../ui';
import { CapCard, Scene, Top, chain, end, endSfx, title, titleSfx } from '../shots';
import { cap } from '../assets';

const DL = cap('download-progress');
const PARSE = cap('agenda-upload-parsing');
const READY = cap('agenda-upload-ready');
const BRAND = cap('brand-panel');
const HUB = [1420, 600];
const SRC_Y = [300, 520, 740];
const bez = (y0: number, u: number) => {
  const p0 = [640, y0 + 60], p1 = [940, y0 + 60], p2 = [HUB[0] - 300, HUB[1]], p3 = HUB;
  const m = 1 - u;
  return [0, 1].map((i) => m * m * m * p0[i] + 3 * m * m * u * p1[i] + 3 * m * u * u * p2[i] + u * u * u * p3[i]);
};

export const driveFilm: FilmDef = {
  id: 'Drive',
  bpm: 134,
  music: 'music/drive.wav',
  tail: 1,
  shots: chain([
    {
      len: 8, name: 'hook',
      render: title({ text: 'Drop the recording in Drive.\n[RecapHub does the rest.]', size: 104, track: 120 }),
      sfx: (B) => titleSfx(2.6)(B),
    },
    {
      len: 12, name: 'flow',
      render: (c) => {
        const { t, B } = c;
        const kinds = [['drive', 'Google Drive', 'A folder you share'], ['upload', 'Upload', 'Files from your laptop'], ['av', 'AV feed', 'Straight from the stage']] as const;
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.04, ease: INOUT }]}>
            <Top t={t} at={B(0.2)} text="From wherever it *lives.*" size={84} y={90} />
            <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
              {SRC_Y.map((y, i) => <Draw key={i} d={`M640 ${y + 60} C 940 ${y + 60}, ${HUB[0] - 300} ${HUB[1]}, ${HUB[0]} ${HUB[1]}`} p={lerp(t, B(1.8 + i * 0.4), B(3 + i * 0.4), 0, 1, EIO)} stroke={BR.deep} width={5} />)}
              {t > B(3.5) ? SRC_Y.map((y, i) => [0, 0.5].map((o) => {
                const u = ((t - B(3.5)) * 0.55 + o + i * 0.17) % 1;
                const [x, yy] = bez(y, u);
                return <circle key={`${i}${o}`} cx={x} cy={yy} r={9} fill={BR.deep} opacity={Math.sin(Math.PI * u)} />;
              })) : null}
            </svg>
            {kinds.map(([k, l, s], i) => (
              <div key={k} style={{ position: 'absolute', left: 160, top: SRC_Y[i] }}>
                <Rise t={t} at={B(0.6 + i * 0.35)} x={-160} y={0} spring="soft"><Source kind={k} label={l} sub={s} /></Rise>
              </div>
            ))}
            <div style={{ position: 'absolute', left: HUB[0] - 30, top: HUB[1] - 110 }}>
              <Rise t={t} at={B(1.4)} y={0} s={0.6} spring="bouncy">
                <Box pad="40px 48px" radius={30}><Img src={src('brand/recaphub-lockup-black.png')} style={{ width: 360, display: 'block' }} /></Box>
              </Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], ...titleSfx()(B), [B(0.6), 'whoosh-soft', 0.25], [B(0.95), 'whoosh-soft', 0.25], [B(1.3), 'whoosh-soft', 0.25], [B(1.4), 'pop', 0.3], [B(1.8), 'swish', 0.2], [B(3.5), 'shimmer', 0.2]],
    },
    {
      len: 10, name: 'download',
      render: (c) => {
        const { t, B } = c;
        const k = 2.6;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.06, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text={'26 GB in about\n*five minutes.*'} size={110} y={160} />
            <CapCard t={t} at={B(0.6)} file={DL.file} sw={DL.sw} sh={DL.sh} rect={DL.el} box={[(1920 - DL.el[2] * k) / 2, 600, DL.el[2] * k, DL.el[3] * k]} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.6), 'whoosh-soft', 0.3]],
    },
    {
      len: 10, name: 'agenda',
      render: (c) => {
        const { t, B } = c;
        const k = 1.25;
        const sw = lerp(t, B(4.5), B(5.2), 0, 1, EIO);
        return (
          <Scene c={c} cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.05, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="Your agenda, *read for you.*" size={88} y={150} />
            <div style={{ opacity: 1 - sw, filter: sw ? `blur(${sw * 10}px)` : undefined }}>
              <CapCard t={t} at={B(0.6)} file={PARSE.file} sw={PARSE.sw} sh={PARSE.sh} rect={PARSE.el} box={[(1920 - 1280 * k) / 2, 420, 1280 * k, 232 * k]} />
            </div>
            {t >= B(4.5) ? <div style={{ opacity: sw, filter: sw < 1 ? `blur(${(1 - sw) * 10}px)` : undefined, transform: `scale(${0.96 + 0.04 * sw})` }}>
              <CapCard t={t} at={B(4.5)} y={0} s={1} file={READY.file} sw={READY.sw} sh={READY.sh} rect={READY.el} box={[(1920 - 1280 * k) / 2, 420, 1280 * k, 124 * k]} />
            </div> : null}
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.6), 'whoosh-soft', 0.3], [B(4.6), 'chime', 0.3]],
    },
    {
      len: 12, name: 'library',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.04, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="Every session, *ready.*" size={84} y={70} />
            <div style={{ position: 'absolute', left: (1920 - 760 * 1.7) / 2, top: 230 }}>
              <Rise t={t} at={B(0.5)} y={120} spring="soft"><Z s={1.7}><Library t={t} at={B(0.8)} ready={[B(3), B(4.2), B(5.4), B(6.6), B(7.8)]} /></Z></Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.5), 'whoosh-soft', 0.3], ...[3, 4.2, 5.4, 6.6, 7.8].map((x) => [B(x), 'pop', 0.3] as [number, 'pop', number])],
    },
    {
      len: 8, name: 'brand',
      render: (c) => {
        const { t, B } = c;
        const k = 0.72;
        return (
          <Scene c={c} cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.05, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="On brand, *every format.*" size={84} y={70} />
            <CapCard t={t} at={B(0.5)} file={BRAND.file} sw={BRAND.sw} sh={BRAND.sh} rect={BRAND.el} box={[(1920 - BRAND.el[2] * k) / 2, 220, BRAND.el[2] * k, BRAND.el[3] * k]} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.5), 'whoosh-soft', 0.3]],
    },
    {
      len: 8, name: 'payoff',
      render: title({ text: 'From folder\nto [ready-to-post.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 150, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.4], ...titleSfx(1.4)(B)],
    },
    { len: 8, name: 'end', render: end('Drop it in. RecapHub does the rest.'), sfx: endSfx },
  ]),
};
