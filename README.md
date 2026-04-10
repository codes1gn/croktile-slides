# CroqTile Slides & Video Pipeline

Presentation materials for CroqTile, the next-gen GPU & DSA kernel language.

Three workflows live in this repository:

| Workflow | Purpose | Output |
|----------|---------|--------|
| **Slides** (reveal.js) | Human-presented talk | Browser-based deck at `localhost:8000` |
| **Slide-recording video** (Playwright + TTS) | AI-narrated screencast of the slides | `video-gen/output/croqtile-intro-{zh,en}.mp4` |
| **Motion-graphics video** (Motion Canvas) | ByteByteGo-style animated explainer | `motion-video/output/*.mp4` |

---

## Repository Layout

```
croqtile-slides/
├── decks/
│   └── croqtile-intro/             # reveal.js deck (human-presented)
│       └── index.html
├── themes/
│   └── croqtile-dark.css           # Shared CSS theme (mint palette, dark bg)
├── assets/
│   └── images/                     # logo-2.png, banners, SVGs
├── scripts/
│   ├── serve.js                    # Node static file server
│   └── build.js                    # HTML/PDF export (Puppeteer)
│
├── video-gen/                      # Slide-recording pipeline
│   ├── pipeline.py                 # CLI entry point (parse|tts|capture|assemble|all|preview)
│   ├── parse_slides.py             # Extract slide metadata → narration.json skeleton
│   ├── tts_gen.py                  # edge-tts → MP3 + SRT per segment
│   ├── capture.py                  # Playwright headless recording per slide
│   ├── assemble.py                 # ffmpeg concat + mux → final MP4
│   ├── narration.json              # Bilingual scripts + timed actions (THE source of truth)
│   ├── durations.json              # Auto-generated segment durations
│   ├── requirements.txt            # Python deps
│   ├── audio/{zh,en}/              # TTS output per segment
│   ├── recordings/{zh,en}/         # WebM recordings per slide
│   └── output/                     # Final MP4 files
│
├── motion-video/                   # Motion Canvas explainer project
│   ├── src/
│   │   ├── project.ts              # Scene list + audio import + Lezer highlighter
│   │   ├── theme.ts                # Colors, fonts, spacing, border-radius constants
│   │   ├── scenes/                 # 17 scene files (01-title … 17-closing)
│   │   └── components/             # BarChart, CompTable, FeatureCard
│   ├── audio/
│   │   ├── narration-zh.mp3        # Full Chinese narration (concatenated)
│   │   └── narration-en.mp3        # Full English narration (concatenated)
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── render.py                   # Helper: start server + language switching
│   └── package.json
│
└── package.json                    # Root: reveal.js + devDeps
```

---

## Part 1 — Slides (reveal.js)

### 1.1 Prerequisites

```bash
# From the repository root
npm install
```

This installs `reveal.js@^6` and `puppeteer` (for PDF export).

### 1.2 Serve locally

```bash
npm run dev
```

This runs `node scripts/serve.js 8000`. Open http://localhost:8000/decks/croqtile-intro/ in your browser.

Alternatively, if Node is unavailable:

```bash
npm run dev:py      # uses python3 -m http.server 8000
```

### 1.3 Navigate the deck

