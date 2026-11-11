/* RecapHub · Audience Analytics promo, ~31 s, dashboard reveal + reading heatmap.
 * HOLD: the brief says to promote this only once real data flows (after #436).
 * The metrics are the ones in docs/plans/PLAN-analytics-overview.md (visits, page
 * views, sessions opened, plays, watched half, sections reached, top sessions);
 * the numbers are placeholders until real data is in.
 * Hook: "Finally know what your attendees cared about."
 * Music: music-rh-analytics.wav (compose.py analytics), 122 BPM, D major. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-analytics.json';
import { Ctx, Reveal, Timeline, count, lerp, spr, EXPO, INOUT } from './kit';
import { R, MONO, SANS, Browser, RecFill, abs, card, centerRow, hasRec, head, label, serif } from './rh';
import { AppShell, EndCard, Film, Fit, Lead, RecapSite, Slam, sfxKit } from './ui';

const tl = tlJson as Timeline;
const URL = 'recaphub.co/harbor-summit-2026';

/** Reading heat over the page: warm where people stayed, fading where they stopped. */
const Heat: React.FC<{ h: number; p: number }> = ({ h, p }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: h * p, background: 'linear-gradient(180deg, rgba(245,158,11,0.42) 0%, rgba(245,158,11,0.28) 35%, rgba(245,158,11,0.14) 60%, rgba(245,158,11,0.04) 85%, transparent 100%)', mixBlendMode: 'multiply' }} />
);

const Hook = ({ t, B }: Ctx) => {
  const sweep = lerp(t, B(0.5), B(4), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Slam t={t} at={0} y={70}>
        <div style={head(110, { fontWeight: 700, letterSpacing: '-0.05em' })}>Finally know</div>
      </Slam>
      <Slam t={t} at={B(2)} y={200}>
        <div style={serif({ fontSize: 110, color: R.ink })}>what your attendees cared about.</div>
      </Slam>
      <div style={abs(360, 400, { opacity: spr(t, B(0.3), 14) })}>
        <Browser w={1200} h={620} url={URL}>
          <div style={{ position: 'relative' }}>
            <Fit w={1200} bw={1200} bh={562}>
              <RecapSite t={t} height={562} />
            </Fit>
            <Heat h={562} p={sweep} />
          </div>
        </Browser>
      </div>
    </AbsoluteFill>
  );
};

const Problem = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <div style={abs(110, 300, { width: 900 })}>
      <Reveal t={t} at={0} y={20}>
        <div style={head(100, { fontWeight: 700, letterSpacing: '-0.045em' })}>You published the recap.</div>
      </Reveal>
      <Reveal t={t} at={B(2)} y={20}>
        <div style={serif({ fontSize: 120, color: R.ink, marginTop: 10 })}>Then what?</div>
      </Reveal>
    </div>
    <div style={abs(1150, 250, { ...card({ borderRadius: 24 }), width: 620, padding: '34px 38px', boxSizing: 'border-box' })}>
      {['Visits', 'Sessions opened', 'Sections read'].map((k, i) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', padding: '22px 0', borderTop: i ? `1px solid ${R.border}` : 'none' }}>
          <div style={{ fontFamily: SANS, fontSize: 30, color: R.ink2, flex: 1 }}>{k}</div>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 48, color: R.ink3, opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 3 + i)) }}>?</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ overview card

const STATS = [['Visits', 412], ['Page views', 1290], ['Sessions opened', 233], ['Plays', 140]] as const;
const TOP = [['Keynote: The next decade of events', 54], ['Panel: Build vs buy', 41], ['Pilot results', 33]] as const;

