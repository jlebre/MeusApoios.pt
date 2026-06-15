import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Grava o resultado da revisão de um fundo (confirmado / a corrigir + notas).
export async function POST(req: Request) {
  try {
    const { id, review_status, review_notes } = await req.json();
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("funding_opportunities")
      .update({
        review_status,
        review_notes: review_notes || null,
        reviewed_by_human: review_status === "confirmado",
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
