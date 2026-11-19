/* RecapHub film kit, v2 (2026-11-14), modelled on recaphub-videos/preview.mp4.
 *
 * The grammar of the reference, as reusable pieces:
 *  - stages: dark indigo glow (hooks, problems), light grey-violet (product), full violet (end card)
 *  - Outfit headlines that blur in word by word; *accent*, ~grey shimmer~ and ^highlight^ words
 *  - Swap: one line blurs out while its replacement blurs in
 *  - Cam: a keyframed 3D camera (push-ins, pull-backs, tilts) with focus-zoom onto any point
 *  - Region: any rectangle of a real recording or screenshot, at any size, animatable (crop → uncrop)
 *  - Lift: a real page out of focus while one real card rises sharp off it (depth of field)
 *  - Iris: a circle that opens from a point (the LIVE dot that becomes the footage)
 *  - pills, chips, the LIVE badge, and the violet end card with the real logo
 * Everything on screen that shows the product is a real recording or a real capture. */
import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Outfit';

export const OUTFIT = loadFont('normal', { weights: ['300', '400', '500', '600', '700', '800'], subsets: ['latin'] }).fontFamily;
export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
  black: '#08070F',
  dark: '#0D0B1C',
  indigo: '#241A5E',
  violet: '#5B3DF5',
  violetDeep: '#4A2FE0',
  violetSoft: '#8B78FF',
  violet50: '#EEEAFF',
  red: '#E8141B',
  light: '#F4F4F7',
  ink: '#101016',
  ink2: '#4A4A57',
  grey: '#8C8C99',
  green: '#169C46',
  green50: '#E3F6EA',
  white: '#FFFFFF',
};

export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const OUTQ = Easing.bezier(0.25, 1, 0.5, 1);
export const INQ = Easing.bezier(0.5, 0, 0.75, 0);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const lerp = (t: number, a: number, b: number, from = 0, to = 1, ease: (x: number) => number = EXPO) =>
  b <= a ? (t >= b ? to : from) : interpolate(t, [a, b], [from, to], { ...clamp, easing: ease });
export const spr = (t: number, at: number, damping = 16, mass = 0.8, stiffness = 140) =>
  t < at ? 0 : spring({ frame: (t - at) * FPS, fps: FPS, config: { damping, mass, stiffness } });
export const fadeIO = (t: number, a: number, b: number, c: number, d: number) => Math.min(lerp(t, a, b), 1 - lerp(t, c, d));
export const src = (p: string) => staticFile(p);

// ------------------------------------------------------------------ film + shots on a beat grid

export type ShotCtx = { t: number; B: (n: number) => number; dur: number };
export type ShotDef = { from: number; to: number; render: (c: ShotCtx) => React.ReactNode; name?: string };
export type SfxDef = { at: number; src: 'whoosh' | 'whip' | 'mouse-click' | 'switch' | 'ding' | 'page-turn' | 'snip' | 'pop' | 'key' | 'tick'; vol?: number };
export type FilmDef = { bpm: number; music: string; shots: ShotDef[]; sfx?: SfxDef[]; tail?: number };

export const spbOf = (f: FilmDef) => 60 / f.bpm;
export const framesOf = (f: FilmDef) => Math.ceil((Math.max(...f.shots.map((s) => s.to)) * spbOf(f) + (f.tail ?? 0)) * FPS);

const ShotBody: React.FC<{ spb: number; dur: number; render: ShotDef['render'] }> = ({ spb, dur, render }) => {
  const t = useCurrentFrame() / FPS;
  return <>{render({ t, B: (n: number) => n * spb, dur })}</>;
};

