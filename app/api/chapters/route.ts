import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export async function GET(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)return NextResponse.json({message:"Supabase not configured"},{status:503});const db=createClient(url,key);const {data,error}=await db.from("chapters").select("number,name_sa,expected_verses").order("number");if(error)return NextResponse.json({message:"Unable to fetch chapters"},{status:500});return NextResponse.json({chapters:data});}
