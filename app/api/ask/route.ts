import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { detectTopic } from "../../../lib/guidance";
import { searchTerms } from "../../../lib/retrieval";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: "अवैध विनंती." }, { status: 400 }); }
  const question = typeof body === "object" && body !== null && "question" in body
    ? (body as { question?: unknown }).question : undefined;
  if (typeof question !== "string" || question.trim().length < 3 || question.length > 2000) {
    return NextResponse.json({ message: "कृपया 3 ते 2000 अक्षरांत प्रश्न लिहा." }, { status: 400 });
  }
  const topic = detectTopic(question);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({
      topic, message: "डेटाबेस कनेक्शन अद्याप configure झालेले नाही.",
      citations: [], status: "database_not_configured"
    }, { status: 503 });
  }
  const db = createClient(url, key);
  const { count, error } = await db.from("verses")
    .select("id", { count: "exact", head: true }).eq("verified", true);
  if (error) return NextResponse.json({
    topic, message: "पडताळलेले श्लोक तपासता आले नाहीत.",
    citations: [], status: "database_unavailable"
  }, { status: 503 });
  if (!count) return NextResponse.json({
    topic,
    message: "हे पार्थ, तुझा प्रश्न मिळाला आहे. विषय: " + topic +
      ". भगवद्गीतेच्या श्लोकांची स्वतंत्र पडताळणी बाकी आहे. त्यामुळे अप्रमाणित संदर्भ देणार नाही.",
    citations: [], status: "awaiting_editorial_verification"
  });

  const terms = searchTerms(question);
  if (!terms.length) return NextResponse.json({
    topic, citations: [], status: "no_search_terms",
    message: "प्रश्नातील शोधण्यासाठी योग्य शब्द सापडले नाहीत. कृपया अधिक स्पष्ट प्रश्न विचारा."
  });
  // Search only approved translations. The public RLS policy also requires the parent verse to be approved.
  // Escape PostgREST filter metacharacters: only Unicode letters, marks and digits survive searchTerms().
  const filters = terms.map(term => `content.ilike.%${term}%`).join(",");
  const { data: matches, error: searchError } = await db.from("translations")
    .select("verse_id,lang,content,source_id,license")
    .eq("verified", true).or(filters).limit(30);
  if (searchError) return NextResponse.json({
    topic, message: "प्रमाणित भाषांतरांमध्ये शोध करता आला नाही.",
    citations: [], status: "retrieval_unavailable"
  }, { status: 503 });
  const ids = [...new Set((matches ?? []).map(item => item.verse_id))];
  if (!ids.length) return NextResponse.json({
    topic, citations: [], status: "no_relevant_verified_sources",
    message: "तुझ्या प्रश्नाशी शब्दशः जुळणारा प्रमाणित गीता-संदर्भ सापडला नाही. चुकीचा श्लोक सुचवणार नाही."
  });
  const { data: verses, error: verseError } = await db.from("verses")
    .select("id,chapter,verse,sanskrit,source_reference")
    .eq("verified", true).in("id", ids).limit(30);
  if (verseError) return NextResponse.json({
    topic, message: "प्रमाणित श्लोक तपासता आले नाहीत.",
    citations: [], status: "retrieval_unavailable"
  }, { status: 503 });
  const verified = new Map((verses ?? []).map(v => [v.id, v]));
  const citations = (matches ?? []).filter(t => verified.has(t.verse_id)).slice(0, 3).map(t => ({
    verseId: t.verse_id,
    chapter: verified.get(t.verse_id)!.chapter,
    verse: verified.get(t.verse_id)!.verse,
    sanskrit: verified.get(t.verse_id)!.sanskrit,
    sourceReference: verified.get(t.verse_id)!.source_reference,
    translation: t.content,
    language: t.lang,
    translationSource: t.source_id,
    translationLicense: t.license
  }));
  return NextResponse.json({
    topic, citations,
    status: citations.length ? "literal_verified_matches" : "no_relevant_verified_sources",
    message: citations.length
      ? "खालील प्रमाणित संदर्भ प्रश्नातील शब्दांशी जुळतात. ही प्राथमिक शब्दशोध यादी आहे; AI अर्थविश्लेषण किंवा वैयक्तिक मार्गदर्शन नाही."
      : "प्रमाणित संदर्भ सापडला नाही. चुकीचा श्लोक सुचवणार नाही."
  }, { headers: { "Cache-Control": "no-store" } });
}
