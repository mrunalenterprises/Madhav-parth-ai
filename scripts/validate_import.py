#!/usr/bin/env python3
"""Fail-closed structural validator. Human source review remains mandatory."""
import csv
import hashlib
import json
import re
import sys
from pathlib import Path

COUNTS = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 34, 27, 20, 24, 28, 78]
REQUIRED = {"id", "chapter", "verse", "sanskrit", "source_id", "source_reference", "sha256"}

def validate(path):
    with Path(path).open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        missing = REQUIRED - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Missing columns: {sorted(missing)}")
        rows = list(reader)
    errors, seen, counts = [], set(), [0] * 18
    for line, row in enumerate(rows, 2):
        try:
            chapter, verse = int(row["chapter"]), int(row["verse"])
            if chapter not in range(1, 19) or verse not in range(1, COUNTS[chapter - 1] + 1):
                raise ValueError("out of range")
            if (chapter, verse) in seen:
                raise ValueError("duplicate chapter/verse")
            seen.add((chapter, verse))
            counts[chapter - 1] += 1
            if row["id"] != f"BG_{chapter:02}_{verse:03}":
                raise ValueError("wrong id")
            sanskrit = row["sanskrit"].strip()
            if len(sanskrit) < 12 or not re.search(r"[\u0900-\u097f]", sanskrit):
                raise ValueError("missing Devanagari text")
            if not row["source_id"].strip() or not row["source_reference"].strip():
                raise ValueError("missing provenance")
            if row["sha256"].lower() != hashlib.sha256(sanskrit.encode("utf-8")).hexdigest():
                raise ValueError("sha256 mismatch")
        except (ValueError, KeyError) as exc:
            errors.append(f"row {line}: {exc}")
    for chapter, (actual, expected) in enumerate(zip(counts, COUNTS), 1):
        if actual != expected:
            errors.append(f"chapter {chapter}: {actual}/{expected}")
    if len(rows) != 700:
        errors.append(f"total: {len(rows)}/700")
    return {"valid_structure": not errors, "rows": len(rows), "errors": errors, "requires_human_source_verification": True}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: python scripts/validate_import.py data/verses.csv")
    result = validate(sys.argv[1])
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result["valid_structure"] else 1)
