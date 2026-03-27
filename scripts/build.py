"""Batch build all Marp slide decks in the decks/ directory."""

import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DECKS_DIR = REPO_ROOT / "decks"
FORMATS = ["pdf", "pptx", "html"]


def find_decks() -> list[Path]:
    """Find all slides.md files under decks/."""
    if not DECKS_DIR.exists():
        return []
    return sorted(DECKS_DIR.glob("*/slides.md"))


def build_deck(slides_path: Path, formats: list[str] | None = None):
    """Build a single deck into all requested formats."""
    dist_dir = slides_path.parent / "dist"
    dist_dir.mkdir(exist_ok=True)

    for fmt in formats or FORMATS:
        output = dist_dir / f"slides.{fmt}"
        cmd = ["npx", "marp", "--no-stdin", str(slides_path), "-o", str(output)]
        print(f"  Building {output.relative_to(REPO_ROOT)} ...")
        result = subprocess.run(cmd, cwd=REPO_ROOT, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"  ERROR: {result.stderr.strip()}")
        else:
            print(f"  OK: {output.relative_to(REPO_ROOT)}")


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else None
    formats = None
    if "--format" in sys.argv:
        idx = sys.argv.index("--format")
        formats = sys.argv[idx + 1].split(",")

    if target:
        slides_path = DECKS_DIR / target / "slides.md"
        if not slides_path.exists():
            print(f"Deck not found: {slides_path}")
            sys.exit(1)
        print(f"Building deck: {target}")
        build_deck(slides_path, formats)
    else:
        decks = find_decks()
        if not decks:
            print("No decks found in decks/")
            sys.exit(0)
        print(f"Found {len(decks)} deck(s)")
        for slides_path in decks:
            deck_name = slides_path.parent.name
            print(f"\nBuilding deck: {deck_name}")
            build_deck(slides_path, formats)

    print("\nDone.")


if __name__ == "__main__":
    main()
