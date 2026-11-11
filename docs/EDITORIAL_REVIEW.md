# Bhagavad Gita editorial review protocol

**Current status:** 700 imported records, zero approved verses and zero approved translations at last audit. Never bulk-approve without independent review.

## Verse approval checklist

For every `BG_CC_VVV` record:

1. Verify chapter and verse numbering against the chosen authoritative edition. Note alternative numbering, especially chapter 13.
2. Compare every Devanagari character and word boundary to the source. Check punctuation, sandhi, accents and any variant readings.
3. Record the edition, publisher, year, page or stable source URL and reviewer identity. A source identifier or hash alone is not proof.
4. Record any discrepancy and its resolution. Escalate disputed readings to a second reviewer.
5. Only then set the existing `verified`, `verified_by`, `verified_at` fields through an authenticated editorial workflow. Never expose such writes to public/anonymous users.

## Translation approval checklist

- Review Marathi, Hindi and English **separately**. A verified Sanskrit verse does not verify a translation.
- Record translator, publisher, source, license and permissions for reuse. Avoid copying copyrighted translations without permission.
- Distinguish translation from commentary. Do not present AI paraphrases as scripture quotations.
- Check meaning, tone, terminology and completeness against the approved Sanskrit source.
- Verify a translation only after both the Sanskrit verse and translation have been approved.

## Public release gates

- Approved verses must be readable under public RLS; unapproved verses must remain hidden.
- Approved translations must be visible only when the parent verse is also approved.
- AI citations must point to existing approved `chapter.verse` records, never generated identifiers.
- Retrieval must return a clear unavailable message when there are no suitable approved sources.
- Run automated checks and a manual test of sensitive questions, source accuracy and multilingual display before production launch.

## Reviewer worksheet columns

`verse_id,edition_reference,sanskrit_matches,variant_notes,reviewer,review_date,decision,translation_language,translation_source,translation_license,translation_decision`

The worksheet is for editorial tracking, **not** an automatic database import or approval mechanism.
