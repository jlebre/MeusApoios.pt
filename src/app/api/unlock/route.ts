import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Desbloqueia o detalhe dos apoios de um projeto.
//
// Em produção, esta rota deve ser chamada APENAS pelo webhook do Stripe
// após pagamento confirmado — não diretamente pelo cliente. Por agora,
// desbloqueia de imediato para permitir testar/demonstrar o fluxo completo.
export async function POST(req: Request) {
  try {
    const { project_id } = await req.json();
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("projects")
      .update({ unlocked: true, unlocked_at: new Date().toISOString() })
      .eq("id", project_id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
