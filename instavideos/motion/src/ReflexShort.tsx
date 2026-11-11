/* Reflex Lab: minigames that escalate round by round (timelines from engine/designed.py). */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Look } from './accounts';
import { Backdrop, Handle, Payoff, Short, Spec, Title, lerp, lookOf, spr, useData } from './kit';
import { Step, Steps } from './props';

type D = { id: string; format: string; spec: Spec & Record<string, unknown>; frames: number; steps: Step[]; payoffAt: number; [k: string]: unknown };

export const ReflexShort: React.FC<{ id: string }> = ({ id }) => {
  const d = useData<D>(id);
  if (!d) return null;
  return <Short id={id} render={(f) => <Scene d={d} f={f} />} />;
};

const PAL = ['#38EF7D', '#FF4D6D', '#4CC9F0', '#FFD166', '#B892FF', '#FF9F1C'];
const WORD_COL: Record<string, string> = { RED: '#FF4D6D', BLUE: '#4C8DF0', GREEN: '#38EF7D', YELLOW: '#FFD166', PURPLE: '#B892FF' };

const SCENES: Record<string, React.FC<{ d: D; f: number; t: number; look: Look }>> = {
  'stop-green': StopGreen,
  'count-balls': CountBalls,
  'odd-one': OddOne,
  stroop: Stroop,
  'memory-flash': Memory,
  'pause-ten': PauseTen,
};

const PAYOFF: Record<string, (d: D) => [string, string]> = {
  'stop-green': () => ['WHICH ROUND?', 'Comment the round you failed'],
  'count-balls': (d) => { const r = d.rounds as { n: number }[]; return [`${r[r.length - 1].n} BALLS!`, 'How close were you?']; },
  'odd-one': () => ['FOUND IT?', 'Comment how many you got'],
  stroop: (d) => [`${(d.words as unknown[]).length} WORDS`, 'Comment your score'],
  'memory-flash': (d) => { const r = d.rounds as { seq: number[] }[]; return [`ALL ${r[r.length - 1].seq.length}?`, 'Comment your last round']; },
  'pause-ten': () => ['DID YOU HIT 10.00?', 'Comment your number'],
};

const Scene: React.FC<{ d: D; f: number }> = ({ d, f }) => {
  const look = lookOf(d.spec);
  const t = f / 60;
  const S = SCENES[d.format];
  const [text, sub] = PAYOFF[d.format](d);
  const steps = d.steps.filter((s) => s.t0 < d.payoffAt - 0.01);
  return (
    <AbsoluteFill>
      <Backdrop look={look} f={f} />
      <Grid f={f} look={look} />
      <S d={d} f={f} t={t} look={look} />
      <Steps look={look} steps={steps} t={t} />
      <Title look={look} text={d.spec.title} f={f} day={d.spec.day} />
      <Payoff look={look} f={f} at={Math.round(d.payoffAt * 60)} text={text} sub={sub} y={1110} />
      <Handle look={look} />
    </AbsoluteFill>
  );
};

const Grid: React.FC<{ f: number; look: Look }> = ({ f, look }) => (
  <AbsoluteFill style={{ backgroundImage: `linear-gradient(${look.accent}10 1px, transparent 1px), linear-gradient(90deg, ${look.accent}10 1px, transparent 1px)`, backgroundSize: '60px 60px', backgroundPosition: `0 ${(f * 0.5) % 60}px`, opacity: 0.6 }} />
);

const RoundTag: React.FC<{ look: Look; text: string }> = ({ look, text }) => (
  <div style={{ position: 'absolute', left: 0, width: 936, top: 410, textAlign: 'center', fontFamily: look.body, fontWeight: 700, fontSize: 32, letterSpacing: '0.16em', color: look.accent }}>{text}</div>
);

// ------------------------------------------------------------------ stop on green

