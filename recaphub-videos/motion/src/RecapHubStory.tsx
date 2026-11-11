/* RecapHub · "Ask your event anything with MCP", 1920 x 1080, ~53 s, storytelling + educative.
 * Script (hook / problem / product / payoff / CTA), told as one Monday morning:
 *   0-4 s    9:02. A message from the CEO: "What were the top 3 debates on day 2?" Board call at 10.
 *   4-10 s   Day 2 was 14 sessions, 31 hours of video. She has 58 minutes.
 *   10-14 s  "So she didn't watch them." "She asked."
 *   14-20 s  01 Connect: RecapHub MCP in Claude
 *   20-29 s  02 Ask: the question, answered with quotes and timestamps
 *   29-35 s  03 Check the source: who said it, and when
 *   35-41 s  9:06. Sent. "Four minutes."
 *   41-47 s  The three steps, and more questions to ask
 *   47-53 s  RecapHub · Your conference, inside Claude · Book a demo · recaphub.co
 * Maya, Dana and the speakers are fictional. Music: music-rh-story.wav (compose.py story), 116 BPM. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-story.json';
import { Ctx, Cursor, CursorPt, Reveal, Scene, Sfx, Soundtrack, Timeline, TypeOn, WordPush, WordSwap, EXPO, INOUT, clicksOf, count, lerp, sceneBeats, sceneStart, spr, transitionSfx } from './kit';
import { R, MONO, SANS, RING, Avatar, Check, Cta, Mark, Rec, SPEAKERS, Spinner, Stone, abs, card, centerRow, hasRec, head, label, pill, serif } from './rh';

const tl = tlJson as Timeline;
const DANA = { i: 'DW', bg: R.sand, fg: R.ink };
const QUESTION = 'What were the top 3 debates on day 2?';

/** The story's clock, top left: the chapter's time of day. */
const Chapter: React.FC<{ t: number; text: string; dark?: boolean }> = ({ t, text, dark }) => (
  <div style={abs(110, 70, { display: 'flex', alignItems: 'center', gap: 14, opacity: lerp(t, 0, 0.3) })}>
    <div style={{ width: 10, height: 10, borderRadius: 5, background: R.brand }} />
    <div style={label({ fontSize: 22, color: dark ? '#A8A49D' : R.ink2 })}>{text}</div>
  </div>
);

/** A book-caption line of narration. */
const Narration: React.FC<{ t: number; at: number; children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ t, at, children, size = 64, style }) => (
  <Reveal t={t} at={at} y={22} dur={0.5} style={style}>
    <div style={serif({ fontSize: size, color: R.ink, lineHeight: 1.15 })}>{children}</div>
  </Reveal>
);

// ------------------------------------------------------------------ the phone (message and reply)

const Phone: React.FC<{ t: number; time: string; children: React.ReactNode; lock?: boolean }> = ({ t, time, children, lock }) => (
  <div style={{ width: 440, height: 900, borderRadius: 64, background: R.ink, padding: 14, boxSizing: 'border-box', boxShadow: '0 50px 100px rgba(26,23,20,0.28)' }}>
    <div style={{ width: '100%', height: '100%', borderRadius: 52, overflow: 'hidden', position: 'relative', background: lock ? 'linear-gradient(170deg, #3A3530 0%, #1A1714 100%)' : R.page }}>
      <div style={abs(160, 14, { width: 92, height: 28, borderRadius: 14, background: '#000' })} />
      {lock ? (
        <>
          <div style={{ position: 'absolute', top: 110, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 24, color: '#E8E6E3' }}>Monday 10 November</div>
          <div style={{ position: 'absolute', top: 140, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 120, color: '#FAFAF9', letterSpacing: '-0.03em' }}>{time}</div>
        </>
      ) : (
        <div style={{ height: 120, borderBottom: `1px solid ${R.border}`, display: 'flex', alignItems: 'flex-end', gap: 14, padding: '0 26px 16px', background: '#fff' }}>
          <Avatar s={DANA} size={50} />
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: R.ink }}>Dana Whitfield</div>
            <div style={{ fontFamily: SANS, fontSize: 17, color: R.ink3 }}>CEO · {time}</div>
          </div>
        </div>
      )}
      {children}
    </div>
  </div>
);

