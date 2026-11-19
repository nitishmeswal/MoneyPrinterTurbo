/* Real-time / Live, ~30 s, 140 BPM. Countdown film. HOLD: check with Prakhar what is live today before it ships.
 * Hook "Post the keynote clip before the keynote ends."  Real: the HumanX stage footage, the stage wall, the
 * live ingest recording, the on-air timer; Stefan Weitz's reel from that same stage lands while the timer runs,
 * and the next clip is already rendering. Music: stabs 0 / 4, build 8, drop 54 (payoff), end 62. */
import React from 'react';
import { EIO, FilmDef, INOUT, Media, Reel, Region, Rise, SHADOW, focus, lerp, mix } from '../kit';
import { BR, Grad, Head } from '../brand';
import { Badge, ClipsLoader, Ingest, P, StageCard, UCard, Z } from '../ui';
import { CapCard, Scene, Top, chain, end, endSfx, title, titleSfx } from '../shots';
import { DEMO, FOOT, REEL, cap } from '../assets';

const ONAIR = cap('onair-live');
const ING = DEMO.liveIngest;

export const liveFilm: FilmDef = {
  id: 'Live',
  bpm: 140,
  music: 'music/live.wav',
  tail: 1,
  shots: chain([
    {
      len: 8, name: 'hook',
      render: title({ text: 'Post the keynote clip\nbefore the [keynote ends.]', size: 116, track: 120 }),
      sfx: (B) => titleSfx(2.6)(B),
    },
    {
      len: 12, name: 'stage',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1.04, x: 30 }, { t: c.dur, s: 1, x: -30, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 110, top: 200, perspective: 2000 }}>
              <Rise t={t} at={B(0.2)} y={0} x={-200} s={0.9} spring="soft">
                <div style={{ width: 1120, height: 630, borderRadius: 22, overflow: 'hidden', boxShadow: SHADOW, transform: 'rotateY(8deg)' }}><Media file={FOOT.humanx.file} w={1120} h={630} rate={0.8} /></div>
              </Rise>
            </div>
            <div style={{ position: 'absolute', left: 1180, top: 330 }}>
              <Rise t={t} at={B(1.4)} x={160} y={0} spring="soft"><Z s={1.9}><StageCard t={t} start={2410} name="HumanX Â· Main stage" chapters={2} /></Z></Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], [B(0.2), 'whoosh-soft', 0.3], [B(1.4), 'whoosh-soft', 0.3], [B(4), 'tick', 0.2], [B(8), 'tick', 0.2]],
    },
    {
      len: 10, name: 'wall', mb: true,
      render: (c) => {
        const { t, B } = c;
        const rx = mix(64, 30, lerp(t, B(0.3), B(3), 0, 1, EIO));
        return (
          <Scene c={c} tin="wipe" stage="horizon" gy={-200} cam={[{ t: 0, y: 30 }, { t: c.dur, y: -60, s: 1.05, ease: INOUT }]}
            fg={<div style={{ position: 'absolute', left: 150, top: 150 }}><Head t={t} at={B(1)} text="Every stage, live." size={110} color={BR.onAccent} /></div>}>
            <div style={{ position: 'absolute', left: 260, top: 290, width: 1640, height: 900, transform: `perspective(1700px) rotateX(${rx}deg) rotateZ(-7deg)`, transformOrigin: '50% 0' }}>
              <div style={{ background: '#FAFAF9', borderRadius: 26, width: 1640, height: 900, padding: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30, boxShadow: '0 60px 140px rgba(20,45,60,0.5)' }}>
                {[5076, 2831, 1290].map((s, i) => (
                  <Rise key={i} t={t} at={B(0.8 + i * 0.3)} y={40}><Z s={1.47}><StageCard t={t} start={s} name={['Main Stage Â· Day 1', 'Hall 2 Â· Product Track', 'Breakout Room C'][i]} chapters={3 - i} /></Z></Rise>
                ))}
              </div>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.35], [B(0.8), 'pop-soft', 0.25], [B(1.1), 'pop-soft', 0.25], [B(1.4), 'pop-soft', 0.25], [B(1), 'swish', 0.25]],
    },
    {
      len: 12, name: 'ingest',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="wipe" stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, ...focus(980, 570, 1.04), ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="Plug into the AV feed. *Go live.*" size={74} y={70} />
            <CapCard t={t} at={B(0.5)} file={ING.file} sw={ING.sw} sh={ING.sh} rect={[0, 0, ING.sw, ING.sh]} box={[300, 190, 1180, 1180 * ING.sh / ING.sw]} rate={0.9} />
            <div style={{ position: 'absolute', left: 1240, top: 760 }}>
              <Rise t={t} at={B(2)} x={140} y={0} spring="soft"><Z s={1.6}><Ingest t={t} okAt={B(3)} /></Z></Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], ...titleSfx()(B), [B(0.5), 'whoosh-soft', 0.3], [B(2), 'whoosh-soft', 0.25], [B(3), 'pop-soft', 0.35]],
    },
    {
      len: 12, name: 'while-on',
      render: (c) => {
        const { t, B } = c;
        const k = 1.5;
        return (
          <Scene c={c} cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.04, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="Clips while the talk *is still on.*" size={80} y={60} />
            <CapCard t={t} at={B(0.4)} file={ONAIR.file} sw={ONAIR.sw} sh={ONAIR.sh} rect={ONAIR.el} box={[150, 260, ONAIR.el[2] * k, ONAIR.el[3] * k]} />
            <div style={{ position: 'absolute', left: 900, top: 200 }}>
              <Rise t={t} at={B(2)} y={300} r={6} spring="soft"><Reel file={REEL('humanx-stefan-weitz')} w={330} from={4} style={{ transform: 'rotate(-2deg)' }} /></Rise>
            </div>
            <div style={{ position: 'absolute', left: 900 + 330 - 30, top: 210 }}>
              <Rise t={t} at={B(2.4)} y={0} s={0.6} spring="bouncy"><Z s={2}><Badge tone="ok" dot>Clip 1 posted</Badge></Z></Rise>
            </div>
            <div style={{ position: 'absolute', left: 1290, top: 520 }}>
              <Rise t={t} at={B(4)} x={160} y={0} spring="soft"><Z s={1.15}><ClipsLoader t={t} a={B(4.4)} b={B(11)} quips={['Clip 2: cutting the best answerâ€¦', 'Clip 2: adding captionsâ€¦']} /></Z></Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.4), 'whoosh-soft', 0.3], [B(2), 'whoosh', 0.3], [B(2.4), 'pop', 0.35], [B(2.45), 'ding', 0.25], [B(4), 'whoosh-soft', 0.25]],
    },
    {
      len: 8, name: 'payoff',
      render: title({ text: 'Live event.\n[Live content.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 160, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.4], ...titleSfx(1.2)(B)],
    },
    { len: 8, name: 'end', render: end('Live event. Live content.'), sfx: endSfx },
  ]),
};

