"""List all h2 text on /programs/security-plus to find what's missing."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto("http://localhost:3000/programs/security-plus", wait_until="networkidle")

    h2s = page.locator("h2").all_text_contents()
    print(f"h2 count: {len(h2s)}")
    for i, t in enumerate(h2s, 1):
        print(f"  {i}. {t!r}")

    print("\nh3 count:", page.locator("h3").count())
    for i, t in enumerate(page.locator("h3").all_text_contents(), 1):
        print(f"  {i}. {t!r}")

    browser.close()
