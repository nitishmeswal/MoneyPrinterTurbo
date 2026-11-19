/* Published Recap Pages, ~36 s, 130 BPM. "Page builds itself" film.
 * Real recaphub_3.0 captures, stacked as the real page and scrolled in a browser: the hero, "The event at a
 * glance", the topic maps, the speakers. Then the theme gallery (a dark theme lifts off it when clicked), the
 * phone layouts, publishing, and the one link. Music: stabs 0 / 2 / 4, build 8, drop 54 (link), end 70. */
import React from 'react';
import { Browser, Cursor, EIO, FilmDef, INOUT, Lift, Phone, Region, Rise, focus, keys, lerp } from '../kit';
import { UI } from '../brand';
import { LinkBox, PublishDialog, Toast, Z } from '../ui';
import { Label, Scene, Top, chain, end, endSfx, title, titleSfx } from '../shots';
import { BOX, cap } from '../assets';

const PAGE = ['hero', 'recap-insights', 'topicmaps', 'speakers'].map(cap);
const BW = 1500;
const kx = BW / 2880;
const tops = PAGE.reduce<number[]>((a, p, i) => [...a, i ? a[i - 1] + PAGE[i - 1].sh * kx : 0], []);
const THEMES = cap('themes');
const tk = 1100 / THEMES.sw;
const scholar = [160 + (BOX.themeScholar[0] + BOX.themeScholar[2] / 2) * tk, 140 + (BOX.themeScholar[1] + BOX.themeScholar[3] / 2) * tk];

