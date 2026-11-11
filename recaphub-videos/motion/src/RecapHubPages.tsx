/* RecapHub · Published Recap Pages promo, ~38 s, "theme-switch montage": the page
 * re-skins on every beat, then travels from publish card to live page, treemap,
 * debate map, a captioned session, the phone and an embed on the client's site.
 * Hook: "Your event ended. Your audience didn't." CTA: Book a demo · recaphub.co.
 * Music: music-rh-pages.wav (compose.py pages), 120 BPM, F major. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-pages.json';
import { Ctx, Cursor, CursorPt, Reveal, Timeline, TypeOn, lerp, spr, EXPO, INOUT, count } from './kit';
import { R, MONO, SANS, RING, Browser, Check, RecFill, abs, card, centerRow, hasRec, head, label, serif } from './rh';import { AppShell, Btn, EndCard, Film, Fit, Lead, PhoneFrame, RecapSite, SessionPage, SiteStyle, SiteTheme, Slam, Toast, sfxKit } from './ui';

const tl = tlJson as Timeline;
const URL = 'recaphub.co/harbor-summit-2026';

// ------------------------------------------------------------------ hook + problem

const Hook = ({ t, B }: Ctx) => {
  const ev = lerp(t, 0, B(2), 0, 1, EXPO);
  const on = lerp(t, B(3), B(5.6), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Slam t={t} at={0} out={B(3)} y={310}>
        <div style={head(160, { fontWeight: 700, letterSpacing: '-0.05em' })}>
          Your event <span style={serif({ fontSize: 176, fontWeight: 400 })}>ended.</span>
        </div>
      </Slam>
      <Slam t={t} at={B(3)} y={310}>
        <div style={head(150, { fontWeight: 700, letterSpacing: '-0.05em' })}>
          Your audience <span style={serif({ fontSize: 166, fontWeight: 400 })}>didn’t.</span>
        </div>
      </Slam>
      {/* the event's own line ends at the marker; the audience line keeps going */}
      <div style={abs(160, 760, { width: 800 * ev, height: 6, borderRadius: 3, background: R.ink })} />
      {['Day 1', 'Day 2', 'Day 3'].map((d, i) => (
        <div key={d} style={abs(160 + i * 300, 784, { ...label({ fontSize: 18 }), opacity: lerp(t, B(i * 0.5), B(i * 0.5 + 0.4)) })}>{d}</div>
      ))}
      <div style={abs(950, 738, { width: 22, height: 50, borderRadius: 4, background: R.ink, opacity: lerp(t, B(1.8), B(2)) })} />
      <div style={abs(900, 680, { ...label({ fontSize: 18, color: R.ink }), opacity: lerp(t, B(1.8), B(2.2)) })}>Event ends</div>
      <svg width={820} height={20} style={{ position: 'absolute', left: 970, top: 753 }}>
        <line x1={0} y1={10} x2={800 * on} y2={10} stroke={R.ink} strokeWidth={5} strokeDasharray="14 12" strokeLinecap="round" />
      </svg>
      {['Week 1', 'Week 2', 'Week 3'].map((d, i) => (
        <div key={d} style={abs(1100 + i * 250, 784, { ...label({ fontSize: 18 }), opacity: lerp(t, B(3.5 + i * 0.6), B(3.9 + i * 0.6)) })}>{d}</div>
      ))}
      {Array.from({ length: 9 }).map((_, i) => {
        const p = spr(t, B(3.4 + i * 0.25), 12);
        return <div key={i} style={abs(1010 + i * 88, 700 - (i % 3) * 18, { width: 26, height: 26, borderRadius: 13, background: i % 3 === 1 ? R.brand100 : R.sand, border: '3px solid #fff', transform: `scale(${p})` })} />;
      })}
    </AbsoluteFill>
  );
};

const FILES = [['day2-panel-build-vs-buy.mp4', '47:30'], ['day1-keynote.mp4', '52:14'], ['day2-pilot-results.mp4', '31:55'], ['day3-ai-in-hiring.mp4', '41:09'], ['day3-closing.mp4', '21:09']];

