#!/usr/bin/env python3
"""Fail when README.md forgets a versioned Pi asset."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
README = (ROOT / "README.md").read_text()


def has_heading(name: str) -> bool:
    return re.search(rf"^###\s+{re.escape(name)}\s*$", README, re.MULTILINE) is not None


def has_table_item(name: str) -> bool:
    return re.search(rf"^\|\s*`{re.escape(name)}`\s*\|", README, re.MULTILINE) is not None


checks: dict[str, list[str]] = {
    "skills": [p.parent.name for p in sorted((ROOT / "skills").glob("*/SKILL.md")) if not has_heading(p.parent.name)],
    "cron jobs": [j["id"] for j in json.loads((ROOT / "cron/jobs.json").read_text())["jobs"] if not has_heading(j["id"])],
    "prompt templates": [p.stem for p in sorted((ROOT / "prompts").glob("*.md")) if not has_table_item(f"/{p.stem}")],
    "automations": [p.parent.name for p in sorted((ROOT / "automations").glob("*/automation.toml")) if not has_table_item(p.parent.name)],
    "extensions": [p.stem for p in sorted(ROOT.glob("extensions/*")) if p.suffix in {".ts", ".js"} and not has_heading(p.stem)],
}

missing = {kind: names for kind, names in checks.items() if names}
if missing:
    print("README.md inventory is missing:", file=sys.stderr)
    for kind, names in missing.items():
        print(f"  {kind}: {', '.join(names)}", file=sys.stderr)
    sys.exit(1)

print("README.md inventory OK")
