/* RecapHub · "How to publish your event recap in 3 steps", ~51 s, educative,
 * guided tutorial: a step rail on top, numbered callouts on each control, the
 * live preview answering every choice.
 *   1 Pick a layout and style (layout, page style Recap/Spotlight/Digest, theme)
 *   2 Choose what to show (the published-page sections in Settings › Design)
 *   3 Publish and share (publish, copy the link, embed with an iframe)
 * Music: music-rh-publish.wav (compose.py publish), 112 BPM, E flat major. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import tlJson from './recaphub-publish.json';
import { Ctx, Cursor, CursorPt, Reveal, Timeline, TypeOn, WordPush, lerp, spr, INOUT } from './kit';
import { R, MONO, SANS, RING, Browser, Check, RecFill, abs, card, centerRow, hasRec, head, label, serif } from './rh';
import { Btn, EndCard, Film, Fit, PhoneFrame, RecapSite, SiteStyle, SiteTheme, Toast, Toggle, sfxKit } from './ui';

const tl = tlJson as Timeline;
const URL = 'recaphub.co/harbor-summit-2026';
const STEPS = ['Layout and style', 'What to show', 'Publish and share'];

const Rail: React.FC<{ t: number; active: number; done?: number }> = ({ t, active, done = active }) => (
  <div style={abs(110, 46, { display: 'flex', alignItems: 'center', gap: 18, opacity: lerp(t, 0, 0.3) })}>
    {STEPS.map((s, i) => {
      const isDone = i < done;
      const on = i === active;
      return (
        <React.Fragment key={s}>
          {i ? <div style={{ width: 70, height: 3, borderRadius: 2, background: i <= done ? R.brand : R.muted }} /> : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: isDone ? R.brand : on ? R.ink : '#fff', border: `2px solid ${isDone ? R.brand : on ? R.ink : R.muted}`, color: isDone || on ? '#fff' : R.ink3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 20 }}>{isDone ? <Check size={22} color="#fff" /> : i + 1}</div>
            <div style={{ fontFamily: SANS, fontWeight: on ? 600 : 500, fontSize: 22, color: on ? R.ink : R.ink2 }}>{s}</div>
          </div>
        </React.Fragment>
      );
    })}
  </div>
);

const StepTitle: React.FC<{ t: number; n: number; text: string }> = ({ t, n, text }) => (
  <div style={abs(110, 130)}>
    <Reveal t={t} at={0.1} y={16}>
      <div style={head(64, { fontWeight: 700, letterSpacing: '-0.04em' })}>
        <span style={{ color: R.brand }}>{n}.</span> {text}
      </div>
    </Reveal>
  </div>
);

/** A numbered callout that pops beside a control. */
const Callout: React.FC<{ t: number; at: number; until?: number; n: string; text: string; x: number; y: number; side?: 'left' | 'right' }> = ({ t, at, until = 999, n, text, x, y, side = 'right' }) => {
  const p = spr(t, at, 13);
  const q = lerp(t, until, until + 0.3);
  if (t < at) return null;
  return (
    <div style={abs(x, y, { transform: `translate(${side === 'left' ? '-100%' : '0'}, -50%) scale(${0.8 + 0.2 * p})`, transformOrigin: side === 'left' ? '100% 50%' : '0 50%', opacity: Math.min(1, p * 1.5) * (1 - q * 0.6), display: 'flex', alignItems: 'center', gap: 12, background: R.ink, color: '#fff', borderRadius: 99, padding: '10px 20px 10px 10px', fontFamily: SANS, fontWeight: 500, fontSize: 22, whiteSpace: 'nowrap', boxShadow: '0 14px 30px rgba(26,23,20,0.25)', zIndex: 10 })}>
      <span style={{ width: 34, height: 34, borderRadius: 17, background: R.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>{n}</span>
      {text}
    </div>
  );
};

const Choice: React.FC<{ on: boolean; title: string; desc?: string; w: number; h?: number; dark?: boolean }> = ({ on, title, desc, w, h = 96, dark }) => (
  <div style={{ width: w, height: h, boxSizing: 'border-box', borderRadius: 14, border: `${on ? 2 : 1}px solid ${on ? R.brand : R.border}`, background: dark ? '#121110' : on ? R.brand50 : '#fff', padding: '12px 16px' }}>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 21, color: dark ? '#EDEBE8' : on ? R.brand600 : R.ink }}>{title}</div>
    {desc ? <div style={{ fontFamily: SANS, fontSize: 15, color: dark ? '#A8A49D' : R.ink2, marginTop: 4, lineHeight: 1.3 }}>{desc}</div> : null}
  </div>
);