const Problem = ({ t, B }: Ctx) => {
  const days = count(t, 0, B(4), 1, 21);
  return (
    <AbsoluteFill>
      <div style={abs(110, 250, { width: 780 })}>
        <div style={label({ fontSize: 22, color: R.ink2 })}>
          + <span style={{ fontVariantNumeric: 'tabular-nums', color: R.ink }}>{days}</span> days
        </div>
        <Reveal t={t} at={0} y={20}>
          <div style={head(100, { fontWeight: 700, letterSpacing: '-0.045em', marginTop: 16 })}>Three weeks later,</div>
        </Reveal>
        <Reveal t={t} at={B(1.5)} y={20}>
          <div style={serif({ fontSize: 96, color: R.ink, lineHeight: 1.1, marginTop: 6 })}>the recordings sit in a folder.</div>
        </Reveal>
      </div>
      <div style={abs(1000, 230, { ...card({ borderRadius: 24 }), width: 800, padding: '26px 30px', boxSizing: 'border-box', transform: `rotate(${2 - 2 * spr(t, 0, 14)}deg)` })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 600, fontSize: 26, color: R.ink }}>
          <div style={{ width: 40, height: 32, borderRadius: 6, background: R.sand }} /> Harbor Summit 2026 / Recordings
        </div>
        {FILES.map(([f, d], i) => (
          <Reveal key={f} t={t} at={B(0.5 + i * 0.25)} y={12} dur={0.3}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderTop: i ? `1px solid ${R.border}` : 'none', marginTop: i ? 0 : 18, fontFamily: SANS, fontSize: 23, color: R.ink2 }}>
              <div style={{ width: 54, height: 34, borderRadius: 6, background: R.ink, color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>
              <div style={{ flex: 1 }}>{f}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: R.ink3 }}>{d}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: R.danger, opacity: lerp(t, B(3 + i * 0.15), B(3.3 + i * 0.15)) }}>0 views</div>
            </div>
          </Reveal>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ publish (Overview publish card)

const PUB_CLICK = 4;
const SHELL = { x: 690, y: 170, w: 1150 };
const K = SHELL.w / 1600;
const at = (bx: number, by: number) => ({ x: SHELL.x + bx * K, y: SHELL.y + by * K });
const PUBLISH_CURSOR = (B: (n: number) => number): CursorPt[] => {
  const btn = at(290 + 32 + 130, 116 + 330 + 30);
  return [
    { t: B(1.5), x: 1500, y: 1000 },
    { t: B(3.6), x: btn.x, y: btn.y },
    { t: B(PUB_CLICK), x: btn.x, y: btn.y, click: true },
    { t: B(6), x: btn.x + 260, y: btn.y + 220 },
  ];
};

