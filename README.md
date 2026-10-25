# Madhav–Parth AI

Web-first Bhagavad Gita guidance app by Mrunal Technologies Private Limited.

## Status
- Supabase project: `axcicuhiozoaaewlzwuw` (Mumbai).
- Initial database migration already applied remotely.
- **No verses imported or certified yet.** Never claim 700 verses verified without review.
- Repository currently public: do not commit credentials or private user data.

## Import policy
Canonical CSV columns: `id,chapter,verse,sanskrit,source_id,source_reference,sha256`.
Run:
```bash
python -m unittest discover -s tests -v
python scripts/validate_import.py data/verses.csv
python scripts/prepare_import.py data/verses.csv data/staging/verses.json
```
The validator checks 700 verse slots, unique IDs, Devanagari and SHA-256. **Hashes prove consistency, not authenticity.** A qualified reviewer must check the edition, each verse, copyright and translation rights before marking records verified. The preparation script does not write to Supabase.

## Architecture
Next.js web frontend (pending), Supabase Auth/Postgres/pgvector, server-side retrieval and AI. Only verified verses should be visible to users. Avoid exposing service-role keys. Use separate safety escalation for urgent health or self-harm concerns.

## Database
Remote schema exists already. Do not blindly rerun local migrations; reconcile migration history before deploying further DDL.
