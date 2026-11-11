// Literal keyword matching is an interim discovery aid, not semantic similarity.
export function searchTerms(question: string): string[] {
  const ignored = new Set([
    "मला", "माझ्या", "आहे", "आहेत", "काय", "करू", "करावे", "कसे", "माझे",
    "माझा", "आणि", "पण", "होते", "होत", "असते", "the", "and", "what",
    "should", "with", "this", "that", "have", "मुझे", "क्या", "कैसे", "है"
  ]);
  return [...new Set(question.normalize("NFC").toLocaleLowerCase()
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(word => word.length >= 4 && word.length <= 40 && !ignored.has(word)))].slice(0, 5);
}
