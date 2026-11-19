/* "Ask your event anything with MCP": educative story, ~56 s, 128 BPM.
 * Monday 9:02, the CEO asks for the top 3 debates of day 2; 31 hours of video, 58 minutes.
 * Three steps, each on the real product: 01 the MCP connect dialog, 02 the workspace assistant answering,
 * 03 the debate panel with each speaker's stance and "Watch the session". 9:06: the answer goes back.
 * Maya and Dana are fictional; the debates named in her reply are the ones on the real debate panel. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, Chip, Dark, EndCard, Eyebrow, FilmDef, Flash, Head, Lift, Light, Media, OUTFIT, Pill, Pop, Region, SHADOW, SHADOW_DEEP, ShotCtx, Swap, W, focus, lerp, spr, INOUT } from '../kit';
import { REELS, shot } from '../assets';

const Step: React.FC<{ t: number; n: string; text: string }> = ({ t, n, text }) => (
  <div style={{ position: 'absolute', left: 0, width: W, top: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
    <Pop t={t} at={0.05}><Chip tone="violet" size={1}>STEP {n}</Chip></Pop>
    <Head t={t} at={0.15} text={text} size={64} color={C.ink} accent={C.violet} align="center" />
  </div>
);

const Note: React.FC<{ who: string; time: string; text: string; me?: boolean; w?: number }> = ({ who, time, text, me, w = 760 }) => (
  <div style={{ width: w, borderRadius: 28, background: me ? 'rgba(91,61,245,0.92)' : 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(20px)', padding: '26px 30px', boxSizing: 'border-box', fontFamily: OUTFIT, color: '#fff', boxShadow: SHADOW_DEEP }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 23, background: me ? '#fff' : '#E9E4FF', color: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>{who.slice(0, 2).toUpperCase()}</div>
      <div style={{ fontWeight: 600, fontSize: 24, flex: 1 }}>{who}</div>
      <div style={{ fontSize: 20, opacity: 0.7 }}>{time}</div>
    </div>
    <div style={{ fontSize: 28, lineHeight: 1.35, marginTop: 14, whiteSpace: 'pre-line' }}>{text}</div>
  </div>
);

const Ask = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Dark t={t} />
    <div style={{ position: 'absolute', left: 140, top: 120 }}>
      <Eyebrow color="#A9A3D6" size={1.2}>Monday · 9:02 AM</Eyebrow>
    </div>
    <div style={{ position: 'absolute', left: 1040, top: 140 + (1 - spr(t, B(0.5), 15)) * -300, opacity: Math.min(1, spr(t, B(0.5), 15) * 1.5) }}>
      <Note who="Dana · CEO" time="now" text={'Board call at 10.\nWhat were the top 3 debates on day 2?'} />
    </div>
    <div style={{ position: 'absolute', left: 140, top: 520 }}>
      <Head t={t} at={B(2)} text={'“What were the top 3\ndebates on *day 2?*”'} size={104} accent={C.violetSoft} />
    </div>
  </AbsoluteFill>
);

const FACES = [...REELS.kayan, ...REELS.raise, ...REELS.bnp, ...REELS.other];
const Hours = ({ t, B }: ShotCtx) => {
  const left = 58 * 60 - Math.floor(Math.max(0, t - B(6)) / B(1)) * 9;
  return (
    <AbsoluteFill>
      <Dark t={t} />
      <Cam t={t} keys={[{ t: 0, s: 1, x: 0, y: 0 }, { t: B(12), s: 1.03, x: 0, y: 0 }, { t: B(14), ...focus(960, 540, 6), ease: 'in' }]}>
        <div style={{ position: 'absolute', left: -60, top: -40, width: 2100, display: 'flex', flexWrap: 'wrap', gap: 14, opacity: 0.28, transform: `translateY(${-t * 10}px)` }}>
          {[...FACES, ...FACES].slice(0, 30).map((f, i) => (
            <div key={i} style={{ width: 196, height: 348, borderRadius: 14, overflow: 'hidden' }}>
              <Media file={`reels/${f}.jpg`} w={196} h={348} />
            </div>
          ))}
        </div>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 40% 50%, rgba(8,7,15,0.5) 0%, rgba(8,7,15,0.9) 75%)' }} />
        <div style={{ position: 'absolute', left: 140, top: 330, width: 1600, height: 320 }}>
          <Swap t={t} at={0.1} swapAt={B(6)} from={'Day 2: 14 sessions.\n~31~ ~hours~ ~of~ ~video.~'} to={'She had\n*58 minutes.*'} size={120} accent={C.violetSoft} style={{ width: 1600, height: 300 }} />
        </div>
        <div style={{ position: 'absolute', left: 140, top: 720 }}>
          <Pop t={t} at={B(6.5)}>
            <Pill size={1} bg="rgba(255,255,255,0.12)" color="#fff" style={{ boxShadow: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
              ⏱ <span style={{ fontVariantNumeric: 'tabular-nums' }}>{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</span> until the board call
            </Pill>
          </Pop>
        </div>
      </Cam>
      <Flash t={t} at={B(13.6)} dur={0.5} />
    </AbsoluteFill>
  );
};

const DLG = shot('mcp-event');
const Connect = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Step t={t} n="01" text="Connect RecapHub *once.*" />
    <Pop t={t} at={B(0.6)} style={{ position: 'absolute', left: 560, top: 200 }}>
      <Region file={DLG.file} sw={DLG.sw} sh={DLG.sh} rect={[928, 493, 1024, 1011]} box={[0, 0, 800, 790]} radius={22} shadow={SHADOW} style={{ transform: `scale(${1 + lerp(t, B(1), B(14), 0, 0.06)})` }} />
    </Pop>
  </AbsoluteFill>
);

const CHAT = shot('chat-thread');
const AskIt = ({ t, B }: ShotCtx) => {
  const p = lerp(t, B(4), B(7), 0, 1, INOUT);
  return (
    <AbsoluteFill>
      <Light t={t} />
      <Step t={t} n="02" text="Ask in *plain words.*" />
      <Region file={CHAT.file} sw={CHAT.sw} sh={CHAT.sh} rect={[1020, 160, 610, 120]} box={[560, 380, 800, 157]} toRect={[0, 100, 1700, 1000]} toBox={[290, 210, 1340, 788]} p={p} radius={22 - 4 * p} shadow={SHADOW} style={{ background: '#fafafa' }} />
    </AbsoluteFill>
  );
};

const Q = shot('mindmap-question');
const Source = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Light t={t} />
    <Step t={t} n="03" text="Every answer, *with its source.*" />
    <Lift file={Q.file} sw={Q.sw} sh={Q.sh} box={[240, 200, 1440, 900]} el={[770, 1040, 1360, 760]} p={lerp(t, B(1.5), B(3.5), 0, 1, INOUT)} scale={1.3} dy={-300} blur={6} />
    <div style={{ position: 'absolute', left: 1470, top: 520 }}>
      <Pop t={t} at={B(6)}>
        <Chip tone="violet" size={1.3}>▶ Watch the session</Chip>
      </Pop>
    </div>
  </AbsoluteFill>
);

const Reply = ({ t, B }: ShotCtx) => (
  <AbsoluteFill>
    <Dark t={t} />
    <div style={{ position: 'absolute', left: 140, top: 120 }}>
      <Eyebrow color="#A9A3D6" size={1.2}>Monday · 9:06 AM</Eyebrow>
    </div>
    <div style={{ position: 'absolute', left: 1000, top: 150, opacity: 0.55 }}>
      <Note who="Dana · CEO" time="9:02" text={'Board call at 10.\nWhat were the top 3 debates on day 2?'} w={800} />
    </div>
    <div style={{ position: 'absolute', left: 1000, top: 400 + (1 - spr(t, B(1), 15)) * 200, opacity: Math.min(1, spr(t, B(1), 15) * 1.5) }}>
      <Note me who="Maya" time="9:06" w={800} text={'1. Should products ship locked down?\n2. Who owns security in a product team?\n3. Should software makers be liable for breaches?\nQuotes and sessions attached.'} />
    </div>
    <div style={{ position: 'absolute', left: 140, top: 420 }}>
      <Head t={t} at={B(4)} text="*9:06.*" size={170} accent={C.violetSoft} />
      <Head t={t} at={B(6)} text="Four minutes." size={110} />
    </div>
  </AbsoluteFill>
);

const SUG = shot('suggestions');
const Recap = ({ t, B }: ShotCtx) => {
  const el = SUG.el;
  return (
    <AbsoluteFill>
      <Dark t={t} tint={1.2} />
      <div style={{ position: 'absolute', left: 0, width: W, top: 170 }}>
        <Head t={t} at={B(0.3)} text="Ask your event *anything.*" size={124} accent={C.violetSoft} align="center" />
      </div>
      <div style={{ position: 'absolute', left: 0, width: W, top: 430, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {['01 Connect', '02 Ask', '03 Check the source'].map((s, i) => (
          <Pop key={s} t={t} at={B(2 + i)}>
            <Pill size={1} bg="rgba(255,255,255,0.12)" color="#fff" style={{ boxShadow: 'none', border: '1px solid rgba(255,255,255,0.22)' }}>{s}</Pill>
          </Pop>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 960 - 560, top: 640 }}>
        <Pop t={t} at={B(6)}>
          <Region file={SUG.file} sw={SUG.sw} sh={SUG.sh} rect={el} box={[0, 0, 1120, (1120 * el[3]) / el[2]]} radius={18} shadow={SHADOW_DEEP} />
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

export const storyFilm: FilmDef = {
  bpm: 128,
  music: 'music/story.wav',
  tail: 1.6,
  shots: [
    { from: 0, to: 10, render: Ask, name: 'ask' },
    { from: 10, to: 24, render: Hours, name: 'hours' },
    { from: 24, to: 38, render: Connect, name: 'connect' },
    { from: 38, to: 54, render: AskIt, name: 'askit' },
    { from: 54, to: 70, render: Source, name: 'source' },
    { from: 70, to: 84, render: Reply, name: 'reply' },
    { from: 84, to: 104, render: Recap, name: 'recap' },
    { from: 104, to: 112, render: ({ t }) => <EndCard t={t} line="Your conference, inside Claude." />, name: 'end' },
  ],
  sfx: [
    { at: 0.5, src: 'ding', vol: 0.3 },
    { at: 22.8, src: 'whoosh', vol: 0.4 },
    { at: 25.5, src: 'pop', vol: 0.2 },
    { at: 42, src: 'whoosh', vol: 0.2 },
    { at: 55.5, src: 'pop', vol: 0.2 },
    { at: 71, src: 'switch', vol: 0.35 },
    { at: 86, src: 'pop', vol: 0.2 },
    { at: 87, src: 'pop', vol: 0.2 },
    { at: 88, src: 'pop', vol: 0.2 },
    { at: 104, src: 'page-turn', vol: 0.35 },
  ],
};
