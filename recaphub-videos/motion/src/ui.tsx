/* Motion-graphic mocks of the real recaphub_3.0 screens, shared by the feature
 * promos: the dashboard shell, the published recap site (page styles Recap /
 * Spotlight / Digest, light or Terminal theme, desktop or phone), the topic
 * treemap, the "What was argued" debate map, a phone, a toast and a toggle.
 * Labels follow the app (domains/published, press, integrations, insights). */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Ctx, CursorPt, Reveal, Scene, Sfx, Soundtrack, Timeline, WordPush, clicksOf, lerp, sceneBeats, sceneStart, spr, transitionSfx, EXPO, INOUT } from './kit';
import { R, MONO, SANS, SHADOW, Avatar, ClipPoster, Cta, Footage, Mark, SPEAKERS, Stone, abs, card, centerRow, head, label, pill, serif } from './rh';

// ------------------------------------------------------------------ a film from its scenes

/** Sound-effect helpers on a film's beat clock. */
export const sfxKit = (tl: Timeline) => ({
  at: (id: string, beat: number) => sceneStart(tl, id) + sceneBeats(tl, id)(beat),
  clicks: (id: string, path: (B: (n: number) => number) => CursorPt[]) =>
    clicksOf(path(sceneBeats(tl, id))).map((c): Sfx => ({ at: sceneStart(tl, id) + c, src: 'mouse-click', vol: 0.5 })),
});

export const Film: React.FC<{ tl: Timeline; render: Record<string, (c: Ctx) => React.ReactNode>; sfx: Sfx[]; tone?: 'stone' | 'paper' }> = ({ tl, render, sfx, tone = 'stone' }) => (
  <AbsoluteFill style={{ background: tone === 'paper' ? R.paper : R.page }}>
    <Stone tone={tone} />
    {tl.scenes.map((s, i) => (
      <Scene key={s.id} tl={tl} index={i} render={render[s.id]} />
    ))}
    <Soundtrack tl={tl} sfx={[...transitionSfx(tl), ...sfx]} />
  </AbsoluteFill>
);

