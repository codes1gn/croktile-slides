# CrokTile Slides

Automated slide/presentation generation repo for **CrokTile** — a GPU programming framework.

## Quick Start

```bash
# Ensure Node.js 20+ is on PATH
export PATH="$HOME/.local/bin:$PATH"

# Create a new deck
mkdir -p decks/<deck-name>/dist

# Edit decks/<deck-name>/slides.md (Marp Markdown)

# Preview with live reload
npx marp --no-stdin decks/<deck-name>/slides.md --preview

# Export (--no-stdin required for non-interactive shells)
npx marp --no-stdin decks/<deck-name>/slides.md -o decks/<deck-name>/dist/slides.pdf
npx marp --no-stdin decks/<deck-name>/slides.md -o decks/<deck-name>/dist/slides.pptx
npx marp --no-stdin decks/<deck-name>/slides.md -o decks/<deck-name>/dist/slides.html

# Batch build all decks
uv run python scripts/build.py
```

## Repo Structure

- `decks/` — All slide decks, each in `<name>/slides.md` with `dist/` for outputs
- `themes/` — Marp CSS themes: `croktile-dark`, `croktile-light`, `croktile-cn`
- `templates/` — Reusable slide structures (tech-talk, product-pitch, weekly-report)
- `assets/images/` — Shared logos and images
- `scripts/` — Build automation scripts
- `.marprc.yml` — Marp CLI configuration (theme loading, local files)

## Themes

| Theme | Best For |
|-------|----------|
| `croktile-dark` | Tech talks, conferences, developer audiences |
| `croktile-light` | Business, formal presentations |
| `croktile-cn` | Chinese-language presentations (Noto Serif SC headings) |

## Conventions

- Deck names: lowercase-kebab-case
- Always include CrokTile logo on title slides
- Use `<!-- _class: lead -->` for title/closing slides
- Keep slides concise: 6-8 bullets max per slide
- Code blocks must have language tags
