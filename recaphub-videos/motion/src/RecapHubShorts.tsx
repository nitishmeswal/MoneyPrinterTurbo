/* RecapHub · Stage → Shorts feature promo, 1920 x 1080, ~36 s, kinetic motion graphics.
 * Script (hook / problem / product / payoff / CTA):
 *   0-4 s    "One keynote." "12 clips." "Before the coffee break ends."   (a stab per line)
 *   4-7.5 s  "Your speakers said gold." gold moments on the session timeline. "Nobody posted it."
 *   7.5-10   upload the session; clips render in chat (the stage loader)
 *   10-14    the keynote is cut into 12 vertical clips, each one scored
 *   14-20    the clip carousel: the agent says what each clip still needs
 *   20-24    fix a clip in chat: it re-renders
 *   24-26    Download all
 *   26-31    payoff: posted before the coffee break ends
 *   31-36    RecapHub · Book a demo · recaphub.co
 * Suggested captions are "coming" (not shipped), so the film never shows them.
 * Music: music-rh-shorts.wav (compose.py shorts), 128 BPM. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-shorts.json';
import { Ctx, Cursor, CursorPt, Reveal, Scene, Sfx, Soundtrack, Tilt, Timeline, TypeOn, WordPush, W, H, EXPO, INOUT, clicksOf, count, lerp, sceneBeats, sceneStart, spr, transitionSfx } from './kit';
import { R, MONO, SANS, SHADOW, RING, Browser, Check, ClipPoster, Cta, Flame, Footage, Ink, Mark, Rec, Scissors, Spinner, Stone, TraceLoader, abs, card, centerRow, hasRec, head, label, pill, serif } from './rh';

const tl = tlJson as Timeline;

/** A line that slams in: big, a touch oversized and blurred, settling on the beat. */
const Slam: React.FC<{ t: number; at: number; out?: number; children: React.ReactNode; y: number; style?: React.CSSProperties }> = ({ t, at, out = 99, children, y, style }) => {
  if (t < at - 0.02 || t > out + 0.2) return null;
  const p = lerp(t, at, at + 0.22, 0, 1, EXPO);
  const q = lerp(t, out, out + 0.16, 0, 1, INOUT);
  return (
    <div style={centerRow(y, { opacity: p * (1 - q), transform: `scale(${1.14 - 0.14 * p + 0.06 * q}) translateY(${-q * 40}px)`, filter: `blur(${(1 - p) * 14 + q * 12}px)`, ...style })}>
      {children}
    </div>
  );
};

