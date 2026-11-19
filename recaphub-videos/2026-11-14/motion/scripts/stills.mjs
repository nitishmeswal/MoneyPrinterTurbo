// Render chosen moments of a composition as half-size stills, then tile them
// into one contact sheet. Bundles once, so it is much faster than many
// `remotion still` calls.
//   node scripts/stills.mjs FlayelLaunch out/sheet.png 0.5 1.2 3 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [id, sheet, ...secs] = process.argv.slice(2);
const tmp = path.join(path.dirname(path.resolve(sheet)), `_stills_${id}`);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(here, '..', 'src', 'index.ts') });
const composition = await selectComposition({ serveUrl, id });
let i = 0;
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  const output = path.join(tmp, `${String(i++).padStart(3, '0')}.png`);
  await renderStill({ composition, serveUrl, frame, output, scale: 0.4 });
  console.log(`${s}s -> ${output}`);
}
// Remotion's bundled ffmpeg is trimmed (no pad/tile), so use the full build from the MoneyPrinterTurbo venv.
const ffmpeg = process.env.FFMPEG ?? path.join(here, '..', '..', '..', '.venv', 'Lib', 'site-packages', 'imageio_ffmpeg', 'binaries', 'ffmpeg-win-x86_64-v7.1.exe');
const cols = Math.min(4, secs.length);
const rows = Math.ceil(secs.length / cols);
execFileSync(ffmpeg, ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(tmp, '%03d.png'), '-vf', `pad=w=iw+8:h=ih+8:x=4:y=4:color=white,tile=${cols}x${rows}`, '-frames:v', '1', path.resolve(sheet)]);
console.log(`sheet -> ${path.resolve(sheet)}`);
