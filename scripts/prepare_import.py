#!/usr/bin/env python3
"""Prepare JSON from structurally valid CSV, without approving or uploading verses."""
import argparse
import csv
import json
from pathlib import Path
try:
    from .validate_import import validate
except ImportError:
    from validate_import import validate

def prepare(source, output):
    result = validate(source)
    if not result["valid_structure"]:
        raise ValueError("Import blocked: " + "; ".join(result["errors"][:15]))
    with open(source, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    records = [
        {k: row[k].strip() for k in ("id", "sanskrit", "source_id", "source_reference", "sha256")}
        | {"chapter": int(row["chapter"]), "verse": int(row["verse"]), "verified": False}
        for row in rows
    ]
    Path(output).parent.mkdir(parents=True, exist_ok=True)
    Path(output).write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    return len(records)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("csv")
    parser.add_argument("output")
    args = parser.parse_args()
    print(f"Prepared {prepare(args.csv, args.output)} unverified records.")
