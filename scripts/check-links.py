#!/usr/bin/env python3
"""Check every internal .html link in the build output resolves to a file."""
import re
from pathlib import Path

dist = Path(r"D:/Study/gematlas/docs/.vitepress/dist")
hrefs = set()
for f in dist.rglob("*.html"):
    txt = f.read_text(encoding="utf-8", errors="ignore")
    for m in re.findall(r'href="(/gematlas/[^"]*)"', txt):
        hrefs.add(m[0])

html_links = [h for h in hrefs if h.endswith(".html")]
missing = []
for h in sorted(html_links):
    rel = h[len("/gematlas/"):]
    target = dist / rel
    if not target.exists():
        missing.append(h)

print("total internal links: {}".format(len(hrefs)))
print("html links: {}".format(len(html_links)))
print("MISSING targets: {}".format(len(missing)))
for m in missing[:40]:
    print("  MISS:", m)
