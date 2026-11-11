import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const LANGS = new Set(["mr", "hi", "en"]);
export async function GET(request: NextRequest) {
  const verseId = request.nextUrl.searchParams.get("verse_id") ?? "";
  const lang = request.nextUrl.searchParams.get("lang") ?? "mr";
  if (!/^BG_(0[1-9]|1[0-8])_\d{3}$/.test(verseId) || !LANGS.has(lang)) {
    return NextResponse.json({ message: "Invalid verse ID or language." }, { status: 400 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ message: "Database not configured." }, { status: 503 });
  const db = createClient(url, key);
  const [verse, translations] = await Promise.all([
    db.from("verses").select("id").eq("id", verseId).eq("verified", true).maybeSingle(),
    db.from("translations").select("content,lang,source_id,license")
      .eq("verse_id", verseId).eq("lang", lang).eq("verified", true).limit(10)
  ]);
  if (verse.error || translations.error) return NextResponse.json({ message: "Translations unavailable." }, { status: 503 });
  if (!verse.data) return NextResponse.json({ message: "Verse is not editorially verified." }, { status: 404 });
  return NextResponse.json({
    verseId, lang, translations: translations.data ?? [],
    message: translations.data?.length ? undefined : "या श्लोकाचा प्रमाणित अर्थ अजून उपलब्ध नाही."
  }, { headers: { "Cache-Control": "no-store" } });
}
