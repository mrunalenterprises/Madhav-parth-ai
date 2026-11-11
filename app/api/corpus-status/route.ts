import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ message: "Database not configured." }, { status: 503 });
  const db = createClient(url, key);
  const [chapters, verified, translations] = await Promise.all([
    db.from("chapters").select("expected_verses"),
    db.from("verses").select("id", { count: "exact", head: true }).eq("verified", true),
    db.from("translations").select("id", { count: "exact", head: true }).eq("verified", true)
  ]);
  if (chapters.error || verified.error || translations.error) {
    return NextResponse.json({ message: "Corpus status unavailable." }, { status: 503 });
  }
  const expectedVerses = (chapters.data ?? []).reduce((sum, c) => sum + Number(c.expected_verses ?? 0), 0);
  return NextResponse.json({
    expectedVerses,
    editoriallyVerifiedVerses: verified.count ?? 0,
    verifiedTranslations: translations.count ?? 0,
    readyForCitedAnswers: false, // Cited retrieval and editorial topic mapping are not implemented yet.
    note: "Expected verse count comes from chapter metadata, not hidden imported rows. Hash checks do not establish authenticity."
  }, { headers: { "Cache-Control": "no-store" } });
}
