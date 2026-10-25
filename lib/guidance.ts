export const TOPICS=[
{label:"तणाव / चिंता",keywords:["तणाव","चिंता","भीती","stress","anxiety","worried","fear","डर","परेशान"]},
{label:"कर्तव्य / काम",keywords:["कर्तव्य","काम","नोकरी","work","job","duty","कर्म"]},
{label:"राग / संघर्ष",keywords:["राग","संताप","anger","angry","क्रोध","भांडण"]},
{label:"दुःख / हानी",keywords:["दुःख","दुख","शोक","grief","loss","sad","उदास"]},
{label:"निर्णय / संभ्रम",keywords:["निर्णय","संभ्रम","decision","confused","confusion","क्या करूँ"]}
] as const;
export function detectTopic(input:string){const s=input.toLocaleLowerCase();return TOPICS.find(t=>t.keywords.some(w=>s.includes(w)))?.label??"सामान्य मार्गदर्शन";}
