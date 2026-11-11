/* RecapHub · Real-time / Live promo, ~30 s, live broadcast: the keynote keeps
 * running (LIVE timecode) while its transcript streams and its clip is posted.
 * HOLD: the brief says to check with Prakhar what is live today before this ships.
 * Hook: "Post the keynote clip before the keynote ends."  Payoff: "Live event. Live content."
 * Music: music-rh-live.wav (compose.py live), 132 BPM, G minor. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-live.json';
import { Ctx, Reveal, Timeline, WordPush, lerp, spr } from './kit';
import { R, MONO, SANS, Avatar, Check, ClipPoster, Footage, Ink, RecFill, SPEAKERS, abs, card, centerRow, hasRec, head, label, serif } from './rh';
import { AppShell, EndCard, Film, Fit, Lead, PhoneFrame, Slam, sfxKit } from './ui';

const tl = tlJson as Timeline;

const tc = (s: number) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), Math.floor(s % 60)].map((n) => String(n).padStart(2, '0')).join(':');

const LiveBadge: React.FC<{ t: number; secs: number; big?: boolean }> = ({ t, secs, big }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: big ? 16 : 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: R.danger, color: '#fff', borderRadius: 8, padding: big ? '8px 16px' : '4px 10px', fontFamily: SANS, fontWeight: 700, fontSize: big ? 26 : 16, letterSpacing: '0.08em' }}>
      <span style={{ width: big ? 12 : 8, height: big ? 12 : 8, borderRadius: 6, background: '#fff', opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 4)) }} /> LIVE
    </div>
    <div style={{ fontFamily: MONO, fontSize: big ? 30 : 18, color: '#F5F4F2', fontVariantNumeric: 'tabular-nums', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{tc(secs)}</div>
  </div>
);

// ------------------------------------------------------------------ hook + problem

const Hook = ({ t, B }: Ctx) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <AbsoluteFill style={{ transform: `scale(${1.08 - 0.04 * lerp(t, 0, B(8))})` }}>
      <Footage t={t} w={1920} h={1080} crop={0.5} dim={0.5} />
    </AbsoluteFill>
    <div style={abs(80, 70)}>
      <LiveBadge t={t} secs={38 * 60 + 12 + t} big />
    </div>
    <Slam t={t} at={0} y={330}>
      <div style={head(140, { color: '#FAFAF9', fontWeight: 700, letterSpacing: '-0.05em' })}>Post the keynote clip</div>
    </Slam>
    <Slam t={t} at={B(4)} y={500}>
      <div style={serif({ fontSize: 150, color: '#FAFAF9' })}>before the keynote ends.</div>
    </Slam>
  </AbsoluteFill>
);

const Problem = ({ t, B }: Ctx) => {
  const slide = lerp(t, B(2), B(3.2));
  return (
    <AbsoluteFill>
      <div style={centerRow(120)}>
        <Reveal t={t} at={0} y={20}>
          <div style={head(96, { fontWeight: 700, letterSpacing: '-0.045em' })}>
            Most recaps arrive <span style={serif({ fontSize: 108, fontWeight: 400 })}>a week later.</span>
          </div>
        </Reveal>
      </div>
      {[['Tue 11 Nov', 'Keynote, 9:00', 0], ['Tue 18 Nov', 'Recap goes out', 1]].map(([d, e, i]) => (
        <div key={d as string} style={abs(i ? 1060 : 420, 420, { ...card({ borderRadius: 24 }), width: 440, padding: '30px 34px', boxSizing: 'border-box', opacity: i ? slide : 1, transform: `translateY(${i ? (1 - slide) * 40 : 0}px)` })}>
          <div style={label({ fontSize: 18, color: i ? R.danger : R.ink2 })}>{d}</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: R.ink, marginTop: 10 }}>{e}</div>
        </div>
      ))}
      <div style={abs(880, 470, { fontFamily: MONO, fontSize: 36, color: R.ink2, opacity: slide })}>+7 days →</div>
      <div style={centerRow(760)}>
        <Reveal t={t} at={B(4.5)} y={14}>
          <div style={serif({ fontSize: 64, color: R.ink2 })}>By then, the conversation has moved on.</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ stages, streaming, posting

const STAGES = [
  { name: 'Main stage', state: 'live', talk: 'Keynote: The next decade of events' },
  { name: 'Room B', state: 'live', talk: 'Panel: Build vs buy' },
  { name: 'Room C', state: 'next', talk: 'AI in hiring · 11:30' },
];

const Stage = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Lead t={t} B={B} tag="Real-time" words={['Processed', 'while', 'it’s', 'happening.']} line="Every stage, as it streams." y={220} w={560} />
    <div style={abs(690, 170, { borderRadius: 18, overflow: 'hidden', border: `1px solid ${R.border}`, boxShadow: '0 30px 80px rgba(26,23,20,0.16)' })}>
      <Fit w={1150} bw={1600} bh={900}>
        {hasRec('live-stage') ? <RecFill id="live-stage" /> : (
          <AppShell active="Stages" title="Stages">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
              {STAGES.map((s, i) => {
                const p = spr(t, B(1 + i * 0.5), 14);
                return (
                  <div key={s.name} style={{ ...card({ borderRadius: 18 }), overflow: 'hidden', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 30}px)` }}>
                    <div style={{ position: 'relative' }}>
                      <Footage t={t} w={420} h={236} crop={[0.5, 0.2, 0.8][i]} speaker={i} dim={s.state === 'next' ? 0.6 : 0} />
                      <div style={abs(12, 12)}>{s.state === 'live' ? <LiveBadge t={t} secs={[2292, 1510, 0][i] + t} /> : <div style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 8, padding: '4px 10px', fontFamily: SANS, fontWeight: 600, fontSize: 16 }}>Up next</div>}</div>
                    </div>
                    <div style={{ padding: '18px 20px' }}>
                      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: R.ink }}>{s.name}</div>
                      <div style={{ fontFamily: SANS, fontSize: 19, color: R.ink2, marginTop: 4 }}>{s.talk}</div>
                      {s.state === 'live' ? (
                        <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 40, marginTop: 14 }}>
                          {Array.from({ length: 46 }).map((_, k) => <div key={k} style={{ width: 5, borderRadius: 3, background: R.brand, opacity: 0.7, height: 8 + 28 * Math.abs(Math.sin(t * 6 + k * 0.7 + i)) }} />)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 26, ...card({ borderRadius: 18 }), padding: '20px 24px' }}>
              <div style={label({ fontSize: 15 })}>Main stage · live transcript</div>
              <div style={{ fontFamily: SANS, fontSize: 24, color: R.ink, marginTop: 10 }}>…and that’s why pricing is a story you tell twice<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>▍</span></div>
            </div>
          </AppShell>
        )}
      </Fit>
    </div>
  </AbsoluteFill>
);

const LINES = [
  { s: 0, text: 'The events that win next year are the ones people keep talking about.' },
  { s: 0, text: 'So stop selling seats.' },
  { s: 0, text: 'Pricing is a story you tell twice: once on stage, once in the feed.' },
  { s: 0, text: 'And the feed doesn’t wait for the recap.' },
];

const Stream = ({ t, B }: Ctx) => {
  const clip = spr(t, B(6), 13, 0.8);
  return (
    <AbsoluteFill>
      <Ink t={t} />
      <div style={centerRow(56)}>
        <Reveal t={t} at={0} y={16}>
          <div style={head(56, { color: '#F5F4F2', fontWeight: 600 })}>
            The transcript keeps up. <span style={serif({ fontSize: 64, fontWeight: 400 })}>The clips keep coming.</span>
          </div>
        </Reveal>
      </div>
      <div style={abs(100, 200, { borderRadius: 18, overflow: 'hidden', position: 'relative' })}>
        <Footage t={t} w={960} h={540} crop={0.5} />
        <div style={abs(20, 20)}>
          <LiveBadge t={t} secs={38 * 60 + 30 + t} big />
        </div>
      </div>
      <div style={abs(1100, 200, { width: 720, background: '#221E1B', border: '1px solid #3A3530', borderRadius: 20, padding: '24px 28px', boxSizing: 'border-box', height: 540 })}>
        <div style={label({ fontSize: 16, color: '#A8A49D' })}>Live transcript</div>
        {LINES.map((l, i) => (
          <Reveal key={i} t={t} at={B(0.5 + i * 1.25)} y={12} dur={0.3}>
            <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
              <Avatar s={SPEAKERS[l.s]} size={40} edge="#221E1B" />
              <div style={{ fontFamily: SANS, fontSize: 24, color: i === 2 ? '#F5F4F2' : '#A8A49D', lineHeight: 1.35, background: i === 2 && t >= B(5.5) ? 'rgba(67,97,238,0.25)' : 'transparent', borderRadius: 8, padding: '2px 6px', margin: '-2px -6px' }}>{l.text}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <div style={abs(1100, 780, { opacity: Math.min(1, clip * 1.5), transform: `translateY(${(1 - clip) * 40}px)`, display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 18, padding: '14px 18px', width: 720, boxSizing: 'border-box' })}>
        <ClipPoster t={t} w={86} crop={0.5} radius={10} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: R.ink }}>
            <Check size={22} color={R.success} /> Clip ready
          </div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: R.ink2, marginTop: 4 }}>Keynote · 38:40–39:22 · 9:16</div>
          <div style={serif({ fontSize: 24, color: R.ink, marginTop: 6 })}>“Pricing is a story you tell twice.”</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Post = ({ t, B }: Ctx) => {
  const ph = spr(t, B(0.5), 14, 0.8);
  return (
    <AbsoluteFill>
      <div style={abs(110, 180, { borderRadius: 18, overflow: 'hidden', position: 'relative', boxShadow: '0 30px 80px rgba(26,23,20,0.18)' })}>
        <Footage t={t} w={860} h={484} crop={0.5} />
        <div style={abs(18, 18)}>
          <LiveBadge t={t} secs={39 * 60 + 41 + t} big />
        </div>
      </div>
      <div style={abs(110, 720, { width: 860 })}>
        <Reveal t={t} at={B(2)} y={18}>
          <div style={head(84, { fontWeight: 700, letterSpacing: '-0.045em' })}>Posted.</div>
        </Reveal>
        <Reveal t={t} at={B(3)} y={18}>
          <div style={serif({ fontSize: 64, color: R.ink2, marginTop: 4 })}>The keynote is still on.</div>
        </Reveal>
      </div>
      <div style={abs(1200, 70 + (1 - ph) * 700, { transform: `rotate(${(1 - ph) * 6}deg)` })}>
        <PhoneFrame w={460}>
          <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
            <ClipPoster t={t} w={432} crop={0.5} radius={0} />
            <div style={abs(0, 0, { width: 432, height: 920, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.8) 100%)' })} />
            <div style={abs(26, 660, { width: 380 })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: R.page, color: R.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 15 }}>HS</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: '#fff' }}>harborsummit</div>
                <div style={{ fontFamily: SANS, fontSize: 16, color: '#E8E6E3' }}>· just now</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 20, color: '#E8E6E3', marginTop: 10, lineHeight: 1.35 }}>“Pricing is a story you tell twice.” Live from the main stage.</div>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};

const Payoff = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Ink t={t} />
    <div style={centerRow(300)}>
      <WordPush t={t} style={head(180, { color: '#F5F4F2', fontWeight: 700, letterSpacing: '-0.05em' })} words={[{ text: 'Live', at: 0 }, { text: 'event.', at: B(0.5) }]} />
    </div>
    <div style={centerRow(520)}>
      <WordPush t={t} style={serif({ fontSize: 200, color: '#F5F4F2' })} words={[{ text: 'Live', at: B(2) }, { text: 'content.', at: B(2.5) }]} />
    </div>
  </AbsoluteFill>
);

const End = ({ t, B }: Ctx) => <EndCard t={t} B={B} line="Post the keynote clip before the keynote ends." />;

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = { hook: Hook, problem: Problem, stage: Stage, stream: Stream, post: Post, payoff: Payoff, end: End };

const { at: sAt } = sfxKit(tl);
const SFX = [
  ...[1, 1.5, 2].map((b) => ({ at: sAt('stage', b), src: 'pop' as const, vol: 0.2 })),
  ...[0.5, 1.75, 3, 4.25].map((b) => ({ at: sAt('stream', b), src: 'key' as const, vol: 0.2 })),
  { at: sAt('stream', 6), src: 'ding' as const, vol: 0.22 },
  { at: sAt('post', 0.5), src: 'whoosh' as const, vol: 0.3 },
  { at: sAt('post', 2), src: 'switch' as const, vol: 0.3 },
  { at: sAt('end', 3), src: 'ding' as const, vol: 0.22 },
];

export const RecapHubLive: React.FC = () => <Film tl={tl} render={RENDER} sfx={SFX} />;
export const liveTimeline = tl;
