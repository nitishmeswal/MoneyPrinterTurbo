import React from 'react';
import { Composition } from 'remotion';
import { FPS, Film, FilmDef, H, W, framesOf } from './kit';
import { SANS } from './brand';
import { FILMS } from './films';

// films hold their shots as functions, so each is its own component (Remotion props must be serialisable)
const make = (film: FilmDef): React.FC => () => <Film film={film} font={SANS} />;
const COMPONENTS = FILMS.map((film) => [film, make(film)] as const);

export const Root: React.FC = () => (
  <>
    {COMPONENTS.map(([film, Comp]) => (
      <Composition key={film.id} id={film.id} component={Comp} width={W} height={H} fps={FPS} durationInFrames={framesOf(film)} />
    ))}
  </>
);
