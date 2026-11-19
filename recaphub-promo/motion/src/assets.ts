/* Every real asset the films use (copied from recaphub-videos/2026-11-14, see README).
 *  shots/    real recaphub_3.0 components captured from the built Storybook at 2x, plus marketing screenshots
 *  demos/    real product screen recordings (1440 wide)
 *  footage/  real stage footage and photos
 *  reels/    real RecapHub vertical clips (540 x 960, captions burnt in by RecapHub)
 *  brand/    EventLabs x RecapHub brand files: horizon / fade-bright / card-back gradients, logos */
import boxes from './shots.json';
import type { Rect } from './kit';

type Box = { w: number; h: number; el: number[] };
const B = boxes as unknown as Record<string, Box>;
/** a capture: file, size and its main element box */
export const cap = (name: string) => ({ file: `shots/${name}.png`, sw: B[name].w, sh: B[name].h, el: B[name].el as Rect });

/** hand-measured boxes inside captures (source pixels) */
export const BOX = {
  mcpDialog: [927, 491, 1026, 1017] as Rect,
  mcpNext: [1837, 1443],
  mcpTools: [63, 63, 770, 309] as Rect,
  themeArctic: [49, 112, 530, 447] as Rect,
  themeScholar: [2301, 1169, 530, 444] as Rect,
};

export const SCREEN = {
  dashboard: { file: 'shots/event-dashboard-1600.webp', sw: 1600, sh: 864 },
  knowledge: { file: 'shots/knowledge-hub-1600.webp', sw: 1600, sh: 911 },
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