function StopGreen({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const rounds = d.rounds as { t0: number; t1: number; speed: number; zone: number }[];
  let i = 0;
  rounds.forEach((r, k) => {
    if (t >= r.t0 - 1) i = k;
  });
  const r = rounds[i];
  const run = t >= r.t0 && t < r.t1;
  const ang = run ? 80 * Math.sin(2 * Math.PI * r.speed * (t - r.t0)) : t >= r.t1 ? 80 * Math.sin(2 * Math.PI * r.speed * (r.t1 - r.t0)) : -80;
  const cx = 468;
  const cy = 980;
  const R = 380;
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [cx + R * Math.sin((a * Math.PI) / 180), cy - R * Math.cos((a * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
  };
  const inZone = Math.abs(ang) < r.zone / 2;
  return (
    <>
      <RoundTag look={look} text={`ROUND ${i + 1}/${rounds.length} · SPEED ×${r.speed}`} />
      <svg width={936} height={1300} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={arc(-85, 85)} stroke="rgba(255,77,109,0.55)" strokeWidth={70} fill="none" />
        <path d={arc(-r.zone / 2, r.zone / 2)} stroke="#38EF7D" strokeWidth={84} fill="none" style={{ filter: 'drop-shadow(0 0 14px #38EF7D)' }} />
        <g transform={`rotate(${ang} ${cx} ${cy})`}>
          <path d={`M ${cx - 12} ${cy} L ${cx} ${cy - R - 40} L ${cx + 12} ${cy} Z`} fill={inZone ? '#38EF7D' : '#EAFBF2'} />
        </g>
        <circle cx={cx} cy={cy} r={34} fill="#EAFBF2" />
      </svg>
    </>
  );
}

// ------------------------------------------------------------------ count the balls

function CountBalls({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const rounds = d.rounds as { t: number; flash: number; q: number; a: number; n: number; pts: number[][] }[];
  let i = 0;
  rounds.forEach((r, k) => {
    if (t >= r.t - 1) i = k;
  });
  const r = rounds[i];
  const showing = t >= r.t && t < r.t + r.flash;
  const answered = t >= r.a;
  const pop = spr(f, Math.round(r.a * 60), 10);
  return (
    <>
      <RoundTag look={look} text={`ROUND ${i + 1}/${rounds.length}`} />
      {(showing || answered) && r.pts.map(([x, y, c], k) => (
        <div key={k} style={{ position: 'absolute', left: x - 28, top: y - 28, width: 56, height: 56, borderRadius: 28, background: PAL[c], opacity: answered ? 0.25 : 1, transform: `scale(${showing ? spr(f, Math.round(r.t * 60) + (k % 5), 14) : 1})`, boxShadow: answered ? 'none' : `0 0 16px ${PAL[c]}` }} />
      ))}
      {answered ? (
        <div style={{ position: 'absolute', left: 0, width: 936, top: 760, textAlign: 'center', transform: `scale(${pop})` }}>
          <div style={{ fontFamily: look.title.font, fontWeight: 700, fontSize: 260, color: look.accent, lineHeight: 1 }}>{r.n}</div>
        </div>
      ) : null}
    </>
  );
}

// ------------------------------------------------------------------ odd one out

function OddOne({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const rounds = d.rounds as { t: number; a: number; n: number; odd: number[]; diff: number }[];
  const shape = String(d.shape);
  let i = 0;
  rounds.forEach((r, k) => {
    if (t >= r.t - 1) i = k;
  });
  const r = rounds[i];
  if (t < r.t) return <RoundTag look={look} text={`ROUND ${i + 1}/${rounds.length}`} />;
  const area = 700;
  const cell = area / r.n;
  const answered = t >= r.a;
  const draw = (odd: boolean, s: number) => {
    const rot = odd && shape !== 'circle' ? r.diff * 160 : 0;
    const col = odd && shape === 'circle' ? `hsl(${150 + r.diff * 140}, 85%, 58%)` : 'hsl(150, 85%, 58%)';
    const sz = s * (odd && shape === 'circle' ? 1 - r.diff * 0.6 : 1);
    if (shape === 'square') return <rect x={-sz / 2} y={-sz / 2} width={sz} height={sz} rx={sz * 0.12} fill={col} transform={`rotate(${rot})`} />;
    if (shape === 'triangle') return <polygon points={`0,${-sz / 2} ${sz / 2},${sz / 2.4} ${-sz / 2},${sz / 2.4}`} fill={col} transform={`rotate(${rot})`} />;
    if (shape === 'star')
      return <polygon points={Array.from({ length: 10 }, (_, k) => { const rr = k % 2 ? sz * 0.22 : sz * 0.5; const a = (k * 36 - 90) * (Math.PI / 180); return `${Math.cos(a) * rr},${Math.sin(a) * rr}`; }).join(' ')} fill={col} transform={`rotate(${rot})`} />;
    return <circle r={sz / 2} fill={col} />;
  };
  return (
    <>
      <RoundTag look={look} text={`ROUND ${i + 1}/${rounds.length} · ${r.n}×${r.n}`} />
      <svg width={area} height={area} style={{ position: 'absolute', left: 468 - area / 2, top: 470 }}>
        {Array.from({ length: r.n * r.n }, (_, k) => {
          const rr = Math.floor(k / r.n);
          const cc = k % r.n;
          const odd = rr === r.odd[0] && cc === r.odd[1];
          return (
            <g key={k} transform={`translate(${cc * cell + cell / 2} ${rr * cell + cell / 2})`} opacity={answered && !odd ? 0.25 : 1}>
              {draw(odd, cell * 0.7)}
            </g>
          );
        })}
        {answered ? <circle cx={r.odd[1] * cell + cell / 2} cy={r.odd[0] * cell + cell / 2} r={cell * 0.62 * spr(f, Math.round(r.a * 60), 10)} fill="none" stroke="#FFD166" strokeWidth={8} /> : null}
      </svg>
    </>
  );
}

// ------------------------------------------------------------------ colour word

function Stroop({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const words = d.words as { t: number; word: string; color: string }[];
  let i = -1;
  words.forEach((w, k) => {
    if (t >= w.t) i = k;
  });
  if (i < 0) return null;
  const w = words[i];
  const pop = spr(f, Math.round(w.t * 60), 16, 0.4);
  return (
    <>
      <RoundTag look={look} text={`WORD ${i + 1}/${words.length}`} />
      <div style={{ position: 'absolute', left: 0, width: 936, top: 690, textAlign: 'center', transform: `scale(${0.7 + 0.3 * pop})` }}>
        <div style={{ fontFamily: look.title.font, fontWeight: 700, fontSize: 190, letterSpacing: '-0.02em', color: WORD_COL[w.color] }}>{w.word}</div>
      </div>
      <div style={{ position: 'absolute', left: 160, width: 616, top: 990, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: `${((i + 1) / words.length) * 100}%`, height: '100%', borderRadius: 6, background: look.accent }} />
      </div>
    </>
  );
}

// ------------------------------------------------------------------ memory flash

function Memory({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const rounds = d.rounds as { t: number; seq: number[]; q: number; a: number }[];
  let i = 0;
  rounds.forEach((r, k) => {
    if (t >= r.t - 1.2) i = k;
  });
  const r = rounds[i];
  let lit = -1;
  r.seq.forEach((c, k) => {
    const s = r.t + 0.55 * k;
    if (t >= s && t < s + 0.42) lit = c;
  });
  const answered = t >= r.a;
  return (
    <>
      <RoundTag look={look} text={`ROUND ${i + 1}/${rounds.length} · ${r.seq.length} COLOURS`} />
      <div style={{ position: 'absolute', left: 468 - 330, top: 500, width: 660, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }}>
        {PAL.map((c, k) => (
          <div key={k} style={{ height: 190, borderRadius: 40, background: c, opacity: lit === k ? 1 : 0.22, transform: `scale(${lit === k ? 1.06 : 1})`, boxShadow: lit === k ? `0 0 60px ${c}` : 'none' }} />
        ))}
      </div>
      {answered ? (
        <div style={{ position: 'absolute', left: 40, width: 856, top: 960, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {r.seq.map((c, k) => (
            <div key={k} style={{ width: 70, height: 70, borderRadius: 35, background: PAL[c], transform: `scale(${spr(f, Math.round((r.a + 0.18 * k) * 60), 11)})`, boxShadow: `0 0 18px ${PAL[c]}` }} />
          ))}
        </div>
      ) : null}
    </>
  );
}

// ------------------------------------------------------------------ pause at 10.00

function PauseTen({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const rounds = d.rounds as { t0: number; rate: number }[];
  let i = 0;
  rounds.forEach((r, k) => {
    if (t >= r.t0 - 1.2) i = k;
  });
  const r = rounds[i];
  // whole frames, so exactly 10.00 is on screen for one frame (no float drift)
  const raw = Math.max(0, ((f - Math.round(r.t0 * 60)) * r.rate) / 60);
  const end = 10 + 0.6 * r.rate;
  const v = Math.min(raw, end);
  const frozen = raw >= end;
  const shown = Math.floor(v * 100 + 1e-6) / 100;
  const exact = shown.toFixed(2) === '10.00';
  return (
    <>
      <RoundTag look={look} text={`ROUND ${i + 1}/${rounds.length} · ×${r.rate}`} />
      <svg width={936} height={1300} style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx={468} cy={800} r={300} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={26} />
        <circle cx={468} cy={800} r={300} fill="none" stroke={exact ? '#FFD166' : look.accent} strokeWidth={26} strokeDasharray={2 * Math.PI * 300} strokeDashoffset={2 * Math.PI * 300 * (1 - Math.min(1, v / 10))} transform="rotate(-90 468 800)" strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: 0, width: 936, top: 690, textAlign: 'center', fontFamily: look.title.font, fontWeight: 700, fontSize: 200, color: exact ? '#FFD166' : look.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
        {shown.toFixed(2)}
      </div>
      {frozen ? <div style={{ position: 'absolute', left: 0, width: 936, top: 452, textAlign: 'center', fontFamily: look.body, fontWeight: 700, fontSize: 36, color: look.sub, opacity: lerp(t, r.t0 + end / r.rate, r.t0 + end / r.rate + 0.3) }}>10.00 was on screen for 1 frame</div> : null}
    </>
  );
}