const Cup: React.FC<{ t: number; size: number; color?: string }> = ({ t, size, color = R.ink }) => {
  const k = size / 100;
  return (
    <div style={{ position: 'relative', width: 120 * k, height: 150 * k }}>
      <svg width={120 * k} height={60 * k} style={{ position: 'absolute', left: 0, top: -6 * k }}>
        {[22, 44, 66].map((x, i) => (
          <path key={i} d={`M ${x * k} ${54 * k} q ${-8 * k} ${-12 * k} 0 ${-24 * k} t 0 ${-24 * k}`} fill="none" stroke={R.ink3} strokeWidth={4 * k} strokeLinecap="round" opacity={0.35 + 0.35 * Math.sin(t * 4 + i * 1.7)} transform={`translate(0 ${Math.sin(t * 3 + i) * 3 * k})`} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 0, top: 56 * k, width: 90 * k, height: 90 * k, background: color, borderRadius: `${6 * k}px ${6 * k}px ${30 * k}px ${30 * k}px` }} />
      <div style={{ position: 'absolute', left: 78 * k, top: 72 * k, width: 34 * k, height: 40 * k, border: `${9 * k}px solid ${color}`, borderRadius: `0 ${20 * k}px ${20 * k}px 0`, borderLeft: 'none' }} />
    </div>
  );
};

// ------------------------------------------------------------------ hook

const Hook = ({ t, B }: Ctx) => {
  const draw = lerp(t, 0, B(1), 0, 1, EXPO);
  const split = lerp(t, B(2), B(2.5), 0, 1, EXPO);
  const gone = lerp(t, B(3.7), B(4), 0, 1, INOUT);
  const fx = 360;
  const fw = 1200;
  const fh = 675;
  const timer = 15 * 60 - Math.max(0, Math.floor((t - B(4)) * 23));
  return (
    <AbsoluteFill>
      {/* the 16:9 frame, then the 12 slivers it becomes */}
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - gone }}>
        {split < 0.02 ? (
          <rect x={fx} y={200} width={fw} height={fh} rx={18} fill="none" stroke={R.ink} strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} opacity={0.18} />
        ) : (
          Array.from({ length: 12 }).map((_, i) => {
            const w = fw / 12;
            const x = fx + i * w + (i - 5.5) * 26 * split;
            return <rect key={i} x={x + 4 * split} y={200 - 40 * split * (i % 2)} width={w - 8 * split} height={fh + 80 * split * (i % 2)} rx={10} fill={i === 5 || i === 6 ? R.brand : R.ink} opacity={0.1 + 0.1 * split} />;
          })
        )}
      </svg>
      <Slam t={t} at={0} out={B(2)} y={380}>
        <div style={head(250, { fontWeight: 700, letterSpacing: '-0.05em' })}>One keynote.</div>
      </Slam>
      <Slam t={t} at={B(2)} out={B(4)} y={380}>
        <div style={head(250, { fontWeight: 700, letterSpacing: '-0.05em' })}>
          12 <span style={serif({ fontSize: 270, fontWeight: 400 })}>clips.</span>
        </div>
      </Slam>
      {t >= B(4) - 0.05 ? (
        <>
          <div style={centerRow(300)}>
            <WordPush
              t={t}
              style={head(150, { fontWeight: 700, letterSpacing: '-0.045em' })}
              words={[
                { text: 'Before', at: B(4) },
                { text: 'the', at: B(4.5) },
                { text: 'coffee', at: B(5) },
              ]}
            />
          </div>
          <div style={centerRow(480)}>
            <WordPush t={t} style={head(150, { fontWeight: 700, letterSpacing: '-0.045em' })} words={[{ text: 'break', at: B(5.5) }, { text: 'ends.', at: B(6), style: serif({ fontSize: 170, fontWeight: 400 }) }]} />
          </div>
          <div style={centerRow(110, { alignItems: 'center', gap: 34, opacity: lerp(t, B(4.5), B(5)) })}>
            <Cup t={t} size={90} />
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 84, color: R.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
              {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
            </div>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ problem: gold that nobody posted

const BARS = 112;
const bar = (i: number) => 18 + 92 * Math.abs(Math.sin(i * 0.71) * Math.sin(i * 0.137 + 1.1)) + 14 * Math.abs(Math.sin(i * 2.3));
const GOLD = [
  { i: 14, q: '“Pricing is a story you tell twice.”', at: 1.5 },
  { i: 41, q: '“We stopped selling tickets. We sell outcomes.”', at: 2 },
  { i: 70, q: '“Your best attendee never showed up.”', at: 2.5 },
  { i: 96, q: '“Nobody remembers the slides.”', at: 3 },
];

const Problem = ({ t, B }: Ctx) => {
  const dead = lerp(t, B(4), B(4.5));
  const squeeze = lerp(t, B(6.4), B(8), 0, 1, INOUT);
  const x0 = 160;
  const span = 1600;
  return (
    <AbsoluteFill>
      <Ink t={t} />
      <div style={abs(160, 120, { height: 200, width: 1600 })}>
        <div style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - dead }}>
          <WordPush justify="flex-start" t={t} style={head(120, { color: '#F5F4F2', fontWeight: 700, letterSpacing: '-0.045em' })} words={[{ text: 'Your', at: 0 }, { text: 'speakers', at: B(0.25) }, { text: 'said', at: B(0.5) }, { text: 'gold.', at: B(1), style: serif({ fontSize: 140, color: R.warning, fontWeight: 400 }) }]} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0, opacity: dead }}>
          <WordPush justify="flex-start" t={t} style={head(120, { color: '#F5F4F2', fontWeight: 700, letterSpacing: '-0.045em' })} words={[{ text: 'Nobody', at: B(4) }, { text: 'posted', at: B(4.25) }, { text: 'it.', at: B(4.5), style: serif({ fontSize: 140, fontWeight: 400 }) }]} />
        </div>
      </div>
      <div style={abs(0, 0, { width: W, height: H, transform: `scaleX(${1 - squeeze * 0.7}) scaleY(${1 - squeeze * 0.4})`, transformOrigin: '960px 640px', opacity: 1 - squeeze * 0.6 })}>
        <div style={abs(x0, 470, { ...label({ color: '#A8A49D', fontSize: 22 }), opacity: lerp(t, B(0.3), B(0.8)) })}>Opening keynote · 52:14</div>
        {Array.from({ length: BARS }).map((_, i) => {
          const g = GOLD.find((x) => Math.abs(x.i - i) <= 1);
          const lit = g && t >= B(g.at) ? 1 - dead : 0;
          const h = bar(i) * lerp(t, B(0.2 + i * 0.006), B(0.8 + i * 0.006), 0, 1, EXPO);
          return <div key={i} style={abs(x0 + (i * span) / BARS, 640 - h / 2, { width: span / BARS - 5, height: h, borderRadius: 4, background: lit ? R.warning : 'rgba(232,230,227,0.28)' })} />;
        })}
        {GOLD.map((g, k) => {
          const p = spr(t, B(g.at), 13);
          const x = x0 + (g.i * span) / BARS;
          const drop = dead;
          return (
            <div key={k} style={abs(x - 20, k % 2 ? 760 : 380, { opacity: Math.min(1, p * 1.5) * (1 - drop * 0.75), transform: `translateY(${(1 - p) * 30 + drop * 60}px) rotate(${drop * (k % 2 ? 4 : -4)}deg)` })}>
              <div style={{ background: '#2A2622', border: `1px solid ${drop > 0.5 ? '#3A3530' : 'rgba(245,158,11,0.5)'}`, borderRadius: 14, padding: '12px 18px', fontFamily: SANS, fontSize: 24, color: drop > 0.5 ? '#78716C' : '#F5F4F2', whiteSpace: 'nowrap', maxWidth: 520 }}>{g.q}</div>
            </div>
          );
        })}
        <div style={abs(1500, 880, { display: 'flex', alignItems: 'baseline', gap: 16, opacity: lerp(t, B(4.5), B(5)) })}>
          <div style={label({ color: '#A8A49D', fontSize: 22 })}>Posted</div>
          <div style={{ fontFamily: MONO, fontSize: 80, fontWeight: 500, color: R.danger }}>0</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ upload: the clips render in chat

const QUIPS = ['Finding the moments worth sharing…', 'Mapping who said what…', 'Reliving the best moments from your event…'];

const Upload = ({ t, B }: Ctx) => {
  const win = spr(t, 0, 16, 0.85);
  const prog = lerp(t, B(1.5), B(5.2), 0, 1, (x) => x);
  const ready = count(t, B(2.5), B(5.2), 0, 12);
  const done = t >= B(5.2);
  const qi = t < B(3) ? 0 : t < B(4.25) ? 1 : 2;
  return (
    <AbsoluteFill>
      <div style={abs(120, 110, { width: 560 })}>
        <WordPush justify="flex-start" t={t} style={head(96, { fontWeight: 700, letterSpacing: '-0.045em' })} words={[{ text: 'Upload', at: 0 }, { text: 'the', at: B(0.25) }]} />
        <WordPush justify="flex-start" t={t} style={serif({ fontSize: 120, color: R.ink, lineHeight: 1.05 })} words={[{ text: 'session.', at: B(0.5) }]} />
        <Reveal t={t} at={B(1.5)} y={16}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 38, color: R.ink2, marginTop: 30, lineHeight: 1.3 }}>The clips render right in the chat.</div>
        </Reveal>
      </div>
      <div style={abs(720, 130 + (1 - win) * 600, { opacity: Math.min(1, win * 1.5) })}>
        <Browser w={1090} h={820} url="app.recaphub.co/chat" rec="shorts-render">
          <div style={{ padding: '30px 34px', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Reveal t={t} at={B(0.3)} y={16} dur={0.3} style={{ alignSelf: 'flex-end' }}>
              <div style={{ background: R.subtle, borderRadius: 20, padding: '16px 20px', width: 520 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: `1px solid ${R.border}`, borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ width: 92, height: 52, borderRadius: 8, overflow: 'hidden' }}>
                    <Footage t={t} w={92} h={52} />
                  </div>
                  <div>
                    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: R.ink }}>day1-keynote.mp4</div>
                    <div style={{ fontFamily: MONO, fontSize: 16, color: R.ink3 }}>52:14 · 1.2 GB</div>
                  </div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 24, color: R.ink, marginTop: 12 }}>Cut the keynote into shorts.</div>
              </div>
            </Reveal>
            <Reveal t={t} at={B(1)} y={20} dur={0.35}>
              <div style={{ ...card({ borderRadius: 18, boxShadow: '0 1px 2px rgba(26,23,20,0.05)' }), padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: R.brand50, color: R.brand600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scissors size={26} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: R.ink }}>Session clips</div>
                    <div style={{ fontFamily: SANS, fontSize: 19, color: R.ink3, fontVariantNumeric: 'tabular-nums' }}>{done ? 'Clips ready' : ready > 0 ? `Saving clips (${ready}/12)` : 'Rendering…'}</div>
                  </div>
                  {done ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 500, fontSize: 21, color: R.ink, transform: `scale(${1 + 0.15 * Math.max(0, 1 - (t - B(5.2)) * 5)})` }}>
                      <Check size={22} color={R.success} /> 12 ready
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...pill({ fontSize: 18, padding: '6px 14px' }) }}>
                      <Spinner t={t} size={18} /> Generating
                    </div>
                  )}
                </div>
                <div style={{ height: 8, borderRadius: 4, background: R.subtle, marginTop: 20, overflow: 'hidden' }}>
                  <div style={{ width: `${prog * 100}%`, height: '100%', background: R.brand, borderRadius: 4 }} />
                </div>
                {!done ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18 }}>
                    <TraceLoader t={t} size={34} />
                    <div style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 22, color: R.ink2, opacity: lerp(t, [B(1.2), B(3), B(4.25)][qi], [B(1.2), B(3), B(4.25)][qi] + 0.25) }}>{QUIPS[qi]}</div>
                  </div>
                ) : null}
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const on = i < ready;
                    return (
                      <div key={i} style={{ width: 64, height: 114, borderRadius: 8, overflow: 'hidden', border: on ? 'none' : `1.5px dashed ${R.muted}`, background: on ? '#000' : R.subtle, transform: `scale(${on ? 0.9 + 0.1 * spr(t, B(2.5) + (i / 12) * (B(5.2) - B(2.5)), 14) : 1})` }}>
                        {on ? <ClipPoster t={t} w={64} crop={i / 11} radius={8} /> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </Browser>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ slice: one keynote, 12 clips

const CUT0 = 0.5;
const SCORES = [91, 74, 87, 66, 82, 79, 70, 88, 63, 77, 85, 72];

const Slice = ({ t, B }: Ctx) => {
  const F = { x: 240, y: 150, w: 1440, h: 810 };
  const sw = F.w / 12;
  const PW = 128;
  const PH = (PW * 16) / 9;
  const gap = 14;
  const rowX = (W - (12 * PW + 11 * gap)) / 2;
  const cuts = Array.from({ length: 11 }).map((_, i) => B(CUT0 + i * 0.25));
  const made = cuts.filter((c) => t >= c).length + (t >= cuts[0] ? 1 : 0);
  return (
    <AbsoluteFill>
      <Ink t={t} />
      <div style={abs(80, 60, { display: 'flex', alignItems: 'baseline', gap: 18 })}>
        <div style={label({ color: '#A8A49D', fontSize: 22 })}>Stage → Shorts</div>
      </div>
      <div style={abs(1580, 40, { fontFamily: MONO, fontWeight: 500, fontSize: 64, color: '#F5F4F2', fontVariantNumeric: 'tabular-nums' })}>
        {String(Math.min(12, made)).padStart(2, '0')}
        <span style={{ color: '#57534E' }}>/12</span>
      </div>
      {Array.from({ length: 12 }).map((_, i) => {
        const p = spr(t, B(4 + i * 0.08), 15, 0.75);
        const tx = rowX + i * (PW + gap);
        const ty = 300 + (i % 2 ? 40 : 0) * p;
        const x = F.x + i * sw + (tx - F.x - i * sw) * p;
        const y = F.y + (ty - F.y) * p;
        const w = sw + (PW - sw) * p;
        const h = F.h + (PH - F.h) * p;
        const gapOpen = lerp(t, B(3.4), B(4), 0, 1, EXPO) * (1 - p);
        return (
          <div key={i} style={abs(x + (i - 5.5) * 10 * gapOpen, y, { width: w, height: h, overflow: 'hidden', borderRadius: 4 + 12 * p })}>
            <Footage t={t} w={w} h={h} crop={i / 11} />
            <Reveal t={t} at={B(5.5 + i * 0.06)} y={8} dur={0.3} style={{ position: 'absolute', left: 8, top: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: R.warning50, color: R.warning700, borderRadius: 99, padding: '3px 10px', fontFamily: SANS, fontWeight: 600, fontSize: 17 }}>
                <Flame size={14} />
                {SCORES[i]}
              </div>
            </Reveal>
          </div>
        );
      })}
      {/* the cut lines sweep down, one per 16th */}
      {cuts.map((c, i) => {
        const d = lerp(t, c, c + 0.16, 0, 1, EXPO);
        const o = 1 - lerp(t, B(3.4), B(3.8));
        if (t < c) return null;
        return <div key={i} style={abs(F.x + (i + 1) * sw - 2, F.y - 30, { width: 4, height: (F.h + 60) * d, background: R.brand, opacity: o })} />;
      })}
      <div style={centerRow(800)}>
        <WordPush t={t} style={head(84, { color: '#F5F4F2', fontWeight: 700, letterSpacing: '-0.04em' })} words={[{ text: '12', at: B(5) }, { text: 'vertical', at: B(5.25) }, { text: 'clips.', at: B(5.5) }, { text: 'Each', at: B(6.25) }, { text: 'one', at: B(6.5) }, { text: 'scored.', at: B(6.75), style: serif({ fontSize: 96, color: R.warning, fontWeight: 400 }) }]} />
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ carousel: what each clip still needs

const CLIPS = [
  { title: 'The next decade starts on the floor', len: '0:38', score: 91, crop: 0.45, sp: 0 },
  { title: 'Why attendees stopped reading agendas', len: '0:51', score: 74, crop: 0.2, sp: 0 },
  { title: 'Pricing is a story you tell twice', len: '0:42', score: 87, crop: 0.62, sp: 0 },
];
const NEEDS = ['Opens mid-sentence', 'Speaker name isn’t on screen'];

const ClipCard: React.FC<{ t: number; active: number; needs?: number; fixed?: boolean; editing?: boolean; v2?: boolean; scale?: number }> = ({ t, active, needs = 2, fixed, editing, v2 }) => {
  const c = CLIPS[active];
  return (
    <div style={{ ...card({ borderRadius: 26 }), width: 1080, padding: '26px 30px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: R.brand50, color: R.brand600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Scissors size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: R.ink }}>Keynote: The next decade of events</div>
          <div style={{ fontFamily: SANS, fontSize: 19, color: R.ink3 }}>Clips ready</div>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20, color: R.ink, border: `1px solid ${R.border}`, borderRadius: 10, padding: '8px 14px' }}>↓ Download all</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontWeight: 500, fontSize: 20, color: R.ink }}>
          <Check size={20} color={R.success} /> 12 ready
        </div>
      </div>
      <div style={{ display: 'flex', gap: 34, marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 30, color: active > 0 ? R.ink2 : R.muted }}>‹</div>
          <div style={{ position: 'relative' }}>
            <ClipPoster t={t} w={270} crop={v2 ? 0.5 : c.crop} speaker={c.sp} radius={14} />
            {editing ? (
              <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(26,23,20,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <Spinner t={t} size={36} color="#fff" track="rgba(255,255,255,0.25)" />
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20, color: '#fff' }}>Re-rendering…</div>
              </div>
            ) : null}
          </div>
          <div style={{ fontSize: 30, color: R.ink2 }}>›</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: SANS, fontSize: 20, color: R.ink2, fontVariantNumeric: 'tabular-nums' }}>
            Clip {active + 1} of 12 · {c.len} · 9:16 {v2 ? <span style={pill({ fontSize: 16, padding: '3px 10px', marginLeft: 8 })}>v2</span> : null}
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: R.ink, marginTop: 10, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{c.title}</div>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8, background: R.warning50, color: R.warning700, borderRadius: 99, padding: '6px 14px', fontFamily: SANS, fontWeight: 600, fontSize: 20, marginTop: 14 }}>
            <Flame size={18} /> {c.score} <span style={{ fontWeight: 400 }}>virality</span>
          </div>
          {active === 2 && needs > 0 ? (
            <div style={{ marginTop: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 600, fontSize: 20, color: R.warning700 }}>
                <span style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${R.warning700}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>!</span>
                Needs a look
              </div>
              {NEEDS.slice(0, needs).map((x, i) => {
                const done = fixed && i === 0;
                return (
                  <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, fontFamily: SANS, fontSize: 22, color: done ? R.ink3 : R.ink2, textDecoration: done ? 'line-through' : 'none' }}>
                    {done ? <Check size={18} color={R.success} /> : <span style={{ width: 8, height: 8, borderRadius: 4, background: R.warning, margin: '0 5px' }} />}
                    {x}
                  </div>
                );
              })}
            </div>
          ) : null}
          <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20, color: R.ink, border: `1px solid ${R.border}`, borderRadius: 10, padding: '8px 16px' }}>▶ Play in sidebar</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22, paddingTop: 18, borderTop: `1px solid ${R.border}` }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ position: 'relative', opacity: i === active ? 1 : 0.7 }}>
            <ClipPoster t={t} w={64} crop={i / 11} radius={8} active={i === active} />
            {i === 2 && !(fixed && needs < 2) ? <div style={abs(50, 6, { width: 8, height: 8, borderRadius: 4, background: R.warning })} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

const CAROUSEL_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(1.6), x: 1500, y: 1080 },
  { t: B(2.75), x: 1082, y: 480 },
  { t: B(3), x: 1082, y: 480, click: true },
  { t: B(3.8), x: 1082, y: 480 },
  { t: B(4), x: 1082, y: 480, click: true },
  { t: B(5.5), x: 1500, y: 700 },
];

