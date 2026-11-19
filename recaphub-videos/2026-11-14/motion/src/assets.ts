/* Every real asset the films use, with its pixel size.
 *  shots/    real recaphub_3.0 components captured from the built Storybook at 2x (capture/capture.cjs),
 *            plus the marketing site's product screenshots (*-1600.webp)
 *  demos/    real product screen recordings from the marketing site (1440 wide)
 *  footage/  real stage footage (panel = the Bits & Pretzels panel from the OBS recording, humanx-stage, speaker-europe)
 *  reels/    real RecapHub vertical clips (540 x 960, captions burnt in by RecapHub) */
import boxes from './shots.json';
import type { Rect } from './kit';

type Box = { w: number; h: number; el: number[] };
const B = boxes as unknown as Record<string, Box>;

export const shot = (name: string) => ({ file: `shots/${name}.png`, sw: B[name].w, sh: B[name].h, el: B[name].el as Rect });

export const SCREEN = {
  dashboard: { file: 'shots/event-dashboard-1600.webp', sw: 1600, sh: 864 },
  knowledge: { file: 'shots/knowledge-hub-1600.webp', sw: 1600, sh: 911 },
  wefHome: { file: 'shots/recap-home-wef-1600.webp', sw: 1600, sh: 834 },
  wefPage: { file: 'shots/recap-page-wef-1600.webp', sw: 1600, sh: 1100 },
  wefSession: { file: 'shots/recap-session-wef-1600.webp', sw: 1600, sh: 834 },
  wefSessions: { file: 'shots/session-list-1600.webp', sw: 1600, sh: 948 },
};

export const DEMO = {
  clipAgent: { file: 'demos/clip-agent.mp4', sw: 1440, sh: 810, dur: 8.1 },
  clipQc: { file: 'demos/clip-studio-qc.mp4', sw: 1440, sh: 952, dur: 12.27 },
  liveIngest: { file: 'demos/live-ingest.mp4', sw: 1440, sh: 952, dur: 8 },
  plugAv: { file: 'demos/plug-into-av.mp4', sw: 1440, sh: 900, dur: 4.23 },
  recapReport: { file: 'demos/recap-report.mp4', sw: 1440, sh: 810, dur: 6.7 },
};

export const FOOT = {
  panel: { file: 'footage/panel.mp4', sw: 1920, sh: 1080, dur: 4.2 },
  humanx: { file: 'footage/humanx-stage.mp4', sw: 1920, sh: 1080, dur: 14 },
  europe: { file: 'footage/speaker-europe.mp4', sw: 1920, sh: 1080, dur: 8 },
};

export const REEL = (name: string) => `reels/${name}.mp4`;
export const REELS = {
  bnp: ['bnp-jordi-romero', 'bnp-johannes-reck', 'bnp-robert-lacher', 'bnp-jan-reichelt', 'bnp-patrick-andrae'],
  raise: ['raise-mark-cuban', 'raise-yann-lecun', 'raise-scott-wu', 'raise-arthur-mensch'],
  kayan: ['kayan-steven-bartlett', 'kayan-sophie-trudeau', 'kayan-peter-crone', 'kayan-marianne-williamson', 'kayan-rima-zanoun'],
  other: ['humanx-stefan-weitz', 'isnr-david-musker', 'machina-jim-fan', 'machina-bernt'],
};
