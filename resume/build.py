"""Renders resume/resume.html to public/resume.pdf with headless Chromium.

Needs Playwright:  pip install playwright && python -m playwright install chromium
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resume" / "resume.html"
TARGETS = [
    ROOT / "public" / "resume.pdf",
    # Older links point here, so it gets the same file.
    ROOT / "public" / "Eberechukwu-Uchechukwu-Gerald-Resume.pdf",
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(SOURCE.as_uri())
    pdf = page.pdf(format="A4", print_background=True, prefer_css_page_size=True)
    browser.close()

for target in TARGETS:
    target.write_bytes(pdf)
    print(f"wrote {target.relative_to(ROOT)} ({len(pdf) // 1024} KB)")
