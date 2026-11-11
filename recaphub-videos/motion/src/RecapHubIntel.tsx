/* RecapHub · Event Intelligence promo, ~38 s, a living data map: 40 speakers as
 * dots that cluster into themes, branch into the questions people argued over,
 * settle on stances, and end on debates marked Split / Emerging consensus /
 * Unresolved (the app's DebateResolution labels). Contradictions between
 * speakers are computed but not in the app yet, so the film never shows them.
 * Hook: "What did 40 speakers actually agree on?"
 * Music: music-rh-intel.wav (compose.py intel), 110 BPM, B minor. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-intel.json';
import { Ctx, Reveal, Timeline, count, lerp, rnd, spr, EXPO, INOUT } from './kit';
import { R, MONO, SANS, Avatar, Browser, SPEAKERS, abs, card, centerRow, hasRec, head, label, serif } from './rh';
import { EndCard, Film, Lead, Slam, sfxKit } from './ui';

const tl = tlJson as Timeline;

const N = 40;
const INITIALS = ['PR', 'TO', 'MA', 'JL', 'SK', 'DB', 'LM', 'AC', 'RN', 'EV', 'KS', 'HW', 'BF', 'YT', 'GM', 'OP', 'IC', 'NA', 'DS', 'LF'];
const DOT = (i: number) => ({ i: INITIALS[i % INITIALS.length], bg: [R.brand100, R.sand, R.muted][i % 3], fg: i % 3 === 0 ? R.brand600 : R.ink });
const grid = (i: number) => ({ x: 560 + (i % 10) * 90, y: 520 + Math.floor(i / 10) * 90 });
const scatter = (i: number) => ({ x: 180 + rnd(i * 3.1) * 1560, y: 330 + rnd(i * 7.7) * 620 });

const THEMES = [
  { name: 'Cost of compliance', share: 34, x: 450, y: 600 },
  { name: 'AI in operations', share: 27, x: 860, y: 470 },
  { name: 'Hiring', share: 19, x: 1240, y: 640 },
  { name: 'Supplier risk', share: 12, x: 1560, y: 450 },
  { name: 'Data quality', share: 8, x: 1600, y: 800 },
];
const clusterOf = (i: number) => {
  let acc = 0;
  const f = (i + 0.5) / N;
  for (let k = 0; k < THEMES.length; k++) {
    acc += THEMES[k].share / 100;
    if (f <= acc) return k;
  }
  return THEMES.length - 1;
};
const inCluster = (i: number) => {
  const k = clusterOf(i);
  const members = Array.from({ length: N }, (_, j) => j).filter((j) => clusterOf(j) === k);
  const n = members.indexOf(i);
  const a = n * 2.4;
  const r = 34 * Math.sqrt(n);
  return { x: THEMES[k].x + Math.cos(a) * r, y: THEMES[k].y + Math.sin(a) * r, k };
};

const Dot: React.FC<{ i: number; x: number; y: number; s?: number; o?: number }> = ({ i, x, y, s = 1, o = 1 }) => (
  <div style={abs(x - 30, y - 30, { transform: `scale(${s})`, opacity: o })}>
    <Avatar s={DOT(i)} size={60} />
  </div>
);

/** A recording slot that takes the whole product area when recorded. */
const RecOr: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) =>
  hasRec(id) ? (
    <div style={abs(560, 180)}>
      <Browser w={1250} h={780} url="app.recaphub.co/dashboard/harbor-summit-2026/insights" rec={id} />
    </div>
  ) : (
    <>{children}</>
  );

// ------------------------------------------------------------------ hook + problem

const Hook = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Slam t={t} at={0} y={110}>
      <div style={head(116, { fontWeight: 700, letterSpacing: '-0.05em' })}>What did 40 speakers</div>
    </Slam>
    <Slam t={t} at={B(2)} y={250}>
      <div style={serif({ fontSize: 132, color: R.ink })}>actually agree on?</div>
    </Slam>
    {Array.from({ length: N }).map((_, i) => {
      const g = grid(i);
      const p = spr(t, B(i < 20 ? i * 0.05 : 2 + (i - 20) * 0.05), 13);
      const wob = t > B(4) ? Math.sin(t * 9 + i) * 3 : 0;
      return <Dot key={i} i={i} x={g.x} y={g.y + wob} s={p} o={Math.min(1, p * 1.5)} />;
    })}
  </AbsoluteFill>
);

