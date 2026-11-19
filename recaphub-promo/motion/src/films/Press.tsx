/* Press Room, ~36 s, 132 BPM. Newsroom film. "Journalists don't wait. Neither should your press kit."
 * Real captures: the press gate ("The story, straight from the stage."), the journalist's lane email, the
 * access settings. Between them a live feed of quote cards (the press room's quote fragment) stacking newest
 * first, and a quote copied in one click. Music: stabs 0 / 4, build 8, drop 62 (payoff), end 72. */
import React from 'react';
import { Cue, Cursor, EIO, FilmDef, INOUT, Region, Rise, SHADOW, focus, lerp, spr } from '../kit';
import { Badge, QuoteCard, Toast, Z } from '../ui';
import { CapCard, Label, Scene, Top, chain, end, endSfx, title, titleSfx } from '../shots';
import { cap } from '../assets';

const GATE = cap('press-gate');
const LANE = cap('press-lane-email');
const ACCESS = cap('press-access');
const FEED: [string, string, string, string[]][] = [
  ['Theo Adeyemi · Head of Product, Kitecloud', '14:02', '“Ship open, then tighten with real usage data. Locking everything down first just moves the risk.”', ['#Product', '#AI']],
  ['Mara Lindqvist · CISO, Nordline Bank', '12:47', '“Locked down by default. Adoption follows trust, not the other way round.”', ['#Security', '#Banking']],
  ['Freja Lindqvist · Co-founder, Nordbyte', '11:34', '“The AI Act didn’t slow us down. Not knowing how it would be enforced did.”', ['#AI Act', '#Regulation']],
];

export const pressFilm: FilmDef = {
  id: 'Press',
  bpm: 132,
  music: 'music/press.wav',
  tail: 1,
  shots: chain([
    {
      len: 8, name: 'hook',
      render: title({ text: 'Journalists don’t wait.\nNeither should your [press kit.]', size: 108, track: 120 }),
      sfx: (B) => [...titleSfx(2.4)(B)],
    },
    {
      len: 10, name: 'gate',
      render: (c) => {
        const { t, B } = c;
        const un = lerp(t, B(3), B(5.5), 0, 1, EIO);
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.04, ease: INOUT }]}>
            <CapCard t={t} at={B(0.2)} file={GATE.file} sw={GATE.sw} sh={GATE.sh} rect={[0, 0, 1420, 1800]} box={[560, 110, 800, 1014 * 0.85]} toRect={[0, 0, 2880, 1800]} toBox={[210, 110, 1500, 938]} p={un} />
            <Label t={t} at={B(6)} x={140} y={860}>Approved journalists only</Label>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], [B(0.2), 'whoosh-soft', 0.3], [B(3), 'whoosh-soft', 0.25], [B(6), 'pop-soft', 0.3]],
    },
    {
      len: 12, name: 'feed',
      render: (c) => {
        const { t, B } = c;
        // newest first: each new card drops in at the top and pushes the others down
        const at = [B(1), B(3.5), B(6)];
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.04, ease: INOUT }]}>
            <Top t={t} at={B(0.2)} text={'A live feed\nfrom *every stage.*'} size={92} x={140} y={340} />
            {FEED.map(([who, time, q, tags], i) => {
              const k = FEED.length - 1 - i; // the order they arrive
              if (t < at[k]) return null;
              const above = at.filter((a, j) => j > k && t >= a).length;
              const slot = spr(t, at[k + above] ?? at[k], 'snap');
              const y = 160 + above * 270 - (above ? (1 - slot) * 270 : 0);
              return (
                <div key={i} style={{ position: 'absolute', left: 900, top: y }}>
                  <Rise t={t} at={at[k]} y={-120} s={0.94} spring="soft">
                    <div style={{ position: 'relative' }}>
                      <Z s={1.45}><QuoteCard t={t} who={who} time={time} quote={q} tags={tags} /></Z>
                      {above === 0 ? <div style={{ position: 'absolute', left: -30, top: -18 }}><Z s={1.6}><Badge tone="brand" dot>New</Badge></Z></div> : null}
                    </div>
                  </Rise>
                </div>
              );
            })}
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(1), 'bubble', 0.35], [B(3.5), 'bubble', 0.35], [B(6), 'bubble', 0.35]],
    },
    {
      len: 10, name: 'copy',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} cam={[{ t: 0, s: 1 }, { t: B(4), ...focus(1060, 600, 1.05), ease: INOUT }, { t: c.dur, ...focus(1000, 580, 1.03), ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="Quotes, ready to *copy.*" size={96} x={150} y={140} />
            <div style={{ position: 'absolute', left: 300, top: 380 }}>
              <Rise t={t} at={B(0.6)} y={120} spring="soft"><Z s={2.05}><QuoteCard t={t} copyAt={B(3.6)} /></Z></Rise>
            </div>
            <Cursor t={t} path={[{ t: B(1.6), x: 1650, y: 1000 }, { t: B(3.4), x: 1418, y: 650 }, { t: B(3.6), x: 1418, y: 650, click: true }, { t: B(5.5), x: 1500, y: 760 }]} />
            <div style={{ position: 'absolute', left: 1180, top: 850 }}><Toast t={t} at={B(4)} text="Quote copied" /></div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.6), 'whoosh-soft', 0.25], [B(3.6), 'click', 0.55], [B(4), 'ding', 0.28]],
    },
    {
      len: 10, name: 'lane',
      render: (c) => {
        const { t, B } = c;
        // the email scrolls inside a fixed card (a moving crop window), the camera only drifts
        const w = 1000, h = 900;
        const win = (h * LANE.el[2]) / w;
        const scroll = lerp(t, B(2), c.dur, 0, 1, INOUT);
        return (
          <Scene c={c} stage="paper-flip">
            <div style={{ position: 'absolute', left: 140, top: 380 }}><Top t={t} at={B(0.3)} text={'Each journalist\ngets *their own lane.*'} size={72} x={0} y={0} /></div>
            <CapCard t={t} at={B(0.5)} y={300} file={LANE.file} sw={LANE.sw} sh={LANE.sh} rect={[LANE.el[0], 0, LANE.el[2], win]} toRect={[LANE.el[0], LANE.el[3] - win, LANE.el[2], win]} p={scroll} box={[840, 90, w, h]} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.5), 'page', 0.35]],
    },
    {
      len: 12, name: 'access',
      render: (c) => {
        const { t, B } = c;
        const w = 1500;
        const k = w / ACCESS.el[2];
        return (
          <Scene c={c} cam={[{ t: 0, s: 1.02 }, { t: c.dur, s: 1.06, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="You decide *who gets in.*" size={88} y={100} />
            <CapCard t={t} at={B(0.6)} file={ACCESS.file} sw={ACCESS.sw} sh={ACCESS.sh} rect={ACCESS.el} box={[210, 290, w, ACCESS.el[3] * k]} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.6), 'whoosh-soft', 0.3]],
    },
    {
      len: 10, name: 'payoff',
      render: title({ text: 'The story, straight\nfrom the [stage.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 140, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.4], ...titleSfx(1.6)(B)],
    },
    { len: 8, name: 'end', render: end('Press gets it first.'), sfx: endSfx },
  ]),
};

