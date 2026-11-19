/* Audience Analytics, ~30 s, 134 BPM. Stats film. HOLD until real data flows (after #436).
 * The analytics screens are not built yet (docs/plans/PLAN-analytics-overview.md), so every number here is
 * tagged "Preview · illustrative numbers"; the last product shot is the real event dashboard.
 * Hook "Finally know what your attendees cared about." Music: stabs 0 / 4, build 8, drop 52, end 60. */
import React from 'react';
import { FilmDef, INOUT, Rise } from '../kit';
import { BR, Box, DISPLAY, SANS } from '../brand';
import { Bars, Curve, PreviewTag } from '../ui';
import { CapCard, Label, Scene, Top, chain, end, endSfx, title, titleSfx } from '../shots';
import { SCREEN } from '../assets';

const KPI: [string, number, (n: number) => string][] = [
  ['Recap page views', 48210, (n) => Math.round(n).toLocaleString('en-GB')],
  ['Hours watched', 1930, (n) => Math.round(n).toLocaleString('en-GB')],
  ['Clips shared', 3412, (n) => Math.round(n).toLocaleString('en-GB')],
];
const Tag: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <div style={{ position: 'absolute', right: 120, top: 980 }}><Rise t={t} at={at} y={20}><PreviewTag /></Rise></div>
);

export const analyticsFilm: FilmDef = {
  id: 'Analytics',
  bpm: 134,
  music: 'music/analytics.wav',
  tail: 1,
  shots: chain([
    {
      len: 8, name: 'hook',
      render: title({ text: 'Finally know what your\nattendees [cared about.]', size: 112, track: 120 }),
      sfx: (B) => titleSfx(2.6)(B),
    },
    {
      len: 12, name: 'kpis',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.05, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="The week after your event." size={84} y={170} />
            <div style={{ position: 'absolute', left: 150, top: 420, display: 'flex', gap: 40 }}>
              {KPI.map(([l, v, f], i) => {
                const a = B(1 + i * 0.6);
                const p = Math.min(1, Math.max(0, (t - a - 0.2) / 1.3));
                const e = 1 - (1 - p) ** 3;
                return (
                  <Rise key={l} t={t} at={a} y={120} spring="soft">
                    <Box pad="34px 40px 32px" style={{ width: 500 }}>
                      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.04em', color: BR.inkSubtle }}>{l}</div>
                      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 110, lineHeight: 1.05, letterSpacing: '-0.02em', color: BR.deep, fontVariantNumeric: 'tabular-nums', marginTop: 8 }}>{f(v * e)}</div>
                    </Box>
                  </Rise>
                );
              })}
            </div>
            <Tag t={t} at={B(1)} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], ...titleSfx()(B), [B(1), 'slide', 0.3], [B(1.6), 'slide', 0.28], [B(2.2), 'slide', 0.26], [B(1) + 1.5, 'tick', 0.25], [B(1.6) + 1.5, 'tick', 0.25], [B(2.2) + 1.5, 'tick', 0.25]],
    },
    {
      len: 12, name: 'bars',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, x: 40 }, { t: c.dur, x: -40, s: 1.04, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text={'Most watched\n*sessions.*'} size={100} x={150} y={360} />
            <div style={{ position: 'absolute', left: 900, top: 290 }}>
              <Rise t={t} at={B(0.6)} y={80} spring="soft">
                <Box pad="40px 44px">
                  <Bars t={t} at={B(1.2)} items={[['Panel: Who carries the risk?', 82], ['Opening keynote: The year ahead', 74], ['Workshop: Prompt evaluation', 51], ['Deep dive: Retrieval at scale', 38]]} />
                </Box>
              </Rise>
            </div>
            <Tag t={t} at={B(1)} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.6), 'whoosh-soft', 0.3], [B(1.2), 'swish', 0.2], [B(1.4), 'swish', 0.18], [B(1.6), 'swish', 0.16]],
    },
    {
      len: 12, name: 'curve',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.05, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text={'Where attention\n*peaked.*'} size={100} x={150} y={360} />
            <div style={{ position: 'absolute', left: 860, top: 300 }}>
              <Rise t={t} at={B(0.6)} y={80} spring="soft"><Box pad="50px 60px 30px"><Curve t={t} at={B(1.2)} w={760} h={380} /></Box></Rise>
            </div>
            <Tag t={t} at={B(1)} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.6), 'whoosh-soft', 0.3], [B(1.2), 'riser', 0.12], [B(1.2) + 1.2, 'pop', 0.3]],
    },
    {
      len: 8, name: 'dashboard',
      render: (c) => {
        const { t, B } = c;
        const s = SCREEN.dashboard;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1.02 }, { t: c.dur, s: 1.07, ease: INOUT }]}>
            <CapCard t={t} at={B(0.2)} file={s.file} sw={s.sw} sh={s.sh} rect={[0, 0, s.sw, s.sh]} box={[260, 120, 1400, 756]} />
            <Label t={t} at={B(1.2)} x={140} y={900}>Your event dashboard</Label>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], [B(0.2), 'whoosh-soft', 0.3], [B(1.2), 'pop-soft', 0.3]],
    },
    {
      len: 8, name: 'payoff',
      render: title({ text: 'Plan the next one\non [what worked.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 140, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.4], ...titleSfx(1.6)(B)],
    },
    { len: 8, name: 'end', render: end('Know what landed.'), sfx: endSfx },
  ]),
};
