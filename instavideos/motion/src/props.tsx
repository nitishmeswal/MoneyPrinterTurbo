/* Props drawn in code: playing cards, the Capsule World creatures (original IP),
 * capsules, boxes, an egg, cups, an envelope, and the instruction panel the
 * designed shorts share. */
import React from 'react';
import { Look } from './accounts';
import { SAFE, lerp, spr } from './kit';

// ------------------------------------------------------------------ cards

const SUIT: Record<string, { g: string; red: boolean }> = { S: { g: '♠', red: false }, H: { g: '♥', red: true }, D: { g: '♦', red: true }, C: { g: '♣', red: false } };

export const Card: React.FC<{ code: string; w?: number; flip?: number; back?: string; glow?: number }> = ({ code, w = 200, flip = 0, back = '#8B1E2D', glow = 0 }) => {
  const h = w * 1.4;
  const rank = code.slice(0, -1);
  const s = SUIT[code.slice(-1)];
  const sx = Math.abs(Math.cos(flip * Math.PI));
  const face = flip < 0.5;
  const ink = s.red ? '#C0392B' : '#1C1C1C';
  return (
    <div style={{ width: w, height: h, transform: `scaleX(${Math.max(0.02, sx)})`, borderRadius: w * 0.08, background: face ? '#FBF7EE' : back, boxShadow: `0 ${w * 0.06}px ${w * 0.16}px rgba(0,0,0,0.45), 0 0 ${60 * glow}px rgba(233,196,106,${0.8 * glow})`, border: face ? '2px solid rgba(0,0,0,0.12)' : `${w * 0.035}px solid #F6EEDC`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      {face ? (
        <>
          <div style={{ position: 'absolute', left: w * 0.08, top: w * 0.05, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: w * 0.22, color: ink, lineHeight: 1, textAlign: 'center' }}>
            {rank}
            <div style={{ fontSize: w * 0.18 }}>{s.g}</div>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: w * (['K', 'Q', 'J', 'A'].includes(rank) ? 0.5 : 0.42), color: ink, fontFamily: 'Georgia, serif', fontWeight: 700 }}>
            {['K', 'Q', 'J'].includes(rank) ? <span style={{ fontSize: w * 0.46 }}>{rank}{s.g}</span> : s.g}
          </div>
          <div style={{ position: 'absolute', right: w * 0.08, bottom: w * 0.05, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: w * 0.22, color: ink, lineHeight: 1, transform: 'rotate(180deg)', textAlign: 'center' }}>
            {rank}
            <div style={{ fontSize: w * 0.18 }}>{s.g}</div>
          </div>
        </>
      ) : (
        <div style={{ position: 'absolute', inset: w * 0.06, borderRadius: w * 0.05, background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 ${w * 0.04}px, transparent ${w * 0.04}px ${w * 0.08}px)`, border: '2px solid rgba(255,255,255,0.35)' }} />
      )}
    </div>
  );
};

// ------------------------------------------------------------------ creatures

export type Cre = { name: string; tier: string; t: number; body: string; eyes: number; mouth: string; acc: string; pattern: string; seed: number };
export const TIER_COLOR = ['#9AA5B8', '#4FC3F7', '#B388FF', '#FF6FB5', '#FFD54F'];

const prng = (seed: number) => {
  let s = seed % 2147483647;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

export const Creature: React.FC<{ c: Cre; size: number; f: number; bounce?: number }> = ({ c, size, f, bounce = 0 }) => {
  const r = prng(c.seed);
  const ph = [r() * 6, r() * 6, r() * 6];
  const pts: string[] = [];
  const R = size * 0.36;
  for (let k = 0; k < 36; k++) {
    const a = (k / 36) * Math.PI * 2;
    const rr = R * (1 + 0.05 * Math.sin(3 * a + ph[0]) + 0.04 * Math.sin(5 * a + ph[1]) + 0.03 * Math.sin(2 * a + ph[2] + f / 20));
    pts.push(`${(Math.cos(a) * rr * 1.06).toFixed(1)},${(Math.sin(a) * rr * 0.96 + R * 0.05).toFixed(1)}`);
  }
  const squash = 1 + 0.04 * Math.sin(f / 9) + 0.12 * bounce;
  const eyeY = -R * 0.12;
  const eyes = c.eyes === 1 ? [0] : c.eyes === 2 ? [-0.33, 0.33] : [-0.45, 0, 0.45];
  const blink = (f + c.seed) % 170 < 6 ? 0.15 : 1;
  const aura = TIER_COLOR[c.t];
  const dark = c.body === '#2B2140';
  return (
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{ overflow: 'visible' }}>
      {c.t >= 1 ? <circle r={R * (1.45 + 0.05 * Math.sin(f / 12))} fill={aura} opacity={0.12 + 0.05 * c.t} /> : null}
      {c.t >= 3
        ? Array.from({ length: 12 }, (_, k) => {
            const a = (k / 12) * Math.PI * 2 + f / 90;
            return <path key={k} d={`M ${Math.cos(a) * R * 1.2} ${Math.sin(a) * R * 1.2} L ${Math.cos(a + 0.12) * R * 2} ${Math.sin(a + 0.12) * R * 2} L ${Math.cos(a - 0.12) * R * 2} ${Math.sin(a - 0.12) * R * 2} Z`} fill={aura} opacity={0.22} />;
          })
        : null}
      <g transform={`scale(${1 / squash} ${squash})`}>
        {c.acc === 'wings'
          ? [-1, 1].map((s) => <ellipse key={s} cx={s * R * 0.95} cy={-R * 0.15} rx={R * 0.45} ry={R * 0.25} transform={`rotate(${s * -25 + Math.sin(f / 5) * 10 * s} ${s * R * 0.95} ${-R * 0.15})`} fill="#ffffff" opacity={0.85} />)
          : null}
        {c.acc === 'ears' ? [-1, 1].map((s) => <ellipse key={s} cx={s * R * 0.55} cy={-R * 0.85} rx={R * 0.22} ry={R * 0.32} fill={c.body} stroke="rgba(0,0,0,0.15)" strokeWidth={3} />) : null}
        {c.acc === 'horns' ? [-1, 1].map((s) => <path key={s} d={`M ${s * R * 0.35} ${-R * 0.75} Q ${s * R * 0.55} ${-R * 1.25} ${s * R * 0.2} ${-R * 1.2} Z`} fill="#FFF3D6" stroke="rgba(0,0,0,0.2)" strokeWidth={3} />) : null}
        {c.acc === 'antenna' ? (
          <>
            <path d={`M 0 ${-R * 0.85} Q ${R * 0.2} ${-R * 1.25} ${R * 0.05} ${-R * 1.4}`} stroke="#333" strokeWidth={4} fill="none" />
            <circle cx={R * 0.05} cy={-R * 1.42} r={R * 0.1} fill={aura} />
          </>
        ) : null}
        {c.acc === 'sprout' ? <path d={`M 0 ${-R * 0.85} q ${-R * 0.35} ${-R * 0.35} ${-R * 0.05} ${-R * 0.55} q ${R * 0.35} ${R * 0.05} ${R * 0.05} ${R * 0.55}`} fill="#5BD27A" /> : null}
        <polygon points={pts.join(' ')} fill={c.body} stroke="rgba(0,0,0,0.18)" strokeWidth={4} />
        {c.pattern === 'belly' ? <ellipse cx={0} cy={R * 0.35} rx={R * 0.55} ry={R * 0.4} fill="#ffffff" opacity={0.45} /> : null}
        {c.pattern === 'spots' ? [[-0.5, 0.3], [0.45, 0.45], [0.1, 0.6], [-0.2, -0.55]].map(([x, y], k) => <circle key={k} cx={x * R} cy={y * R} r={R * 0.09} fill="rgba(0,0,0,0.12)" />) : null}
        {c.pattern === 'stripes' ? [-0.3, 0, 0.3].map((x, k) => <rect key={k} x={x * R - R * 0.05} y={-R * 0.95} width={R * 0.1} height={R * 0.35} rx={R * 0.05} fill="rgba(0,0,0,0.13)" />) : null}
        <ellipse cx={-R * 0.4} cy={-R * 0.45} rx={R * 0.22} ry={R * 0.12} fill="#ffffff" opacity={0.35} transform={`rotate(-30 ${-R * 0.4} ${-R * 0.45})`} />
        {eyes.map((x, k) => (
          <g key={k} transform={`translate(${x * R} ${eyeY})`}>
            <ellipse rx={R * 0.13} ry={R * 0.16 * blink} fill={dark ? '#FFE07A' : '#1E1A2B'} />
            <circle cx={R * 0.04} cy={-R * 0.05} r={R * 0.045 * blink} fill="#ffffff" />
          </g>
        ))}
        {c.mouth === 'smile' ? <path d={`M ${-R * 0.18} ${R * 0.18} Q 0 ${R * 0.36} ${R * 0.18} ${R * 0.18}`} stroke={dark ? '#FFE07A' : '#1E1A2B'} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
        {c.mouth === 'o' ? <ellipse cx={0} cy={R * 0.24} rx={R * 0.08} ry={R * 0.1} fill={dark ? '#FFE07A' : '#1E1A2B'} /> : null}
        {c.mouth === 'fang' ? (
          <>
            <path d={`M ${-R * 0.2} ${R * 0.18} Q 0 ${R * 0.3} ${R * 0.2} ${R * 0.18}`} stroke="#1E1A2B" strokeWidth={5} fill="none" strokeLinecap="round" />
            <path d={`M ${R * 0.06} ${R * 0.24} l ${R * 0.05} ${R * 0.1} l ${R * 0.05} ${-R * 0.09} Z`} fill="#fff" />
          </>
        ) : null}
        {c.mouth === 'cat' ? <path d={`M ${-R * 0.18} ${R * 0.2} q ${R * 0.09} ${R * 0.12} ${R * 0.18} 0 q ${R * 0.09} ${R * 0.12} ${R * 0.18} 0`} stroke={dark ? '#FFE07A' : '#1E1A2B'} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
        {[-1, 1].map((s) => <ellipse key={s} cx={s * R * 0.58} cy={R * 0.12} rx={R * 0.12} ry={R * 0.07} fill="#FF7FA8" opacity={0.45} />)}
        {c.acc === 'crown' ? <path d={`M ${-R * 0.42} ${-R * 0.82} L ${-R * 0.42} ${-R * 1.22} L ${-R * 0.21} ${-R * 1.02} L 0 ${-R * 1.3} L ${R * 0.21} ${-R * 1.02} L ${R * 0.42} ${-R * 1.22} L ${R * 0.42} ${-R * 0.82} Z`} fill="#FFD54F" stroke="#C99A00" strokeWidth={4} /> : null}
        {c.acc === 'halo' ? <ellipse cx={0} cy={-R * 1.18} rx={R * 0.5} ry={R * 0.13} fill="none" stroke="#FFE78A" strokeWidth={9} opacity={0.95} /> : null}
      </g>
    </svg>
  );
};

export const TierTag: React.FC<{ c: Cre; look: Look; scale?: number }> = ({ c, look, scale = 1 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 * scale }}>
    <div style={{ padding: `${6 * scale}px ${18 * scale}px`, borderRadius: 99, background: TIER_COLOR[c.t], color: '#1A1530', fontFamily: look.body, fontWeight: 700, fontSize: 26 * scale, letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: `0 0 ${24 * scale}px ${TIER_COLOR[c.t]}` }}>{c.tier}</div>
    <div style={{ fontFamily: look.body, fontWeight: 700, fontSize: 40 * scale, color: look.ink }}>{c.name}</div>
  </div>
);

// ------------------------------------------------------------------ capsules, boxes, egg, cups, envelope

export const Capsule: React.FC<{ size: number; color: string; open?: number; shake?: number; f: number }> = ({ size, color, open = 0, shake = 0, f }) => {
  const r = size / 2;
  const wob = shake * Math.sin(f * 1.7) * 8;
  return (
    <svg width={size} height={size * 1.3} viewBox={`${-r} ${-r * 1.3} ${size} ${size * 1.3}`} style={{ overflow: 'visible', transform: `rotate(${wob}deg)` }}>
      <ellipse cx={0} cy={r * 1.0} rx={r * 0.8} ry={r * 0.16} fill="rgba(0,0,0,0.3)" />
      <g transform={`translate(0 ${-open * r * 1.1}) rotate(${-open * 35} ${-r} 0)`} opacity={1 - Math.max(0, open - 0.6) * 2.5}>
        <path d={`M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0 Z`} fill={color} />
        <ellipse cx={-r * 0.35} cy={-r * 0.55} rx={r * 0.22} ry={r * 0.12} fill="#fff" opacity={0.55} transform={`rotate(-30 ${-r * 0.35} ${-r * 0.55})`} />
      </g>
      <g opacity={1 - Math.max(0, open - 0.6) * 2.5}>
        <path d={`M ${-r} 0 A ${r} ${r} 0 0 0 ${r} 0 Z`} fill="#F6F2FF" />
        <rect x={-r} y={-r * 0.06} width={size} height={r * 0.12} fill="rgba(0,0,0,0.12)" />
      </g>
    </svg>
  );
};

export const GiftBox: React.FC<{ size: number; color: string; ribbon: string; open?: number; shake?: number; f: number; label?: string }> = ({ size, color, ribbon, open = 0, shake = 0, f, label }) => {
  const wob = shake * Math.sin(f * 1.3) * 6;
  return (
    <div style={{ position: 'relative', width: size, height: size, transform: `rotate(${wob}deg)` }}>
      <div style={{ position: 'absolute', left: 0, top: size * 0.3, width: size, height: size * 0.7, background: color, borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.35), inset 0 -18px 0 rgba(0,0,0,0.12)' }} />
      <div style={{ position: 'absolute', left: size * 0.42, top: size * 0.3, width: size * 0.16, height: size * 0.7, background: ribbon }} />
      <div style={{ position: 'absolute', left: -size * 0.05, top: size * 0.12 - open * size * 0.7, width: size * 1.1, height: size * 0.22, background: color, borderRadius: 12, transform: `rotate(${-open * 28}deg)`, transformOrigin: '0% 100%', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.1)', opacity: 1 - Math.max(0, open - 0.7) * 3 }}>
        <div style={{ position: 'absolute', left: size * 0.47, top: 0, width: size * 0.16, height: '100%', background: ribbon }} />
      </div>
      {label ? <div style={{ position: 'absolute', left: 0, width: size, top: size * 0.52, textAlign: 'center', fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: size * 0.24, color: 'rgba(255,255,255,0.92)', textShadow: '0 3px 10px rgba(0,0,0,0.4)' }}>{label}</div> : null}
    </div>
  );
};

export const Egg: React.FC<{ size: number; cracks: number; shake: number; f: number; hatch: number }> = ({ size, cracks, shake, f, hatch }) => {
  const w = size * 0.78;
  const h = size;
  const wob = shake * Math.sin(f * 1.9) * 9;
  const crackPaths = [
    `M ${-w * 0.2} ${-h * 0.05} l ${w * 0.08} ${h * 0.06} l ${w * 0.06} ${-h * 0.07} l ${w * 0.07} ${h * 0.05}`,
    `M ${w * 0.05} ${h * 0.12} l ${w * 0.1} ${-h * 0.05} l ${w * 0.05} ${h * 0.07} l ${w * 0.1} ${-h * 0.06}`,
    `M ${-w * 0.38} ${h * 0.02} l ${w * 0.12} ${h * 0.04} l ${w * 0.06} ${-h * 0.05} l ${w * 0.14} ${h * 0.05} l ${w * 0.1} ${-h * 0.04} l ${w * 0.12} ${h * 0.05} l ${w * 0.12} ${-h * 0.04}`,
  ];
  return (
    <svg width={size} height={size * 1.2} viewBox={`${-size / 2} ${-size * 0.6} ${size} ${size * 1.2}`} style={{ overflow: 'visible', transform: `rotate(${wob}deg)` }}>
      <ellipse cx={0} cy={h * 0.52} rx={w * 0.55} ry={h * 0.06} fill="rgba(0,0,0,0.3)" />
      <g transform={`translate(0 ${-hatch * h * 0.6}) rotate(${-hatch * 40})`} opacity={1 - hatch}>
        <path d={`M ${-w / 2} 0 C ${-w / 2} ${-h * 0.6} ${w / 2} ${-h * 0.6} ${w / 2} 0 Z`} fill="#FFF4DE" />
      </g>
      <path d={`M ${-w / 2} 0 C ${-w / 2} ${h * 0.62} ${w / 2} ${h * 0.62} ${w / 2} 0 Z`} fill="#FFF4DE" opacity={1 - hatch * 0.6} />
      {hatch === 0 ? <path d={`M ${-w / 2} 0 C ${-w / 2} ${-h * 0.6} ${w / 2} ${-h * 0.6} ${w / 2} 0 C ${w / 2} ${h * 0.62} ${-w / 2} ${h * 0.62} ${-w / 2} 0 Z`} fill="none" /> : null}
      {[[-0.18, -0.2, '#FFB3DE'], [0.2, 0.15, '#9FD8FF'], [-0.1, 0.32, '#C7B3FF'], [0.22, -0.28, '#FFE08A']].map(([x, y, c], k) => (
        <circle key={k} cx={(x as number) * w} cy={(y as number) * h} r={w * 0.07} fill={c as string} opacity={1 - hatch} />
      ))}
      {crackPaths.slice(0, cracks).map((d, k) => (
        <path key={k} d={d} stroke="#6B5A44" strokeWidth={5} fill="none" strokeLinejoin="round" opacity={1 - hatch} />
      ))}
    </svg>
  );
};

export const Cup: React.FC<{ w: number; lift: number; color?: string }> = ({ w, lift, color = '#C0392B' }) => (
  <div style={{ position: 'relative', width: w, height: w * 1.05, transform: `translateY(${-lift * w * 0.7}px)` }}>
    <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(14% 0, 86% 0, 100% 100%, 0 100%)', background: `linear-gradient(90deg, ${color} 0%, #E25A4B 45%, ${color} 100%)`, borderRadius: 10 }} />
    <div style={{ position: 'absolute', left: '10%', right: '10%', top: '22%', height: '9%', background: 'rgba(255,255,255,0.25)' }} />
    <div style={{ position: 'absolute', left: '4%', right: '4%', top: '72%', height: '9%', background: 'rgba(0,0,0,0.18)' }} />
  </div>
);

export const Envelope: React.FC<{ w: number; open: number; children?: React.ReactNode }> = ({ w, open, children }) => {
  const h = w * 0.62;
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <div style={{ position: 'absolute', left: w * 0.06, width: w * 0.88, top: h * 0.08 - open * h * 0.62, height: h * 0.8, background: '#FBF7EE', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: h * 0.02, boxSizing: 'border-box', opacity: open > 0.05 ? 1 : 0, zIndex: 2 }}>{children}</div>
      <div style={{ position: 'absolute', inset: 0, background: '#E9DCC0', borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.45)', clipPath: 'polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)', zIndex: 3 }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h * 0.6, background: '#DCCBA8', clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transformOrigin: '50% 0', transform: `rotateX(${open * 180}deg)`, zIndex: open > 0.5 ? 1 : 4 }} />
      <div style={{ position: 'absolute', left: w / 2 - 26, top: h * 0.42, width: 52, height: 52, borderRadius: 26, background: '#9B1C2C', opacity: 1 - open, boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }} />
    </div>
  );
};

// ------------------------------------------------------------------ instruction panel

export type Step = { t0: number; t1: number; text: string; sub?: string };

/** The current instruction, lower third of the safe area, with a tick dot per second. */
export const Steps: React.FC<{ look: Look; steps: Step[]; t: number; y?: number }> = ({ look, steps, t, y = 1190 }) => {
  const s = steps.find((x) => t >= x.t0 && t < x.t1 && x.text);
  if (!s) return null;
  const f = t * 60;
  const p = spr(f, s.t0 * 60, 13);
  const out = lerp(t, s.t1 - 0.2, s.t1, 0, 1);
  const secs = Math.max(1, Math.round(s.t1 - s.t0));
  const done = Math.floor(t - s.t0);
  return (
    <div style={{ position: 'absolute', left: 50, width: SAFE.right - 50, top: y, textAlign: 'center', opacity: Math.min(1, p * 1.4) * (1 - out), transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ fontFamily: look.body, fontWeight: 800, fontSize: s.text.length > 26 ? 56 : 68, lineHeight: 1.1, color: look.ink, textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>{s.text}</div>
      {s.sub ? <div style={{ fontFamily: look.body, fontWeight: 600, fontSize: 34, color: look.sub, marginTop: 10 }}>{s.sub}</div> : null}
      {secs >= 2 ? (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
          {Array.from({ length: secs }, (_, k) => (
            <div key={k} style={{ width: 14, height: 14, borderRadius: 7, background: k <= done ? look.accent : 'rgba(255,255,255,0.18)' }} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

