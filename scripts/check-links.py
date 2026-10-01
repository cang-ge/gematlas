#!/usr/bin/env python3
"""Check that site-internal links in the VitePress build resolve to files."""
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
import posixpath
from urllib.parse import urlsplit

BASE = "/gematlas/"
DIST = Path(__file__).resolve().parents[1] / "docs" / ".vitepress" / "dist"
SKIP_SCHEMES = {"http", "https", "mailto", "tel", "javascript", "data"}


class HrefParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hrefs: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "a":
            return
        href = dict(attrs).get("href")
        if href:
            self.hrefs.add(href)


def resolve_site_path(source: Path, href: str) -> str | None:
    parsed = urlsplit(href)
    if parsed.scheme in SKIP_SCHEMES or href.startswith("//") or href.startswith("#"):
        return None

    raw_path = parsed.path
    source_rel = source.relative_to(DIST).as_posix()
    source_dir = PurePosixPath(source_rel).parent
    if raw_path.startswith(BASE):
        site_path = PurePosixPath(raw_path)
    elif raw_path.startswith("/"):
        site_path = PurePosixPath(BASE.rstrip("/")) / raw_path.lstrip("/")
    else:
        site_path = PurePosixPath(BASE.rstrip("/")) / source_dir / raw_path

    return "/" + posixpath.normpath(str(site_path)).lstrip("/")


def candidate_targets(site_path: str) -> list[Path]:
    if site_path.rstrip("/") == BASE.rstrip("/"):
        return [DIST / "index.html"]
    rel = site_path[len(BASE):] if site_path.startswith(BASE) else site_path.lstrip("/")
    rel_path = Path(*PurePosixPath(rel).parts)
    exact = DIST / rel_path
    if site_path.endswith("/"):
        return [exact / "index.html"]
    if exact.suffix:
        return [exact]
    return [exact.with_suffix(".html"), exact / "index.html"]


if not DIST.exists():
    raise SystemExit(f"Build output not found: {DIST}. Run pnpm build first.")

hrefs: set[tuple[Path, str]] = set()
for source in DIST.rglob("*.html"):
    parser = HrefParser()
    parser.feed(source.read_text(encoding="utf-8", errors="ignore"))
    for href in parser.hrefs:
        hrefs.add((source, href))

internal_links: set[str] = set()
missing: set[str] = set()
for source, href in sorted(hrefs, key=lambda item: (str(item[0]), item[1])):
    site_path = resolve_site_path(source, href)
    if site_path is None:
        continue
    internal_links.add(site_path)
    if not any(target.exists() for target in candidate_targets(site_path)):
        missing.add(site_path)

html_links = [path for path in internal_links if path.endswith(".html") or ".html#" in path]
print(f"total internal links: {len(internal_links)}")
print(f"html links: {len(html_links)}")
print(f"MISSING targets: {len(missing)}")
for path in sorted(missing)[:40]:
    print("  MISS:", path)

if missing:
    raise SystemExit(1)
