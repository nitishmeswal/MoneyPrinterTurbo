/* Draws a precomputed sim (public/data/<id>.json from engine/run_sim.py).
 * Never steps physics: frame f reads pos[f] and replays events up to f. */
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Look } from './accounts';
import { FlagBall, FLAGS } from './flags';
import { Backdrop, Handle, Payoff, SAFE, Short, Spec, Title, W, fmt, lerp, lookOf, spr, useData, INOUT } from './kit';

type Ring = { R: number; w: number; n: number; kind: string; rot: number; rot0: number; cx: number; cy: number; dead: number[]; shrink?: number; Rmin?: number; spike?: number[] };
type Ev = { f: number; type: string; ball?: number; x?: number; y?: number; ring?: number; seg?: number; owner?: number; n?: number; place?: number; count?: number; arena?: number; hp?: number; d?: number; dir?: number };
type BallDef = { id: number; color: string; name: string; flag?: string; img?: string; hunter: boolean; r0: number };
/** Image balls (img/<key>.png from engine/ballimg.py) are HTML <Img>, so the render waits for them to load. */
const ImgFace: React.FC<{ src: string; size: number; style?: React.CSSProperties }> = ({ src, size, style }) => (
  <Img src={staticFile(`img/${src}.png`)} style={{ width: size, height: size, borderRadius: size / 2, display: 'block', ...style }} />
);
type Result = { f: number; outcome: string; winner?: number; winners?: number[]; order?: number[]; out?: number[]; counts?: Record<string, number>; total?: number; layers?: number; reason?: string; left?: number[]; mask?: number; pct?: number; hp?: number };
type Grid = { mode: 'mix' | 'reveal'; cell: number; n: number; x0: number; y0: number; ch: number[] };
export type SimData = {
  id: string;
  grid?: Grid;
  hp0?: number;
  lives0?: number;
  spec: Spec & { hud?: string; payoff?: Record<string, string>; song?: string; series?: string; advanceLabel?: string; standings?: { name: string; color?: string; flag?: string; pts: number; add: number }[]; arenaLabels?: string[]; mixes?: Record<string, [string, string]>; flag?: string };
  frames: number;
  rings: Ring[];
  arenas: { cx: number; cy: number }[];
  balls: BallDef[];
  melody?: number[];
  pos: number[][][];
  events: Ev[];
  result: Result | null;
};