/** A film: shots placed on beats (they may overlap; later shots draw on top), music and effects. */
export const Film: React.FC<{ film: FilmDef }> = ({ film }) => {
  const spb = spbOf(film);
  const total = framesOf(film);
  return (
    <AbsoluteFill style={{ background: C.black, fontFamily: OUTFIT }}>
      {film.shots.map((s, i) => {
        const from = Math.round(s.from * spb * FPS);
        const isLast = s.to === Math.max(...film.shots.map((x) => x.to));
        const to = isLast ? total : Math.round(s.to * spb * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)} name={s.name ?? `shot ${i}`}>
            <ShotBody spb={spb} dur={(to - from) / FPS} render={s.render} />
          </Sequence>
        );
      })}
      <Audio src={src(film.music)} volume={(f) => interpolate(f, [0, 2, total - 20, total - 1], [0.9, 0.9, 0.9, 0], clamp)} />
      {(film.sfx ?? []).map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, Math.round(s.at * spb * FPS))} durationInFrames={50} name={`sfx ${s.src}`}>
          <Audio src={src(`sfx/${s.src}.wav`)} volume={s.vol ?? 0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ stages

export const Dark: React.FC<{ t: number; tint?: number }> = ({ t, tint = 1 }) => (
  <AbsoluteFill style={{ background: C.black, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: -300 + Math.sin(t * 0.35) * 80, top: -500, width: 1700, height: 1500, borderRadius: '50%', background: `radial-gradient(circle, rgba(70,48,190,${0.55 * tint}) 0%, rgba(40,26,110,${0.35 * tint}) 35%, transparent 68%)` }} />
    <div style={{ position: 'absolute', left: 900 + Math.cos(t * 0.3) * 60, top: 300, width: 1500, height: 1300, borderRadius: '50%', background: `radial-gradient(circle, rgba(30,22,80,${0.6 * tint}) 0%, transparent 65%)` }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.6) 100%)' }} />
  </AbsoluteFill>
);

export const Light: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: C.light, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 700 + Math.sin(t * 0.3) * 100, top: -700, width: 1600, height: 1400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,102,255,0.13) 0%, transparent 62%)' }} />
    <div style={{ position: 'absolute', left: -600, top: 500 + Math.cos(t * 0.25) * 80, width: 1400, height: 1200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 65%)' }} />
  </AbsoluteFill>
);

export const Violet: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, #6C51FF 0%, ${C.violet} 48%, ${C.violetDeep} 100%)` }} />
);

/** A quick exposure flash (white or the dark ink) for match cuts. */
export const Flash: React.FC<{ t: number; at: number; color?: string; dur?: number }> = ({ t, at, color = '#fff', dur = 0.35 }) => {
  const o = t < at ? 0 : Math.max(0, 1 - (t - at) / dur) ** 2;
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o }} /> : null;
};

// ------------------------------------------------------------------ type

