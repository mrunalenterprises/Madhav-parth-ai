# Madhav–Parth AI

Web-first Bhagavad Gita guidance app by Mrunal Technologies Private Limited.

## Verified project status (November 2026)

- Supabase project: `axcicuhiozoaaewlzwuw` (Mumbai).
- Remote database has **18 chapter rows and 700 imported verse rows**. The chapter counts, unique verse IDs, source IDs and SHA-256 field lengths have been checked.
- **0 editorially verified verses, 0 translations and 0 verse embeddings** as of the last database audit. Import does **not** imply authenticity or approval.
- RLS is enabled. Public clients can read verified verses only. Therefore, public API counts **cannot** be used to infer total imported rows. The status endpoint reports *expected* verse count from chapter metadata, not imported count.
- Repository is public: never commit credentials, private user data or a Supabase service-role key.
- GitHub Actions validates Python import tooling, TypeScript and Next.js production build. Inspect Actions results before claiming build success.

## User features

- Marathi question input with preliminary Marathi/Hindi/English topic detection. `POST /api/ask` **does not yet generate AI guidance or scripture citations**.
- Chapter browser and verified-only verse reading: `GET /api/verses?chapter=2` or `GET /api/verses?chapter=2&verse=47`.
- Verified-only Sanskrit substring search: `GET /api/search?q=कर्म` (max 20 results).
- Verified-only translations with attribution and license: `GET /api/translations?verse_id=BG_02_047&lang=mr` (also `hi`, `en`).
- Public corpus readiness: `GET /api/corpus-status`.

With no approved verses or translations, search, reading and translation results will be empty or unavailable by design.

## Local development

Requires Node.js 22 and Python 3.12.

```bash
npm install
python -m unittest discover -s tests -v
npx tsc --noEmit
npm run build
npm run dev
```

Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in local environment or hosting settings. These are public Supabase client values; **never** put `SUPABASE_SERVICE_ROLE_KEY` into client code or the public repository.

## Editorial worksheet and audit

Generate a **blank**, 700-row CSV with every decision set to PENDING (the command refuses to overwrite an existing file):

```bash
python scripts/create_review_worksheet.py data/staging/editorial_review.csv
```

Review the output manually. Do **not** import its PENDING rows as approvals. Audit completed review decisions with `python scripts/audit_editorial_reviews.py data/staging/editorial_review.csv`. The audit rejects duplicate verse IDs, unsupported decisions, approved Sanskrit lacking reviewer/source/date and translations approved without source/license or an approved parent verse. This is a **preflight audit**, not a substitute for human review and it does not change database records. For authorized read-only database audits, run `scripts/audit_corpus.sql` against the project.

## Scripture editorial workflow

1. Choose an authentic Sanskrit edition and record full bibliographic source, editorial permissions and translation licenses.
2. Independently compare all 700 imported Sanskrit texts against that edition. Flag differences, spelling, punctuation, variant readings and chapter 13 numbering conventions for human review.
3. Approve each verse with reviewer identity and review timestamp only after comparison. Do not auto-mark rows `verified=true` merely because IDs and hashes pass validation.
4. Add translations in Marathi, Hindi and English with source, attribution, license and separate verification.
5. Curate topic-to-verse mappings with an editorial reviewer; then add cited retrieval and an AI response layer with safeguards against invented verses or quotations.
6. Test safety, relevance, source attribution and production deployment before public launch.

Canonical import CSV columns: `id,chapter,verse,sanskrit,source_id,source_reference,sha256`.

```bash
python scripts/validate_import.py data/verses.csv
python scripts/prepare_import.py data/verses.csv data/staging/verses.json
```

The preparation script does not write to Supabase. SHA-256 proves consistency, not authenticity. Do not blindly rerun existing database migrations; reconcile migration history before further schema changes.
