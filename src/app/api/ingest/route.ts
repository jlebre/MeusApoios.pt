import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Ingestão assistida por IA: recebe o texto de um aviso oficial, pede à IA
// para o estruturar, e grava como RASCUNHO (não visível aos utilizadores
// até o admin publicar). Precisa de ANTHROPIC_API_KEY.
export async function POST(req: Request) {
  try {
    const { source_text, dominio } = await req.json();
    if (!source_text || source_text.length < 50) {
      return NextResponse.json({ error: "texto_curto" }, { status: 400 });
    }
    const supabase = createServiceClient();

    let domainId: string | null = null;
    if (dominio) {
      const { data: dom } = await supabase
        .from("domains").select("id").eq("slug", dominio).maybeSingle();
      domainId = dom?.id ?? null;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ia_nao_configurada" }, { status: 503 });
    }

    const systemPrompt = `És um especialista em apoios e subsídios em Portugal.
Lê o texto do aviso e extrai a informação de forma ESTRUTURADA.
Responde APENAS com JSON válido, sem texto antes ou depois, neste formato exato:
{
  "name": "nome do apoio",
  "program": "programa (ex.: PEPAC 2023-2027)",
  "entity": "entidade gestora",
  "summary": "resumo em linguagem simples (2-3 frases)",
  "beneficiaries": "quem pode candidatar",
  "eligible_expenses": "despesas elegíveis",
  "support_rate": "taxa de apoio / montantes",
  "amount_range": "intervalo de valores",
  "status": "aberto|previsto|fechado",
  "complexity": "baixa|media|alta",
  "hidden_conditions": "condições escondidas que excluem candidaturas",
  "risks": "o que pode correr mal",
  "incompatibilities": "regras de não-acumulação",
  "required_docs": "documentos obrigatórios (texto)",
  "source_url": "",
  "rules": [
    {"label":"...","field":"promoter_age|first_install|has_nifap|activity_open|budget_eur|location_district|first_home|property_price_eur|owns_home|company_exists|annual_income_eur|tax_situation_ok","operator":"between|gte|lte|eq|is_true|is_false|in","value":"","value2":"","severity":"eliminatoria|aviso","explain_pass":"","explain_fail":""}
  ],
  "amounts": [
    {"label":"...","kind":"fixo|percentagem","rate":50,"fixed_amount":null,"cap":null,"base_field":"budget_eur","notes":""}
  ],
  "documents": [
    {"name":"...","hint":"...","how_to_get":"...","official_url":""}
  ]
}
Usa só campos de 'field' da lista dada. Se não souberes um valor, usa "" ou null. NÃO inventes valores que não estão no texto.`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: source_text.slice(0, 50000) }],
      }),
    });

    if (!resp.ok) {
      return NextResponse.json({ error: "ia_falhou" }, { status: 502 });
    }
    const data = await resp.json();
    let raw = data.content?.filter((c: any) => c.type === "text").map((c: any) => c.text).join("") || "";
    raw = raw.replace(/```json|```/g, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "json_invalido", raw }, { status: 422 });
    }

    // Gravar como RASCUNHO
    const { data: fund, error } = await supabase
      .from("funding_opportunities")
      .insert({
        name: parsed.name || "Apoio sem nome",
        program: parsed.program || null,
        entity: parsed.entity || null,
        summary: parsed.summary || null,
        beneficiaries: parsed.beneficiaries || null,
        eligible_expenses: parsed.eligible_expenses || null,
        support_rate: parsed.support_rate || null,
        amount_range: parsed.amount_range || null,
        status: parsed.status || "previsto",
        complexity: parsed.complexity || "media",
        hidden_conditions: parsed.hidden_conditions || null,
        risks: parsed.risks || null,
        incompatibilities: parsed.incompatibilities || null,
        required_docs: parsed.required_docs || null,
        source_url: parsed.source_url || null,
        domain_id: domainId,
        publish_status: "rascunho",
        ai_generated: true,
        reviewed_by_human: false,
        notes_internal: "GERADO POR IA — rever antes de publicar.",
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Regras, montantes, documentos
    if (Array.isArray(parsed.rules)) {
      for (const [i, r] of parsed.rules.entries()) {
        await supabase.from("eligibility_rules").insert({
          funding_id: fund.id, label: r.label || "Condição", field: r.field || "promoter_age",
          operator: r.operator || "is_true", value: r.value || null, value2: r.value2 || null,
          severity: r.severity || "aviso", explain_pass: r.explain_pass || null,
          explain_fail: r.explain_fail || null, sort_order: i,
        });
      }
    }
    if (Array.isArray(parsed.amounts)) {
      for (const a of parsed.amounts) {
        await supabase.from("funding_amounts").insert({
          funding_id: fund.id, label: a.label || "Apoio", kind: a.kind || "percentagem",
          rate: a.rate ?? null, fixed_amount: a.fixed_amount ?? null, cap: a.cap ?? null,
          base_field: a.base_field || "budget_eur", notes: a.notes || null,
        });
      }
    }
    if (Array.isArray(parsed.documents)) {
      for (const [i, d] of parsed.documents.entries()) {
        await supabase.from("funding_documents_required").insert({
          funding_id: fund.id, name: d.name || "Documento", hint: d.hint || null,
          mandatory: true, sort_order: i, how_to_get: d.how_to_get || null,
          official_url: d.official_url || null,
        });
      }
    }

    await supabase.from("ingestion_log").insert({
      source_text: source_text.slice(0, 5000), domain_id: domainId,
      funding_id: fund.id, status: "processado",
    });

    return NextResponse.json({ ok: true, funding_id: fund.id, parsed });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
