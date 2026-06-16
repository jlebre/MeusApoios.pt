import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET: estado dos documentos de um projeto. POST: atualiza o estado de um doc.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("project");
    if (!projectId) return NextResponse.json({ docs: [] });
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("application_documents")
      .select("*")
      .eq("project_id", projectId);
    return NextResponse.json({ docs: data ?? [] });
  } catch {
    return NextResponse.json({ docs: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { project_id, funding_id, doc_name, status } = await req.json();
    const supabase = createServiceClient();
    // upsert manual: existe?
    const { data: existing } = await supabase
      .from("application_documents")
      .select("id")
      .eq("project_id", project_id)
      .eq("doc_name", doc_name)
      .maybeSingle();
    if (existing) {
      await supabase
        .from("application_documents")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("application_documents").insert({
        project_id, funding_id: funding_id || null, doc_name, status,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
