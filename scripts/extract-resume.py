#!/usr/bin/env python3
"""Extract text from the user's resume PDF and write to a txt file."""
import fitz

src = r"H:/我的E盘数据/工具/study/GitHub/Auto-CV/resume.pdf"
out = r"D:/Study/gematlas/_resume_text.txt"
doc = fitz.open(src)
lines = []
lines.append("PAGES: {}".format(len(doc)))
for i, page in enumerate(doc):
    lines.append("===== PAGE {} =====".format(i + 1))
    lines.append(page.get_text())
with open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print("extracted {} pages -> {}".format(len(doc), out))
