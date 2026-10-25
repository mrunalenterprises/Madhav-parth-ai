"use client";
import {useEffect,useState} from "react";
type Chapter={number:number;name_sa:string;expected_verses:number};
export default function Home(){
const [question,setQuestion]=useState("");const [response,setResponse]=useState("");const [busy,setBusy]=useState(false);const [chapters,setChapters]=useState<Chapter[]>([]);
useEffect(()=>{fetch("/api/chapters").then(r=>r.ok?r.json():null).then(d=>{if(d?.chapters)setChapters(d.chapters)}).catch(()=>{})},[]);
async function ask(){setBusy(true);try{const res=await fetch("/api/ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question})});const data=await res.json();setResponse(data.message||"कृपया पुन्हा प्रयत्न करा.");}catch{setResponse("सेवेशी संपर्क झाला नाही.");}finally{setBusy(false)}}
return <main><p className="muted">Mrunal Technologies Private Limited</p><h1>माधव–पार्थ AI</h1><p>समस्या तुमची • मार्गदर्शन भगवद्गीतेतून</p>
<section className="panel"><h2>हे पार्थ, मनातील प्रश्न सांग</h2><textarea aria-label="तुमचा प्रश्न" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="माधव, मला एक प्रश्न आहे..."/><p><button onClick={ask} disabled={busy||question.trim().length<3}>{busy?"कृपया थांबा...":"माधवाला विचारा"}</button></p></section>
{response&&<section className="panel answer" aria-live="polite">{response}</section>}
<section className="panel"><h2>भगवद्गीतेचे 18 अध्याय</h2>{chapters.length? <ol>{chapters.map(c=><li key={c.number}>{c.name_sa} — {c.expected_verses} श्लोक</li>)}</ol>:<p className="muted">अध्यायांची यादी database जोडल्यावर दिसेल.</p>}</section>
<p className="muted">श्लोकांचा मूळपाठ पडताळल्यानंतरच प्रमाणित संदर्भ दिले जातील. हे AI आध्यात्मिक मार्गदर्शनासाठी आहे; वैद्यकीय किंवा आपत्कालीन मदतीचा पर्याय नाही.</p></main>}
