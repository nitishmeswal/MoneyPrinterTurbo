/* Stage → Shorts (AI clips), ~37 s, 140 BPM. Everything shown is real: the Bits & Pretzels panel,
 * the clip agent making clips in chat, the clip studio's QC checklist ticking to "QC passed",
 * and Jordi Romero's actual RecapHub reel (the clip the QC page was checking), then that event's reels.
 * Hook: "One keynote. 12 clips."  Problem: "Your speakers said gold. Nobody posted it."  CTA: Book a demo · recaphub.co */
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { C, Cam, Card, Check, Chip, Dark, EndCard, Eyebrow, FPS, FilmDef, Flash, Head, Light, LiveBadge, Media, OUTFIT, Pill, Pop, Reel, Region, SHADOW, ShotCtx, W, focus, lerp, spr, INOUT, INQ } from '../kit';
import { DEMO, FOOT, REEL, REELS } from '../assets';

const QC_TICKS: [number, number][] = [[0, 2], [0.75, 3], [1.0, 4], [1.75, 5], [2.0, 6], [3.0, 7], [3.75, 8], [4.25, 9]];
const qcAt = (rt: number) => QC_TICKS.filter(([s]) => rt >= s).pop()![1];

// ------------------------------------------------------------------ 1 · hook + problem on the stage

