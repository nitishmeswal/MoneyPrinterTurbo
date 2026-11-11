import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions } from './Captions';
import { pickScene } from './scenes';
import { Backdrop, BirdFlash, BrandBug, FLASH_FRAMES } from './stage';
import { Shot, VideoProps, wordsIn } from './types';

const FADE = 10; // frames each shot overlaps the next
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

type Kind = 'rise' | 'whip' | 'zoom' | 'iris' | 'slam' | 'push';
const CYCLE: Kind[] = ['whip', 'zoom', 'iris', 'push', 'slam', 'rise', 'whip', 'iris', 'zoom', 'push'];

const seedOf = (id: string) => id.split('').reduce((n, ch) => n + ch.charCodeAt(0), 0);

/** How a shot comes in: set per shot in motion.json ("in"), otherwise a varied cycle. */
const kindOf = (shots: Shot[], i: number, seed: number): Kind => {
  const m = shots[i]?.motion;
  if (m?.in) return m.in as Kind;
  if (m?.flash) return 'zoom';
  return CYCLE[(i + seed) % CYCLE.length];
};

const backOut = Easing.out(Easing.back(1.6));

/** After Effects-style cuts. The incoming shot picks the move; the outgoing one matches it. */
const Transition: React.FC<{ children: React.ReactNode; first: boolean; last: boolean; inKind: Kind; outKind: Kind; offset: number }> = ({ children, first, last, inKind, outKind, offset }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inLen = inKind === 'iris' ? 14 : FADE;
  const ip = first ? 1 : interpolate(frame, [0, inLen], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const op = last ? 0 : interpolate(frame, [durationInFrames - FADE, durationInFrames], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  let opacity = 1;
  let tx = 0;
  let ty = 0;
  let sc = 1;
  let blur = 0;
  let rot = 0;
  let clip: string | undefined;
  if (!first) {
    if (inKind === 'rise') { opacity = ip; ty = (1 - ip) * 60; blur = (1 - ip) * 10; }
    if (inKind === 'whip') { tx = (1 - ip) * 1000; blur = (1 - ip) * 22; opacity = Math.min(1, ip * 3); }
    if (inKind === 'zoom') { sc = 1.35 - 0.35 * ip; blur = (1 - ip) * 16; opacity = ip; }
    if (inKind === 'iris') { clip = `circle(${ip * 130}% at 50% 45%)`; }
    if (inKind === 'push') { ty = (1 - ip) * 1400; blur = (1 - ip) * 14; rot = (1 - ip) * 4; }
    if (inKind === 'slam') {
      const b = interpolate(frame, [0, FADE], [0, 1], { ...clamp, easing: backOut });
      sc = 1.6 - 0.6 * b; opacity = Math.min(1, ip * 2.5); blur = (1 - ip) * 8;
      if (frame > FADE && frame < FADE + 8) tx = Math.sin(frame * 2.6) * 14 * (1 - (frame - FADE) / 8);
    }
  }
  if (!last) {
    if (outKind === 'rise') { opacity *= 1 - op; ty -= op * 40; blur += op * 8; }
    if (outKind === 'whip') { tx -= op * 1000; blur += op * 22; }
    if (outKind === 'zoom') { sc *= 1 + op * 0.6; blur += op * 14; opacity *= 1 - op; }
    if (outKind === 'iris') { sc *= 1 - op * 0.06; blur += op * 4; }
    if (outKind === 'push') { ty -= op * 1400; blur += op * 14; }
    if (outKind === 'slam') { sc *= 1 - op * 0.2; opacity *= 1 - op; blur += op * 6; }
  }
  // A slow camera push-in for the life of the shot.
  const cam = 1 + 0.035 * (frame / Math.max(1, durationInFrames));
  return (
    <AbsoluteFill style={{ opacity, transform: `translate(${tx}px, ${ty}px) scale(${sc}) rotate(${rot}deg)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, clipPath: clip }}>
      {clip ? <Backdrop offset={offset} /> : null}
      <AbsoluteFill style={{ transform: `scale(${cam})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Shots where the big bird is already the subject, so the corner badge steps aside. */
const birdOnScreen = (shot: Shot, i: number, total: number) =>
  i === total - 1 || Boolean(shot.motion?.logo) || shot.motion?.scene === 'intro' || (!shot.motion && !shot.clip && i === 0);

export const FlayelVideo: React.FC<VideoProps> = (props) => {
  const { fps, shots, words } = props;
  const frame = useCurrentFrame();
  const t = frame / fps;
  const seed = seedOf(props.id);
  const last = shots[shots.length - 1];
  // Captions stop where the end card takes over: the whole last shot when it is
  // a motion end card, or from "Try ..." when it is a Kling clip.
  const tryWord = words.find((w) => w.start >= last.start && /^try$/i.test(w.text.replace(/[^a-z]/gi, '')));
  const showLastLine = last.clip || last.motion?.captions;
  const captionsUntil = showLastLine ? (tryWord ? tryWord.start : last.start) : last.start;
  // Badge: fades out entering a big-bird shot, back in leaving it, and hides while the sting plays.
  const current = Math.max(0, shots.findIndex((s) => t >= s.start && t < s.end));
  const hidden = (i: number) => i >= 0 && i < shots.length && birdOnScreen(shots[i], i, shots.length);
  const since = (t - shots[current].start) * fps;
  const ramp = Math.min(1, since / 8);
  let bugOpacity = hidden(current) ? (hidden(current - 1) ? 0 : 1 - ramp) : hidden(current - 1) ? ramp : 1;
  shots.forEach((s) => {
    if (!s.motion?.flash) return;
    const f = frame - Math.round(s.start * fps);
    if (f >= 0 && f < FLASH_FRAMES) bugOpacity = Math.min(bugOpacity, interpolate(f, [FLASH_FRAMES - 6, FLASH_FRAMES], [0, 1], clamp));
  });

  return (
    <AbsoluteFill>
      <Backdrop />
      {shots.map((shot, i) => {
        // Each shot starts on its first word and runs FADE frames into the next one.
        const from = Math.round(shot.start * fps);
        const to = Math.round(shot.end * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from + (i < shots.length - 1 ? FADE : 0))} name={`shot ${i + 1}`}>
            <Transition first={i === 0} last={i === shots.length - 1} inKind={kindOf(shots, i, seed)} outKind={kindOf(shots, i + 1, seed)} offset={from}>
              {pickScene(shot, i, shots.length, wordsIn(words, shot))}
            </Transition>
          </Sequence>
        );
      })}
      {shots.map((shot, i) =>
        shot.motion?.flash ? (
          <Sequence key={`flash${i}`} from={Math.round(shot.start * fps)} durationInFrames={FLASH_FRAMES} name="bird sting">
            <BirdFlash />
          </Sequence>
        ) : null,
      )}
      <BrandBug opacity={bugOpacity} />
      <Captions words={words} until={captionsUntil} />
      <Audio src={staticFile(props.voiceover)} />
    </AbsoluteFill>
  );
};
