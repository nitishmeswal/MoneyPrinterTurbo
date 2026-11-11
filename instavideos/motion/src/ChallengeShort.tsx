/* Challenge races from engine/challenge.py. Never computes the race itself:
 *  - MazeShort: four algorithms on copies of one maze; frame f shows the cells each has checked so far.
 *  - RampShort: four frictionless ramps; frame f reads each ball's precomputed position (slow motion). */
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop, Handle, Payoff, SAFE, Short, Spec, Title, lerp, lookOf, spr, useData } from './kit';

const ORD = ['1ST', '2ND', '3RD', '4TH'];
const rgb = (hex: string) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const fill = (s: string, d: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(d[k] ?? ''));

// ====================================================================== maze

type Algo = { name: string; sub: string; color: string; order: number[]; path: number[]; doneF: number | null; rank?: number };
type MazeData = { id: string; spec: Spec & { payoff?: Record<string, string> }; frames: number; n: number; maze: string[]; start: number; sps: number; algos: Algo[]; result: { f: number; winner: number; order: number[] } };

const PANEL = 424;
const GAP = 20;
const HEAD = 58;
const BLOCK = 12;

export const MazeShort: React.FC<{ id: string }> = ({ id }) => {
  const data = useData<MazeData>(id);
  if (!data) return null;
  return <Short id={id} render={(f) => <MazeScene data={data} f={f} />} />;
};

const stepsAt = (d: MazeData, a: Algo, f: number) => {
  if (f < d.start) return 0;
  if (a.doneF !== null && f >= a.doneF) return a.order.length;
  return Math.min(a.order.length, Math.floor(((f - d.start) / 60) * d.sps) + 1);
};

const MazeCanvas: React.FC<{ d: MazeData; a: Algo; k: number; done: boolean; pathP: number }> = ({ d, a, k, done, pathP }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const S = 2 * d.n + 1;
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(S, S);
    const col = rgb(a.color);
    const put = (y: number, x: number, v: number[]) => img.data.set([v[0], v[1], v[2], 255], (y * S + x) * 4);
    const wall = [222, 217, 205];
    const floor = [22, 24, 32];
    const seen = [Math.round(floor[0] + (col[0] - floor[0]) * 0.42), Math.round(floor[1] + (col[1] - floor[1]) * 0.42), Math.round(floor[2] + (col[2] - floor[2]) * 0.42)];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) put(y, x, d.maze[y][x] === '1' ? wall : floor);
    const vis = new Set(a.order.slice(0, k));
    const n = d.n;
    const open = (r: number, c2: number, dr: number, dc: number) => d.maze[2 * r + 1 + dr][2 * c2 + 1 + dc] === '0';
    for (const i of vis) {
      const r = Math.floor(i / n);
      const c2 = i % n;
      put(2 * r + 1, 2 * c2 + 1, seen);
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const r2 = r + dr;
        const c3 = c2 + dc;
        if (r2 < n && c3 < n && vis.has(r2 * n + c3) && open(r, c2, dr, dc)) put(2 * r + 1 + dr, 2 * c2 + 1 + dc, seen);
      }
    }
    if (done) {
      const m = Math.max(1, Math.round(a.path.length * pathP));
      for (let j = 0; j < m; j++) {
        const i = a.path[j];
        const r = Math.floor(i / n);
        const c2 = i % n;
        put(2 * r + 1, 2 * c2 + 1, col);
        if (j + 1 < m) {
          const i2 = a.path[j + 1];
          const r2 = Math.floor(i2 / n);
          const c3 = i2 % n;
          put(2 * r + 1 + (r2 - r), 2 * c2 + 1 + (c3 - c2), col);
        }
      }
    } else if (k > 0) {
      const i = a.order[k - 1];
      put(2 * Math.floor(i / n) + 1, 2 * (i % n) + 1, [255, 255, 255]);
    }
    // start and exit
    put(1, 1, done ? col : [255, 255, 255]);
    put(2 * n - 1, 2 * n - 1, done ? col : [255, 255, 255]);
    ctx.putImageData(img, 0, 0);
  });
  return <canvas ref={ref} width={S} height={S} style={{ width: S * BLOCK, height: S * BLOCK, imageRendering: 'pixelated', display: 'block', borderRadius: 6 }} />;
};

