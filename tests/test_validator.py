import unittest
from scripts.validate_import import COUNTS

class ValidatorTests(unittest.TestCase):
    def test_700_slots(self):
        self.assertEqual(sum(COUNTS), 700)

    def test_18_chapters(self):
        self.assertEqual(len(COUNTS), 18)

if __name__ == "__main__":
    unittest.main()
