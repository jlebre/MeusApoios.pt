import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Regista um evento do funil (chegou, completou, clicou desbloquear…).
// Simples e sem dependências externas. Falha em silêncio — tracking
// nunca deve partir a experiência do utilizador.
export async function POST(req: Request) {
  try {
    const { name, project_id, meta } = await req.json();
    const supabase = createServiceClient();
    await supabase.from("events").insert({
      name,
      project_id: project_id || null,
      meta: meta || null,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