const Overview = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Lead t={t} B={B} tag="Audience analytics" words={['Who', 'came', 'back.']} line="Your recap page, last 30 days." y={240} w={560} />
    <div style={abs(690, 170, { borderRadius: 18, overflow: 'hidden', border: `1px solid ${R.border}`, boxShadow: '0 30px 80px rgba(26,23,20,0.16)' })}>
      <Fit w={1150} bw={1600} bh={900}>
        {hasRec('analytics-overview') ? <RecFill id="analytics-overview" /> : (
          <AppShell active="Overview" title="Overview">
            <div style={{ ...card({ borderRadius: 18 }), width: 1250, padding: '30px 34px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: R.ink }}>Recap page</div>
                <div style={{ marginLeft: 'auto', fontFamily: SANS, fontSize: 18, color: R.ink2, border: `1px solid ${R.border}`, borderRadius: 10, padding: '8px 14px' }}>Last 30 days ▾</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginTop: 24 }}>
                {STATS.map(([k, v], i) => (
                  <div key={k} style={{ background: R.subtle, borderRadius: 14, padding: '20px 22px' }}>
                    <div style={label({ fontSize: 15 })}>{k}</div>
                    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 56, color: R.ink, letterSpacing: '-0.03em', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{count(t, B(1 + i * 0.5), B(2.5 + i * 0.5), 0, v).toLocaleString('en-US')}</div>
                  </div>
                ))}
              </div>
              <div style={label({ fontSize: 15, marginTop: 30 })}>Top sessions</div>
              {TOP.map(([n, v], i) => (
                <Reveal key={n} t={t} at={B(4 + i * 0.5)} y={10} dur={0.3}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, fontFamily: SANS, fontSize: 22, color: R.ink }}>
                    <div style={{ width: 420 }}>{n}</div>
                    <div style={{ flex: 1, height: 14, borderRadius: 7, background: R.subtle }}>
                      <div style={{ width: `${(v / 54) * 100 * lerp(t, B(4 + i * 0.5), B(5 + i * 0.5), 0, 1, EXPO)}%`, height: '100%', borderRadius: 7, background: R.brand }} />
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 20, color: R.ink2, width: 90, textAlign: 'right' }}>{v} opens</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </AppShell>
        )}
      </Fit>
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ how far they read

const SECTIONS = [['Hero', 100], ['Sessions', 82], ['Topics and sessions', 58], ['What was argued', 41], ['Speakers', 33]] as const;

const Sections = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <div style={abs(110, 80)}>
      <Reveal t={t} at={0} y={18}>
        <div style={head(84, { fontWeight: 700, letterSpacing: '-0.045em' })}>
          How far <span style={serif({ fontSize: 96, fontWeight: 400 })}>they read.</span>
        </div>
      </Reveal>
    </div>
    {hasRec('analytics-sections') ? (
      <div style={abs(260, 230, { ...card({ borderRadius: 22 }), width: 1400, height: 790, overflow: 'hidden' })}>
        <RecFill id="analytics-sections" />
      </div>
    ) : (
      <>
        <div style={abs(110, 240, { borderRadius: 18, overflow: 'hidden', border: `1px solid ${R.border}`, boxShadow: '0 30px 80px rgba(26,23,20,0.16)' })}>
          <Fit w={560} bw={1200} bh={1640}>
            <RecapSite t={t} height={1640} />
          </Fit>
          <Heat h={765} p={lerp(t, B(0.5), B(3), 0, 1, INOUT)} />
        </div>
        <div style={abs(780, 260, { width: 1020 })}>
          {SECTIONS.map(([n, v], i) => {
            const g = lerp(t, B(1 + i * 0.75), B(2 + i * 0.75), 0, 1, EXPO);
            return (
              <div key={n} style={{ marginTop: i ? 34 : 0, opacity: lerp(t, B(0.8 + i * 0.75), B(1.1 + i * 0.75)) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 32, color: R.ink, marginBottom: 12 }}>
                  <span>{n}</span>
                  <span style={{ fontFamily: MONO, color: R.ink2, fontVariantNumeric: 'tabular-nums' }}>{Math.round(v * g)}%</span>
                </div>
                <div style={{ height: 24, borderRadius: 12, background: R.subtle }}>
                  <div style={{ width: `${v * g}%`, height: '100%', borderRadius: 12, background: i < 2 ? R.brand : `rgba(67,97,238,${0.85 - i * 0.15})` }} />
                </div>
              </div>
            );
          })}
          <Reveal t={t} at={B(5.5)} y={14}>
            <div style={{ fontFamily: SANS, fontSize: 28, color: R.ink2, marginTop: 40 }}>Share of visits that reach each section.</div>
          </Reveal>
        </div>
      </>
    )}
  </AbsoluteFill>
);