/** The end card every promo shares: the mark unfolding, the wordmark, one line, the CTA. */
export const EndCard: React.FC<{ t: number; B: (n: number) => number; line: React.ReactNode; dark?: boolean; kicker?: React.ReactNode }> = ({ t, B, line, dark, kicker }) => (
  <AbsoluteFill>
    {kicker ? (
      <div style={centerRow(150)}>
        <Reveal t={t} at={0} y={20} dur={0.4}>
          <div style={head(56, { color: dark ? '#A8A49D' : R.ink2, fontWeight: 500 })}>{kicker}</div>
        </Reveal>
      </div>
    ) : null}
    <div style={centerRow(kicker ? 300 : 230, { alignItems: 'center', gap: 40 })}>
      <div style={{ transform: `scale(${0.6 + 0.4 * spr(t, B(0.5), 13)})`, opacity: lerp(t, B(0.5), B(0.8)) }}>
        <Mark size={230} fan={[spr(t, B(1), 12), spr(t, B(1.25), 12)]} />
      </div>
      <Reveal t={t} at={B(1.25)} y={24}>
        <div style={head(150, { fontWeight: 700, letterSpacing: '-0.045em', color: dark ? '#FAFAF9' : R.ink })}>RecapHub</div>
      </Reveal>
    </div>
    <div style={centerRow(kicker ? 610 : 560)}>
      <Reveal t={t} at={B(2)} y={18}>
        <div style={serif({ fontSize: 72, color: dark ? '#F5F4F2' : R.ink })}>{line}</div>
      </Reveal>
    </div>
    <div style={centerRow(800)}>
      <Cta t={t} at={B(3)} dark={dark} />
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ text blocks

/** A line that slams in: oversized and blurred, settling on the beat; leaves at `out`. */
export const Slam: React.FC<{ t: number; at: number; out?: number; children: React.ReactNode; y: number; style?: React.CSSProperties }> = ({ t, at, out = 999, children, y, style }) => {
  if (t < at - 0.02 || t > out + 0.2) return null;
  const p = lerp(t, at, at + 0.22, 0, 1, EXPO);
  const q = lerp(t, out, out + 0.16, 0, 1, INOUT);
  return (
    <div style={{ position: 'absolute', left: 0, width: 1920, top: y, display: 'flex', justifyContent: 'center', opacity: p * (1 - q), transform: `scale(${1.14 - 0.14 * p + 0.06 * q}) translateY(${-q * 40}px)`, filter: `blur(${(1 - p) * 14 + q * 12}px)`, ...style }}>
      {children}
    </div>
  );
};

/** The left column of a product beat: a mono tag, a headline pushed in word by word, one supporting line. */
export const Lead: React.FC<{ t: number; B: (n: number) => number; tag?: string; words: string[]; serifLast?: boolean; line?: React.ReactNode; x?: number; y?: number; w?: number; size?: number; dark?: boolean; perLine?: number }> = ({ t, B, tag, words, serifLast = true, line, x = 110, y = 170, w = 640, size = 92, dark, perLine = 2 }) => {
  const ink = dark ? '#F5F4F2' : R.ink;
  // break the headline into lines of at most two words, so it never overflows the column
  const lines: { text: string; i: number }[][] = [];
  words.forEach((text, i) => {
    const last = lines[lines.length - 1];
    if (!last || last.length >= perLine || text.length + last.reduce((n, w2) => n + w2.text.length, 0) > 13 * (perLine / 2)) lines.push([{ text, i }]);
    else last.push({ text, i });
  });
  return (
    <div style={abs(x, y, { width: w })}>
      {tag ? (
        <Reveal t={t} at={0} y={14} dur={0.35}>
          <div style={label({ fontSize: 22, color: dark ? '#A8A49D' : R.brand })}>{tag}</div>
        </Reveal>
      ) : null}
      <div style={{ marginTop: tag ? 14 : 0 }}>
        {lines.map((ln, k) => (
          <WordPush
            key={k}
            justify="flex-start"
            t={t}
            style={head(size, { fontWeight: 700, letterSpacing: '-0.045em', color: ink, lineHeight: 1.08, width: 'max-content' })}
            words={ln.map((wd) => ({ text: wd.text, at: B(wd.i * 0.25), style: serifLast && wd.i === words.length - 1 ? serif({ fontSize: size * 1.12, fontWeight: 400, color: ink }) : undefined }))}
          />
        ))}
      </div>
      {line ? (
        <Reveal t={t} at={B(words.length * 0.25 + 0.5)} y={16}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: dark ? '#A8A49D' : R.ink2, marginTop: 26, lineHeight: 1.35 }}>{line}</div>
        </Reveal>
      ) : null}
    </div>
  );
};

// ------------------------------------------------------------------ small pieces

export const Toast: React.FC<{ t: number; at: number; until?: number; text: string; x?: number; y?: number; icon?: React.ReactNode }> = ({ t, at, until = 999, text, x = 960, y = 960, icon }) => {
  const p = spr(t, at, 14, 0.7);
  const q = lerp(t, until, until + 0.25);
  if (t < at) return null;
  return (
    <div style={abs(x, y, { transform: `translate(-50%, ${(1 - p) * 40}px)`, opacity: Math.min(1, p * 1.5) * (1 - q), display: 'flex', alignItems: 'center', gap: 12, background: R.ink, color: '#fff', borderRadius: 16, padding: '16px 24px', fontFamily: SANS, fontWeight: 500, fontSize: 26, boxShadow: '0 20px 50px rgba(26,23,20,0.25)', whiteSpace: 'nowrap', zIndex: 20 })}>
      {icon}
      {text}
    </div>
  );
};

