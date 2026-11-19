/* Event Intelligence, ~36 s, 126 BPM. Data film. "What did 40 speakers actually agree on?"
 * Real captures: the mind map pulling out from its centre, an opened theme, "The event at a glance"; between
 * them the treemap as brand colour fields growing and the debate drawing out to three stances.
 * Contradictions between speakers are not in the app yet, so they never appear.
 * Music: stabs 0 / 4, build 8, drop 60 (payoff), end 68. */
import React from 'react';
import { EIO, FilmDef, INOUT, focus, lerp } from '../kit';
import { Debate, Treemap } from '../ui';
import { CapCard, Label, Scene, Top, chain, end, endSfx, title, titleSfx } from '../shots';
import { cap } from '../assets';

const MAP = cap('mindmap');
const THEME = cap('mindmap-theme');
const GLANCE = cap('recap-insights');

export const intelFilm: FilmDef = {
  id: 'Intel',
  bpm: 126,
  music: 'music/intel.wav',
  tail: 1,
  shots: chain([
    {
      len: 8, name: 'hook',
      render: title({ text: 'What did 40 speakers\nactually [agree on?]', size: 120, track: 120 }),
      sfx: (B) => titleSfx(2.4)(B),
    },
    {
      len: 12, name: 'mindmap', mb: true,
      render: (c) => {
        const { t, B } = c;
        const un = lerp(t, B(1.5), B(5), 0, 1, EIO);
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.05, ease: INOUT }]}>
            <CapCard t={t} at={B(0.1)} y={0} s={0.8} file={MAP.file} sw={MAP.sw} sh={MAP.sh} rect={[1080, 300, 720, 450]} box={[160, 220, 1600, 1000 * 0.611]} toRect={[0, 0, 2880, 1099]} toBox={[160, 250, 1600, 611]} p={un} />
            <Top t={t} at={B(5.2)} text="The whole event, *as a map.*" size={84} y={90} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], [B(1.5), 'whoosh-soft', 0.35], [B(5.2), 'swish', 0.25]],
    },
    {
      len: 10, name: 'theme',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: B(3), s: 1 }, { t: c.dur, ...focus(1100, 760, 1.35), ease: INOUT }]}>
            <CapCard t={t} at={B(0.2)} file={THEME.file} sw={THEME.sw} sh={THEME.sh} rect={[0, 0, 2880, 1636]} box={[260, 120, 1400, 795]} />
            <Label t={t} at={B(1.4)} x={140} y={900}>Open any theme</Label>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], [B(0.2), 'whoosh-soft', 0.3], [B(1.4), 'pop-soft', 0.3], [B(3), 'whoosh-soft', 0.2]],
    },
    {
      len: 10, name: 'treemap',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} cam={[{ t: 0, x: 60 }, { t: c.dur, x: -80, s: 1.03, ease: INOUT }]} py={-700}>
            <Top t={t} at={B(0.3)} text="Where the time *went.*" size={92} x={150} y={100} />
            <div style={{ position: 'absolute', left: 150, top: 280 }}><Treemap t={t} at={B(1)} step={B(1)} /></div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(1), 'slide', 0.3], [B(2), 'slide', 0.28], [B(3), 'slide', 0.26]],
    },
    {
      len: 10, name: 'debate',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, ...focus(1000, 560, 1.05), ease: INOUT }]} py={-640}>
            <Top t={t} at={B(0.3)} text="Where each speaker *stood.*" size={88} y={100} />
            <Debate t={t} at={B(1)} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(1), 'whoosh-soft', 0.25], [B(1) + 0.5, 'swish', 0.2], [B(1) + 0.95, 'pop-soft', 0.25], [B(1) + 1.17, 'pop-soft', 0.25], [B(1) + 1.39, 'pop-soft', 0.25]],
    },
    {
      len: 10, name: 'glance',
      render: (c) => {
        const { t, B } = c;
        const un = lerp(t, B(2), B(4.5), 0, 1, EIO);
        return (
          <Scene c={c} cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.04, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="The event *at a glance.*" size={88} y={80} />
            <CapCard t={t} at={B(0.5)} file={GLANCE.file} sw={GLANCE.sw} sh={GLANCE.sh} rect={[0, 0, 1500, 1000]} box={[460, 230, 1000, 667]} toRect={[0, 0, 2880, 1620]} toBox={[210, 230, 1500, 844]} p={un} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.5), 'whoosh-soft', 0.3], [B(2), 'whoosh-soft', 0.25]],
    },
    {
      len: 8, name: 'payoff',
      render: title({ text: 'Every idea,\n[mapped.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 160, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.4], ...titleSfx(1.2)(B)],
    },
    { len: 8, name: 'end', render: end('Know what your event said.'), sfx: endSfx },
  ]),
};