const MazeScene: React.FC<{ data: MazeData; f: number }> = ({ data, f }) => {
  const look = lookOf(data.spec);
  const res = data.result;
  const S = 2 * data.n + 1;
  const decided = f >= res.f;
  const p = data.spec.payoff ?? {};
  const w = data.algos[res.winner];
  return (
    <AbsoluteFill>
      <Backdrop look={look} f={f} />
      {data.algos.map((a, i) => {
        const x = 50 + (i % 2) * (PANEL + GAP);
        const y = 432 + Math.floor(i / 2) * (HEAD + S * BLOCK + 12 + 16);
        const k = stepsAt(data, a, f);
        const done = a.doneF !== null && f >= a.doneF;
        const pop = done ? spr(f, a.doneF!, 11) : 0;
        const win = done && a.rank === 1;
        const inP = spr(f, 4 + i * 5, 14);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: PANEL, padding: '8px 0 12px', borderRadius: 18, background: 'rgba(255,255,255,0.045)', border: `3px solid ${win ? a.color : 'rgba(255,255,255,0.08)'}`, boxShadow: win ? `0 0 ${40 * pop}px ${a.color}88` : 'none', opacity: Math.min(1, inP * 1.3), transform: `translateY(${(1 - inP) * 30}px)` }}>
            <div style={{ height: HEAD - 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
              <div style={{ lineHeight: 1.05 }}>
                <div style={{ fontFamily: look.body, fontWeight: 800, fontSize: a.name.length > 6 ? 24 : 30, color: a.color, letterSpacing: '0.02em' }}>{a.name}</div>
                <div style={{ fontFamily: look.body, fontWeight: 600, fontSize: 18, color: look.sub }}>{a.sub}</div>
              </div>
              {done ? (
                <div style={{ padding: '4px 14px', borderRadius: 12, background: a.color, color: '#111', fontFamily: look.body, fontWeight: 900, fontSize: 28, transform: `scale(${0.5 + 0.5 * pop})` }}>{ORD[(a.rank ?? 4) - 1]}</div>
              ) : (
                <div style={{ textAlign: 'right', fontFamily: look.body, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05 }}>
                  <div style={{ fontWeight: 800, fontSize: 28, color: look.ink }}>{k}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: look.sub, letterSpacing: '0.08em' }}>CELLS</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <MazeCanvas d={data} a={a} k={k} done={done} pathP={done ? lerp(f, a.doneF!, a.doneF! + 30) : 0} />
            </div>
          </div>
        );
      })}
      <Title look={look} text={data.spec.title} sub={f < 90 ? data.spec.subtitle : undefined} f={f} day={data.spec.day} />
      {decided ? <Payoff look={look} f={f} at={res.f} text={fill(p.win ?? '{name} WINS!', { name: w.name })} sub={fill(p.sub ?? '', { steps: w.order.length })} color={w.color} y={760} /> : null}
      <Handle look={look} />
    </AbsoluteFill>
  );
};

// ====================================================================== ramp (brachistochrone)

type Ramp = { key: string; name: string; sub: string; color: string; T: number; doneF: number; pos: number[][]; path: number[][]; rank: number };
type RampData = {
  id: string; spec: Spec & { payoff?: Record<string, string> }; frames: number; A: number[]; B: number[]; hz: number; start: number; size: number[];
  replay: { f: number; end: number; t0: number; slow: number }; ramps: Ramp[]; result: { f: number; winner: number; order: number[] };
};

export const RampShort: React.FC<{ id: string }> = ({ id }) => {
  const data = useData<RampData>(id);
  if (!data) return null;
  return <Short id={id} render={(f) => <RampScene data={data} f={f} />} />;
};

