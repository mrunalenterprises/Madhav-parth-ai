import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ message: "Database connection not configured." }, { status: 503 });
  }
  const db = createClient(url, key);
  const [total, verified, translations] = await Promise.all([
    db.from("verses").select("id", { count: "exact", head: true }),
    db.from("verses").select("id", { count: "exact", head: true }).eq("verified", true),
    db.from("translations").select("id", { count: "exact", head: true }).eq("verified", true)
  ]);
  if (total.error || verified.error || translations.error) {
    return NextResponse.json({ message: "Corpus status is temporarily unavailable." }, { status: 503 });
  }
  return NextResponse.json({
    importedVerses: total.count ?? 0,
    editoriallyVerifiedVerses: verified.count ?? 0,
    verifiedTranslations: translations.count ?? 0,
    readyForCitedAnswers: (verified.count ?? 0) > 0 && (translations.count ?? 0) > 0,
    note: "Import and hash checks do not establish textual authenticity."
  }, { headers: { "Cache-Control": "no-store" } });
}