export const Toggle: React.FC<{ on: number; size?: number }> = ({ on, size = 1 }) => (
  <div style={{ width: 64 * size, height: 36 * size, borderRadius: 18 * size, background: on > 0.5 ? R.brand : R.muted, position: 'relative', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 4 * size, left: (4 + 28 * on) * size, width: 28 * size, height: 28 * size, borderRadius: 14 * size, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
  </div>
);

export const Btn: React.FC<{ children: React.ReactNode; primary?: boolean; pressed?: boolean; size?: number; style?: React.CSSProperties }> = ({ children, primary, pressed, size = 22, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontWeight: 600, fontSize: size, color: primary ? '#fff' : R.ink, background: primary ? R.brand : '#fff', border: primary ? 'none' : `1px solid ${R.border}`, borderRadius: 12, padding: `${size * 0.5}px ${size * 0.9}px`, transform: pressed ? 'scale(0.95)' : undefined, whiteSpace: 'nowrap', ...style }}>{children}</div>
);

export const PhoneFrame: React.FC<{ w: number; children: React.ReactNode; dark?: boolean }> = ({ w, children, dark }) => {
  const h = w * 2.05;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.15, background: R.ink, padding: w * 0.03, boxSizing: 'border-box', boxShadow: '0 50px 100px rgba(26,23,20,0.28)' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: w * 0.12, overflow: 'hidden', position: 'relative', background: dark ? '#121110' : R.page }}>
        {children}
        <div style={abs(w * 0.37, w * 0.03, { width: w * 0.2, height: w * 0.06, borderRadius: w * 0.03, background: '#000' })} />
      </div>
    </div>
  );
};

/** Scale a fixed-size design (bw x bh) to width w. */
export const Fit: React.FC<{ w: number; bw: number; bh: number; children: React.ReactNode }> = ({ w, bw, bh, children }) => {
  const k = w / bw;
  return (
    <div style={{ width: w, height: bh * k, overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: bw, height: bh, transform: `scale(${k})`, transformOrigin: '0 0', position: 'absolute', left: 0, top: 0 }}>{children}</div>
    </div>
  );
};

// ------------------------------------------------------------------ the dashboard shell

const NAV = ['Overview', 'Sessions', 'Speakers', 'Insights', 'Press', 'Stages', 'Chat', 'Integrations', 'Settings'];

/** The RecapHub app at 1600 x 900 (scale it with <Fit>): sidebar, page title, content. */
export const AppShell: React.FC<{ active: string; title: string; children: React.ReactNode; actions?: React.ReactNode }> = ({ active, title, children, actions }) => (
  <div style={{ width: 1600, height: 900, display: 'flex', background: R.page, fontFamily: SANS }}>
    <div style={{ width: 250, borderRight: `1px solid ${R.border}`, background: '#fff', padding: '26px 18px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
        <Mark size={34} />
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', color: R.ink }}>RecapHub</div>
      </div>
      <div style={{ marginTop: 26, padding: '12px 12px', border: `1px solid ${R.border}`, borderRadius: 12, fontSize: 17, color: R.ink, fontWeight: 600 }}>
        Harbor Summit 2026
        <div style={{ fontWeight: 400, color: R.ink3, fontSize: 14, marginTop: 2 }}>38 sessions · 3 days</div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map((n) => (
          <div key={n} style={{ padding: '11px 14px', borderRadius: 10, fontSize: 18, fontWeight: n === active ? 600 : 400, color: n === active ? R.brand600 : R.ink2, background: n === active ? R.brand50 : 'transparent' }}>{n}</div>
        ))}
      </div>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ height: 84, borderBottom: `1px solid ${R.border}`, display: 'flex', alignItems: 'center', padding: '0 40px', background: '#fff' }}>
        <div style={{ fontWeight: 600, fontSize: 28, letterSpacing: '-0.02em', color: R.ink }}>{title}</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>{actions}</div>
      </div>
      <div style={{ flex: 1, position: 'relative', padding: '32px 40px', overflow: 'hidden' }}>{children}</div>
    </div>
  </div>
);

// ------------------------------------------------------------------ the published recap site

export type SiteTheme = 'light' | 'terminal';
export type SiteStyle = 'recap' | 'spotlight' | 'digest';