type Tok = { w: string; kind: 'plain' | 'accent' | 'grey' | 'hl' | 'light' };
const MARK: Record<string, Tok['kind']> = { '*': 'accent', '~': 'grey', '^': 'hl', _: 'light' };
/** Words, with markup spans that may cover several words: "*Live in one link.*" */
const parse = (line: string): Tok[] => {
  let open: Tok['kind'] | null = null;
  return line.split(' ').filter(Boolean).map((raw) => {
    let w = raw;
    let kind: Tok['kind'] = open ?? 'plain';
    const lead = w.match(/^([“"‘(]*)([*~^_])/);
    if (!open && lead && MARK[lead[2]]) {
      kind = MARK[lead[2]];
      w = lead[1] + w.slice(lead[0].length);
      open = kind;
    }
    const m = w.match(/^(.*?)([*~^_])([.,!?’'”")]*)$/);
    if (open && m && MARK[m[2]] === open) {
      w = m[1] + m[3];
      open = null;
    }
    return { w, kind };
  });
};

/**
 * A headline that blurs in word by word. Lines split on "\n".
 * Markup: *accent* (colour), ~grey~ (shimmering grey, the "bad" word), ^highlight^ (violet marker sweep), _light_ (weight 300).
 */
export const Head: React.FC<{
  t: number;
  at: number;
  text: string;
  size: number;
  color?: string;
  accent?: string;
  step?: number;
  align?: 'left' | 'center';
  out?: number;
  hlAt?: number;
  weight?: number;
  lh?: number;
  style?: React.CSSProperties;
}> = ({ t, at, text, size, color = C.white, accent = C.red, step = 0.09, align = 'left', out, hlAt, weight = 700, lh = 1.04, style }) => {
  const lines = text.split('\n').map(parse);
  let k = 0;
  const q = out === undefined ? 0 : lerp(t, out, out + 0.32, 0, 1, INOUT);
  if (q >= 1) return null;
  return (
    <div style={{ fontFamily: OUTFIT, fontWeight: weight, fontSize: size, lineHeight: lh, letterSpacing: '-0.035em', color, textAlign: align, opacity: 1 - q, filter: q ? `blur(${q * 18}px)` : undefined, ...style }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', flexWrap: 'nowrap', gap: '0.24em', whiteSpace: 'nowrap' }}>
          {ln.map((tok) => {
            const i = k++;
            const p = lerp(t, at + i * step, at + i * step + 0.5, 0, 1, EXPO);
            const base: React.CSSProperties = { display: 'inline-block', opacity: p, filter: p < 1 ? `blur(${(1 - p) * 16}px)` : undefined, transform: `translateY(${(1 - p) * 0.28}em)` };
            if (tok.kind === 'accent') return <span key={i} style={{ ...base, color: accent }}>{tok.w}</span>;
            if (tok.kind === 'light') return <span key={i} style={{ ...base, fontWeight: 300 }}>{tok.w}</span>;
            if (tok.kind === 'grey')
              return (
                <span key={i} style={{ ...base, color: 'transparent', backgroundImage: `linear-gradient(100deg, ${color === C.white ? '#5E5E6E' : '#B5B5C0'} 20%, ${color === C.white ? '#C9C9D6' : '#E2E2EA'} 50%, ${color === C.white ? '#5E5E6E' : '#B5B5C0'} 80%)`, backgroundSize: '250% 100%', backgroundPosition: `${(-t * 60) % 250}% 0`, WebkitBackgroundClip: 'text', backgroundClip: 'text', filter: `blur(${(1 - p) * 16 + 1.2}px)` }}>
                  {tok.w}
                </span>
              );
            if (tok.kind === 'hl') {
              const h = hlAt === undefined ? 0 : lerp(t, hlAt + (i - k) * 0, hlAt + 0.45, 0, 1, EXPO);
              return (
                <span key={i} style={{ ...base, backgroundImage: `linear-gradient(${C.violet}, ${C.violet})`, backgroundRepeat: 'no-repeat', backgroundSize: `${h * 100}% 92%`, backgroundPosition: '0 60%', padding: '0 0.08em', margin: '0 -0.08em', color: h > 0.5 ? C.white : color }}>
                  {tok.w}
                </span>
              );
            }
            return <span key={i} style={base}>{tok.w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

/** One headline blurs away as the next blurs in (the reference's "lands in weeks" → "ships it before the room empties"). */
export const Swap: React.FC<{ t: number; at: number; swapAt: number; from: string; to: string; size: number; color?: string; accent?: string; align?: 'left' | 'center'; out?: number; hlAt?: number; style?: React.CSSProperties }> = ({ t, at, swapAt, from, to, size, color, accent, align, out, hlAt, style }) => (
  <div style={{ position: 'relative', ...style }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%' }}>
      <Head t={t} at={at} text={from} size={size} color={color} accent={accent} align={align} out={swapAt} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%' }}>
      <Head t={t} at={swapAt + 0.08} step={0.06} text={to} size={size} color={color} accent={accent} align={align} out={out} hlAt={hlAt} />
    </div>
  </div>
);

/** A typed label (letter by letter), used for UI-like text. */
export const Typed: React.FC<{ t: number; at: number; text: string; cps?: number; caret?: boolean; style?: React.CSSProperties }> = ({ t, at, text, cps = 30, caret = true, style }) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((t - at) * cps)));
  return (
    <span style={{ whiteSpace: 'pre', ...style }}>
      {text.slice(0, n)}
      {caret && t >= at && n < text.length + 8 ? <span style={{ opacity: Math.floor(t * 2.4) % 2 ? 0 : 1, borderRight: '0.06em solid currentColor', marginLeft: '0.03em' }} /> : null}
    </span>
  );
};

// ------------------------------------------------------------------ camera

export type CamKey = { t: number; x?: number; y?: number; s?: number; rx?: number; ry?: number; rz?: number; ease?: 'expo' | 'inout' | 'in' | 'linear' };
const easeOf = (e?: CamKey['ease']) => (e === 'inout' ? INOUT : e === 'in' ? INQ : e === 'linear' ? (x: number) => x : EXPO);

export const camAt = (t: number, keys: CamKey[]) => {
  const v = { x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0 };
  const props: (keyof typeof v)[] = ['x', 'y', 's', 'rx', 'ry', 'rz'];
  const t0 = Math.min(...keys.map((k) => k.t));
  for (const p of props) {
    let ks = keys.filter((k) => k[p] !== undefined);
    if (!ks.length) continue;
    // a value first set on a later key starts from neutral at the first key
    if (ks[0].t > t0) ks = [{ t: t0, [p]: v[p] } as CamKey, ...ks];
    if (t <= ks[0].t) v[p] = ks[0][p] as number;
    else if (t >= ks[ks.length - 1].t) v[p] = ks[ks.length - 1][p] as number;
    else
      for (let i = 0; i < ks.length - 1; i++)
        if (t >= ks[i].t && t <= ks[i + 1].t) {
          const e = easeOf(ks[i + 1].ease);
          v[p] = interpolate(t, [ks[i].t, ks[i + 1].t], [ks[i][p] as number, ks[i + 1][p] as number], { ...clamp, easing: e });
        }
  }
  return v;
};

/** Camera values that put screen point (px, py) at the centre, zoomed by s. */
export const focus = (px: number, py: number, s: number) => ({ x: -(px - W / 2) * s, y: -(py - H / 2) * s, s });

/** A full-frame layer moved by a keyframed 3D camera. `blur` adds depth-of-field blur to the whole layer. */
export const Cam: React.FC<{ t: number; keys: CamKey[]; children: React.ReactNode; blur?: number; perspective?: number }> = ({ t, keys, children, blur = 0, perspective = 2400 }) => {
  const c = camAt(t, keys);
  return (
    <AbsoluteFill style={{ perspective, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${c.x}px, ${c.y}px) scale(${c.s}) rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz}deg)`, transformOrigin: '50% 50%', filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ real media

/** An image or video, sized to w x h. */
export const Media: React.FC<{ file: string; w: number; h: number; fit?: 'cover' | 'contain' | 'fill'; pos?: string; from?: number; rate?: number; style?: React.CSSProperties }> = ({ file, w, h, fit = 'cover', pos = '50% 50%', from = 0, rate = 1, style }) => {
  const st: React.CSSProperties = { width: w, height: h, objectFit: fit, objectPosition: pos, display: 'block', ...style };
  return /\.(mp4|webm|mov)$/i.test(file) ? <OffthreadVideo src={src(file)} muted trimBefore={Math.round(from * FPS)} playbackRate={rate} style={st} /> : <Img src={src(file)} style={st} />;
};

export type Rect = [number, number, number, number];
const mixRect = (a: Rect, b: Rect, p: number): Rect => a.map((v, i) => v + (b[i] - v) * p) as Rect;

/**
 * A rectangle `rect` of a source (sw x sh pixels) shown in the screen box `box`.
 * Pass `to`/`toBox` and `p` to animate (crop → uncrop, push-in on a detail, ...).
 */
export const Region: React.FC<{
  file: string;
  sw: number;
  sh: number;
  rect: Rect;
  box: Rect;
  toRect?: Rect;
  toBox?: Rect;
  p?: number;
  from?: number;
  rate?: number;
  radius?: number;
  shadow?: string;
  filter?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ file, sw, sh, rect, box, toRect, toBox, p = 0, from, rate, radius = 0, shadow, filter, style, children }) => {
  const r = toRect ? mixRect(rect, toRect, p) : rect;
  const b = toBox ? mixRect(box, toBox, p) : box;
  const kx = b[2] / r[2];
  const ky = b[3] / r[3];
  return (
    <div style={{ position: 'absolute', left: b[0], top: b[1], width: b[2], height: b[3], overflow: 'hidden', borderRadius: radius, boxShadow: shadow, ...style }}>
      <div style={{ position: 'absolute', left: -r[0] * kx, top: -r[1] * ky, width: sw * kx, height: sh * ky, filter }}>
        <Media file={file} w={sw * kx} h={sh * ky} fit="fill" from={from} rate={rate} />
      </div>
      {children}
    </div>
  );
};

export const SHADOW = '0 2px 6px rgba(16,16,22,0.06), 0 30px 80px rgba(16,16,22,0.18)';
export const SHADOW_DEEP = '0 4px 10px rgba(0,0,0,0.25), 0 50px 120px rgba(0,0,0,0.45)';

/**
 * Depth of field: the whole source shown in `box`, out of focus and dimmed, while `el` (a rectangle of the same
 * source) lifts off it, sharp, scaled by `lift` around its own centre and moved by (dx, dy).
 */
export const Lift: React.FC<{ file: string; sw: number; sh: number; box: Rect; el: Rect; p: number; scale?: number; dx?: number; dy?: number; blur?: number; dim?: number; from?: number; radius?: number; baseRadius?: number }> = ({ file, sw, sh, box, el, p, scale = 1.25, dx = 0, dy = 0, blur = 6, dim = 0.12, from, radius = 16, baseRadius = 18 }) => {
  const k = box[2] / sw;
  const eb: Rect = [box[0] + el[0] * k, box[1] + el[1] * k, el[2] * k, el[3] * k];
  const cx = eb[0] + eb[2] / 2;
  const cy = eb[1] + eb[3] / 2;
  const s = 1 + (scale - 1) * p;
  return (
    <>
      <Region file={file} sw={sw} sh={sh} rect={[0, 0, sw, sh]} box={box} from={from} radius={baseRadius} filter={`blur(${blur * p}px) brightness(${1 - dim * p})`} shadow={SHADOW} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${dx * p}px, ${dy * p}px)` }}>
        <div style={{ position: 'absolute', left: cx - (eb[2] * s) / 2, top: cy - (eb[3] * s) / 2, width: eb[2] * s, height: eb[3] * s }}>
          <Region file={file} sw={sw} sh={sh} rect={el} box={[0, 0, eb[2] * s, eb[3] * s]} from={from} radius={radius} shadow={p > 0.02 ? `0 ${6 * p}px ${14 * p}px rgba(16,16,22,${0.08 * p}), 0 ${50 * p}px ${110 * p}px rgba(16,16,22,${0.28 * p})` : undefined} />
        </div>
      </div>
    </>
  );
};

/** A circle that opens from (cx, cy): the reference's LIVE dot becoming the footage. */
export const Iris: React.FC<{ cx: number; cy: number; r: number; children: React.ReactNode }> = ({ cx, cy, r, children }) => (
  <AbsoluteFill style={{ clipPath: `circle(${Math.max(0, r)}px at ${cx}px ${cy}px)` }}>{children}</AbsoluteFill>
);

/** A framed card in 3D (footage, reels, screenshots). */
export const Card: React.FC<{ x: number; y: number; w: number; h: number; rx?: number; ry?: number; rz?: number; s?: number; radius?: number; shadow?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, rx = 0, ry = 0, rz = 0, s = 1, radius = 18, shadow = SHADOW_DEEP, children, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, perspective: 2000 }}>
    <div style={{ width: w, height: h, borderRadius: radius, overflow: 'hidden', boxShadow: shadow, transform: `scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, transformOrigin: '50% 50%', ...style }}>{children}</div>
  </div>
);

// ------------------------------------------------------------------ pills and badges

export const LiveBadge: React.FC<{ size?: number; glow?: number; label?: string; color?: string }> = ({ size = 1, glow = 0, label = 'LIVE', color = C.red }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 * size, background: color, color: '#fff', borderRadius: 9 * size, padding: `${6 * size}px ${14 * size}px`, fontFamily: OUTFIT, fontWeight: 700, fontSize: 22 * size, letterSpacing: '0.12em', boxShadow: glow ? `0 0 ${40 * glow * size}px rgba(232,20,27,${0.55 * glow})` : undefined, whiteSpace: 'nowrap' }}>
    <span style={{ width: 11 * size, height: 11 * size, borderRadius: '50%', background: '#fff' }} />
    {label}
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; size?: number; bg?: string; color?: string; style?: React.CSSProperties }> = ({ children, size = 1, bg = 'rgba(255,255,255,0.86)', color = C.ink, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 * size, background: bg, color, borderRadius: 999, padding: `${16 * size}px ${34 * size}px`, fontFamily: OUTFIT, fontWeight: 600, fontSize: 46 * size, letterSpacing: '-0.01em', boxShadow: '0 10px 40px rgba(16,16,22,0.15)', whiteSpace: 'nowrap', ...style }}>
    {children}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; tone?: 'violet' | 'grey' | 'green' | 'red'; size?: number; style?: React.CSSProperties }> = ({ children, tone = 'grey', size = 1, style }) => {
  const tones = { violet: [C.violet50, C.violet], grey: ['#EDEDF1', '#4A4A57'], green: [C.green50, C.green], red: ['#FDE8E8', C.red] };
  const [bg, fg] = tones[tone];
  return <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 * size, background: bg, color: fg, borderRadius: 999, padding: `${8 * size}px ${18 * size}px`, fontFamily: OUTFIT, fontWeight: 600, fontSize: 26 * size, letterSpacing: '0.04em', whiteSpace: 'nowrap', ...style }}>{children}</div>;
};

export const Check: React.FC<{ size: number; color?: string }> = ({ size, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/** A pill-in that pops (scale + blur) at `at`. */
export const Pop: React.FC<{ t: number; at: number; children: React.ReactNode; out?: number; from?: number; style?: React.CSSProperties }> = ({ t, at, children, out, from = 0.6, style }) => {
  const p = spr(t, at, 13, 0.7, 170);
  const q = out === undefined ? 0 : lerp(t, out, out + 0.25, 0, 1, INOUT);
  if (t < at - 0.01 || q >= 1) return null;
  return <div style={{ opacity: Math.min(1, p * 1.6) * (1 - q), transform: `scale(${from + (1 - from) * p - q * 0.08})`, filter: p < 0.98 || q ? `blur(${(1 - Math.min(1, p)) * 10 + q * 10}px)` : undefined, ...style }}>{children}</div>;
};

/** The reel card: a real RecapHub vertical clip (captions burnt in by RecapHub). */
export const Reel: React.FC<{ file: string; w: number; from?: number; rate?: number; radius?: number; style?: React.CSSProperties }> = ({ file, w, from = 0, rate = 1, radius = 22, style }) => (
  <div style={{ width: w, height: (w * 16) / 9, borderRadius: radius, overflow: 'hidden', boxShadow: SHADOW_DEEP, background: '#000', ...style }}>
    <Media file={file} w={w} h={(w * 16) / 9} from={from} rate={rate} />
  </div>
);

// ------------------------------------------------------------------ end card

/** The reference's end card: full violet, the real white logo, "by EventLabs", the CTA and RECAPHUB.CO. */
export const EndCard: React.FC<{ t: number; line?: string; cta?: boolean }> = ({ t, line, cta = true }) => {
  const p = lerp(t, 0, 0.7, 0, 1, EXPO);
  const q = lerp(t, 0.35, 0.95);
  const r = lerp(t, 0.7, 1.3);
  return (
    <AbsoluteFill>
      <Violet />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ opacity: p, transform: `scale(${0.92 + 0.08 * p})`, filter: `blur(${(1 - p) * 14}px)`, position: 'relative', marginTop: -40 }}>
          <Img src={src('brand/recaphub-logo-white.svg')} style={{ width: 640, display: 'block' }} />
          <div style={{ position: 'absolute', right: 10, top: 182, fontFamily: OUTFIT, fontWeight: 500, fontSize: 30, color: 'rgba(255,255,255,0.92)', opacity: q, letterSpacing: '-0.01em' }}>
            by <span style={{ fontWeight: 700 }}>EventLabs</span>
          </div>
        </div>
        {line ? (
          <div style={{ marginTop: 92, fontFamily: OUTFIT, fontWeight: 500, fontSize: 44, color: '#fff', opacity: q, transform: `translateY(${(1 - q) * 16}px)`, letterSpacing: '-0.015em' }}>{line}</div>
        ) : null}
        {cta ? (
          <div style={{ marginTop: line ? 46 : 110, display: 'flex', alignItems: 'center', gap: 36, opacity: r, transform: `translateY(${(1 - r) * 16}px)` }}>
            <div style={{ background: '#fff', color: C.violet, borderRadius: 999, padding: '18px 40px', fontFamily: OUTFIT, fontWeight: 700, fontSize: 34 }}>Book a demo</div>
            <div style={{ fontFamily: OUTFIT, fontWeight: 600, fontSize: 26, letterSpacing: '0.32em', color: '#fff' }}>RECAPHUB.CO</div>
          </div>
        ) : (
          <div style={{ marginTop: 90, fontFamily: OUTFIT, fontWeight: 600, fontSize: 26, letterSpacing: '0.32em', color: '#fff', opacity: r }}>RECAPHUB.CO</div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A small eyebrow label (reference: "MAIN STAGE" next to the LIVE badge). */
export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = C.grey, size = 1, style }) => (
  <div style={{ fontFamily: OUTFIT, fontWeight: 600, fontSize: 20 * size, letterSpacing: '0.18em', textTransform: 'uppercase', color, ...style }}>{children}</div>
);
