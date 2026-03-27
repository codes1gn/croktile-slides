# Marp Syntax Reference

## Frontmatter

```yaml
---
marp: true
theme: croktile-dark    # or croktile-light, croktile-cn
paginate: true
header: 'CrokTile'      # optional header on every slide
footer: 'Confidential'  # optional footer
---
```

## Slide Separation

Use `---` (three dashes) on its own line to separate slides.

## Directives (per-slide)

Place HTML comments at the top of a slide:

```markdown
<!-- _class: lead -->        # centered title slide
<!-- _class: split -->       # two-column layout
<!-- _class: comparison -->  # side-by-side comparison
<!-- _backgroundColor: #000 -->
<!-- _color: white -->
<!-- _paginate: false -->    # hide page number on this slide
```

## Images

```markdown
![](path/to/image.png)              # inline image
![width:300](image.png)             # sized image
![height:200](image.png)            # sized by height
![bg](image.png)                    # full background
![bg contain](image.png)            # background, contain
![bg right:40%](image.png)          # split: image right 40%
![bg left:50%](image.png)           # split: image left 50%
![bg blur:5px](image.png)           # blurred background
![bg opacity:0.5](image.png)        # semi-transparent bg
```

## Multiple Backgrounds

```markdown
![bg](image1.png)
![bg](image2.png)
```

Stacks backgrounds side by side.

## Text Formatting

```markdown
**bold**  *italic*  ~~strikethrough~~  `inline code`
```

## Code Blocks

````markdown
```python
def hello():
    print("Hello CrokTile!")
```
````

## Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

## Math (KaTeX)

```markdown
Inline: $E = mc^2$
Block:
$$
\sum_{i=1}^{n} x_i
$$
```

## Fragmented List (click-to-reveal)

```markdown
* Item 1
* Item 2
* Item 3
```

Use `*` for fragmented (animated) lists in supported viewers.

## HTML Elements (when html: true)

```html
<div style="display: flex; gap: 20px;">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

## Logo on Title Slide

```markdown
![width:120](../../assets/images/logo-square.svg)
```

## Speaker Notes

```markdown
<!-- This is a speaker note, not shown on the slide -->
```
