/* Mind Reader: designed tricks (timelines from engine/designed.py, verified there). */
import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { Look } from './accounts';
import { Backdrop, Handle, INOUT, Payoff, Short, Spec, Title, lerp, lookOf, spr, useData } from './kit';
import { Card, Cup, Envelope, Step, Steps } from './props';

type D = { id: string; format: string; spec: Spec & Record<string, unknown>; frames: number; steps: Step[]; payoffAt: number; [k: string]: unknown };

export const TrickShort: React.FC<{ id: string }> = ({ id }) => {
  const d = useData<D>(id);
  if (!d) return null;
  return <Short id={id} render={(f) => <Scene d={d} f={f} />} />;
};

const SCENES: Record<string, React.FC<{ d: D; f: number; t: number; look: Look }>> = {
  'card-gone': CardGone,
  'number-force': NumberForce,
  '1089': Envelope1089,
  'finger-walk': FingerWalk,
  shells: Shells,
  morph: Morph,
  wheel: Wheel,
};

const PAYOFF: Record<string, (d: D) => [string, string]> = {
  'card-gone': () => ['YOUR CARD IS GONE!', 'Comment if it worked'],
  'number-force': (d) => [`IT'S ${d.answer}!`, 'Comment if I got it'],
  '1089': () => ['1089!', 'Was that your answer?'],
  'finger-walk': (d) => [`YOU'RE ON ${d.label}!`, 'Did I find your finger?'],
  shells: (d) => [`${(d.names as string[])[d.finalSlot as number]} CUP!`, 'Did you track it?'],
  morph: (d) => [`IT'S A ${String(d.spec.target).toUpperCase()} NOW!`, 'Did yours change too?'],
  wheel: (d) => ['BLUE, RIGHT?', `blue covers ${Math.round(Number(d.blueShare) * 100)}% of the wheel`],
};

const Scene: React.FC<{ d: D; f: number }> = ({ d, f }) => {
  const look = lookOf(d.spec);
  const t = f / 60;
  const S = SCENES[d.format];
  const [text, sub] = PAYOFF[d.format](d);
  return (
    <AbsoluteFill>
      <Backdrop look={look} f={f} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 40% at 45% 45%, rgba(255,240,200,0.10), transparent 70%)' }} />
      <S d={d} f={f} t={t} look={look} />
      <Steps look={look} steps={d.steps} t={t} />
      <Title look={look} text={d.spec.title} f={f} day={d.spec.day} />
      <Payoff look={look} f={f} at={Math.round(d.payoffAt * 60)} text={text} sub={sub} y={1110} />
      <Handle look={look} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ card gone

function CardGone({ d, f, t }: { d: D; f: number; t: number; look: Look }) {
  const s1 = d.set1 as string[];
  const s2 = d.set2 as string[];
  const deal = d.deal as number[];
  const [sh0, sh1] = d.shuffle as number[];
  const flipAt = d.flipAt as number;
  const back = String(d.spec.back ?? '#8B1E2D');
  const w = 210;
  const grid = (i: number, n: number) => {
    const row = i < 3 ? 0 : 1;
    const inRow = row === 0 ? Math.min(3, n) : n - 3;
    const col = row === 0 ? i : i - 3;
    const x = 468 - ((inRow - 1) * (w + 40)) / 2 + col * (w + 40) - w / 2;
    return { x, y: 470 + row * (w * 1.4 + 36) };
  };
  if (t < deal[0] - 0.5) {
    const gather = lerp(t, sh0, sh0 + 0.6, 0, 1, INOUT);
    return (
      <>
        {s1.map((c, i) => {
          const g = grid(i, 6);
          const flip = lerp(t, flipAt + i * 0.05, flipAt + i * 0.05 + 0.35, 0, 1, INOUT);
          const jit = t > sh0 + 0.6 && t < sh1 ? Math.sin(t * 14 + i * 2) * 60 : 0;
          const x = g.x + (468 - w / 2 - g.x) * gather + jit;
          const y = g.y + (650 - g.y) * gather + (t > sh0 + 0.6 && t < sh1 ? Math.cos(t * 11 + i) * 26 : 0) - i * 2 * gather;
          const sway = Math.sin(f / 30 + i) * 2 * (1 - gather);
          const glow = t > sh1 + 0.3 ? 0.4 + 0.3 * Math.sin(t * 6) : 0;
          return (
            <div key={c} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${sway + (gather ? (i - 2.5) * 3 : 0)}deg)` }}>
              <Card code={c} w={w} flip={flip} back={back} glow={i === 5 ? glow : 0} />
            </div>
          );
        })}
      </>
    );
  }
  return (
    <>
      {s2.map((c, i) => {
        const at = deal[i];
        const p = lerp(t, at - 0.35, at, 0, 1, Easing.out(Easing.cubic));
        if (p <= 0) return null;
        const g = grid(i, 5);
        const x = 468 - w / 2 + (g.x - (468 - w / 2)) * p;
        const y = 650 + (g.y - 650) * p;
        const flip = 1 - lerp(t, at - 0.1, at + 0.2, 0, 1, INOUT);
        return (
          <div key={c} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${(1 - p) * 10}deg)` }}>
            <Card code={c} w={w} flip={flip} back={back} />
          </div>
        );
      })}
      {t < deal[4] ? (
        <div style={{ position: 'absolute', left: 468 - w / 2, top: 650 }}>
          <Card code="AS" w={w} flip={1} back={back} />
        </div>
      ) : null}
    </>
  );
}

