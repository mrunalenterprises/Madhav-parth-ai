"use client";
import { useEffect, useState } from "react";

type Chapter = { number: number; name_sa: string; expected_verses: number };
type Verse = { id: string; chapter: number; verse: number; sanskrit: string; source_reference: string };
type Translation = { content: string; lang: string; source_id: string; license: string };
type CorpusStatus = { expectedVerses: number; editoriallyVerifiedVerses: number; verifiedTranslations: number; readyForCitedAnswers: boolean };
const EXAMPLES = [
  "मी खूप मेहनत करतो, पण यश मिळत नाही. काय करू?",
  "माझ्या मनात सतत भीती आणि चिंता असते.",
  "मला योग्य निर्णय घेता येत नाही.",
  "जवळच्या व्यक्तीने विश्वासघात केला. आता काय करू?"
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [corpus, setCorpus] = useState<CorpusStatus | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapterVerses, setChapterVerses] = useState<Verse[]>([]);
  const [chapterMessage, setChapterMessage] = useState("");
  const [chapterBusy, setChapterBusy] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [translationLang, setTranslationLang] = useState("mr");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [translationMessage, setTranslationMessage] = useState("");
  const [translationBusy, setTranslationBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);

  useEffect(() => {
    fetch("/api/chapters").then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d?.chapters)) setChapters(d.chapters); }).catch(() => {});
    fetch("/api/corpus-status").then(r => r.ok ? r.json() : null)
      .then(d => { if (typeof d?.expectedVerses === "number") setCorpus(d); }).catch(() => {});
  }, []);

  async function ask() {
    if (asking || question.trim().length < 3) return;
    setAsking(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: question.trim() })
      });
      const data = await res.json();
      setAnswer(data.message || "कृपया पुन्हा प्रयत्न करा.");
    } catch { setAnswer("सेवेशी संपर्क झाला नाही. कृपया पुन्हा प्रयत्न करा."); }
    finally { setAsking(false); }
  }

  async function browseChapter(chapter: number) {
    setSelectedChapter(chapter);
    setChapterVerses([]);
    setChapterMessage("");
    setChapterBusy(true);
    try {
      const res = await fetch(`/api/verses?chapter=${chapter}`);
      const data = await res.json();
      if (!res.ok) throw new Error("Chapter unavailable");
      setChapterVerses(Array.isArray(data.verses) ? data.verses : []);
      setChapterMessage(data.message || "");
    } catch { setChapterMessage("श्लोक लोड करता आले नाहीत. कृपया पुन्हा प्रयत्न करा."); }
    finally { setChapterBusy(false); }
  }

  async function searchVerses() {
    if (searchBusy || search.trim().length < 2) return;
    setSearchBusy(true);
    setSearchResults([]);
    setSearchMessage("");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(search.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error("Search unavailable");
      setSearchResults(Array.isArray(data.results) ? data.results : []);
      setSearchMessage(data.message || "");
    } catch { setSearchMessage("शोध करता आला नाही. कृपया पुन्हा प्रयत्न करा."); }
    finally { setSearchBusy(false); }
  }

  async function loadTranslation(verseId: string, lang: string) {
    setSelectedVerse(verseId);
    setTranslationLang(lang);
    setTranslations([]);
    setTranslationMessage("");
    setTranslationBusy(true);
    try {
      const res = await fetch(`/api/translations?verse_id=${encodeURIComponent(verseId)}&lang=${lang}`);
      const data = await res.json();
      if (!res.ok) throw new Error("Translation unavailable");
      setTranslations(Array.isArray(data.translations) ? data.translations : []);
      setTranslationMessage(data.message || "");
    } catch { setTranslationMessage("अर्थ लोड करता आला नाही."); }
    finally { setTranslationBusy(false); }
  }

  function verseCard(v: Verse) {
    return <article className="verse-card" key={v.id}>
      <h4>अध्याय {v.chapter}, श्लोक {v.verse}</h4>
      <p className="verse-text">{v.sanskrit}</p>
      <p className="muted">स्रोत: {v.source_reference}</p>
    </article>;
  }

  return <main>
    <p className="muted">Mrunal Technologies Private Limited</p>
    <h1>॥ माधव–पार्थ AI ॥</h1>
    <p>समस्या तुमची • मार्गदर्शन भगवद्गीतेतून</p>
    <section className="panel">
      <h2>हे पार्थ, मनातील प्रश्न सांग</h2>
      <label htmlFor="question" className="muted">तुमचा प्रश्न</label>
      <textarea id="question" maxLength={2000} value={question} onChange={e => setQuestion(e.target.value)}
        placeholder="माधव, मला एक प्रश्न आहे..." />
      <p className="muted">उदाहरणार्थ:</p>
      <div className="examples">{EXAMPLES.map(example =>
        <button className="example" key={example} type="button" onClick={() => setQuestion(example)}>{example}</button>
      )}</div>
      <p><button type="button" onClick={ask} disabled={asking || question.trim().length < 3}>
        {asking ? "कृपया थांबा..." : "माधवाला विचारा"}
      </button></p>
      {answer && <div className="answer" role="status" aria-live="polite">{answer}</div>}
    </section>
    <section className="panel">
      <h2>श्लोक पडताळणी स्थिती</h2>
      {corpus
        ? <p>अपेक्षित श्लोक: {corpus.expectedVerses} • प्रमाणित श्लोक: {corpus.editoriallyVerifiedVerses} • प्रमाणित भाषांतरे: {corpus.verifiedTranslations}</p>
        : <p className="muted">पडताळणीची स्थिती सध्या उपलब्ध नाही.</p>}
      <p className="muted">अप्रमाणित श्लोक सार्वजनिकपणे दाखवले जाणार नाहीत. ही संख्या डेटाबेसमधील आयात नोंदींची संख्या नाही.</p>
    </section>
    <section className="panel">
      <h2>संस्कृत श्लोक शोधा</h2>
      <form onSubmit={e => { e.preventDefault(); void searchVerses(); }}>
        <label htmlFor="verse-search" className="muted">संस्कृत शब्द (किमान 2 अक्षरे)</label>
        <div className="search-row">
          <input id="verse-search" type="search" minLength={2} maxLength={100} value={search}
            onChange={e => setSearch(e.target.value)} placeholder="उदा. कर्म" />
          <button type="submit" disabled={searchBusy || search.trim().length < 2}>
            {searchBusy ? "शोध सुरू..." : "शोधा"}
          </button>
        </div>
      </form>
      <div aria-live="polite">{searchMessage && <p className="muted">{searchMessage}</p>}{searchResults.map(verseCard)}</div>
    </section>
    <section className="panel">
      <h2>भगवद्गीतेचे 18 अध्याय</h2>
      {chapters.length ? <ol>{chapters.map(c =>
        <li key={c.number}><button className="chapter-button" type="button"
          onClick={() => void browseChapter(c.number)} aria-pressed={selectedChapter === c.number}>
          {c.name_sa} — {c.expected_verses} श्लोक
        </button></li>
      )}</ol> : <p className="muted">अध्यायांची यादी सध्या उपलब्ध नाही.</p>}
      {selectedChapter !== null && <div className="chapter-results" aria-live="polite">
        <h3>अध्याय {selectedChapter} — प्रमाणित श्लोक</h3>
        {chapterBusy ? <p>श्लोक लोड होत आहेत...</p> : <>
          {chapterMessage && <p className="muted">{chapterMessage}</p>}
          {chapterVerses.map(verseCard)}
        </>}
      </div>}
    </section>
    <p className="muted">हे आध्यात्मिक मार्गदर्शन आहे; वैद्यकीय किंवा आपत्कालीन मदतीचा पर्याय नाही.</p>
  </main>;
}
