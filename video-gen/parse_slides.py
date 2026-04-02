"""Parse reveal.js slide HTML to extract structure for narration scripting."""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

DECK_PATH = Path(__file__).resolve().parent.parent / "decks" / "croktile-intro" / "index.html"
OUTPUT_PATH = Path(__file__).resolve().parent / "narration.json"


class SlideParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.slides = []
        self._in_section = 0
        self._section_depth = 0
        self._current = None
        self._tag_stack = []
        self._capture_text = False
        self._text_buf = ""

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)

        if tag == "section" and self._section_depth == 0:
            cls = attr_dict.get("class", "")
            self._current = {
                "index": len(self.slides),
                "class": cls,
                "title": "",
                "has_tabs": False,
                "tab_labels": [],
                "is_dense": "dense" in cls,
                "is_chapter": "chapter" in cls,
                "is_lead": "lead" in cls,
                "has_pattern_showcase": False,
                "has_editor_block": False,
            }
            self._in_section = True
            self._section_depth = 1
        elif tag == "section":
            self._section_depth += 1

        if not self._in_section:
            return

        if tag in ("h1", "h2"):
            self._capture_text = True
            self._text_buf = ""

        if tag == "div":
            cls = attr_dict.get("class", "")
            if "editor-showcase" in cls:
                self._current["has_tabs"] = True
                if "pattern-showcase" in cls:
                    self._current["has_pattern_showcase"] = True
                data_tabs = attr_dict.get("data-tabs", "")
                if data_tabs:
                    try:
                        tabs = json.loads(data_tabs)
                        self._current["tab_labels"].extend(
                            t.get("file", "") for t in tabs
                        )
                    except json.JSONDecodeError:
                        pass
            if "editor-block" in cls:
                self._current["has_editor_block"] = True

    def handle_endtag(self, tag):
        if tag == "section" and self._in_section:
            self._section_depth -= 1
            if self._section_depth == 0:
                self._in_section = False
                self.slides.append(self._current)
                self._current = None

        if tag in ("h1", "h2") and self._capture_text:
            self._capture_text = False
            if self._current and not self._current["title"]:
                self._current["title"] = re.sub(r"\s+", " ", self._text_buf).strip()

    def handle_data(self, data):
        if self._capture_text:
            self._text_buf += data

    def handle_entityref(self, name):
        if self._capture_text:
            entities = {"amp": "&", "lt": "<", "gt": ">", "mdash": "—", "rarr": "→", "times": "×", "middot": "·"}
            self._text_buf += entities.get(name, f"&{name};")


def build_skeleton(slides):
    """Build a narration.json skeleton from parsed slide data."""
    result = {
        "meta": {
            "title": "CrokTile: Next-Gen GPU & DSA Kernel Language",
            "voices": {
                "zh": "zh-CN-YunxiNeural",
                "en": "en-US-AndrewNeural",
            },
            "rate": {"zh": "+0%", "en": "+0%"},
            "slide_url_base": "http://localhost:8000/decks/croktile-intro/index.html",
        },
        "slides": [],
    }

    for s in slides:
        entry = {
            "index": s["index"],
            "title": s["title"],
            "class": s["class"],
            "has_tabs": s["has_tabs"],
            "tab_labels": s["tab_labels"],
            "is_dense": s["is_dense"],
            "segments": [],
        }

        if s["has_tabs"] and s["tab_labels"]:
            for tab in s["tab_labels"]:
                entry["segments"].append({
                    "narration_zh": f"[TODO: {s['title']} — {tab} 中文配音]",
                    "narration_en": f"[TODO: {s['title']} — {tab} English narration]",
                    "actions": [{"type": "click_tab", "tab": tab}],
                })
        else:
            entry["segments"].append({
                "narration_zh": f"[TODO: {s['title']} 中文配音]",
                "narration_en": f"[TODO: {s['title']} English narration]",
                "actions": [{"type": "wait"}],
            })

        result["slides"].append(entry)

    return result


def main():
    html = DECK_PATH.read_text(encoding="utf-8")
    parser = SlideParser()
    parser.feed(html)

    print(f"Parsed {len(parser.slides)} slides:")
    for s in parser.slides:
        tabs = f"  tabs: {s['tab_labels']}" if s['tab_labels'] else ""
        flags = []
        if s["is_lead"]:
            flags.append("lead")
        if s["is_chapter"]:
            flags.append("chapter")
        if s["is_dense"]:
            flags.append("dense")
        flag_str = f"  [{', '.join(flags)}]" if flags else ""
        print(f"  #{s['index']:2d}: {s['title']}{flag_str}{tabs}")

    skeleton = build_skeleton(parser.slides)

    if "--skeleton" in sys.argv:
        out = OUTPUT_PATH if "--out" not in sys.argv else Path(sys.argv[sys.argv.index("--out") + 1])
        out.write_text(json.dumps(skeleton, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\nSkeleton written to {out}")


if __name__ == "__main__":
    main()