const Publish = ({ t, B }: Ctx) => {
  const done = t >= B(PUB_CLICK);
  const enter = spr(t, 0, 16, 0.85);
  return (
    <AbsoluteFill>
      <Lead t={t} B={B} tag="Published recap pages" words={['One', 'click', 'to', 'publish.']} line="From the event’s Overview." y={230} w={560} />
      <div style={abs(SHELL.x, SHELL.y + (1 - enter) * 400, { opacity: Math.min(1, enter * 1.5), borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 80px rgba(26,23,20,0.16)', border: `1px solid ${R.border}` })}>
        <Fit w={SHELL.w} bw={1600} bh={900}>
          {hasRec('pages-publish') ? <RecFill id="pages-publish" /> : (
            <AppShell active="Overview" title="Overview">
              <div style={abs(0, 0, { ...card({ borderRadius: 18 }), width: 760, height: 430, padding: 32, boxSizing: 'border-box' })}>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: R.ink }}>{done ? 'Your recap is live' : 'Publish your recap'}</div>
                <div style={{ fontFamily: SANS, fontSize: 19, color: R.ink2, marginTop: 6 }}>{done ? 'Anyone with the link can explore it.' : 'Everything below is ready to go public.'}</div>
                {['38 sessions summarised', '12 speaker pages', 'Topics and debates mapped'].map((x, i) => (
                  <Reveal key={x} t={t} at={B(1 + i * 0.5)} y={10} dur={0.3}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: i ? 16 : 30, fontFamily: SANS, fontSize: 21, color: R.ink }}>
                      <Check size={22} color={R.success} /> {x}
                    </div>
                  </Reveal>
                ))}
                <div style={abs(32, 330, { width: 260, height: 60 })}>
                  {done ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${0.9 + 0.1 * spr(t, B(PUB_CLICK), 12)})`, transformOrigin: '0 50%' }}>
                      <Btn primary size={22} style={{ background: R.success }}>
                        <Check size={20} color="#fff" /> Published
                      </Btn>
                      <div style={{ fontFamily: MONO, fontSize: 18, color: R.brand600, background: R.brand50, borderRadius: 10, padding: '12px 16px', whiteSpace: 'nowrap' }}>{URL}</div>
                    </div>
                  ) : (
                    <Btn primary size={22} pressed={t >= B(PUB_CLICK) - 0.08}>Publish recap</Btn>
                  )}
                </div>
              </div>
              <div style={abs(800, 0, { display: 'flex', flexDirection: 'column', gap: 18 })}>
                {[['Sessions', '38'], ['Speakers', '12'], ['Quotes', '214']].map(([k, v]) => (
                  <div key={k} style={{ ...card({ borderRadius: 16 }), width: 420, padding: '20px 24px', boxSizing: 'border-box' }}>
                    <div style={label({ fontSize: 15 })}>{k}</div>
                    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: R.ink, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </AppShell>
          )}
        </Fit>
      </div>
      {!hasRec('pages-publish') ? <Cursor t={t} path={PUBLISH_CURSOR(B)} ring={RING} /> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ theme: the page re-skins on every other beat

const LOOKS: { style: SiteStyle; theme: SiteTheme; word: string }[] = [
  { style: 'recap', theme: 'light', word: 'Recap.' },
  { style: 'spotlight', theme: 'light', word: 'Spotlight.' },
  { style: 'digest', theme: 'light', word: 'Digest.' },
  { style: 'spotlight', theme: 'terminal', word: 'Terminal.' },
];
const STYLES = [
  ['Recap', 'A featured session, then a grid of session cards.'],
  ['Spotlight', 'Editorial rows: big thumbnail, summary and a quote per session.'],
  ['Digest', 'A numbered programme list, so long agendas read at a glance.'],
];
const PANEL = { x: 110, y: 190 };
const THEME_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(0.6), x: 380, y: 1000 },
  { t: B(1.8), x: 370, y: PANEL.y + 80 + 118 + 52 },
  { t: B(2), x: 370, y: PANEL.y + 80 + 118 + 52, click: true },
  { t: B(3.8), x: 370, y: PANEL.y + 80 + 236 + 52 },
  { t: B(4), x: 370, y: PANEL.y + 80 + 236 + 52, click: true },
  { t: B(5.8), x: PANEL.x + 275, y: PANEL.y + 518 },
  { t: B(6), x: PANEL.x + 275, y: PANEL.y + 518, click: true },
  { t: B(7.5), x: 520, y: 1000 },
];

const Theme = ({ t, B }: Ctx) => {
  const k = t < B(2) ? 0 : t < B(4) ? 1 : t < B(6) ? 2 : 3;
  const look = LOOKS[k];
  const styleIdx = ['recap', 'spotlight', 'digest'].indexOf(look.style);
  const since = t - [0, B(2), B(4), B(6)][k];
  const wipe = k > 0 && since < 0.22 ? 1 - since / 0.22 : 0;
  return (
    <AbsoluteFill>
      <div style={abs(PANEL.x, PANEL.y, { ...card({ borderRadius: 22 }), width: 520, height: 600, padding: 30, boxSizing: 'border-box' })}>
        <div style={label({ fontSize: 17 })}>Page style</div>
        {STYLES.map(([n, d], i) => {
          const on = i === styleIdx;
          return (
            <div key={n} style={abs(30, 80 + i * 118, { width: 460, height: 104, boxSizing: 'border-box', borderRadius: 14, border: `${on ? 2 : 1}px solid ${on ? R.brand : R.border}`, background: on ? R.brand50 : '#fff', padding: '14px 18px' })}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: on ? R.brand600 : R.ink }}>{n}</div>
              <div style={{ fontFamily: SANS, fontSize: 16, color: R.ink2, marginTop: 4, lineHeight: 1.3 }}>{d}</div>
            </div>
          );
        })}
        <div style={abs(30, 450, label({ fontSize: 17 }))}>Theme</div>
        {['Light', 'Terminal'].map((n, i) => {
          const on = (look.theme === 'terminal') === (i === 1);
          return (
            <div key={n} style={abs(30 + i * 180, 490, { width: 160, height: 56, borderRadius: 12, border: `${on ? 2 : 1}px solid ${on ? R.brand : R.border}`, background: i ? '#121110' : '#FAFAF9', color: i ? '#EDEBE8' : R.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 20 })}>{n}</div>
          );
        })}
      </div>
      <div style={abs(690, 150, { borderRadius: 18, overflow: 'hidden', border: `1px solid ${R.border}`, boxShadow: '0 30px 80px rgba(26,23,20,0.16)' })}>
        <div style={{ width: 1130, height: 690, position: 'relative' }}>
          {hasRec('pages-theme') ? <RecFill id="pages-theme" /> : (
            <Fit w={1130} bw={1200} bh={733}>
              <RecapSite t={t} theme={look.theme} pageStyle={look.style} height={733} />
            </Fit>
          )}
          <AbsoluteFill style={{ background: '#fff', opacity: wipe * 0.85 }} />
        </div>
      </div>
      <div style={abs(700, 870, { display: 'flex', alignItems: 'baseline', gap: 18 })}>
        <div key={k} style={serif({ fontSize: 110, color: R.ink, opacity: lerp(t, t - since, t - since + 0.18), transform: `translateY(${(1 - lerp(t, t - since, t - since + 0.25, 0, 1, EXPO)) * 30}px)` })}>{look.word}</div>
      </div>
      {!hasRec('pages-theme') ? <Cursor t={t} path={THEME_CURSOR(B)} ring={RING} /> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the live page, treemap, debate map, session, phone, embed

const LiveSite: React.FC<{ t: number; rec: string; scroll: number; tilesAt?: number; mapAt?: number; x: number; y: number; w: number; h: number }> = ({ t, rec, scroll, tilesAt, mapAt, x, y, w, h }) => {
  const k = w / 1200;
  return (
    <div style={abs(x, y)}>
      <Browser w={w} h={h} url={URL} rec={rec}>
        <Fit w={w} bw={1200} bh={(h - 58) / k}>
          <RecapSite t={t} scroll={scroll} tilesAt={tilesAt} mapAt={mapAt} step={0.25} height={(h - 58) / k} />
        </Fit>
      </Browser>
    </div>
  );
};

const Live = ({ t, B }: Ctx) => {
  const enter = spr(t, 0, 15, 0.85);
  return (
    <AbsoluteFill>
      <div style={centerRow(56)}>
        <Reveal t={t} at={0} y={16} dur={0.35}>
          <div style={head(60, { fontWeight: 600 })}>
            Live in <span style={serif({ fontSize: 68, fontWeight: 400 })}>one link.</span>
          </div>
        </Reveal>
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - enter) * 500}px) scale(${0.94 + 0.06 * enter})`, transformOrigin: '50% 100%' }}>
        <LiveSite t={t} rec="pages-live" scroll={lerp(t, B(3.5), B(8), 0, 380, INOUT)} x={200} y={170} w={1520} h={860} />
      </div>
    </AbsoluteFill>
  );
};

