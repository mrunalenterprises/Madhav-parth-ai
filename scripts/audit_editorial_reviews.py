#!/usr/bin/env python3
"""Audit human editorial decisions without changing database approval flags."""
import csv
import re
import sys
from collections import Counter
from pathlib import Path

VALID_DECISIONS = {"PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"}
VALID_TRANSLATIONS = {"PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"}
REQUIRED = {"verse_id", "edition_reference", "sanskrit_matches", "reviewer",
            "review_date", "decision", "translation_decision"}
VERSE_ID = re.compile(r"BG_(0[1-9]|1[0-8])_(\d{3})$")
DATE = re.compile(r"\d{4}-\d{2}-\d{2}$")

def audit(path):
    with Path(path).open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        missing = REQUIRED - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Missing required columns: {sorted(missing)}")
        rows = list(reader)
    issues, seen = [], set()
    counts = Counter()
    for row_num, row in enumerate(rows, start=2):
        verse_id = (row.get("verse_id") or "").strip()
        decision = (row.get("decision") or "").strip().upper()
        trans_decision = (row.get("translation_decision") or "").strip().upper()
        if not VERSE_ID.fullmatch(verse_id):
            issues.append(f"row {row_num}: invalid verse ID")
        if verse_id in seen:
            issues.append(f"row {row_num}: duplicate verse ID")
        seen.add(verse_id)
        if decision not in VALID_DECISIONS:
            issues.append(f"row {row_num}: invalid verse decision")
        if trans_decision not in VALID_TRANSLATIONS:
            issues.append(f"row {row_num}: invalid translation decision")
        counts[decision] += 1
        if decision == "APPROVED":
            if not all((row.get(field) or "").strip() for field in
                       ("edition_reference", "reviewer", "review_date")):
                issues.append(f"row {row_num}: approved verse missing source/reviewer/date")
            if (row.get("sanskrit_matches") or "").strip().upper() != "YES":
                issues.append(f"row {row_num}: approved verse missing affirmative text comparison")
            if not DATE.fullmatch((row.get("review_date") or "").strip()):
                issues.append(f"row {row_num}: review date must be YYYY-MM-DD")
        if trans_decision == "APPROVED":
            if decision != "APPROVED":
                issues.append(f"row {row_num}: translation approved without approved Sanskrit")
            if not all((row.get(field) or "").strip() for field in
                       ("translation_language", "translation_source", "translation_license")):
                issues.append(f"row {row_num}: translation missing language/source/license")
            if (row.get("translation_language") or "").strip() not in {"mr", "hi", "en"}:
                issues.append(f"row {row_num}: unsupported translation language")
    return {"rows": len(rows), "decisions": dict(counts),
            "ready_for_import": not issues and len(rows) == 700 and counts["APPROVED"] == 700,
            "issues": issues + ([] if len(rows) == 700 else [f"expected 700 rows, found {len(rows)}"])}

if __name__ == "__main__":
    import json
    if len(sys.argv) != 2:
        sys.exit("Usage: python scripts/audit_editorial_reviews.py review.csv")
    report = audit(sys.argv[1])
    print(json.dumps(report, ensure_ascii=False, indent=2))
    sys.exit(0 if not report["issues"] else 1)