const Carousel = ({ t, B }: Ctx) => {
  const enter = spr(t, 0, 16, 0.85);
  const active = t < B(3) ? 0 : t < B(4) ? 1 : 2;
  const needs = t < B(4.75) ? 0 : t < B(5.5) ? 1 : 2;
  return (
    <AbsoluteFill>
      <div style={abs(110, 150, { width: 600 })}>
        <WordPush justify="flex-start" t={t} style={head(92, { fontWeight: 700, letterSpacing: '-0.045em' })} words={[{ text: 'Every', at: 0 }, { text: 'clip', at: B(0.25) }]} />
        <WordPush justify="flex-start" t={t} style={head(92, { fontWeight: 700, letterSpacing: '-0.045em' })} words={[{ text: 'tells', at: B(0.5) }, { text: 'you', at: B(0.75) }]} />
        <WordPush justify="flex-start" t={t} style={serif({ fontSize: 108, color: R.ink, lineHeight: 1.1 })} words={[{ text: 'what', at: B(1) }, { text: 'it', at: B(1.25) }, { text: 'needs.', at: B(1.5) }]} />
        <Reveal t={t} at={B(5)} y={16}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: R.ink2, marginTop: 34, lineHeight: 1.35 }}>Scored, checked, and flagged before you post.</div>
        </Reveal>
      </div>
      <div style={abs(740, 140 + (1 - enter) * 600, { opacity: Math.min(1, enter * 1.5) })}>
        <Tilt t={t} rx={3} ry={-7} float={0.4}>
          {hasRec('shorts-carousel') ? (
            <div style={{ ...card({ borderRadius: 26 }), width: 1080, height: 800, overflow: 'hidden' }}>
              <Rec id="shorts-carousel">{null}</Rec>
            </div>
          ) : (
            <ClipCard t={t} active={active} needs={needs} />
          )}
        </Tilt>
      </div>
      {!hasRec('shorts-carousel') ? <Cursor t={t} path={CAROUSEL_CURSOR(B)} ring={RING} /> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ edit: fix the clip in chat

const SEND = 3;
const Edit = ({ t, B }: Ctx) => {
  const enter = spr(t, 0, 16, 0.85);
  const sent = t >= B(SEND);
  const editing = t >= B(SEND + 0.5) && t < B(6.5);
  const v2 = t >= B(6.5);
  return (
    <AbsoluteFill>
      <div style={abs(130, 60)}>
        <WordPush justify="flex-start" t={t} style={head(96, { fontWeight: 700, letterSpacing: '-0.045em' })} words={[{ text: 'Fix', at: 0 }, { text: 'it', at: B(0.25) }, { text: 'in', at: B(0.5) }, { text: 'chat.', at: B(0.75), style: serif({ fontSize: 112, fontWeight: 400 }) }]} />
      </div>
      <div style={abs(130, 230 + (1 - enter) * 500, { opacity: Math.min(1, enter * 1.5) })}>
        <Browser w={1660} h={790} url="app.recaphub.co/chat" rec="shorts-edit">
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: 1, padding: '30px 36px', display: 'flex', flexDirection: 'column', gap: 22, borderRight: `1px solid ${R.border}` }}>
              <Reveal t={t} at={B(0.3)} y={16} dur={0.35}>
                <div style={{ background: R.subtle, borderRadius: 20, padding: '18px 22px', fontFamily: SANS, fontSize: 26, lineHeight: 1.45, color: R.ink, maxWidth: 820 }}>
                  Clip 3 opens mid-sentence. Start it at <b>“Pricing is a story you tell twice”</b>?
                </div>
              </Reveal>
              {sent ? (
                <Reveal t={t} at={B(SEND)} y={16} dur={0.3} style={{ alignSelf: 'flex-end' }}>
                  <div style={{ background: R.ink, color: '#fff', borderRadius: 20, padding: '16px 22px', fontFamily: SANS, fontSize: 26 }}>Yes, and end it on the laugh.</div>
                </Reveal>
              ) : null}
              {v2 ? (
                <Reveal t={t} at={B(6.75)} y={16} dur={0.35}>
                  <div style={{ background: R.subtle, borderRadius: 20, padding: '18px 22px', fontFamily: SANS, fontSize: 26, color: R.ink, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Check size={24} color={R.success} /> Done. Clip 3 now opens on the line.
                  </div>
                </Reveal>
              ) : null}
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', border: `1.5px solid ${sent ? R.border : R.brand}`, borderRadius: 18, padding: '18px 22px', boxShadow: sent ? 'none' : `0 0 0 5px ${R.brand50}` }}>
                <div style={{ flex: 1, fontFamily: SANS, fontSize: 26, color: sent ? R.ink3 : R.ink }}>
                  {sent ? 'Ask for another edit…' : <TypeOn t={t} at={B(1)} cps={22} caret={R.brand} parts={[{ text: 'Yes, and end it on the laugh.' }]} />}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: sent ? R.muted : R.brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>↑</div>
              </div>
            </div>
            <div style={{ width: 560, background: R.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <div style={{ position: 'relative' }}>
                <ClipPoster t={t} w={300} crop={v2 ? 0.5 : 0.62} radius={16} />
                {editing ? (
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'rgba(26,23,20,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <Spinner t={t} size={40} color="#fff" track="rgba(255,255,255,0.25)" />
                    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, color: '#fff' }}>Re-rendering…</div>
                  </div>
                ) : null}
                {v2 ? (
                  <div style={abs(-20, -20, { ...pill({ fontSize: 20 }), background: '#fff', transform: `scale(${spr(t, B(6.5), 12)})` })}>v2</div>
                ) : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 22, color: v2 ? R.ink3 : R.ink2, textDecoration: v2 ? 'line-through' : 'none' }}>
                {v2 ? <Check size={20} color={R.success} /> : <span style={{ width: 8, height: 8, borderRadius: 4, background: R.warning }} />}
                Opens mid-sentence
              </div>
            </div>
          </div>
        </Browser>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ export

const EXPORT_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(0.1), x: 1300, y: 760 },
  { t: B(0.85), x: 980, y: 430 },
  { t: B(1), x: 980, y: 430, click: true },
  { t: B(2.4), x: 1250, y: 900 },
];

