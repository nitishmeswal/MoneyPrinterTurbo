/* Shot templates shared by every film, plus `chain`, which lays shots end to end on the beat grid with an
 * overlap so each hand-over is a continuous transition rather than a cut. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Cam, CamKey, Cue, INOUT, Layer, Rect, Region, Rise, SHADOW, Shot, ShotCtx, ShotDef, TIn, TOut, mix } from './kit';
import { BR, DISPLAY, EndCard, Grad, GradImg, Head, Paper, SANS } from './brand';

export type Item = { len: number; name: string; render: ShotDef['render']; sfx?: ShotDef['sfx']; mb?: boolean };
/** Shots end to end; each one runs `ov` beats into the next (later shots draw on top). */
export const chain = (items: Item[], ov = 1): ShotDef[] => {
  let at = 0;
  return items.map((it, i) => {
    const s: ShotDef = { from: at, to: at + it.len + (i < items.length - 1 ? ov : 0), name: it.name, render: it.render, sfx: it.sfx, mb: it.mb };
    at += it.len;
    return s;
  });
};

export type Stage = GradImg | 'paper' | 'paper-flip';
/** The stage layer (inside a Cam): the page or a brand gradient. */
export const StageBg: React.FC<{ t: number; stage: Stage; gx?: number; gy?: number; gw?: number; py?: number }> = ({ t, stage, gx, gy, gw, py }) =>
  stage === 'paper' || stage === 'paper-flip' ? <Paper t={t} flip={stage === 'paper-flip'} y={py} /> : <Grad t={t} img={stage} x={gx} y={gy} w={gw} />;

/**
 * A headline shot: the stage, a slow camera move (push or track), the line arriving word by word.
 * On gradients the type is white and [key] words get the white box.
 */
export const title = (o: {
  text: string; stage?: Stage; size?: number; align?: 'left' | 'center'; x?: number; y?: number; at?: number; keyAt?: number;
  track?: number; push?: number; tin?: TIn; tout?: TOut; gx?: number; gy?: number; gw?: number; py?: number; sub?: string; extra?: (c: ShotCtx) => React.ReactNode; out?: number;
}) => (c: ShotCtx) => {
  const { t, B, dur } = c;
  const stage = o.stage ?? 'horizon';
  const grad = stage !== 'paper' && stage !== 'paper-flip';
  const align = o.align ?? 'left';
  const track = o.track ?? 0;
  const push = Math.max(o.push ?? 0.09, 0.09);
  const ks: CamKey[] = [{ t: 0, x: track / 2, s: 1 }, { t: dur, x: -track / 2, s: 1 + push, ease: INOUT }];
  return (
    <Shot t={t} dur={dur} tin={o.tin ?? 'cut'} tout={o.tout ?? 'cut'} din={B(1)} dout={B(1)}>
      <Cam t={t} keys={ks}>
        <Layer depth={0.3}><StageBg t={t} stage={stage} gx={o.gx} gy={o.gy} gw={o.gw} py={o.py} /></Layer>
        <Layer depth={1}>
          <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: o.y === undefined ? 'center' : 'flex-start', alignItems: align === 'center' ? 'center' : 'flex-start', paddingLeft: align === 'center' ? 0 : o.x ?? 150, paddingTop: o.y ?? 0 }}>
            <Head t={t} at={o.at ?? B(0.25)} text={o.text} size={o.size ?? 132} align={align} color={grad ? BR.onAccent : BR.ink} keyAt={o.keyAt} out={o.out} />
            {o.sub ? <div style={{ marginTop: 34, fontFamily: SANS, fontSize: 38, color: grad ? 'rgba(255,255,255,0.92)' : BR.inkMuted, opacity: Math.min(1, Math.max(0, (t - B(2)) / 0.4)) }}>{o.sub}</div> : null}
          </AbsoluteFill>
        </Layer>
        {o.extra ? o.extra(c) : null}
      </Cam>
    </Shot>
  );
};
/** A shot on a stage with a camera: everything most product shots need. Children sit on the depth-1 layer. */
export const Scene: React.FC<{ c: ShotCtx; tin?: TIn; tout?: TOut; din?: number; dout?: number; cam?: CamKey[]; stage?: Stage; py?: number; gx?: number; gy?: number; gw?: number; children: React.ReactNode; fg?: React.ReactNode }> = ({ c, tin = 'whip-r', tout = 'cut', din, dout, cam, stage = 'paper', py, gx, gy, gw, children, fg }) => {
  const { t, B, dur } = c;
  return (
    <Shot t={t} dur={dur} tin={tin} tout={tout} din={din ?? B(1)} dout={dout ?? B(1)}>
      <Cam t={t} keys={cam ?? [{ t: 0, s: 1 }, { t: dur, s: 1.08, ease: INOUT }]} creep={cam ? 1 + 0.035 * INOUT(Math.min(1, Math.max(0, t / dur))) : 1}>
        <Layer depth={0.3}><StageBg t={t} stage={stage} py={py} gx={gx} gy={gy} gw={gw} /></Layer>
        <Layer>{children}</Layer>
        {fg ? <Layer depth={1.15}>{fg}</Layer> : null}
      </Cam>
    </Shot>
  );
};
/** A headline placed at the top centre (or at x, y). */
export const Top: React.FC<{ t: number; at: number; text: string; size?: number; x?: number; y?: number; color?: string; out?: number }> = ({ t, at, text, size = 84, x, y = 100, color, out }) =>
  x === undefined ? (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y }}><Head t={t} at={at} text={text} size={size} align="center" color={color} out={out} /></div>
  ) : (
    <div style={{ position: 'absolute', left: x, top: y }}><Head t={t} at={at} text={text} size={size} color={color} out={out} /></div>
  );

