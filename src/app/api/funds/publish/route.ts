import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Publica um fundo (rascunho -> publicado), marcando como revisto por humano.
export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("funding_opportunities")
      .update({
        publish_status: "publicado",
        reviewed_by_human: true,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