const Export = ({ t, B }: Ctx) => {
  const press = t >= B(1) && t < B(1) + 0.15;
  return (
    <AbsoluteFill>
      <div style={centerRow(370)}>
        <div style={{ ...card({ borderRadius: 26 }), display: 'flex', alignItems: 'center', gap: 20, padding: '30px 54px', fontFamily: SANS, fontWeight: 600, fontSize: 52, color: R.ink, transform: `scale(${press ? 0.95 : 1})` }}>↓ Download all</div>
      </div>
      {Array.from({ length: 12 }).map((_, i) => {
        const p = lerp(t, B(1.3 + i * 0.1), B(1.9 + i * 0.1), 0, 1, EXPO);
        const col = i % 6;
        const row = Math.floor(i / 6);
        return (
          <div key={i} style={abs(260 + col * 236, 600 + row * 90, { opacity: p, transform: `translateY(${(1 - p) * -120}px)`, display: 'flex', alignItems: 'center', gap: 10, ...card({ borderRadius: 14 }), padding: '14px 18px', fontFamily: MONO, fontSize: 20, color: R.ink })}>
            <Check size={18} color={R.success} />
            clip-{String(i + 1).padStart(2, '0')}.mp4
          </div>
        );
      })}
      <Cursor t={t} path={EXPORT_CURSOR(B)} ring={RING} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ payoff: posted before the coffee break ends

const POSTS = [
  { crop: 0.62, line: 'Pricing is a story you tell twice.', rot: -6, x: 1000, y: 150 },
  { crop: 0.45, line: 'The next decade starts on the floor.', rot: 0, x: 1320, y: 110 },
  { crop: 0.2, line: 'Why attendees stopped reading agendas.', rot: 6, x: 1640, y: 150 },
];

const Payoff = ({ t, B }: Ctx) => {
  const timer = 14 * 60 + 32 - Math.floor(t * 3);
  return (
    <AbsoluteFill>
      <div style={abs(120, 190, { width: 760 })}>
        <WordPush justify="flex-start" t={t} style={head(150, { fontWeight: 700, letterSpacing: '-0.05em' })} words={[{ text: 'Posted.', at: 0 }]} />
        <div style={{ marginTop: 10 }}>
          <WordPush justify="flex-start" t={t} style={serif({ fontSize: 92, color: R.ink, lineHeight: 1.08 })} words={[{ text: 'Before', at: B(1) }, { text: 'the', at: B(1.25) }, { text: 'coffee', at: B(1.5) }]} />
          <WordPush justify="flex-start" t={t} style={serif({ fontSize: 92, color: R.ink, lineHeight: 1.08 })} words={[{ text: 'break', at: B(2) }, { text: 'ends.', at: B(2.25) }]} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 50, opacity: lerp(t, B(3), B(3.5)) }}>
          <Cup t={t} size={70} />
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 64, color: R.ink, fontVariantNumeric: 'tabular-nums' }}>
            {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
          </div>
          <div style={label({ fontSize: 20 })}>left</div>
        </div>
      </div>
      {POSTS.map((p, i) => {
        const s = spr(t, B(i * 0.5), 14, 0.8);
        return (
          <div key={i} style={abs(p.x - 170, p.y + (1 - s) * 900, { transform: `rotate(${p.rot * s}deg)`, zIndex: i === 1 ? 2 : 1 })}>
            <div style={{ width: 340, borderRadius: 44, background: R.ink, padding: 12, boxShadow: '0 40px 80px rgba(26,23,20,0.25)' }}>
              <div style={{ borderRadius: 34, overflow: 'hidden', background: '#000', position: 'relative' }}>
                <ClipPoster t={t} w={316} crop={p.crop} radius={0} />
                <div style={abs(0, 0, { width: 316, height: 562, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.75) 100%)' })} />
                <div style={abs(22, 430, { width: 270 })}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 17, background: R.page, color: R.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 14 }}>HS</div>
                    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18, color: '#fff' }}>harborsummit</div>
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 17, color: '#E8E6E3', marginTop: 8, lineHeight: 1.3 }}>{p.line}</div>
                </div>
              </div>
            </div>
            <Reveal t={t} at={B(3.5 + i * 0.5)} y={10} dur={0.3} style={{ position: 'absolute', left: 110, top: -26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${R.border}`, borderRadius: 99, padding: '6px 14px', fontFamily: SANS, fontWeight: 500, fontSize: 18, color: R.ink, boxShadow: SHADOW }}>
                <Check size={16} color={R.success} /> Posted
              </div>
            </Reveal>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ end

const End = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Ink t={t} />
    <div style={centerRow(170)}>
      <Reveal t={t} at={0} y={20} dur={0.4}>
        <div style={head(64, { color: '#A8A49D', fontWeight: 500 })}>
          One keynote. <span style={{ color: '#F5F4F2' }}>12 clips.</span>
        </div>
      </Reveal>
    </div>
    <div style={centerRow(340, { alignItems: 'center', gap: 40 })}>
      <div style={{ transform: `scale(${0.6 + 0.4 * spr(t, B(1), 13)})`, opacity: lerp(t, B(1), B(1.3)) }}>
        <Mark size={230} fan={[spr(t, B(1.5), 12), spr(t, B(1.75), 12)]} />
      </div>
      <Reveal t={t} at={B(1.75)} y={24}>
        <div style={head(150, { fontWeight: 700, letterSpacing: '-0.045em', color: '#FAFAF9' })}>RecapHub</div>
      </Reveal>
    </div>
    <div style={centerRow(640)}>
      <Reveal t={t} at={B(2.5)} y={16}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 44, color: '#A8A49D' }}>
          Stage → <span style={serif({ fontSize: 54, color: '#F5F4F2' })}>Shorts.</span>
        </div>
      </Reveal>
    </div>
    <div style={centerRow(790)}>
      <Cta t={t} at={B(3.5)} dark />
    </div>
  </AbsoluteFill>
);

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = {
  hook: Hook,
  problem: Problem,
  upload: Upload,
  slice: Slice,
  carousel: Carousel,
  edit: Edit,
  export: Export,
  payoff: Payoff,
  end: End,
};

const sfx = (): Sfx[] => {
  const at = (id: string, beat: number) => sceneStart(tl, id) + sceneBeats(tl, id)(beat);
  const clicks = (id: string, path: (B: (n: number) => number) => CursorPt[]) =>
    clicksOf(path(sceneBeats(tl, id))).map((c) => ({ at: sceneStart(tl, id) + c, src: 'mouse-click' as const, vol: 0.5 }));
  return [
    ...transitionSfx(tl),
    ...GOLD.map((g) => ({ at: at('problem', g.at), src: 'pop' as const, vol: 0.22 })),
    { at: at('upload', 0.3), src: 'page-turn', vol: 0.35 },
    { at: at('upload', 5.2), src: 'ding', vol: 0.2 },
    ...[0, 2, 4, 6, 8, 10].map((i) => ({ at: at('slice', CUT0 + i * 0.25), src: 'snip' as const, vol: 0.32 })),
    { at: at('slice', 4), src: 'whoosh', vol: 0.3 },
    ...clicks('carousel', CAROUSEL_CURSOR),
    { at: at('carousel', 4.75), src: 'pop', vol: 0.22 },
    { at: at('edit', SEND), src: 'switch', vol: 0.35 },
    { at: at('edit', 6.5), src: 'ding', vol: 0.2 },
    ...clicks('export', EXPORT_CURSOR),
    { at: at('payoff', 3.5), src: 'pop', vol: 0.25 },
    { at: at('end', 1), src: 'page-turn', vol: 0.4 },
    { at: at('end', 3.5), src: 'ding', vol: 0.22 },
  ];
};

export const RecapHubShorts: React.FC = () => (
  <AbsoluteFill style={{ background: R.page }}>
    <Stone />
    {tl.scenes.map((s, i) => (
      <Scene key={s.id} tl={tl} index={i} render={RENDER[s.id]} />
    ))}
    <Soundtrack tl={tl} sfx={sfx()} />
  </AbsoluteFill>
);

export const shortsTimeline = tl;
