import {makeProject} from '@motion-canvas/core';

import title from './scenes/01-title?scene';
import overview from './scenes/02-overview?scene';
import codeIntro from './scenes/03-code-intro?scene';
import dslCompare from './scenes/04-dsl-compare?scene';
import locBars from './scenes/05-loc-bars?scene';
import tensor from './scenes/06-tensor?scene';
import tma from './scenes/07-tma?scene';
import mma from './scenes/08-mma?scene';
import parallel from './scenes/09-parallel?scene';
import integration from './scenes/10-integration?scene';
import safety from './scenes/11-safety?scene';
import safetyStats from './scenes/12-safety-stats?scene';
import dynamic from './scenes/13-dynamic?scene';
import memory from './scenes/14-memory?scene';
import aiTuning from './scenes/15-ai-tuning?scene';
import aiContext from './scenes/16-ai-context?scene';
import closing from './scenes/17-closing?scene';

import {Code, LezerHighlighter} from '@motion-canvas/2d';
import {parser as cppParser} from '@lezer/cpp';

Code.defaultHighlighter = new LezerHighlighter(cppParser);

// Audio: switch between languages by changing this import
// import audio from '../audio/narration-en.mp3';
import audio from '../audio/narration-zh.mp3';

export default makeProject({
  audio: audio,
  scenes: [
    title,
    overview,
    codeIntro,
    dslCompare,
    locBars,
    tensor,
    tma,
    mma,
    parallel,
    integration,
    safety,
    safetyStats,
    dynamic,
    memory,
    aiTuning,
    aiContext,
    closing,
  ],
});
