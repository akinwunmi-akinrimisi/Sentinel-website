"""Verify the branded 404 renders correctly on a known-missing route."""

from playwright.sync_api import sync_playwright

URL = "http://localhost:3000/programs/typo-not-real"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    resp = page.goto(URL, wait_until="networkidle")

    print(f"HTTP: {resp.status}")
    print(f"Title: {page.title()}")
    print(f"h1 text: {page.locator('h1').first.text_content()}")
    print(f"primary CTA: {page.locator('[data-cta=\"not-found-primary\"]').count()} found")
    print(f"secondary CTA: {page.locator('[data-cta=\"not-found-secondary\"]').count()} found")
    print(f"Header present: {page.locator('header').count() > 0}")
    print(f"Footer present: {page.locator('footer[role=contentinfo]').count() > 0}")
    print(f"404 numeral has aria-hidden: {page.locator('[aria-hidden=\"true\"]').count()} aria-hidden elements")

    page.screenshot(path="docs/qa-smoke/branded-404.png", full_page=True)

    browser.close()