const TAU = Math.PI * 2;
const arc = (cx: number, cy: number, R: number, a0: number, a1: number) => {
  if (a1 - a0 >= TAU - 1e-3) {
    return `M ${cx + R} ${cy} A ${R} ${R} 0 1 1 ${cx - R} ${cy} A ${R} ${R} 0 1 1 ${cx + R} ${cy}`;
  }
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${(cx + R * Math.cos(a0)).toFixed(1)} ${(cy + R * Math.sin(a0)).toFixed(1)} A ${R} ${R} 0 ${large} 1 ${(cx + R * Math.cos(a1)).toFixed(1)} ${(cy + R * Math.sin(a1)).toFixed(1)}`;
};

/** Alive runs of a ring as [startSeg, length] (wrap-aware). */
const runs = (alive: boolean[]) => {
  const n = alive.length;
  if (alive.every(Boolean)) return [[0, n]];
  const out: number[][] = [];
  let s = alive.findIndex((a) => !a);
  let i = 0;
  while (i < n) {
    const j = (s + i) % n;
    if (alive[j]) {
      let k = 0;
      while (k < n && alive[(j + k) % n]) k++;
      out.push([j, k]);
      i += k;
    } else i++;
  }
  return out;
};

const fill = (s: string, d: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(d[k] ?? ''));

/** Paint-grid values at frame f (changes are [f, cell, value] triples in frame order). */
const gridAt = (g: Grid, f: number) => {
  const v = new Int16Array(g.n * g.n);
  const ch = g.ch;
  for (let i = 0; i < ch.length; i += 3) {
    if (ch[i] > f) break;
    v[ch[i + 1]] = ch[i + 2];
  }
  return v;
};
const insideCells = (g: Grid, ring: Ring) => {
  const inner = ring.R - ring.w / 2;
  let c = 0;
  for (let r = 0; r < g.n; r++) for (let k = 0; k < g.n; k++) if ((g.x0 + (k + 0.5) * g.cell - ring.cx) ** 2 + (g.y0 + (r + 0.5) * g.cell - ring.cy) ** 2 < inner * inner) c++;
  return c;
};
const rgba = (hex: string, a = 255) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), a];

/** The paint grid as a tiny canvas scaled up (bilinear, so cell edges blur into soft paint). */
const GridCanvas: React.FC<{ g: Grid; v: Int16Array; color: (val: number) => number[]; clipR: number; cx: number; cy: number; opacity?: number }> = ({ g, v, color, clipR, cx, cy, opacity = 1 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(g.n, g.n);
    const cache = new Map<number, number[]>();
    for (let k = 0; k < v.length; k++) {
      let col = cache.get(v[k]);
      if (!col) {
        col = color(v[k]);
        cache.set(v[k], col);
      }
      img.data.set(col, k * 4);
    }
    ctx.putImageData(img, 0, 0);
  });
  const size = g.n * g.cell;
  return (
    <canvas
      ref={ref}
      width={g.n}
      height={g.n}
      style={{ position: 'absolute', left: g.x0, top: g.y0, width: size, height: size, opacity, clipPath: `circle(${clipR}px at ${cx - g.x0}px ${cy - g.y0}px)` }}
    />
  );
};

const GRAV = ['↓', '←', '↑', '→'];

export const SimShort: React.FC<{ id: string }> = ({ id }) => {
  const data = useData<SimData>(id);
  if (!data) return null;
  return <Short id={id} render={(f) => <SimScene data={data} f={f} />} />;
};

const SimScene: React.FC<{ data: SimData; f: number }> = ({ data, f }) => {
  const look = lookOf(data.spec);
  const spec = data.spec;
  const t = f / 60;
  const ev = useMemo(() => {
    const by: Record<string, Ev[]> = {};
    for (const e of data.events) (by[e.type] ??= []).push(e);
    return by;
  }, [data]);
  const res = data.result;
  const decided = res && f >= res.f;
  const pos = data.pos[Math.min(f, data.pos.length - 1)] ?? [];
  const ballOf = (i: number) => data.balls[i];

  // ring state at f
  const ringState = data.rings.map((r, k) => {
    const alive = Array.from({ length: r.n }, () => true);
    for (const j of r.dead) alive[j] = false;
    const dying: { seg: number; p: number }[] = [];
    for (const e of ev.brick ?? []) {
      if (e.ring !== k || e.f > f) continue;
      alive[e.seg!] = false;
      if (f - e.f < 14) dying.push({ seg: e.seg!, p: (f - e.f) / 14 });
    }
    const owner = Array.from({ length: r.n }, () => -1);
    for (const e of ev.paint ?? []) if (e.ring === k && e.f <= f) owner[e.seg!] = e.owner!;
    const lit = new Map<number, number>();
    for (const e of ev.bounce ?? []) if (e.ring === k && e.f <= f && r.kind === 'notes') lit.set(e.seg!, e.f);
    const litEver = new Set<number>();
    for (const e of ev.lit ?? []) if (e.ring === k && e.f <= f) litEver.add(e.seg!);
    const R = r.shrink ? Math.max(r.Rmin ?? 0, r.R - r.shrink * ((f + 1) / 60)) : r.R;
    return { alive, dying, owner, lit, litEver, off: ((r.rot0 + r.rot * t) * Math.PI) / 180, R };
  });

  // paint grid (colour mix / reveal)
  const g = data.grid;
  const gv = useMemo(() => (g ? gridAt(g, f) : null), [g, f]);
  const ring0 = data.rings[0];
  const inner0 = ring0.R - ring0.w / 2;
  const mixes = spec.mixes ?? {};
  // HP at f (HP battle): start value minus every hit so far
  const hpAt = useMemo(() => {
    const m = new Map<number, number>();
    for (const e of ev.dmg ?? []) if (e.f <= f) m.set(e.ball!, e.hp!);
    return m;
  }, [ev, f]);
  const hp0 = data.hp0 ?? 0;
  const flips = (ev.gflip ?? []).filter((e) => e.f <= f);
  const gdir = flips.length ? flips[flips.length - 1].dir ?? 0 : 0;
  const revealFade = g?.mode === 'reveal' && res ? lerp(f, res.f, res.f + 40) : 0;

  const recent = (type: string, span: number) => (ev[type] ?? []).filter((e) => e.f <= f && f - e.f < span);
  const pulse = recent('bounce', 8).length ? 1 : 0;
  const escaped = (ev.escape ?? []).filter((e) => e.f <= f);
  const caught = (ev.catch ?? []).filter((e) => e.f <= f);

  return (
    <AbsoluteFill>
      <Backdrop look={look} f={f} pulse={pulse} />
      {g && gv && g.mode === 'mix' ? <GridCanvas g={g} v={gv} clipR={inner0} cx={ring0.cx} cy={ring0.cy} color={(val) => (val > 0 && mixes[String(val)] ? rgba(mixes[String(val)][1], 235) : [0, 0, 0, 0])} /> : null}
      {g && gv && g.mode === 'reveal' && spec.flag ? (
        <>
          <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <g transform={`translate(${ring0.cx} ${ring0.cy})`}>
              <FlagBall code={spec.flag} r={inner0} uid="reveal" />
            </g>
          </svg>
          <GridCanvas g={g} v={gv} clipR={inner0 + 1} cx={ring0.cx} cy={ring0.cy} opacity={1 - revealFade} color={(val) => (val ? [0, 0, 0, 0] : [30, 33, 44, 255])} />
          {revealFade < 1 ? (
            <div style={{ position: 'absolute', left: ring0.cx - 200, top: ring0.cy - 200, width: 400, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: look.title.font, fontSize: 360, color: 'rgba(255,255,255,0.05)', opacity: 1 - revealFade }}>?</div>
          ) : null}
        </>
      ) : null}
      <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {data.balls.map((b) => (
            <radialGradient key={b.id} id={`g${b.id}`} cx="35%" cy="32%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.85} />
              <stop offset="28%" stopColor={b.color} />
              <stop offset="100%" stopColor={b.color} stopOpacity={0.88} />
            </radialGradient>
          ))}
        </defs>
        {spec.hud === 'gravity' ? (
          <text x={ring0.cx} y={ring0.cy + 70} textAnchor="middle" fontSize={260} fontFamily={look.body} fontWeight={800} fill={look.ink} opacity={0.06}>{GRAV[gdir]}</text>
        ) : null}
        {data.rings.map((r, k) => (
          <RingView key={k} r={{ ...r, R: ringState[k].R }} k={k} st={ringState[k]} look={look} f={f} balls={data.balls} />
        ))}
        {/* spike hits: red flash */}
        {recent('spike', 24).map((e, i) => {
          const p = (f - e.f) / 24;
          return <circle key={`sp${i}`} cx={e.x} cy={e.y} r={20 + 70 * p} fill="none" stroke="#FF3B4E" strokeWidth={10 * (1 - p)} opacity={1 - p} />;
        })}
        {/* damage numbers */}
        {recent('dmg', 40).map((e, i) => {
          const p = (f - e.f) / 40;
          return (
            <text key={`dm${i}`} x={e.x} y={e.y! - 40 - 60 * p} textAnchor="middle" fontFamily={look.body} fontWeight={800} fontSize={34 + Math.min(20, e.d!)} fill="#FF4D5E" stroke="#111" strokeWidth={4} paintOrder="stroke" opacity={1 - p * p}>
              -{e.d}
            </text>
          );
        })}
        {/* pops and crushes: burst */}
        {[...recent('pop', 26), ...recent('crush', 26)].map((e, i) => {
          const p = (f - e.f) / 26;
          const b = ballOf(e.ball!);
          return (
            <g key={`pp${i}`}>
              <circle cx={e.x} cy={e.y} r={20 + 90 * p} fill="none" stroke={b.color} strokeWidth={8 * (1 - p)} opacity={1 - p} />
              {Array.from({ length: 14 }, (_, k) => {
                const a = (k / 14) * TAU;
                return <circle key={k} cx={e.x! + Math.cos(a) * 110 * p} cy={e.y! + Math.sin(a) * 110 * p} r={10 * (1 - p)} fill={b.color} />;
              })}
            </g>
          );
        })}
        {/* bounce ripples */}
        {recent('bounce', 14).map((e, i) => {
          const p = (f - e.f) / 14;
          const b = ballOf(e.ball!);
          return <circle key={`rp${i}`} cx={e.x} cy={e.y} r={10 + 46 * p} fill="none" stroke={b?.color ?? '#fff'} strokeWidth={5 * (1 - p)} opacity={0.8 * (1 - p)} />;
        })}
        {/* trails */}
        {pos.map(([bid, x, y, r]) => {
          const b = ballOf(bid);
          const pts: number[][] = [];
          for (let k = 1; k <= 9; k++) {
            const pf = data.pos[f - k * 2];
            const q = pf?.find((p) => p[0] === bid);
            if (q) pts.push(q);
          }
          return (
            <g key={`t${bid}`}>
              {pts.map((q, k) => (
                <circle key={k} cx={q[1]} cy={q[2]} r={q[3] * (0.85 - k * 0.07)} fill={b.color} opacity={0.22 - k * 0.022} />
              ))}
            </g>
          );
        })}
        {/* catches: burst */}
        {recent('catch', 22).map((e, i) => {
          const p = (f - e.f) / 22;
          const b = ballOf(e.ball!);
          return (
            <g key={`c${i}`}>
              {Array.from({ length: 10 }, (_, k) => {
                const a = (k / 10) * TAU;
                return <circle key={k} cx={e.x! + Math.cos(a) * 70 * p} cy={e.y! + Math.sin(a) * 70 * p} r={9 * (1 - p)} fill={b.color} />;
              })}
            </g>
          );
        })}
        {/* balls */}
        {pos.map(([bid, x, y, r]) => (
          <BallView key={`b${bid}`} b={ballOf(bid)} x={x} y={y} r={r} f={f} pos={data.pos} label={spec.hud === 'hp' ? String(hpAt.get(bid) ?? hp0) : undefined} />
        ))}
      </svg>
      {/* image balls on top of their SVG glow + rim, HP under the ball */}
      {pos.map(([bid, x, y, r]) => {
        const b = ballOf(bid);
        if (!b.img) return null;
        return (
          <React.Fragment key={`im${bid}`}>
            <ImgFace src={b.img} size={r * 2 - 6} style={{ position: 'absolute', left: x - r + 3, top: y - r + 3 }} />
            {spec.hud === 'hp' ? (
              <div style={{ position: 'absolute', left: x - 40, width: 80, top: y + r - 14, textAlign: 'center' }}>
                <span style={{ padding: '2px 10px', borderRadius: 14, background: b.color, fontFamily: look.body, fontWeight: 800, fontSize: 24, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontVariantNumeric: 'tabular-nums' }}>{hpAt.get(bid) ?? hp0}</span>
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
      <Hud data={data} f={f} look={look} ev={ev} ringState={ringState} escaped={escaped} caught={caught} gv={gv} hpAt={hpAt} gdir={gdir} />
      <Title look={look} text={spec.title} sub={f < 90 ? spec.subtitle : undefined} f={f} day={spec.day} />
      {/* no "pick one" chips: the video is just the sim (the title asks the question) */}
      {decided && res ? <PayoffFor data={data} res={res} f={f} look={look} /> : null}
      <Handle look={look} />
    </AbsoluteFill>
  );
};

const FlagChip: React.FC<{ code: string }> = ({ code }) => (
  <svg width={40} height={40} viewBox="-20 -20 40 40">
    <FlagBall code={code} r={18} uid={`chip${code}`} />
    <circle r={18} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
  </svg>
);

const RingView: React.FC<{ r: Ring; k: number; st: { alive: boolean[]; dying: { seg: number; p: number }[]; owner: number[]; lit: Map<number, number>; litEver: Set<number>; off: number }; look: Look; f: number; balls: BallDef[] }> = ({ r, k, st, look, f, balls }) => {
  const seg = TAU / r.n;
  if (r.kind === 'wall') {
    return (
      <g>
        {runs(st.alive).map(([j, len], i) => (
          <g key={i}>
            <path d={arc(r.cx, r.cy, r.R, st.off + j * seg, st.off + (j + len) * seg)} stroke={look.ring} strokeOpacity={0.18} strokeWidth={r.w + 14} fill="none" />
            <path d={arc(r.cx, r.cy, r.R, st.off + j * seg, st.off + (j + len) * seg)} stroke={look.ring} strokeWidth={r.w} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {/* spikes: inward teeth, one every 2.5 degrees of a spiked stretch */}
        {(r.spike ?? []).filter((j) => j % 5 === 0).map((j) => {
          const a = st.off + (j + 2.5) * seg;
          const half = 2.5 * seg;
          const base = r.R - r.w / 2 + 2;
          const tip = base - 30;
          const p = (ang: number, rad: number) => `${(r.cx + rad * Math.cos(ang)).toFixed(1)},${(r.cy + rad * Math.sin(ang)).toFixed(1)}`;
          return <polygon key={`s${j}`} points={`${p(a - half, base)} ${p(a, tip)} ${p(a + half, base)}`} fill="#FF4D5E" stroke="#FFB3BB" strokeWidth={1.5} />;
        })}
      </g>
    );
  }
  const pad = Math.min(seg * 0.12, 0.012);
  return (
    <g>
      {Array.from({ length: r.n }, (_, j) => {
        const a0 = st.off + j * seg + pad;
        const a1 = st.off + (j + 1) * seg - pad;
        if (r.kind === 'bricks') {
          if (!st.alive[j]) return null;
          const c = look.palette[(k * 2 + (j % 2)) % look.palette.length];
          return <path key={j} d={arc(r.cx, r.cy, r.R, a0, a1)} stroke={c} strokeWidth={r.w} fill="none" />;
        }
        if (r.kind === 'paint') {
          const o = st.owner[j];
          const c = o >= 0 ? balls[o]?.color ?? '#fff' : 'rgba(255,255,255,0.12)';
          return <path key={j} d={arc(r.cx, r.cy, r.R, a0, a1)} stroke={c} strokeWidth={r.w} fill="none" />;
        }
        // notes ring
        const hitF = st.lit.get(j);
        const flash = hitF !== undefined && f - hitF < 16 ? 1 - (f - hitF) / 16 : 0;
        const c = look.palette[j % look.palette.length];
        const on = st.litEver.has(j);
        return (
          <g key={j}>
            {flash > 0 ? <path d={arc(r.cx, r.cy, r.R, a0, a1)} stroke={c} strokeWidth={r.w + 30 * flash} strokeOpacity={0.35 * flash} fill="none" /> : null}
            <path d={arc(r.cx, r.cy, r.R, a0, a1)} stroke={c} strokeOpacity={on ? 1 : 0.28} strokeWidth={r.w} fill="none" />
          </g>
        );
      })}
      {st.dying.map(({ seg: j, p }) => {
        const c = look.palette[(k * 2 + (j % 2)) % look.palette.length];
        return <path key={`d${j}`} d={arc(r.cx, r.cy, r.R + 40 * p, st.off + j * seg, st.off + (j + 1) * seg)} stroke={c} strokeWidth={r.w * (1 - p)} opacity={1 - p} fill="none" />;
      })}
    </g>
  );
};

const BallView: React.FC<{ b: BallDef; x: number; y: number; r: number; f: number; pos: number[][][]; label?: string }> = ({ b, x, y, r, f, pos, label }) => {
  if (b.hunter) {
    const prev = pos[Math.max(0, f - 3)]?.find((p) => p[0] === b.id) ?? [0, x, y, r];
    const dx = x - prev[1];
    const dy = y - prev[2];
    const d = Math.hypot(dx, dy) || 1;
    const ex = (dx / d) * r * 0.18;
    const ey = (dy / d) * r * 0.18;
    return (
      <g transform={`translate(${x} ${y})`}>
        <circle r={r * 1.35} fill="#FF3B3B" opacity={0.14} />
        <circle r={r} fill="#17171C" stroke="#FF3B3B" strokeWidth={6} />
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * r * 0.34 + ex} ${-r * 0.12 + ey})`}>
            <circle r={r * 0.2} fill="#fff" />
            <circle r={r * 0.1} cx={ex * 0.5} cy={ey * 0.5} fill="#FF3B3B" />
          </g>
        ))}
        <path d={`M ${-r * 0.55} ${-r * 0.42} L ${-r * 0.15} ${-r * 0.3} M ${r * 0.55} ${-r * 0.42} L ${r * 0.15} ${-r * 0.3}`} stroke="#FF3B3B" strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 1.6} fill={b.color} opacity={0.16} />
      {b.img ? (
        // the picture itself is an HTML <Img> drawn over this (see SimScene); here only the coloured rim
        <circle r={r - 1} fill="#fff" stroke={b.color} strokeWidth={6} />
      ) : b.flag ? (
        <>
          <FlagBall code={b.flag} r={r} uid={`b${b.id}`} />
          <circle r={r * 0.42} cx={-r * 0.3} cy={-r * 0.34} fill="#fff" opacity={0.28} />
          <circle r={r} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} />
        </>
      ) : (
        <circle r={r} fill={`url(#g${b.id})`} />
      )}
      {label !== undefined && !b.img ? (
        <text y={r * 0.3} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={r * 0.82} fill="#111" opacity={0.85}>{label}</text>
      ) : null}
    </g>
  );
};