const Treemap = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Lead t={t} B={B} words={['Every', 'topic,', 'sized', 'by', 'time.']} line="Topics and sessions, one map." y={250} w={600} />
    <LiveSite t={t} rec="pages-treemap" scroll={800} tilesAt={B(1)} x={760} y={170} w={1060} h={740} />
  </AbsoluteFill>
);

const Mindmap = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Lead t={t} B={B} words={['Every', 'debate,', 'mapped.']} line="What was argued, and who stood where." y={250} w={600} />
    <LiveSite t={t} rec="pages-mindmap" scroll={1180} mapAt={B(0.5)} x={760} y={170} w={1060} h={740} />
  </AbsoluteFill>
);

const Session = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <Lead t={t} B={B} words={['Every', 'session,', 'captioned.']} line="Summary, quotes, chapters, transcript." y={250} w={600} />
    <div style={abs(760, 170)}>
      <Browser w={1060} h={740} url={`${URL}/pilot-results`} rec="pages-session">
        <Fit w={1060} bw={1200} bh={760}>
          <SessionPage t={t} caption="We’d rather own the data than rent the dashboard." />
        </Fit>
      </Browser>
    </div>
  </AbsoluteFill>
);

const Mobile = ({ t, B }: Ctx) => {
  const p = spr(t, 0, 15, 0.85);
  return (
    <AbsoluteFill>
      <Lead t={t} B={B} words={['In', 'every', 'pocket.']} line="The same recap, built for the phone." y={300} w={640} />
      <div style={abs(1120, 130 + (1 - p) * 600, { transform: `rotate(${(1 - p) * 8}deg)` })}>
        <PhoneFrame w={400}>
          {hasRec('pages-mobile') ? <RecFill id="pages-mobile" /> : (
            <Fit w={376} bw={390} bh={830}>
              <RecapSite t={t} mobile scroll={lerp(t, B(1.5), B(5.5), 0, 330, INOUT)} height={830} />
            </Fit>
          )}
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};

const Embed = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <div style={centerRow(50)}>
      <div style={head(64, { fontWeight: 600 })}>
        Or embed it on <span style={serif({ fontSize: 72, fontWeight: 400 })}>your own site.</span>
      </div>
    </div>
    <div style={abs(300, 160)}>
      <Browser w={1320} h={760} url="harborsummit.com/recap" rec="pages-embed">
        <div style={{ height: 70, background: R.ink, display: 'flex', alignItems: 'center', gap: 34, padding: '0 34px', fontFamily: SANS, color: '#F5F4F2' }}>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: '0.12em' }}>HARBOR SUMMIT</div>
          {['Programme', 'Speakers', 'Recap', 'Tickets'].map((x, i) => <div key={x} style={{ fontSize: 18, opacity: i === 2 ? 1 : 0.6 }}>{x}</div>)}
        </div>
        <div style={{ margin: '24px 34px', border: `2px dashed ${R.brand}`, borderRadius: 14, overflow: 'hidden' }}>
          <Fit w={1248} bw={1200} bh={560}>
            <RecapSite t={t} height={560} />
          </Fit>
        </div>
      </Browser>
    </div>
    <div style={abs(420, 860, { opacity: spr(t, B(1), 14), transform: `translateY(${(1 - spr(t, B(1), 14)) * 30}px)` })}>
      <div style={{ ...card({ borderRadius: 14 }), background: R.ink, border: 'none', padding: '18px 26px', fontFamily: MONO, fontSize: 24, color: '#E8E6E3' }}>
        <TypeOn t={t} at={B(1.2)} cps={70} caret="#E8E6E3" parts={[{ text: '<iframe src="https://' }, { text: URL, style: { color: '#9DB0F7' } }, { text: '"></iframe>' }]} />
      </div>
    </div>
  </AbsoluteFill>
);

