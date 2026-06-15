import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createServiceClient();
    body.updated_at = new Date().toISOString();

    // upsert por project_id (1 relatório por projeto neste MVP)
    const { data: existing } = await supabase
      .from("reports")
      .select("id")
      .eq("project_id", body.project_id)
      .maybeSingle();

    let res;
    if (existing?.id) {
      res = await supabase
        .from("reports")
        .update(body)
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      res = await supabase.from("reports").insert(body).select().single();
    }

    if (res.error)
      return NextResponse.json({ error: res.error.message }, { status: 500 });
    return NextResponse.json({ ok: true, report: res.data });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
