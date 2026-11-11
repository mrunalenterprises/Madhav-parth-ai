/**
 * High-priority safety routing. This is conservative keyword screening,
 * not a diagnosis or an emergency-response service.
 */
const SELF_HARM = [
  /suicid(?:e|al)/i, /kill myself/i, /end my life/i, /self[ -]?harm/i,
  /आत्महत्या/u, /जीव द्यायचा/u, /जीव द्यावा/u, /स्वतःला संपव/u,
  /खुदकुशी/u, /आत्महत्या/u, /जान देना/u, /मर जाना/u
];
const IMMEDIATE_DANGER = [
  /heart attack/i, /chest pain/i, /can't breathe/i, /cannot breathe/i,
  /छातीत दुख/u, /श्वास घेता येत नाही/u, /सीने में दर्द/u,
  /sexual assault/i, /बलात्कार/u
];

export type SafetyRoute = "self_harm" | "immediate_danger" | null;
export function detectSafetyRoute(text: string): SafetyRoute {
  const normalized = text.normalize("NFC");
  if (SELF_HARM.some(pattern => pattern.test(normalized))) return "self_harm";
  if (IMMEDIATE_DANGER.some(pattern => pattern.test(normalized))) return "immediate_danger";
  return null;
}

export function safetyMessage(route: Exclude<SafetyRoute, null>): string {
  if (route === "self_harm") {
    return "तुम्ही सांगितलेली गोष्ट गंभीर आहे. तुम्हाला स्वतःला इजा करण्याची भीती असेल तर आत्ता एकटे राहू नका; विश्वासू व्यक्तीला लगेच सांगा आणि तातडीच्या मदतीसाठी स्थानिक आपत्कालीन सेवेशी संपर्क साधा. भारतात 112 वर कॉल करू शकता. हे गीतेवरील मार्गदर्शन तातडीच्या मानवी मदतीचा पर्याय नाही.";
  }
  return "ही परिस्थिती तातडीच्या मदतीची असू शकते. कृपया लगेच स्थानिक आपत्कालीन सेवेशी किंवा जवळच्या रुग्णालयाशी संपर्क साधा. भारतात 112 वर कॉल करू शकता. गीतेवरील मार्गदर्शन वैद्यकीय किंवा आपत्कालीन उपचारांचा पर्याय नाही.";
}
