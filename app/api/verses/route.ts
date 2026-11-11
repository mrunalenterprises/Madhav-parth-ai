import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ message: "Database not configured." }, { status: 503 });

  const chapterText = request.nextUrl.searchParams.get("chapter");
  const verseText = request.nextUrl.searchParams.get("verse");
  if (!chapterText || !/^(?:[1-9]|1[0-8])$/.test(chapterText) ||
      (verseText !== null && !/^[1-9][0-9]?$/.test(verseText))) {
    return NextResponse.json({ message: "Invalid chapter or verse." }, { status: 400 });
  }
  const chapter = Number(chapterText);
  const verse = verseText === null ? null : Number(verseText);
  if (verse !== null && verse > 78) {
    return NextResponse.json({ message: "Invalid verse." }, { status: 400 });
  }
  const supabase = createClient(url, key);
  const query = supabase.from("verses")
    .select("id,chapter,verse,sanskrit,source_reference")
    .eq("chapter", chapter)
    .eq("verified", true);
  if (verse !== null) {
    const { data, error } = await query.eq("verse", verse).maybeSingle();
    if (error) return NextResponse.json({ message: "Could not load verse." }, { status: 503 });
    if (!data) return NextResponse.json({ message: "This verse is not yet approved for public display." }, { status: 404 });
    return NextResponse.json({ verse: data }, { headers: { "Cache-Control": "no-store" } });
  }
  const { data, error } = await query.order("verse").limit(100);
  if (error) return NextResponse.json({ message: "Could not load verified verses." }, { status: 503 });
  return NextResponse.json({
    chapter, verses: data ?? [],
    message: data?.length ? undefined : "या अध्यायातील श्लोकांची स्वतंत्र पडताळणी बाकी आहे."
  }, { headers: { "Cache-Control": "no-store" } });
}
