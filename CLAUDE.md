# CroqTile Slides

Presentation slides for **CroqTile** — a GPU programming framework. Built with **reveal.js**.

## Quick Start (Linux / macOS)

```bash
# Ensure Node.js 20+ is on PATH
export PATH="$HOME/.local/bin:$PATH"

# Install dependencies
npm install

# Preview locally (open http://localhost:8000/decks/croqtile-intro/)
npm run dev          # or: python3 -m http.server 8000

# Build self-contained HTML
python3 scripts/build.py --format html

# Build PDF (requires Chrome/Chromium)
python3 scripts/build.py --format pdf

# Build all formats
python3 scripts/build.py
```

## Quick Start (Windows)

```powershell
# Ensure Node.js 20+ is installed (node -v to verify)

# Install dependencies
npm install

# Preview locally (open http://localhost:8000/decks/croqtile-intro/)
npm run dev

# Build self-contained HTML
npm run build:html

# Build PDF (requires Chrome)
npm run build:pdf

# Build all formats
npm run build
```

## Repo Structure

- `decks/` — Slide decks, each in `<name>/index.html` with `dist/` for build outputs
- `themes/` — reveal.js CSS themes: `croqtile-dark`
- `assets/images/` — Shared logos and images
- `scripts/build.py` — Build automation for Linux/macOS (Python)
- `scripts/build.js` — Build automation for Windows (Node.js, same functionality)
- `scripts/serve.js` — Lightweight dev server for Windows (replaces `python3 -m http.server`)

## Deck Format

Each deck is a standard reveal.js HTML file (`index.html`) that references:
- `../../node_modules/reveal.js/` for the framework
- `../../themes/croqtile-dark.css` for styling
- `../../assets/images/` for shared assets

### Interactive Code Editor

Slides use custom `editor-block` and `editor-showcase` components that match the CroqTile website's code showcase. These provide:
- Syntax highlighting for Choreo (.co) and C++/CUDA languages
- IDE-style window chrome (traffic light dots, filename, badge)
- Tabbed code comparison (`.editor-showcase` with `data-tabs` JSON)

### Slide Classes

| Class | Purpose |
|-------|---------|
| `lead` | Title/closing slides (centered, gradient background) |
| `chapter` | Chapter divider slides |
| `split` | Two-column layout via CSS grid (use `<div class="split">`) |

## Build Outputs

- `dist/slides.html` — Self-contained single HTML file (all CSS/JS/images inlined)
- `dist/slides.pdf` — PDF export via decktape

## Conventions

- Deck names: lowercase-kebab-case
- Always include CroqTile logo on title slides
- Use `class="lead"` for title/closing slides
- Use `class="chapter"` for chapter dividers
- Use `<div class="editor-block">` for code with IDE chrome
- Use `<div class="editor-showcase">` for tabbed code comparison
