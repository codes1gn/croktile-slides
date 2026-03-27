---
name: generate-slides
description: >-
  Generate Marp presentation slides from a topic or outline. Use when the user
  asks to create slides, make a presentation, build a deck, or mentions
  slides/PPT/presentation generation.
---

# Generate Slides

## Workflow

### Step 1: Gather Requirements

Ask the user (or infer from context):
- **Topic**: What is the presentation about?
- **Audience**: Who will see this? (developers, executives, general)
- **Language**: Chinese, English, or bilingual?
- **Template**: Which structure? See `templates/` for options:
  - `tech-talk` — Problem-Solution-Demo-Results
  - `product-pitch` — Pain-Solution-Value-CTA
  - `weekly-report` — Progress-Issues-Plan
- **Theme**: `croktile-dark` (default for tech), `croktile-light`, or `croktile-cn`
- **Slide count**: Rough target (default: 8-15 slides)

### Step 2: Create Deck Directory

```bash
mkdir -p decks/<deck-name>/dist
```

Use lowercase-kebab-case for deck names.

### Step 3: Generate Marp Markdown

Create `decks/<deck-name>/slides.md` with:
1. Marp frontmatter (marp, theme, paginate)
2. Title slide with logo: `![width:120](../../assets/images/logo-square.svg)`
3. Content slides following the chosen template structure
4. Closing slide

For Marp syntax details, see [marp-reference.md](marp-reference.md).

### Step 4: Preview and Iterate

```bash
export PATH="$HOME/.local/bin:$PATH"
npx marp --no-stdin decks/<deck-name>/slides.md --preview
```

Review with the user, iterate on content and layout.

### Step 5: Export

```bash
export PATH="$HOME/.local/bin:$PATH"
npx marp --no-stdin decks/<deck-name>/slides.md -o decks/<deck-name>/dist/slides.pdf
npx marp --no-stdin decks/<deck-name>/slides.md -o decks/<deck-name>/dist/slides.pptx
npx marp --no-stdin decks/<deck-name>/slides.md -o decks/<deck-name>/dist/slides.html
```

## Quality Checklist

- [ ] Frontmatter has `marp: true` and a theme
- [ ] Title slide includes CrokTile logo
- [ ] Slides are concise (max 6-8 bullets each)
- [ ] Code blocks have language tags
- [ ] No orphan slides (every slide has a purpose)
- [ ] Exported successfully to all needed formats