const CARD = { x: 860, y: 250, w: 940, h: 529 };
const Hook = ({ t, B }: ShotCtx) => {
  const enter = spr(t, B(6), 18, 0.9);
  const grey = lerp(t, B(12.5), B(13.5));
  const cx = CARD.x + CARD.w / 2;
  const cy = CARD.y + CARD.h / 2;
  return (
    <AbsoluteFill>
      <Dark t={t} />
      <Cam t={t} keys={[{ t: 0, s: 1.04, x: 0, y: 0 }, { t: B(16), s: 1, x: 0, y: 0 }, { t: B(20), ...focus(cx, cy, 7), ease: 'in' }]} blur={lerp(t, B(18.5), B(20), 0, 14, INQ)}>
        <div style={{ position: 'absolute', left: CARD.x + (1 - enter) * 300, top: CARD.y + (1 - enter) * 120, opacity: Math.min(1, enter * 1.6) }}>
          <Card x={0} y={0} w={CARD.w} h={CARD.h} ry={-14 * (1 - lerp(t, B(16), B(19)))} rx={5} rz={-1}>
            <Media file={FOOT.panel.file} w={CARD.w} h={CARD.h} rate={0.42} style={{ filter: `grayscale(${grey}) brightness(${1 - 0.35 * grey})` }} />
            <div style={{ position: 'absolute', left: 22, top: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <LiveBadge size={0.75} />
              <Eyebrow color="#fff" size={0.8}>Main stage</Eyebrow>
            </div>
          </Card>
        </div>
        <div style={{ position: 'absolute', left: 140, top: 330, width: 760 }}>
          <Head t={t} at={0.2} text="One keynote." size={124} out={B(10)} />
          <Head t={t} at={B(3)} text="*12* *clips.*" size={124} accent={C.violetSoft} out={B(10)} />
          <Head t={t} at={B(10.2)} text={'Your speakers\nsaid *gold.*'} size={110} accent="#F5B524" out={B(16.5)} />
          <div style={{ height: 24 }} />
          <Head t={t} at={B(12.6)} text="~Nobody~ ~posted~ ~it.~" size={110} out={B(16.5)} />
        </div>
      </Cam>
      <Flash t={t} at={B(19.6)} dur={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2 · the clip agent makes clips in chat (real recording)

const AG = DEMO.clipAgent;
const AG_CARD: [number, number, number, number] = [500, 133, 677, 600];
const Agent = ({ t, B }: ShotCtx) => {
  const un = lerp(t, B(4.5), B(7), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <div style={{ position: 'absolute', left: 0, width: W, top: 58, display: 'flex', justifyContent: 'center', opacity: 1 - lerp(t, B(4.5), B(5.5)) }}>
        <Head t={t} at={0.05} text="Ask once. *Six* clips come back." size={70} color={C.ink} accent={C.violet} align="center" />
      </div>
      <Region file={AG.file} sw={AG.sw} sh={AG.sh} rect={AG_CARD} box={[560, 170, 800, 709]} toRect={[0, 0, AG.sw, AG.sh]} toBox={[200, 110, 1520, 855]} p={un} rate={0.4} radius={22 - 6 * un} shadow={SHADOW} />
      <div style={{ position: 'absolute', left: 1400, top: 250, display: 'flex', flexDirection: 'column', gap: 18, opacity: 1 - un }}>
        <Pop t={t} at={B(1.5)}><Chip tone="green" size={1.3}><Check size={26} /> 6 ready</Chip></Pop>
        <Pop t={t} at={B(2)}><Chip tone="grey" size={1.3}>9×16</Chip></Pop>
        <Pop t={t} at={B(2.5)}><Chip tone="red" size={1.3}>🔥 99 virality</Chip></Pop>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3 · the clip studio checks every clip (real recording)

const QC = DEMO.clipQc;
const PAIR: [number, number, number, number] = [78, 18, 520, 470];
const QcShot = ({ t, B }: ShotCtx) => {
  const un = lerp(t, B(3), B(5), 0, 1, INOUT);
  const playAt = B(5);
  const rt = Math.max(0, t - playAt);
  const n = t < playAt ? 2 : qcAt(rt);
  const passed = n >= 9;
  const pass = spr(t, playAt + 4.25, 12, 0.6, 200);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <div style={{ position: 'absolute', left: 0, width: W, top: 58, display: 'flex', justifyContent: 'center', opacity: 1 - lerp(t, B(3), B(4)) }}>
        <Head t={t} at={0.05} text="Every clip, *checked.*" size={70} color={C.ink} accent={C.violet} align="center" />
      </div>
      <Cam t={t} keys={[{ t: B(5), s: 1 }, { t: B(12), ...focus(1020, 620, 1.18), ease: 'inout' }]}>
        {t < playAt ? (
          <Region file="demos/clip-qc-0.png" sw={QC.sw} sh={QC.sh} rect={PAIR} box={[620, 210, 616, 557]} toRect={[0, 0, QC.sw, QC.sh]} toBox={[290, 100, 1340, 886]} p={un} radius={22 - 8 * un} shadow={SHADOW} />
        ) : (
          <div style={{ position: 'absolute', left: 290, top: 100, width: 1340, height: 886, borderRadius: 14, overflow: 'hidden', boxShadow: SHADOW }}>
            <AbsoluteFill style={{ transform: 'translateZ(0)' }}>
              <SeqVideo from={playAt} t={t} />
            </AbsoluteFill>
          </div>
        )}
      </Cam>
      <div style={{ position: 'absolute', left: 1290, top: 250, display: 'flex', flexDirection: 'column', gap: 18, opacity: 1 - un }}>
        <Pop t={t} at={B(0.75)}><Chip tone="violet" size={1.3}>41.2s</Chip></Pop>
        <Pop t={t} at={B(1.25)}><Chip tone="grey" size={1.3}>9×16</Chip></Pop>
        <Pop t={t} at={B(1.75)}><Chip tone="grey" size={1.3}>+ HOOK</Chip></Pop>
      </div>
      {t >= playAt - 0.1 ? (
        <div style={{ position: 'absolute', left: 120, top: 760 }}>
          <Pop t={t} at={playAt}>
            {passed ? (
              <div style={{ transform: `scale(${0.9 + 0.1 * pass})` }}>
                <Pill size={1.25} bg={C.green50} color={C.green}><Check size={52} /> QC passed</Pill>
              </div>
            ) : (
              <Pill size={1.25}>
                QC <span style={{ fontVariantNumeric: 'tabular-nums' }}>{n}/9</span>
              </Pill>
            )}
          </Pop>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** The QC recording, starting to play at shot time `from` (shown as 1340 x 886): a Sequence offsets its clock. */
const SeqVideo: React.FC<{ from: number; t: number }> = ({ from }) => (
  <Sequence from={Math.round(from * FPS)} layout="none">
    <Media file={QC.file} w={1340} h={886} fit="fill" />
  </Sequence>
);

// ------------------------------------------------------------------ 4 · checked by a real person

const Human = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Region file="demos/clip-qc-passed.png" sw={QC.sw} sh={QC.sh} rect={[0, 0, QC.sw, QC.sh]} box={[290, 100, 1340, 886]} radius={14} filter={`blur(${lerp(t, 0, 0.4, 0, 5)}px)`} />
    <AbsoluteFill style={{ background: `rgba(10,9,20,${lerp(t, 0, 0.35, 0, 0.78)})` }} />
    <div style={{ position: 'absolute', left: 140, top: 330 }}>
      <Pop t={t} at={0.1}><Chip tone="green" size={1.1}><Check size={22} /> QC passed</Chip></Pop>
      <div style={{ height: 34 }} />
      <Head t={t} at={0.3} text={'Checked by\na ^real^ ^person.^'} size={124} hlAt={B(2.2)} out={B(5.6)} />
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ 5 · "Mark delivered" becomes the clip

const Deliver = ({ t, B }: ShotCtx) => {
  const press = B(1.5);
  const flip = lerp(t, B(2.2), B(2.8), 0, 1, INOUT);
  const morph = lerp(t, B(3), B(4.6), 0, 1, INOUT);
  const back = lerp(t, B(4), B(4.8), 0, 1, INOUT);
  const pressed = t >= press;
  const w = 470 + (330 - 470) * morph;
  const h = 118 + (587 - 118) * morph;
  const cx = 960 - 260 * lerp(t, B(4.6), B(5.4), 0, 1, INOUT);
  const cy = 540;
  const bg = flip < 0.5 ? (pressed ? '#BEBEC8' : '#fff') : '#16161D';
  const down = t >= press && t < press + 0.14 ? 0.94 : 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: C.black }} />
      <Region file="demos/clip-qc-passed.png" sw={QC.sw} sh={QC.sh} rect={[0, 0, QC.sw, QC.sh]} box={[290, 100, 1340, 886]} radius={14} filter="blur(5px)" style={{ opacity: 0.22 * (1 - flip) }} />
      <AbsoluteFill style={{ background: '#E9E9EF', opacity: flip * (1 - back) }} />
      <div style={{ position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: 22 + 6 * morph, background: bg, boxShadow: t >= press && t < press + 0.4 ? `0 0 0 6px ${C.violet}, ${SHADOW}` : SHADOW, transform: `scale(${down})`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: OUTFIT, fontWeight: 600, fontSize: 46, color: flip >= 0.5 ? '#fff' : pressed ? '#fff' : C.ink, opacity: 1 - lerp(t, B(3.2), B(3.9)), whiteSpace: 'nowrap' }}>{pressed ? 'Marked delivered' : 'Mark delivered'}</div>
        <div style={{ position: 'absolute', inset: 0, opacity: lerp(t, B(3.8), B(4.6)) }}>
          <Media file={REEL('bnp-jordi-romero')} w={w} h={h} from={9} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1000, top: 470 }}>
        <Head t={t} at={B(5)} text="Ready to *post.*" size={110} accent={C.violetSoft} />
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 6 · the drop: the event's reels, posted

const FAN = ['bnp-johannes-reck', 'bnp-robert-lacher', 'bnp-jordi-romero', 'bnp-jan-reichelt', 'bnp-patrick-andrae'];
const Posted = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Dark t={t} tint={1.2} />
    <Cam t={t} keys={[{ t: 0, s: 1.12, x: -260 * 1.12 }, { t: B(3), s: 1, x: 0 }, { t: B(16), s: 0.96 }]}>
      {FAN.map((r, i) => {
        const d = i - 2;
        const p = i === 2 ? 1 : spr(t, B(0.4 + Math.abs(d) * 0.35), 15, 0.8);
        const x = 960 + d * 330;
        return (
          <div key={r} style={{ position: 'absolute', left: x - 140, top: 330 + Math.abs(d) * 26, transform: `perspective(1800px) rotateY(${-d * 16}deg) translateX(${(1 - p) * d * 260}px) scale(${1 - Math.abs(d) * 0.06})`, opacity: Math.min(1, p * 1.5), zIndex: 10 - Math.abs(d) }}>
            <Reel file={REEL(r)} w={280} from={[4, 8, 9 + 2.6, 6, 3][i]} />
          </div>
        );
      })}
    </Cam>
    <div style={{ position: 'absolute', left: 0, width: W, top: 74, display: 'flex', justifyContent: 'center' }}>
      <Head t={t} at={B(1)} text="One keynote. *Twelve* clips." size={84} accent={C.violetSoft} align="center" out={B(8)} />
    </div>
    <div style={{ position: 'absolute', left: 0, width: W, top: 60, display: 'flex', justifyContent: 'center' }}>
      <Head t={t} at={B(8.2)} text={'Posted before the\ncoffee break *ends.*'} size={76} accent={C.violetSoft} align="center" />
    </div>
  </AbsoluteFill>
);

export const shortsFilm: FilmDef = {
  bpm: 140,
  music: 'music/shorts.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 20, render: Hook, name: 'hook' },
    { from: 20, to: 32, render: Agent, name: 'agent' },
    { from: 32, to: 46, render: QcShot, name: 'qc' },
    { from: 46, to: 52, render: Human, name: 'human' },
    { from: 52, to: 60, render: Deliver, name: 'deliver' },
    { from: 60, to: 76, render: Posted, name: 'posted' },
    { from: 76, to: 84, render: ({ t }) => <EndCard t={t} line="Stage → Shorts. Clipped in minutes." />, name: 'end' },
  ],
  sfx: [
    { at: 6, src: 'whoosh', vol: 0.3 },
    { at: 18.5, src: 'whoosh', vol: 0.4 },
    { at: 21.5, src: 'pop', vol: 0.22 },
    { at: 22, src: 'pop', vol: 0.2 },
    { at: 22.5, src: 'pop', vol: 0.2 },
    { at: 32.75, src: 'pop', vol: 0.22 },
    { at: 33.25, src: 'pop', vol: 0.2 },
    { at: 33.75, src: 'pop', vol: 0.2 },
    { at: 46.2, src: 'ding', vol: 0.25 },
    { at: 53.5, src: 'mouse-click', vol: 0.5 },
    { at: 55.4, src: 'whoosh', vol: 0.3 },
    { at: 76, src: 'page-turn', vol: 0.35 },
  ],
};
