/* Launch film (flagship), ~90 s, 128 BPM. The style frames (recaphub-ui-ux-2026-11-18/promo-video) brought to
 * life: one continuous camera through the producer's loop, Capture â†’ Clip â†’ Approve â†’ Share, carried by the
 * brand step timeline. Problem on the horizon gradient, product on the page, payoffs back on a gradient.
 * Fixture event: Northwind Summit 2026 (the app's Storybook fixtures). Reels: real RecapHub clips. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BACK, Cam, Cursor, EIO, EXPO, FilmDef, INOUT, Layer, Pop, Reel, Rise, SHADOW, Shot, Stagger, focus, keys, lerp, mix } from '../kit';
import { AUDIENCES, BR, Box, DISPLAY, FOUR_STEPS, FeatureCards, Grad, Head, Lockup, Paper, SANS, Stat, Steps } from '../brand';
import { Badge, Chat, ClipsLoader, Controls, Debate, Hero, Ingest, LinkBox, McpPill, P, PublishDialog, QC_ITEMS, QcList, QuoteCard, SESSIONS, StageCard, Toast, Transcript, Treemap, UCard, Z } from '../ui';
import { chain, end, endSfx, title, titleSfx } from '../shots';
import { REEL } from '../assets';

const STEP_ON = (B: (n: number) => number) => [B(2), B(3), B(4), B(5)];

export const launchFilm: FilmDef = {
  id: 'Launch',
  bpm: 128,
  music: 'music/launch.wav',
  tail: 1.2,
  shots: chain([
    // ---------------------------------------------------------------- 1 Â· the logo on the page
    {
      len: 8, name: 'logo',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur}>
          <Cam t={t} keys={[{ t: 0, s: 1 }, { t: dur, s: 1.07, ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} /></Layer>
            <Layer>
              <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Lockup t={t} at={B(0.5)} w={980} />
                <div style={{ height: 40 }} />
                <Rise t={t} at={B(3)} y={20} blur={8}>
                  <div style={{ fontFamily: SANS, fontSize: 42, color: BR.inkMuted }}>Real-time content for B2B events</div>
                </Rise>
              </AbsoluteFill>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[B(0.5), 'whoosh-soft', 0.35], [B(0.75), 'thud', 0.35], [B(1.0), 'shimmer', 0.2], [B(3), 'swish', 0.3]],
    },
    // ---------------------------------------------------------------- 2 Â· problem: hours of recordings
    {
      len: 8, name: 'hours',
      render: title({ text: 'Every event leaves\n[hours] of recordings.', size: 138, track: 160, tin: 'wipe', tout: 'whip-l', keyAt: undefined }),
      sfx: (B) => [[0, 'whoosh', 0.35], ...titleSfx(2.6)(B)],
    },
    // ---------------------------------------------------------------- 3 Â· most of it never watched
    {
      len: 8, name: 'never-watched', mb: true,
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="whip-r" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, x: 40 }, { t: dur, x: -40, s: 1.04, ease: INOUT }]}>
            <Layer depth={0.3}><Grad t={t} x={-300} y={-700} /></Layer>
            <Layer depth={1.1}>
              <div style={{ position: 'absolute', left: 1010, top: 250, display: 'flex', flexDirection: 'column', gap: 26, transform: 'perspective(1800px) rotateY(-14deg)', transformOrigin: '0 50%' }}>
                {SESSIONS.slice(0, 4).map(([n, d], i) => (
                  <Rise key={i} t={t} at={B(1 + i * 0.5)} x={260} y={0} blur={10}>
                    <UCard w={780} pad="24px 28px" style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 26, opacity: lerp(t, B(4 + i * 0.4), B(5.5 + i * 0.4), 0.95, 0.28 - i * 0.03) }}>
                      <Badge style={{ fontSize: 18, height: 32, padding: '0 12px' }}>Recorded</Badge><b>{n}</b><span style={{ marginLeft: 'auto', fontSize: 22, color: P.t3 }}>{d}</span>
                    </UCard>
                  </Rise>
                ))}
              </div>
            </Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 150, top: 390 }}>
                <Head t={t} at={B(0.5)} text={'Most of it is\n~never watched.~'} size={116} color={BR.onAccent} />
              </div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whip', 0.35], [B(1), 'slide', 0.25], [B(1.5), 'slide', 0.22], [B(2), 'slide', 0.2], [B(2.5), 'slide', 0.18]],
    },
    // ---------------------------------------------------------------- 4 Â· the promise, on the page
    {
      len: 8, name: 'promise',
      render: title({ text: 'RecapHub takes every session\nfrom stage to *ready-to-post.*', stage: 'paper-flip', size: 112, align: 'center', tin: 'wipe', push: 0.06 }),
      sfx: (B) => [[0, 'whoosh', 0.3], [B(0.25), 'impact', 0.35], ...titleSfx()(B)],
    },
    // ---------------------------------------------------------------- 5 Â· four steps, then dive into step 1
    {
      len: 10, name: 'steps', mb: true,
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur}>
          <Cam t={t} keys={[{ t: 0, s: 1 }, { t: B(7.5), s: 1.03 }, { t: B(10.5), ...focus(262, 568, 2.6), ease: EIO }]}>
            <Layer depth={0.3}><Paper t={t} y={-560} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 170 }}>
                <Head t={t} at={B(0.2)} text="In minutes. *Not weeks.*" size={104} align="center" />
              </div>
              <div style={{ position: 'absolute', left: 190, top: 500 }}>
                <Rise t={t} at={B(1.2)} y={60} spring="soft">
                  <Steps t={t} steps={FOUR_STEPS} on={STEP_ON(B)} scale={2.75} />
                </Rise>
              </div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [...titleSfx()(B), [B(1.2), 'whoosh-soft', 0.3], ...STEP_ON(B).map((x) => [x, 'pop', 0.35] as [number, 'pop', number]), [B(8.6), 'whoosh', 0.4]],
    },
    // ---------------------------------------------------------------- 6 Â· capture: the live stage card
    {
      len: 8, name: 'stage-card',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="push" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, s: 1 }, { t: dur, s: 1.06, ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} y={-480} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 150 }}>
                <Head t={t} at={B(0.6)} text="Every stage, *one live signal.*" size={88} align="center" />
              </div>
              <div style={{ position: 'absolute', left: 592, top: 360 }}>
                <Rise t={t} at={B(0.3)} y={220} s={0.85} spring="soft">
                  <Z s={2.3}><StageCard t={t} /></Z>
                </Rise>
              </div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whoosh', 0.3], [B(0.3), 'whoosh-soft', 0.3], [B(0.6), 'swish', 0.25], [B(2), 'tick', 0.2], [B(4), 'tick', 0.2], [B(6), 'tick', 0.2]],
    },
    // ---------------------------------------------------------------- 7 Â· ingest healthy, press Start
    {
      len: 8, name: 'controls',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="whip-r" tout="cut" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, s: 1.02 }, { t: B(4), ...focus(700, 700, 1.12), ease: INOUT }, { t: dur, ...focus(760, 640, 1.06), ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} flip y={-620} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 542, top: 230 }}>
                <Rise t={t} at={B(0.2)} y={-60} spring="soft"><Z s={2.2}><Ingest t={t} okAt={B(1.5)} /></Z></Rise>
              </div>
              <div style={{ position: 'absolute', left: 366, top: 640 }}>
                <Rise t={t} at={B(0.6)} y={80} spring="soft"><Z s={2.2}><Controls t={t} pressAt={B(4)} /></Z></Rise>
              </div>
              <Cursor t={t} path={[{ t: B(2), x: 1500, y: 1000 }, { t: B(3.8), x: 440, y: 690, arc: 0.18 }, { t: B(4), x: 440, y: 690, click: true }, { t: B(6), x: 600, y: 860 }]} />
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whip', 0.3], [B(0.2), 'whoosh-soft', 0.25], [B(1.5), 'pop-soft', 0.35], [B(2.2), 'swish', 0.15], [B(4), 'click', 0.55], [B(4.15), 'ding', 0.25]],
    },
    // ---------------------------------------------------------------- 8 Â· the stage wall, tilted, on the gradient
    {
      len: 8, name: 'stage-wall', mb: true,
      render: ({ t, B, dur }) => {
        const rx = mix(64, 30, lerp(t, B(0.3), B(3), 0, 1, EXPO));
        return (
          <Shot t={t} dur={dur} tin="wipe" din={B(1)}>
            <Cam t={t} keys={[{ t: 0, y: 30 }, { t: dur, y: -60, s: 1.05, ease: INOUT }]}>
              <Layer depth={0.3}><Grad t={t} y={-200} /></Layer>
              <Layer depth={1.05}>
                <div style={{ position: 'absolute', left: 260, top: 290, width: 1640, height: 900, transform: `perspective(1700px) rotateX(${rx}deg) rotateZ(-7deg)`, transformOrigin: '50% 0' }}>
                  <div style={{ background: '#FAFAF9', borderRadius: 26, width: 1640, height: 900, padding: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30, boxShadow: '0 60px 140px rgba(20,45,60,0.5)' }}>
                    {[5076, 2831, -1].map((s, i) => (
                      <Rise key={i} t={t} at={B(0.8 + i * 0.3)} y={40}>
                        {s > 0 ? <Z s={1.47}><StageCard t={t} start={s} name={i ? 'Hall 2 Â· Product Track' : 'Main Stage Â· Day 1'} chapters={i ? 2 : 3} /></Z> : <Z s={1.47}><UCard w={320} pad="14px"><div style={{ background: P.subtle, borderRadius: 8, padding: 24, color: P.t3, textAlign: 'center' }}>Not streamed yet</div><b style={{ display: 'block', marginTop: 10 }}>Breakout Room C</b><div style={{ fontSize: 12, color: P.t3 }}>No stream yet</div></UCard></Z>}
                      </Rise>
                    ))}
                  </div>
                </div>
              </Layer>
              <Layer depth={1.2}>
                <div style={{ position: 'absolute', left: 150, top: 150 }}><Head t={t} at={B(1)} text="Caught live." size={110} color={BR.onAccent} /></div>
              </Layer>
            </Cam>
          </Shot>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.35], [B(0.8), 'pop-soft', 0.25], [B(1.1), 'pop-soft', 0.25], [B(1.4), 'pop-soft', 0.25], [B(1), 'swish', 0.25], [B(3), 'thud', 0.25]],
    },
    // ---------------------------------------------------------------- 9 Â· transcript
    {
      len: 8, name: 'transcript',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="wipe" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, x: -30 }, { t: dur, x: 30, s: 1.05, ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} y={-520} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 150, top: 330 }}><Head t={t} at={B(0.4)} text={'Every word,\n*attributed*\nand searchable.'} size={96} /></div>
              <div style={{ position: 'absolute', left: 1000, top: 250 }}>
                <Rise t={t} at={B(0.6)} x={160} y={0} spring="soft"><Z s={2.15}><Transcript t={t} at={B(1.2)} step={B(2)} /></Z></Rise>
              </div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whoosh', 0.3], ...titleSfx()(B), [B(1.2), 'pop-soft', 0.3], [B(3.2), 'pop-soft', 0.3], [B(5.2), 'pop-soft', 0.3], [B(1.4), 'key', 0.12], [B(3.4), 'key', 0.12], [B(5.4), 'key', 0.12]],
    },
    // ---------------------------------------------------------------- 10 Â· clips render; dive into the card
    {
      len: 8, name: 'clips-loader', mb: true,
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="whip-r" tout="dive" din={B(1)} dout={B(1.2)}>
          <Cam t={t} keys={[{ t: 0, s: 1 }, { t: dur, s: 1.08, ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} flip y={-560} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 170 }}><Head t={t} at={B(0.3)} text="Clipped while you *watch.*" size={92} align="center" /></div>
              <div style={{ position: 'absolute', left: 432, top: 440 }}>
                <Rise t={t} at={B(0.5)} y={120} spring="soft"><Z s={2.2}><ClipsLoader t={t} a={B(1)} b={B(6)} /></Z></Rise>
              </div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.5), 'whoosh-soft', 0.25], [B(2.7), 'tick', 0.2], [B(4.3), 'tick', 0.2], [B(6), 'ding', 0.32], [B(6.05), 'shimmer', 0.2], [B(7.2), 'whoosh', 0.35]],
    },
    // ---------------------------------------------------------------- 11 Â· the real reel + the brand stat
    {
      len: 10, name: 'reel-stat',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="zoom" din={B(1.2)}>
          <Cam t={t} keys={[{ t: 0, x: 40 }, { t: dur, x: -40, s: 1.04, ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} y={-500} /></Layer>
            <Layer depth={1.1}>
              <div style={{ position: 'absolute', left: 250, top: 122 }}>
                <Rise t={t} at={B(0.1)} y={0} s={0.7} r={-8} spring="soft"><Reel file={REEL('bnp-jordi-romero')} w={470} from={9} style={{ transform: 'rotate(-2deg)' }} /></Rise>
              </div>
            </Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 770, top: 190, display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[['brand', '41.2s'], ['grey', '9Ã—16'], ['grey', '+ hook'], ['ok', 'QC passed']].map(([tone, x], i) => (
                  <Pop key={i} t={t} at={B(1 + i * 0.5)} origin="0 50%"><Z s={2.1}><Badge tone={tone as 'brand'}>{x}</Badge></Z></Pop>
                ))}
              </div>
              <div style={{ position: 'absolute', left: 1010, top: 470 }}>
                <Rise t={t} at={B(3)} x={120} y={0} spring="soft">
                  <Stat t={t} at={B(3)} label="Faster video turnaround" value={(p) => `${Math.round(mix(2, 20, p))}â€“${Math.round(mix(3, 30, p))} min`} with="with RecapHub" note="vs. 2â€“4 weeks for typical post-production" scale={2.6} />
                </Rise>
              </div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0.1, 'whoosh-soft', 0.35], [B(1), 'pop', 0.3], [B(1.5), 'pop', 0.28], [B(2), 'pop', 0.26], [B(2.5), 'pop', 0.26], [B(3), 'slide', 0.35], [B(3.3), 'riser', 0.12], [B(4.6), 'thud', 0.3]],
    },
    // ---------------------------------------------------------------- 12 Â· QC: nine checks tick
    {
      len: 8, name: 'qc',
      render: ({ t, B, dur }) => {
        const ticks = QC_ITEMS.map((_, k) => B(1 + k * 0.5));
        const n = ticks.filter((x) => t >= x).length;
        return (
          <Shot t={t} dur={dur} tin="whip-r" din={B(1)}>
            <Cam t={t} keys={[{ t: 0, s: 1 }, { t: dur, ...focus(1000, 560, 1.06), ease: INOUT }]}>
              <Layer depth={0.3}><Paper t={t} flip y={-600} /></Layer>
              <Layer>
                <div style={{ position: 'absolute', left: 940, top: 150 }}>
                  <Rise t={t} at={B(0.2)} x={140} y={0} spring="soft"><Z s={2.15}><QcList t={t} ticks={ticks} /></Z></Rise>
                </div>
                <div style={{ position: 'absolute', left: 170, top: 400 }}>
                  <Rise t={t} at={B(0.6)} y={80} spring="soft">
                    <Box pad="34px 46px 30px">
                      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.04em', color: BR.inkSubtle }}>Checks passed</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 6 }}>
                        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 1, letterSpacing: '-0.02em', color: BR.deep, fontVariantNumeric: 'tabular-nums', display: 'inline-block', transform: `scale(${1 + 0.06 * Math.max(0, 1 - (t - (ticks[n - 1] ?? -9)) / 0.2)})`, transformOrigin: '0 80%' }}>{n}/9</span>
                        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 44 }}>per clip</span>
                      </div>
                    </Box>
                  </Rise>
                </div>
              </Layer>
            </Cam>
          </Shot>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...QC_ITEMS.map((_, k) => [B(1 + k * 0.5), 'tick', 0.32] as [number, 'tick', number]), [B(5.1), 'chime', 0.3]],
    },
    // ---------------------------------------------------------------- 13 Â· checked by a real person
    {
      len: 6, name: 'real-person',
      render: title({ text: 'Checked by\na [real person.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 150, tin: 'wipe', keyAt: undefined, push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.45], ...titleSfx(1.4)(B)],
    },
    // ---------------------------------------------------------------- 14 Â· publish
    {
      len: 8, name: 'publish',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="wipe" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, s: 1 }, { t: B(4), ...focus(1240, 700, 1.1), ease: INOUT }, { t: dur, ...focus(1100, 640, 1.04), ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} y={-560} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 498, top: 280 }}>
                <Rise t={t} at={B(0.3)} y={100} s={0.86} spring="soft"><Z s={2.1}><PublishDialog t={t} selectAt={B(1.5)} pressAt={B(4.2)} /></Z></Rise>
              </div>
              <Cursor t={t} path={[{ t: B(1), x: 1500, y: 980 }, { t: B(1.5), x: 760, y: 520, click: true }, { t: B(3.9), x: 1290, y: 762 }, { t: B(4.2), x: 1290, y: 762, click: true }, { t: B(6), x: 1400, y: 900 }]} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center' }}><Toast t={t} at={B(4.6)} text="Event page published" /></div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whoosh', 0.3], [B(0.3), 'whoosh-soft', 0.25], [B(1.5), 'click', 0.5], [B(4.2), 'click', 0.55], [B(4.6), 'ding', 0.3]],
    },
    // ---------------------------------------------------------------- 15 Â· the published hero + its link
    {
      len: 8, name: 'hero', mb: true,
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="push" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, ...focus(560, 420, 1.7) }, { t: B(2.5), x: 0, y: 0, s: 1, ease: EIO }, { t: dur, s: 1.03, ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} flip y={-420} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 230, top: 120 }}><Hero t={t} at={0} /></div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center' }}>
                <Rise t={t} at={B(3)} y={-120} s={0.9} spring="bouncy"><LinkBox url="recaphub.co/northwind-summit-2026" /></Rise>
              </div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whoosh', 0.35], [B(0.4), 'pop-soft', 0.2], [B(0.6), 'pop-soft', 0.2], [B(0.8), 'pop-soft', 0.2], [B(3), 'thud', 0.35], [B(3.1), 'pop', 0.3]],
    },
    // ---------------------------------------------------------------- 16 Â· where the time went
    {
      len: 8, name: 'treemap',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="whip-r" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, x: 60 }, { t: dur, x: -80, s: 1.03, ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} y={-700} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 150, top: 100 }}><Head t={t} at={B(0.3)} text="Where the time *went.*" size={92} /></div>
              <div style={{ position: 'absolute', left: 150, top: 280 }}><Treemap t={t} at={B(1)} step={B(1)} /></div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(1), 'slide', 0.3], [B(2), 'slide', 0.28], [B(3), 'slide', 0.26]],
    },
    // ---------------------------------------------------------------- 17 Â· where each speaker stood
    {
      len: 8, name: 'debate',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="whip-r" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, s: 1 }, { t: dur, ...focus(1000, 560, 1.05), ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} flip y={-640} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 100 }}><Head t={t} at={B(0.3)} text="Where each speaker *stood.*" size={88} align="center" /></div>
              <Debate t={t} at={B(1)} />
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(1), 'whoosh-soft', 0.25], [B(1) + 0.5, 'swish', 0.2], [B(1) + 0.95, 'pop-soft', 0.25], [B(1) + 1.17, 'pop-soft', 0.25], [B(1) + 1.39, 'pop-soft', 0.25]],
    },
    // ---------------------------------------------------------------- 18 Â· payoff: one link
    {
      len: 8, name: 'one-link',
      render: title({ text: 'Every session.\nEvery debate.\n[One link.]', size: 132, gy: -520, tin: 'wipe', keyAt: undefined, push: 0.06 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [B(0.25), 'whoosh-soft', 0.3], [B(1.5), 'snap', 0.3]],
    },
    // ---------------------------------------------------------------- 19 Â· three audiences
    {
      len: 8, name: 'audiences',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="wipe" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, s: 1.02 }, { t: dur, s: 1.06, ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} y={-900} strength={0.6} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 70 }}><Head t={t} at={B(0.3)} text="One event, *three audiences.*" size={84} align="center" /></div>
              <div style={{ position: 'absolute', left: (1920 - 519 * 2.75) / 2, top: 230 }}><FeatureCards t={t} at={B(1)} cards={AUDIENCES} scale={2.75} /></div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whoosh', 0.3], ...titleSfx()(B), [B(1), 'slide', 0.3], [B(1) + 0.16, 'slide', 0.28], [B(1) + 0.32, 'slide', 0.26]],
    },
    // ---------------------------------------------------------------- 20 Â· press gets it first
    {
      len: 8, name: 'press',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="whip-r" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, s: 1 }, { t: B(4), ...focus(1060, 600, 1.05), ease: INOUT }, { t: dur, ...focus(1000, 580, 1.03), ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} y={-560} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 220, top: 160 }}><Head t={t} at={B(0.3)} text="Press gets it *first.*" size={96} /></div>
              <div style={{ position: 'absolute', left: 300, top: 380 }}>
                <Rise t={t} at={B(0.6)} y={120} spring="soft"><Z s={2.05}><QuoteCard t={t} copyAt={B(3.6)} /></Z></Rise>
              </div>
              <Cursor t={t} path={[{ t: B(1.6), x: 1650, y: 1000 }, { t: B(3.4), x: 1418, y: 650 }, { t: B(3.6), x: 1418, y: 650, click: true }, { t: B(5.5), x: 1500, y: 760 }]} />
              <div style={{ position: 'absolute', left: 1180, top: 850 }}><Toast t={t} at={B(4)} text="Quote copied" /></div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.6), 'whoosh-soft', 0.25], [B(3.6), 'click', 0.55], [B(4), 'ding', 0.28]],
    },
    // ---------------------------------------------------------------- 21 Â· ask your event anything (dive into the pill)
    {
      len: 8, name: 'ask', mb: true,
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="wipe" tout="dive" din={B(1)} dout={B(1.3)}>
          <Cam t={t} keys={[{ t: 0, s: 1 }, { t: B(6), s: 1.04, ease: INOUT }, { t: dur, ...focus(560, 720, 1.6), ease: EIO }]}>
            <Layer depth={0.3}><Grad t={t} x={-200} y={-560} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 150, top: 240 }}><Head t={t} at={B(0.3)} text={'Ask your event\nanything.'} size={136} color={BR.onAccent} /></div>
              <div style={{ position: 'absolute', left: 150, top: 690 }}>
                <Rise t={t} at={B(2)} y={50} s={0.8} spring="bouncy" origin="0 50%"><Z s={2.6} origin="0 50%"><McpPill glow={Math.max(0, Math.sin((t - B(3)) * 3)) * (t > B(3) ? 1 : 0)} /></Z></Rise>
              </div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whoosh', 0.35], ...titleSfx()(B), [B(2), 'pop', 0.35], [B(6.6), 'riser', 0.22], [B(7.6), 'whoosh', 0.4]],
    },
    // ---------------------------------------------------------------- 22 Â· the answer with sources
    {
      len: 10, name: 'answer',
      render: ({ t, B, dur }) => (
        <Shot t={t} dur={dur} tin="push" din={B(1)}>
          <Cam t={t} keys={[{ t: 0, s: 1 }, { t: dur, ...focus(1000, 600, 1.05), ease: INOUT }]}>
            <Layer depth={0.3}><Paper t={t} flip y={-520} /></Layer>
            <Layer>
              <div style={{ position: 'absolute', left: 260, top: 250 }}>
                <Z s={2.1}><Chat t={t} at={B(0.6)} q="Find sessions about AI from my last event" a="Three sessions from Reson8 Summit covered AI: â€œEval harnesses that catch regressionsâ€ by Priya Nair, â€œSynthetic transcripts, real coverageâ€ by Sofia Marchetti and â€œWhen the model should deferâ€ by Nadia Rahman." sources={['Eval harnesses Â· 18:40', 'Synthetic transcripts Â· 07:12', 'When to defer Â· 24:05']} ansAt={B(0.6) + 1.5} /></Z>
              </div>
            </Layer>
          </Cam>
        </Shot>
      ),
      sfx: (B) => [[0, 'whoosh-soft', 0.3], [B(0.6), 'key', 0.15], [B(1.2), 'key', 0.15], [B(1.8), 'key', 0.15], [B(0.6) + 1.5, 'bubble', 0.3], [B(0.6) + 3.5, 'pop-soft', 0.25], [B(0.6) + 3.62, 'pop-soft', 0.25], [B(0.6) + 3.74, 'pop-soft', 0.25]],
    },
    // ---------------------------------------------------------------- 23 Â· closing line
    {
      len: 8, name: 'closing',
      render: title({ text: 'The write-up is done\nbefore the room empties.', size: 118, gx: 0, gy: -900, gw: 3100, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], [0.02, 'impact', 0.35], ...titleSfx()(B)],
    },
    // ---------------------------------------------------------------- 24 Â· end card
    { len: 12, name: 'end', render: end('From stage to ready-to-post in minutes.'), sfx: endSfx },
  ]),
};
