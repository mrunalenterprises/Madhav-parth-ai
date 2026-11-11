"use client";
import { useEffect, useState } from "react";

type Chapter = { number: number; name_sa: string; expected_verses: number };
type VerifiedVerse = { id: string; chapter: number; verse: number; sanskrit: string; source_reference: string };\ntype CorpusStatus = { importedVerses: number; editoriallyVerifiedVerses: number; verifiedTranslations: number; readyForCitedAnswers: boolean };
const EXAMPLES = [
  "मी खूप मेहनत करतो, पण यश मिळत नाही. काय करू?",
  "माझ्या मनात सतत भीती आणि चिंता असते.",
  "मला योग्य निर्णय घेता येत नाही.",
  "जवळच्या व्यक्तीने विश्वासघात केला. आता काय करू?"
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [corpus, setCorpus] = useState<CorpusStatus | null>(null);\n  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);\n  const [verses, setVerses] = useState<VerifiedVerse[]>([]);\n  const [verseMessage, setVerseMessage] = useState("");\n  const [versesBusy, setVersesBusy] = useState(false);
  useEffect(() => {
    fetch("/api/chapters").then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d?.chapters)) setChapters(d.chapters); }).catch(() => {});
    fetch("/api/corpus-status").then(r => r.ok ? r.json() : null)
      .then(d => { if (typeof d?.importedVerses === "number") setCorpus(d); }).catch(() => {});
  }, []);

  async function browseChapter(chapter: number) {\n    setSelectedChapter(chapter);\n    setVerses([]);\n    setVerseMessage("");\n    setVersesBusy(true);\n    try {\n      const res = await fetch(`/api/verses?chapter=${chapter}`);\n      const data = await res.json();\n      if (!res.ok) throw new Error(data.message || "श्लोक उपलब्ध नाहीत.");\n      setVerses(Array.isArray(data.verses) ? data.verses : []);\n      setVerseMessage(data.message || "");\n    } catch { setVerseMessage("श्लोक लोड करता आले नाहीत. कृपया पुन्हा प्रयत्न करा."); }\n    finally { setVersesBusy(false); }\n  }\n\n  async function ask() {
    if (busy || question.trim().length < 3) return;
    setBusy(true);
    setResponse("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: question.trim() })
      });
      const data = await res.json();
      setResponse(data.message || "कृपया पुन्हा प्रयत्न करा.");
    } catch {
      setResponse("सेवेशी संपर्क झाला नाही. कृपया पुन्हा प्रयत्न करा.");
    } finally { setBusy(false); }
  }

  return <main>
    <p className="muted">Mrunal Technologies Private Limited</p>
    <h1>॥ माधव–पार्थ AI ॥</h1>
    <p>समस्या तुमची • मार्गदर्शन भगवद्गीतेतून</p>
    <section className="panel">
      <h2>हे पार्थ, मनातील प्रश्न सांग</h2>
      <label htmlFor="question" className="muted">तुमचा प्रश्न</label>
      <textarea id="question" maxLength={2000} value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="माधव, मला एक प्रश्न आहे..." />
      <p className="muted">उदाहरणार्थ:</p>
      <div className="examples">{EXAMPLES.map(example =>
        <button className="example" key={example} type="button" onClick={() => setQuestion(example)}>{example}</button>
      )}</div>
      <p><button type="button" onClick={ask} disabled={busy || question.trim().length < 3}>
        {busy ? "कृपया थांबा..." : "माधवाला विचारा"}
      </button></p>
    </section>
    {response && <section className="panel answer" role="status" aria-live="polite">{response}</section>}
    <section className="panel">
      <h2>श्लोक पडताळणी स्थिती</h2>
      {corpus ? <p>आयात नोंदी: {corpus.importedVerses} • प्रमाणित श्लोक: {corpus.editoriallyVerifiedVerses} • प्रमाणित भाषांतरे: {corpus.verifiedTranslations}</p>
        : <p className="muted">पडताळणीची स्थिती सध्या उपलब्ध नाही.</p>}
      <p className="muted">प्रमाणित संदर्भ उपलब्ध होईपर्यंत AI कोणतेही अप्रमाणित श्लोक दाखवणार नाही.</p>
    </section>
    <section className="panel">
      <h2>भगवद्गीतेचे 18 अध्याय</h2>
      {chapters.length ? <ol>{chapters.map(c => <li key={c.number}><button className="chapter-button" type="button" onClick={() => browseChapter(c.number)} aria-pressed={selectedChapter === c.number}>{c.name_sa} — {c.expected_verses} श्लोक</button></li>)}</ol>
        : <p className="muted">अध्यायांची यादी सध्या उपलब्ध नाही.</p>}
    </section>
    <p className="muted">हे आध्यात्मिक मार्गदर्शन आहे; वैद्यकीय किंवा आपत्कालीन मदतीचा पर्याय नाही.</p>
  </main>;
}
