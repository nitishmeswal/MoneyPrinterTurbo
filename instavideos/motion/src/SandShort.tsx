/* Draws a precomputed sand run (engine/sand.py): the sand layer is one small
 * indexed PNG per frame (public/frames/<id>/NNNN.png), scaled up with hard
 * pixels; pegs, cups, spout and labels are drawn here. */
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Backdrop, Handle, Payoff, Short, Spec, Title, lookOf, spr, useData } from './kit';

type SandData = {
  id: string;
  spec: Spec & { payoff?: Record<string, string>; rules?: never };
  frames: number;
  full?: number;
  grid: { x0: number; y0: number; cell: number; cols: number; rows: number };
  pegs: number[][];
  walls: number[];
  cupTop: number;
  cups: number[][];
  spout: number[];
  fills: number[][];
  result: { f: number; winner: number; fills: number[] };
};

export const SandShort: React.FC<{ id: string }> = ({ id }) => {
  const data = useData<SandData>(id);
  if (!data) return null;
  return <Short id={id} render={(f) => <SandScene data={data} f={f} />} />;
};

const SandScene: React.FC<{ data: SandData; f: number }> = ({ data, f }) => {
  const look = lookOf(data.spec);
  const { x0, y0, cell, cols, rows } = data.grid;
  const res = data.result;
  const fi = Math.min(f, data.frames - 1);
  const full = data.full ?? 0.86;
  const fills = data.fills[fi] ?? data.fills[data.fills.length - 1];
  const decided = f >= res.f;
  const sx = x0 + (data.spout[fi] + 0.5) * cell;
  const bottom = y0 + rows * cell;
  const top = y0 + data.cupTop * cell;
  const lead = fills.indexOf(Math.max(...fills));
  const p = data.spec.payoff ?? {};
  return (
    <AbsoluteFill>
      <Backdrop look={look} f={f} />
      {/* spout */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M ${sx - 34} ${y0 - 58} L ${sx + 34} ${y0 - 58} L ${sx + 9} ${y0 - 8} L ${sx - 9} ${y0 - 8} Z`} fill={look.ring} opacity={0.9} />
        <rect x={sx - 44} y={y0 - 70} width={88} height={14} rx={7} fill={look.accent} />
        {/* pegs */}
        {data.pegs.map(([c, r], i) => (
          <circle key={i} cx={x0 + (c + 1) * cell} cy={y0 + (r + 1) * cell} r={cell * 0.95} fill={look.ring} opacity={0.85} />
        ))}
      </svg>
      <Img
        src={staticFile(`frames/${data.id}/${String(fi).padStart(4, '0')}.png`)}
        style={{ position: 'absolute', left: x0, top: y0, width: cols * cell, height: rows * cell, imageRendering: 'pixelated' }}
      />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* winner glow */}
        {decided
          ? (() => {
              const [a, b] = data.cups[res.winner];
              const q = spr(f, res.f, 12);
              return <rect x={x0 + a * cell - 6} y={top - 6} width={(b - a + 1) * cell + 12} height={bottom - top + 6} rx={10} fill={look.accent} opacity={0.18 * q} />;
            })()
          : null}
        {/* cup walls, outer walls, floor */}
        {data.walls.map((c) => (
          <rect key={c} x={x0 + c * cell} y={top} width={cell} height={bottom - top} rx={3} fill={look.ring} />
        ))}
        <rect x={x0 - 2} y={y0 - 20} width={cell + 2} height={rows * cell + 20} rx={3} fill={look.ring} />
        <rect x={x0 + (cols - 1) * cell} y={y0 - 20} width={cell + 2} height={rows * cell + 20} rx={3} fill={look.ring} />
        <rect x={x0 - 2} y={bottom - cell} width={cols * cell + 4} height={cell + 4} rx={3} fill={look.ring} />
      </svg>
      {/* cup labels with fill (100% = full) */}
      {data.cups.map(([a, b], k) => {
        const pct = Math.min(100, Math.round((fills[k] / full) * 100));
        const win = decided && k === res.winner;
        const hot = !decided && k === lead && fills[k] > 0.2;
        return (
          <div key={k} style={{ position: 'absolute', left: x0 + a * cell, width: (b - a + 1) * cell, top: top - 78, textAlign: 'center', fontFamily: look.body, color: win ? look.accent : hot ? look.ink : look.sub, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05 }}>
            <div style={{ fontWeight: 800, fontSize: 36 }}>{pct}%</div>
            <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.12em' }}>CUP {k + 1}</div>
          </div>
        );
      })}
      <Title look={look} text={data.spec.title} sub={f < 90 ? data.spec.subtitle : undefined} f={f} day={data.spec.day} />
      {decided ? <Payoff look={look} f={f} at={res.f} text={(p.cup ?? 'CUP {n} WINS!').replace('{n}', String(res.winner + 1))} sub={p.sub} y={640} /> : null}
      <Handle look={look} />
    </AbsoluteFill>
  );
};
