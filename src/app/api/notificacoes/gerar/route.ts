import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Gera entradas na fila de notificação para um fundo que abriu.
// Chamado pelo backoffice quando marcas um fundo como "aberto", ou por um
// cron teu. Junta as subscrições compatíveis (mesma área / distrito) e
// cria mensagens 'pendente' na notification_queue.
//
// O ENVIO de email em si liga-se aqui: lê notification_queue onde
// status='pendente' e envia (SendGrid, Resend, etc.), marcando 'enviado'.
// Essa parte fica para ti ligar ao teu serviço de email.
export async function POST(req: Request) {
  try {
    const { funding_id } = await req.json();
    const supabase = createServiceClient();

    const { data: fund } = await supabase
      .from("funding_opportunities")
      .select("id, name, domain_id, source_url")
      .eq("id", funding_id)
      .single();
    if (!fund) return NextResponse.json({ error: "fund_not_found" }, { status: 404 });

    // subscrições compatíveis: mesma área (ou todas) e ativas
    const { data: subs } = await supabase
      .from("notification_subscriptions")
      .select("*")
      .eq("active", true)
      .or(`domain_id.eq.${fund.domain_id},domain_id.is.null`);

    const queue = (subs ?? []).map((s) => ({
      subscription_id: s.id,
      funding_id: fund.id,
      email: s.email,
      subject: `Novo apoio disponível: ${fund.name}`,
      body: `Abriu um aviso que pode interessar-te: ${fund.name}. Confirma os detalhes${fund.source_url ? `: ${fund.source_url}` : "."}`,
      status: "pendente",
    }));

    if (queue.length > 0) {
      await supabase.from("notification_queue").insert(queue);
    }

    return NextResponse.json({ ok: true, queued: queue.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
