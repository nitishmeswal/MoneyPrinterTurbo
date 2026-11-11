/* RecapHub · Press Room promo, ~38 s, newsroom: ink, typewriter, a deadline clock.
 * Hook: "Journalists don't wait. Neither should your press kit."
 * A journalist signs in → the press room's quote cards → copy a quote, save it to
 * My lane → download the lane as a PDF → the MCP prompts → the story is filed.
 * The journalist (Leah Adams), The Ledger and the speakers are fictional.
 * Music: music-rh-press.wav (compose.py press), 112 BPM, C minor. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-press.json';
import { Ctx, Cursor, CursorPt, Reveal, Timeline, TypeOn, spr } from './kit';
import { R, MONO, SANS, RING, Avatar, Browser, Check, Ink, Mark, RecFill, SPEAKERS, abs, card, centerRow, hasRec, head, label, pill, serif } from './rh';
import { Btn, EndCard, Film, Lead, Toast, sfxKit } from './ui';

const tl = tlJson as Timeline;
const ROOM_URL = 'recaphub.co/press/harbor-summit-2026';

const Clock: React.FC<{ t: number; B: (n: number) => number; from: number; dark?: boolean }> = ({ t, B, from, dark = true }) => {
  const s = from + Math.floor(t / (B(1) - B(0)));
  return (
    <div style={abs(1420, 70, { textAlign: 'right', width: 400 })}>
      <div style={label({ fontSize: 20, color: dark ? '#A8A49D' : R.ink2 })}>Deadline 18:00</div>
      <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 56, color: dark ? '#F5F4F2' : R.ink, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
        17:{String(52 + Math.floor(s / 60)).padStart(2, '0')}:{String(s % 60).padStart(2, '0')}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ hook + problem

const Hook = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Ink t={t} />
    <Clock t={t} B={B} from={0} />
    <div style={abs(140, 390, { fontFamily: MONO, fontWeight: 500, fontSize: 118, color: '#F5F4F2', letterSpacing: '-0.03em', whiteSpace: 'nowrap' })}>
      <TypeOn t={t} at={0} cps={40} caret={false} parts={[{ text: 'Journalists ' }]} />
      <TypeOn t={t} at={B(1.5)} cps={40} caret={false} parts={[{ text: 'don’t ' }]} />
      <TypeOn t={t} at={B(3)} cps={40} caret="#F5F4F2" parts={[{ text: 'wait.', style: { color: '#F5F4F2' } }]} />
    </div>
    <div style={abs(140, 560, { width: 1640, height: 3, background: '#3A3530' })} />
  </AbsoluteFill>
);

const Problem = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Ink t={t} />
    <Clock t={t} B={B} from={6} />
    <div style={abs(140, 200, { width: 1100, background: '#221E1B', border: '1px solid #3A3530', borderRadius: 20, padding: '28px 34px', boxSizing: 'border-box', opacity: spr(t, 0, 15), transform: `translateY(${(1 - spr(t, 0, 15)) * 40}px)` })}>
      <div style={{ display: 'flex', gap: 14, fontFamily: SANS, fontSize: 22, color: '#A8A49D' }}>
        <span style={{ color: '#E8E6E3', fontWeight: 600 }}>Events team</span> · Re: press kit for Harbor Summit
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 18 }}>17:58</span>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 34, color: '#F5F4F2', marginTop: 18 }}>
        <TypeOn t={t} at={B(0.5)} cps={40} caret={false} parts={[{ text: 'Thanks for asking! We’ll send the press kit ' }, { text: 'next week.', style: { color: R.danger } }]} />
      </div>
    </div>
    <div style={abs(140, 560)}>
      <Reveal t={t} at={B(2.5)} y={24}>
        <div style={serif({ fontSize: 124, color: '#F5F4F2', lineHeight: 1.08 })}>Neither should your press kit.</div>
      </Reveal>
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ sign in

const Signin = ({ t, B }: Ctx) => {
  const ok = t >= B(5);
  const enter = spr(t, 0, 15, 0.85);
  return (
    <AbsoluteFill>
      <Lead t={t} B={B} tag="Press room" words={['A', 'room', 'just', 'for', 'press.']} line="Gated: approved journalists only." y={240} w={620} />
      <div style={abs(760, 170 + (1 - enter) * 400, { opacity: Math.min(1, enter * 1.5) })}>
        <Browser w={1060} h={740} url={ROOM_URL} rec="press-signin">
          <div style={{ position: 'absolute', inset: 0, background: R.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...card({ borderRadius: 24 }), width: 560, padding: '40px 44px', boxSizing: 'border-box' }}>
              <Mark size={60} />
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: R.ink, letterSpacing: '-0.02em', marginTop: 16 }}>Harbor Summit 2026</div>
              <div style={{ fontFamily: SANS, fontSize: 22, color: R.ink2, marginTop: 4 }}>Press room</div>
              {ok ? (
                <Reveal t={t} at={B(5)} y={12} dur={0.3}>
                  <div style={{ marginTop: 34, display: 'flex', alignItems: 'center', gap: 14, background: R.brand50, border: `1px solid ${R.brand100}`, borderRadius: 14, padding: '18px 20px' }}>
                    <Check size={26} color={R.brand} />
                    <div>
                      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: R.ink }}>You’re in, Leah</div>
                      <div style={{ fontFamily: SANS, fontSize: 18, color: R.ink2 }}>Trusted publication · The Ledger</div>
                    </div>
                  </div>
                </Reveal>
              ) : (
                <>
                  <div style={label({ fontSize: 15, marginTop: 30 })}>Work email</div>
                  <div style={{ marginTop: 10, border: `1.5px solid ${R.brand}`, boxShadow: `0 0 0 5px ${R.brand50}`, borderRadius: 12, padding: '14px 16px', fontFamily: SANS, fontSize: 22, color: R.ink }}>
                    <TypeOn t={t} at={B(1)} cps={22} caret={R.brand} parts={[{ text: 'leah@theledger.news' }]} />
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <Btn primary size={22} pressed={t >= B(4) && t < B(4.3)}>Continue</Btn>
                  </div>
                </>
              )}
            </div>
          </div>
        </Browser>
      </div>
      {!hasRec('press-signin') ? <Cursor t={t} path={[{ t: B(2.6), x: 1500, y: 1000 }, { t: B(3.8), x: 1120, y: 727 }, { t: B(4), x: 1120, y: 727, click: true }, { t: B(6), x: 1300, y: 900 }]} ring={RING} /> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the room

const BITS = [
  { s: 0, sess: 'Pilot results', tc: '18:40', q: 'We’d rather own the data than rent the dashboard.', topic: 'Build vs buy' },
  { s: 1, sess: 'Panel: Build vs buy', tc: '22:10', q: 'Buying got us live in six weeks.', topic: 'Build vs buy' },
  { s: 2, sess: 'Keynote: The next decade', tc: '07:45', q: 'Nobody remembers the slides. They remember the argument.', topic: 'Events' },
  { s: 4, sess: 'AI in hiring', tc: '33:05', q: 'Keep a human on the last decision.', topic: 'AI in hiring' },
  { s: 5, sess: 'Remote audits, honestly', tc: '12:20', q: 'The data trail is the audit.', topic: 'Compliance' },
  { s: 3, sess: 'Closing remarks', tc: '04:02', q: 'Next year, the floor decides the agenda.', topic: 'Events' },
];

const BitCard: React.FC<{ b: (typeof BITS)[number]; w: number; copied?: boolean; saved?: boolean; big?: boolean }> = ({ b, w, copied, saved, big }) => {
  const k = big ? 1.5 : 1;
  return (
    <div style={{ ...card({ borderRadius: 18 * k }), width: w, padding: `${22 * k}px ${24 * k}px`, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 * k }}>
        <Avatar s={SPEAKERS[b.s]} size={40 * k} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18 * k, color: R.ink }}>{SPEAKERS[b.s].name}</div>
          <div style={{ fontFamily: MONO, fontSize: 14 * k, color: R.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.sess} · {b.tc}</div>
        </div>
      </div>
      <div style={serif({ fontSize: 27 * k, color: R.ink, lineHeight: 1.25, marginTop: 14 * k, minHeight: 68 * k })}>“{b.q}”</div>
      <div style={{ display: 'flex', gap: 8 * k, marginTop: 14 * k }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 15 * k, color: copied ? '#fff' : R.ink, background: copied ? R.ink : R.subtle, borderRadius: 8 * k, padding: `${7 * k}px ${12 * k}px` }}>{copied ? 'Copied' : 'Copy quote'}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 15 * k, color: saved ? R.brand600 : R.ink, background: saved ? R.brand50 : R.subtle, borderRadius: 8 * k, padding: `${7 * k}px ${12 * k}px` }}>{saved ? 'Saved to lane' : 'Save to lane'}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 15 * k, color: R.ink, background: R.subtle, borderRadius: 8 * k, padding: `${7 * k}px ${12 * k}px` }}>▶ Clip</div>
      </div>
    </div>
  );
};

const RoomHeader: React.FC<{ lane: number; bump?: number }> = ({ lane, bump = 0 }) => (
  <div style={{ height: 70, display: 'flex', alignItems: 'center', gap: 14, padding: '0 34px', borderBottom: `1px solid ${R.border}`, background: '#fff' }}>
    <Mark size={30} />
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: R.ink }}>Harbor Summit 2026 · Press room</div>
    <div style={{ marginLeft: 'auto', fontFamily: SANS, fontWeight: 600, fontSize: 18, color: R.brand600, background: R.brand50, borderRadius: 10, padding: '8px 14px', transform: `scale(${1 + 0.2 * bump})` }}>My lane ({lane})</div>
  </div>
);

const Room = ({ t, B }: Ctx) => {
  const enter = spr(t, 0, 15, 0.85);
  return (
    <AbsoluteFill>
      <div style={centerRow(54)}>
        <Reveal t={t} at={0} y={16} dur={0.35}>
          <div style={head(62, { fontWeight: 600 })}>
            Quotes, clips and transcripts, <span style={serif({ fontSize: 70, fontWeight: 400 })}>ready.</span>
          </div>
        </Reveal>
      </div>
      <div style={abs(160, 170 + (1 - enter) * 500, { opacity: Math.min(1, enter * 1.5) })}>
        <Browser w={1600} h={850} url={ROOM_URL} rec="press-room">
          <div style={{ position: 'absolute', inset: 0, background: R.page }}>
            <RoomHeader lane={2} />
            <div style={{ display: 'flex', gap: 10, padding: '20px 34px' }}>
              {['All Sessions', 'All Topics', 'All Speakers', 'Newest first'].map((x) => <div key={x} style={{ fontFamily: SANS, fontSize: 18, color: R.ink, background: '#fff', border: `1px solid ${R.border}`, borderRadius: 10, padding: '8px 14px' }}>{x} ▾</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, padding: '0 34px' }}>
              {BITS.map((b, i) => (
                <Reveal key={i} t={t} at={B(1 + i * 0.5)} y={30} dur={0.35}>
                  <BitCard b={b} w={493} />
                </Reveal>
              ))}
            </div>
          </div>
        </Browser>
      </div>
    </AbsoluteFill>
  );
};

const COPY_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(0.8), x: 1400, y: 1000 },
  { t: B(1.8), x: 952, y: 712 },
  { t: B(2), x: 952, y: 712, click: true },
  { t: B(3.8), x: 1140, y: 712 },
  { t: B(4), x: 1140, y: 712, click: true },
  { t: B(6), x: 1400, y: 950 },
];

const Copy = ({ t, B }: Ctx) => {
  const p = spr(t, 0, 15, 0.85);
  return (
    <AbsoluteFill>
      <Lead t={t} B={B} words={['Copy', 'the', 'quote.']} line="Save the good ones to My lane." y={270} w={600} />
      {hasRec('press-copy') ? (
        <div style={abs(760, 170, { ...card({ borderRadius: 22 }), width: 1060, height: 740, overflow: 'hidden' })}>
          <RecFill id="press-copy" />
        </div>
      ) : (
        <div style={abs(860, 330, { transform: `scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 1.5) })}>
          <BitCard b={BITS[0]} w={900} big copied={t >= B(2)} saved={t >= B(4)} />
        </div>
      )}
      <div style={abs(1420, 150, { transform: `scale(${1 + 0.25 * Math.max(0, 1 - (t - B(4)) * 4) * (t >= B(4) ? 1 : 0)})`, ...pill({ fontSize: 24, padding: '12px 22px' }) })}>My lane ({t >= B(4) ? 3 : 2})</div>
      <Toast t={t} at={B(2.1)} until={B(3.8)} text="Quote copied" icon={<Check size={22} color="#fff" />} y={920} x={1310} />
      <Toast t={t} at={B(4.1)} text="Saved to My lane" icon={<Check size={22} color="#fff" />} y={920} x={1310} />
      {!hasRec('press-copy') ? <Cursor t={t} path={COPY_CURSOR(B)} ring={RING} /> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ my lane → PDF

const LANE_CLICK = 3;
const Lane = ({ t, B }: Ctx) => {
  const enter = spr(t, 0, 15, 0.85);
  const pdf = spr(t, B(LANE_CLICK + 0.5), 13, 0.8);
  return (
    <AbsoluteFill>
      <div style={abs(110, 150 + (1 - enter) * 400, { opacity: Math.min(1, enter * 1.5) })}>
        <Browser w={1060} h={780} url={`${ROOM_URL}/lane`} rec="press-lane">
          <div style={{ position: 'absolute', inset: 0, background: R.page }}>
            <RoomHeader lane={3} />
            <div style={{ padding: '30px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: R.ink, letterSpacing: '-0.025em' }}>My lane</div>
                  <div style={{ fontFamily: SANS, fontSize: 20, color: R.ink2 }}>3 saved · Harbor Summit 2026</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                  <Btn size={19}>✉ Email my lane</Btn>
                  <Btn size={19} primary pressed={t >= B(LANE_CLICK) && t < B(LANE_CLICK) + 0.15}>↓ Download PDF</Btn>
                </div>
              </div>
              {[BITS[0], BITS[2], BITS[3]].map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: i ? 14 : 30, ...card({ borderRadius: 14, boxShadow: 'none' }), padding: '18px 20px' }}>
                  <Avatar s={SPEAKERS[b.s]} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={serif({ fontSize: 26, color: R.ink })}>“{b.q}”</div>
                    <div style={{ fontFamily: MONO, fontSize: 15, color: R.ink3, marginTop: 4 }}>{SPEAKERS[b.s].name} · {b.sess} · {b.tc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Browser>
      </div>
      <div style={abs(1250 + (1 - pdf) * -300, 170 + (1 - pdf) * 200, { opacity: Math.min(1, pdf * 1.5), transform: `rotate(${4 * pdf}deg) scale(${0.7 + 0.3 * pdf})`, transformOrigin: '0 0' })}>
        <div style={{ width: 520, height: 700, background: '#fff', borderRadius: 6, boxShadow: '0 40px 80px rgba(26,23,20,0.22)', padding: '44px 46px', boxSizing: 'border-box' }}>
          <div style={label({ fontSize: 14 })}>Harbor Summit 2026</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: R.ink, letterSpacing: '-0.03em', marginTop: 6 }}>My lane</div>
          <div style={{ height: 2, background: R.ink, margin: '18px 0 22px' }} />
          {[BITS[0], BITS[2], BITS[3]].map((b, i) => (
            <div key={i} style={{ marginBottom: 26 }}>
              <div style={serif({ fontSize: 24, color: R.ink, lineHeight: 1.25 })}>“{b.q}”</div>
              <div style={{ fontFamily: SANS, fontSize: 14, color: R.ink2, marginTop: 6 }}>— {SPEAKERS[b.s].name}, {b.sess} ({b.tc})</div>
            </div>
          ))}
        </div>
      </div>
      <Toast t={t} at={B(LANE_CLICK + 0.3)} text="Lane downloaded as PDF" icon={<span style={{ fontSize: 22 }}>↓</span>} x={640} y={960} />
      {!hasRec('press-lane') ? <Cursor t={t} path={[{ t: B(1), x: 900, y: 1000 }, { t: B(2.8), x: 1046, y: 360 }, { t: B(LANE_CLICK), x: 1046, y: 360, click: true }, { t: B(5), x: 1000, y: 800 }]} ring={RING} /> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ MCP prompts

const PROMPTS = ['Every quote on pricing, with timestamps', 'Who disagreed with Priya Raman?', 'Summarise the keynote in 100 words'];
const Mcp = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Lead t={t} B={B} words={['Or', 'ask', 'it', 'in', 'Claude.']} line="The press room comes with RecapHub MCP." y={260} w={640} />
    <div style={abs(860, 250, { ...card({ borderRadius: 24 }), width: 900, padding: '34px 38px', boxSizing: 'border-box' })}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={label({ fontSize: 17 })}>MCP prompts</div>
        <div style={{ marginLeft: 'auto', fontFamily: SANS, fontWeight: 600, fontSize: 18, color: R.ink, border: `1px solid ${R.border}`, borderRadius: 99, padding: '8px 16px' }}>Continue in RecapHub MCP →</div>
      </div>
      {PROMPTS.map((p, i) => (
        <Reveal key={p} t={t} at={B(1 + i * 0.75)} y={14} dur={0.3}>
          <div style={{ marginTop: i ? 14 : 26, display: 'flex', alignItems: 'center', gap: 14, background: R.subtle, borderRadius: 14, padding: '18px 20px', fontFamily: SANS, fontSize: 26, color: R.ink }}>
            <span style={{ color: R.brand }}>›</span> {p}
          </div>
        </Reveal>
      ))}
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ payoff: the story is filed

const Payoff = ({ t, B }: Ctx) => {
  const p = spr(t, 0, 14, 0.85);
  return (
    <AbsoluteFill>
      <Ink t={t} />
      <div style={centerRow(56)}>
        <Reveal t={t} at={B(2)} y={16}>
          <div style={head(56, { color: '#F5F4F2', fontWeight: 600 })}>
            Filed <span style={serif({ fontSize: 64, fontWeight: 400 })}>minutes after the speaker walked off stage.</span>
          </div>
        </Reveal>
      </div>
      <div style={abs(410, 170 + (1 - p) * 300, { transform: `rotate(${-1.5 * p}deg)`, opacity: Math.min(1, p * 1.5) })}>
        <div style={{ width: 1100, height: 820, background: '#F6F1E9', borderRadius: 4, padding: '40px 56px', boxSizing: 'border-box', boxShadow: '0 40px 100px rgba(0,0,0,0.45)' }}>
          <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 64, color: R.ink, letterSpacing: '0.02em' }}>The Ledger</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${R.ink}`, borderBottom: `1px solid ${R.ink}`, padding: '6px 0', marginTop: 10, fontFamily: MONO, fontSize: 15, color: R.ink2 }}>
            <span>MONDAY 10 NOVEMBER</span>
            <span>LIVE: HARBOR SUMMIT</span>
            <span>18:24</span>
          </div>
          <div style={head(66, { fontWeight: 700, letterSpacing: '-0.035em', marginTop: 28, lineHeight: 1.05 })}>Summit splits on build vs buy</div>
          <div style={{ fontFamily: SANS, fontSize: 18, color: R.ink2, marginTop: 12 }}>By Leah Adams</div>
          <div style={{ display: 'flex', gap: 34, marginTop: 24 }}>
            <div style={{ flex: 1 }}>
              {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ height: 10, borderRadius: 5, background: '#D9D1C4', marginBottom: 14, width: `${88 + ((i * 37) % 12)}%` }} />)}
            </div>
            <div style={{ width: 420, borderLeft: `4px solid ${R.ink}`, paddingLeft: 24 }}>
              <div style={serif({ fontSize: 40, color: R.ink, lineHeight: 1.2 })}>
                <TypeOn t={t} at={B(0.8)} cps={36} caret={false} style={{ whiteSpace: 'normal' }} parts={[{ text: '“We’d rather own the data than rent the dashboard.”' }]} />
              </div>
              <div style={{ fontFamily: SANS, fontSize: 18, color: R.ink2, marginTop: 14 }}>Priya Raman, Head of Operations</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const End = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Ink t={t} />
    <EndCard t={t} B={B} dark kicker="Journalists don’t wait." line="Neither should your press kit." />
  </AbsoluteFill>
);

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = { hook: Hook, problem: Problem, signin: Signin, room: Room, copy: Copy, lane: Lane, mcp: Mcp, payoff: Payoff, end: End };

const { at: sAt } = sfxKit(tl);
const SFX = [
  ...[0, 1.5, 3].flatMap((b) => [0, 0.1, 0.2].map((d) => ({ at: sAt('hook', b) + d, src: 'key' as const, vol: 0.35 }))),
  { at: sAt('signin', 4), src: 'mouse-click' as const, vol: 0.5 },
  { at: sAt('signin', 5), src: 'ding' as const, vol: 0.2 },
  { at: sAt('copy', 2), src: 'mouse-click' as const, vol: 0.5 },
  { at: sAt('copy', 4), src: 'mouse-click' as const, vol: 0.5 },
  { at: sAt('copy', 4.1), src: 'pop' as const, vol: 0.25 },
  { at: sAt('lane', LANE_CLICK), src: 'mouse-click' as const, vol: 0.5 },
  { at: sAt('lane', LANE_CLICK + 0.5), src: 'page-turn' as const, vol: 0.4 },
  ...[1, 1.75, 2.5].map((b) => ({ at: sAt('mcp', b), src: 'pop' as const, vol: 0.2 })),
  { at: sAt('payoff', 0), src: 'page-turn' as const, vol: 0.45 },
  { at: sAt('end', 3), src: 'ding' as const, vol: 0.22 },
];

export const RecapHubPress: React.FC = () => <Film tl={tl} render={RENDER} sfx={SFX} />;
export const pressTimeline = tl;