const Bubble: React.FC<{ me?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ me, children, style }) => (
  <div style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: 320, background: me ? R.ink : '#fff', color: me ? '#fff' : R.ink, border: me ? 'none' : `1px solid ${R.border}`, borderRadius: 22, padding: '14px 18px', fontFamily: SANS, fontSize: 20, lineHeight: 1.4, ...style }}>{children}</div>
);

const Message = ({ t, B }: Ctx) => {
  const note = spr(t, B(0.5), 14, 0.8);
  return (
    <AbsoluteFill>
      <Chapter t={t} text="Monday · 9:02 AM" />
      <div style={abs(110, 330, { width: 900 })}>
        <div style={serif({ fontSize: 88, color: R.ink, lineHeight: 1.12 })}>
          <TypeOn t={t} at={B(1)} cps={24} caret={R.brand} caretOff={B(5)} style={{ whiteSpace: 'normal' }} parts={[{ text: `“${QUESTION}”` }]} />
        </div>
        <Reveal t={t} at={B(4.5)} y={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 40 }}>
            <Avatar s={DANA} size={56} />
            <div style={{ fontFamily: SANS, fontSize: 32, color: R.ink2 }}>
              Dana, CEO. <span style={{ color: R.ink, fontWeight: 600 }}>Board call at 10.</span>
            </div>
          </div>
        </Reveal>
      </div>
      <div style={abs(1250, 100 + (1 - spr(t, 0, 16, 0.9)) * 300)}>
        <Phone t={t} time="9:02" lock>
          <div style={abs(22, 330 + (1 - note) * -60, { width: 368, opacity: Math.min(1, note * 1.5), background: 'rgba(250,250,249,0.92)', borderRadius: 26, padding: '18px 20px', boxSizing: 'border-box' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar s={DANA} size={34} edge="transparent" />
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 19, color: R.ink, flex: 1 }}>Dana Whitfield</div>
              <div style={{ fontFamily: SANS, fontSize: 16, color: R.ink3 }}>now</div>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 19, color: R.ink, marginTop: 8, lineHeight: 1.35 }}>Board call at 10. {QUESTION}</div>
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ problem: 31 hours, 58 minutes

const DAY2 = [
  ['Opening: The cost of compliance', '52:14'], ['Panel: Build vs buy', '47:30'], ['Fireside: Ops at scale', '38:02'], ['Workshop: Audits that ship', '1:12:44'],
  ['Remote audits, honestly', '44:18'], ['Pilot results', '31:55'], ['Lightning talks', '58:40'], ['AI in hiring', '41:09'],
  ['Supplier risk breakout', '49:21'], ['Data quality clinic', '1:05:12'], ['Procurement roundtable', '39:47'], ['Keynote: The next decade', '52:14'],
  ['Customer stories', '36:30'], ['Closing remarks', '21:09'], ['Sponsor showcase', '28:44'], ['Q&A: Ask the board', '33:16'],
];

