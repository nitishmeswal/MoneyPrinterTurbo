/* The Flayel look: a warm cream stage, a persistent bird badge, the shiny-bird
 * sting that plays at a video's turning point, and shared building blocks. */
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, GRADIENT, MONO, SANS } from './brand';

/** Tones for text and UI on the cream stage (kept under the old name so every scene picks them up). */
export const INK = {
  bg0: '#f6f3ec',
  bg1: '#fbf8f2',
  text: C.text,
  muted: '#6b7a90',
  accent: C.accent,
  track: 'rgba(19,35,59,0.08)',
};

export const TEXT_GRADIENT = GRADIENT;

export const CARD_SHADOW = '0 2px 6px rgba(19,35,59,0.06), 0 28px 70px rgba(19,35,59,0.14)';

const MARK = () => staticFile('flayel-mark.png');
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={MARK()} style={{ width: size, height: size, objectFit: 'contain', filter: 'drop-shadow(0 12px 24px rgba(19,35,59,0.22))', ...style }} />
);

const birdMask = (): React.CSSProperties => ({
  WebkitMaskImage: `url(${MARK()})`,
  maskImage: `url(${MARK()})`,
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
});

// A tiny tileable paper grain, so the cream reads as a surface, not a flat fill.
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.07  0 0 0 0 0.13  0 0 0 0 0.23  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

/** Warm cream stage: paper grain, a slow dot grid, and soft brand light drifting behind. */
export const Backdrop: React.FC<{ offset?: number }> = ({ offset = 0 }) => {
  const frame = useCurrentFrame() + offset;
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(172deg, ${INK.bg1} 0%, ${C.bg} 55%, #efe8da 100%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 1250, height: 1250, borderRadius: '50%', left: -520 + Math.sin(t * 0.35) * 90, top: -420 + Math.cos(t * 0.3) * 80, background: 'radial-gradient(circle, rgba(58,159,240,0.16), transparent 64%)' }} />
      <div style={{ position: 'absolute', width: 1150, height: 1150, borderRadius: '50%', right: -520 + Math.cos(t * 0.33) * 90, bottom: -380 + Math.sin(t * 0.27) * 80, background: 'radial-gradient(circle, rgba(192,138,43,0.15), transparent 64%)' }} />
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(19,35,59,0.075) 2.2px, transparent 2.6px)', backgroundSize: '44px 44px', backgroundPosition: `${(t * 6) % 44}px ${(t * 10) % 44}px`, opacity: 0.9 }} />
      <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: 0.35, mixBlendMode: 'multiply' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, transparent 58%, rgba(120,96,60,0.12) 100%)' }} />
    </AbsoluteFill>
  );
};

/** The bird badge that stays on screen so every frame says "Flayel". */
export const BrandBug: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const show = interpolate(frame, [6, 18], [0, 1], clamp);
  return (
    <div style={{ position: 'absolute', left: 54, top: 58, display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(show, opacity) }}>
      <Logo size={96} style={{ transform: `translateY(${Math.sin(t * 2.1) * 5}px) rotate(${Math.sin(t * 1.4) * 4}deg)` }} />
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, letterSpacing: '0.32em', color: C.text }}>FLAYEL</div>
    </div>
  );
};

export const FLASH_FRAMES = 58;

/** The shiny-bird sting: the bird bursts in big with light rays and a chrome
 * sweep, holds a beat, then flies into the corner and becomes the badge. */