export const siteColors = (theme: SiteTheme) =>
  theme === 'terminal'
    ? { bg: '#121110', surf: '#1C1A18', ink: '#EDEBE8', ink2: '#A8A49D', line: '#2E2B28', accent: '#7D93F5', soft: '#24211E' }
    : { bg: R.page, surf: '#FFFFFF', ink: R.ink, ink2: R.ink2, line: R.border, accent: R.brand, soft: R.subtle };

const SITE_SESSIONS = [
  { title: 'Keynote: The next decade of events', d: '52:14', who: 0, quote: 'Pricing is a story you tell twice.', crop: 0.5 },
  { title: 'Panel: Build vs buy', d: '47:30', who: 1, quote: 'Buying got us live in six weeks.', crop: 0.3 },
  { title: 'Pilot results', d: '31:55', who: 2, quote: 'The cheapest fix was the one we almost skipped.', crop: 0.7 },
  { title: 'AI in hiring', d: '41:09', who: 4, quote: 'Keep a human on the last decision.', crop: 0.2 },
  { title: 'Remote audits, honestly', d: '44:18', who: 5, quote: 'The data trail is the audit.', crop: 0.6 },
  { title: 'Closing remarks', d: '21:09', who: 3, quote: 'See you on the floor next year.', crop: 0.4 },
];

const TILES = [
  { x: 0, y: 0, w: 470, h: 290, name: 'Cost of compliance', m: '4h 12m', k: 0 },
  { x: 480, y: 0, w: 330, h: 170, name: 'AI in operations', m: '3h 05m', k: 1 },
  { x: 820, y: 0, w: 280, h: 170, name: 'Hiring', m: '1h 48m', k: 2 },
  { x: 480, y: 180, w: 250, h: 110, name: 'Supplier risk', m: '1h 10m', k: 3 },
  { x: 740, y: 180, w: 360, h: 110, name: 'Data quality', m: '1h 32m', k: 4 },
];

