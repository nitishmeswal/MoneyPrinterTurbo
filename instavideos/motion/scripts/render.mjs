// Render many shorts with one bundle (bundling once saves ~15 s per video).
//   node scripts/render.mjs a01-break-out b02-your-number ...
//   node scripts/render.mjs --stills <sheet.png> <id> 0 1.5 4 10 ...   (contact sheet at 0.4 scale)
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const out = path.join(root, '..', 'out', 'raw');
const statusPath = path.join(root, '..', 'out', 'render_status.json');
const ffmpeg = path.join(root, '..', '..', '.venv', 'Lib', 'site-packages', 'imageio_ffmpeg', 'binaries', 'ffmpeg-win-x86_64-v7.1.exe');
const COMP = { sim: 'Sim', trick: 'Trick', reveal: 'Reveal', reflex: 'Reflex', sand: 'Sand', maze: 'Maze', ramp: 'Ramp' };

const args = process.argv.slice(2);
// Chrome draws on the GPU through ANGLE (~22% faster than CPU drawing on the RTX 5070);
// GL=swiftshader forces CPU drawing. CONCURRENCY = parallel browser tabs (12 was no faster than 8).
const GL = process.env.GL || 'angle';
const CONCURRENCY = Number(process.env.CONCURRENCY || 8);
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts') });

const compFor = async (id) => {
  const data = JSON.parse(readFileSync(path.join(root, 'public', 'data', `${id}.json`), 'utf8'));
  const inputProps = { id };
  const composition = await selectComposition({ serveUrl, id: COMP[data.engine], inputProps });
  return { composition, inputProps };
};

if (args[0] === '--stills') {
  // --stills <sheet.png> <id> 0 1.5 ...      or      --stills <sheet.png> id@sec id@sec ...  (sec may be "end", or "r" = result frame)
  const [, sheet, ...rest] = args;
  const shots = rest[0].includes('@') ? rest.map((x) => x.split('@')) : rest.slice(1).map((s) => [rest[0], s]);
  const secs = shots;
  const tmp = path.join(path.dirname(path.resolve(sheet)), `_stills_${path.basename(sheet, '.png')}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  let i = 0;
  for (const [id, s] of shots) {
    const { composition, inputProps } = await compFor(id);
    const data = JSON.parse(readFileSync(path.join(root, 'public', 'data', `${id}.json`), 'utf8'));
    const at = s === 'end' ? composition.durationInFrames - 30 : s.startsWith('r') ? (data.result?.f ?? 0) + Math.round(Number(s.slice(1) || 0) * 60) : Math.round(Number(s) * composition.fps);
    const frame = Math.max(0, Math.min(composition.durationInFrames - 1, at));
    await renderStill({ composition, serveUrl, inputProps, frame, output: path.join(tmp, `${String(i++).padStart(3, '0')}.png`), scale: 0.4 });
  }
  const cols = Math.min(5, secs.length);
  const rows = Math.ceil(secs.length / cols);
  execFileSync(ffmpeg, ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(tmp, '%03d.png'), '-vf', `pad=w=iw+8:h=ih+8:x=4:y=4:color=white,tile=${cols}x${rows}`, '-frames:v', '1', path.resolve(sheet)]);
  console.log(`sheet -> ${path.resolve(sheet)}`);
} else {
  mkdirSync(out, { recursive: true });
  for (const id of args) {
    const t0 = Date.now();
    const { composition, inputProps } = await compFor(id);
    const outputLocation = path.join(out, `${id}.mp4`);
    // fonts come from Google Fonts at render time: allow slow networks and retry once
    for (let attempt = 1; ; attempt++) {
      try {
        // out/raw is an intermediate (finish.py re-encodes it), so x264 runs at "ultrafast" to leave the CPU to Chrome
        let last = 0;
        const total = composition.durationInFrames;
        // live status for progress.py (throttled to 2 writes per second)
        const onProgress = ({ renderedFrames, encodedFrames }) => {
          const now = Date.now();
          if (now - last < 500) return;
          last = now;
          try {
            writeFileSync(statusPath, JSON.stringify({ id, rendered: renderedFrames, encoded: encodedFrames, total, t: now / 1000, started: t0 / 1000 }));
          } catch {}
        };
        await renderMedia({ composition, serveUrl, codec: 'h264', crf: 14, x264Preset: 'ultrafast', inputProps, outputLocation, concurrency: CONCURRENCY, audioBitrate: '256k', timeoutInMilliseconds: 120000, chromiumOptions: GL ? { gl: GL } : {}, onProgress });
        break;
      } catch (e) {
        if (attempt >= 3) throw e;
        console.log(`retry ${id} (attempt ${attempt + 1}): ${String(e).slice(0, 120)}`);
      }
    }
    console.log(`rendered ${id} (${(composition.durationInFrames / 60).toFixed(1)}s) in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${outputLocation}`);
  }
}
