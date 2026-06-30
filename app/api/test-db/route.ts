import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = supabaseAdmin();
    
    // Query supabase logs
    const { data: supabaseLogs } = await supabase
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
      
    return NextResponse.json({
      supabaseLogs: supabaseLogs || []
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
