/* Teaser, ~24 s, 132 BPM. Logo-reveal hype film. "Your event ended. Your audience didn't."
 * The LIVE badge flips to ENDED on the gradient; then a three-beat montage on the page, each word a product:
 * Clips (real RAISE reels fanning in), Pages (the published hero swinging into place), Answers (the assistant
 * streaming an answer); the lockup lands; end card. Music: stabs on 0 / 4, drop on the montage (14), end 44. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Cam, Cue, FilmDef, INOUT, Layer, Reel, Rise, Shot, lerp, mix, spr } from '../kit';
import { BR, DISPLAY, Grad, Head, Lockup, Paper, SANS } from '../brand';
import { Chat, Hero, Z } from '../ui';
import { Scene, chain, end, endSfx, title, titleSfx } from '../shots';
import { REEL, REELS } from '../assets';

/** The LIVE badge that flips to ENDED (a stylised version of the app's stage badge). */
const Badge: React.FC<{ t: number; flip: number }> = ({ t, flip }) => {
  const p = lerp(t, flip, flip + 0.35);
  const ended = p > 0.5;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 22, background: ended ? 'rgba(26,26,26,0.85)' : '#E8141B', color: '#fff', borderRadius: 26, padding: '22px 44px', fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: '0.02em', transform: `rotateX(${Math.sin(p * Math.PI) * 80}deg)`, boxShadow: '0 22px 56px rgba(20,45,60,0.35)' }}>
      <span style={{ width: 30, height: 30, borderRadius: 15, background: '#fff', opacity: ended ? 0.5 : 0.45 + 0.55 * Math.abs(Math.sin(t * 4)) }} />
      {ended ? 'Ended' : 'Live'}
    </div>
  );
};

export const teaserFilm: FilmDef = {
  id: 'Teaser',
  bpm: 132,
  music: 'music/teaser.wav',
  tail: 1,
  shots: chain([
    {
      len: 8, name: 'ended',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tout="whip-u" dout={B(1)}>
          <Cam t={t} keys={[{ t: 0, s: 1 }, { t: dur, s: 1.08, ease: INOUT }]}>
            <Layer depth={0.3}><Grad t={t} y={-380} /></Layer>
            <Layer>
              <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', perspective: 1200 }}>
                <Rise t={t} at={B(0.2)} y={60} s={0.7} spring="bouncy"><Badge t={t} flip={B(3.6)} /></Rise>
                <div style={{ height: 70 }} />
                <Head t={t} at={B(4.2)} text="Your event ended." size={130} align="center" color={BR.onAccent} />
              </AbsoluteFill>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[B(0.2), 'pop', 0.35], [B(3.6), 'whoosh-soft', 0.3], [B(3.8), 'stamp', 0.35], [B(4.2), 'swish', 0.3]],
    },
    {
      len: 6, name: 'didnt',
      render: title({ text: 'Your audience\n[didn’t.]', stage: 'card-back', gx: -120, gy: -300, gw: 2300, size: 150, tin: 'whip-u', push: 0.07 }),
      sfx: (B) => [[0, 'whip', 0.35], ...titleSfx(1.2)(B)],
    },
    {
      len: 8, name: 'clips',
      render: (c) => {
        const { t, B } = c;
        const fan = REELS.raise;
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1.05 }, { t: c.dur, s: 1, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 140, top: 400 }}><Head t={t} at={B(0.3)} text="Clips." size={190} /></div>
            {fan.map((r, i) => {
              const p = spr(t, B(0.6 + i * 0.4), 'soft');
              const x = 760 + i * 270;
              return (
                <div key={r} style={{ position: 'absolute', left: x, top: 170 + (i % 2) * 70, transform: `translateY(${(1 - p) * 700}px) rotate(${mix(14, (i - 1.5) * 4, p)}deg)`, opacity: Math.min(1, p * 2) }}>
                  <Reel file={REEL(r)} w={300} from={3 + i} />
                </div>
              );
            })}
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.35], [B(0.3), 'thud', 0.35], ...[0, 1, 2, 3].map((i) => [B(0.6 + i * 0.4), 'whoosh-soft', 0.25] as Cue)],
    },
    {
      len: 8, name: 'pages',
      render: (c) => {
        const { t, B } = c;
        const p = spr(t, B(0.6), 'soft');
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1.05 }, { t: c.dur, s: 1, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 140, top: 400 }}><Head t={t} at={B(0.3)} text="Pages." size={190} /></div>
            <div style={{ position: 'absolute', left: 760, top: 260, perspective: 2200 }}>
              <div style={{ transform: `rotateY(${mix(-38, -12, p)}deg) translateX(${(1 - p) * 500}px) scale(0.68)`, transformOrigin: '0 0', opacity: Math.min(1, p * 2) }}><Hero t={t} at={B(0.8)} /></div>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.35], [B(0.3), 'thud', 0.35], [B(0.6), 'whoosh', 0.3], [B(1.2), 'pop-soft', 0.2], [B(1.5), 'pop-soft', 0.2]],
    },
    {
      len: 8, name: 'answers',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} cam={[{ t: 0, s: 1.05 }, { t: c.dur, s: 1, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 140, top: 400 }}><Head t={t} at={B(0.3)} text="Answers." size={190} /></div>
            <div style={{ position: 'absolute', left: 880, top: 260 }}>
              <Z s={1.95}><Chat t={t} at={B(0.6)} w={500} q="What did speakers say about AI regulation?" a="Three views came up: ship locked down and earn trust, ship open and tighten with data, or set defaults by who the user is. The panel on day 2 covered all three." sources={['Who carries the risk? · 47:30', 'Opening keynote · 52:14']} ansAt={B(2.4)} /></Z>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.35], [B(0.3), 'thud', 0.35], [B(0.6), 'key', 0.15], [B(1.4), 'key', 0.15], [B(2.4), 'bubble', 0.3]],
    },
    {
      len: 6, name: 'lockup',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} tin="zoom" cam={[{ t: 0, s: 0.96 }, { t: c.dur, s: 1.04, ease: INOUT }]}>
            <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Lockup t={t} at={B(0.2)} w={1050} />
              <div style={{ height: 40 }} />
              <Rise t={t} at={B(2)} y={20} blur={8}><div style={{ fontFamily: SANS, fontSize: 44, color: BR.inkMuted }}>Real-time content for B2B events</div></Rise>
            </AbsoluteFill>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.35], [B(0.3), 'impact', 0.4], [B(0.4), 'shimmer', 0.25], [B(2), 'swish', 0.25]],
    },
    { len: 8, name: 'end', render: end('Clips. Pages. Answers. While it’s live.'), sfx: endSfx },
  ]),
};
