/* Published Recap Pages, ~39 s, 136 BPM. Hook: "Every session. Every debate. One link."
 * All screens are real recaphub_3.0 components (Storybook captures): the published hero, the page themes,
 * the "Publish your event page" dialog, the topic maps ("What was argued" / "Where the time went"),
 * the sessions page, and the phone layouts. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, Card, Dark, EndCard, FilmDef, Flash, Head, Lift, Light, Pill, Pop, Region, SHADOW, ShotCtx, Swap, W, focus, lerp, spr, INOUT } from '../kit';
import { SCREEN, shot } from '../assets';

const Title: React.FC<{ t: number; at?: number; text: string; out?: number; dark?: boolean }> = ({ t, at = 0.05, text, out, dark }) => (
  <div style={{ position: 'absolute', left: 0, width: W, top: 50, display: 'flex', justifyContent: 'center' }}>
    <Head t={t} at={at} text={text} size={68} color={dark ? C.white : C.ink} accent={dark ? C.violetSoft : C.violet} align="center" out={out} />
  </div>
);
const BOX: [number, number, number, number] = [240, 170, 1440, 900];

const Hook = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Dark t={t} />
    <Cam t={t} keys={[{ t: 0, s: 1, x: 0, y: 0 }, { t: B(6.4), s: 1.04, x: 0, y: 0 }, { t: B(8), ...focus(960, 790, 9), ease: 'in' }]}>
      <div style={{ position: 'absolute', left: 0, width: W, top: 210 }}>
        <Head t={t} at={0.05} text="Every session." size={120} align="center" />
        <Head t={t} at={B(2)} text="Every debate." size={120} align="center" />
        <Head t={t} at={B(4)} text="*One* *link.*" size={120} align="center" accent={C.violetSoft} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: W, top: 750, display: 'flex', justifyContent: 'center' }}>
        <Pop t={t} at={B(5.2)}>
          <Pill size={1.05} bg="rgba(255,255,255,0.95)">🔒 recaphub.co/northwind-summit-2026</Pill>
        </Pop>
      </div>
    </Cam>
    <Flash t={t} at={B(7.6)} dur={0.5} />
  </AbsoluteFill>
);

const HERO = shot('hero');
const Hero = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Published. *Live in one link.*" />
    <Cam t={t} keys={[{ t: 0, s: 1.08, x: 0, y: 30 }, { t: B(12), s: 1, x: 0, y: 0, ease: 'inout' }]}>
      <Lift file={HERO.file} sw={HERO.sw} sh={HERO.sh} box={BOX} el={[1560, 330, 1050, 1290]} p={lerp(t, B(5), B(7), 0, 1, INOUT)} scale={1.1} dx={30} blur={5} />
    </Cam>
  </AbsoluteFill>
);

const THEMES = shot('themes');
const Themes = ({ t, B }: ShotCtx) => {
  const p = lerp(t, B(0.5), B(9.5), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <Title t={t} text="Your brand. *Any theme.*" />
      <Region file={THEMES.file} sw={THEMES.sw} sh={THEMES.sh} rect={[0, 0, 1700, 1063]} box={BOX} toRect={[1180, 1137, 1700, 1063]} p={p} radius={18} shadow={SHADOW} />
    </AbsoluteFill>
  );
};

const PUB = shot('publish-dialog');
const Publish = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Event page or *Quartz.* Your call." />
    <Pop t={t} at={B(0.3)} style={{ position: 'absolute', left: 460, top: 190 }}>
      <Region file={PUB.file} sw={PUB.sw} sh={PUB.sh} rect={[896, 578, 992, 794]} box={[0, 0, 1000, 800]} radius={24} shadow={SHADOW} style={{ transform: `scale(${1 + lerp(t, B(1), B(8), 0, 0.05)})` }} />
    </Pop>
  </AbsoluteFill>
);

const MAPS = shot('topicmaps');
const Maps = ({ t, B }: ShotCtx) => {
  const p = lerp(t, B(3.5), B(8), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <div style={{ position: 'absolute', left: 0, width: W, top: 50, display: 'flex', justifyContent: 'center' }}>
        <Swap t={t} at={0.05} swapAt={B(5.5)} from="Every debate, *mapped.*" to="Every hour, *accounted for.*" size={68} color={C.ink} accent={C.violet} align="center" style={{ width: W, height: 90 }} />
      </div>
      <Region file={MAPS.file} sw={MAPS.sw} sh={MAPS.sh} rect={[0, 0, 2880, 1800]} box={BOX} toRect={[0, 1000, 2880, 1800]} p={p} radius={18} shadow={SHADOW} />
    </AbsoluteFill>
  );
};

const AGENDA = shot('agenda');
const Agenda = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Title t={t} text="Every session, *one tap away.*" />
    <Lift file={AGENDA.file} sw={AGENDA.sw} sh={AGENDA.sh} box={[300, 170, 1320, 1100]} el={[330, 820, 2220, 760]} p={lerp(t, B(2), B(4), 0, 1, INOUT)} scale={1.12} dy={-60} blur={5} />
  </AbsoluteFill>
);

const PHONE_T = shot('treemap-mobile');
const PHONE_M = shot('mindmap-mobile');
const Everywhere = ({ t, B }: ShotCtx) => {
  const cards: { file: string; sw: number; sh: number; x: number; y: number; w: number; ry: number; at: number; rect?: [number, number, number, number] }[] = [
    { ...SCREEN.wefHome, x: 120, y: 420, w: 760, ry: 18, at: 0.5 },
    { ...SCREEN.wefSession, x: 1040, y: 420, w: 760, ry: -18, at: 1 },
    { file: PHONE_T.file, sw: PHONE_T.sw, sh: PHONE_T.sh, x: 700, y: 330, w: 250, ry: 8, at: 1.5, rect: [0, 0, 860, 1530] },
    { file: PHONE_M.file, sw: PHONE_M.sw, sh: PHONE_M.sh, x: 970, y: 330, w: 250, ry: -8, at: 2, rect: [0, 0, 860, 1530] },
  ];
  return (
    <AbsoluteFill>
      <Dark t={t} tint={1.2} />
      <Cam t={t} keys={[{ t: 0, s: 1.1, x: 0, y: 0 }, { t: B(16), s: 0.98, x: 0, y: 0, ease: 'inout' }]}>
        {cards.map((c, i) => {
          const p = spr(t, B(c.at), 15, 0.8);
          const r = c.rect ?? [0, 0, c.sw, c.sh];
          const h = (c.w * r[3]) / r[2];
          return (
            <div key={i} style={{ position: 'absolute', left: c.x, top: c.y + (1 - p) * 500, opacity: Math.min(1, p * 1.5), zIndex: i }}>
              <Card x={0} y={0} w={c.w} h={h} ry={c.ry} rx={4} radius={i > 1 ? 30 : 16}>
                <Region file={c.file} sw={c.sw} sh={c.sh} rect={r} box={[0, 0, c.w, h]} />
              </Card>
            </div>
          );
        })}
      </Cam>
      <div style={{ position: 'absolute', left: 0, width: W, top: 90 }}>
        <Swap t={t} at={B(0.2)} swapAt={B(8)} from={'On every screen.\nIn *one link.*'} to={'Or embedded on\n*your own site.*'} size={96} accent={C.violetSoft} align="center" style={{ width: W, height: 220 }} />
      </div>
    </AbsoluteFill>
  );
};

export const pagesFilm: FilmDef = {
  bpm: 136,
  music: 'music/pages.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 8, render: Hook, name: 'hook' },
    { from: 8, to: 20, render: Hero, name: 'hero' },
    { from: 20, to: 30, render: Themes, name: 'themes' },
    { from: 30, to: 38, render: Publish, name: 'publish' },
    { from: 38, to: 50, render: Maps, name: 'maps' },
    { from: 50, to: 60, render: Agenda, name: 'agenda' },
    { from: 60, to: 76, render: Everywhere, name: 'everywhere' },
    { from: 76, to: 84, render: ({ t }) => <EndCard t={t} line="Published recap pages." />, name: 'end' },
  ],
  sfx: [
    { at: 5.2, src: 'pop', vol: 0.3 },
    { at: 7, src: 'whoosh', vol: 0.4 },
    { at: 13, src: 'whoosh', vol: 0.2 },
    { at: 30.6, src: 'pop', vol: 0.25 },
    { at: 52, src: 'whoosh', vol: 0.2 },
    { at: 76, src: 'page-turn', vol: 0.35 },
  ],
};
