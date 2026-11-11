/* RecapHub · MCP promo, ~32 s, rapid-fire Q&A: three people, three questions,
 * three answers with quotes and timestamps, all inside Claude.
 * Hook: "Ask your event anything."  Payoff: "Your conference, inside Claude."
 * Music: music-rh-mcp.wav (compose.py mcp), 126 BPM, A major. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-mcp.json';
import { Ctx, Reveal, Timeline, TypeOn, WordPush, lerp, spr, INOUT } from './kit';
import { R, MONO, SANS, Avatar, Ink, Mark, Rec, RecFill, SPEAKERS, Spinner, abs, card, centerRow, hasRec, head, label, pill, serif } from './rh';
import { EndCard, Film, sfxKit } from './ui';

const tl = tlJson as Timeline;

// ------------------------------------------------------------------ hook + problem

const Hook = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Ink t={t} />
    <div style={centerRow(380)}>
      <WordPush t={t} style={head(170, { color: '#F5F4F2', fontWeight: 700, letterSpacing: '-0.05em' })} words={[{ text: 'Ask', at: 0 }, { text: 'your event', at: B(1) }, { text: 'anything.', at: B(2), style: serif({ fontSize: 190, fontWeight: 400, color: '#F5F4F2' }) }]} />
    </div>
  </AbsoluteFill>
);

const ChatWin: React.FC<{ w: number; h: number; dark?: boolean; connected?: number; children?: React.ReactNode }> = ({ w, h, dark, connected = 0, children }) => (
  <div style={{ width: w, height: h, borderRadius: 24, overflow: 'hidden', background: dark ? '#221E1B' : '#fff', border: `1px solid ${dark ? '#3A3530' : R.border}`, boxShadow: dark ? 'none' : '0 30px 80px rgba(26,23,20,0.14)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 66, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', borderBottom: `1px solid ${dark ? '#3A3530' : R.border}` }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: dark ? '#F5F4F2' : R.ink }}>Claude</div>
      {connected > 0 ? <div style={{ ...pill({ fontSize: 17, padding: '5px 12px' }), marginLeft: 'auto', opacity: connected, transform: `scale(${0.8 + 0.2 * connected})` }}>RecapHub MCP · connected</div> : null}
    </div>
    <div style={{ flex: 1, position: 'relative' }}>{children}</div>
  </div>
);

const Pile: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'relative', width: 420, height: 420 }}>
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} style={abs(20 + i * 6, 60 + i * 28, { width: 380, height: 92, borderRadius: 14, background: i % 2 ? '#2A2622' : '#3A3530', border: '1px solid #4A4540', transform: `rotate(${(i % 3) - 1 + Math.sin(t + i) * 0.5}deg)`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', boxSizing: 'border-box' })}>
        <div style={{ width: 70, height: 50, borderRadius: 8, background: '#57534E', color: '#E8E6E3', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>
        <div style={{ fontFamily: MONO, fontSize: 18, color: '#A8A49D' }}>session-{String(i + 12).padStart(2, '0')}.mp4</div>
      </div>
    ))}
  </div>
);

const Problem = ({ t, B }: Ctx) => {
  return (
    <AbsoluteFill>
      <Ink t={t} />
      <div style={abs(150, 110)}>
        <Reveal t={t} at={0} y={18}>
          <div style={head(64, { color: '#F5F4F2', fontWeight: 600 })}>Your event is in 38 recordings.</div>
        </Reveal>
      </div>
      <div style={abs(1080, 190)}>
        <Reveal t={t} at={B(3)} y={18}>
          <div style={serif({ fontSize: 72, color: '#F5F4F2' })}>Your team is in Claude.</div>
        </Reveal>
      </div>
      <div style={abs(170, 320, { opacity: spr(t, B(0.5), 14) })}>
        <Pile t={t} />
      </div>
      <div style={abs(1080, 300, { opacity: spr(t, B(3.5), 14), transform: `translateY(${(1 - spr(t, B(3.5), 14)) * 40}px)` })}>
        {hasRec('mcp-empty') ? (
          <div style={{ position: 'relative', width: 660, height: 520, borderRadius: 24, overflow: 'hidden' }}>
            <RecFill id="mcp-empty" />
          </div>
        ) : (
          <ChatWin w={660} h={520} dark>
            <div style={abs(26, 400, { width: 608, border: '1px solid #3A3530', borderRadius: 16, padding: '16px 18px', boxSizing: 'border-box', fontFamily: SANS, fontSize: 22, color: '#78716C' })}>What did our speakers say about…</div>
          </ChatWin>
        )}
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: lerp(t, B(5), B(5.6)) }}>
        <line x1={640} y1={580} x2={1060} y2={580} stroke="#57534E" strokeWidth={4} strokeDasharray="14 14" />
      </svg>
      <div style={abs(820, 545, { fontFamily: SANS, fontWeight: 700, fontSize: 56, color: '#78716C', opacity: lerp(t, B(5.5), B(6)) })}>?</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ connect

const Connect = ({ t, B }: Ctx) => {
  const slot = spr(t, B(1), 13, 0.8);
  const solid = lerp(t, B(2), B(2.6), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <div style={centerRow(80)}>
        <WordPush t={t} style={head(84, { fontWeight: 700, letterSpacing: '-0.045em' })} words={[{ text: 'Connect', at: 0 }, { text: 'once.', at: B(0.5), style: serif({ fontSize: 96, fontWeight: 400 }) }]} />
      </div>
      {hasRec('mcp-connect') ? (
        <div style={abs(360, 220, { width: 1200, height: 760, borderRadius: 22, overflow: 'hidden', ...card({}) })}>
          <Rec id="mcp-connect">{null}</Rec>
        </div>
      ) : (
        <>
          <div style={abs(140, 300, { ...card({ borderRadius: 22 }), width: 440, padding: '26px 28px', boxSizing: 'border-box' })}>
            <div style={label({ fontSize: 16 })}>Harbor Summit 2026</div>
            {['38 sessions', '12 speakers', '214 quotes', '5 themes · 9 debates'].map((x, i) => (
              <div key={x} style={{ fontFamily: SANS, fontSize: 26, color: R.ink, marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: i === 0 ? R.brand : R.ink3 }} />
                {x}
              </div>
            ))}
          </div>
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            <line x1={580} y1={480} x2={1180} y2={480} stroke={R.ink} strokeWidth={4} strokeDasharray={solid > 0.99 ? '0' : '14 14'} opacity={0.35 + 0.65 * solid} />
            {[4, 5, 6, 7].map((b) => {
              const p = lerp(t, B(b), B(b + 0.8), 0, 1, INOUT);
              return p > 0 && p < 1 ? <circle key={b} cx={580 + 600 * p} cy={480} r={10} fill={R.brand} /> : null;
            })}
          </svg>
          <div style={abs(880 - 110, 480 - 60 - (1 - slot) * 300, { opacity: Math.min(1, slot * 1.5), ...card({ borderRadius: 20 }), width: 220, height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 })}>
            <Mark size={50} />
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18, color: R.ink }}>RecapHub MCP</div>
          </div>
          <div style={abs(1180, 230)}>
            <ChatWin w={600} h={520} connected={lerp(t, B(2.6), B(3))}>
              <div style={abs(24, 24, { display: 'flex', flexDirection: 'column', gap: 12, opacity: lerp(t, B(3.5), B(4)) })}>
                <div style={label({ fontSize: 15 })}>Your events</div>
                {['Harbor Summit 2026', 'Product Day 2026'].map((x) => <div key={x} style={{ fontFamily: SANS, fontSize: 22, color: R.ink, background: R.subtle, borderRadius: 12, padding: '12px 16px' }}>{x}</div>)}
              </div>
            </ChatWin>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ three people, three questions

const QA: React.FC<{ t: number; B: (n: number) => number; who: string; role: string; avatar: { i: string; bg: string; fg: string }; q: string; rec: string; tool: string; children: React.ReactNode }> = ({ t, B, who, role, avatar, q, rec, tool, children }) => {
  const sent = t >= B(1.75);
  const answering = t >= B(2.1) && t < B(2.9);
  return (
    <AbsoluteFill>
      <div style={abs(110, 260, { width: 560 })}>
        <Reveal t={t} at={0} y={20} dur={0.35}>
          <Avatar s={avatar} size={110} />
        </Reveal>
        <Reveal t={t} at={B(0.25)} y={20} dur={0.35}>
          <div style={head(64, { fontWeight: 700, letterSpacing: '-0.04em', marginTop: 28 })}>{who}</div>
          <div style={serif({ fontSize: 56, color: R.ink2, marginTop: 4 })}>{role}</div>
        </Reveal>
      </div>
      <div style={abs(700, 110)}>
        {hasRec(rec) ? (
          <div style={{ width: 1110, height: 860, borderRadius: 24, overflow: 'hidden', ...card({}) }}>
            <Rec id={rec}>{null}</Rec>
          </div>
        ) : (
          <ChatWin w={1110} h={860} connected={1}>
            <div style={{ position: 'absolute', inset: 0, padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {sent ? (
                <Reveal t={t} at={B(1.75)} y={14} dur={0.25} style={{ alignSelf: 'flex-end' }}>
                  <div style={{ background: R.subtle, borderRadius: 20, padding: '16px 22px', fontFamily: SANS, fontSize: 30, color: R.ink, maxWidth: 820 }}>{q}</div>
                </Reveal>
              ) : null}
              {answering ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start', ...pill({ fontSize: 20 }) }}>
                  <Spinner t={t} size={20} /> {tool}
                </div>
              ) : null}
              {t >= B(2.9) ? children : null}
              <div style={{ marginTop: 'auto', border: `1.5px solid ${sent ? R.border : R.brand}`, boxShadow: sent ? 'none' : `0 0 0 5px ${R.brand50}`, borderRadius: 18, padding: '18px 22px', fontFamily: SANS, fontSize: 28, color: sent ? R.ink3 : R.ink }}>
                {sent ? 'Reply to Claude…' : <TypeOn t={t} at={B(0.3)} cps={40} caret={R.brand} parts={[{ text: q }]} />}
              </div>
            </div>
          </ChatWin>
        )}
      </div>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={pill({ fontSize: 19, padding: '5px 14px' })}>{children}</span>;

const Q1 = ({ t, B }: Ctx) => (
  <QA t={t} B={B} who="Maya" role="Head of events" avatar={{ i: 'MO', bg: R.ink, fg: '#fff' }} q="What were the top 3 debates on day 2?" rec="mcp-ask" tool="RecapHub · searching day 2">
    {[['Build vs buy', 'Priya Raman vs Tom Okafor', 'Pilot results · 18:40'], ['Remote audits', 'Mei Arai vs Dev Bose', 'Remote audits · 07:12'], ['AI in hiring', 'Sara Kim vs Jonas Lind', 'AI in hiring · 33:05']].map(([title, who, src], i) => (
      <Reveal key={title} t={t} at={B(2.9 + i * 0.5)} y={18} dur={0.3}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '10px 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 26, color: R.brand, width: 26 }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: R.ink }}>{title}</div>
            <div style={{ fontFamily: SANS, fontSize: 24, color: R.ink2 }}>{who}</div>
          </div>
          <Chip>{src}</Chip>
        </div>
      </Reveal>
    ))}
  </QA>
);

const Q2 = ({ t, B }: Ctx) => (
  <QA t={t} B={B} who="Jo" role="Social team" avatar={{ i: 'JS', bg: R.sand, fg: R.ink }} q="Three quotes on pricing for LinkedIn." rec="mcp-quotes" tool="RecapHub · finding quotes">
    {[[0, 'Pricing is a story you tell twice.', 'Keynote · 07:45'], [1, 'Nobody pays for features. They pay for Monday morning.', 'Panel · 14:02'], [5, 'Discounts are a confession.', 'CFO fireside · 21:30']].map(([s, q, src], i) => (
      <Reveal key={i} t={t} at={B(2.9 + i * 0.5)} y={18} dur={0.3}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: R.subtle, borderRadius: 16, padding: '14px 18px' }}>
          <Avatar s={SPEAKERS[s as number]} size={50} edge={R.subtle} />
          <div style={{ flex: 1, ...serif({ fontSize: 32, color: R.ink }) }}>“{q}”</div>
          <Chip>{src}</Chip>
        </div>
      </Reveal>
    ))}
  </QA>
);

const Q3 = ({ t, B }: Ctx) => (
  <QA t={t} B={B} who="Dana" role="CEO" avatar={{ i: 'DW', bg: R.brand100, fg: R.brand600 }} q="Summarise day 1 for the board, in 5 bullets." rec="mcp-summary" tool="RecapHub · reading 14 sessions">
    {['Attendance up; sessions on AI ran full.', 'Build vs buy split the room.', 'Compliance cost is the top theme (34%).', 'Sponsors asked for the hiring panel recap.', 'Open question: who owns the data?'].map((b, i) => (
      <Reveal key={b} t={t} at={B(2.9 + i * 0.3)} y={12} dur={0.25}>
        <div style={{ display: 'flex', gap: 14, fontFamily: SANS, fontSize: 30, color: R.ink, padding: '4px 0' }}>
          <span style={{ color: R.brand }}>•</span> {b}
        </div>
      </Reveal>
    ))}
  </QA>
);

// ------------------------------------------------------------------ payoff + end

const Payoff = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Ink t={t} />
    <div style={centerRow(330)}>
      <WordPush t={t} style={head(150, { color: '#F5F4F2', fontWeight: 700, letterSpacing: '-0.05em' })} words={[{ text: 'Your', at: 0 }, { text: 'conference,', at: B(0.5) }]} />
    </div>
    <div style={centerRow(500)}>
      <WordPush t={t} style={serif({ fontSize: 170, color: '#F5F4F2' })} words={[{ text: 'inside', at: B(1) }, { text: 'Claude.', at: B(1.5) }]} />
    </div>
    <div style={centerRow(800)}>
      <Reveal t={t} at={B(3)} y={14}>
        <div style={label({ fontSize: 24, color: '#A8A49D' })}>RecapHub MCP · works in Claude and ChatGPT</div>
      </Reveal>
    </div>
  </AbsoluteFill>
);

const End = ({ t, B }: Ctx) => <EndCard t={t} B={B} line="Ask your event anything." />;

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = { hook: Hook, problem: Problem, connect: Connect, q1: Q1, q2: Q2, q3: Q3, payoff: Payoff, end: End };

const { at: sAt } = sfxKit(tl);
const SFX = [
  { at: sAt('connect', 1), src: 'page-turn' as const, vol: 0.4 },
  { at: sAt('connect', 2.6), src: 'switch' as const, vol: 0.3 },
  ...['q1', 'q2', 'q3'].flatMap((id) => [
    { at: sAt(id, 1.75), src: 'switch' as const, vol: 0.32 },
    { at: sAt(id, 2.9), src: 'pop' as const, vol: 0.2 },
  ]),
  { at: sAt('end', 3), src: 'ding' as const, vol: 0.22 },
];

export const RecapHubMcp: React.FC = () => <Film tl={tl} render={RENDER} sfx={SFX} />;
export const mcpTimeline = tl;
