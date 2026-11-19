// Review tools. Bundles once, renders stills, tiles them with the full ffmpeg build.
//
//   node scripts/stills.mjs sheet Launch ../review/launch-sheet.png 1 4.5 9 ...
//        one still per time (seconds), 4 per row: the composition check
//   node scripts/stills.mjs strip Launch ../review/launch-strip.png 26.5 8 2
//        a motion strip: 8 frames from 26.5 s, every 2nd frame, in one row: how a move eases and blurs
//   add --mb to render with motion blur (as the final pass does)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2).filter((a) => a !== '--mb');
const mb = process.argv.includes('--mb');
const [mode, id, out, ...rest] = args;
const tmp = path.join(path.dirname(path.resolve(out)), `_tmp_${id}_${mode}`);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const inputProps = mb ? { mb: true } : {};
const serveUrl = await bundle({ entryPoint: path.join(here, '..', 'src', 'index.ts') });
const composition = await selectComposition({ serveUrl, id, inputProps });
let frames;
if (mode === 'strip') {
  const [start, n = 8, every = 2] = rest.map(Number);
  const f0 = Math.round(start * composition.fps);
  frames = Array.from({ length: n }, (_, i) => f0 + i * every);
} else {
  frames = rest.map((s) => Math.round(Number(s) * composition.fps));
}
let i = 0;
for (const f of frames) {
  const frame = Math.max(0, Math.min(composition.durationInFrames - 1, f));
  await renderStill({ composition, serveUrl, frame, inputProps, output: path.join(tmp, `${String(i++).padStart(3, '0')}.png`), scale: mode === 'strip' ? 0.25 : 0.4, chromiumOptions: { gl: 'angle' } });
}
const ffmpeg = process.env.FFMPEG ?? path.join(here, '..', '..', '..', '.venv', 'Lib', 'site-packages', 'imageio_ffmpeg', 'binaries', 'ffmpeg-win-x86_64-v7.1.exe');
const cols = mode === 'strip' ? frames.length : Math.min(4, frames.length);
const rows = Math.ceil(frames.length / cols);
execFileSync(ffmpeg, ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(tmp, '%03d.png'), '-vf', `pad=w=iw+6:h=ih+6:x=3:y=3:color=0x1b1b1b,tile=${cols}x${rows}`, '-frames:v', '1', path.resolve(out)]);
rmSync(tmp, { recursive: true, force: true });
console.log(`${mode} -> ${path.resolve(out)}`);
