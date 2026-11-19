import { FilmDef } from '../kit';
import { launchFilm } from './Launch';
import { teaserFilm } from './Teaser';
import { shortsFilm } from './Shorts';
import { storyFilm } from './Story';
import { pagesFilm } from './Pages';
import { pressFilm } from './Press';
import { intelFilm } from './Intel';
import { mcpFilm } from './Mcp';
import { liveFilm } from './Live';
import { driveFilm } from './Drive';
import { analyticsFilm } from './Analytics';
import { publishFilm } from './Publish';

/** Every film, in catalogue order. The id is the Remotion composition id; the output is out/recaphub-<id>.mp4. */
export const FILMS: FilmDef[] = [launchFilm, teaserFilm, shortsFilm, storyFilm, pagesFilm, pressFilm, intelFilm, mcpFilm, liveFilm, driveFilm, analyticsFilm, publishFilm];
