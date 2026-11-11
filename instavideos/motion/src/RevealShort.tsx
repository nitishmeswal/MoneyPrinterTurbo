/* Capsule World: reveal formats (seeded draws from engine/designed.py). */
import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { Look } from './accounts';
import { Backdrop, Handle, INOUT, Payoff, Short, Spec, Title, lerp, lookOf, spr, useData } from './kit';
import { Capsule, Cre, Creature, Egg, GiftBox, Step, Steps, TIER_COLOR, TierTag } from './props';

type D = { id: string; format: string; spec: Spec & Record<string, unknown>; frames: number; steps: Step[]; payoffAt: number; [k: string]: unknown };

export const RevealShort: React.FC<{ id: string }> = ({ id }) => {
  const d = useData<D>(id);
  if (!d) return null;
  return <Short id={id} render={(f) => <Scene d={d} f={f} />} />;
};

const CANDY = ['#FF8FC8', '#7FD4FF', '#B9A2FF', '#FFD36E', '#8FF0B6', '#FF9E7A'];

const SCENES: Record<string, React.FC<{ d: D; f: number; t: number; look: Look }>> = {
  'pick-capsule': PickCapsule,
  '100-pull': HundredPull,
  'gold-box': GoldBox,
  'egg-hatch': EggHatch,
  'rarity-ladder': Ladder,
  'box-layers': Layers,
};

const PAYOFF: Record<string, (d: D) => [string, string]> = {
  'pick-capsule': () => ['WHAT DID YOU GET?', 'Comment your creature'],
  '100-pull': (d) => [`MYTHIC AT PULL ${Number(d.first) + 1}!`, ''],
  'gold-box': (d) => [`BOX ${Number(d.gold) + 1}!`, 'Did you pick it?'],
  'egg-hatch': (d) => [`${(d.creature as Cre).tier.toUpperCase()}!`, `It's ${(d.creature as Cre).name}`],
  'rarity-ladder': () => ['WHICH ONE?', 'Comment 1 to 5'],
  'box-layers': (d) => [`${(d.creature as Cre).name.toUpperCase()}!`, `Tier: ${(d.creature as Cre).tier}`],
};

const Scene: React.FC<{ d: D; f: number }> = ({ d, f }) => {
  const look = lookOf(d.spec);
  const t = f / 60;
  const S = SCENES[d.format];
  const [text, sub] = PAYOFF[d.format](d);
  const P = d.payoffAt;
  return (
    <AbsoluteFill>
      <Backdrop look={look} f={f} />
      <Sparkles f={f} />
      <S d={d} f={f} t={t} look={look} />
      <Steps look={look} steps={d.steps} t={t} />
      <Title look={look} text={d.spec.title} f={f} day={d.spec.day} />
      <Payoff look={look} f={f} at={Math.round(P * 60)} text={text} sub={sub} y={d.format === '100-pull' ? 410 : 1110} color={d.format === 'pick-capsule' || d.format === 'rarity-ladder' ? undefined : look.accent} />
      <Handle look={look} />
    </AbsoluteFill>
  );
};

const Sparkles: React.FC<{ f: number }> = ({ f }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    {Array.from({ length: 26 }, (_, i) => {
      const x = (i * 397) % 1000;
      const y = (i * 613 + f * (0.3 + (i % 3) * 0.2)) % 1500;
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(f / 30 + i));
      return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill="#FFF7FB" opacity={0.25 * tw} />;
    })}
  </svg>
);

const Burst: React.FC<{ x: number; y: number; f: number; at: number; color: string; size?: number }> = ({ x, y, f, at, color, size = 1 }) => {
  const p = (f - at) / 40;
  if (p < 0 || p > 1) return null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <circle cx={x} cy={y} r={40 + 260 * size * Easing.out(Easing.cubic)(p)} fill="none" stroke={color} strokeWidth={14 * (1 - p)} opacity={1 - p} />
      {Array.from({ length: 14 }, (_, k) => {
        const a = (k / 14) * Math.PI * 2;
        const r = 220 * size * Easing.out(Easing.cubic)(p);
        return <circle key={k} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r} r={10 * (1 - p) * size + 2} fill={color} />;
      })}
    </svg>
  );
};

// ------------------------------------------------------------------ pick a capsule

