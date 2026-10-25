import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {detectTopic} from "../../../lib/guidance";
export async function POST(request:Request){
 let question:unknown;try{({question}=await request.json())}catch{return NextResponse.json({message:"अवैध विनंती."},{status:400})}
 if(typeof question!=="string"||question.trim().length<3||question.length>2000)return NextResponse.json({message:"कृपया 3 ते 2000 अक्षरांत प्रश्न लिहा."},{status:400});
 const topic=detectTopic(question);
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({topic,message:"माधव–पार्थ AI चे database connection अद्याप configure झालेले नाही. कृपया नंतर प्रयत्न करा.",citations:[]},{status:503});
 const db=createClient(url,key);
 // Only editorially verified verses are ever eligible for user-facing scripture citations.
 const {count,error}=await db.from("verses").select("id",{count:"exact",head:true}).eq("verified",true);
 if(error)return NextResponse.json({topic,message:"पडताळलेले श्लोक तपासता आले नाहीत. कृपया नंतर प्रयत्न करा.",citations:[]},{status:503});
 if(!count)return NextResponse.json({topic,message:"हे पार्थ, तुझा प्रश्न मिळाला आहे. विषय: "+topic+". भगवद्गीतेच्या 700 श्लोकांचा डेटाबेस तयार आहे, पण मूळपाठाची स्वतंत्र पडताळणी बाकी आहे. म्हणून आत्ता कोणताही अप्रमाणित श्लोक किंवा त्याचा बनावट अर्थ देणार नाही.",citations:[],status:"awaiting_editorial_verification"});
 return NextResponse.json({topic,message:"श्लोक पडताळणीचा पहिला टप्पा सुरू आहे. संदर्भाधारित AI उत्तर देण्यासाठी विषयाशी जुळणारे श्लोक व त्यांचे प्रमाणित अर्थ जोडणे आवश्यक आहे.",citations:[],status:"retrieval_not_yet_enabled"});
}