export const BirdFlash: React.FC = () => {
  const f = useCurrentFrame();
  const veil = interpolate(f, [0, 6, 38, 52], [0, 0.93, 0.93, 0], clamp);
  const inP = spring({ frame: f, fps: 30, config: { damping: 11, mass: 0.75 } });
  const fly = interpolate(f, [38, 55], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const size = interpolate(fly, [0, 1], [620, 96]) * (0.35 + inP * 0.65);
  const cx = interpolate(fly, [0, 1], [540, 102]);
  const cy = interpolate(fly, [0, 1], [860, 106]) + Math.sin(f / 5) * 10 * (1 - fly);
  const rot = (1 - inP) * -35 + Math.sin(f / 7) * 3 * (1 - fly);
  const sweep = interpolate(f, [10, 34], [-0.5, 1.5], clamp);
  const rays = interpolate(f, [0, 8, 34, 44], [0, 1, 1, 0], clamp);
  const ring = (delay: number) => {
    const p = interpolate(f, [delay, delay + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    return p <= 0 || p >= 1 ? null : (
      <div style={{ position: 'absolute', left: 540 - 520 * p, top: 860 - 520 * p, width: 1040 * p, height: 1040 * p, borderRadius: '50%', border: `${12 * (1 - p) + 1}px solid ${delay ? C.gold : C.blue}`, opacity: (1 - p) * 0.8 }} />
    );
  };
  const box: React.CSSProperties = { position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, transform: `rotate(${rot}deg)` };
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(255,255,255,${veil}) 0%, rgba(250,246,238,${veil * 0.95}) 50%, rgba(236,226,206,${veil * 0.93}) 100%)`, backdropFilter: `blur(${veil * 14}px)` }} />
      <div style={{ position: 'absolute', left: 540 - 1100, top: 860 - 1100, width: 2200, height: 2200, borderRadius: '50%', opacity: rays * 0.55, transform: `rotate(${f * 1.4}deg)`, background: 'repeating-conic-gradient(from 0deg, rgba(58,159,240,0.28) 0deg 6deg, transparent 6deg 18deg, rgba(192,138,43,0.24) 18deg 24deg, transparent 24deg 36deg)', WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 62%)', maskImage: 'radial-gradient(circle, black 0%, transparent 62%)' }} />
      <div style={{ position: 'absolute', left: cx - size * 0.9, top: cy - size * 0.9, width: size * 1.8, height: size * 1.8, borderRadius: '50%', background: 'radial-gradient(circle, rgba(58,159,240,0.45) 0%, rgba(192,138,43,0.25) 40%, transparent 68%)', opacity: veil, filter: 'blur(20px)' }} />
      {ring(1)}
      {ring(7)}
      <Img src={MARK()} style={{ ...box, objectFit: 'contain', filter: 'drop-shadow(0 30px 50px rgba(19,35,59,0.35)) saturate(1.15) contrast(1.08)' }} />
      {/* Chrome sweep, clipped to the bird */}
      <div style={{ ...box, ...birdMask() }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${sweep * 100 - 14}%, rgba(255,255,255,0.95) ${sweep * 100}%, rgba(166,220,255,0.6) ${sweep * 100 + 5}%, transparent ${sweep * 100 + 16}%)` }} />
      </div>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        const r = 300 + (i % 3) * 70;
        const tw = Math.max(0, Math.sin((f - i * 3) / 4));
        const vis = interpolate(f, [4 + i, 12 + i, 34, 42], [0, 1, 1, 0], clamp);
        return (
          <div key={i} style={{ position: 'absolute', left: 540 + Math.cos(a) * r - 14, top: 860 + Math.sin(a) * r - 14, width: 28, height: 28, opacity: vis * tw, transform: `rotate(45deg) scale(${0.5 + tw * 0.7})`, background: i % 2 ? C.gold : C.blue, clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)' }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Scene content area: below the badge, above the captions, centred by default. */
export const Stage: React.FC<{ children: React.ReactNode; align?: 'center' | 'top' }> = ({ children, align = 'center' }) => (
  <AbsoluteFill
    style={{
      padding: '200px 80px 620px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: align === 'top' ? 'flex-start' : 'center',
      fontFamily: SANS,
      color: INK.text,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = INK.muted }) => (
  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.26em', textTransform: 'uppercase', color, textAlign: 'center' }}>{children}</div>
);

export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 28, boxShadow: CARD_SHADOW, ...style }}>{children}</div>
);

export { GRADIENT };
