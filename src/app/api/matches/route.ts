import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("matches")
      .upsert(body, { onConflict: "project_id,funding_id" })
      .select()
      .single();
    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, match: data });
  } catch (e) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