const RampScene: React.FC<{ data: RampData; f: number }> = ({ data, f }) => {
  const look = lookOf(data.spec);
  const res = data.result;
  const decided = f >= res.f;
  const p = data.spec.payoff ?? {};
  const [ax, ay] = data.A;
  const [bx, by] = data.B;
  const paths = useMemo(() => data.ramps.map((r) => 'M ' + r.path.map(([x, y]) => `${x} ${y}`).join(' L ')), [data]);
  const draw = lerp(f, 6, 70);
  const rp = data.replay;
  const tmax = Math.max(...data.ramps.map((r) => r.T));
  // real seconds since release: 1:1 during the race, then the photo-finish replay in slow motion
  const tAt = (fr: number) => (fr < rp.f ? Math.min(tmax, Math.max(0, fr - data.start) / 60) : Math.min(tmax + 0.12, rp.t0 + (fr - rp.f) / (60 * rp.slow)));
  const at = (r: Ramp, t: number) => r.pos[Math.max(0, Math.min(r.pos.length - 1, Math.round(t * data.hz)))];
  const tReal = tAt(f);
  const inReplay = f >= rp.f && f < res.f;
  const replayDone = (r: Ramp) => Math.round(rp.f + (r.T - rp.t0) * rp.slow * 60);
  const count = f < data.start ? Math.ceil((data.start - f) / 60) : 0;
  const legendIn = lerp(f, 80, 110);
  const w = data.ramps[res.winner];
  // the winner is drawn last (on top)
  const zorder = [...data.ramps.keys()].sort((i, j) => data.ramps[j].rank - data.ramps[i].rank);
  return (
    <AbsoluteFill>
      <Backdrop look={look} f={f} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* start platform and finish flag */}
        <rect x={ax - 70} y={ay - 6} width={70} height={12} rx={6} fill={look.ring} />
        <line x1={bx + 6} y1={by + 10} x2={bx + 6} y2={by - 110} stroke={look.ring} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, k) => (
          <rect key={k} x={bx + 8 + (k % 4) * 14} y={by - 110 + Math.floor(k / 4) * 14 + ((k % 4) % 2) * 0} width={14} height={14} fill={(k + Math.floor(k / 4)) % 2 ? '#111' : '#fff'} />
        ))}
        {/* ramps */}
        {zorder.map((i) => {
          const r = data.ramps[i];
          return (
            <g key={r.key}>
              <path d={paths[i]} stroke={r.color} strokeOpacity={0.18} strokeWidth={22} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
              <path d={paths[i]} stroke={r.color} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
            </g>
          );
        })}
        {/* trails + balls */}
        {zorder.map((i) => {
          const r = data.ramps[i];
          const [x, y] = at(r, tReal);
          const fin = f >= rp.f ? replayDone(r) : r.doneF;
          const done = f >= fin;
          const q = done ? lerp(f, fin, fin + 26) : 0;
          return (
            <g key={`b${r.key}`}>
              {f > data.start
                ? Array.from({ length: 10 }, (_, j) => {
                    const [tx, ty] = at(r, tAt(f - (j + 1) * 2));
                    return <circle key={j} cx={tx} cy={ty} r={20 * (0.9 - j * 0.07)} fill={r.color} opacity={0.26 - j * 0.024} />;
                  })
                : null}
              {done && q < 1 ? <circle cx={bx} cy={by} r={24 + 90 * q} fill="none" stroke={r.color} strokeWidth={8 * (1 - q)} opacity={1 - q} /> : null}
              <circle cx={x} cy={y} r={34} fill={r.color} opacity={0.16} />
              <circle cx={x} cy={y} r={21} fill={r.color} stroke="#fff" strokeWidth={3} />
              <circle cx={x - 6} cy={y - 7} r={6} fill="#fff" opacity={0.5} />
            </g>
          );
        })}
      </svg>
      {/* legend: 2 x 2, with time + place once each ball is down */}
      <div style={{ position: 'absolute', left: 50, width: SAFE.right - 50, top: 410, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px', opacity: legendIn }}>
        {data.ramps.map((r) => {
          const done = f >= r.doneF;
          const pop = done ? spr(f, r.doneF, 11) : 0;
          return (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: `2px solid ${done && r.rank === 1 ? r.color : 'rgba(255,255,255,0.08)'}` }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: r.color, flexShrink: 0 }} />
              <div style={{ flex: 1, lineHeight: 1.1 }}>
                <div style={{ fontFamily: look.body, fontWeight: 800, fontSize: 24, color: r.color }}>{r.name}</div>
                <div style={{ fontFamily: look.body, fontWeight: 600, fontSize: 17, color: look.sub }}>{r.sub}</div>
              </div>
              {done ? (
                <div style={{ textAlign: 'right', lineHeight: 1.05, transform: `scale(${0.5 + 0.5 * pop})` }}>
                  <div style={{ fontFamily: look.body, fontWeight: 900, fontSize: 24, color: r.rank === 1 ? look.accent : look.ink }}>{ORD[r.rank - 1]}</div>
                  <div style={{ fontFamily: look.body, fontWeight: 700, fontSize: 18, color: look.sub, fontVariantNumeric: 'tabular-nums' }}>{r.T.toFixed(3)} s</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {/* replay: red frame + REC tag */}
      {inReplay ? (
        <>
          <AbsoluteFill style={{ boxShadow: `inset 0 0 0 10px rgba(255,59,78,${0.5 + 0.2 * Math.sin(f / 6)})`, background: 'rgba(0,0,0,0.12)', opacity: lerp(f, rp.f, rp.f + 8) }} />
          <div style={{ position: 'absolute', left: 60, top: 1280, display: 'flex', alignItems: 'center', gap: 12, fontFamily: look.body, fontWeight: 900, fontSize: 34, letterSpacing: '0.12em', color: '#FF3B4E', opacity: lerp(f, rp.f, rp.f + 8) }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: '#FF3B4E', opacity: Math.floor(f / 20) % 2 ? 1 : 0.3 }} />
            PHOTO FINISH
          </div>
        </>
      ) : null}
      {/* stopwatch (real seconds) + speed tag */}
      <div style={{ position: 'absolute', left: 500, width: 400, top: 640, textAlign: 'right', fontFamily: look.body, opacity: lerp(f, 90, 120) * (decided ? 1 - lerp(f, res.f, res.f + 12) : 1) }}>
        <div style={{ fontWeight: 800, fontSize: 64, color: look.ink, fontVariantNumeric: 'tabular-nums' }}>{tReal.toFixed(3)} s</div>
        <div style={{ display: 'inline-block', marginTop: 6, padding: '4px 14px', borderRadius: 10, background: inReplay ? '#FF3B4E' : 'rgba(255,255,255,0.08)', fontWeight: 800, fontSize: 20, letterSpacing: '0.12em', color: inReplay ? '#fff' : look.sub }}>
          {inReplay ? `REPLAY · ${rp.slow}× SLOWER` : `REAL SPEED · ${data.size[0]} m RAMP`}
        </div>
      </div>
      {/* countdown */}
      {count > 0 && f > 60 ? (
        <div style={{ position: 'absolute', left: 300, width: 300, top: 760, textAlign: 'center', fontFamily: look.title.font, fontSize: 220, color: look.ink, opacity: 0.85 * (1 - ((data.start - f) % 60) / 60) ** 0.3 * 0.9, transform: `scale(${1.25 - 0.25 * spr(f, data.start - count * 60, 10)})` }}>{count}</div>
      ) : null}
      {f >= data.start && f < data.start + 40 ? (
        <div style={{ position: 'absolute', left: 250, width: 400, top: 790, textAlign: 'center', fontFamily: look.title.font, fontSize: 150, color: look.accent, opacity: 1 - lerp(f, data.start + 10, data.start + 40) }}>GO!</div>
      ) : null}
      <Title look={look} text={data.spec.title} sub={f < 90 ? data.spec.subtitle : undefined} f={f} day={data.spec.day} />
      {decided ? <Payoff look={look} f={f} at={res.f} text={fill(p.win ?? '{name} WINS!', { name: w.name })} sub={p.sub} color={w.color} y={820} /> : null}
      <Handle look={look} />
    </AbsoluteFill>
  );
};
