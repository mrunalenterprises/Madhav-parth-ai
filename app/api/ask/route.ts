import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { detectTopic } from "../../../lib/guidance";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "अवैध विनंती." }, { status: 400 });
  }
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
      topic, message: "माधव–पार्थ AI चे database connection अद्याप configure झालेले नाही. कृपया नंतर प्रयत्न करा.",
      citations: [], status: "database_not_configured"
    }, { status: 503 });
  }
  const db = createClient(url, key);
  const { count, error } = await db.from("verses")
    .select("id", { count: "exact", head: true }).eq("verified", true);
  if (error) {
    return NextResponse.json({
      topic, message: "पडताळलेले श्लोक तपासता आले नाहीत. कृपया नंतर प्रयत्न करा.",
      citations: [], status: "database_unavailable"
    }, { status: 503 });
  }
  if (!count) {
    return NextResponse.json({
      topic,
      message: "हे पार्थ, तुझा प्रश्न मिळाला आहे. विषय: " + topic +
        ". भगवद्गीतेच्या मूळ श्लोकांची स्वतंत्र पडताळणी पूर्ण झालेली नाही. त्यामुळे आत्ता अप्रमाणित श्लोक किंवा बनावट अर्थ देणार नाही.",
      citations: [], status: "awaiting_editorial_verification"
    });
  }
  return NextResponse.json({
    topic,
    message: "पडताळलेले श्लोक उपलब्ध आहेत. प्रश्नाशी संबंधित अचूक संदर्भ शोधण्याची प्रणाली अजून विकसित होत आहे.",
    citations: [], status: "retrieval_not_yet_enabled"
  });
}