const End = ({ t, B }: Ctx) => <EndCard t={t} B={B} line="Every session, every debate, one link." />;

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = {
  hook: Hook,
  problem: Problem,
  publish: Publish,
  theme: Theme,
  live: Live,
  treemap: Treemap,
  mindmap: Mindmap,
  session: Session,
  mobile: Mobile,
  embed: Embed,
  end: End,
};

const { at: sAt, clicks } = sfxKit(tl);
const SFX = [
  ...clicks('publish', PUBLISH_CURSOR),
  { at: sAt('publish', PUB_CLICK + 0.2), src: 'ding' as const, vol: 0.22 },
  ...clicks('theme', THEME_CURSOR),
  ...[2, 4, 6].map((b) => ({ at: sAt('theme', b), src: 'switch' as const, vol: 0.25 })),
  { at: sAt('treemap', 1), src: 'pop' as const, vol: 0.22 },
  { at: sAt('mobile', 0), src: 'whoosh' as const, vol: 0.3 },
  { at: sAt('embed', 1.2), src: 'key' as const, vol: 0.3 },
  { at: sAt('end', 3), src: 'ding' as const, vol: 0.22 },
];

export const RecapHubPages: React.FC = () => <Film tl={tl} render={RENDER} sfx={SFX} />;
export const pagesTimeline = tl;
