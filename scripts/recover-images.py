#!/usr/bin/env python3
"""Recover images deleted by the buggy reprioritize script.

Reads each deleted tracked image blob from git HEAD and writes it back.
Pure recovery: only recreates files that exist in HEAD but are missing now.
"""
import subprocess
from pathlib import Path

BASE = Path(r"D:/Study/gematlas")
r = subprocess.run(
    ["git", "ls-files", "--deleted", "docs/images/gems/"],
    cwd=str(BASE), capture_output=True, text=True)
deleted = [l.strip() for l in r.stdout.splitlines() if l.strip()]
print("deleted tracked images: {}".format(len(deleted)))
restored = 0
for rel in deleted:
    path = BASE / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    # read blob from HEAD
    sr = subprocess.run(["git", "show", "HEAD:" + rel], cwd=str(BASE),
                        capture_output=True)
    if sr.returncode == 0:
        path.write_bytes(sr.stdout)
        restored += 1
print("restored: {}".format(restored))
