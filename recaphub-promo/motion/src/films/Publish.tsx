/* "Publish your event recap in 3 steps": tutorial film, ~46 s, 124 BPM.
 * The brand step timeline opens each step (the camera pushes onto the active disc). 1 Choose: the publish
 * dialog (Event page) and the real theme gallery (a dark theme lifts off when clicked). 2 Customise: the real
 * insight-section editor and the real MCP-button editor, their toggles switched on. 3 Publish: "Save layout &
 * open", then the published page and its one link.
 * Music: stabs 0, build 8, lifts 30 / 50, drop 80 (payoff), end 88. */
import React from 'react';
import { Browser, Cue, Cursor, EIO, FilmDef, INOUT, Lift, Rise, focus, lerp } from '../kit';
import { Steps, UI } from '../brand';
import { Hero, LinkBox, PublishDialog, Toast, Z } from '../ui';
import { CapCard, Scene, ToggleOff, Top, chain, end, endSfx, title, titleSfx } from '../shots';
import { BOX, cap } from '../assets';
import type { ShotCtx } from '../kit';

const STEPS3 = [
  { name: 'Choose', text: 'The event page and a theme' },
  { name: 'Customise', text: 'Topic maps and the MCP button' },
  { name: 'Publish', text: 'Preview, publish, share one link' },
];
const SX = 206, SY = 470, SS = 2.9;
const disc = (k: number) => [SX + 14 * SS + k * ((520 - 28) / 3) * SS + 10 * SS, SY + 20 * SS];
const THEMES = cap('themes');
const tk = 1100 / THEMES.sw;
const scholar = [160 + (BOX.themeScholar[0] + BOX.themeScholar[2] / 2) * tk, 140 + (BOX.themeScholar[1] + BOX.themeScholar[3] / 2) * tk];
const TM = cap('topicmaps-editor');
const CTA = cap('mcp-cta-editor');

/** The step timeline with steps up to `k` lit; the camera pushes onto disc k. */
const opener = (k: number) => (c: ShotCtx) => {
  const { t, B, dur } = c;
  const d = disc(k);
  return (
    <Scene c={c} tin="cut" tout="fade" dout={B(0.6)} cam={[{ t: 0, s: 1 }, { t: B(1), s: 1 }, { t: dur, ...focus(d[0], d[1] + 60, 2.2), ease: EIO }]}>
      <div style={{ position: 'absolute', left: SX, top: SY }}>
        <Steps t={t} steps={STEPS3} on={[0, 1, 2].map((i) => (i < k ? -1 : i === k ? B(0.5) : 1e9))} scale={SS} width={520} />
      </div>
    </Scene>
  );
};
const openerSfx = (B: (n: number) => number): Cue[] => [[B(0.5), 'pop', 0.35], [B(1.5), 'whoosh', 0.35]];

