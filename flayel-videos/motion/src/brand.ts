import { loadFont as loadSans } from '@remotion/google-fonts/Outfit';
import { loadFont as loadSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

// Flayel's own palette and type, from flayel-web/app/globals.css and layout.tsx.
export const C = {
  bg: '#f6f3ec',
  surface: '#ffffff',
  border: '#e4ddcf',
  text: '#13233b',
  text2: '#4a5568',
  accent: '#1a78d6',
  blue: '#3a9ff0',
  amber: '#b2741a',
  gold: '#c08a2b',
  green: '#268f53',
  purple: '#6f54d6',
  red: '#d6403c',
};

export const GRADIENT = 'linear-gradient(120deg, #3a9ff0 0%, #1a78d6 42%, #b2741a 100%)';

export const SANS = loadSans('normal', { weights: ['400', '600', '800'], subsets: ['latin'] }).fontFamily;
export const SERIF = loadSerif('italic', { weights: ['400'], subsets: ['latin'] }).fontFamily;
export const MONO = loadMono('normal', { weights: ['500', '700'], subsets: ['latin'] }).fontFamily;

export const SHADOW = '0 2px 4px rgba(19,35,59,0.05), 0 24px 60px rgba(19,35,59,0.12)';