const Problem = ({ t, B }: Ctx) => {
  const drift = t * 18;
  const dim = lerp(t, B(9), B(10));
  const left = Math.max(0, 58 * 60 - Math.floor(Math.max(0, t - B(6)) / (B(1) - B(0))) * 7);
  const hand = Math.floor(t / (B(1) - B(0))) * 6;
  return (
    <AbsoluteFill>
      <Chapter t={t} text="Monday · 9:02 AM" />
      <div style={abs(110, 150, { width: 1040, height: 760, overflow: 'hidden', maskImage: 'linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)' })}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, transform: `translateY(${40 - drift}px)`, opacity: 1 - dim * 0.65 }}>
          {[...DAY2, ...DAY2.slice(0, 8)].map(([title, d], i) => (
            <Reveal key={i} t={t} at={B(i * 0.12)} y={20} dur={0.35}>
              <div style={{ ...card({ borderRadius: 16, boxShadow: '0 1px 2px rgba(26,23,20,0.05)' }), overflow: 'hidden' }}>
                <div style={{ height: 120, background: i % 3 === 0 ? '#2A2622' : i % 3 === 1 ? '#3A3530' : '#57534E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8E6E3', fontSize: 26 }}>▶</div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18, color: R.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 15, color: R.ink3, marginTop: 4 }}>{d}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <div style={abs(1260, 170, { width: 560 })}>
        <div style={label({ fontSize: 20 })}>Day 2 · 14 sessions</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 128, color: R.ink, letterSpacing: '-0.045em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.05, marginTop: 6 }}>
          {count(t, B(0.5), B(3), 0, 31)}h <span style={{ color: R.ink3 }}>{String(count(t, B(0.5), B(3), 0, 12)).padStart(2, '0')}m</span>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 30, color: R.ink2, marginTop: 4 }}>of recordings</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 70, opacity: lerp(t, B(5.5), B(6)) }}>
          <svg width={150} height={150}>
            <circle cx={75} cy={75} r={68} fill="#fff" stroke={R.ink} strokeWidth={5} />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <line key={i} x1={75 + Math.sin(a) * 56} y1={75 - Math.cos(a) * 56} x2={75 + Math.sin(a) * 62} y2={75 - Math.cos(a) * 62} stroke={R.ink} strokeWidth={3} />;
            })}
            <line x1={75} y1={75} x2={75} y2={34} stroke={R.ink} strokeWidth={5} strokeLinecap="round" transform="rotate(12 75 75)" />
            <line x1={75} y1={75} x2={75} y2={22} stroke={R.danger} strokeWidth={2.5} strokeLinecap="round" transform={`rotate(${hand} 75 75)`} />
            <circle cx={75} cy={75} r={5} fill={R.ink} />
          </svg>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 76, color: R.ink, fontVariantNumeric: 'tabular-nums' }}>
              {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 26, color: R.ink2 }}>until the board call</div>
          </div>
        </div>
        <Narration t={t} at={B(7)} size={60} style={{ marginTop: 60 }}>
          Nobody watches 31 hours in 58 minutes.
        </Narration>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ turn