export const publishFilm: FilmDef = {
  id: 'Publish',
  bpm: 124,
  music: 'music/publish.wav',
  tail: 1,
  shots: chain([
    {
      len: 8, name: 'intro',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="cut" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.03, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text={'Publish your event recap\nin *three steps.*'} size={100} y={110} />
            <div style={{ position: 'absolute', left: SX, top: SY }}>
              <Rise t={t} at={B(2)} y={60} spring="soft"><Steps t={t} steps={STEPS3} on={[B(3), B(4), B(5)]} scale={SS} width={520} /></Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [...titleSfx()(B), [B(2), 'whoosh-soft', 0.3], [B(3), 'pop', 0.32], [B(4), 'pop', 0.32], [B(5), 'pop', 0.32]],
    },
    { len: 6, name: 'open-1', mb: true, render: opener(0), sfx: openerSfx },
    {
      len: 8, name: 'choose-page',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="push" cam={[{ t: 0, s: 1 }, { t: c.dur, ...focus(900, 560, 1.06), ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="Pick the *event page.*" size={80} y={80} />
            <div style={{ position: 'absolute', left: 498, top: 280 }}>
              <Rise t={t} at={B(0.4)} y={120} spring="soft"><Z s={2.1}><PublishDialog t={t} selectAt={B(3)} /></Z></Rise>
            </div>
            <Cursor t={t} path={[{ t: B(1.2), x: 1500, y: 1000 }, { t: B(2.8), x: 760, y: 520 }, { t: B(3), x: 760, y: 520, click: true }, { t: B(5), x: 900, y: 700 }]} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh-soft', 0.3], ...titleSfx()(B), [B(0.4), 'whoosh-soft', 0.25], [B(3), 'click', 0.5]],
    },
    {
      len: 8, name: 'choose-theme',
      render: (c) => {
        const { t, B } = c;
        const p = lerp(t, B(3.4), B(4.6), 0, 1, EIO);
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.03, ease: INOUT }]}>
            <Rise t={t} at={B(0.2)} y={140} spring="soft" style={{ position: 'absolute', inset: 0 }}>
              <Lift file={THEMES.file} sw={THEMES.sw} sh={THEMES.sh} box={[160, 140, 1100, 840]} el={BOX.themeScholar} p={p} scale={2} dx={-80} dy={-40} />
            </Rise>
            <Top t={t} at={B(0.6)} text={'Then pick\na *theme.*'} size={84} x={1340} y={360} />
            <Cursor t={t} path={[{ t: B(1.2), x: 1500, y: 1000 }, { t: B(3), x: scholar[0], y: scholar[1] }, { t: B(3.2), x: scholar[0], y: scholar[1], click: true }]} leave={B(3.6)} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], [B(0.2), 'whoosh-soft', 0.3], [B(0.6), 'swish', 0.2], [B(3.2), 'click', 0.5], [B(3.4), 'whoosh-soft', 0.3]],
    },
    { len: 4, name: 'open-2', mb: true, render: opener(1), sfx: openerSfx },
    {
      len: 8, name: 'topic-maps',
      render: (c) => {
        const { t, B } = c;
        const k = 1.1;
        const box: [number, number, number, number] = [(1920 - TM.el[2] * k) / 2, 150, TM.el[2] * k, TM.el[3] * k];
        const tg = (y: number) => [box[0] + (1482 - TM.el[0]) * k, box[1] + (y - TM.el[1]) * k];
        const [a, b] = [tg(614), tg(916)];
        return (
          <Scene c={c} tin="push" cam={[{ t: 0, s: 1 }, { t: c.dur, ...focus(1100, 560, 1.06), ease: INOUT }]}>
            <CapCard t={t} at={B(0.2)} file={TM.file} sw={TM.sw} sh={TM.sh} rect={TM.el} box={box} />
            <ToggleOff t={t} onAt={B(2.6)} x={a[0]} y={a[1]} w={88 * k} h={48 * k} />
            <ToggleOff t={t} onAt={B(4.6)} x={b[0]} y={b[1]} w={88 * k} h={48 * k} />
            <Cursor t={t} path={[{ t: B(1), x: 1700, y: 1040 }, { t: B(2.4), x: a[0], y: a[1] }, { t: B(2.6), x: a[0], y: a[1], click: true }, { t: B(4.4), x: b[0], y: b[1] }, { t: B(4.6), x: b[0], y: b[1], click: true }, { t: B(6.5), x: b[0] + 100, y: b[1] + 150 }]} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh-soft', 0.3], [B(0.2), 'whoosh-soft', 0.25], [B(2.6), 'click', 0.5], [B(2.65), 'snap', 0.25], [B(4.6), 'click', 0.5], [B(4.65), 'snap', 0.25]],
    },
    {
      len: 8, name: 'mcp-button',
      render: (c) => {
        const { t, B } = c;
        const k = 1.3;
        const box: [number, number, number, number] = [(1920 - CTA.el[2] * k) / 2, 470, CTA.el[2] * k, CTA.el[3] * k];
        const tg = [box[0] + (1090 - CTA.el[0]) * k, box[1] + (110 - CTA.el[1]) * k];
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, ...focus(1200, 600, 1.06), ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text={'Let attendees keep asking,\nin *their own AI.*'} size={76} y={160} />
            <CapCard t={t} at={B(0.5)} file={CTA.file} sw={CTA.sw} sh={CTA.sh} rect={CTA.el} box={box} />
            <ToggleOff t={t} onAt={B(3.4)} x={tg[0]} y={tg[1]} w={88 * k} h={48 * k} />
            <Cursor t={t} path={[{ t: B(1.6), x: 1700, y: 1040 }, { t: B(3.2), x: tg[0], y: tg[1] }, { t: B(3.4), x: tg[0], y: tg[1], click: true }, { t: B(5.5), x: tg[0] + 100, y: tg[1] + 150 }]} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.5), 'whoosh-soft', 0.25], [B(3.4), 'click', 0.5], [B(3.45), 'snap', 0.25]],
    },
    { len: 4, name: 'open-3', mb: true, render: opener(2), sfx: openerSfx },
    {
      len: 8, name: 'publish',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="push" cam={[{ t: 0, s: 1 }, { t: B(4), ...focus(1080, 600, 1.05), ease: INOUT }, { t: c.dur, ...focus(1000, 560, 1.02), ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 498, top: 280 }}>
              <Rise t={t} at={B(0.2)} y={120} spring="soft"><Z s={2.1}><PublishDialog t={t} pressAt={B(3.2)} /></Z></Rise>
            </div>
            <Cursor t={t} path={[{ t: B(1), x: 1600, y: 1000 }, { t: B(2.9), x: 1290, y: 762 }, { t: B(3.2), x: 1290, y: 762, click: true }, { t: B(5), x: 1400, y: 900 }]} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center' }}><Toast t={t} at={B(3.6)} text="Event page published" /></div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh-soft', 0.3], [B(0.2), 'whoosh-soft', 0.25], [B(3.2), 'click', 0.55], [B(3.6), 'ding', 0.3]],
    },
    {
      len: 8, name: 'live-page', mb: true,
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1.1 }, { t: B(2), s: 1, ease: EIO }, { t: c.dur, s: 1.03, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 190, top: 90 }}>
              <Rise t={t} at={B(0.1)} y={200} s={0.9} spring="soft">
                <Browser w={1540} h={900} url="recaphub.co/northwind-summit-2026" font={UI}>
                  <div style={{ transform: 'scale(1.0)', transformOrigin: '0 0', padding: '40px 40px' }}><Hero t={t} at={B(0.4)} /></div>
                </Browser>
              </Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.35], [B(0.6), 'pop-soft', 0.2], [B(0.8), 'pop-soft', 0.2], [B(1), 'pop-soft', 0.2]],
    },
    {
      len: 10, name: 'link',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} cam={[{ t: 0, s: 1.03 }, { t: c.dur, s: 1, ease: INOUT }]}>
            <Top t={t} at={B(0.2)} text="Share *one link.*" size={120} y={300} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
              <Rise t={t} at={B(1)} y={-200} s={0.85} spring="bouncy"><LinkBox url="recaphub.co/northwind-summit-2026" size={46} /></Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(1), 'thud', 0.35], [B(1.1), 'pop', 0.3]],
    },
    {
      len: 8, name: 'payoff',
      render: title({ text: 'Three steps.\n[One link.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 160, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.4], ...titleSfx(1.2)(B)],
    },
    { len: 8, name: 'end', render: end('Publish in minutes.'), sfx: endSfx },
  ]),
};