/** "Topics and sessions": the treemap, tiles popping in from `at`, `step` apart. Base size 1100 x 290. */
export const Treemap: React.FC<{ t: number; at: number; step: number; theme?: SiteTheme; photos?: boolean }> = ({ t, at, step, theme = 'light', photos = true }) => {
  const c = siteColors(theme);
  const fills = theme === 'terminal' ? ['#2A2622', '#24304F', '#2A2622', '#24211E', '#24211E'] : [R.ink, R.brand100, R.sand, R.muted, R.subtle];
  const inks = theme === 'terminal' ? ['#F5F4F2', '#C9D3FB', c.ink, c.ink, c.ink] : ['#F5F4F2', R.brand600, R.ink, R.ink, R.ink];
  return (
    <div style={{ position: 'relative', width: 1100, height: 290 }}>
      {TILES.map((tile, i) => {
        const p = spr(t, at + i * step, 14, 0.7);
        return (
          <div key={tile.name} style={abs(tile.x, tile.y, { width: tile.w, height: tile.h, borderRadius: 14, background: fills[i], color: inks[i], overflow: 'hidden', opacity: Math.min(1, p * 1.6), transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: '0 0' })}>
            {photos && i === 0 ? <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}><Footage t={t} w={tile.w} h={tile.h} crop={0.5} /></div> : null}
            <div style={{ position: 'relative', padding: '16px 18px' }}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tile.h > 150 ? 28 : 21, letterSpacing: '-0.01em' }}>{tile.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 16, opacity: 0.7, marginTop: 4 }}>{tile.m}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** "What was argued": theme → questions → speaker stances, edges drawing on. Base size 1100 x 290. */
export const DebateMap: React.FC<{ t: number; at: number; step: number; theme?: SiteTheme; hot?: number }> = ({ t, at, step, theme = 'light', hot = -1 }) => {
  const c = siteColors(theme);
  const nodes = [
    { x: 30, y: 120, text: 'AI in operations', kind: 'theme' },
    { x: 380, y: 40, text: 'Build or buy?', kind: 'q' },
    { x: 380, y: 200, text: 'Who owns the data?', kind: 'q' },
    { x: 760, y: 0, s: 0, text: 'Build it in-house', kind: 'stance' },
    { x: 760, y: 80, s: 1, text: 'Buy, then adapt', kind: 'stance' },
    { x: 760, y: 200, s: 2, text: 'The customer does', kind: 'stance' },
  ];
  const width = (n: (typeof nodes)[number]) => (n.kind === 'theme' ? 250 : n.kind === 'q' ? 260 : 290);
  const edges: [number, number, number][] = [[0, 1, 0], [0, 2, 0], [1, 3, 1], [1, 4, 1], [2, 5, 2]];
  return (
    <div style={{ position: 'relative', width: 1100, height: 290 }}>
      <svg width={1100} height={290} style={{ position: 'absolute', left: 0, top: 0 }}>
        {edges.map(([a, b, d], i) => {
          const p = lerp(t, at + d * step, at + (d + 1) * step);
          const A = { x: nodes[a].x + width(nodes[a]), y: nodes[a].y + 28 };
          const Bp = { x: nodes[b].x, y: nodes[b].y + 28 };
          const mx = (A.x + Bp.x) / 2;
          const on = hot >= 0 && (b === hot || a === hot);
          return <path key={i} d={`M ${A.x} ${A.y} C ${mx} ${A.y}, ${mx} ${Bp.y}, ${Bp.x} ${Bp.y}`} fill="none" stroke={on ? c.accent : c.ink2} strokeOpacity={on ? 1 : 0.5} strokeWidth={on ? 3.5 : 2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />;
        })}
      </svg>
      {nodes.map((n, i) => {
        const d = n.kind === 'theme' ? 0 : n.kind === 'q' ? 1 : 2;
        const p = spr(t, at + d * step, 14);
        const base: React.CSSProperties = { position: 'absolute', left: n.x, top: n.y, opacity: Math.min(1, p * 1.5), transform: `scale(${0.8 + 0.2 * p})`, transformOrigin: '0 50%', display: 'flex', alignItems: 'center', gap: 10, height: 56, boxSizing: 'border-box', borderRadius: 99, padding: '0 20px', fontFamily: SANS, fontWeight: 500, fontSize: 22, whiteSpace: 'nowrap' };
        const isHot = hot === i;
        if (n.kind === 'theme') return <div key={i} style={{ ...base, background: c.ink, color: c.bg, fontWeight: 600 }}>{n.text}</div>;
        if (n.kind === 'q') return <div key={i} style={{ ...base, background: isHot ? c.accent : c.soft, border: `1px solid ${c.line}`, color: isHot ? '#fff' : c.ink }}>{n.text}</div>;
        return (
          <div key={i} style={{ ...base, background: c.surf, border: `1px solid ${isHot ? c.accent : c.line}`, color: c.ink2, paddingLeft: 8 }}>
            <Avatar s={SPEAKERS[n.s ?? 0]} size={40} edge={c.surf} />
            {n.text}
          </div>
        );
      })}
    </div>
  );
};

/**
 * The published event page at its base size (desktop 1200 wide, phone 390 wide);
 * scale it with <Fit>. `scroll` moves the page up in base pixels.
 */
export const RecapSite: React.FC<{ t: number; theme?: SiteTheme; pageStyle?: SiteStyle; mobile?: boolean; scroll?: number; tilesAt?: number; mapAt?: number; step?: number; mcpPill?: boolean; height?: number }> = ({ t, theme = 'light', pageStyle = 'recap', mobile, scroll = 0, tilesAt = -10, mapAt = -10, step = 0.12, mcpPill = true, height = 760 }) => {
  const c = siteColors(theme);
  const W0 = mobile ? 390 : 1200;
  const pad = mobile ? 22 : 56;
  return (
    <div style={{ width: W0, height, overflow: 'hidden', background: c.bg, position: 'relative', fontFamily: SANS }}>
      <div style={{ transform: `translateY(${-scroll}px)` }}>
        {mobile ? <div style={{ height: 44 }} /> : null}
        <div style={{ height: mobile ? 56 : 66, display: 'flex', alignItems: 'center', gap: 28, padding: `0 ${pad}px`, borderBottom: `1px solid ${c.line}` }}>
          <div style={{ fontWeight: 700, fontSize: mobile ? 16 : 19, color: c.ink, letterSpacing: '-0.02em' }}>Harbor Summit 2026</div>
          {!mobile ? ['Sessions', 'Speakers', 'Topics', 'Debates'].map((x) => <div key={x} style={{ fontSize: 17, color: c.ink2 }}>{x}</div>) : <div style={{ marginLeft: 'auto', fontSize: 22, color: c.ink }}>≡</div>}
        </div>
        <div style={{ padding: `${mobile ? 28 : 54}px ${pad}px ${mobile ? 20 : 34}px` }}>
          <div style={label({ fontSize: mobile ? 13 : 16, color: c.ink2 })}>Event recap</div>
          <div style={serif({ fontSize: mobile ? 46 : 82, color: c.ink, lineHeight: 1.02, marginTop: 6 })}>Harbor Summit 2026</div>
          <div style={{ fontSize: mobile ? 15 : 22, color: c.ink2, marginTop: 10 }}>38 sessions · 12 speakers · 3 days</div>
          {mcpPill ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: mobile ? 16 : 22, background: theme === 'terminal' ? '#24211E' : 'rgba(255,255,255,0.8)', border: `1px solid ${c.line}`, borderRadius: 99, padding: mobile ? '6px 12px' : '8px 16px', fontWeight: 600, fontSize: mobile ? 13 : 16, color: c.ink }}>Continue in RecapHub MCP →</div>
          ) : null}
        </div>
        {/* sessions, presented per page style */}
        <div style={{ padding: `0 ${pad}px` }}>
          <div style={{ fontWeight: 600, fontSize: mobile ? 20 : 28, color: c.ink, letterSpacing: '-0.02em', marginBottom: 16 }}>Sessions</div>
          {mobile || pageStyle === 'digest' ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {SITE_SESSIONS.slice(0, mobile ? 4 : 6).map((s, i) => (
                <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: mobile ? 12 : 22, padding: mobile ? '12px 0' : '14px 0', borderTop: `1px solid ${c.line}` }}>
                  <div style={{ fontFamily: MONO, fontSize: mobile ? 14 : 20, color: c.accent, width: mobile ? 22 : 34 }}>{String(i + 1).padStart(2, '0')}</div>
                  {mobile ? <div style={{ width: 72, height: 44, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}><Footage t={t} w={72} h={44} crop={s.crop} speaker={s.who} /></div> : null}
                  <div style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: mobile ? 15 : 22, color: c.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: mobile ? 12 : 17, color: c.ink2 }}>{s.d}</div>
                </div>
              ))}
            </div>
          ) : pageStyle === 'spotlight' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {SITE_SESSIONS.slice(0, 2).map((s, i) => (
                <div key={s.title} style={{ display: 'flex', flexDirection: i % 2 ? 'row-reverse' : 'row', gap: 30, alignItems: 'center' }}>
                  <div style={{ borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}><Footage t={t} w={520} h={292} crop={s.crop} speaker={s.who} /></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 30, color: c.ink, letterSpacing: '-0.02em' }}>{s.title}</div>
                    <div style={serif({ fontSize: 30, color: c.ink2, marginTop: 10, lineHeight: 1.25 })}>“{s.quote}”</div>
                    <div style={{ fontFamily: MONO, fontSize: 16, color: c.ink2, marginTop: 12 }}>{s.d} · summary · quotes</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 22 }}>
              <div style={{ width: 560, borderRadius: 16, overflow: 'hidden', background: c.surf, border: `1px solid ${c.line}`, flexShrink: 0 }}>
                <Footage t={t} w={560} h={315} crop={0.5} />
                <div style={{ padding: '14px 18px', fontWeight: 600, fontSize: 22, color: c.ink }}>{SITE_SESSIONS[0].title}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, flex: 1 }}>
                {SITE_SESSIONS.slice(1, 5).map((s) => (
                  <div key={s.title} style={{ borderRadius: 12, overflow: 'hidden', background: c.surf, border: `1px solid ${c.line}` }}>
                    <Footage t={t} w={270} h={110} crop={s.crop} speaker={s.who} />
                    <div style={{ padding: '8px 12px', fontWeight: 600, fontSize: 16, color: c.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {!mobile ? (
          <>
            <div style={{ padding: `48px ${pad}px 0` }}>
              <div style={{ fontWeight: 600, fontSize: 28, color: c.ink, letterSpacing: '-0.02em', marginBottom: 16 }}>Topics and sessions</div>
              <Treemap t={t} at={tilesAt} step={step} theme={theme} />
            </div>
            <div style={{ padding: `48px ${pad}px 60px` }}>
              <div style={{ fontWeight: 600, fontSize: 28, color: c.ink, letterSpacing: '-0.02em', marginBottom: 16 }}>What was argued</div>
              <DebateMap t={t} at={mapAt} step={step * 2} theme={theme} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

/** A session page on the published site: the video with its caption line, and the transcript. Base 1200 x 760. */
export const SessionPage: React.FC<{ t: number; caption: string; theme?: SiteTheme; focus?: number }> = ({ t, caption, theme = 'light', focus = 1 }) => {
  const c = siteColors(theme);
  const lines = [
    { s: 0, tc: '18:31', text: 'We ran the pilot with three suppliers.' },
    { s: 0, tc: '18:40', text: caption },
    { s: 1, tc: '18:52', text: 'Which is exactly why we bought first.' },
  ];
  return (
    <div style={{ width: 1200, height: 760, background: c.bg, fontFamily: SANS, padding: '34px 50px', boxSizing: 'border-box', display: 'flex', gap: 36 }}>
      <div style={{ width: 700 }}>
        <div style={label({ fontSize: 15, color: c.ink2 })}>Session · Day 2</div>
        <div style={{ fontWeight: 600, fontSize: 36, color: c.ink, letterSpacing: '-0.025em', marginTop: 6 }}>Pilot results</div>
        <div style={{ marginTop: 20, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
          <Footage t={t} w={700} h={394} crop={0.5} />
          <div style={abs(0, 320, { width: 700, display: 'flex', justifyContent: 'center' })}>
            <div style={{ background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: 24, borderRadius: 8, padding: '6px 14px' }}>{caption}</div>
          </div>
          <div style={abs(0, 386, { width: 700 * 0.42, height: 8, background: R.brand })} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          {['Summary', 'Key quotes', 'Chapters', 'Transcript'].map((x, i) => <div key={x} style={{ fontSize: 17, fontWeight: 500, color: i === 3 ? c.bg : c.ink2, background: i === 3 ? c.ink : c.soft, borderRadius: 99, padding: '8px 16px' }}>{x}</div>)}
        </div>
      </div>
      <div style={{ flex: 1, background: c.surf, border: `1px solid ${c.line}`, borderRadius: 18, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, alignSelf: 'flex-start', marginTop: 90 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 12px', margin: '-10px -12px', borderRadius: 12, background: i === focus ? (theme === 'terminal' ? '#24304F' : R.brand50) : 'transparent' }}>
            <Avatar s={SPEAKERS[l.s]} size={42} edge={c.surf} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, color: c.ink }}>
                {SPEAKERS[l.s].name} <span style={{ fontFamily: MONO, fontWeight: 400, color: c.ink2, marginLeft: 6 }}>{l.tc}</span>
              </div>
              <div style={{ fontSize: 20, color: c.ink2, marginTop: 4, lineHeight: 1.35 }}>{l.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ClipPoster, card, pill, SHADOW };