const Turn = ({ t, B }: Ctx) => {
  const swap = lerp(t, B(3.6), B(4), 0, 1, INOUT);
  const under = lerp(t, B(5), B(6.2), 0, 1, EXPO);
  return (
    <AbsoluteFill>
      <div style={centerRow(400, { opacity: 1 - swap, transform: `translateY(${-swap * 40}px)` })}>
        <WordPush t={t} style={serif({ fontSize: 150, color: R.ink })} gap="0.22em" words={[{ text: 'So', at: 0 }, { text: 'she', at: B(0.5) }, { text: 'didn’t', at: B(1) }, { text: 'watch', at: B(1.5) }, { text: 'them.', at: B(2) }]} />
      </div>
      <div style={centerRow(380, { opacity: swap })}>
        <div style={{ position: 'relative' }}>
          <WordPush t={t} style={serif({ fontSize: 210, color: R.ink })} gap="0.22em" words={[{ text: 'She', at: B(4) }, { text: 'asked.', at: B(4.5) }]} />
          <div style={abs(340, 230, { height: 10, width: 470 * under, background: R.brand, borderRadius: 5 })} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the assistant window

const Assistant: React.FC<{ w: number; h: number; rec: string; children: React.ReactNode; connected?: boolean; title?: string }> = ({ w, h, rec, children, connected, title = 'New chat' }) => (
  <div style={{ ...card({ borderRadius: 26 }), width: w, height: h, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <Rec id={rec}>
      <div style={{ height: 72, flexShrink: 0, borderBottom: `1px solid ${R.border}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px', background: '#fff' }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: R.ink }}>Claude</div>
        <div style={{ fontFamily: SANS, fontSize: 22, color: R.ink3 }}>{title}</div>
        {connected ? <div style={{ ...pill({ fontSize: 18, padding: '6px 14px' }), marginLeft: 'auto' }}>RecapHub MCP · Harbor Summit 2026</div> : null}
      </div>
      <div style={{ flex: 1, position: 'relative', background: '#fff' }}>{children}</div>
    </Rec>
  </div>
);

/** A step's left column: number, verb, one line. */
const Step: React.FC<{ t: number; B: (n: number) => number; n: string; verb: string; line: React.ReactNode }> = ({ t, B, n, verb, line }) => (
  <div style={abs(110, 200, { width: 620 })}>
    <Reveal t={t} at={0} y={20} dur={0.4}>
      <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 30, color: R.brand }}>Step {n}</div>
    </Reveal>
    <div style={{ marginTop: 10 }}>
      <WordPush justify="flex-start" t={t} style={head(124, { fontWeight: 700, letterSpacing: '-0.05em', whiteSpace: 'nowrap' })} words={[{ text: verb, at: B(0.25) }]} />
    </div>
    <Narration t={t} at={B(1)} size={58} style={{ marginTop: 24 }}>
      {line}
    </Narration>
  </div>
);

const CONNECT_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(0.8), x: 1500, y: 1060 },
  { t: B(1.8), x: 1630, y: 365 },
  { t: B(2), x: 1630, y: 365, click: true },
  { t: B(3.7), x: 1640, y: 512 },
  { t: B(4), x: 1640, y: 512, click: true },
  { t: B(6), x: 1700, y: 900 },
];

const Connect = ({ t, B }: Ctx) => {
  const enter = spr(t, B(0.2), 16, 0.85);
  const added = t >= B(2);
  const on = t >= B(4);
  const knob = lerp(t, B(4), B(4.25), 0, 1, EXPO);
  return (
    <AbsoluteFill>
      <Chapter t={t} text="Monday · 9:03 AM" />
      <Step t={t} B={B} n="01" verb="Connect." line={<>Add RecapHub to Claude. <span style={{ color: R.ink2 }}>Once.</span></>} />
      <div style={abs(800, 200 + (1 - enter) * 500, { opacity: Math.min(1, enter * 1.5) })}>
        <Assistant w={1010} h={700} rec="mcp-connect" title="Settings › Connectors">
          <div style={{ padding: '34px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: R.ink, letterSpacing: '-0.02em' }}>Connectors</div>
              <div style={{ marginLeft: 'auto', fontFamily: SANS, fontWeight: 500, fontSize: 21, color: R.ink, border: `1px solid ${R.border}`, borderRadius: 12, padding: '10px 18px', background: t >= B(2) && t < B(2.2) ? R.subtle : '#fff' }}>+ Add custom connector</div>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 22, color: R.ink3, marginTop: 8 }}>Let Claude read from the tools you use.</div>
            {added ? (
              <Reveal t={t} at={B(2.2)} y={20} dur={0.4}>
                <div style={{ marginTop: 40, border: `1px solid ${on ? R.brand100 : R.border}`, background: on ? R.brand50 : '#fff', borderRadius: 20, padding: '24px 26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fff', border: `1px solid ${R.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mark size={52} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: R.ink }}>RecapHub MCP</div>
                      <div style={{ fontFamily: SANS, fontSize: 20, color: R.ink2 }}>Your events: sessions, speakers, quotes, debates</div>
                    </div>
                    <div style={{ width: 84, height: 46, borderRadius: 23, background: on ? R.brand : R.muted, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 5, left: 5 + 38 * knob, width: 36, height: 36, borderRadius: 18, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
                    </div>
                  </div>
                  {on ? (
                    <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${R.brand100}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[['Harbor Summit 2026', '38 sessions · 12 speakers'], ['Product Day 2026', '9 sessions · 6 speakers']].map(([n, d], i) => (
                        <Reveal key={n} t={t} at={B(4.5 + i * 0.5)} y={12} dur={0.3}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontSize: 23, color: R.ink }}>
                            <Check size={22} color={R.brand} />
                            <span style={{ fontWeight: 600 }}>{n}</span>
                            <span style={{ color: R.ink2 }}>{d}</span>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Reveal>
            ) : null}
            <Reveal t={t} at={B(6.5)} y={12}>
              <div style={{ marginTop: 34, display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontWeight: 500, fontSize: 22, color: R.ink, background: R.subtle, borderRadius: 99, padding: '10px 20px' }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: R.success }} /> Connected
              </div>
            </Reveal>
          </div>
        </Assistant>
      </div>
      {!hasRec('mcp-connect') ? <Cursor t={t} path={CONNECT_CURSOR(B)} ring={RING} /> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ ask

const DEBATES = [
  { title: 'Build vs buy', line: 'Priya wants to own the stack; Tom says buying got them live in six weeks.', who: 'Pilot results', tc: '18:40' },
  { title: 'Remote audits', line: 'Mei trusts the data trail; Dev wants auditors in the room.', who: 'Remote audits, honestly', tc: '07:12' },
  { title: 'AI in hiring', line: 'Sara backs AI screening with a human sign-off; Jonas wants it out of hiring.', who: 'AI in hiring', tc: '33:05' },
];
const ASK_SEND = 4;
const ITEM_AT = [7, 9, 11];

const Ask = ({ t, B }: Ctx) => {
  const enter = spr(t, 0, 16, 0.85);
  const sent = t >= B(ASK_SEND);
  const thinking = t >= B(ASK_SEND + 0.4) && t < B(6);
  return (
    <AbsoluteFill>
      <Chapter t={t} text="Monday · 9:04 AM" />
      <Step t={t} B={B} n="02" verb="Ask." line={<>In plain words, <span style={{ color: R.ink2 }}>like you’d ask a colleague.</span></>} />
      <div style={abs(800, 150 + (1 - enter) * 500, { opacity: Math.min(1, enter * 1.5) })}>
        <Assistant w={1010} h={820} rec="mcp-ask" connected title="Day 2 debates">
          <div style={{ position: 'absolute', inset: 0, padding: '26px 34px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sent ? (
              <Reveal t={t} at={B(ASK_SEND)} y={14} dur={0.3} style={{ alignSelf: 'flex-end' }}>
                <div style={{ background: R.subtle, color: R.ink, fontFamily: SANS, fontSize: 25, borderRadius: 20, padding: '14px 22px' }}>{QUESTION}</div>
              </Reveal>
            ) : null}
            {thinking ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...pill({ fontSize: 20 }), alignSelf: 'flex-start' }}>
                <Spinner t={t} size={20} /> RecapHub · searching 14 sessions from day 2
              </div>
            ) : null}
            {t >= B(6) ? (
              <Reveal t={t} at={B(6)} y={10} dur={0.3}>
                <div style={{ fontFamily: SANS, fontSize: 24, color: R.ink2 }}>Three debates came up more than once on day 2:</div>
              </Reveal>
            ) : null}
            {DEBATES.map((d, i) => (
              <Reveal key={d.title} t={t} at={B(ITEM_AT[i])} y={20} dur={0.4}>
                <div style={{ display: 'flex', gap: 18, padding: '6px 0' }}>
                  <div style={{ fontFamily: MONO, fontSize: 24, color: R.brand, width: 26, paddingTop: 2 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 27, color: R.ink }}>{d.title}</div>
                    <div style={{ fontFamily: SANS, fontSize: 22, color: R.ink2, lineHeight: 1.4, marginTop: 2 }}>{d.line}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <div style={pill({ fontSize: 18, padding: '5px 14px' })}>
                        {d.who} · <span style={{ fontFamily: MONO }}>{d.tc}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', border: `1.5px solid ${sent ? R.border : R.brand}`, borderRadius: 18, padding: '16px 22px', boxShadow: sent ? 'none' : `0 0 0 5px ${R.brand50}` }}>
              <div style={{ flex: 1, fontFamily: SANS, fontSize: 25, color: sent ? R.ink3 : R.ink }}>
                {sent ? 'Reply to Claude…' : <TypeOn t={t} at={B(0.8)} cps={20} caret={R.brand} parts={[{ text: QUESTION }]} />}
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: sent ? R.muted : R.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>↑</div>
            </div>
          </div>
        </Assistant>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ cite: who said it, and when

const QUOTES = [
  { s: SPEAKERS[0], text: 'We’d rather own the data than rent the dashboard.', where: 'Pilot results · Day 2', tc: '18:40', side: 'Build' },
  { s: SPEAKERS[1], text: 'Buying got us live in six weeks. Building got us a roadmap.', where: 'Pilot results · Day 2', tc: '22:10', side: 'Buy' },
];

const Cite = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Chapter t={t} text="Monday · 9:05 AM" />
    <Step t={t} B={B} n="03" verb="Check it." line={<>Every answer comes with <span style={{ color: R.ink }}>quotes and timestamps.</span></>} />
    <div style={abs(820, 170)}>
      <Reveal t={t} at={B(0.3)} y={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={label({ fontSize: 20, color: R.ink2 })}>Debate 1</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, color: R.ink, letterSpacing: '-0.02em' }}>Build vs buy</div>
        </div>
      </Reveal>
      {QUOTES.map((q, i) => {
        const at = B(1 + i * 3);
        const p = spr(t, at, 15, 0.85);
        return (
          <div key={i} style={{ marginTop: 34, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 160}px)` }}>
            <div style={{ ...card({ borderRadius: 24 }), width: 960, padding: '30px 36px', boxSizing: 'border-box', display: 'flex', gap: 26 }}>
              <Avatar s={q.s} size={76} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: R.ink }}>{q.s.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 21, color: R.ink3 }}>{q.s.role}</div>
                  <div style={{ marginLeft: 'auto', fontFamily: SANS, fontWeight: 600, fontSize: 18, color: i ? R.ink : '#fff', background: i ? R.sand : R.ink, borderRadius: 99, padding: '4px 14px' }}>{q.side}</div>
                </div>
                <div style={serif({ fontSize: 46, color: R.ink, lineHeight: 1.2, marginTop: 12 })}>
                  <TypeOn t={t} at={at + 0.2} cps={40} caret={false} style={{ whiteSpace: 'normal' }} parts={[{ text: `“${q.text}”` }]} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, opacity: lerp(t, at + B(1.5) - B(0), at + B(2) - B(0)) }}>
                  <div style={pill({ fontSize: 20 })}>
                    {q.where} · <span style={{ fontFamily: MONO }}>{q.tc}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ reply: 9:06

const REPLY_SEND = 4;
const Reply = ({ t, B }: Ctx) => {
  const sent = t >= B(REPLY_SEND);
  return (
    <AbsoluteFill>
      <Chapter t={t} text="Monday · 9:06 AM" />
      <div style={abs(110, 300, { width: 900 })}>
        <div style={{ position: 'relative', height: 260 }}>
          <div style={{ position: 'absolute', left: 0, top: 40, opacity: 1 - lerp(t, B(REPLY_SEND), B(REPLY_SEND + 0.4)) }}>
            <Narration t={t} at={B(0.3)} size={84}>
              She pasted the answer.
            </Narration>
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - lerp(t, B(7.6), B(8)) }}>
            <WordPush justify="flex-start" t={t} style={head(240, { fontWeight: 600, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums' })} words={[{ text: '9:06.', at: B(REPLY_SEND + 0.5) }]} />
          </div>
          <div style={{ position: 'absolute', left: 0, top: 20, opacity: lerp(t, B(8), B(8.3)) }}>
            <WordPush justify="flex-start" t={t} style={serif({ fontSize: 190, color: R.ink })} words={[{ text: 'Four', at: B(8) }, { text: 'minutes.', at: B(8.5) }]} />
          </div>
        </div>
        <Narration t={t} at={B(9.5)} size={52} style={{ marginTop: 30 }}>
          <span style={{ color: R.ink2 }}>Answer sent, sources included.</span>
        </Narration>
      </div>
      <div style={abs(1250, 90)}>
        <Phone t={t} time={sent ? '9:06' : '9:05'}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 130, bottom: 0, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Bubble>Board call at 10. {QUESTION}</Bubble>
            {sent ? (
              <Reveal t={t} at={B(REPLY_SEND)} y={20} dur={0.35} style={{ alignSelf: 'flex-end' }}>
                <Bubble me>
                  <b>Top 3 debates, day 2</b>
                  <br />1. Build vs buy (Priya vs Tom, 18:40)
                  <br />2. Remote audits (Mei vs Dev, 07:12)
                  <br />3. AI in hiring (Sara vs Jonas, 33:05)
                </Bubble>
              </Reveal>
            ) : (
              <div style={{ alignSelf: 'flex-end', opacity: lerp(t, B(1), B(1.5)) }}>
                <Bubble me style={{ background: R.subtle, color: R.ink2, border: `1px dashed ${R.ink3}` }}>
                  <TypeOn t={t} at={B(1.2)} cps={60} caret={R.brand} style={{ whiteSpace: 'normal' }} parts={[{ text: 'Top 3 debates, day 2 · 1. Build vs buy · 2. Remote audits · 3. AI in hiring' }]} />
                </Bubble>
              </div>
            )}
            {t >= B(6.5) ? (
              <Reveal t={t} at={B(6.5)} y={16} dur={0.35}>
                <Bubble>Perfect. That’s the opening slide.</Bubble>
              </Reveal>
            ) : t >= B(5) ? (
              <div style={{ display: 'flex', gap: 6, padding: '14px 18px', background: '#fff', border: `1px solid ${R.border}`, borderRadius: 22, alignSelf: 'flex-start' }}>
                {[0, 1, 2].map((i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 5, background: R.ink3, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 5 + i)) }} />)}
              </div>
            ) : null}
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ lesson: the three steps

const STEPS = [
  ['01', 'Connect', 'RecapHub MCP in Claude'],
  ['02', 'Ask', 'In plain words'],
  ['03', 'Check it', 'Quotes and timestamps'],
];
const PROMPTS = ['Summarise day 2 for the board.', 'Top quotes on pricing.', 'Where did Priya and Tom disagree?', 'Which session should sponsors watch?'];

const Lesson = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <div style={abs(110, 110)}>
      <WordPush justify="flex-start" t={t} style={head(104, { fontWeight: 700, letterSpacing: '-0.05em' })} words={[{ text: 'Ask', at: 0 }, { text: 'your', at: B(0.25) }, { text: 'event', at: B(0.5) }, { text: 'anything.', at: B(0.75), style: serif({ fontSize: 120, fontWeight: 400 }) }]} />
    </div>
    <div style={abs(110, 330, { display: 'flex', gap: 28 })}>
      {STEPS.map(([n, v, d], i) => {
        const p = spr(t, B(1.5 + i), 14, 0.8);
        return (
          <div key={n} style={{ ...card({ borderRadius: 26 }), width: 545, padding: '34px 36px', boxSizing: 'border-box', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 60}px)` }}>
            <div style={{ fontFamily: MONO, fontSize: 28, color: R.brand }}>{n}</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 56, color: R.ink, letterSpacing: '-0.035em', marginTop: 8 }}>{v}</div>
            <div style={{ fontFamily: SANS, fontSize: 28, color: R.ink2, marginTop: 6 }}>{d}</div>
          </div>
        );
      })}
    </div>
    <div style={abs(110, 700, { display: 'flex', alignItems: 'center', gap: 26, opacity: lerp(t, B(5), B(5.4)) })}>
      <div style={label({ fontSize: 22 })}>Try</div>
      <div style={{ ...card({ borderRadius: 20 }), padding: '22px 30px', minWidth: 1000, fontFamily: SANS, fontSize: 40, color: R.ink, display: 'flex', alignItems: 'center', gap: 18 }}>
        <span style={{ color: R.brand }}>›</span>
        <WordSwap t={t} words={PROMPTS} times={[B(5.25), B(7), B(8.5), B(10)]} />
      </div>
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ end

const End = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <div style={centerRow(200, { alignItems: 'center', gap: 40 })}>
      <div style={{ transform: `scale(${0.6 + 0.4 * spr(t, 0, 13)})` }}>
        <Mark size={230} fan={[spr(t, B(0.5), 12), spr(t, B(1), 12)]} />
      </div>
      <Reveal t={t} at={B(1)} y={24}>
        <div style={head(150, { fontWeight: 700, letterSpacing: '-0.045em' })}>RecapHub</div>
      </Reveal>
    </div>
    <div style={centerRow(530)}>
      <Reveal t={t} at={B(2)} y={20}>
        <div style={serif({ fontSize: 96, color: R.ink })}>Your conference, inside Claude.</div>
      </Reveal>
    </div>
    <div style={centerRow(790)}>
      <Cta t={t} at={B(3.5)} />
    </div>
  </AbsoluteFill>
);

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = {
  message: Message,
  problem: Problem,
  turn: Turn,
  connect: Connect,
  ask: Ask,
  cite: Cite,
  reply: Reply,
  lesson: Lesson,
  end: End,
};

const sfx = (): Sfx[] => {
  const at = (id: string, beat: number) => sceneStart(tl, id) + sceneBeats(tl, id)(beat);
  const clicks = (id: string, path: (B: (n: number) => number) => CursorPt[]) =>
    clicksOf(path(sceneBeats(tl, id))).map((c) => ({ at: sceneStart(tl, id) + c, src: 'mouse-click' as const, vol: 0.5 }));
  return [
    ...transitionSfx(tl),
    { at: at('message', 0.5), src: 'ding', vol: 0.3 },
    ...clicks('connect', CONNECT_CURSOR),
    { at: at('connect', 4), src: 'switch', vol: 0.3 },
    { at: at('ask', ASK_SEND), src: 'switch', vol: 0.35 },
    ...ITEM_AT.map((b) => ({ at: at('ask', b), src: 'pop' as const, vol: 0.2 })),
    { at: at('cite', 1), src: 'page-turn', vol: 0.35 },
    { at: at('cite', 4), src: 'page-turn', vol: 0.3 },
    { at: at('reply', REPLY_SEND), src: 'switch', vol: 0.35 },
    { at: at('reply', 6.5), src: 'ding', vol: 0.25 },
    ...[1.5, 2.5, 3.5].map((b) => ({ at: at('lesson', b), src: 'pop' as const, vol: 0.22 })),
    { at: at('end', 0), src: 'page-turn', vol: 0.4 },
    { at: at('end', 3.5), src: 'ding', vol: 0.22 },
  ];
};

export const RecapHubStory: React.FC = () => (
  <AbsoluteFill style={{ background: R.paper }}>
    <Stone tone="paper" />
    {tl.scenes.map((s, i) => (
      <Scene key={s.id} tl={tl} index={i} render={RENDER[s.id]} />
    ))}
    <Soundtrack tl={tl} sfx={sfx()} />
  </AbsoluteFill>
);

export const storyTimeline = tl;