// ------------------------------------------------------------------ intro

const Intro = ({ t, B }: Ctx) => (
  <AbsoluteFill>
    <div style={centerRow(250)}>
      <WordPush t={t} style={head(130, { fontWeight: 700, letterSpacing: '-0.05em' })} words={[{ text: 'How', at: 0 }, { text: 'to', at: B(0.25) }, { text: 'publish', at: B(0.5) }]} />
    </div>
    <div style={centerRow(400)}>
      <WordPush t={t} style={head(130, { fontWeight: 700, letterSpacing: '-0.05em' })} words={[{ text: 'your', at: B(2) }, { text: 'event', at: B(2.25) }, { text: 'recap', at: B(2.5) }]} />
    </div>
    <div style={centerRow(560)}>
      <WordPush t={t} style={serif({ fontSize: 150, color: R.brand })} words={[{ text: 'in', at: B(4) }, { text: '3', at: B(4.25) }, { text: 'steps.', at: B(4.5) }]} />
    </div>
    <div style={centerRow(840, { gap: 30 })}>
      {STEPS.map((s, i) => (
        <Reveal key={s} t={t} at={B(5.5 + i * 0.5)} y={16} dur={0.35}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...card({ borderRadius: 99 }), padding: '12px 24px 12px 12px', fontFamily: SANS, fontWeight: 600, fontSize: 26, color: R.ink }}>
            <span style={{ width: 40, height: 40, borderRadius: 20, background: R.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{i + 1}</span>
            {s}
          </div>
        </Reveal>
      ))}
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ step 1: layout and style

const D = { x: 110, y: 240 }; // the dialog's top-left
const S1_AT = { layout: 3, style: 7, theme: 11 };
const S1_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(1.5), x: 900, y: 1040 },
  { t: B(2.8), x: D.x + 150, y: D.y + 150 },
  { t: B(S1_AT.layout), x: D.x + 150, y: D.y + 150, click: true },
  { t: B(6.8), x: D.x + 380, y: D.y + 330 },
  { t: B(S1_AT.style), x: D.x + 380, y: D.y + 330, click: true },
  { t: B(10.8), x: D.x + 380, y: D.y + 552 },
  { t: B(S1_AT.theme), x: D.x + 380, y: D.y + 552, click: true },
  { t: B(14), x: D.x + 1200, y: D.y + 400 },
  { t: B(18), x: D.x + 1300, y: D.y + 600 },
];

