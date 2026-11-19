/* Teaser, ~21 s, 140 BPM. "Your event ended. Your audience didn't."
 * Dark hook with the LIVE badge flipping to ENDED; the camera dives into the badge and an iris opens on the
 * HumanX stage; then three fast cuts on the drop, all real: Clips (RAISE reels), Pages (the published hero,
 * its photo tiles lifting), Answers (the real workspace assistant answering). End: violet card. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, Card, Dark, EndCard, FilmDef, Flash, Head, Iris, Lift, Light, LiveBadge, Media, Reel, Region, SHADOW, ShotCtx, W, focus, lerp, spr, INOUT, INQ } from '../kit';
import { FOOT, REEL, shot } from '../assets';

const BADGE = { x: 146, y: 296 };

const Hook = ({ t, B }: ShotCtx) => {
  const ended = t >= B(4);
  const bump = ended && t < B(4) + 0.2 ? 1 + 0.25 * (1 - (t - B(4)) / 0.2) : 1;
  return (
    <AbsoluteFill>
      <Dark t={t} />
      <Cam t={t} keys={[{ t: 0, s: 1, x: 0, y: 0 }, { t: B(6), s: 1.05, x: 0, y: 0 }, { t: B(8), ...focus(BADGE.x + 70, BADGE.y + 20, 14), ease: 'in' }]}>
        <div style={{ position: 'absolute', left: BADGE.x, top: BADGE.y, transform: `scale(${bump})`, transformOrigin: '0 50%' }}>
          <LiveBadge size={1.2} label={ended ? 'ENDED' : 'LIVE'} color={ended ? '#3B3A4A' : C.red} glow={ended ? 0 : 0.6} />
        </div>
        <div style={{ position: 'absolute', left: 140, top: 370 }}>
          <Head t={t} at={0.15} text={'Your event\n*ended.*'} size={150} accent={ended ? '#8E8EA0' : C.red} />
        </div>
      </Cam>
    </AbsoluteFill>
  );
};

const Audience = ({ t, B }: ShotCtx) => {
  const r = lerp(t, 0, B(2), 0, 1300, INOUT);
  const card = lerp(t, B(3), B(5), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Dark t={t} />
      <Iris cx={960} cy={540} r={r}>
        <div style={{ position: 'absolute', left: 1920 * 0 + (760 - 0) * card, top: 160 * card, width: 1920 - (1920 - 1060) * card, height: 1080 - (1080 - 600) * card, borderRadius: 18 * card, overflow: 'hidden', boxShadow: card > 0.1 ? '0 50px 120px rgba(0,0,0,0.5)' : undefined }}>
          <Media file={FOOT.humanx.file} w={1920 - (1920 - 1060) * card} h={1080 - (1080 - 600) * card} rate={0.8} />
          <div style={{ position: 'absolute', left: 22, top: 20 }}>
            <LiveBadge size={0.8} />
          </div>
        </div>
      </Iris>
      <div style={{ position: 'absolute', left: 140, top: 400, opacity: card }}>
        <Head t={t} at={B(3.4)} text={'Your audience\n*didn’t.*'} size={130} accent={C.violetSoft} />
      </div>
      <Flash t={t} at={B(9.7)} color={C.violet} dur={0.4} />
    </AbsoluteFill>
  );
};

/** One of the three fast product beats: a big word on the left, the real thing on the right. */
const Beat: React.FC<{ t: number; B: (n: number) => number; word: string; sub: string; children: React.ReactNode; dark?: boolean }> = ({ t, B, word, sub, children, dark }) => (
  <AbsoluteFill>
    {dark ? <Dark t={t} tint={1.3} /> : <Light t={t} />}
    {children}
    <div style={{ position: 'absolute', left: 120, top: 380 }}>
      <Head t={t} at={0.03} text={word} size={170} color={dark ? C.white : C.ink} step={0.05} />
      <div style={{ height: 16 }} />
      <Head t={t} at={B(0.75)} text={sub} size={44} weight={500} color={dark ? '#B9B6D3' : C.ink2} step={0.03} />
    </div>
  </AbsoluteFill>
);

const Clips = ({ t, B }: ShotCtx) => (
  <Beat t={t} B={B} word="Clips." sub="Every keynote, cut and captioned." dark>
    {['raise-mark-cuban', 'raise-yann-lecun', 'raise-scott-wu', 'raise-arthur-mensch'].map((r, i) => {
      const p = spr(t, B(i * 0.4), 15, 0.8);
      return (
        <div key={r} style={{ position: 'absolute', left: 820 + i * 262, top: 200 + (i % 2) * 70 + (1 - p) * 500, opacity: Math.min(1, p * 1.5), transform: `rotate(${(i - 1.5) * 3}deg)` }}>
          <Reel file={REEL(r)} w={240} from={6 + i * 3} />
        </div>
      );
    })}
  </Beat>
);

const HERO = shot('hero');
const Pages = ({ t, B }: ShotCtx) => (
  <Beat t={t} B={B} word="Pages." sub="Every session, every debate, one link.">
    <Cam t={t} keys={[{ t: 0, s: 1.06, x: 0, y: 0 }, { t: B(6), s: 1, x: 0, y: 0 }]}>
      <Lift file={HERO.file} sw={HERO.sw} sh={HERO.sh} box={[820, 210, 1040, 650]} el={[1560, 330, 1050, 1290]} p={lerp(t, B(1.5), B(3), 0, 1, INOUT)} scale={1.12} dx={-20} dy={-10} blur={4} />
    </Cam>
  </Beat>
);

const CHAT = shot('chat-thread');
const Answers = ({ t, B }: ShotCtx) => {
  const p = lerp(t, B(0.2), B(2.2), 0, 1, INOUT);
  return (
    <Beat t={t} B={B} word="Answers." sub="Ask your event anything.">
      <Region file={CHAT.file} sw={CHAT.sw} sh={CHAT.sh} rect={[960, 150, 680, 140]} box={[1060, 250, 700, 144]} toRect={[0, 0, 1700, 1180]} toBox={[860, 150, 980, 680]} p={p} radius={18} shadow={SHADOW} />
    </Beat>
  );
};

const Line = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Dark t={t} />
    <div style={{ position: 'absolute', left: 0, width: W, top: 380 }}>
      <Head t={t} at={0.05} text={'Your event ended.\nYour audience ^didn’t.^'} size={120} align="center" hlAt={B(2)} />
    </div>
  </AbsoluteFill>
);

export const teaserFilm: FilmDef = {
  bpm: 140,
  music: 'music/teaser.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 8, render: Hook, name: 'hook' },
    { from: 8, to: 18, render: Audience, name: 'audience' },
    { from: 18, to: 24, render: Clips, name: 'clips' },
    { from: 24, to: 30, render: Pages, name: 'pages' },
    { from: 30, to: 36, render: Answers, name: 'answers' },
    { from: 36, to: 42, render: Line, name: 'line' },
    { from: 42, to: 50, render: ({ t }) => <EndCard t={t} line="Every session, every debate, one link." />, name: 'end' },
  ],
  sfx: [
    { at: 4, src: 'switch', vol: 0.4 },
    { at: 6.5, src: 'whoosh', vol: 0.4 },
    { at: 17.5, src: 'whoosh', vol: 0.35 },
    { at: 23.8, src: 'whip', vol: 0.3 },
    { at: 29.8, src: 'whip', vol: 0.3 },
    { at: 42, src: 'page-turn', vol: 0.35 },
  ],
};
void Card;
void INQ;