| Key | Action |
|-----|--------|
| `→` or `Space` | Next slide / next fragment |
| `←` | Previous |
| `Esc` or `O` | Overview (bird's-eye grid) |
| `S` | Speaker notes window |
| `F` | Fullscreen |
| `?` | All shortcuts |

### 1.4 Edit slides

The deck is a single file: `decks/croqtile-intro/index.html`.

**Structure inside the HTML:**

```
<div class="reveal">
  <div class="slides">
    <section>           ← one per slide
      ...content...
    </section>
  </div>
</div>
```

**CSS classes on `<section>`:**

| Class | Purpose |
|-------|---------|
| `lead` | Title or closing slide (centered, large text) |
| `chapter` | Chapter divider (mint accent, icon) |
| `dense` | Content-heavy layout (smaller fonts, tighter spacing) |

**Tabbed code editor pattern:**

```html
<div class="editor-showcase" data-tabs='[
  {"label": "Croqtile", "lang": "c", "file": "matmul.co", "code": "..."},
  {"label": "Triton",   "lang": "python", "file": "gemm.py", "code": "..."}
]'>
</div>
```

The inline JS at the bottom of the file reads `data-tabs`, builds tab headers and highlighted code blocks. No external syntax highlighting plugin is needed.

**Single code block pattern:**

```html
<div class="editor-block" data-lang="c" data-file="example.co">
__co__ void kernel(...) { ... }
</div>
```

**Theme:** `themes/croqtile-dark.css` defines CSS variables (`:root`) for all colors, fonts, and spacing. Edit that file to change the look globally.

### 1.5 Build HTML / PDF

```bash
npm run build          # both HTML and PDF
npm run build:html     # HTML bundle only
npm run build:pdf      # PDF via Puppeteer (headless Chrome)
```

PDF export requires the slides server to be running (`npm run dev` in another terminal).

---

## Part 2 — Slide-Recording Video (Playwright + TTS)

This pipeline records each slide as a video, generates AI voiceover, and assembles everything into a polished MP4.

### 2.1 Prerequisites

```bash
cd video-gen

# Create a virtualenv (recommended)
python3 -m venv .venv && source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Playwright's Chromium
python3 -m playwright install chromium
```

**requirements.txt contains:**
- `edge-tts` — Microsoft Edge TTS (free, no API key)
- `playwright` — headless browser automation
- `Pillow` — image processing
- `mutagen` — accurate MP3 duration reading
- `imageio-ffmpeg` — fallback ffmpeg binary

**System ffmpeg** is strongly recommended (better codec support):

```bash
# Ubuntu/Debian
sudo apt install ffmpeg
# macOS
brew install ffmpeg
```

### 2.2 The narration file

Everything is driven by `video-gen/narration.json`. This is the single source of truth for both the Chinese and English narration text and the timed actions performed during recording.

**Top-level structure:**

```json
{
  "meta": {
    "title": "CroqTile: Next-Gen GPU & DSA Kernel Language",
    "voices": { "zh": "zh-CN-YunxiNeural", "en": "en-US-AndrewNeural" },
    "rate":   { "zh": "+0%", "en": "+0%" },
    "slide_url_base": "http://localhost:8000/decks/croqtile-intro/index.html"
  },
  "slides": [
    {
      "index": 0,
      "title": "Title",
      "segments": [
        {
          "narration_zh": "大家好...",
          "narration_en": "Hello everyone...",
          "actions": [{ "type": "wait" }]
        }
      ]
    }
  ]
}
```

A slide with multiple segments produces multiple audio files; the capture script plays through all actions in sequence for that slide. Slides with tabbed code editors typically have one segment per tab.

**Supported actions:**

| Action | Parameters | What it does |
|--------|-----------|-------------|
| `wait` | *(none)* | Hold the current view for the segment's audio duration |
| `click_tab` | `tab`: label text | Click a tab in the `editor-showcase` widget |
| `scroll` | `direction`: `up`/`down`, `px`: pixel count | Scroll the slide content |

### 2.3 Step-by-step video generation

The pipeline has 4 phases. Run them individually or all at once.

#### Phase 1 — Parse slides (one-time)

```bash
python3 pipeline.py parse
```

Reads the HTML, creates a `narration.json` skeleton with `[TODO]` placeholders. You then fill in the actual narration text by hand. **Skip this step** if `narration.json` already exists.

#### Phase 2 — Generate TTS audio

```bash
# Generate for both languages (default)
python3 pipeline.py tts

# Chinese only
python3 pipeline.py tts --lang zh

# English only
python3 pipeline.py tts --lang en

# Only specific slides (0-indexed)
python3 pipeline.py tts --lang zh --slides 0,1,4
```

**What this produces:**

```
audio/
├── zh/
│   ├── slide_00_seg_00.mp3      # one MP3 per segment
│   ├── slide_00_seg_00.srt      # subtitle file
│   ├── slide_04_seg_00.mp3
│   ├── slide_04_seg_01.mp3
│   ├── slide_04_seg_02.mp3
│   ├── slide_04_combined.mp3    # auto-concatenated when >1 segment
│   └── ...
└── en/
    └── ...
```

Also writes `durations.json` mapping slide index → segment durations in seconds.

#### Phase 3 — Capture slide video

**The slide server must be running first.**

```bash
# Terminal 1 — start slides server
npm run dev

# Terminal 2 — record
cd video-gen
python3 pipeline.py capture --lang zh

# Or specific slides
python3 pipeline.py capture --lang zh --slides 4,5,6
```

**What this does:**
1. Launches headless Chromium at 1920 x 1080
2. For each slide, navigates to `<slide_url_base>#/<index>`
3. Starts screen recording (WebM)
4. Executes each segment's actions in order (click tabs, scroll, wait)
5. Holds each segment for its audio duration + a small buffer
6. Stops recording, saves `recordings/zh/slide_XX.webm`

#### Phase 4 — Assemble final MP4

```bash
python3 pipeline.py assemble --lang zh
python3 pipeline.py assemble --lang en
```

**What this does:**
1. For each slide, muxes the WebM video with its audio segment(s)
2. Concatenates all slide clips into a single timeline
3. Adds fade-in at the start and fade-out at the end
4. Outputs `output/croqtile-intro-zh.mp4` (1080p, H.264 + AAC)

#### Run everything at once

```bash
# Full pipeline — both languages (~20-30 min)
python3 pipeline.py all

# One language
python3 pipeline.py all --lang zh

# Quick preview — only slides 0, 3, 4
python3 pipeline.py preview --lang zh
```

### 2.4 Editing workflow (iterating on a single slide)

When you change narration text for one slide (say slide 4):

```bash
# 1. Edit narration.json (change slide 4's narration_zh/en text)

# 2. Regenerate audio for that slide only
python3 pipeline.py tts --lang zh --slides 4

# 3. Re-record that slide only (server must be running)
python3 pipeline.py capture --lang zh --slides 4

# 4. Re-assemble the full video
python3 pipeline.py assemble --lang zh
```

Step 4 always re-assembles everything because it concatenates all slide clips. It's fast (~10 seconds) since it only re-muxes.

### 2.5 Troubleshooting

| Symptom | Cause & Fix |
|---------|------------|
| `net::ERR_CONNECTION_REFUSED` during capture | Slide server not running. Start it with `npm run dev` |
| `Timeout 30000ms exceeded` on page load | Google Fonts blocked / slow network. The capture script uses `wait_until="domcontentloaded"` to mitigate this |
| `SubMaker has no attribute generate_subs` | Old `edge-tts` version. Run `pip install --upgrade edge-tts` |
| ffmpeg errors decoding MP3 | System ffmpeg missing. Install it or `pip install imageio-ffmpeg` |
| Timing is off after editing narration | Re-run `pipeline.py tts` to regenerate `durations.json` |
| 0-byte `.webm` files in `recordings/` | Leftover from interrupted capture. Delete them and re-capture |
| Audio sounds robotic or wrong voice | Check `voices` and `rate` in `narration.json` → `meta` section |

---

## Part 3 — Motion-Graphics Explainer Video (Motion Canvas)

This project produces a programmatic motion-graphics video in the style of [ByteByteGo](https://www.youtube.com/@ByteByteGo) or [Fireship](https://www.youtube.com/@Fireship) — animated code blocks, growing bar charts, flying-in cards, comparison tables, and smooth transitions.

### 3.1 Prerequisites

**Node.js 18+ is required** (20+ recommended). Motion Canvas will not work on Node 12/14/16.

```bash
# Check your Node version
node --version   # must print v18.x.x or higher

# If you need a newer Node (example: install Node 20 locally)
curl -L "https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.xz" \
  -o /tmp/node20.tar.xz
cd /tmp && tar xf node20.tar.xz
export PATH="/tmp/node-v20.18.0-linux-x64/bin:$PATH"

# Install dependencies
cd motion-video
npm install
```

**Dependencies (auto-installed by npm):**

| Package | Purpose |
|---------|---------|
| `@motion-canvas/core` | Animation engine |
| `@motion-canvas/2d` | 2D rendering (Rect, Txt, Code, Layout, ...) |
| `@motion-canvas/vite-plugin` | Vite integration for the editor |
| `@motion-canvas/ffmpeg` | MP4 rendering (frame export + muxing) |
| `@motion-canvas/ui` | Browser-based editor UI |
| `@lezer/cpp` | Syntax highlighting for CroqTile/CUDA (C-like) |
| `@lezer/python` | Syntax highlighting for Triton |
| `vite@5` | Dev server + bundler |
| `typescript` | Type checking |

### 3.2 Project structure

```
motion-video/src/
├── project.ts              # Registers all 17 scenes + imports audio
├── theme.ts                # Shared design tokens
│
├── scenes/                 # 17 scenes, 6 acts
│   │
│   │  Act 0 — Opening (~25s)
│   ├── 01-title.tsx          Logo scales in, title types char-by-char
│   ├── 02-overview.tsx       4-panel grid flies in, cursor clicks panel 1
│   │
│   │  Act 1 — Easy to Use (~150s)
│   ├── 03-code-intro.tsx     CroqTile GEMM code types in line by line
│   ├── 04-dsl-compare.tsx    Split screen: CroqTile vs Triton/CUDA carousel
│   ├── 05-loc-bars.tsx       Bar chart grows, "Zero-Cost Abstraction" text
│   ├── 06-tensor.tsx         Zoom into tensor decls, comparison table
│   ├── 07-tma.tsx            TMA one-liner vs CUDA 35 lines
│   ├── 08-mma.tsx            5-line MMA cycle with step highlighting
│   ├── 09-parallel.tsx       parallel-by: 2 primitives vs CUDA's 8
│   ├── 10-integration.tsx    C++ host code types in, bullets
│   │
│   │  Act 2 — Compile-Time Safety (~60s)
│   ├── 11-safety.tsx         Error terminal + 4 category cards
│   ├── 12-safety-stats.tsx   Counter 0→353, 0→1319, module table
│   │
│   │  Act 3 — Dynamic Shapes (~50s)
│   ├── 13-dynamic.tsx        Symbolic M/K/N highlighting, comparison
│   ├── 14-memory.tsx         chunkat/subspan/view primitives
│   │
│   │  Act 4 — Born for AI (~55s)
│   ├── 15-ai-tuning.tsx      TFLOPS bar 671→1127, iteration table
│   ├── 16-ai-context.tsx     4 context-engineering cards, comparison
│   │
│   │  Act 5 — Closing (~20s)
│   └── 17-closing.tsx        Stat counters (40%, 83%, 200+, 100.5%)
│
└── components/
    ├── BarChart.tsx           Animated horizontal bars with stagger
    ├── CompTable.tsx          Table with row-by-row reveal
    └── FeatureCard.tsx        Rounded card (icon + title + desc)
```

### 3.3 Start the editor

```bash
cd motion-video

# If using a local Node 20 install:
export PATH="/tmp/node-v20.18.0-linux-x64/bin:$PATH"

npm start
```

This opens the Motion Canvas editor at **http://localhost:9000**.

**Editor UI overview:**

| Area | What it does |
|------|-------------|
| **Left panel** | Scene list + RENDER tab |
| **Center** | Live viewport (1920x1080 preview) |
| **Bottom** | Timeline — scrub, play/pause, adjust `waitUntil` time events |
| **Top bar** | FPS, resolution, playback speed |

### 3.4 Preview & iterate

1. Click a scene in the left panel to jump to it
2. Press **Space** or the play button to preview the animation
3. Scrub the timeline to inspect specific moments
4. Edit any `.tsx` scene file — Vite HMR reloads instantly
5. Drag `waitUntil` markers on the timeline to align with audio cues

### 3.5 Switch language (Chinese / English audio)

Edit `src/project.ts`:

```typescript
// For Chinese (default):
import audio from '../audio/narration-zh.mp3';

// For English — uncomment this, comment the line above:
// import audio from '../audio/narration-en.mp3';
```

Or use the helper script:

```bash
python3 render.py --lang en    # switches the import automatically
```

### 3.6 Render to MP4

**Option A — Editor UI (recommended):**

1. Open the editor at `http://localhost:9000`
2. Click the **RENDER** tab in the left sidebar
3. Set output settings:
   - Resolution: 1920 x 1080
   - FPS: 30
   - Range: full (or select a subset for testing)
4. Click **RENDER**
5. Output appears in `motion-video/output/`

**Option B — Helper script:**

```bash
python3 render.py              # starts server + prints instructions
python3 render.py --lang en    # switches to English audio first
```

### 3.7 Regenerate audio after narration changes

When you edit `video-gen/narration.json`:

```bash
# Step 1 — Regenerate TTS segments
cd video-gen
python3 pipeline.py tts

# Step 2 — Re-concatenate into single files for Motion Canvas
python3 -c "
import json, os, subprocess, imageio_ffmpeg

ff = imageio_ffmpeg.get_ffmpeg_exe()
durations = json.loads(open('durations.json').read())

for lang in ['zh', 'en']:
    files = []
    for i in range(24):
        segs = durations[lang].get(str(i), [])
        if len(segs) > 1:
            f = f'audio/{lang}/slide_{i:02d}_combined.mp3'
            if os.path.exists(f):
                files.append(f)
                continue
        for s in range(len(segs)):
            f = f'audio/{lang}/slide_{i:02d}_seg_{s:02d}.mp3'
            if os.path.exists(f):
                files.append(f)

    with open(f'/tmp/concat_{lang}.txt', 'w') as fh:
        for f in files:
            fh.write(f\"file '{os.path.abspath(f)}'\n\")

    subprocess.run([ff, '-y', '-f', 'concat', '-safe', '0',
                    '-i', f'/tmp/concat_{lang}.txt', '-c', 'copy',
                    f'../motion-video/audio/narration-{lang}.mp3'])
    print(f'{lang} audio concatenated')
"

# Step 3 — Open the Motion Canvas editor, re-align waitUntil markers, render
```

### 3.8 Customize content

| What to change | Where to edit |
|----------------|---------------|
| Global colors (mint palette, dark bg) | `src/theme.ts` — `Colors` object |
| Font families | `src/theme.ts` — `Fonts` object |
| Scene order or add/remove scenes | `src/project.ts` — `scenes` array |
| Code snippets shown in animations | Inline `const` strings at the top of each scene `.tsx` |
| Bar chart data (LoC counts, TFLOPS) | `BARS`, `ITERATIONS` arrays in `05-loc-bars.tsx`, `15-ai-tuning.tsx` |
| Comparison tables | `rows` arrays in `06-tensor.tsx`, `13-dynamic.tsx`, `16-ai-context.tsx` |
| Bullet point text | `bullets` arrays in each scene file |
| Animation durations | `waitFor()` calls (seconds) throughout the generator functions |
| Audio sync points | `waitUntil('event-name')` — adjust timing in the editor timeline |
| Feature card content | `PANELS`, `FEATURE_CARDS` arrays in `02-overview.tsx`, `16-ai-context.tsx` |

### 3.9 Add a new scene

1. Create `src/scenes/XX-my-scene.tsx`:

```typescript
import {makeScene2D, Txt} from '@motion-canvas/2d';
import {waitFor, waitUntil} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);

  view.add(
    <Txt text="Hello" fill={Colors.fg} fontFamily={Fonts.main} fontSize={48} />,
  );

  yield* waitFor(2);
  yield* waitUntil('my-scene-end');
});
```

2. Register it in `src/project.ts`:

```typescript
import myScene from './scenes/XX-my-scene?scene';
// ... add to scenes array
```

---

## Quick Reference — Common Tasks

| Task | Command(s) |
|------|-----------|
| Serve slides locally | `npm run dev` → open http://localhost:8000/decks/croqtile-intro/ |
| Generate Chinese TTS audio | `cd video-gen && python3 pipeline.py tts --lang zh` |
| Record slides to video | `npm run dev` (term 1) + `cd video-gen && python3 pipeline.py capture --lang zh` (term 2) |
| Assemble final slide video | `cd video-gen && python3 pipeline.py assemble --lang zh` |
| Full slide video pipeline | `cd video-gen && python3 pipeline.py all --lang zh` |
| Start Motion Canvas editor | `cd motion-video && npm start` → open http://localhost:9000 |
| Render motion-graphics MP4 | Editor UI → RENDER tab → click RENDER |
| Switch motion video language | Edit `motion-video/src/project.ts` audio import line |