const Step1 = ({ t, B }: Ctx) => {
  const style: SiteStyle = t >= B(S1_AT.style) ? 'spotlight' : 'recap';
  const theme: SiteTheme = t >= B(S1_AT.theme) ? 'terminal' : 'light';
  const enter = spr(t, B(0.5), 15, 0.85);
  return (
    <AbsoluteFill>
      <Rail t={t} active={0} />
      <StepTitle t={t} n={1} text="Pick a layout and style." />
      <div style={abs(D.x, D.y + (1 - enter) * 400, { opacity: Math.min(1, enter * 1.5), ...card({ borderRadius: 24 }), width: 1700, height: 780, overflow: 'hidden' })}>
        {hasRec('publish-layout') ? <RecFill id="publish-layout" /> : (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ width: 640, padding: '30px 34px', boxSizing: 'border-box', borderRight: `1px solid ${R.border}` }}>
              <div style={label({ fontSize: 16 })}>Layout</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
                <Choice on={t >= B(S1_AT.layout)} title="Event" desc="The full recap page" w={280} />
                <Choice on={false} title="Quartz" desc="A compact overview" w={280} />
              </div>
              <div style={label({ fontSize: 16, marginTop: 30 })}>Page style</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                {[['Recap', 'A featured session, then a grid of session cards.'], ['Spotlight', 'Editorial rows: big thumbnail, summary and a quote per session.'], ['Digest', 'A numbered programme list, so long agendas read at a glance.']].map(([n, d]) => (
                  <Choice key={n} on={n.toLowerCase() === style} title={n} desc={d} w={572} h={84} />
                ))}
              </div>
              <div style={label({ fontSize: 16, marginTop: 30 })}>Theme</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
                <Choice on={theme === 'light'} title="Light" w={180} h={56} />
                <Choice on={theme === 'terminal'} title="Terminal" w={180} h={56} dark />
              </div>
            </div>
            <div style={{ flex: 1, background: R.subtle, padding: 30, boxSizing: 'border-box' }}>
              <div style={label({ fontSize: 16 })}>Live preview</div>
              <div style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden', border: `1px solid ${R.border}` }}>
                <Fit w={996} bw={1200} bh={790}>
                  <RecapSite t={t} pageStyle={style} theme={theme} height={790} />
                </Fit>
              </div>
            </div>
          </div>
        )}
      </div>
      {!hasRec('publish-layout') ? (
        <>
          <Callout t={t} at={B(S1_AT.layout + 0.2)} until={B(S1_AT.style - 0.5)} n="a" text="Event: the full recap page" x={D.x + 640} y={D.y + 130} />
          <Callout t={t} at={B(S1_AT.style + 0.2)} until={B(S1_AT.theme - 0.5)} n="b" text="Pick how sessions are laid out" x={D.x + 640} y={D.y + 330} />
          <Callout t={t} at={B(S1_AT.theme + 0.2)} n="c" text="Match your event’s look" x={D.x + 640} y={D.y + 552} />
          <Cursor t={t} path={S1_CURSOR(B)} ring={RING} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ step 2: what to show

const TOGGLES = [
  { k: 'Topics and sessions (treemap)', at: 3 },
  { k: 'What was argued (mind map)', at: 6 },
  { k: 'Speaker search in the treemap', at: 9 },
  { k: 'Continue in RecapHub MCP button', at: 12 },
];
const S2_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(1.5), x: 600, y: 1040 },
  ...TOGGLES.flatMap((g, i): CursorPt[] => [
    { t: B(g.at - 0.4), x: D.x + 560, y: D.y + 140 + i * 110 },
    { t: B(g.at), x: D.x + 560, y: D.y + 140 + i * 110, click: true },
  ]),
  { t: B(16), x: D.x + 900, y: D.y + 700 },
];

