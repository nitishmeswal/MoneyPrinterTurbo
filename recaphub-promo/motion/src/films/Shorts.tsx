/* Stage → Shorts (AI clips), ~39 s, 136 BPM. Process film: the brand step timeline drives it.
 * Real: the Bits & Pretzels panel footage, the clip agent making clips in chat (recording), the clip studio's
 * QC recording ticking to "QC passed", Jordi Romero's reel and that event's other reels.
 * Hook "One keynote. Twelve clips."  Problem "Your speakers said gold. Nobody posted it."
 * Music: stabs 0 / 4 / 10, build 18 (steps), drop 56 (posted), end 78. */
import React from 'react';
import { Sequence } from 'remotion';
import { Cue, EIO, FPS, FilmDef, INOUT, Media, Pop, Reel, Region, Rise, SHADOW, focus, lerp, mix, spr } from '../kit';
import { BR, Box, DISPLAY, FOUR_STEPS, Head, SANS, Stat, Steps } from '../brand';
import { Badge, Z } from '../ui';
import { Scene, Top, chain, end, endSfx, title, titleSfx } from '../shots';
import { DEMO, FOOT, REEL, REELS } from '../assets';

const QC_TICKS: [number, number][] = [[0, 2], [0.75, 3], [1.0, 4], [1.75, 5], [2.0, 6], [3.0, 7], [3.75, 8], [4.25, 9]]; // the recording's real ticks
const AG = DEMO.clipAgent;
const QC = DEMO.clipQc;

