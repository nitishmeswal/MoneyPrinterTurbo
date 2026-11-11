import React from 'react';
import { Composition } from 'remotion';
import { FPS, H, W, Timeline, totalSec } from './kit';
import { RecapHubTeaser, teaserTimeline } from './RecapHubTeaser';
import { RecapHubShorts, shortsTimeline } from './RecapHubShorts';
import { RecapHubStory, storyTimeline } from './RecapHubStory';
import { RecapHubPages, pagesTimeline } from './RecapHubPages';
import { RecapHubPress, pressTimeline } from './RecapHubPress';
import { RecapHubIntel, intelTimeline } from './RecapHubIntel';
import { RecapHubMcp, mcpTimeline } from './RecapHubMcp';
import { RecapHubLive, liveTimeline } from './RecapHubLive';
import { RecapHubDrive, driveTimeline } from './RecapHubDrive';
import { RecapHubAnalytics, analyticsTimeline } from './RecapHubAnalytics';
import { RecapHubPublish, publishTimeline } from './RecapHubPublish';

const FILMS: [string, React.FC, Timeline][] = [
  ['Teaser', RecapHubTeaser, teaserTimeline],
  ['Shorts', RecapHubShorts, shortsTimeline],
  ['Story', RecapHubStory, storyTimeline],
  ['Pages', RecapHubPages, pagesTimeline],
  ['Press', RecapHubPress, pressTimeline],
  ['Intel', RecapHubIntel, intelTimeline],
  ['Mcp', RecapHubMcp, mcpTimeline],
  ['Live', RecapHubLive, liveTimeline],
  ['Drive', RecapHubDrive, driveTimeline],
  ['Analytics', RecapHubAnalytics, analyticsTimeline],
  ['Publish', RecapHubPublish, publishTimeline],
];

export const Root: React.FC = () => (
  <>
    {FILMS.map(([id, component, tl]) => (
      <Composition key={id} id={id} component={component} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(totalSec(tl) * FPS)} />
    ))}
  </>
);
