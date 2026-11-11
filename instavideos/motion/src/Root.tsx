import React from 'react';
import { CalculateMetadataFunction, Composition, staticFile } from 'remotion';
import { SimShort } from './SimShort';
import { TrickShort } from './TrickShort';
import { RevealShort } from './RevealShort';
import { ReflexShort } from './ReflexShort';
import { SandShort } from './SandShort';
import { MazeShort, RampShort } from './ChallengeShort';

type Props = { id: string };

// duration comes from the built data file (sims and tricks know their own length)
const meta: CalculateMetadataFunction<Props> = async ({ props }) => {
  const r = await fetch(staticFile(`data/${props.id}.json`));
  const d = await r.json();
  return { durationInFrames: d.frames, props };
};

const comp = (id: string, component: React.FC<Props>, def: string) => (
  <Composition id={id} component={component} width={1080} height={1920} fps={60} durationInFrames={600} defaultProps={{ id: def }} calculateMetadata={meta} />
);

export const Root: React.FC = () => (
  <>
    {comp('Sim', SimShort, 'a01-break-out')}
    {comp('Trick', TrickShort, 'b01-card-gone')}
    {comp('Reveal', RevealShort, 'c01-pick-capsule')}
    {comp('Reflex', ReflexShort, 'd01-stop-green')}
    {comp('Sand', SandShort, 'g27-sand-fill')}
    {comp('Maze', MazeShort, 'g45-maze-race')}
    {comp('Ramp', RampShort, 'g46-fastest-ramp')}
  </>
);
