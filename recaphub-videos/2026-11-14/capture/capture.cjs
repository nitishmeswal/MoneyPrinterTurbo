// Capture real recaphub_3.0 components from the built Storybook at 2x.
// For each story: <name>.png (the 1440 x 900 frame) and <name>-el.png (just the component).
//   node capture.cjs            (Storybook served at http://127.0.0.1:6007)
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/nitis/Desktop/recaphub_3.0/node_modules/playwright');

const OUT = path.join(__dirname, '..', 'motion', 'public', 'shots');
const BASE = 'http://127.0.0.1:6007/iframe.html?viewMode=story&id=';

// name, story id, viewport width, viewport height, extra wait (ms)
const SHOTS = [
  // stages / live
  ['stage-wall', 'ui-stagecard--wall', 1440, 900],
  ['stage-card-live', 'ui-stagecard--live', 900, 700],
  ['onair-live', 'ui-onairpanel--live', 1200, 800],
  ['ingest-healthy', 'ui-ingesthealthcard--healthy', 700, 400],
  ['stream-key', 'ui-streamkeypanel--freshly-provisioned', 1100, 800],
  ['chapter-live', 'ui-chaptertimeline--live-marking', 1440, 600],
  ['stream-badges', 'ui-streamstatebadge--all-states', 900, 400],
  ['stream-rows', 'ui-streamrow--recordings-list', 1200, 800],
  // shorts / chat
  ['clips-ready', 'chat-clipbatchcard--ready-many', 1100, 900],
  ['clips-qc', 'chat-clipbatchcard--feed-shape-with-qc-notes', 1100, 900],
  ['clips-edit', 'chat-clipbatchcard--edit-in-flight', 1100, 900],
  ['clips-pending', 'chat-clipbatchcard--pending', 1100, 600],
  ['loader-hero', 'chat-cardtraceloader--large-hero-loader', 900, 600],
  ['chat-thread', 'chat-chatthread--with-conversation', 1300, 900],
  ['chat-empty', 'chat-chatthread--empty', 1300, 900],
  ['vertical-clip', 'chat-artifactviewer--vertical-video-clip-artifact', 900, 1000],
  ['approval', 'chat-approvalcard--needs-review', 1000, 700],
  ['suggestions', 'chat-suggestioncard--grid', 1200, 700],
  // published pages
  ['hero', 'published-sections-herosection--default', 1440, 900],
  ['hero-dark', 'published-sections-herosection--dark', 1440, 900],
  ['hero-mcp', 'published-sections-herosection--with-mcp-cta', 1440, 900],
  ['topicmaps', 'published-sections-topicmapsections--default', 1440, 1400],
  ['topicmaps-dark', 'published-sections-topicmapsections--dark', 1440, 1400],
  ['agenda', 'published-sections-agendasection--default', 1440, 1200],
  ['agenda-dark', 'published-sections-agendasection--dark', 1440, 1200],
  ['speakers', 'published-sections-speakerssection--default', 1440, 1000],
  ['recap-insights', 'published-sections-eventrecapsection--v-3-insights', 1440, 1300],
  ['session-card', 'published-sections-sessioncard--featured', 1000, 700],
  ['publish-dialog', 'published-publishlayoutdialog--default', 1440, 1000],
  ['themes', 'branding-publishedpagetheme--all-themes', 1440, 1100],
  ['topicmaps-editor', 'branding-topicmapseditor--both-on', 1000, 800],
  ['mcp-cta-editor', 'branding-mcpctaeditor--on', 1000, 700],
  ['navbar', 'published-eventnavbar--published', 1440, 200],
  ['wiki', 'published-layouts-wikilayout--overview', 1440, 1000],
  ['continue-mcp', 'published-continueinmcp--section-card', 1200, 600],
  ['continue-pill', 'published-continueinmcp--hero-pill', 800, 300],
  ['session-read', 'ui-sessionreadview--default', 1440, 1200],
  ['transcript', 'ui-transcriptturns--resolved-speakers', 1100, 900],
  // topic maps / intelligence
  ['mindmap', 'ui-topicmaps-topicmindmap--desktop', 1440, 900],
  ['mindmap-theme', 'ui-topicmaps-topicmindmap--theme-opened', 1440, 900],
  ['mindmap-question', 'ui-topicmaps-topicmindmap--question-opened', 1440, 900],
  ['treemap', 'ui-topicmaps-topictreemap--desktop', 1440, 900],
  ['treemap-theme', 'ui-topicmaps-topictreemap--theme-opened', 1440, 900],
  ['treemap-speaker', 'ui-topicmaps-topictreemap--speaker-filter', 1440, 900],
  ['treemap-mobile', 'ui-topicmaps-topictreemap--mobile', 430, 900],
  ['mindmap-mobile', 'ui-topicmaps-topicmindmap--mobile', 430, 900],
  ['event-deck', 'ui-topicmaps-eventcarddeck--default', 1000, 700],
  // press
  ['press-gate', 'press-presssigningate--email-step', 1440, 900],
  ['press-gate-logo', 'press-presssigningate--with-event-logo', 1440, 900],
  ['press-room', 'press-templates-pressroomtemplate--raise-summit-paris', 1440, 1000],
  ['press-room-2', 'press-templates-pressroomtemplate--nordic-summit-stockholm', 1440, 1000],
  ['press-feed', 'press-pressworkbench--live-feed-tab', 1440, 1000],
  ['press-quotes', 'press-pressworkbench--quote-wall-tab', 1440, 1000],
  ['press-themes', 'press-pressworkbench--themes-tab', 1440, 1000],
  ['press-media', 'press-pressworkbench--media-tab', 1440, 1000],
  ['press-mcp', 'press-presscontextrail--mcp-handoff', 700, 900],
  ['press-lane-email', 'press-emails-lane-export--default', 900, 1100],
  ['press-access', 'press-pressaccesspanel--trusted-mastheads', 1100, 800],
  ['press-roster', 'press-pressrosterpanel--full-roster', 1200, 800],
  ['press-session', 'press-presssessionpreviewcard--fully-analysed', 1100, 900],
  // mcp
  ['mcp-walkthrough', 'ui-mcpconnectdialog--walkthrough', 1440, 1000],
  ['mcp-event', 'ui-mcpconnectdialog--event-mode', 1440, 1000],
  ['mcp-tools', 'ui-mcpconnectdialog--tool-cascade', 1440, 1000],
  ['mcp-marks', 'ui-mcpconnectdialog--brand-marks', 1440, 1000],
  // workflow
  ['agenda-upload-ready', 'agenda-agendauploadpanel--ready', 1100, 800],
  ['agenda-upload-parsing', 'agenda-agendauploadpanel--parsing', 1100, 800],
  ['agenda-review', 'agenda-agendareviewtable--ready', 1440, 900],
  ['download-progress', 'ui-downloadprogress--in-session-row', 1100, 400],
  ['session-list', 'ui-sessionlist--editable-dashboard', 1440, 1000],
  ['sidebar', 'ui-sidebar--event-context', 400, 900],
  ['brand-panel', 'branding-brandpanel--ready', 1300, 1000],
  ['speaker-review', 'speakerreview-speakerreviewpanel--mixed-states', 1200, 900],
  ['global-search', 'ui-globalsearch--default', 1200, 800],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const only = process.argv.slice(2);
  const boxesFile = path.join(__dirname, '..', 'motion', 'src', 'shots.json');
  const boxes = fs.existsSync(boxesFile) ? JSON.parse(fs.readFileSync(boxesFile, 'utf8')) : {};
  for (const [name, id, w, h, wait = 0] of SHOTS) {
    if (only.length && !only.includes(name)) continue;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    try {
      await page.goto(BASE + id, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1800 + wait);
      // let fonts and images settle, freeze animations at their end state
      await page.addStyleTag({ content: '*{caret-color:transparent!important}' });
      await page.screenshot({ path: path.join(OUT, `${name}.png`) });
      const root = await page.$('#storybook-root > *');
      if (root) {
        const box = await root.boundingBox();
        if (box && box.width > 20 && box.height > 20) await root.screenshot({ path: path.join(OUT, `${name}-el.png`) });
        // the component's place on the frame, in frame pixels (2x)
        if (box) boxes[name] = { w: w * 2, h: h * 2, el: [box.x * 2, box.y * 2, box.width * 2, box.height * 2].map((v) => Math.round(v)) };
      }
      console.log('ok  ', name);
    } catch (e) {
      console.log('FAIL', name, String(e).slice(0, 120));
    }
    await page.close();
  }
  fs.writeFileSync(boxesFile, JSON.stringify(boxes, null, 1));
  await browser.close();
})();
