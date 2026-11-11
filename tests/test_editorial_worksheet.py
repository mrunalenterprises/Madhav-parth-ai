"""Tests for fail-closed editorial worksheet generation."""
import csv
import tempfile
import unittest
from pathlib import Path
from scripts.create_review_worksheet import generate, COUNTS

class EditorialWorksheetTests(unittest.TestCase):
    def test_generates_all_700_pending_slots(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "reviews.csv"
            self.assertEqual(generate(str(target)), 700)
            with target.open(encoding="utf-8-sig", newline="") as stream:
                rows = list(csv.DictReader(stream))
            self.assertEqual(len(rows), 700)
            self.assertEqual(rows[0]["verse_id"], "BG_01_001")
            self.assertEqual(rows[-1]["verse_id"], "BG_18_078")
            self.assertEqual(sum(COUNTS), 700)
            self.assertEqual(len({r["verse_id"] for r in rows}), 700)
            self.assertTrue(all(r["decision"] == "PENDING" for r in rows))
            self.assertTrue(all(r["translation_decision"] == "PENDING" for r in rows))
            self.assertTrue(all(not r["reviewer"] for r in rows))

    def test_does_not_overwrite_editorial_work(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "reviews.csv"
            target.write_text("existing reviewed data", encoding="utf-8")
            with self.assertRaises(FileExistsError):
                generate(str(target))
            self.assertEqual(target.read_text(encoding="utf-8"), "existing reviewed data")

if __name__ == "__main__":
    unittest.main()