const Problem = ({ t, B }: Ctx) => {
  const go = lerp(t, 0, B(1.5), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <div style={centerRow(90)}>
        <Reveal t={t} at={B(1)} y={18}>
          <div style={head(84, { fontWeight: 700, letterSpacing: '-0.045em' })}>
            Everyone heard a <span style={serif({ fontSize: 96, fontWeight: 400 })}>different event.</span>
          </div>
        </Reveal>
      </div>
      <div style={centerRow(210)}>
        <Reveal t={t} at={B(2)} y={12}>
          <div style={label({ fontSize: 22, color: R.ink2 })}>38 sessions · 31 hours · 40 speakers</div>
        </Reveal>
      </div>
      {Array.from({ length: N }).map((_, i) => {
        const a = grid(i);
        const b = scatter(i);
        const x = a.x + (b.x - a.x) * go;
        const y = a.y + (b.y - a.y) * go + Math.sin(t * 3 + i) * 6;
        const bub = i % 4 === 0 && t > B(2 + (i % 8) * 0.2);
        return (
          <React.Fragment key={i}>
            <Dot i={i} x={x} y={y} />
            {bub ? <div style={abs(x + 18, y - 64, { background: '#fff', border: `1px solid ${R.border}`, borderRadius: 14, padding: '4px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 22, color: R.ink3 })}>…</div> : null}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ themes

const Themes = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <div style={abs(110, 80)}>
      <Reveal t={t} at={0} y={14} dur={0.35}>
        <div style={label({ fontSize: 22, color: R.brand })}>Event intelligence</div>
      </Reveal>
      <Reveal t={t} at={B(0.25)} y={18}>
        <div style={head(80, { fontWeight: 700, letterSpacing: '-0.045em', marginTop: 10 })}>
          Themes across the <span style={serif({ fontSize: 90, fontWeight: 400 })}>whole event.</span>
        </div>
      </Reveal>
    </div>
    <RecOr id="intel-themes">
      {THEMES.map((th, k) => {
        const p = spr(t, B(1.5 + k * 0.5), 14);
        const r = 40 + Math.sqrt(th.share) * 34;
        return (
          <React.Fragment key={th.name}>
            <div style={abs(th.x - r, th.y - r, { width: r * 2, height: r * 2, borderRadius: r, background: k === 1 ? 'rgba(67,97,238,0.08)' : 'rgba(26,23,20,0.04)', border: `2px solid ${k === 1 ? R.brand100 : R.border}`, transform: `scale(${p})` })} />
            <div style={abs(th.x - 200, th.y + r + 10, { width: 400, textAlign: 'center', opacity: lerp(t, B(2 + k * 0.5), B(2.4 + k * 0.5)) })}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: R.ink }}>{th.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 20, color: R.ink2 }}>{count(t, B(2 + k * 0.5), B(3 + k * 0.5), 0, th.share)}% of sessions</div>
            </div>
          </React.Fragment>
        );
      })}
      {Array.from({ length: N }).map((_, i) => {
        const a = scatter(i);
        const c = inCluster(i);
        const p = lerp(t, B(0.5 + c.k * 0.4), B(1.6 + c.k * 0.4), 0, 1, EXPO);
        return <Dot key={i} i={i} x={a.x + (c.x - a.x) * p} y={a.y + (c.y - a.y) * p} s={0.8} />;
      })}
    </RecOr>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ questions and stances

const QUESTIONS = ['Build or buy?', 'Who owns the data?', 'Will AI replace the ops analyst?'];

const Branch: React.FC<{ t: number; at: number; x1: number; y1: number; x2: number; y2: number; on?: boolean }> = ({ t, at, x1, y1, x2, y2, on }) => {
  const p = lerp(t, at, at + 0.5, 0, 1, EXPO);
  const mx = (x1 + x2) / 2;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
      <path d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} fill="none" stroke={on ? R.brand : R.ink3} strokeWidth={on ? 4 : 3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  );
};

const Questions = ({ t, B }: Ctx) => {
  const zoom = lerp(t, 0, B(1.5), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Lead t={t} B={B} words={['The', 'questions', 'people', 'argued', 'over.']} y={90} w={1500} size={80} perLine={8} />
      <RecOr id="intel-mindmap">
        {/* the AI in operations cluster becomes the theme node */}
        <div style={abs(160 + (1 - zoom) * 600, 560 - (1 - zoom) * 90, { transform: `scale(${1 + (1 - zoom) * 0.4})`, background: R.ink, color: '#fff', borderRadius: 99, padding: '22px 34px', fontFamily: SANS, fontWeight: 600, fontSize: 34 })}>AI in operations</div>
        {QUESTIONS.map((q, i) => {
          const y = 400 + i * 190;
          const p = spr(t, B(2 + i * 0.75), 14);
          return (
            <React.Fragment key={q}>
              <Branch t={t} at={B(1.75 + i * 0.75)} x1={560} y1={598} x2={900} y2={y + 38} on={i === 0} />
              <div style={abs(900, y, { opacity: Math.min(1, p * 1.5), transform: `scale(${0.8 + 0.2 * p})`, transformOrigin: '0 50%', background: i === 0 ? R.brand50 : '#fff', border: `2px solid ${i === 0 ? R.brand : R.border}`, borderRadius: 99, padding: '18px 30px', fontFamily: SANS, fontWeight: 500, fontSize: 32, color: R.ink, whiteSpace: 'nowrap' })}>{q}</div>
              <div style={abs(900, y + 86, { ...label({ fontSize: 16 }), opacity: lerp(t, B(2.5 + i * 0.75), B(2.9 + i * 0.75)) })}>{[4, 3, 2][i]} sessions · {[9, 6, 4][i]} speakers</div>
            </React.Fragment>
          );
        })}
      </RecOr>
    </AbsoluteFill>
  );
};

const STANCES = [
  { name: 'Build it in-house', who: [0, 2], q: 'Own the data, own the roadmap.', y: 330 },
  { name: 'Buy, then adapt', who: [1, 5], q: 'Live in six weeks beats perfect next year.', y: 560 },
  { name: 'Wait a year', who: [3], q: 'The tools aren’t there yet.', y: 790 },
];

const Stances = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Lead t={t} B={B} words={['Where', 'each', 'speaker', 'stood.']} y={90} w={1500} size={80} perLine={8} />
    <RecOr id="intel-stances">
      <div style={abs(130, 560, { background: R.brand, color: '#fff', borderRadius: 99, padding: '20px 32px', fontFamily: SANS, fontWeight: 600, fontSize: 34, transform: `scale(${spr(t, 0, 14)})`, transformOrigin: '0 50%' })}>Build or buy?</div>
      {STANCES.map((st, i) => {
        const at = B(1 + i * 1.25);
        const p = spr(t, at, 14);
        return (
          <React.Fragment key={st.name}>
            <Branch t={t} at={at - 0.2} x1={460} y1={598} x2={640} y2={st.y + 38} />
            <div style={abs(640, st.y, { opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 60}px)`, display: 'flex', alignItems: 'center', gap: 22 })}>
              <div style={{ background: '#fff', border: `1.5px solid ${R.border}`, borderRadius: 99, padding: '16px 28px', fontFamily: SANS, fontWeight: 600, fontSize: 30, color: R.ink, whiteSpace: 'nowrap' }}>{st.name}</div>
              <div style={{ display: 'flex' }}>
                {st.who.map((w, j) => {
                  const a = spr(t, at + 0.3 + j * 0.15, 12);
                  return <div key={w} style={{ marginLeft: j ? -14 : 0, transform: `translateX(${(1 - a) * 400}px) scale(${a})` }}><Avatar s={SPEAKERS[w]} size={64} /></div>;
                })}
              </div>
              <div style={serif({ fontSize: 32, color: R.ink2, opacity: lerp(t, at + 0.6, at + 0.9), whiteSpace: 'nowrap' })}>“{st.q}”</div>
            </div>
          </React.Fragment>
        );
      })}
    </RecOr>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ debates and where they landed

const DEBATES = [
  { q: 'Build or buy?', res: 'Split', note: '9 speakers, two camps', color: R.ink, bg: R.muted },
  { q: 'Who owns the data?', res: 'Emerging consensus', note: 'The customer does', color: '#15803D', bg: '#DCFCE7' },
  { q: 'Will AI replace the ops analyst?', res: 'Unresolved', note: 'Still argued on day 3', color: R.brand600, bg: R.brand50 },
];

const Debates = ({ t, B }: Ctx) => {
  const focus = lerp(t, B(5), B(5.8), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <div style={centerRow(90)}>
        <WordLine t={t} B={B} />
      </div>
      <RecOr id="intel-debates">
        {DEBATES.map((d, i) => {
          const p = spr(t, B(1 + i * 0.75), 14);
          const isOpen = i === 2;
          const x = 140 + i * 570;
          const tx = isOpen ? x + (690 - x) * focus : x;
          const scale = isOpen ? 1 + 0.18 * focus : 1 - 0.08 * focus;
          const pulse = isOpen && t > B(6) ? 0.5 + 0.5 * Math.sin((t - B(6)) * 6) : 0;
          return (
            <div key={d.q} style={abs(tx, 390, { opacity: Math.min(1, p * 1.5) * (isOpen ? 1 : 1 - 0.65 * focus), transform: `translateY(${(1 - p) * 60}px) scale(${scale})`, zIndex: isOpen ? 2 : 1 })}>
              <div style={{ ...card({ borderRadius: 26 }), width: 540, height: 330, padding: '34px 36px', boxSizing: 'border-box', boxShadow: isOpen ? `0 0 0 ${3 + 6 * pulse}px rgba(67,97,238,${0.25 + 0.2 * pulse}), 0 30px 70px rgba(26,23,20,0.14)` : undefined }}>
                <div style={label({ fontSize: 16 })}>Debate</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 38, color: R.ink, letterSpacing: '-0.025em', marginTop: 12, lineHeight: 1.15 }}>{d.q}</div>
                <div style={{ display: 'inline-flex', marginTop: 26, fontFamily: SANS, fontWeight: 600, fontSize: 22, color: d.color, background: d.bg, borderRadius: 99, padding: '8px 18px' }}>{d.res}</div>
                <div style={{ fontFamily: SANS, fontSize: 22, color: R.ink2, marginTop: 14 }}>{d.note}</div>
              </div>
            </div>
          );
        })}
      </RecOr>
    </AbsoluteFill>
  );
};

const WordLine: React.FC<{ t: number; B: (n: number) => number }> = ({ t, B }) => (
  <div style={{ textAlign: 'center' }}>
    <Reveal t={t} at={0} y={18}>
      <div style={head(76, { fontWeight: 700, letterSpacing: '-0.045em' })}>Find the debate your audience</div>
    </Reveal>
    <Reveal t={t} at={B(0.5)} y={18}>
      <div style={serif({ fontSize: 88, color: R.ink })}>is still having.</div>
    </Reveal>
  </div>
);

// ------------------------------------------------------------------ payoff + end

const Payoff = ({ t, B }: Ctx) => {
  const stat = (at: number, n: number, word: React.ReactNode) => {
    const p = spr(t, at, 13);
    return (
      <div style={{ textAlign: 'center', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 220, color: R.ink, letterSpacing: '-0.06em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{count(t, at, at + 0.4, 0, n)}</div>
        <div style={serif({ fontSize: 56, color: R.ink2, marginTop: 6 })}>{word}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <div style={centerRow(300, { gap: 150, alignItems: 'flex-start' })}>
        {stat(0, 40, 'speakers')}
        {stat(B(1), 5, 'themes')}
        {stat(B(2), 1, <span style={{ color: R.brand }}>debate still open</span>)}
      </div>
    </AbsoluteFill>
  );
};

const End = ({ t, B }: Ctx) => <EndCard t={t} B={B} line="Know what your event actually said." />;

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = { hook: Hook, problem: Problem, themes: Themes, questions: Questions, stances: Stances, debates: Debates, payoff: Payoff, end: End };

const { at: sAt } = sfxKit(tl);
const SFX = [
  { at: sAt('problem', 0), src: 'whoosh' as const, vol: 0.3 },
  ...[1.5, 2, 2.5, 3, 3.5].map((b) => ({ at: sAt('themes', b), src: 'pop' as const, vol: 0.2 })),
  ...[2, 2.75, 3.5].map((b) => ({ at: sAt('questions', b), src: 'pop' as const, vol: 0.2 })),
  ...[1, 2.25, 3.5].map((b) => ({ at: sAt('stances', b), src: 'pop' as const, vol: 0.2 })),
  ...[1, 1.75, 2.5].map((b) => ({ at: sAt('debates', b), src: 'page-turn' as const, vol: 0.3 })),
  { at: sAt('debates', 5), src: 'whoosh' as const, vol: 0.25 },
  { at: sAt('end', 3), src: 'ding' as const, vol: 0.22 },
];

export const RecapHubIntel: React.FC = () => <Film tl={tl} render={RENDER} sfx={SFX} />;
export const intelTimeline = tl;
