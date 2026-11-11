"""Editorial review approval must never be inferred from hashes or pending rows."""
import csv
import tempfile
import unittest
from pathlib import Path
from scripts.create_review_worksheet import generate
from scripts.audit_editorial_reviews import audit

class EditorialAuditTests(unittest.TestCase):
    def test_pending_worksheet_not_ready(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "review.csv"
            generate(str(path))
            result = audit(str(path))
            self.assertFalse(result["ready_for_import"])
            self.assertEqual(result["decisions"]["PENDING"], 700)
            self.assertEqual(result["issues"], [])

    def test_fake_approval_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "review.csv"
            generate(str(path))
            with path.open(encoding="utf-8-sig", newline="") as stream:
                reader = csv.DictReader(stream)
                rows, fields = list(reader), reader.fieldnames
            rows[0]["decision"] = "APPROVED"
            rows[0]["translation_decision"] = "APPROVED"
            with path.open("w", encoding="utf-8-sig", newline="") as stream:
                writer = csv.DictWriter(stream, fieldnames=fields)
                writer.writeheader()
                writer.writerows(rows)
            result = audit(str(path))
            self.assertFalse(result["ready_for_import"])
            self.assertTrue(any("approved verse missing" in x for x in result["issues"]))
            self.assertTrue(any("translation missing" in x for x in result["issues"]))

    def test_duplicate_id_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "review.csv"
            generate(str(path))
            with path.open(encoding="utf-8-sig", newline="") as stream:
                reader = csv.DictReader(stream)
                rows, fields = list(reader), reader.fieldnames
            rows[1]["verse_id"] = rows[0]["verse_id"]
            with path.open("w", encoding="utf-8-sig", newline="") as stream:
                writer = csv.DictWriter(stream, fieldnames=fields)
                writer.writeheader()
                writer.writerows(rows)
            self.assertTrue(any("duplicate verse ID" in x for x in audit(str(path))["issues"]))

if __name__ == "__main__":
    unittest.main()
