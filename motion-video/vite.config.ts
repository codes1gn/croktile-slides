import {defineConfig} from 'vite';
import motionCanvasPlugin from '@motion-canvas/vite-plugin';
import ffmpegPlugin from '@motion-canvas/ffmpeg';

const mc = (motionCanvasPlugin as any).default ?? motionCanvasPlugin;
const ff = (ffmpegPlugin as any).default ?? ffmpegPlugin;

export default defineConfig({
  plugins: [mc(), ff()],
});
