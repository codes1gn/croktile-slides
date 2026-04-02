#!/usr/bin/env python3
"""Render preview screenshots of each Motion Canvas scene using Playwright.

Runs the Vite dev server, navigates to the editor, and captures each scene's
first frame as a PNG. Also generates a short video preview if possible.
"""
import asyncio
import os
import subprocess
import sys
import time

PROJ_DIR = os.path.dirname(os.path.abspath(__file__))
NODE_BIN = "/tmp/node-v20.18.0-linux-x64/bin"
OUT_DIR = os.path.join(PROJ_DIR, "preview")


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    env = os.environ.copy()
    env["PATH"] = f"{NODE_BIN}:{env['PATH']}"

    print("[preview] Starting Vite dev server...")
    proc = subprocess.Popen(
        ["npx", "vite", "--host", "0.0.0.0", "--port", "9050"],
        cwd=PROJ_DIR, env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    )

    port = 9050
    for _ in range(30):
        time.sleep(1)
        try:
            import urllib.request
            resp = urllib.request.urlopen(f"http://localhost:{port}/")
            if resp.status == 200:
                break
        except Exception:
            pass
    else:
        # Try reading stdout for actual port
        print("[preview] Could not connect to dev server after 30s")
        proc.kill()
        return

    print(f"[preview] Dev server ready on port {port}")

    try:
        from playwright.async_api import async_playwright
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
        from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})

        # Motion Canvas renders into a <canvas> inside the editor.
        # We'll use the presentation mode URL to get clean scene renders.
        # The editor uses an internal canvas for rendering scenes.

        # First, load the editor
        await page.goto(f"http://localhost:{port}/", wait_until="domcontentloaded")
        await page.wait_for_timeout(8000)

        # Take a screenshot of the full editor UI
        await page.screenshot(path=os.path.join(OUT_DIR, "editor-ui.png"))
        print(f"[preview] Saved editor-ui.png")

        # Try to find the canvas element and capture it
        canvas = await page.query_selector("canvas")
        if canvas:
            await canvas.screenshot(path=os.path.join(OUT_DIR, "scene-canvas.png"))
            print(f"[preview] Saved scene-canvas.png (the rendered scene)")
        else:
            print("[preview] No canvas element found. The editor may need a visible browser.")

        # Try to use the presentation view
        await page.goto(f"http://localhost:{port}/?present", wait_until="domcontentloaded")
        await page.wait_for_timeout(5000)
        await page.screenshot(path=os.path.join(OUT_DIR, "present-view.png"))
        print(f"[preview] Saved present-view.png")

        await browser.close()

    proc.kill()
    print(f"\n[preview] Done! Screenshots saved to {OUT_DIR}/")
    print(f"[preview] Files: {os.listdir(OUT_DIR)}")


if __name__ == "__main__":
    asyncio.run(main())
