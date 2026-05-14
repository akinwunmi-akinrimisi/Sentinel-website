"""QA smoke test for Sentinel Institute homepage build.

Runs against http://localhost:3000 (must be running already via `pnpm dev`).
Covers pre-launch-qa.md §3 (responsive), §4 (functional), §5 (a11y basics).

Outputs JSON report to stdout + screenshots to docs/qa-smoke/.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright, Page, ConsoleMessage

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
OUT_DIR = Path(__file__).parent.parent / "docs" / "qa-smoke"
OUT_DIR.mkdir(parents=True, exist_ok=True)

BREAKPOINTS = [
    ("mobile-375", 375, 667),
    ("tablet-768", 768, 1024),
    ("laptop-1280", 1280, 800),
    ("desktop-1920", 1920, 1080),
]

report: dict[str, Any] = {
    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    "base": BASE,
    "tests": [],
    "console_errors": [],
}


def add(name: str, status: str, **kwargs: Any) -> None:
    entry = {"name": name, "status": status}
    entry.update(kwargs)
    report["tests"].append(entry)


def attach_console_capture(page: Page, page_label: str) -> None:
    def handler(msg: ConsoleMessage) -> None:
        if msg.type in ("error", "warning"):
            report["console_errors"].append(
                {"page": page_label, "type": msg.type, "text": msg.text}
            )

    page.on("console", handler)
    page.on(
        "pageerror",
        lambda exc: report["console_errors"].append(
            {"page": page_label, "type": "pageerror", "text": str(exc)}
        ),
    )
    page.on(
        "response",
        lambda resp: report["console_errors"].append(
            {
                "page": page_label,
                "type": f"http-{resp.status}",
                "text": f"{resp.request.resource_type} {resp.url}",
            }
        )
        if resp.status >= 400
        else None,
    )


def check_homepage_at_breakpoint(browser: Any, label: str, w: int, h: int) -> None:
    context = browser.new_context(viewport={"width": w, "height": h})
    page = context.new_page()
    attach_console_capture(page, f"/ @ {label}")
    try:
        resp = page.goto(BASE, wait_until="networkidle", timeout=30000)
        status = resp.status if resp else None
        screenshot = OUT_DIR / f"home-{label}.png"
        page.screenshot(path=str(screenshot), full_page=True)

        section_ids = page.evaluate(
            "() => Array.from(document.querySelectorAll('section, [data-section]')).map(s => s.id || s.getAttribute('data-section') || s.tagName.toLowerCase()).slice(0, 30)"
        )
        title = page.title()
        h1_count = page.locator("h1").count()
        cta_count = page.locator("a[data-cta], button[data-cta]").count()

        add(
            f"home-{label}",
            "PASS" if status == 200 else "FAIL",
            http_status=status,
            title=title,
            h1_count=h1_count,
            cta_count=cta_count,
            section_count=len(section_ids),
            sections_sample=section_ids,
            screenshot=str(screenshot.relative_to(OUT_DIR.parent.parent)),
        )
    except Exception as e:
        add(f"home-{label}", "ERROR", error=str(e))
    finally:
        context.close()


def check_contact_form(browser: Any) -> None:
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    attach_console_capture(page, "/contact")
    try:
        resp = page.goto(f"{BASE}/contact", wait_until="networkidle", timeout=30000)
        status = resp.status if resp else None
        page.screenshot(path=str(OUT_DIR / "contact.png"), full_page=True)

        title = page.title()
        form_count = page.locator("form").count()
        label_count = page.locator("label").count()
        required_count = page.locator("[aria-required='true'], [required]").count()
        legend_count = page.locator("legend").count()

        add(
            "contact-load",
            "PASS" if status == 200 and form_count >= 1 else "FAIL",
            http_status=status,
            title=title,
            form_count=form_count,
            label_count=label_count,
            required_count=required_count,
            legend_count=legend_count,
        )

        # Try gmail rejection — fill email with gmail address and tab away to trigger validation
        email_input = page.locator('input[type="email"], input[name="email"]').first
        if email_input.count() > 0:
            email_input.fill("test@gmail.com")
            email_input.blur()
            page.wait_for_timeout(500)
            inline_errors = page.locator(
                "[role='alert'], [aria-live='polite'], .text-red-500, .text-destructive, .error"
            ).count()
            add(
                "contact-gmail-rejection",
                "PARTIAL" if inline_errors > 0 else "NEEDS-MANUAL-CHECK",
                inline_error_elements=inline_errors,
                note="HTML5/Zod rejection may only surface on submit; visual inspection required",
            )
        else:
            add("contact-gmail-rejection", "FAIL", error="no email input found")
    except Exception as e:
        add("contact-load", "ERROR", error=str(e))
    finally:
        context.close()


def check_thanks(browser: Any) -> None:
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    attach_console_capture(page, "/thanks")
    try:
        resp = page.goto(f"{BASE}/thanks", wait_until="networkidle", timeout=30000)
        page.screenshot(path=str(OUT_DIR / "thanks.png"), full_page=True)
        add(
            "thanks-load",
            "PASS" if resp and resp.status == 200 else "FAIL",
            http_status=resp.status if resp else None,
            title=page.title(),
        )
    except Exception as e:
        add("thanks-load", "ERROR", error=str(e))
    finally:
        context.close()


def check_studio(browser: Any) -> None:
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    attach_console_capture(page, "/studio")
    try:
        resp = page.goto(f"{BASE}/studio", wait_until="networkidle", timeout=60000)
        page.screenshot(path=str(OUT_DIR / "studio.png"), full_page=True)
        add(
            "studio-load",
            "PASS" if resp and resp.status == 200 else "FAIL",
            http_status=resp.status if resp else None,
            title=page.title(),
        )
    except Exception as e:
        add("studio-load", "ERROR", error=str(e))
    finally:
        context.close()


def check_reduced_motion(browser: Any) -> None:
    context = browser.new_context(
        viewport={"width": 1280, "height": 800}, reduced_motion="reduce"
    )
    page = context.new_page()
    attach_console_capture(page, "/ reduced-motion")
    try:
        resp = page.goto(BASE, wait_until="networkidle", timeout=30000)
        page.screenshot(path=str(OUT_DIR / "home-reduced-motion.png"), full_page=True)
        add(
            "reduced-motion-load",
            "PASS" if resp and resp.status == 200 else "FAIL",
            http_status=resp.status if resp else None,
            note="verifies page renders cleanly under prefers-reduced-motion: reduce",
        )
    except Exception as e:
        add("reduced-motion-load", "ERROR", error=str(e))
    finally:
        context.close()


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for label, w, h in BREAKPOINTS:
                check_homepage_at_breakpoint(browser, label, w, h)
            check_contact_form(browser)
            check_thanks(browser)
            check_studio(browser)
            check_reduced_motion(browser)
        finally:
            browser.close()

    report_path = OUT_DIR / "report.json"
    report_path.write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    failures = [t for t in report["tests"] if t["status"] in ("FAIL", "ERROR")]
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
