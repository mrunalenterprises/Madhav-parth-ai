#!/usr/bin/env python3
"""Generate a blank 700-row editorial review worksheet. Does not approve verses."""
import csv
from pathlib import Path

COUNTS = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 34, 27, 20, 24, 28, 78]
FIELDS = [
    "verse_id", "chapter", "verse", "edition_reference", "sanskrit_matches",
    "variant_notes", "reviewer", "review_date", "decision",
    "translation_language", "translation_source", "translation_license",
    "translation_decision"
]

def generate(path: str) -> int:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        raise FileExistsError(f"Refusing to overwrite existing review data: {target}")
    with target.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=FIELDS)
        writer.writeheader()
        for chapter, count in enumerate(COUNTS, start=1):
            for verse in range(1, count + 1):
                writer.writerow({
                    "verse_id": f"BG_{chapter:02}_{verse:03}",
                    "chapter": chapter, "verse": verse,
                    "decision": "PENDING", "translation_decision": "PENDING"
                })
    return sum(COUNTS)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("output", help="Output CSV path (must not already exist)")
    args = parser.parse_args()
    print(f"Created {generate(args.output)} pending editorial review rows.")
