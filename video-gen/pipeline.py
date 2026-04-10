#!/usr/bin/env python3
"""
CroqTile Slides-to-Video Pipeline
==================================
Orchestrates: parse -> tts -> capture -> assemble

Usage:
    python pipeline.py parse              # Generate narration.json skeleton
    python pipeline.py tts [--lang zh]    # Generate TTS audio
    python pipeline.py capture [--lang zh] # Record slide videos
    python pipeline.py assemble [--lang zh] # Assemble final MP4
    python pipeline.py all [--lang zh]    # Run full pipeline
    python pipeline.py preview            # Quick 3-slide preview

Options:
    --lang, -l     Language: zh, en, or both (default: both for tts, zh for others)
    --slides, -s   Comma-separated slide indices (e.g. 0,3,4)
"""

import asyncio
import json
import subprocess
import sys
from pathlib import Path

WORK_DIR = Path(__file__).resolve().parent


def cmd_parse(args):
    """Parse slides and generate narration skeleton."""
    from parse_slides import main as parse_main
    sys.argv = ["parse_slides.py", "--skeleton"]
    parse_main()


def cmd_tts(args):
    """Generate TTS audio from narration.json."""
    from tts_gen import generate_all

    lang = None
    slide_indices = None
    for i, arg in enumerate(args):
        if arg in ("--lang", "-l") and i + 1 < len(args):
            lang = args[i + 1]
        if arg in ("--slides", "-s") and i + 1 < len(args):
            slide_indices = [int(x) for x in args[i + 1].split(",")]

    print("=" * 60)
    print("Phase 2: TTS Audio Generation")
    print("=" * 60)
    asyncio.run(generate_all(lang=lang, slide_indices=slide_indices))


def cmd_capture(args):
    """Record slide playback with Playwright."""
    from capture import record_all

    lang = "zh"
    slide_indices = None
    for i, arg in enumerate(args):
        if arg in ("--lang", "-l") and i + 1 < len(args):
            lang = args[i + 1]
        if arg in ("--slides", "-s") and i + 1 < len(args):
            slide_indices = [int(x) for x in args[i + 1].split(",")]

    print("=" * 60)
    print(f"Phase 3: Slide Video Capture ({lang})")
    print("=" * 60)

    # Check if slide server is running
    import urllib.request
    narration = json.loads((WORK_DIR / "narration.json").read_text(encoding="utf-8"))
    base_url = narration["meta"]["slide_url_base"]
    try:
        urllib.request.urlopen(base_url, timeout=3)
    except Exception:
        print(f"\nERROR: Slide server not reachable at {base_url}")
        print("Start it first with: npm run dev  (or: node scripts/serve.js)")
        print("from the croqtile-slides/ directory.\n")
        sys.exit(1)

    asyncio.run(record_all(lang=lang, slide_indices=slide_indices))


def cmd_assemble(args):
    """Assemble final video from recordings + audio."""
    from assemble import assemble_final

    lang = "zh"
    slide_indices = None
    for i, arg in enumerate(args):
        if arg in ("--lang", "-l") and i + 1 < len(args):
            lang = args[i + 1]
        if arg in ("--slides", "-s") and i + 1 < len(args):
            slide_indices = [int(x) for x in args[i + 1].split(",")]

    print("=" * 60)
    print(f"Phase 4: Video Assembly ({lang})")
    print("=" * 60)
    assemble_final(lang=lang, slide_indices=slide_indices)


def cmd_preview(args):
    """Generate a quick 3-slide preview (slides 0, 3, 4)."""
    preview_slides = "0,3,4"
    lang = "zh"
    for i, arg in enumerate(args):
        if arg in ("--lang", "-l") and i + 1 < len(args):
            lang = args[i + 1]

    print("=" * 60)
    print(f"PREVIEW MODE: slides {preview_slides} ({lang})")
    print("=" * 60)

    cmd_tts(["--lang", lang, "--slides", preview_slides])
    cmd_capture(["--lang", lang, "--slides", preview_slides])
    cmd_assemble(["--lang", lang, "--slides", preview_slides])


def cmd_all(args):
    """Run the full pipeline for both languages."""
    lang = None
    for i, arg in enumerate(args):
        if arg in ("--lang", "-l") and i + 1 < len(args):
            lang = args[i + 1]

    languages = [lang] if lang else ["zh", "en"]

    for lng in languages:
        print("\n" + "=" * 60)
        print(f"FULL PIPELINE — {lng}")
        print("=" * 60)
        cmd_tts(["--lang", lng])
        cmd_capture(["--lang", lng])
        cmd_assemble(["--lang", lng])

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    output_dir = WORK_DIR / "output"
    for f in sorted(output_dir.glob("croqtile-intro-*.mp4")):
        size_mb = f.stat().st_size / (1024 * 1024)
        print(f"  {f.name}  ({size_mb:.1f} MB)")
    print("=" * 60)


COMMANDS = {
    "parse": cmd_parse,
    "tts": cmd_tts,
    "capture": cmd_capture,
    "assemble": cmd_assemble,
    "preview": cmd_preview,
    "all": cmd_all,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        print("Available commands:", ", ".join(COMMANDS.keys()))
        sys.exit(0)

    command = sys.argv[1]
    if command not in COMMANDS:
        print(f"Unknown command: {command}")
        print("Available:", ", ".join(COMMANDS.keys()))
        sys.exit(1)

    COMMANDS[command](sys.argv[2:])


if __name__ == "__main__":
    main()
