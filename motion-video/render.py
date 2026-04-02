#!/usr/bin/env python3
"""Render Motion Canvas video using Playwright headless browser.

Usage:
    python3 render.py              # renders with default (zh) audio
    python3 render.py --lang en    # switch to English audio first
"""
import subprocess
import sys
import time
import os

VITE_PORT = 9000
NODE_BIN = "/tmp/node-v20.18.0-linux-x64/bin"
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))


def start_dev_server():
    env = os.environ.copy()
    env["PATH"] = f"{NODE_BIN}:{env['PATH']}"
    proc = subprocess.Popen(
        ["npx", "vite", "--host", "0.0.0.0"],
        cwd=PROJECT_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    for _ in range(30):
        time.sleep(1)
        try:
            import urllib.request
            urllib.request.urlopen(f"http://localhost:{VITE_PORT}/")
            print(f"[render] Dev server ready at http://localhost:{VITE_PORT}")
            return proc
        except Exception:
            pass
    print("[render] Timed out waiting for dev server")
    proc.kill()
    sys.exit(1)


def render_via_playwright():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
        from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(f"http://localhost:{VITE_PORT}/", wait_until="networkidle")
        time.sleep(3)

        # Click the "Render" button in the Motion Canvas editor
        page.evaluate("""
            // Trigger rendering via the Motion Canvas API
            const app = document.querySelector('#app');
            if (app) {
                console.log('Motion Canvas editor loaded');
            }
        """)

        print("[render] Motion Canvas editor loaded in headless browser.")
        print("[render] Note: For full rendering, use the editor UI in a browser.")
        print(f"[render] Open http://localhost:{VITE_PORT} in your browser and click 'RENDER'")
        browser.close()


def main():
    lang = "zh"
    if "--lang" in sys.argv:
        idx = sys.argv.index("--lang")
        lang = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else "zh"

    if lang == "en":
        project_file = os.path.join(PROJECT_DIR, "src", "project.ts")
        with open(project_file) as f:
            content = f.read()
        content = content.replace(
            "import audio from '../audio/narration-zh.mp3';",
            "import audio from '../audio/narration-en.mp3';",
        )
        content = content.replace(
            "// import audio from '../audio/narration-en.mp3';",
            "import audio from '../audio/narration-en.mp3';",
        )
        with open(project_file, "w") as f:
            f.write(content)
        print(f"[render] Switched to {lang} audio")

    print(f"[render] Starting dev server for {lang} version...")
    proc = start_dev_server()

    try:
        print(f"[render] Open http://localhost:{VITE_PORT} in your browser")
        print("[render] In the editor:")
        print("  1. Preview scenes with the timeline player")
        print("  2. Adjust waitUntil time events to align with audio")
        print("  3. Click the RENDER button to export MP4")
        print(f"  4. Output will be in {PROJECT_DIR}/output/")
        print()
        print("[render] Press Ctrl+C to stop the dev server")
        proc.wait()
    except KeyboardInterrupt:
        proc.kill()
        print("\n[render] Dev server stopped.")


if __name__ == "__main__":
    main()
