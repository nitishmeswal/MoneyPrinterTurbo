import React from 'react';
import { Composition } from 'remotion';
import { FPS, Film, FilmDef, H, W, framesOf } from './kit';
import { teaserFilm } from './films/Teaser';
import { shortsFilm } from './films/Shorts';
import { storyFilm } from './films/Story';
import { pagesFilm } from './films/Pages';
import { pressFilm } from './films/Press';
import { intelFilm } from './films/Intel';
import { mcpFilm } from './films/Mcp';
import { liveFilm } from './films/Live';
import { driveFilm } from './films/Drive';
import { analyticsFilm } from './films/Analytics';
import { publishFilm } from './films/Publish';

// films hold their scenes as functions, so each is its own component (Remotion props must be serialisable)
const make = (film: FilmDef): React.FC => () => <Film film={film} />;
export const FILMS: [string, FilmDef][] = [
  ['Teaser', teaserFilm],
  ['Shorts', shortsFilm],
  ['Story', storyFilm],
  ['Pages', pagesFilm],
  ['Press', pressFilm],
  ['Intel', intelFilm],
  ['Mcp', mcpFilm],
  ['Live', liveFilm],
  ['Drive', driveFilm],
  ['Analytics', analyticsFilm],
  ['Publish', publishFilm],
];
const COMPONENTS = FILMS.map(([id, film]) => [id, film, make(film)] as const);

export const Root: React.FC = () => (
  <>
    {COMPONENTS.map(([id, film, Comp]) => (
      <Composition key={id} id={id} component={Comp} width={W} height={H} fps={FPS} durationInFrames={framesOf(film)} />
    ))}
  </>
);