function PickCapsule({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const picks = d.picks as Cre[];
  const opens = d.opens as number[];
  const [s0, s1] = d.shuffle as number[];
  const size = 200;
  const slot = (i: number) => ({ x: 228 + (i % 3) * 240, y: 600 + Math.floor(i / 3) * 330 });
  const mix = t > s0 && t < s1 ? Math.sin(Math.PI * Math.min(1, (t - s0) / (s1 - s0))) : 0;
  return (
    <>
      {picks.map((c, i) => {
        const base = slot(i);
        const ang = t * 3.2 + i * 1.05;
        const x = base.x + (468 - base.x) * mix * 0.55 + Math.cos(ang) * 150 * mix;
        const y = base.y + (760 - base.y) * mix * 0.55 + Math.sin(ang) * 120 * mix;
        const o = opens[i];
        const open = lerp(t, o, o + 0.45, 0, 1, INOUT);
        const shake = t > o - 0.6 && t < o ? 1 : 0;
        const pop = spr(f, Math.round(o * 60), 9, 0.6);
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: x - size / 2, top: y - size * 0.65 }}>
              {open < 1 ? <Capsule size={size} color={CANDY[i]} open={open} shake={shake} f={f} /> : null}
            </div>
            {t >= o ? (
              <div style={{ position: 'absolute', left: x - 110, top: y - 150, transform: `scale(${pop})` }}>
                <Creature c={c} size={220} f={f} bounce={1 - Math.min(1, (f - o * 60) / 20)} />
              </div>
            ) : null}
            {t >= o + 0.3 ? (
              <div style={{ position: 'absolute', left: x - 120, width: 240, top: y + 70, opacity: lerp(t, o + 0.3, o + 0.6) }}>
                <TierTag c={c} look={look} scale={0.62} />
              </div>
            ) : (
              <div style={{ position: 'absolute', left: x - 30, width: 60, top: y + 125, textAlign: 'center', fontFamily: look.body, fontWeight: 700, fontSize: 40, color: look.sub, opacity: 1 - mix }}>{i + 1}</div>
            )}
            <Burst x={x} y={y - 40} f={f} at={o * 60} color={TIER_COLOR[c.t]} size={0.5 + 0.2 * c.t} />
          </React.Fragment>
        );
      })}
    </>
  );
}

// ------------------------------------------------------------------ 100 pulls