// ------------------------------------------------------------------ number force

function NumberForce({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const ops = d.ops as string[];
  const marks = d.marks as number[];
  const P = d.payoffAt;
  const drop = spr(f, Math.round((P - 0.25) * 60), 9, 0.7);
  const pulse = 1 + 0.04 * Math.sin(t * 4);
  return (
    <>
      <div style={{ position: 'absolute', left: 468 - 170, top: 520, width: 340, height: 340, borderRadius: 170, background: 'radial-gradient(circle at 35% 30%, #fff 0%, #E9C46A 30%, #8A6A1E 100%)', boxShadow: '0 0 80px rgba(233,196,106,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t >= P - 0.25 ? 0.6 + 0.4 * drop : pulse}) translateY(${t >= P - 0.25 ? (1 - drop) * -600 : 0}px)` }}>
        <div style={{ fontFamily: look.title.font, fontWeight: 900, fontSize: 210, color: '#2A1E05' }}>{t >= P - 0.25 ? String(d.answer) : '?'}</div>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 820, top: 920, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {ops.map((o, i) => {
          const p = spr(f, Math.round(marks[i] * 60), 12);
          return (
            <div key={i} style={{ padding: '14px 22px', borderRadius: 18, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(233,196,106,0.5)', fontFamily: look.body, fontWeight: 800, fontSize: 46, color: look.ink, opacity: p, transform: `scale(${p})` }}>{o}</div>
          );
        })}
      </div>
    </>
  );
}

// ------------------------------------------------------------------ 1089

function Envelope1089({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const openAt = d.payoffAt - 1.1;
  const open = lerp(t, openAt, openAt + 0.9, 0, 1, INOUT);
  const float = Math.sin(f / 28) * 10;
  return (
    <div style={{ position: 'absolute', left: 468 - 330, top: 680 + float, transform: `rotate(${-3 + Math.sin(f / 50) * 2}deg)` }}>
      <div style={{ textAlign: 'center', fontFamily: look.body, fontWeight: 800, fontSize: 32, letterSpacing: '0.3em', color: look.accent, marginBottom: 18, opacity: 1 - open }}>MY PREDICTION</div>
      <Envelope w={660} open={open}>
        <div style={{ fontFamily: look.title.font, fontWeight: 900, fontSize: 170, color: '#1C1C1C' }}>{String(d.answer)}</div>
      </Envelope>
    </div>
  );
}

// ------------------------------------------------------------------ finger walk

function FingerWalk({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const n = d.n as number;
  const plan = d.plan as { steps: number; remove: number[][] }[];
  const times = d.times as { move: number; remove: number }[];
  const final = d.final as number[];
  const P = d.payoffAt;
  const gap = 156;
  const x0 = 468 - ((n - 1) * gap) / 2;
  const y0 = 500;
  const removedAt = new Map<string, number>();
  plan.forEach((p, i) => p.remove.forEach(([r, c], k) => removedAt.set(`${r},${c}`, times[i].remove + 0.05 * k)));
  const cards = spr(f, Math.round(P * 60), 12);
  return (
    <>
      {Array.from({ length: n * n }, (_, k) => {
        const r = Math.floor(k / n);
        const c = k % n;
        const at = removedAt.get(`${r},${c}`);
        const gone = at !== undefined ? lerp(t, at, at + 0.3, 0, 1) : 0;
        if (gone >= 1) return null;
        const red = (r + c) % 2 === 0;
        const isFinal = r === final[0] && c === final[1];
        const glow = isFinal && t >= P - 0.6 ? 1 : 0;
        const bob = Math.sin(f / 22 + k) * 3;
        return (
          <div key={k} style={{ position: 'absolute', left: x0 + c * gap - 58, top: y0 + r * gap - 58 + bob, width: 116, height: 116, borderRadius: 58, background: glow ? 'radial-gradient(circle at 35% 30%, #fff, #E9C46A 40%, #8A6A1E)' : red ? 'radial-gradient(circle at 35% 30%, #ffb3ad, #D63A3A 45%, #7E1414)' : 'radial-gradient(circle at 35% 30%, #fff, #F1E6CF 45%, #B8A888)', boxShadow: glow ? '0 0 70px rgba(233,196,106,0.9)' : '0 10px 20px rgba(0,0,0,0.35)', transform: `scale(${(1 - gone) * (1 + glow * 0.15)})`, opacity: 1 - gone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: look.body, fontWeight: 800, fontSize: 40, color: red && !glow ? '#fff' : '#3A2A10' }}>
            {k + 1}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 468 - 120, top: 1240 - 400 * cards, opacity: cards, transform: `rotate(${(1 - cards) * 20}deg)` }}>
        <div style={{ width: 240, padding: '18px 0', borderRadius: 18, background: '#FBF7EE', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ fontFamily: look.body, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: '#7A6A4A' }}>PREDICTION</div>
          <div style={{ fontFamily: look.title.font, fontWeight: 900, fontSize: 96, color: '#1C1C1C' }}>{String(d.label)}</div>
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ shells

function Shells({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const swaps = d.swaps as { t: number; d: number; a: number; b: number }[];
  const ball = d.ball as number;
  const slotX = (s: number) => 468 + (s - 1) * 270;
  const cupY = 760;
  // slot of each cup over time (a and b in swaps are slot indices)
  const slot = [0, 1, 2];
  const off: Record<number, { x: number; y: number }> = {};
  for (const s of swaps) {
    if (t < s.t) break;
    const ca = slot.indexOf(s.a);
    const cb = slot.indexOf(s.b);
    if (t < s.t + s.d) {
      const p = INOUT((t - s.t) / s.d);
      off[ca] = { x: slotX(s.a) + (slotX(s.b) - slotX(s.a)) * p, y: cupY - Math.sin(Math.PI * p) * 70 };
      off[cb] = { x: slotX(s.b) + (slotX(s.a) - slotX(s.b)) * p, y: cupY + Math.sin(Math.PI * p) * 70 };
      break;
    }
    slot[ca] = s.b;
    slot[cb] = s.a;
  }
  const P = d.payoffAt;
  const showLift = Math.min(lerp(t, 1.0, 1.4, 0, 1, INOUT), 1 - lerp(t, 2.8, 3.2, 0, 1, INOUT));
  const endLift = lerp(t, P - 0.1, P + 0.35, 0, 1, INOUT);
  const lift = Math.max(showLift, endLift);
  const ballCup = ball;
  const bx = off[ballCup]?.x ?? slotX(slot[ballCup]);
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: cupY + 210, width: 820, height: 26, borderRadius: 13, background: 'rgba(0,0,0,0.25)' }} />
      {lift > 0.02 ? <div style={{ position: 'absolute', left: bx - 42, top: cupY + 130, width: 84, height: 84, borderRadius: 42, background: 'radial-gradient(circle at 35% 30%, #fff, #E9C46A 40%, #8A6A1E)', boxShadow: '0 0 30px rgba(233,196,106,0.7)' }} /> : null}
      {[0, 1, 2].map((c) => {
        const x = off[c]?.x ?? slotX(slot[c]);
        const y = off[c]?.y ?? cupY;
        return (
          <div key={c} style={{ position: 'absolute', left: x - 110, top: y }}>
            <Cup w={220} lift={lift} />
          </div>
        );
      })}
      {t > P - 2.8 && t < P ? (
        <div style={{ position: 'absolute', left: 0, width: 936, top: cupY + 260, display: 'flex', justifyContent: 'center', gap: 120 }}>
          {['LEFT', 'MIDDLE', 'RIGHT'].map((n) => (
            <div key={n} style={{ fontFamily: look.body, fontWeight: 800, fontSize: 30, letterSpacing: '0.12em', color: look.sub }}>{n}</div>
          ))}
        </div>
      ) : null}
    </>
  );
}

// ------------------------------------------------------------------ morph

const shapePts = (name: string, n = 72): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    let r = 1;
    const poly = (k: number, rot = -Math.PI / 2) => {
      const seg = (Math.PI * 2) / k;
      const aa = a - rot;
      const m = ((aa % seg) + seg) % seg - seg / 2;
      return Math.cos(seg / 2) / Math.cos(m);
    };
    if (name === 'square') r = poly(4, -Math.PI / 4 - Math.PI / 2 + Math.PI / 4);
    else if (name === 'triangle') r = poly(3) * 0.95;
    else if (name === 'hexagon') r = poly(6);
    else if (name === 'diamond') r = poly(4) * 1.05;
    else if (name === 'star') {
      const k = 5;
      const seg = (Math.PI * 2) / k;
      const aa = ((a + Math.PI / 2) % seg + seg) % seg;
      const tt = Math.abs(aa - seg / 2) / (seg / 2);
      r = 0.45 + 0.55 * tt;
    } else if (name === 'heart') {
      const tt = (i / n) * Math.PI * 2;
      const x = 16 * Math.sin(tt) ** 3;
      const y = -(13 * Math.cos(tt) - 5 * Math.cos(2 * tt) - 2 * Math.cos(3 * tt) - Math.cos(4 * tt));
      pts.push([x / 17, y / 17]);
      continue;
    } else if (name === 'moon') {
      const tt = (i / n) * Math.PI * 2;
      if (tt < Math.PI) pts.push([Math.cos(tt + Math.PI / 2), Math.sin(tt + Math.PI / 2) * -1]);
      else {
        const u = tt - Math.PI;
        pts.push([0.35 + 0.7 * Math.cos(-u + Math.PI / 2) * 0.9 - 0.35, -Math.sin(-u + Math.PI / 2) * 0.9]);
      }
      continue;
    }
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
};

function Morph({ d, f, t }: { d: D; f: number; t: number; look: Look }) {
  const shapes = d.shapes as string[];
  const target = String(d.spec.target);
  const stages = d.stages as number[];
  const colors = ['#E5484D', '#4D9DFF', '#3DDC84', '#FFD23F', '#FF6FB5', '#B07CFF'];
  return (
    <>
      {shapes.map((s, i) => {
        const seq = [s, ...stages.map((_, k) => (k === stages.length - 1 ? target : shapes[(i + k + 1) % shapes.length]))];
        let k = 0;
        stages.forEach((st, j) => {
          if (t >= st) k = j + 1;
        });
        const from = shapePts(seq[Math.max(0, k - (t < (stages[k - 1] ?? -9) + 0.6 ? 1 : 0))]);
        const st = stages[k - 1] ?? -9;
        const p = k === 0 ? 1 : lerp(t, st, st + 0.6, 0, 1, INOUT);
        const a = shapePts(seq[Math.max(0, k - 1)]);
        const b = shapePts(seq[k]);
        const pts = (k === 0 ? from : a.map((q, m) => [q[0] + (b[m][0] - q[0]) * p, q[1] + (b[m][1] - q[1]) * p]))
          .map(([x, y]) => `${(x * 110).toFixed(1)},${(y * 110).toFixed(1)}`)
          .join(' ');
        const col = k >= stages.length ? '#E9C46A' : colors[(i + k) % colors.length];
        const cx = 228 + (i % 3) * 240;
        const cy = 600 + Math.floor(i / 3) * 290;
        return (
          <svg key={i} width={260} height={260} viewBox="-130 -130 260 260" style={{ position: 'absolute', left: cx - 130, top: cy - 130 + Math.sin(f / 25 + i) * 6 }}>
            <polygon points={pts} fill={col} stroke="rgba(255,255,255,0.7)" strokeWidth={4} style={{ filter: `drop-shadow(0 0 18px ${col})` }} />
          </svg>
        );
      })}
    </>
  );
}

// ------------------------------------------------------------------ wheel

function Wheel({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const slices = d.slices as string[];
  const n = slices.length;
  const [s0, s1] = d.spin as number[];
  const col: Record<string, string> = { blue: '#3D7BFF', red: '#E5484D', green: '#2FBF71', yellow: '#F2C14E' };
  // final angle chosen so the pointer (top) rests in the middle of a blue run
  let stop = 0;
  for (let k = 0; k < n; k++) if (slices[k] === 'blue' && slices[(k + 1) % n] === 'blue' && slices[(k + n - 1) % n] === 'blue') stop = k;
  const total = 360 * 9 + (360 - (stop + 0.5) * (360 / n));
  const p = lerp(t, s0, s1, 0, 1, Easing.out(Easing.cubic));
  const ang = total * p;
  const R = 330;
  const cx = 468;
  const cy = 800;
  const flash = t < s1 - 3 && Math.floor(t * 2) % 2 === 0;
  return (
    <>
      <svg width={936} height={1000} style={{ position: 'absolute', left: 0, top: 380 }}>
        <g transform={`translate(${cx} ${cy - 380}) rotate(${ang})`}>
          {slices.map((s, k) => {
            const a0 = ((k / n) * 360 - 90) * (Math.PI / 180);
            const a1 = (((k + 1) / n) * 360 - 90) * (Math.PI / 180);
            return <path key={k} d={`M 0 0 L ${R * Math.cos(a0)} ${R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`} fill={col[s]} stroke="#0E2A20" strokeWidth={2} />;
          })}
          <circle r={50} fill="#F6EEDC" stroke="#0E2A20" strokeWidth={6} />
        </g>
        <path d={`M ${cx - 34} ${cy - 380 - R - 40} L ${cx + 34} ${cy - 380 - R - 40} L ${cx} ${cy - 380 - R + 26} Z`} fill="#F6EEDC" stroke="#0E2A20" strokeWidth={5} />
      </svg>
      {t > s0 + 0.6 && t < s1 - 3 ? <div style={{ position: 'absolute', left: cx - R - 14, top: cy - R - 14, width: 2 * R + 28, height: 2 * R + 28, borderRadius: R + 14, border: `6px solid ${flash ? look.accent : 'transparent'}` }} /> : null}
    </>
  );
}