const Hud: React.FC<{ data: SimData; f: number; look: Look; ev: Record<string, Ev[]>; ringState: { alive: boolean[]; owner: number[]; litEver: Set<number>; R: number }[]; escaped: Ev[]; caught: Ev[]; gv: Int16Array | null; hpAt: Map<number, number>; gdir: number }> = ({ data, f, look, ev, ringState, escaped, caught, gv, hpAt, gdir }) => {
  const spec = data.spec;
  const hud = spec.hud ?? 'timer';
  const startAt = 20;
  const vis = lerp(f, startAt, startAt + 20);
  if (vis <= 0) return null;
  const deadline = Math.round(data.frames * Number(spec.timerFrac ?? 0.86));
  const left = Math.max(0, (deadline - f) / 60);
  const box = (children: React.ReactNode, extra: React.CSSProperties = {}) => (
    <div style={{ position: 'absolute', left: 50, width: SAFE.right - 50, top: 410, display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'center', opacity: vis, ...extra }}>{children}</div>
  );
  const pill = (label: string, value: React.ReactNode, color = look.ink, key?: string | number) => (
    <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '10px 22px', borderRadius: 18, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)' }}>
      <span style={{ fontFamily: look.body, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: look.sub, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: look.body, fontWeight: 800, fontSize: 40, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
  const timer = !data.result || f < data.result.f ? pill('time', fmt(left), left < 5 ? '#FF5A5A' : look.ink, 'tm') : null;
  if (hud === 'bricks') {
    const n = ringState.reduce((s, r, k) => s + (data.rings[k].kind === 'bricks' ? r.alive.filter(Boolean).length : 0), 0);
    return box([pill('bricks', n, look.accent, 'br'), timer]);
  }
  if (hud === 'paint') {
    const k = data.rings.findIndex((r) => r.kind === 'paint');
    const own = ringState[k].owner;
    const total = own.length;
    const players = data.balls;
    return box(
      <div style={{ width: 760 }}>
        <div style={{ display: 'flex', height: 46, borderRadius: 23, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
          {players.map((b, i) => {
            const c = own.filter((o) => o === i).length;
            return <div key={i} style={{ width: `${(c / total) * 100}%`, background: b.color }} />;
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          {players.map((b, i) => (
            <span key={i} style={{ fontFamily: look.body, fontWeight: 800, fontSize: 36, color: b.color, fontVariantNumeric: 'tabular-nums' }}>{Math.round((own.filter((o) => o === i).length / total) * 100)}%</span>
          ))}
          {timer}
        </div>
      </div>,
      { top: 400 },
    );
  }
  if (hud === 'grow') {
    const cur = data.pos[Math.min(f, data.pos.length - 1)]?.[0];
    const gapRing = data.rings[0];
    const gapArc = gapRing.dead.length * (TAU / gapRing.n) * gapRing.R;
    const d = cur ? cur[3] * 2 : 0;
    const p = Math.min(1, d / gapArc);
    return box(
      <div style={{ width: 720 }}>
        <div style={{ fontFamily: look.body, fontWeight: 700, fontSize: 26, letterSpacing: '0.12em', color: look.sub, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span>BALL SIZE</span>
          <span>EXIT</span>
        </div>
        <div style={{ position: 'relative', height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ width: `${p * 100}%`, height: '100%', borderRadius: 17, background: p > 0.85 ? '#FF5A5A' : look.accent }} />
          <div style={{ position: 'absolute', right: 0, top: -8, width: 6, height: 50, background: look.ink, borderRadius: 3 }} />
        </div>
      </div>,
    );
  }
  if (hud === 'arena') {
    const r = data.rings[0];
    const p = Math.round((ringState[0].R / r.R) * 100);
    return box([pill('arena', `${p}%`, p < 40 ? '#FF5A5A' : look.accent, 'ar')]);
  }
  if (hud === 'lives') {
    const n0 = data.lives0 ?? 3;
    const hits = (ev.spike ?? []).filter((e) => e.f <= f);
    const left = hits.length ? hits[hits.length - 1].hp! : n0;
    const lastHit = hits.length ? hits[hits.length - 1].f : -99;
    return box(
      <div style={{ display: 'flex', gap: 14, padding: '8px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)' }}>
        {Array.from({ length: n0 }, (_, i) => {
          const on = i < left;
          const justLost = i === left && f - lastHit < 20;
          return <span key={i} style={{ fontSize: 50, lineHeight: 1, color: on ? '#FF4D5E' : 'rgba(255,255,255,0.18)', transform: `scale(${justLost ? 1.4 - (f - lastHit) / 50 : 1})` }}>♥</span>;
        })}
      </div>,
    );
  }
  if (hud === 'gravity') {
    return box([pill('gravity', <span style={{ display: 'inline-block', width: 44, textAlign: 'center' }}>{GRAV[gdir]}</span>, look.accent, 'gv'), ...(spec.durationSec === 'auto' ? [] : [timer])]);
  }
  if (hud === 'reveal' && data.grid && gv) {
    let on = 0;
    for (let k = 0; k < gv.length; k++) if (gv[k]) on++;
    const tot = insideCells(data.grid, data.rings[0]);
    return box([pill('revealed', `${Math.round((on / tot) * 100)}%`, look.accent, 'rv'), timer]);
  }
  if (hud === 'mix' && data.grid && gv) {
    const mixes = spec.mixes ?? {};
    const tot = insideCells(data.grid, data.rings[0]);
    const counts = new Map<number, number>();
    for (let k = 0; k < gv.length; k++) if (gv[k] > 0) counts.set(gv[k], (counts.get(gv[k]) ?? 0) + 1);
    const keys = Object.keys(mixes).map(Number);
    return box(
      <div style={{ width: 800 }}>
        <div style={{ display: 'flex', height: 40, borderRadius: 20, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}>
          {keys.map((m) => (
            <div key={m} style={{ width: `${((counts.get(m) ?? 0) / tot) * 100}%`, background: mixes[String(m)][1] }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 22px', marginTop: 10 }}>
          {keys.map((m) => (
            <span key={m} style={{ fontFamily: look.body, fontWeight: 800, fontSize: 28, color: mixes[String(m)][1], fontVariantNumeric: 'tabular-nums' }}>
              {mixes[String(m)][0]} {Math.round(((counts.get(m) ?? 0) / tot) * 100)}%
            </span>
          ))}
        </div>
      </div>,
      { top: 395 },
    );
  }
  if (hud === 'hp') {
    const hp0 = data.hp0 ?? 100;
    return box(
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.balls.length > 4 ? 3 : 2}, 1fr)`, gap: '10px 26px', width: 820 }}>
        {data.balls.map((b) => {
          const hp = hpAt.get(b.id) ?? hp0;
          return (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: hp > 0 ? 1 : 0.3 }}>
              {b.img ? (
                <>
                  <ImgFace src={b.img} size={34} style={{ flexShrink: 0, boxShadow: `0 0 0 3px ${b.color}` }} />
                  <span style={{ width: data.balls.length > 4 ? 98 : 92, fontFamily: look.body, fontWeight: 800, fontSize: data.balls.length > 4 ? 20 : 24, color: look.ink, whiteSpace: 'nowrap', overflow: 'hidden' }}>{b.name}</span>
                </>
              ) : (
                <div style={{ width: 26, height: 26, borderRadius: 13, background: b.color, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ width: `${(hp / hp0) * 100}%`, height: '100%', background: b.color }} />
              </div>
              <span style={{ width: 54, textAlign: 'right', fontFamily: look.body, fontWeight: 800, fontSize: 26, color: look.ink, fontVariantNumeric: 'tabular-nums' }}>{hp}</span>
            </div>
          );
        })}
      </div>,
      { top: 395 },
    );
  }
  if (hud === 'layers') {
    const n = (ev.layer ?? []).filter((e) => e.f <= f).length;
    return box([pill('rings broken', `${n}/${data.rings.length}`, look.accent, 'ly'), timer]);
  }
  if (hud === 'survivors') {
    const prey = data.balls.filter((b) => !b.hunter);
    return box(
      prey.map((b) => {
        const dead = caught.find((c) => c.ball === b.id);
        return (
          <div key={b.id} style={{ width: 70, height: 70, borderRadius: 35, background: b.color, opacity: dead ? 0.25 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: look.body, fontWeight: 800, fontSize: 44, color: '#111', boxShadow: dead ? 'none' : `0 0 22px ${b.color}` }}>{dead ? '×' : ''}</div>
        );
      }),
    );
  }
  if (hud === 'melody') {
    const played = (ev.bounce ?? []).filter((e) => e.f <= f).length;
    const total = data.melody?.length ?? 0;
    return box([pill('note', `${Math.min(played, total)}/${total}`, look.accent, 'nt'), spec.durationSec === 'auto' ? null : timer]);
  }
  if (hud === 'lit') {
    const k = data.rings.findIndex((r) => r.kind === 'notes');
    return box([pill('notes played', `${ringState[k].litEver.size}/${data.rings[k].n}`, look.accent, 'lt'), timer]);
  }
  if (hud === 'race' || hud === 'duels') {
    const adv = Number(spec.advance ?? data.balls.length - 1);
    if (hud === 'duels') return null;
    return box(
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {pill(spec.advanceLabel ?? 'through', `${Math.min(escaped.length, adv)}/${adv}`, look.accent, 'rc')}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: 800, justifyContent: 'center', minHeight: 34 }}>
          {escaped.slice(0, adv).map((e) => {
            const b = data.balls[e.ball!];
            return b.flag ? <FlagChip key={e.ball} code={b.flag} /> : <div key={e.ball} style={{ width: 34, height: 34, borderRadius: 17, background: b.color }} />;
          })}
        </div>
      </div>,
      { top: 395 },
    );
  }
  return box([timer]);
};

const PayoffFor: React.FC<{ data: SimData; res: Result; f: number; look: Look }> = ({ data, res, f, look }) => {
  const spec = data.spec;
  const p = spec.payoff ?? {};
  const w = res.winner !== undefined && res.winner >= 0 ? data.balls[res.winner] : undefined;
  const name = w ? (w.flag ? FLAGS[w.flag]?.name ?? w.name : w.name) : '';
  let pct = '';
  if (res.counts && res.total && w) pct = `${Math.round(((res.counts[String(res.winner)] ?? 0) / res.total) * 100)}%`;
  const mix = res.outcome === 'mix' && res.mask !== undefined ? spec.mixes?.[String(res.mask)] : undefined;
  if (mix && res.counts && res.total) pct = `${Math.round(((res.counts[String(res.mask)] ?? 0) / res.total) * 100)}%`;
  const vars = {
    name, pct, left: res.left?.length ?? 0, layers: res.layers ?? 0, song: spec.song ?? '', n: data.rings.length, race: Number(spec.race ?? ''), next: String(p.next ?? ''), stage: String(spec.stage ?? ''),
    mixname: mix ? mix[0].toUpperCase() : '', flagname: spec.flag ? (FLAGS[spec.flag]?.name ?? spec.flag).toUpperCase() : '', hp: res.hp ?? 0,
  };
  const key = p[`${res.outcome}_${res.reason}`] ? `${res.outcome}_${res.reason}` : res.outcome;
  const text = fill(p[key] ?? (res.outcome === 'yes' ? 'YES!' : res.outcome === 'no' ? 'NO!' : '{name} WINS!'), vars);
  const sub = fill(p[`${key}Sub`] ?? p.sub ?? 'Comment what you picked', vars);
  const color = mix ? mix[1] : w && !w.hunter && res.outcome !== 'no' && res.outcome !== 'reveal' ? w.color : undefined;
  return (
    <>
      <Payoff look={look} f={f} at={res.f} text={text} sub={sub} color={color === '#F7F5EE' ? look.accent : color} y={spec.standings || res.outcome === 'duels' ? 520 : 780} />
      {spec.standings ? <Standings data={data} f={f} at={res.f + 50} look={look} /> : null}
      {res.outcome === 'duels' && res.winners ? <Advancers data={data} winners={res.winners} f={f} at={res.f + 30} look={look} /> : null}
    </>
  );
};

const Standings: React.FC<{ data: SimData; f: number; at: number; look: Look }> = ({ data, f, at, look }) => {
  const rows = data.spec.standings ?? [];
  const p = spr(f, at, 15);
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 120, width: 680, top: 760, padding: '22px 30px', borderRadius: 26, background: 'rgba(8,12,10,0.86)', border: '2px solid rgba(255,255,255,0.14)', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 60}px)` }}>
      <div style={{ fontFamily: look.title.font, fontSize: 52, color: look.accent, letterSpacing: '0.04em', marginBottom: 10 }}>{data.spec.series ?? 'STANDINGS'}</div>
      {rows.slice(0, 8).map((r, i) => {
        const q = lerp(f, at + 8 + i * 4, at + 20 + i * 4);
        return (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '7px 0', borderTop: i ? '1px solid rgba(255,255,255,0.08)' : 'none', opacity: q, transform: `translateX(${(1 - q) * 40}px)` }}>
            <span style={{ width: 34, fontFamily: look.body, fontWeight: 800, fontSize: 30, color: look.sub }}>{i + 1}</span>
            {r.flag ? <FlagChip code={r.flag} /> : <div style={{ width: 34, height: 34, borderRadius: 17, background: r.color }} />}
            <span style={{ flex: 1, fontFamily: look.body, fontWeight: 700, fontSize: 32, color: look.ink }}>{r.name}</span>
            {r.add ? <span style={{ fontFamily: look.body, fontWeight: 700, fontSize: 26, color: look.accent }}>+{r.add}</span> : null}
            <span style={{ width: 70, textAlign: 'right', fontFamily: look.body, fontWeight: 800, fontSize: 34, color: look.ink, fontVariantNumeric: 'tabular-nums' }}>{r.pts}</span>
          </div>
        );
      })}
    </div>
  );
};

const Advancers: React.FC<{ data: SimData; winners: number[]; f: number; at: number; look: Look }> = ({ data, winners, f, at, look }) => {
  const p = spr(f, at, 14);
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 60, width: SAFE.right - 60, top: 1000, display: 'flex', justifyContent: 'center', gap: 22, opacity: Math.min(1, p * 1.4) }}>
      {winners.map((wi, i) => {
        const b = data.balls[wi];
        const q = spr(f, at + i * 6, 11);
        return (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transform: `scale(${q})` }}>
            <svg width={110} height={110} viewBox="-55 -55 110 110">
              {b.flag ? <FlagBall code={b.flag} r={50} uid={`adv${wi}`} /> : <circle r={50} fill={b.color} />}
              <circle r={50} fill="none" stroke={look.accent} strokeWidth={4} />
            </svg>
            <span style={{ fontFamily: look.body, fontWeight: 800, fontSize: 26, color: look.ink }}>{b.flag ? FLAGS[b.flag]?.name : b.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export const simDuration = (d: SimData) => d.frames;
export { INOUT };