export const pagesFilm: FilmDef = {
  id: 'Pages',
  bpm: 130,
  music: 'music/pages.wav',
  tail: 1,
  shots: chain([
    {
      len: 8, name: 'one-link',
      render: title({ text: 'Every session.\nEvery debate.\n[One link.]', size: 132, gy: -520, track: 100 }),
      sfx: (B) => [[B(0.2), 'whoosh-soft', 0.32], [B(1.5), 'snap', 0.3]],
    },
    {
      len: 14, name: 'scroll',
      render: (c) => {
        const { t, B } = c;
        const y = keys(t, [[B(3), 0], [B(5.5), -tops[1], EIO], [B(8.5), -tops[2], EIO], [B(11.5), -tops[3] + 80, EIO]]);
        return (
          <Scene c={c} tin="wipe" cam={[{ t: 0, s: 1 }, { t: c.dur, s: 1.03, ease: INOUT }]}>
            <div style={{ position: 'absolute', left: 210, top: 100 }}>
              <Rise t={t} at={B(0.2)} y={160} s={0.92} spring="soft">
                <Browser w={BW} h={900} url="recaphub.co/northwind-summit-2026" font={UI}>
                  <div style={{ position: 'absolute', left: 0, top: y, width: BW }}>
                    {PAGE.map((p, i) => <Region key={i} file={p.file} sw={p.sw} sh={p.sh} rect={[0, 0, p.sw, p.sh]} box={[0, tops[i], BW, p.sh * kx]} />)}
                  </div>
                </Browser>
              </Rise>
            </div>
            <Label t={t} at={B(1.2)} out={B(4.6)} x={120} y={880}>The event page</Label>
            <Label t={t} at={B(5.6)} out={B(8.2)} x={120} y={880}>The event at a glance</Label>
            <Label t={t} at={B(8.6)} out={B(11.2)} x={120} y={880}>What was argued</Label>
            <Label t={t} at={B(11.6)} x={120} y={880}>Every speaker</Label>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], [B(0.2), 'whoosh-soft', 0.3], [B(1.2), 'pop-soft', 0.3], [B(3), 'page', 0.3], [B(5.6), 'pop-soft', 0.25], [B(6), 'page', 0.3], [B(8.6), 'pop-soft', 0.25], [B(9), 'page', 0.3], [B(11.6), 'pop-soft', 0.25]],
    },
    {
      len: 10, name: 'themes',
      render: (c) => {
        const { t, B } = c;
        const p = lerp(t, B(3.4), B(4.6), 0, 1, EIO);
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: c.dur, ...focus(1000, 560, 1.04), ease: INOUT }]}>
            <Rise t={t} at={B(0.2)} y={140} spring="soft" style={{ position: 'absolute', inset: 0 }}>
              <Lift file={THEMES.file} sw={THEMES.sw} sh={THEMES.sh} box={[160, 140, 1100, 840]} el={BOX.themeScholar} p={p} scale={2} dx={-80} dy={-40} />
            </Rise>
            <div style={{ position: 'absolute', left: 1330, top: 330 }}><HeadP t={t} at={B(0.6)} /></div>
            <Cursor t={t} path={[{ t: B(1.2), x: 1500, y: 1000 }, { t: B(3), x: scholar[0], y: scholar[1] }, { t: B(3.2), x: scholar[0], y: scholar[1], click: true }]} leave={B(3.6)} />
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], [B(0.2), 'whoosh-soft', 0.3], [B(3.2), 'click', 0.5], [B(3.4), 'whoosh-soft', 0.3]],
    },
    {
      len: 10, name: 'phones',
      render: (c) => {
        const { t, B } = c;
        const ph = ['mindmap-mobile', 'treemap-mobile'].map(cap);
        return (
          <Scene c={c} cam={[{ t: 0, s: 1.04 }, { t: c.dur, s: 1, ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text={'Reads well on\n*every phone.*'} size={100} x={140} y={360} />
            {ph.map((p, i) => (
              <div key={i} style={{ position: 'absolute', left: 1000 + i * 420, top: 110 + i * 60 }}>
                <Rise t={t} at={B(0.6 + i * 0.5)} y={500} r={i ? 6 : -6} s={0.9} spring="soft">
                  <div style={{ transform: `rotate(${i ? 3 : -3}deg)` }}>
                    <Phone w={330}><Region file={p.file} sw={p.sw} sh={p.sh} rect={[0, 0, p.sw, 1800]} box={[0, 0, 330, 690]} /></Phone>
                  </div>
                </Rise>
              </div>
            ))}
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.6), 'whoosh-soft', 0.3], [B(1.1), 'whoosh-soft', 0.3]],
    },
    {
      len: 12, name: 'publish',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} stage="paper-flip" cam={[{ t: 0, s: 1 }, { t: B(5), ...focus(1080, 600, 1.05), ease: INOUT }, { t: c.dur, ...focus(1000, 560, 1.02), ease: INOUT }]}>
            <Top t={t} at={B(0.3)} text="Publish in *one click.*" size={84} y={90} />
            <div style={{ position: 'absolute', left: 498, top: 300 }}>
              <Rise t={t} at={B(0.6)} y={120} spring="soft"><Z s={2.1}><PublishDialog t={t} selectAt={B(2)} pressAt={B(5)} /></Z></Rise>
            </div>
            <Cursor t={t} path={[{ t: B(1.4), x: 1500, y: 1000 }, { t: B(2), x: 760, y: 540, click: true }, { t: B(4.7), x: 1290, y: 782 }, { t: B(5), x: 1290, y: 782, click: true }, { t: B(7), x: 1400, y: 920 }]} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center' }}><Toast t={t} at={B(5.5)} text="Event page published" /></div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whip', 0.3], ...titleSfx()(B), [B(0.6), 'whoosh-soft', 0.3], [B(2), 'click', 0.5], [B(5), 'click', 0.55], [B(5.5), 'ding', 0.3]],
    },
    {
      len: 8, name: 'link',
      render: (c) => {
        const { t, B } = c;
        return (
          <Scene c={c} cam={[{ t: 0, s: 1.03 }, { t: c.dur, s: 1, ease: INOUT }]}>
            <Top t={t} at={B(0.2)} text="Share *one link.*" size={120} y={300} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
              <Rise t={t} at={B(0.1)} y={-200} s={0.85} spring="bouncy"><LinkBox url="recaphub.co/northwind-summit-2026" size={46} /></Rise>
            </div>
          </Scene>
        );
      },
      sfx: (B) => [[0, 'whoosh', 0.3], [B(0.1), 'impact', 0.35], [B(0.2), 'pop', 0.3]],
    },
    {
      len: 8, name: 'payoff',
      render: title({ text: 'Live before the\nroom [empties.]', stage: 'card-back', gx: -120, gy: -260, gw: 2300, size: 150, tin: 'wipe', push: 0.07 }),
      sfx: (B) => [[0, 'whoosh', 0.35], ...titleSfx(1.4)(B)],
    },
    { len: 8, name: 'end', render: end('Every session. One link.'), sfx: endSfx },
  ]),
};

const HeadP: React.FC<{ t: number; at: number }> = ({ t, at }) => <Top t={t} at={at} text={'Twenty themes.\n*Yours* in a click.'} size={74} x={0} y={0} />;
