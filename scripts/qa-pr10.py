"""PR 10 verification: probe new routes + extract JSON-LD from a detail page."""

import json
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})

    console_errors = []
    page.on("pageerror", lambda exc: console_errors.append(str(exc)))
    page.on(
        "console",
        lambda msg: console_errors.append(f"{msg.type}: {msg.text}")
        if msg.type in ("error", "warning") and "cors" not in msg.text.lower()
        else None,
    )

    print("=== /programs index ===")
    resp = page.goto(f"{BASE}/programs", wait_until="networkidle")
    print(f"HTTP: {resp.status}")
    print(f"Title: {page.title()}")
    print(f"H1: {page.locator('h1').first.text_content()}")
    print(f"CTA count: {page.locator('[data-cta]').count()}")

    print("\n=== /programs/security-plus detail ===")
    resp = page.goto(f"{BASE}/programs/security-plus", wait_until="networkidle")
    print(f"HTTP: {resp.status}")
    print(f"Title: {page.title()}")
    print(f"H1: {page.locator('h1').first.text_content()}")
    h2_count = page.locator("h2").count()
    print(f"H2 count (expect 7: 2,3,4,5,6,7,8 = Who/Curriculum/Objectives/Outcomes/Lesson/Compare/Related plus ProposalCTA h2 = 8): {h2_count}")

    # JSON-LD extraction
    jsonld = page.locator('script[type="application/ld+json"]').inner_text()
    print("\n--- JSON-LD ---")
    try:
        parsed = json.loads(jsonld)
        print(f"@context: {parsed.get('@context')}")
        print(f"@type: {parsed.get('@type')}")
        print(f"name: {parsed.get('name')}")
        print(f"price: ${parsed.get('offers', {}).get('price')}")
        print(f"courseWorkload: {parsed.get('hasCourseInstance', {}).get('courseWorkload')}")
    except Exception as e:
        print(f"JSON-LD parse error: {e}")
        print(f"raw: {jsonld[:300]}")

    print(f"\nConsole errors (excluding /studio CORS): {len([e for e in console_errors if e])}")
    for e in console_errors[:5]:
        if e:
            print(f"  - {e[:150]}")

    browser.close()
