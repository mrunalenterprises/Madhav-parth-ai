-- Read-only corpus quality audit. Run with authorized database access.
-- Structural checks do not constitute Sanskrit authenticity review.
select
  count(*) as imported_rows,
  count(distinct id) as unique_ids,
  count(*) filter (where verified is true) as verified_rows,
  count(*) filter (where nullif(trim(sanskrit), '') is null) as blank_sanskrit,
  count(*) filter (where nullif(trim(source_id), '') is null) as missing_source_ids,
  count(*) filter (where nullif(trim(source_reference), '') is null) as missing_source_references,
  count(*) filter (where sha256 is null or length(trim(sha256)) <> 64) as invalid_hash_lengths,
  count(*) filter (where id <> 'BG_' || lpad(chapter::text, 2, '0') || '_' || lpad(verse::text, 3, '0')) as invalid_ids
from public.verses;

select c.number as chapter,
       c.expected_verses,
       count(v.id) as imported_rows,
       count(v.id) filter (where v.verified is true) as approved_rows,
       count(distinct v.verse) as distinct_verse_numbers
from public.chapters c
left join public.verses v on v.chapter = c.number
group by c.number, c.expected_verses
order by c.number;

select
  (select count(*) from public.translations) as total_translations,
  (select count(*) from public.translations where verified is true) as approved_translations,
  (select count(*) from public.verse_embeddings) as embeddings,
  (select count(*) from public.verse_topics) as topic_mappings;
