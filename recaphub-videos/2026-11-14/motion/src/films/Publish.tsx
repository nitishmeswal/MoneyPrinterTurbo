/* "How to publish your event recap in 3 steps": educative tutorial, ~56 s, 124 BPM.
 * A step rail across the top; every step on the real product (Storybook captures + the site's dashboard
 * screenshot): 1 the publish dialog and page themes, 2 the insight-section and MCP-button toggles and the
 * result, 3 "Ready to Publish? Preview & Publish", the live page and its link. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Card, Check, Chip, Dark, EndCard, FilmDef, Head, Lift, Light, OUTFIT, Pill, Pop, Region, SHADOW, ShotCtx, Swap, W, lerp, spr, INOUT } from '../kit';
import { SCREEN, shot } from '../assets';

const STEPS = ['Layout & look', 'What to show', 'Publish & share'];
const Rail: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: 'absolute', left: 0, width: W, top: 34, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, fontFamily: OUTFIT }}>
    {STEPS.map((s, i) => (
      <React.Fragment key={s}>
        {i ? <div style={{ width: 60, height: 3, borderRadius: 2, background: i <= active ? C.violet : '#D9D8E3' }} /> : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: i === active ? 700 : 500, fontSize: 24, color: i === active ? C.ink : C.grey }}>
          <span style={{ width: 38, height: 38, borderRadius: 19, background: i < active ? C.violet : i === active ? C.ink : '#fff', border: `2px solid ${i <= active ? (i < active ? C.violet : C.ink) : '#D9D8E3'}`, color: i <= active ? '#fff' : C.grey, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{i < active ? <Check size={20} /> : i + 1}</span>
          {s}
        </div>
      </React.Fragment>
    ))}
  </div>
);
const Title: React.FC<{ t: number; text: string; at?: number; out?: number }> = ({ t, text, at = 0.1, out }) => (
  <div style={{ position: 'absolute', left: 0, width: W, top: 96, display: 'flex', justifyContent: 'center' }}>
    <Head t={t} at={at} text={text} size={60} color={C.ink} accent={C.violet} align="center" out={out} />
  </div>
);

const Intro = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Dark t={t} />
    <div style={{ position: 'absolute', left: 0, width: W, top: 280 }}>
      <Head t={t} at={0.1} text="How to publish your" size={120} align="center" />
      <Head t={t} at={B(2)} text="event recap in *3 steps.*" size={120} align="center" accent={C.violetSoft} />
    </div>
    <div style={{ position: 'absolute', left: 0, width: W, top: 690, display: 'flex', justifyContent: 'center', gap: 22 }}>
      {STEPS.map((s, i) => (
        <Pop key={s} t={t} at={B(5 + i * 0.75)}>
          <Pill size={0.95} bg="rgba(255,255,255,0.12)" color="#fff" style={{ boxShadow: 'none', border: '1px solid rgba(255,255,255,0.22)' }}>
            <span style={{ color: C.violetSoft }}>{i + 1}</span> {s}
          </Pill>
        </Pop>
      ))}
    </div>
  </AbsoluteFill>
);

const PUB = shot('publish-dialog');
const THEMES = shot('themes');
const Step1 = ({ t, B }: ShotCtx) => {
  const x = lerp(t, B(11), B(12.5), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <Rail active={0} />
      <Title t={t} text="Pick a layout: *Event page* or Quartz." out={B(11)} />
      <Title t={t} at={B(11.3)} text="Then pick *the look.*" />
      <div style={{ opacity: 1 - x }}>
        <Pop t={t} at={B(0.6)} style={{ position: 'absolute', left: 460, top: 220 }}>
          <Region file={PUB.file} sw={PUB.sw} sh={PUB.sh} rect={[896, 578, 992, 794]} box={[0, 0, 1000, 800]} radius={24} shadow={SHADOW} />
        </Pop>
      </div>
      <div style={{ opacity: x }}>
        <Region file={THEMES.file} sw={THEMES.sw} sh={THEMES.sh} rect={[0, 0, 1700, 1063]} box={[290, 200, 1340, 838]} toRect={[1180, 1137, 1700, 1063]} p={lerp(t, B(13), B(23), 0, 1, INOUT)} radius={18} shadow={SHADOW} />
      </div>
    </AbsoluteFill>
  );
};

const TME = shot('topicmaps-editor');
const MCE = shot('mcp-cta-editor');
const MAPS = shot('topicmaps');
const Step2 = ({ t, B }: ShotCtx) => {
  const x = lerp(t, B(13), B(14.5), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <Rail active={1} />
      <Title t={t} text="Choose what to show." out={B(13)} />
      <Title t={t} at={B(13.3)} text="Your attendees get *exactly that.*" />
      <div style={{ opacity: 1 - x }}>
        <div style={{ position: 'absolute', left: 300, top: 220 }}>
          <Pop t={t} at={B(0.6)}>
            <Region file={TME.file} sw={TME.sw} sh={TME.sh} rect={TME.el} box={[0, 0, 880, (880 * TME.el[3]) / TME.el[2]]} radius={18} shadow={SHADOW} style={{ background: '#fff' }} />
          </Pop>
        </div>
        <div style={{ position: 'absolute', left: 1000, top: 700 }}>
          <Pop t={t} at={B(6)}>
            <Region file={MCE.file} sw={MCE.sw} sh={MCE.sh} rect={MCE.el} box={[0, 0, 680, (680 * MCE.el[3]) / MCE.el[2]]} radius={16} shadow="0 30px 80px rgba(16,16,22,0.22)" style={{ background: '#fff' }} />
          </Pop>
        </div>
        <div style={{ position: 'absolute', left: 1240, top: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Pop t={t} at={B(2)}><Chip tone="violet" size={1.2}><Check size={22} /> Mind map</Chip></Pop>
          <Pop t={t} at={B(3)}><Chip tone="violet" size={1.2}><Check size={22} /> Topic treemap</Chip></Pop>
        </div>
      </div>
      <div style={{ opacity: x }}>
        <Region file={MAPS.file} sw={MAPS.sw} sh={MAPS.sh} rect={[0, 0, 2880, 1800]} box={[290, 200, 1340, 838]} toRect={[0, 1000, 2880, 1800]} p={lerp(t, B(15), B(23), 0, 1, INOUT)} radius={18} shadow={SHADOW} />
      </div>
    </AbsoluteFill>
  );
};

const DASH = SCREEN.dashboard;
const HERO = shot('hero-mcp');
const Step3 = ({ t, B }: ShotCtx) => {
  const x = lerp(t, B(10), B(12), 0, 1, INOUT);
  const url = spr(t, B(15), 14);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <Rail active={2} />
      <Title t={t} text="Hit *Preview & Publish.*" out={B(10)} />
      <Title t={t} at={B(10.3)} text="Live in one link. *Share it anywhere.*" />
      <div style={{ opacity: 1 - x }}>
        <Lift file={DASH.file} sw={DASH.sw} sh={DASH.sh} box={[260, 200, 1400, 756]} el={[1166, 280, 334, 174]} p={lerp(t, B(1.5), B(3.5), 0, 1, INOUT)} scale={1.9} dx={-330} dy={110} blur={6} />
      </div>
      <div style={{ opacity: x, transform: `translateY(${(1 - x) * 80}px)` }}>
        <Region file={HERO.file} sw={HERO.sw} sh={HERO.sh} rect={[0, 0, HERO.sw, HERO.sh]} box={[330, 200, 1260, 788]} radius={20} shadow={SHADOW} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: W, top: 930, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, opacity: url, transform: `translateY(${(1 - url) * 30}px)` }}>
        <Pill size={0.9}>🔒 recaphub.co/northwind-summit-2026</Pill>
        <Pop t={t} at={B(18)}><Chip tone="green" size={1.2}><Check size={22} /> Link copied</Chip></Pop>
      </div>
    </AbsoluteFill>
  );
};

const PHONE_T = shot('treemap-mobile');
const PHONE_M = shot('mindmap-mobile');
const Done = ({ t, B }: ShotCtx) => {
  const cards = [
    { ...SCREEN.wefHome, x: 140, y: 470, w: 720, ry: 16, at: 0.5, rect: undefined as undefined | [number, number, number, number], r: 16 },
    { ...SCREEN.wefSession, x: 1060, y: 470, w: 720, ry: -16, at: 1, rect: undefined, r: 16 },
    { file: PHONE_T.file, sw: PHONE_T.sw, sh: PHONE_T.sh, x: 700, y: 380, w: 240, ry: 8, at: 1.5, rect: [0, 0, 860, 1530] as [number, number, number, number], r: 28 },
    { file: PHONE_M.file, sw: PHONE_M.sw, sh: PHONE_M.sh, x: 980, y: 380, w: 240, ry: -8, at: 2, rect: [0, 0, 860, 1530] as [number, number, number, number], r: 28 },
  ];
  return (
    <AbsoluteFill>
      <Dark t={t} tint={1.2} />
      {cards.map((c, i) => {
        const p = spr(t, B(c.at), 15, 0.8);
        const r = c.rect ?? [0, 0, c.sw, c.sh];
        const h = (c.w * r[3]) / r[2];
        return (
          <div key={i} style={{ position: 'absolute', left: c.x, top: c.y + (1 - p) * 500, opacity: Math.min(1, p * 1.5), zIndex: i }}>
            <Card x={0} y={0} w={c.w} h={h} ry={c.ry} rx={4} radius={c.r}>
              <Region file={c.file} sw={c.sw} sh={c.sh} rect={r} box={[0, 0, c.w, h]} />
            </Card>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, width: W, top: 100 }}>
        <Swap t={t} at={B(0.2)} swapAt={B(10)} from={'Desktop. Phone.\n*One link.*'} to={'Published in\n*three steps.*'} size={110} accent={C.violetSoft} align="center" style={{ width: W, height: 260 }} />
      </div>
    </AbsoluteFill>
  );
};

export const publishFilm: FilmDef = {
  bpm: 124,
  music: 'music/publish.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 10, render: Intro, name: 'intro' },
    { from: 10, to: 34, render: Step1, name: 'step1' },
    { from: 34, to: 58, render: Step2, name: 'step2' },
    { from: 58, to: 84, render: Step3, name: 'step3' },
    { from: 84, to: 104, render: Done, name: 'done' },
    { from: 104, to: 112, render: ({ t }) => <EndCard t={t} line="Publish your recap in three steps." />, name: 'end' },
  ],
  sfx: [
    { at: 5, src: 'pop', vol: 0.2 },
    { at: 5.75, src: 'pop', vol: 0.2 },
    { at: 6.5, src: 'pop', vol: 0.2 },
    { at: 11, src: 'pop', vol: 0.2 },
    { at: 36, src: 'switch', vol: 0.3 },
    { at: 37, src: 'switch', vol: 0.3 },
    { at: 40, src: 'pop', vol: 0.2 },
    { at: 60, src: 'mouse-click', vol: 0.4 },
    { at: 76, src: 'ding', vol: 0.22 },
    { at: 104, src: 'page-turn', vol: 0.35 },
  ],
};