function HundredPull({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const pulls = d.pulls as Cre[];
  const times = d.times as number[];
  const first = d.first as number;
  const odds = d.odds as number[];
  const tiers = d.tiers as string[];
  let k = -1;
  times.forEach((tt, i) => {
    if (t >= tt) k = i;
  });
  const cur = k >= 0 ? pulls[k] : null;
  const counts = [0, 0, 0, 0, 0];
  for (let i = 0; i <= k; i++) counts[pulls[i].t]++;
  const pop = k >= 0 ? spr(f, Math.round(times[k] * 60), 10, 0.5) : 0;
  const hit = k >= first;
  return (
    <>
      <div style={{ position: 'absolute', left: 40, width: 860, top: 420, display: 'flex', justifyContent: 'center', gap: 10, opacity: hit && t < d.payoffAt + 3 ? 0 : 1 }}>
        {tiers.map((tr, i) => (
          <div key={tr} style={{ padding: '8px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: `2px solid ${TIER_COLOR[i]}`, textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontFamily: look.body, fontWeight: 700, fontSize: 22, color: TIER_COLOR[i], letterSpacing: '0.06em' }}>{tr.toUpperCase()}</div>
            <div style={{ fontFamily: look.body, fontWeight: 700, fontSize: 20, color: look.sub }}>{Math.round(odds[i] * 100)}%</div>
            <div style={{ fontFamily: look.body, fontWeight: 700, fontSize: 38, color: look.ink, fontVariantNumeric: 'tabular-nums' }}>{counts[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, width: 936, top: 560, textAlign: 'center', fontFamily: look.body, fontWeight: 700, fontSize: 34, color: look.sub, letterSpacing: '0.12em' }}>PULL {Math.max(0, k + 1)}/100</div>
      {cur ? (
        <div style={{ position: 'absolute', left: 468 - 170, top: 610, transform: `scale(${0.5 + 0.5 * pop})` }}>
          <Creature c={cur} size={340} f={f} />
        </div>
      ) : null}
      {cur ? (
        <div style={{ position: 'absolute', left: 168, width: 600, top: 945 }}>
          <TierTag c={cur} look={look} scale={0.75} />
        </div>
      ) : null}
      <div style={{ position: 'absolute', left: 468 - 330, top: 1060, width: 660, display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: 6 }}>
        {pulls.map((c, i) => (
          <div key={i} style={{ width: 27, height: 27, borderRadius: 14, background: i <= k ? TIER_COLOR[c.t] : 'rgba(255,255,255,0.1)', boxShadow: i <= k && c.t >= 2 ? `0 0 12px ${TIER_COLOR[c.t]}` : 'none' }} />
        ))}
      </div>
      {hit ? <Burst x={468} y={780} f={f} at={times[first] * 60} color={TIER_COLOR[pulls[first].t]} size={1.4} /> : null}
    </>
  );
}

// ------------------------------------------------------------------ gold box

function GoldBox({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const n = d.boxes as number;
  const opens = d.opens as { box: number; t: number; gold: boolean }[];
  const near = d.near as number;
  const size = n === 3 ? 230 : 190;
  const pos = (i: number) => (n === 3 ? { x: 228 + i * 240, y: 760 } : { x: (i < 3 ? 228 + i * 240 : 348 + (i - 3) * 240), y: i < 3 ? 600 : 920 });
  const colors = ['#FF8FC8', '#7FD4FF', '#B9A2FF', '#FFD36E', '#8FF0B6'];
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const o = opens.find((x) => x.box === i)!;
        const p = pos(i);
        const open = lerp(t, o.t, o.t + 0.5, 0, 1, INOUT);
        const shake = (t > o.t - 0.7 && t < o.t ? 1 : 0) + (i === near && t > o.t - 1.6 && t < o.t ? 0.8 : 0);
        const reveal = spr(f, Math.round(o.t * 60), 9, 0.6);
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: p.x - size / 2, top: p.y - size / 2 }}>
              <GiftBox size={size} color={colors[i]} ribbon="#FFF7FB" open={open} shake={shake} f={f} label={String(i + 1)} />
            </div>
            {t >= o.t && o.gold ? (
              <svg width={300} height={300} viewBox="-150 -150 300 300" style={{ position: 'absolute', left: p.x - 150, top: p.y - 230, transform: `scale(${reveal})`, overflow: 'visible' }}>
                {Array.from({ length: 16 }, (_, k) => {
                  const a = (k / 16) * Math.PI * 2 + f / 60;
                  return <path key={k} d={`M 0 0 L ${Math.cos(a - 0.08) * 170} ${Math.sin(a - 0.08) * 170} L ${Math.cos(a + 0.08) * 170} ${Math.sin(a + 0.08) * 170} Z`} fill="#FFD54F" opacity={0.3} />;
                })}
                <polygon points={Array.from({ length: 10 }, (_, k) => { const r = k % 2 ? 36 : 86; const a = (k * 36 - 90) * (Math.PI / 180); return `${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(' ')} fill="#FFD54F" stroke="#C99A00" strokeWidth={6} />
                <circle cx={-14} cy={-10} r={8} fill="#5A3E00" />
                <circle cx={14} cy={-10} r={8} fill="#5A3E00" />
                <path d="M -14 12 Q 0 24 14 12" stroke="#5A3E00" strokeWidth={5} fill="none" strokeLinecap="round" />
              </svg>
            ) : null}
            {t >= o.t + 0.2 && !o.gold ? (
              <div style={{ position: 'absolute', left: p.x - 100, width: 200, top: p.y - 170, textAlign: 'center', fontFamily: look.body, fontWeight: 700, fontSize: 40, color: look.sub, opacity: lerp(t, o.t + 0.2, o.t + 0.5) }}>empty</div>
            ) : null}
            {o.gold ? <Burst x={p.x} y={p.y - 80} f={f} at={o.t * 60} color="#FFD54F" size={1.2} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

// ------------------------------------------------------------------ egg hatch

function EggHatch({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const c = d.creature as Cre;
  const shakes = d.shakes as number[][];
  const cracks = (d.cracks as number[]).filter((x) => t >= x).length;
  const shake = shakes.some(([a, b]) => t >= a && t < b) ? 1 : 0;
  const P = d.payoffAt;
  const hatch = lerp(t, P, P + 0.45, 0, 1, INOUT);
  const pop = spr(f, Math.round(P * 60), 8, 0.6);
  const tiers = ['Common', 'Rare', 'Epic', 'Mythic', 'Secret'];
  return (
    <>
      <div style={{ position: 'absolute', left: 468 - 220, top: 500 }}>
        <Egg size={440} cracks={cracks} shake={shake * (0.6 + 0.2 * cracks)} f={f} hatch={hatch} />
      </div>
      {t >= P ? (
        <div style={{ position: 'absolute', left: 468 - 210, top: 560, transform: `scale(${pop})` }}>
          <Creature c={c} size={420} f={f} />
        </div>
      ) : null}
      <Burst x={468} y={760} f={f} at={P * 60} color={TIER_COLOR[c.t]} size={1.3} />
      <div style={{ position: 'absolute', left: 40, width: 860, top: 1040, display: 'flex', justifyContent: 'center', gap: 10 }}>
        {tiers.map((tr, i) => {
          const on = t >= P && i === c.t;
          return (
            <div key={tr} style={{ padding: '8px 16px', borderRadius: 99, border: `2px solid ${TIER_COLOR[i]}`, background: on ? TIER_COLOR[i] : 'transparent', color: on ? '#1A1530' : TIER_COLOR[i], fontFamily: look.body, fontWeight: 700, fontSize: 26, transform: `scale(${on ? 1.15 : 1})` }}>{tr}</div>
          );
        })}
      </div>
    </>
  );
}

// ------------------------------------------------------------------ rarity ladder

function Ladder({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const picks = d.picks as Cre[];
  const opens = d.opens as number[];
  return (
    <>
      {picks.map((c, i) => {
        const x = 130 + i * 170;
        const y = 760 - i * 40;
        const o = opens[i];
        const open = lerp(t, o, o + 0.4, 0, 1, INOUT);
        const pop = spr(f, Math.round(o * 60), 9, 0.6);
        const sz = 150 + i * 14;
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: x - 75, top: y - 90 }}>{open < 1 ? <Capsule size={150} color={TIER_COLOR[c.t]} open={open} shake={t > o - 0.5 && t < o ? 1 : 0} f={f} /> : null}</div>
            {t >= o ? (
              <div style={{ position: 'absolute', left: x - sz / 2, top: y - sz * 0.75, transform: `scale(${pop})` }}>
                <Creature c={c} size={sz} f={f} />
              </div>
            ) : null}
            <div style={{ position: 'absolute', left: x - 85, width: 170, top: y + 80, opacity: t >= o + 0.2 ? 1 : 0.4, textAlign: 'center' }}>
              {t >= o + 0.2 ? <TierTag c={c} look={look} scale={0.5} /> : <div style={{ fontFamily: look.body, fontWeight: 700, fontSize: 36, color: look.sub }}>{i + 1}</div>}
            </div>
            <Burst x={x} y={y - 20} f={f} at={o * 60} color={TIER_COLOR[c.t]} size={0.35 + 0.15 * i} />
          </React.Fragment>
        );
      })}
    </>
  );
}

// ------------------------------------------------------------------ nested boxes

const LAYER: Record<string, [string, string]> = {
  kraft: ['#C69C6D', '#8A6236'], velvet: ['#7B1E3A', '#E9C46A'], glass: ['rgba(170,220,255,0.55)', '#FFFFFF'], gold: ['#E9C46A', '#8A6A1E'],
  wood: ['#8B5A2B', '#E7C9A0'], candy: ['#FF8FC8', '#FFFFFF'], ice: ['#A8E6FF', '#FFFFFF'], star: ['#FFD54F', '#B388FF'],
};

function Layers({ d, f, t, look }: { d: D; f: number; t: number; look: Look }) {
  const layers = d.layers as string[];
  const opens = d.opens as number[];
  const c = d.creature as Cre;
  let k = 0;
  opens.forEach((o) => {
    if (t >= o + 0.5) k++;
  });
  const P = d.payoffAt;
  const pop = spr(f, Math.round(P * 60), 8, 0.6);
  return (
    <>
      {layers.map((name, i) => {
        if (i < k - 1) return null;
        const size = 480 - i * 80;
        const o = opens[i];
        const open = lerp(t, o, o + 0.5, 0, 1, INOUT);
        const rise = i > 0 ? lerp(t, opens[i - 1] + 0.2, opens[i - 1] + 0.8, 0, 1, Easing.out(Easing.back(1.4))) : 1;
        if (i > 0 && t < opens[i - 1] + 0.2) return null;
        const [col, rib] = LAYER[name];
        return (
          <div key={i} style={{ position: 'absolute', left: 468 - size / 2, top: 1080 - size - (1 - rise) * -120, opacity: open >= 1 ? 0 : 1, zIndex: i }}>
            <GiftBox size={size} color={col} ribbon={rib} open={open} shake={t > o - 0.5 && t < o ? 1 : 0} f={f} />
            <div style={{ position: 'absolute', left: 0, width: size, top: size + 10, textAlign: 'center', fontFamily: look.body, fontWeight: 700, fontSize: 30, color: look.sub, letterSpacing: '0.1em' }}>{`BOX ${i + 1}/${layers.length}`}</div>
          </div>
        );
      })}
      {t >= P ? (
        <div style={{ position: 'absolute', left: 468 - 200, top: 560, transform: `scale(${pop})` }}>
          <Creature c={c} size={400} f={f} />
        </div>
      ) : null}
      <Burst x={468} y={760} f={f} at={P * 60} color={TIER_COLOR[c.t]} size={1.3} />
    </>
  );
}

