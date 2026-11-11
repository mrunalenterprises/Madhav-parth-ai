import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Literal substring search across editorially verified Sanskrit verses only.
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2 || q.length > 100) {
    return NextResponse.json({ message: "Search text must be 2–100 characters." }, { status: 400 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ message: "Database not configured." }, { status: 503 });
  const db = createClient(url, key);
  const escaped = q.replace(/[\\%_]/g, "\\$&");
  const { data, error } = await db.from("verses")
    .select("id,chapter,verse,sanskrit,source_reference")
    .eq("verified", true)
    .ilike("sanskrit", `%${escaped}%`)
    .order("chapter").order("verse").limit(20);
  if (error) return NextResponse.json({ message: "Search unavailable." }, { status: 503 });
  return NextResponse.json({
    query: q, results: data ?? [],
    message: data?.length ? undefined : "प्रमाणित श्लोकांमध्ये हा शब्द सापडला नाही."
  }, { headers: { "Cache-Control": "no-store" } });
}
