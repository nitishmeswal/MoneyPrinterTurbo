/* RecapHub MCP, ~28 s, 136 BPM. Chat-demo film. "Ask your event anything."
 * The pill on the gradient, the camera dives into it; then the real screens: the published page's "Keep
 * exploring in your AI tool" card (clicked), the real connect dialog (Next), the real tool calls landing one by
 * one, and an answer streaming with its source. Music: stabs 0 / 4, build 8, drop 48 (payoff), end 56. */
import React from 'react';
import { Cue, Cursor, EIO, FilmDef, INOUT, Pop, Region, Rise, SHADOW, focus, lerp } from '../kit';
import { BR, Head } from '../brand';
import { Chat, McpPill, Z } from '../ui';
import { CapCard, Scene, Top, chain, end, endSfx, title, titleSfx } from '../shots';
import { BOX, cap } from '../assets';

const CONT = cap('continue-mcp');
const DLG = cap('mcp-event');
const TOOLS = cap('mcp-tools');
const ck = 1500 / 2045;
const pill = [210 + (1867 - 178) * ck, 420 + (256 - 82) * ck];
const dk = 860 / BOX.mcpDialog[3];
const dlgBox: [number, number, number, number] = [526, 110, BOX.mcpDialog[2] * dk, 860];
const next = [dlgBox[0] + (BOX.mcpNext[0] - BOX.mcpDialog[0]) * dk, dlgBox[1] + (BOX.mcpNext[1] - BOX.mcpDialog[1]) * dk];

export const mcpFilm: FilmDef = {
  id: 'Mcp',
  bpm: 136,
  music: 'music/mcp.wav',
  tail: 1,
  shots: chain([
    {
      len: 8, name: 'ask', mb: true,
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="cut" tout="dive" dout={B(1.3)} stage="horizon" gx={-200} gy={-560} cam={[{ t: 0, s: 1 }, { t: B(6), s: 1.04, ease: INOUT }, { t: c.dur, ...focus(560, 720, 1.6), ease: EIO }]}>
            <div style={{ position: 'absolute', left: 150, top: 240 }}><Head t={t} at={B(0.3)} text={'Ask your event\nanything.'} size={136} color={BR.onAccent} /></div>
            <div style={{ position: 'absolute', left: 150, top: 690 }}>
              <Rise t={t} at={B(2)} y={50} s={0.8} spring="bouncy" origin="0 50%"><Z s={2.6} origin="0 50%"><McpPill glow={t > B(3) ? Math.max(0, Math.sin((t - B(3)) * 3)) : 0} /></Z></Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [...titleSfx()(B), [B(2), 'pop', 0.35], [B(6.4), 'riser', 0.2], [B(7.6), 'whoosh', 0.4]],
    },
    {
      len: 8, name: 'continue',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="push" cam={[{ t: 0, s: 1 }, { t: B(4), ...focus(1100, 560, 1.06), ease: INOUT }, { t: c.dur, ...focus(1040, 560, 1.03), ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="On every event page." size={84} y={190} />
            <CapCard t={t} at={B(0.4)} file={CONT.file} sw={CONT.sw} sh={CONT.sh} rect={[178, 82, 2045, 348]} box={[210, 420, 1500, 348 * ck]} />
            <Cursor t={t} path={[{ t: B(1.6), x: 1600, y: 980 }, { t: B(3.6), x: pill[0], y: pill[1] }, { t: B(4), x: pill[0], y: pill[1], click: true }, { t: B(6), x: pill[0] + 80, y: pill[1] + 160 }]} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh-soft', 0.3], ...titleSfx()(B), [B(0.4), 'whoosh-soft', 0.3], [B(4), 'click', 0.55]],
    },
    {
      len: 12, name: 'connect',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: B(6), ...focus(1040, 630, 1.05), ease: INOUT }, { t: c.dur, ...focus(980, 560, 1.02), ease: INOUT }]}>
            <Rise t={t} at={B(0.2)} y={160} s={0.9} spring="soft" style={{ position: 'absolute', inset: 0 }}>
              <Region file={DLG.file} sw={DLG.sw} sh={DLG.sh} rect={BOX.mcpDialog} box={dlgBox} radius={18} shadow={SHADOW} />
            </Rise>
            <Cursor t={t} path={[{ t: B(4), x: 1700, y: 1060 }, { t: B(6.6), x: next[0], y: next[1] }, { t: B(7), x: next[0], y: next[1], click: true }, { t: B(9), x: next[0] + 120, y: next[1] + 90 }]} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], [B(0.2), 'whoosh-soft', 0.3], [B(7), 'click', 0.55]],
    },
    {
      len: 12, name: 'tools',
      render: (c) => {
        const { t, B } = c;
        const s = 1.8;
        return (
          <Scene c={c} cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.05, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text={'Sessions, summaries and speakers,\n*one question away.*'} size={70} y={60} />
            <div style={{ position: 'absolute', left: (1920 - 770 * s) / 2, top: 300 }}>
              {[0, 1, 2, 3].map((i) => {
                const r = lerp(t, B(1.4 + i * 1.2), B(1.9 + i * 1.2), 0, 1, EIO);
                return (
                  <div key={i} style={{ position: 'absolute', left: 0, top: i * 80 * s * 1.15, opacity: r, transform: `translateX(${(1 - r) * 120}px)` }}>
                    <Region file={TOOLS.file} sw={TOOLS.sw} sh={TOOLS.sh} rect={[63, 63 + i * 80, 770, 68]} box={[0, 0, 770 * s, 68 * s]} radius={16} shadow={SHADOW} />
                  </div>
                );
              })}
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), ...[0, 1, 2, 3].map((i) => [B(1.4 + i * 1.2), 'tick', 0.35] as Cue)],
    },
    {
      len: 8, name: 'answer',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.04, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 230, top: 250 }}>
              <Z s={2.2}><Chat t={t} at={B(0.4)} w={660} q="Summarise the opening keynote" a="The opening keynote set the theme for the year: moving AI from pilots to practice in regulated industries, with three priorities: auditability, clear ownership of risk, and training teams early." sources={['Opening keynote · 52:14']} ansAt={B(2.6)} /></Z>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], [B(0.4), 'key', 0.15], [B(1.2), 'key', 0.15], [B(2.6), 'bubble', 0.3]],
    },
    {
      len: 8, name: 'payoff',
      render: title({ text: 'Your conference,\ninside [your AI.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 150, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.4], ...titleSfx(1.4)(B)],
    },
    { len: 8, name: 'end', render: end('Ask your event anything.'), sfx: endSfx },
  ]),
};

