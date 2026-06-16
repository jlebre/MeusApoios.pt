import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  evaluateFund,
  simulateAmount,
  VERDICT_LABEL,
  type Rule,
  type Amount,
} from "@/lib/eligibility";

// Assistente de IA — premium.
//
// PRINCÍPIO DE SEGURANÇA: a IA NÃO inventa elegibilidades nem valores.
// Calculamos primeiro, com o motor determinístico, que apoios servem e
// quanto valem, e passamos esse contexto ao modelo. O modelo só ORGANIZA
// e EXPLICA em linguagem humana — não decide elegibilidade.
//
// Para ligar ao Claude: define ANTHROPIC_API_KEY no .env.local.
// Sem key, devolve uma resposta de fallback baseada só no motor (útil
// para testar o fluxo sem custos).

export async function POST(req: Request) {
  try {
    const { messages, project_id } = await req.json();
    const supabase = createServiceClient();

    // 1. Gate premium: o projeto tem de estar desbloqueado
    if (project_id) {
      const { data: project } = await supabase
        .from("projects")
        .select("unlocked")
        .eq("id", project_id)
        .single();
      if (!project?.unlocked) {
        return NextResponse.json({ error: "premium_required" }, { status: 402 });
      }
    } else {
      // sem projeto associado, exige premium na mesma
      return NextResponse.json({ error: "premium_required" }, { status: 402 });
    }

    // 2. Buscar contexto real: perfil do projeto + avaliação dos fundos
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", project_id)
      .single();

    const { data: funds } = await supabase
      .from("funding_opportunities")
      .select("*, eligibility_rules(*), funding_amounts(*)")
      .neq("publish_status", "rascunho");

    const grounded = (funds ?? [])
      .map((f: any) => {
        const { verdict } = evaluateFund(
          (f.eligibility_rules || []) as Rule[],
          project
        );
        const sim = simulateAmount(
          (f.funding_amounts || []) as Amount[],
          project
        );
        return { name: f.name, verdict, estimate: sim.total };
      })
      .filter((g) => g.verdict !== "inelegivel")
      .map((g) => ({ ...g, verdict: VERDICT_LABEL[g.verdict as keyof typeof VERDICT_LABEL] }));

    // 3. Contexto factual para o modelo (a "verdade" calculada)
    const factContext = `Apoios analisados para este utilizador (calculado pelo motor, não inventar):
${grounded
  .map((g) => `- ${g.name}: ${g.verdict}, estimativa ~${g.estimate}€`)
  .join("\n")}`;

    const systemPrompt = `És um assistente do MeusApoios que ajuda pessoas a navegar apoios e subsídios em Portugal.
REGRAS IMPORTANTES:
- Baseia-te APENAS no contexto factual fornecido sobre elegibilidade e valores. NUNCA inventes apoios, valores ou condições.
- Se não souberes, diz que é preciso confirmar no aviso oficial.
- NUNCA garantas aprovação. És apoio à decisão, não consultor acreditado.
- Fala de forma simples, calorosa e concreta. Dá próximos passos práticos.
- Responde em português de Portugal.

${factContext}`;

    // 4. Chamar Claude (se houver key); senão, fallback baseado no motor
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const fallback =
        grounded.length > 0
          ? `Pelo que descreveste e pelas tuas respostas, há ${grounded.length} apoio(s) que podem encaixar: ${grounded
              .map((g) => g.name)
              .join(", ")}. ` +
            `Para avançar, o melhor próximo passo é confirmar as condições no aviso oficial de cada um e reunir os documentos da checklist. ` +
            `(Nota: o assistente completo de IA ativa-se quando a chave da API estiver configurada.)`
          : `Com as respostas atuais não encontrei apoios claramente compatíveis. Pode valer a pena marcares uma conversa para analisarmos o teu caso com mais detalhe.`;
      return NextResponse.json({ reply: fallback });
    }

    const anthropicMessages = (messages || [])
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .map((m: any) => ({ role: m.role, content: m.content }));

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: anthropicMessages,
      }),
    });

    if (!resp.ok) {
      return NextResponse.json({
        reply:
          "O assistente está indisponível neste momento. Confirma sempre as condições no aviso oficial.",
      });
    }

    const data = await resp.json();
    const reply =
      data.content
        ?.filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n") || "Não consegui responder agora.";

    return NextResponse.json({ reply });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
