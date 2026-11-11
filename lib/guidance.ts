export const TOPICS = [
  { label: "तणाव / चिंता", keywords: ["तणाव", "चिंता", "भीती", "घाबर", "stress", "anxiety", "worried", "fear", "डर", "परेशान", "चिंतित"] },
  { label: "कर्तव्य / काम", keywords: ["कर्तव्य", "नोकरी", "काम", "मेहनत", "यश", "अपयश", "work", "job", "duty", "कर्म", "success", "failure", "सफलता"] },
  { label: "राग / संघर्ष", keywords: ["राग", "संताप", "anger", "angry", "क्रोध", "भांडण", "गुस्सा", "conflict"] },
  { label: "दुःख / हानी", keywords: ["दुःख", "दुख", "शोक", "grief", "loss", "sad", "उदास", "दर्द", "वियोग"] },
  { label: "निर्णय / संभ्रम", keywords: ["निर्णय", "संभ्रम", "decision", "confused", "confusion", "क्या करूँ", "काय करू", "दुविधा"] },
  { label: "नातेसंबंध / विश्वास", keywords: ["नातं", "नातेसंबंध", "विश्वास", "धोका", "मैत्री", "relationship", "trust", "betrayal", "रिश्ता", "भरोसा"] },
  { label: "आत्मविश्वास / धैर्य", keywords: ["आत्मविश्वास", "धैर्य", "हिम्मत", "confidence", "courage", "self doubt", "निराशा"] }
] as const;

// A preliminary topic hint, not a scripture citation or an AI interpretation.
export function detectTopic(input: string): string {
  const s = input.normalize("NFC").toLocaleLowerCase();
  const scores = TOPICS.map(topic => ({
    label: topic.label,
    score: topic.keywords.reduce((n, keyword) => n + (s.includes(keyword) ? 1 : 0), 0)
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores[0]?.score ? scores[0].label : "सामान्य मार्गदर्शन";
}
