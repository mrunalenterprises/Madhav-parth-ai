# Sanskrit import report — 2026-10-25

Supabase project: `axcicuhiozoaaewlzwuw`
- 700 Sanskrit records staged in `public.verses`, across 18 chapters.
- Source: [AdiyogiArts/gita-json base.json](https://github.com/AdiyogiArts/gita-json/blob/main/base.json), attributed to AdiyogiArts (MIT license as declared by repository).
- Source contains **701** records because chapter 13 has **35** entries.
- For the **700**-verse numbering convention, source `13-1` (Arjuna's introductory question) was excluded. Source `13-2` through `13-35` are stored as canonical chapter 13 verses 1 through 34. Original source chapter/verse is preserved in `source_reference`.
- All `verified=false`. Structural completeness does not imply textual or theological verification.
- `sha256` stores SHA-256 of the imported Sanskrit text. It does not establish authenticity.
- No translations or commentaries imported.
- The application must not show unverified text as authenticated Bhagavad Gita scripture. Source comparison and editorial review remain required.