/** Default cues for a headline shot. */
export const titleSfx = (key?: number) => (B: (n: number) => number): Cue[] => [[B(0.2), 'whoosh-soft', 0.32], ...(key !== undefined ? ([[B(key), 'snap', 0.3]] as Cue[]) : [])];

/**
 * A real capture (or recording) as a card on the stage: `rect` of the source shown in `box`, arriving with a
 * spring. Pass toRect / toBox + p for crop → uncrop.
 */
export const CapCard: React.FC<{ t: number; at: number; file: string; sw: number; sh: number; rect: Rect; box: Rect; toRect?: Rect; toBox?: Rect; p?: number; from?: number; rate?: number; radius?: number; y?: number; r?: number; s?: number; children?: React.ReactNode }> = ({ t, at, y = 140, r = 0, s = 0.9, radius = 20, ...o }) => (
  <Rise t={t} at={at} y={y} r={r} s={s} spring="soft" style={{ position: 'absolute', inset: 0 }}>
    <Region {...o} radius={radius} shadow={SHADOW} />
  </Rise>
);
/** An "off" toggle drawn over a capture's real "on" toggle until `onAt` (screen position and size of the toggle). */
export const ToggleOff: React.FC<{ t: number; onAt: number; x: number; y: number; w: number; h: number }> = ({ t, onAt, x, y, w, h }) => {
  if (t >= onAt + 0.18) return null;
  const k = t < onAt ? 0 : (t - onAt) / 0.18;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: h, background: `rgb(${mix(209, 67, k)},${mix(206, 97, k)},${mix(201, 238, k)})` }}>
      <div style={{ position: 'absolute', top: h * 0.1, left: h * 0.1 + (w - h) * k, width: h * 0.8, height: h * 0.8, borderRadius: h, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  );
};
/** A label in a white box (brand Box), popping in: names what the real screen shows. */
export const Label: React.FC<{ t: number; at: number; children: React.ReactNode; x: number; y: number; out?: number }> = ({ t, at, children, x, y, out }) => (
  <div style={{ position: 'absolute', left: x, top: y }}>
    <Rise t={t} at={at} y={30} spring="snap" out={out}>
      <div style={{ background: '#fff', borderRadius: 22, boxShadow: '0 5px 14px rgba(20,45,60,0.12), 0 22px 56px rgba(20,45,60,0.30)', padding: '18px 30px', fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: BR.ink, whiteSpace: 'nowrap' }}>{children}</div>
    </Rise>
  </div>
);

/** The end card shot. */
export const end = (line: string, tin: TIn = 'wipe') => ({ t, B, dur }: ShotCtx) => (
  <Shot t={t} dur={dur} tin={tin} din={B(1)}>
    <Cam t={t} keys={[{ t: 0, s: 1.03 }, { t: dur, s: 1, ease: INOUT }]} drift={0.6}>
      <Layer><EndCard t={t - B(0.5)} line={line} /></Layer>
    </Cam>
  </Shot>
);
export const endSfx = (B: (n: number) => number): Cue[] => [[B(0.5), 'whoosh-soft', 0.3], [B(0.6), 'shimmer', 0.22], [B(0.5) + 1.05, 'slide', 0.35], [B(0.5) + 1.3, 'pop-soft', 0.3]];
