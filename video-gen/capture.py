"""Record reveal.js slide playback with timed interactions using Playwright."""

import asyncio
import json
import sys
from pathlib import Path

WORK_DIR = Path(__file__).resolve().parent
NARRATION_PATH = WORK_DIR / "narration.json"
DURATIONS_PATH = WORK_DIR / "durations.json"
RECORDINGS_DIR = WORK_DIR / "recordings"

WIDTH = 1920
HEIGHT = 1080


async def wait_for_slide_ready(page):
    """Wait until reveal.js slide is fully rendered."""
    await page.wait_for_function(
        "() => typeof Reveal !== 'undefined' && Reveal.isReady()",
        timeout=15000,
    )
    await page.wait_for_timeout(600)


async def execute_action(page, action):
    """Execute a single slide action."""
    atype = action.get("type", "wait")

    if atype == "click_tab":
        tab_label = action["tab"]
        try:
            await page.evaluate(
                """(label) => {
                    const btns = document.querySelectorAll(
                        '.reveal .present .editor-tab');
                    for (const btn of btns) {
                        if (btn.textContent.trim() === label) {
                            btn.click();
                            return true;
                        }
                    }
                    return false;
                }""",
                tab_label,
            )
            await page.wait_for_timeout(400)
        except Exception as e:
            print(f"    Tab click failed for '{tab_label}': {e}")

    elif atype == "scroll":
        direction = action.get("direction", "down")
        px = action.get("px", 200)
        delta = px if direction == "down" else -px
        try:
            await page.evaluate(
                """(delta) => {
                    const el = document.querySelector(
                        '.reveal .present .slide-content') ||
                        document.querySelector('.reveal .present');
                    if (el) el.scrollBy({ top: delta, behavior: 'smooth' });
                }""",
                delta,
            )
            await page.wait_for_timeout(500)
        except Exception:
            pass

    elif atype == "wait":
        pass


async def _record_slide_on_page(page, base_url, slide, durations_for_slide):
    """Record a single slide with all its segments on an existing page."""
    idx = slide["index"]
    segments = slide["segments"]

    slide_url = f"{base_url}#/{idx}"
    await page.goto(slide_url, wait_until="domcontentloaded", timeout=30000)
    await wait_for_slide_ready(page)

    slide_class = slide.get("class", "")
    if "lead" in slide_class or "chapter" in slide_class:
        await page.wait_for_timeout(500)

    for seg_i, segment in enumerate(segments):
        seg_duration = 5.0
        if durations_for_slide and seg_i < len(durations_for_slide):
            seg_duration = durations_for_slide[seg_i]

        for action in segment.get("actions", []):
            await execute_action(page, action)

        hold_ms = int((seg_duration + 0.5) * 1000)
        await page.wait_for_timeout(hold_ms)

    await page.wait_for_timeout(300)


async def record_all(lang: str = "zh", slide_indices: list = None):
    from playwright.async_api import async_playwright

    narration = json.loads(NARRATION_PATH.read_text(encoding="utf-8"))
    meta = narration["meta"]
    base_url = meta["slide_url_base"]

    durations = {}
    if DURATIONS_PATH.exists():
        durations = json.loads(DURATIONS_PATH.read_text(encoding="utf-8"))
    lang_durations = durations.get(lang, {})

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        for slide in narration["slides"]:
            idx = slide["index"]
            if slide_indices and idx not in slide_indices:
                continue

            rec_dir = RECORDINGS_DIR / lang
            rec_dir.mkdir(parents=True, exist_ok=True)
            out_path = rec_dir / f"slide_{idx:02d}.webm"

            slide_durs = lang_durations.get(str(idx), [])
            total_dur = sum(slide_durs) + len(slide_durs) * 0.5 + 1.0

            print(f"Recording slide {idx} ({lang}), est. {total_dur:.1f}s...")

            context = await browser.new_context(
                viewport={"width": WIDTH, "height": HEIGHT},
                record_video_dir=str(rec_dir),
                record_video_size={"width": WIDTH, "height": HEIGHT},
            )

            page = await context.new_page()
            await _record_slide_on_page(page, base_url, slide, slide_durs)
            video_path = await page.video.path()
            await page.close()
            await context.close()

            if video_path and Path(video_path).exists():
                if out_path.exists():
                    out_path.unlink()
                Path(video_path).rename(out_path)
                print(f"  -> {out_path.name}")

        await browser.close()

    print(f"\nAll recordings saved to {RECORDINGS_DIR / lang}/")


def main():
    lang = "zh"
    slide_indices = None
    args = sys.argv[1:]

    for i, arg in enumerate(args):
        if arg in ("--lang", "-l") and i + 1 < len(args):
            lang = args[i + 1]
        if arg in ("--slides", "-s") and i + 1 < len(args):
            slide_indices = [int(x) for x in args[i + 1].split(",")]

    asyncio.run(record_all(lang=lang, slide_indices=slide_indices))


if __name__ == "__main__":
    main()
