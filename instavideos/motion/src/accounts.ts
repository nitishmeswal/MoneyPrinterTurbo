/* One look per account: palette, fonts, title style. Each account must read as
 * its own brand (distinct name, avatar and look) so the platforms don't treat
 * them as clones. */
import { loadFont as anton } from '@remotion/google-fonts/Anton';
import { loadFont as inter } from '@remotion/google-fonts/Inter';
import { loadFont as playfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as fredoka } from '@remotion/google-fonts/Fredoka';
import { loadFont as grotesk } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as bebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as outfit } from '@remotion/google-fonts/Outfit';
import { loadFont as mono } from '@remotion/google-fonts/JetBrainsMono';

export const F = {
  anton: anton('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily,
  inter: inter('normal', { weights: ['400', '600', '800'], subsets: ['latin'] }).fontFamily,
  playfair: playfair('normal', { weights: ['700', '900'], subsets: ['latin'] }).fontFamily,
  playfairI: playfair('italic', { weights: ['700'], subsets: ['latin'] }).fontFamily,
  fredoka: fredoka('normal', { weights: ['500', '700'], subsets: ['latin'] }).fontFamily,
  grotesk: grotesk('normal', { weights: ['500', '700'], subsets: ['latin'] }).fontFamily,
  bebas: bebas('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily,
  outfit: outfit('normal', { weights: ['500', '700', '800'], subsets: ['latin'] }).fontFamily,
  mono: mono('normal', { weights: ['500', '700'], subsets: ['latin'] }).fontFamily,
};

export type Look = {
  name: string;
  handle: string;
  bg: string;
  bg2: string;
  glow: string;
  ink: string;
  sub: string;
  accent: string;
  ring: string;
  title: { font: string; size: number; weight: number; tracking: string; upper: boolean; italic?: boolean };
  body: string;
  palette: string[];
};

export const LOOKS: Record<string, Look> = {
  'ball-arena': {
    name: 'Ball Arena',
    handle: '@daily.sensory',
    bg: '#0B0C10',
    bg2: '#151821',
    glow: 'rgba(242,193,78,0.10)',
    ink: '#F4F1EA',
    sub: 'rgba(244,241,234,0.62)',
    accent: '#F2C14E',
    ring: '#E9E4D8',
    title: { font: F.anton, size: 104, weight: 400, tracking: '0.01em', upper: true },
    body: F.inter,
    palette: ['#E4572E', '#F2A541', '#F2C14E', '#C9B27C', '#A3826C', '#8E5B4E'],
  },
  'mind-reader': {
    name: 'Mind Reader',
    handle: '@daily.sensory',
    bg: '#0E2A20',
    bg2: '#123527',
    glow: 'rgba(255,236,190,0.16)',
    ink: '#F6EEDC',
    sub: 'rgba(246,238,220,0.66)',
    accent: '#E9C46A',
    ring: '#F6EEDC',
    title: { font: F.playfair, size: 96, weight: 900, tracking: '-0.01em', upper: false },
    body: F.inter,
    palette: ['#C0392B', '#1C1C1C', '#E9C46A', '#F6EEDC'],
  },
  'capsule-world': {
    name: 'Capsule World',
    handle: '@daily.sensory',
    bg: '#1A1530',
    bg2: '#2A2050',
    glow: 'rgba(255,170,220,0.16)',
    ink: '#FFF7FB',
    sub: 'rgba(255,247,251,0.66)',
    accent: '#FFB3DE',
    ring: '#FFF7FB',
    title: { font: F.fredoka, size: 100, weight: 700, tracking: '0em', upper: false },
    body: F.fredoka,
    palette: ['#9AA5B8', '#4FC3F7', '#B388FF', '#FF6FB5', '#FFD54F'],
  },
  'reflex-lab': {
    name: 'Reflex Lab',
    handle: '@daily.sensory',
    bg: '#07131F',
    bg2: '#0C2233',
    glow: 'rgba(56,239,125,0.10)',
    ink: '#EAFBF2',
    sub: 'rgba(234,251,242,0.64)',
    accent: '#38EF7D',
    ring: '#EAFBF2',
    title: { font: F.grotesk, size: 98, weight: 700, tracking: '-0.03em', upper: false },
    body: F.grotesk,
    palette: ['#38EF7D', '#FF4D6D', '#4CC9F0', '#FFD166', '#B892FF', '#FF9F1C'],
  },
  'bounce-melody': {
    name: 'Bounce Melody',
    handle: '@daily.sensory',
    bg: '#0B0820',
    bg2: '#1B1240',
    glow: 'rgba(130,170,255,0.16)',
    ink: '#F3F0FF',
    sub: 'rgba(243,240,255,0.62)',
    accent: '#8FB3FF',
    ring: '#DCD6FF',
    title: { font: F.outfit, size: 98, weight: 800, tracking: '-0.03em', upper: false },
    body: F.outfit,
    palette: ['#FF5E7E', '#FF9A4D', '#FFD84D', '#9BE15D', '#4DD8E6', '#5E8BFF', '#A66BFF', '#FF6BD6', '#FF7A59', '#5CE1A6', '#6FA8FF', '#C38BFF'],
  },
  sensory: {
    name: 'Daily Sensory',
    handle: '@daily.sensory',
    bg: '#0B0C10',
    bg2: '#151821',
    glow: 'rgba(242,193,78,0.10)',
    ink: '#F4F1EA',
    sub: 'rgba(244,241,234,0.62)',
    accent: '#F2C14E',
    ring: '#E9E4D8',
    title: { font: F.anton, size: 104, weight: 400, tracking: '0.01em', upper: true },
    body: F.inter,
    palette: ['#E4572E', '#F2A541', '#F2C14E', '#C9B27C', '#A3826C', '#8E5B4E'],
  },
  'marble-kingdom': {
    name: 'Marble Kingdom',
    handle: '@daily.sensory',
    bg: '#081A12',
    bg2: '#0E2A1D',
    glow: 'rgba(255,215,90,0.12)',
    ink: '#F7F5EE',
    sub: 'rgba(247,245,238,0.64)',
    accent: '#FFD75A',
    ring: '#F7F5EE',
    title: { font: F.bebas, size: 108, weight: 400, tracking: '0.02em', upper: true },
    body: F.inter,
    palette: ['#E63946', '#1D7CF2', '#2ECC71', '#FFD166', '#9B5DE5', '#FF8C42', '#F7F5EE', '#00C2C7'],
  },
};