// ------------------------------------------------------------------ what they opened, and watched

const SESSIONS = [['Keynote: The next decade of events', 54, 31], ['Panel: Build vs buy', 41, 18], ['Pilot results', 33, 12], ['AI in hiring', 27, 9], ['Closing remarks', 12, 4]] as const;

const Top = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <div style={centerRow(80)}>
      <Reveal t={t} at={0} y={18}>
        <div style={head(84, { fontWeight: 700, letterSpacing: '-0.045em' })}>
          What they opened, <span style={serif({ fontSize: 96, fontWeight: 400 })}>and watched.</span>
        </div>
      </Reveal>
    </div>
    <div style={abs(260, 250, { ...card({ borderRadius: 26 }), width: 1400, padding: '30px 40px', boxSizing: 'border-box' })}>
      <div style={{ display: 'flex', ...label({ fontSize: 16 }), paddingBottom: 14, borderBottom: `1px solid ${R.border}` }}>
        <div style={{ flex: 1 }}>Session</div>
        <div style={{ width: 380 }}>Opens</div>
        <div style={{ width: 200, textAlign: 'right' }}>Watched half</div>
      </div>
      {SESSIONS.map(([n, o, w], i) => {
        const g = lerp(t, B(1 + i * 0.5), B(2 + i * 0.5), 0, 1, EXPO);
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', padding: '22px 0', borderBottom: i < 4 ? `1px solid ${R.subtle}` : 'none', fontFamily: SANS, fontSize: 28, color: R.ink, opacity: lerp(t, B(0.8 + i * 0.5), B(1.1 + i * 0.5)) }}>
            <div style={{ flex: 1 }}>{n}</div>
            <div style={{ width: 380, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 280 * (o / 54) * g, height: 16, borderRadius: 8, background: R.brand }} />
              <span style={{ fontFamily: MONO, fontSize: 22, color: R.ink2 }}>{Math.round(o * g)}</span>
            </div>
            <div style={{ width: 200, textAlign: 'right', fontFamily: MONO, fontSize: 24, color: R.ink }}>{Math.round(w * g)}</div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

const Payoff = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Slam t={t} at={0} y={320}>
      <div style={head(150, { fontWeight: 700, letterSpacing: '-0.05em' })}>Make more of</div>
    </Slam>
    <Slam t={t} at={B(2)} y={500}>
      <div style={serif({ fontSize: 160, color: R.ink })}>what they cared about.</div>
    </Slam>
  </AbsoluteFill>
);

const End = ({ t, B }: Ctx) => <EndCard t={t} B={B} line="Finally know what your attendees cared about." />;

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = { hook: Hook, problem: Problem, overview: Overview, sections: Sections, top: Top, payoff: Payoff, end: End };

const { at: sAt } = sfxKit(tl);
const SFX = [
  ...[1, 1.5, 2, 2.5].map((b) => ({ at: sAt('overview', b), src: 'pop' as const, vol: 0.18 })),
  ...[1, 1.75, 2.5, 3.25, 4].map((b) => ({ at: sAt('sections', b), src: 'pop' as const, vol: 0.16 })),
  ...[1, 1.5, 2, 2.5, 3].map((b) => ({ at: sAt('top', b), src: 'pop' as const, vol: 0.16 })),
  { at: sAt('end', 3), src: 'ding' as const, vol: 0.22 },
];

export const RecapHubAnalytics: React.FC = () => <Film tl={tl} render={RENDER} sfx={SFX} />;
export const analyticsTimeline = tl;
