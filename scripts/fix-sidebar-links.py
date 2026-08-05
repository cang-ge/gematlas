"""Rewrite all relative sidebar link values to absolute paths.

Walks the file line-by-line, tracks the current sidebar-block base
(identified by a `    '/.../':` line at indent 4) and prefixes every
relative `link: 'X'` (X not starting with / or http) with that base.

Also handles nested `items: [...]` correctly: when a `text: 'X'` appears
inside nested `items`, the current base is still the outermost sidebar
key (until a closing `},` resets it).
"""
import re
from pathlib import Path

P = Path("docs/.vitepress/config.ts")
text = P.read_text(encoding="utf-8")
lines = text.splitlines(keepends=True)

# We track `current_base` = the sidebar key like '/zh/classification/'
# or '/cutting/' or '/zh/cutting/'. It updates on a new key line at indent 4
# and on the closing of the function (top-level `}\n`).
current_base = ""
# Track function-scope: detect entering a sidebar function and leaving.
# sidebarEn/Zh: at indent 0, `function sidebarEn() {`. At indent 0, `}` ends it.
# When inside a function, the current_base updates as we see `'/...':` lines.

in_sidebar_fn = False
sidebar_prefix = ""  # '' for EN, '/zh' for ZH — used to construct absolute paths

out = []
i = 0
while i < len(lines):
    ln = lines[i]
    # Detect entering a sidebar function
    if re.match(r"^function sidebar\w+\(\) \{", ln):
        in_sidebar_fn = True
        sidebar_prefix = "/zh" if "Zh" in ln else ""
        current_base = ""
        out.append(ln)
        i += 1
        continue
    # Detect leaving a sidebar function (top-level `}`)
    if in_sidebar_fn and ln.strip() == "}":
        in_sidebar_fn = False
        current_base = ""
        out.append(ln)
        i += 1
        continue
    # Detect a new sidebar key at indent 4
    if in_sidebar_fn:
        m_key = re.match(r"^    '(/[^']+/)':", ln)
        if m_key:
            key = m_key.group(1)  # e.g. '/zh/classification/' or '/cutting/'
            # Normalize: strip the trailing slash for prepending
            base = key.rstrip("/")
            # If the key doesn't start with '/zh/', prepend the locale
            if sidebar_prefix == "/zh" and not base.startswith("/zh"):
                base = "/zh" + base
            current_base = base
            out.append(ln)
            i += 1
            continue
        # Look for any link: 'X' that is relative
        m_link = re.search(r"link: '([^'/][^']*)'", ln)
        if m_link and current_base:
            rel = m_link.group(1)
            if rel != "intro":  # safety
                new = f"link: '{current_base}/{rel}'"
                ln = ln.replace(f"link: '{rel}'", new, 1)
    out.append(ln)
    i += 1

P.write_text("".join(out), encoding="utf-8")
print("rewrote sidebar links to absolute")
