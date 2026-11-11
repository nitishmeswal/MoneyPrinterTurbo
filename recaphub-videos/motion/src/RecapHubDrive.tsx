/* RecapHub · Integrations & workflow (Drive) promo, ~35 s, a pipeline: the
 * recording dropped in Drive travels through the stations and comes out as assets.
 * "26 GB in about 5 minutes" is Prakhar's figure from the brief. Slack and Framer
 * are in progress, so they only appear as "Coming soon".
 * Hook: "Drop the recording in Drive. RecapHub does the rest."
 * Music: music-rh-drive.wav (compose.py drive), 118 BPM, E major. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-drive.json';
import { Ctx, Cursor, CursorPt, Reveal, Timeline, count, lerp, spr, EXPO, INOUT } from './kit';
import { R, MONO, SANS, RING, Avatar, Check, ClipPoster, Mark, RecFill, SPEAKERS, abs, card, centerRow, hasRec, head, label, serif } from './rh';
import { AppShell, Btn, EndCard, Film, Fit, Lead, Slam, Toast, sfxKit } from './ui';

const tl = tlJson as Timeline;
const FILE = 'keynote-main-stage-4K.mov';

const DriveWin: React.FC<{ t: number; B: (n: number) => number }> = ({ t, B }) => {
  const drag = lerp(t, B(1), B(2), 0, 1, INOUT);
  const landed = t >= B(2);
  return (
    <div style={{ ...card({ borderRadius: 24 }), width: 1000, height: 430, overflow: 'hidden' }}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: `1px solid ${R.border}`, fontFamily: SANS, fontSize: 20, color: R.ink2 }}>
        <span style={{ fontWeight: 600, color: R.ink }}>Drive</span> › Harbor Summit 2026 › Recordings
      </div>
      {[['day1-keynote.mov', '18.4 GB'], ['day1-panel-build-vs-buy.mov', '9.2 GB']].map(([n, s], i) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 26px', borderBottom: `1px solid ${R.subtle}`, fontFamily: SANS, fontSize: 22, color: R.ink, transform: `translateY(${landed ? 0 : 0}px)` }}>
          <div style={{ width: 44, height: 30, borderRadius: 6, background: R.ink, color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>
          <div style={{ flex: 1 }}>{n}</div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: R.ink3 }}>{s}</div>
          {i === 0 ? null : null}
        </div>
      ))}
      <div style={{ padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 16, background: landed ? R.brand50 : 'transparent', fontFamily: SANS, fontSize: 22, color: R.ink, opacity: landed ? 1 : 0 }}>
        <div style={{ width: 44, height: 30, borderRadius: 6, background: R.ink, color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>
        <div style={{ flex: 1, fontWeight: 600 }}>{FILE}</div>
        <div style={{ fontFamily: MONO, fontSize: 18, color: R.brand600 }}>26 GB</div>
      </div>
      {!landed ? (
        <div style={abs(1300 - 900 * drag, -280 + 470 * drag - Math.sin(drag * Math.PI) * 80, { ...card({ borderRadius: 16 }), padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 600, fontSize: 22, color: R.ink, boxShadow: '0 30px 60px rgba(26,23,20,0.2)', transform: `rotate(${-4 * (1 - drag)}deg)`, whiteSpace: 'nowrap' })}>
          ▶ {FILE} <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: 18, color: R.ink2 }}>26 GB</span>
        </div>
      ) : null}
    </div>
  );
};

// ------------------------------------------------------------------ hook + problem

const Hook = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Slam t={t} at={0} y={110}>
      <div style={head(120, { fontWeight: 700, letterSpacing: '-0.05em' })}>Drop the recording in Drive.</div>
    </Slam>
    <Slam t={t} at={B(3)} y={260}>
      <div style={serif({ fontSize: 120, color: R.ink })}>RecapHub does the rest.</div>
    </Slam>
    <div style={abs(460, 520, { opacity: spr(t, B(0.3), 14), transform: `translateY(${(1 - spr(t, B(0.3), 14)) * 60}px)` })}>
      <DriveWin t={t} B={B} />
    </div>
  </AbsoluteFill>
);

const TOOLS = ['Upload portal', 'Transcoder', 'Transcription tool', 'Clip editor', 'CMS', 'Spreadsheet of quotes'];
const Problem = ({ t, B }: Ctx) => {
  const strike = lerp(t, B(4), B(4.5), 0, 1, EXPO);
  const fall = lerp(t, B(4.8), B(5.8), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <div style={centerRow(120)}>
        <Reveal t={t} at={0} y={20}>
          <div style={head(96, { fontWeight: 700, letterSpacing: '-0.045em' })}>
            No new tool <span style={serif({ fontSize: 108, fontWeight: 400 })}>to learn.</span>
          </div>
        </Reveal>
      </div>
      {TOOLS.map((n, i) => {
        const p = spr(t, B(0.5 + i * 0.5), 13);
        const x = 300 + (i % 3) * 460;
        const y = 380 + Math.floor(i / 3) * 200;
        return (
          <div key={n} style={abs(x, y + fall * (500 + i * 60), { ...card({ borderRadius: 18 }), width: 400, padding: '30px 30px', boxSizing: 'border-box', fontFamily: SANS, fontWeight: 600, fontSize: 30, color: R.ink2, opacity: Math.min(1, p * 1.5) * (1 - fall), transform: `scale(${0.8 + 0.2 * p}) rotate(${((i % 3) - 1) * 3 + fall * (i % 2 ? 20 : -20)}deg)` })}>{n}</div>
        );
      })}
      <div style={abs(260, 560, { width: 1400 * strike, height: 8, borderRadius: 4, background: R.ink, transform: 'rotate(-4deg)', transformOrigin: '0 50%', opacity: 1 - fall })} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ connect and import (Integrations)

const SHELL = { x: 690, y: 170, w: 1150 };
const K = SHELL.w / 1600;
const sc = (bx: number, by: number) => ({ x: SHELL.x + bx * K, y: SHELL.y + by * K });

const CONNECTORS = [
  { name: 'Google Drive', note: 'Import recordings from shared folders', state: 'drive' },
  { name: 'YouTube', note: 'Import from playlists', state: 'connect' },
  { name: 'RecapHub MCP', note: 'Your events in Claude and ChatGPT', state: 'connected' },
  { name: 'Slack', note: 'Recaps where your team talks', state: 'soon' },
  { name: 'Framer', note: 'Recap pages on your Framer site', state: 'soon' },
];
const CONNECT_CLICK = 3;
const CONNECT_CURSOR = (B: (n: number) => number): CursorPt[] => {
  const b = sc(290 + 30 + 560 - 90, 116 + 60);
  return [{ t: B(1), x: 1500, y: 1000 }, { t: B(2.8), x: b.x, y: b.y }, { t: B(CONNECT_CLICK), x: b.x, y: b.y, click: true }, { t: B(5), x: b.x + 120, y: b.y + 300 }];
};

const Connect = ({ t, B }: Ctx) => {
  const on = t >= B(CONNECT_CLICK + 0.5);
  return (
    <AbsoluteFill>
      <Lead t={t} B={B} tag="Integrations" words={['Connect', 'Drive', 'once.']} line="Then every new recording can come straight in." y={230} w={560} size={78} />
      <div style={abs(SHELL.x, SHELL.y, { borderRadius: 18, overflow: 'hidden', border: `1px solid ${R.border}`, boxShadow: '0 30px 80px rgba(26,23,20,0.16)' })}>
        <Fit w={SHELL.w} bw={1600} bh={900}>
          {hasRec('drive-connect') ? <RecFill id="drive-connect" /> : (
            <AppShell active="Integrations" title="Integrations">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, width: 1250 }}>
                {CONNECTORS.map((c, i) => {
                  const p = spr(t, B(0.5 + i * 0.25), 14);
                  const state = c.state === 'drive' ? (on ? 'connected' : t >= B(CONNECT_CLICK) ? 'connecting' : 'connect') : c.state;
                  return (
                    <div key={c.name} style={{ ...card({ borderRadius: 16, boxShadow: 'none' }), height: 120, padding: '0 30px', display: 'flex', alignItems: 'center', gap: 18, opacity: Math.min(1, p * 1.5) * (c.state === 'soon' ? 0.6 : 1), border: `1px solid ${c.state === 'drive' && on ? R.brand100 : R.border}`, background: c.state === 'drive' && on ? R.brand50 : '#fff' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: R.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 22, color: R.ink2 }}>{c.name === 'RecapHub MCP' ? <Mark size={40} /> : c.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: R.ink }}>{c.name}</div>
                        <div style={{ fontFamily: SANS, fontSize: 17, color: R.ink2 }}>{c.note}</div>
                      </div>
                      {state === 'connected' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 600, fontSize: 18, color: '#15803D' }}><Check size={20} color={R.success} /> Connected</div>
                      ) : state === 'soon' ? (
                        <div style={label({ fontSize: 14 })}>Coming soon</div>
                      ) : (
                        <Btn size={18} primary={c.state === 'drive'}>{state === 'connecting' ? 'Connecting…' : 'Connect'}</Btn>
                      )}
                    </div>
                  );
                })}
              </div>
            </AppShell>
          )}
        </Fit>
      </div>
      {!hasRec('drive-connect') ? <Cursor t={t} path={CONNECT_CURSOR(B)} ring={RING} /> : null}
    </AbsoluteFill>
  );
};

const ROWS = [
  { n: 'day1-keynote.mov', s: '18.4 GB', pick: 1.5 },
  { n: FILE, s: '26 GB', pick: 2 },
  { n: 'day1-panel-build-vs-buy.mov', s: '9.2 GB', pick: 2.5 },
  { n: 'sponsor-reel.mp4', s: '1.1 GB', pick: -1 },
];
const IMPORT_CLICK = 4;
const IMPORT_CURSOR = (B: (n: number) => number): CursorPt[] => {
  const row = (i: number) => sc(290 + 60, 116 + 150 + i * 92 + 46);
  const btn = sc(290 + 1110, 116 + 560);
  return [
    { t: B(0.8), x: 1500, y: 1000 },
    { t: B(1.4), ...row(0) },
    { t: B(1.5), ...row(0), click: true },
    { t: B(1.9), ...row(1) },
    { t: B(2), ...row(1), click: true },
    { t: B(2.4), ...row(2) },
    { t: B(2.5), ...row(2), click: true },
    { t: B(3.8), ...btn },
    { t: B(IMPORT_CLICK), ...btn, click: true },
    { t: B(6), x: btn.x - 200, y: btn.y + 200 },
  ];
};

const Import = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Lead t={t} B={B} words={['Pick', 'the', 'recordings.']} line="Whole folders, any size." y={230} w={560} size={78} />
    <div style={abs(SHELL.x, SHELL.y, { borderRadius: 18, overflow: 'hidden', border: `1px solid ${R.border}`, boxShadow: '0 30px 80px rgba(26,23,20,0.16)' })}>
      <Fit w={SHELL.w} bw={1600} bh={900}>
        {hasRec('drive-import') ? <RecFill id="drive-import" /> : (
          <AppShell active="Integrations" title="Google Drive">
            <div style={{ ...card({ borderRadius: 16, boxShadow: 'none' }), width: 1250, height: 650, padding: '24px 30px', boxSizing: 'border-box', position: 'relative' }}>
              <div style={{ fontFamily: SANS, fontSize: 20, color: R.ink2 }}>
                My Drive › Harbor Summit 2026 › <span style={{ color: R.ink, fontWeight: 600 }}>Recordings</span>
              </div>
              {ROWS.map((r, i) => {
                const on = r.pick > 0 && t >= B(r.pick);
                return (
                  <div key={r.n} style={abs(30, 150 + i * 92 - 66, { width: 1190, height: 80, display: 'flex', alignItems: 'center', gap: 18, borderRadius: 12, padding: '0 16px', boxSizing: 'border-box', background: on ? R.brand50 : 'transparent', fontFamily: SANS, fontSize: 22, color: R.ink })}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, border: `2px solid ${on ? R.brand : R.muted}`, background: on ? R.brand : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on ? <Check size={18} color="#fff" /> : null}</div>
                    <div style={{ width: 52, height: 34, borderRadius: 6, background: R.ink, color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>
                    <div style={{ flex: 1 }}>{r.n}</div>
                    <div style={{ fontFamily: MONO, fontSize: 18, color: R.ink3 }}>{r.s}</div>
                  </div>
                );
              })}
              <div style={abs(1010, 530)}>
                <Btn primary size={22} pressed={t >= B(IMPORT_CLICK) && t < B(IMPORT_CLICK) + 0.15}>↓ Import 3</Btn>
              </div>
            </div>
          </AppShell>
        )}
      </Fit>
    </div>
    <Toast t={t} at={B(IMPORT_CLICK + 0.3)} text="Import queued. Sessions will appear here once processing completes." x={1265} y={980} />
    {!hasRec('drive-import') ? <Cursor t={t} path={IMPORT_CURSOR(B)} ring={RING} /> : null}
  </AbsoluteFill>
);

// ------------------------------------------------------------------ the pipeline

const STATIONS = ['Transcode', 'Transcribe', 'Summarise', 'Clip'];
const ARRIVE = [1.5, 4, 6.5, 9];

const Process = ({ t, B }: Ctx) => {
  const xs = [330, 750, 1170, 1590];
  const pos = (() => {
    if (t < B(ARRIVE[0])) return 120 + (xs[0] - 120) * lerp(t, 0, B(ARRIVE[0]), 0, 1, INOUT);
    for (let i = 0; i < 3; i++) if (t < B(ARRIVE[i + 1])) return xs[i] + (xs[i + 1] - xs[i]) * lerp(t, B(ARRIVE[i] + 1), B(ARRIVE[i + 1]), 0, 1, INOUT);
    return xs[3];
  })();
  const mins = count(t, 0, B(10), 0, 302);
  return (
    <AbsoluteFill>
      <div style={centerRow(110)}>
        <Reveal t={t} at={0} y={18}>
          <div style={head(84, { fontWeight: 700, letterSpacing: '-0.045em' })}>
            A 26 GB keynote, <span style={serif({ fontSize: 96, fontWeight: 400 })}>in about 5 minutes.</span>
          </div>
        </Reveal>
      </div>
      <div style={abs(120, 598, { width: 1680, height: 6, borderRadius: 3, background: R.muted })} />
      <div style={abs(120, 598, { width: pos - 120, height: 6, borderRadius: 3, background: R.brand })} />
      {STATIONS.map((s, i) => {
        const done = t >= B(ARRIVE[i] + 0.8);
        const here = t >= B(ARRIVE[i]);
        return (
          <div key={s} style={abs(xs[i] - 120, 470, { width: 240, textAlign: 'center' })}>
            <div style={{ width: 96, height: 96, borderRadius: 48, margin: '0 auto', background: done ? R.brand : '#fff', border: `3px solid ${here ? R.brand : R.muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW_SOFT, transform: `scale(${here && !done ? 1.08 : 1})` }}>
              {done ? <Check size={44} color="#fff" w={3} /> : <span style={{ fontFamily: MONO, fontSize: 26, color: here ? R.brand : R.ink3 }}>{i + 1}</span>}
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: here ? R.ink : R.ink3, marginTop: 150 }}>{s}</div>
          </div>
        );
      })}
      <div style={abs(pos - 80, 640, { ...card({ borderRadius: 14 }), width: 160, padding: '10px 0', textAlign: 'center', fontFamily: MONO, fontWeight: 600, fontSize: 22, color: R.ink })}>26 GB</div>
      <div style={centerRow(860)}>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 72, color: R.ink, fontVariantNumeric: 'tabular-nums' }}>
          {Math.floor(mins / 60)}:{String(mins % 60).padStart(2, '0')}
        </div>
      </div>
    </AbsoluteFill>
  );
};
const SHADOW_SOFT = '0 10px 30px rgba(26,23,20,0.10)';

// ------------------------------------------------------------------ assets ready

const ASSETS: { k: string; body: React.ReactNode }[] = [
  { k: 'Transcript', body: <div style={{ fontFamily: SANS, fontSize: 19, color: R.ink2, lineHeight: 1.4 }}>Priya Raman · 18:40<br />We’d rather own the data than rent the dashboard.</div> },
  { k: 'Summary', body: <div style={{ fontFamily: SANS, fontSize: 19, color: R.ink2, lineHeight: 1.4 }}>The pilot cut audit prep from weeks to days.</div> },
  { k: 'Key quotes', body: <div style={serif({ fontSize: 24, color: R.ink, lineHeight: 1.2 })}>“Pricing is a story you tell twice.”</div> },
  { k: 'Chapters', body: <div style={{ fontFamily: MONO, fontSize: 17, color: R.ink2, lineHeight: 1.6 }}>00:00 Opening<br />06:12 Pilot results<br />18:40 Cost data</div> },
  { k: 'Speakers', body: <div style={{ display: 'flex', gap: 6 }}>{SPEAKERS.slice(0, 4).map((s) => <Avatar key={s.i} s={s} size={44} />)}</div> },
  { k: 'Clips', body: <div style={{ display: 'flex', gap: 8 }}>{[0.3, 0.5, 0.7].map((c) => <ClipPoster key={c} t={0} w={44} crop={c} radius={6} />)}</div> },
];

const Assets = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <div style={centerRow(90)}>
      <Reveal t={t} at={0} y={18}>
        <div style={head(84, { fontWeight: 700, letterSpacing: '-0.045em' })}>
          Ready to <span style={serif({ fontSize: 96, fontWeight: 400 })}>use.</span>
        </div>
      </Reveal>
    </div>
    {hasRec('drive-assets') ? (
      <div style={abs(210, 230, { ...card({ borderRadius: 22 }), width: 1500, height: 790, overflow: 'hidden' })}>
        <RecFill id="drive-assets" />
      </div>
    ) : (
      <div style={abs(210, 260, { display: 'grid', gridTemplateColumns: 'repeat(3, 480px)', gap: 30 })}>
        {ASSETS.map((a, i) => {
          const p = spr(t, B(0.75 + i * 0.5), 14);
          return (
            <div key={a.k} style={{ ...card({ borderRadius: 22 }), height: 290, padding: '28px 30px', boxSizing: 'border-box', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 50}px) scale(${0.9 + 0.1 * p})` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Check size={22} color={R.success} />
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: R.ink }}>{a.k}</div>
              </div>
              <div style={{ marginTop: 22 }}>{a.body}</div>
            </div>
          );
        })}
      </div>
    )}
  </AbsoluteFill>
);

const Payoff = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Slam t={t} at={0} y={330}>
      <div style={head(200, { fontWeight: 700, letterSpacing: '-0.055em' })}>Drop it in.</div>
    </Slam>
    <Slam t={t} at={B(2)} y={560}>
      <div style={serif({ fontSize: 210, color: R.ink })}>Done.</div>
    </Slam>
  </AbsoluteFill>
);

const End = ({ t, B }: Ctx) => <EndCard t={t} B={B} line="Drop the recording in Drive. RecapHub does the rest." />;

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = { hook: Hook, problem: Problem, connect: Connect, import: Import, process: Process, assets: Assets, payoff: Payoff, end: End };

const { at: sAt, clicks } = sfxKit(tl);
const SFX = [
  { at: sAt('hook', 2), src: 'page-turn' as const, vol: 0.4 },
  ...[0.5, 1, 1.5, 2, 2.5, 3].map((b) => ({ at: sAt('problem', b), src: 'pop' as const, vol: 0.18 })),
  { at: sAt('problem', 4), src: 'snip' as const, vol: 0.35 },
  ...clicks('connect', CONNECT_CURSOR),
  { at: sAt('connect', CONNECT_CLICK + 0.5), src: 'ding' as const, vol: 0.2 },
  ...clicks('import', IMPORT_CURSOR),
  ...ARRIVE.map((b) => ({ at: sAt('process', b + 0.8), src: 'switch' as const, vol: 0.25 })),
  ...[0.75, 1.25, 1.75, 2.25, 2.75, 3.25].map((b) => ({ at: sAt('assets', b), src: 'pop' as const, vol: 0.18 })),
  { at: sAt('end', 3), src: 'ding' as const, vol: 0.22 },
];

export const RecapHubDrive: React.FC = () => <Film tl={tl} render={RENDER} sfx={SFX} />;
export const driveTimeline = tl;