const Step2 = ({ t, B }: Ctx) => {
  const on = (i: number) => lerp(t, B(TOGGLES[i].at), B(TOGGLES[i].at) + 0.15);
  const scroll = t < B(4) ? 0 : t < B(7) ? lerp(t, B(4), B(5), 0, 800, INOUT) : t < B(12) ? 800 + lerp(t, B(7), B(8), 0, 380, INOUT) : 1180 - lerp(t, B(12), B(13), 0, 1180, INOUT);
  return (
    <AbsoluteFill>
      <Rail t={t} active={1} />
      <StepTitle t={t} n={2} text="Choose what to show." />
      <div style={abs(D.x, D.y, { ...card({ borderRadius: 24 }), width: 1700, height: 780, overflow: 'hidden' })}>
        {hasRec('publish-design') ? <RecFill id="publish-design" /> : (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ width: 640, padding: '30px 34px', boxSizing: 'border-box', borderRight: `1px solid ${R.border}` }}>
              <div style={{ fontFamily: SANS, fontSize: 18, color: R.ink2 }}>Settings › <span style={{ color: R.ink, fontWeight: 600 }}>Design</span></div>
              {TOGGLES.map((g, i) => (
                <div key={g.k} style={abs(34, 112 + i * 110, { width: 572, height: 90, display: 'flex', alignItems: 'center', gap: 16, borderBottom: `1px solid ${R.subtle}` })}>
                  <div style={{ flex: 1, fontFamily: SANS, fontWeight: 500, fontSize: 22, color: R.ink }}>{g.k}</div>
                  <Toggle on={on(i)} />
                </div>
              ))}
            </div>
            <div style={{ flex: 1, background: R.subtle, padding: 30, boxSizing: 'border-box' }}>
              <div style={label({ fontSize: 16 })}>Live preview</div>
              <div style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden', border: `1px solid ${R.border}`, position: 'relative' }}>
                <Fit w={996} bw={1200} bh={790}>
                  <div style={{ position: 'relative' }}>
                    <RecapSite t={t} scroll={scroll} tilesAt={on(0) > 0 ? B(TOGGLES[0].at) : 999} mapAt={on(1) > 0 ? B(TOGGLES[1].at) : 999} step={0.2} mcpPill={on(3) > 0.5} height={790} />
                  </div>
                </Fit>
              </div>
            </div>
          </div>
        )}
      </div>
      {!hasRec('publish-design') ? (
        <>
          {TOGGLES.map((g, i) => (
            <Callout key={g.k} t={t} at={B(g.at + 0.2)} until={B((TOGGLES[i + 1]?.at ?? 99) - 0.4)} n={String.fromCharCode(97 + i)} text={['Sessions sized by topic', 'The debates, with stances', 'Find a speaker fast', 'Send readers to Claude'][i]} x={D.x + 640} y={D.y + 157 + i * 110} />
          ))}
          <Cursor t={t} path={S2_CURSOR(B)} ring={RING} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ step 3: publish and share

const S3 = { publish: 2, copy: 6, embed: 10, copyCode: 13 };
const S3_CURSOR = (B: (n: number) => number): CursorPt[] => [
  { t: B(0.8), x: 900, y: 1040 },
  { t: B(1.8), x: 960, y: D.y + 230 },
  { t: B(S3.publish), x: 960, y: D.y + 230, click: true },
  { t: B(5.8), x: 1340, y: D.y + 380 },
  { t: B(S3.copy), x: 1340, y: D.y + 380, click: true },
  { t: B(9.8), x: 860, y: D.y + 480 },
  { t: B(S3.embed), x: 860, y: D.y + 480, click: true },
  { t: B(12.8), x: 1340, y: D.y + 600 },
  { t: B(S3.copyCode), x: 1340, y: D.y + 600, click: true },
  { t: B(16), x: 1500, y: 1000 },
];

const Step3 = ({ t, B }: Ctx) => {
  const live = t >= B(S3.publish);
  const embed = t >= B(S3.embed);
  return (
    <AbsoluteFill>
      <Rail t={t} active={2} />
      <StepTitle t={t} n={3} text="Publish and share." />
      <div style={abs(460, D.y, { ...card({ borderRadius: 24 }), width: 1000, height: 720, padding: '36px 44px', boxSizing: 'border-box' })}>
        {hasRec('publish-share') ? <RecFill id="publish-share" /> : (
          <>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: R.ink, letterSpacing: '-0.02em' }}>{live ? 'Your recap is live' : 'Ready to publish'}</div>
            <div style={{ fontFamily: SANS, fontSize: 21, color: R.ink2, marginTop: 6 }}>Harbor Summit 2026 · Event layout · Spotlight · Terminal</div>
            <div style={abs(44, 200)}>
              {live ? (
                <Btn primary size={24} style={{ background: R.success, transform: `scale(${0.9 + 0.1 * spr(t, B(S3.publish), 12)})` }}>
                  <Check size={22} color="#fff" /> Published
                </Btn>
              ) : (
                <Btn primary size={24} pressed={t >= B(S3.publish) - 0.1}>Publish recap</Btn>
              )}
            </div>
            <div style={abs(44, 300, { opacity: lerp(t, B(S3.publish + 0.5), B(S3.publish + 1)) })}>
              <div style={label({ fontSize: 15 })}>Link</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <div style={{ width: 700, fontFamily: MONO, fontSize: 22, color: R.ink, background: R.subtle, borderRadius: 12, padding: '16px 18px' }}>{URL}</div>
                <Btn size={20}>{t >= B(S3.copy) ? 'Copied' : 'Copy link'}</Btn>
              </div>
            </div>
            <div style={abs(44, 440, { opacity: lerp(t, B(S3.publish + 1), B(S3.publish + 1.5)), display: 'flex', gap: 10 })}>
              {['Share', 'Embed'].map((x, i) => (
                <div key={x} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: (i === 1) === embed ? '#fff' : R.ink, background: (i === 1) === embed ? R.ink : R.subtle, borderRadius: 10, padding: '10px 18px' }}>{x}</div>
              ))}
            </div>
            {embed ? (
              <div style={abs(44, 520, { display: 'flex', gap: 12, alignItems: 'flex-start' })}>
                <div style={{ width: 700, fontFamily: MONO, fontSize: 19, color: '#E8E6E3', background: R.ink, borderRadius: 12, padding: '16px 18px', lineHeight: 1.5 }}>
                  <TypeOn t={t} at={B(S3.embed + 0.2)} cps={80} caret={false} style={{ whiteSpace: 'normal' }} parts={[{ text: `<iframe src="https://${URL}" width="100%" height="900"></iframe>` }]} />
                </div>
                <Btn size={20}>{t >= B(S3.copyCode) ? 'Copied' : 'Copy code'}</Btn>
              </div>
            ) : null}
          </>
        )}
      </div>
      <Toast t={t} at={B(S3.copy + 0.2)} until={B(S3.embed - 0.5)} text="Link copied" icon={<Check size={22} color="#fff" />} y={1000} />
      <Toast t={t} at={B(S3.copyCode + 0.2)} text="Embed code copied" icon={<Check size={22} color="#fff" />} y={1000} />
      {!hasRec('publish-share') ? (
        <>
          <Callout t={t} at={B(S3.publish + 0.3)} until={B(S3.copy - 0.3)} n="a" text="One click: it’s live" x={1480} y={D.y + 230} />
          <Callout t={t} at={B(S3.copy + 0.3)} until={B(S3.embed - 0.3)} n="b" text="Send the link anywhere" x={1480} y={D.y + 380} />
          <Callout t={t} at={B(S3.copyCode + 0.3)} n="c" text="Or embed it on your site" x={1480} y={D.y + 600} />
          <Cursor t={t} path={S3_CURSOR(B)} ring={RING} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ recap of the three steps

const Recap = ({ t, B }: Ctx) => {
  const ph = spr(t, B(3), 14, 0.85);
  return (
    <AbsoluteFill>
      <Rail t={t} active={3} done={3} />
      <div style={abs(110, 200, { width: 660 })}>
        <Reveal t={t} at={0} y={18}>
          <div style={head(84, { fontWeight: 700, letterSpacing: '-0.045em' })}>That’s it.</div>
        </Reveal>
        <Reveal t={t} at={B(0.5)} y={18}>
          <div style={serif({ fontSize: 84, color: R.ink, marginTop: 4 })}>Your recap is live.</div>
        </Reveal>
        {STEPS.map((s, i) => (
          <Reveal key={s} t={t} at={B(1.5 + i * 0.75)} y={14} dur={0.3}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: i ? 18 : 50, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: R.ink }}>
              <span style={{ width: 46, height: 46, borderRadius: 23, background: R.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={24} color="#fff" /></span>
              {s}
            </div>
          </Reveal>
        ))}
      </div>
      <div style={abs(820, 200, { opacity: spr(t, B(1), 14) })}>
        <Browser w={980} h={640} url={URL}>
          <Fit w={980} bw={1200} bh={712}>
            <RecapSite t={t} pageStyle="spotlight" theme="terminal" scroll={lerp(t, B(5), B(14), 0, 500, INOUT)} height={712} />
          </Fit>
        </Browser>
      </div>
      <div style={abs(1560, 380 + (1 - ph) * 600, { transform: `rotate(${4 - 4 * ph}deg)` })}>
        <PhoneFrame w={300} dark>
          <Fit w={282} bw={390} bh={850}>
            <RecapSite t={t} mobile theme="terminal" scroll={lerp(t, B(6), B(14), 0, 260, INOUT)} height={850} />
          </Fit>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};

const End = ({ t, B }: Ctx) => <EndCard t={t} B={B} line="Publish your event recap in 3 steps." />;

const RENDER: Record<string, (c: Ctx) => React.ReactNode> = { intro: Intro, step1: Step1, step2: Step2, step3: Step3, recap: Recap, end: End };

const { at: sAt, clicks } = sfxKit(tl);
const SFX = [
  ...[5.5, 6, 6.5].map((b) => ({ at: sAt('intro', b), src: 'pop' as const, vol: 0.2 })),
  ...clicks('step1', S1_CURSOR),
  ...clicks('step2', S2_CURSOR),
  ...TOGGLES.map((g) => ({ at: sAt('step2', g.at), src: 'switch' as const, vol: 0.22 })),
  ...clicks('step3', S3_CURSOR),
  { at: sAt('step3', S3.publish + 0.2), src: 'ding' as const, vol: 0.22 },
  ...[1.5, 2.25, 3].map((b) => ({ at: sAt('recap', b), src: 'pop' as const, vol: 0.2 })),
  { at: sAt('end', 3), src: 'ding' as const, vol: 0.22 },
];

export const RecapHubPublish: React.FC = () => <Film tl={tl} render={RENDER} sfx={SFX} />;
export const publishTimeline = tl;