export const shortsFilm: FilmDef = {
  id: 'Shorts',
  bpm: 136,
  music: 'music/shorts.wav',
  tail: 1,
  shots: chain([
    {
      len: 10, name: 'hook',
      render: (c) => {
        const { t, B } = c;
        const p = spr(t, B(0.2), 'soft');
        return (
          <Scene c={c} tin="cut" cam={[{ t: 0, s: 1.04 }, { t: c.dur, s: 1, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 900, top: 230, perspective: 2000 }}>
              <div style={{ width: 900, height: 506, borderRadius: 22, overflow: 'hidden', boxShadow: SHADOW, transform: `rotateY(${mix(-30, -10, p)}deg) translateX(${(1 - p) * 400}px)`, opacity: Math.min(1, p * 2), position: 'relative' }}>
                <Media file={FOOT.panel.file} w={900} h={506} rate={0.42} />
                <div style={{ position: 'absolute', left: 22, top: 20 }}><Z s={1.6}><Badge tone="live" dot style={{ background: '#E8141B', color: '#fff' }}>Live · Main stage</Badge></Z></div>
              </div>
            </div>
            <div style={{ position: 'absolute', left: 140, top: 330 }}>
              <Head2 t={t} B={B} />
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[B(0.2), 'whoosh', 0.3], [B(0.4), 'swish', 0.3], [B(4), 'snap', 0.3], [B(4.2), 'pop', 0.3]],
    },
    {
      len: 8, name: 'problem',
      render: title({ text: 'Your speakers said gold.\n~Nobody posted it.~', size: 112, tin: 'wipe', track: 120 }),
      sfx: (B) => [[0, 'whoosh', 0.35], ...titleSfx()(B)],
    },
    {
      len: 8, name: 'steps', mb: true,
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1 }, { t: B(6), s: 1.03 }, { t: B(9), ...focus(622, 555, 2.6), ease: EIO }]}>
            <Top t={t} at={B(0.2)} text="From stage to *posted.*" size={100} y={170} />
            <div style={{ position: 'absolute', left: 190, top: 500 }}>
              <Rise t={t} at={B(0.8)} y={60} spring="soft"><Steps t={t} steps={FOUR_STEPS} on={[B(1.5), B(2.25), B(3), B(3.75)]} scale={2.75} /></Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], ...titleSfx()(B), ...[1.5, 2.25, 3, 3.75].map((x) => [B(x), 'pop', 0.32] as Cue), [B(7), 'whoosh', 0.4]],
    },
    {
      len: 12, name: 'agent',
      render: (c) => {
        const { t, B } = c;
        const un = lerp(t, B(4.5), B(7), 0, 1, EIO);
        return (
          <Scene c={c} tin="push">
            <Top t={t} at={B(0.3)} text="Ask once. *Six* clips come back." size={70} y={44} out={B(4.4)} />
            <Region file={AG.file} sw={AG.sw} sh={AG.sh} rect={[500, 133, 677, 600]} box={[560, 170, 800, 709]} toRect={[0, 0, AG.sw, AG.sh]} toBox={[200, 110, 1520, 855]} p={un} rate={0.4} radius={22 - 6 * un} shadow={SHADOW} />
            <div style={{ position: 'absolute', left: 1400, top: 250, display: 'flex', flexDirection: 'column', gap: 20, opacity: 1 - un }}>
              {[['ok', '6 ready'], ['grey', '9×16'], ['brand', '+ hook']].map(([tone, x], i) => (
                <Pop key={x} t={t} at={B(1.5 + i * 0.5)} origin="0 50%"><Z s={2.2}><Badge tone={tone as 'ok'} dot={i === 0}>{x}</Badge></Z></Pop>
              ))}
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh-soft', 0.3], [B(1.5), 'pop', 0.3], [B(2), 'pop', 0.28], [B(2.5), 'pop', 0.26], [B(4.5), 'whoosh-soft', 0.3]],
    },
    {
      len: 12, name: 'qc',
      render: (c) => {
        const { t, B } = c;
        const playAt = B(2.5);
        const rt = Math.max(0, t - playAt);
        const n = t < playAt ? 2 : QC_TICKS.filter(([s]) => rt >= s).pop()![1];
        const lastTick = QC_TICKS.filter(([s]) => rt >= s).pop()![0] + playAt;
        return (
          <Scene c={c} cam={[{ t: 0, s: 1 }, { t: playAt, s: 1 }, { t: B(11), ...focus(1020, 600, 1.08), ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="Every clip, *checked.*" size={70} y={34} out={B(2.4)} />
            <div style={{ position: 'absolute', left: 290, top: 140 }}>
              <Rise t={t} at={B(0.1)} y={120} spring="soft">
                <div style={{ width: 1340, height: 886, borderRadius: 18, overflow: 'hidden', boxShadow: SHADOW, background: '#fff' }}>
                  {t < playAt ? <Media file="demos/clip-qc-0.png" w={1340} h={886} fit="fill" /> : (
                    <Sequence from={Math.round(playAt * FPS)} layout="none"><Media file={QC.file} w={1340} h={886} fit="fill" /></Sequence>
                  )}
                </div>
              </Rise>
            </div>
            <div style={{ position: 'absolute', left: 1440, top: 740 }}>
              <Rise t={t} at={B(1.2)} y={60} spring="snap">
                <Box pad="22px 34px 20px">
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: '0.04em', color: BR.inkSubtle }}>{n >= 9 ? 'QC passed' : 'QC checks'}</div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1, color: n >= 9 ? BR.green : BR.deep, fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.08 * Math.max(0, 1 - (t - lastTick) / 0.2)})`, transformOrigin: '0 80%' }}>{n}/9</div>
                </Box>
              </Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], [B(0.1), 'whoosh-soft', 0.3], [B(1.2), 'pop-soft', 0.3], ...QC_TICKS.slice(1).map(([s]) => [B(2.5) + s, 'tick', 0.32] as Cue), [B(2.5) + 4.3, 'chime', 0.3]],
    },
    {
      len: 6, name: 'human',
      render: title({ text: 'Checked by\na [real person.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 150, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.4], ...titleSfx(1.4)(B)],
    },
    {
      len: 12, name: 'posted',
      render: (c) => {
        const { t, B } = c;
        const fan = [REELS.bnp[1], REELS.bnp[2], REELS.bnp[0], REELS.bnp[3], REELS.bnp[4]];
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1.12, x: -200 }, { t: B(3), s: 1, x: 0, ease: EIO }, { t: c.dur, s: 0.97, ease: INOUT }]}>
            {fan.map((r, i) => {
              const d = i - 2;
              const p = i === 2 ? 1 : spr(t, B(0.4 + Math.abs(d) * 0.35), 'soft');
              return (
                <div key={r} style={{ position: 'absolute', left: 960 + d * 330 - 140, top: 300 + Math.abs(d) * 26, transform: `perspective(1800px) rotateY(${-d * 16}deg) translateX(${(1 - p) * d * 260}px) scale(${1 - Math.abs(d) * 0.06})`, opacity: Math.min(1, p * 1.5), zIndex: 10 - Math.abs(d) }}>
                  <Reel file={REEL(r)} w={280} from={[4, 8, 9 + 2.6, 6, 3][i]} />
                </div>
              );
            })}
            <Top t={t} at={B(1)} text={'Posted before the\ncoffee break *ends.*'} size={74} y={50} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.35], [B(0.4), 'whoosh-soft', 0.25], [B(0.75), 'whoosh-soft', 0.25], [B(1), 'swish', 0.25]],
    },
    {
      len: 10, name: 'stat',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.05, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: (1920 - 1180) / 2, top: 330 }}>
              <Rise t={t} at={B(0.3)} y={120} spring="soft">
                <Stat t={t} at={B(0.3)} label="Faster video turnaround" value={(p) => `${Math.round(mix(2, 20, p))}–${Math.round(mix(3, 30, p))} min`} with="with RecapHub" note="vs. 2–4 weeks for typical post-production" scale={3.4} />
              </Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.35], [B(0.3), 'slide', 0.35], [B(1.6), 'thud', 0.3]],
    },
    { len: 10, name: 'end', render: end('Clipped in minutes. Not weeks.'), sfx: endSfx },
  ]),
};

/** "One keynote. / Twelve clips." on two beats. */
const Head2: React.FC<{ t: number; B: (n: number) => number }> = ({ t, B }) => (
  <div style={{ fontFamily: DISPLAY }}>
    <HeadLine t={t} at={B(0.4)} text="One keynote." />
    <HeadLine t={t} at={B(4)} text="*Twelve* clips." />
  </div>
);
const HeadLine: React.FC<{ t: number; at: number; text: string }> = ({ t, at, text }) => <Head t={t} at={at} text={text} size={124} />;
