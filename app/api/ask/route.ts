import {NextResponse} from "next/server";
export async function POST(request:Request){let question:unknown;try{({question}=await request.json())}catch{return NextResponse.json({message:"अवैध विनंती."},{status:400})}
if(typeof question!=="string"||question.trim().length<3||question.length>2000)return NextResponse.json({message:"कृपया 3 ते 2000 अक्षरांत प्रश्न लिहा."},{status:400});
return NextResponse.json({message:"हे पार्थ, तुझा प्रश्न मिळाला आहे. भगवद्गीतेचे श्लोक आणि त्यांचे अर्थ सध्या पडताळले जात आहेत. पडताळणी पूर्ण झाल्यावरच मी योग्य श्लोकाचा संदर्भ देऊ शकेन. तोपर्यंत बनावट श्लोक किंवा अप्रमाणित सल्ला देणार नाही."});}
