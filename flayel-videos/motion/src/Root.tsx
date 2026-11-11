import React from 'react';
import { Composition } from 'remotion';
import { FlayelVideo } from './FlayelVideo';
import { VideoProps } from './types';
import { FlayelLaunch, flayelTimeline } from './launch/FlayelLaunch';
import { RecapHubLaunch, recaphubTimeline } from './launch/RecapHubLaunch';
import { FPS, H, W, totalSec } from './launch/kit';

const placeholder: VideoProps = {
  id: 'preview',
  subject: 'Pass --props=<props.json> (make_video.py does this)',
  fps: 30,
  duration: 3,
  shots: [
    { seconds: 3, type: 'screen_recording', voiceover: '', kling_prompt: '', on_screen_text: 'Flayel', start: 0, end: 3, clip: null },
  ],
  words: [],
  voiceover: '',
};

export const Root: React.FC = () => (
  <>
  <Composition
    id="FlayelLaunch"
    component={FlayelLaunch}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={Math.ceil(totalSec(flayelTimeline) * FPS)}
  />
  <Composition
    id="RecapHubLaunch"
    component={RecapHubLaunch}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={Math.ceil(totalSec(recaphubTimeline) * FPS)}
  />
  <Composition
    id="FlayelVideo"
    component={FlayelVideo as unknown as React.FC<Record<string, unknown>>}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={90}
    defaultProps={placeholder as unknown as Record<string, unknown>}
    calculateMetadata={({ props }) => {
      const p = props as unknown as VideoProps;
      return { durationInFrames: Math.ceil(p.duration * p.fps), fps: p.fps };
    }}
  />
  </>
);
