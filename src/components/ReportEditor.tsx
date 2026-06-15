"use client";

import { useState } from "react";

type Match = {
  funding_id: string;
  confidence: string;
  why_appears: string;
  what_can_go_wrong: string;
  what_to_confirm: string;
  funding_opportunities?: {
    name: string;
    program: string | null;
    support_rate: string | null;
    source_url: string | null;
  };
};

type Report = {
  id?: string;
  executive_summary?: string;
  action_plan_7d?: string;
  action_plan_30d?: string;
  action_plan_90d?: string;
  honest_recommendation?: string;
  status?: string;
} | null;

export default function ReportEditor({
  projectId,
  report,
  matches,
}: {
  projectId: string;
  report: Report;
  matches: Match[];
}) {
  const [r, setR] = useState<Report>(
    report ?? {
      executive_summary: "",
      action_plan_7d: "",
      action_plan_30d: "",
      action_plan_90d: "",
      honest_recommendation: "",
      status: "rascunho",
    }
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function save(markDelivered = false) {
    setSaving(true);
    const payload = {
      project_id: projectId,
      ...r,
      status: markDelivered ? "entregue" : r?.status || "rascunho",
    };
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const j = await res.json();
      if (j.report) setR(j.report);
      setSavedAt(new Date().toLocaleTimeString("pt-PT"));
    }
    setSaving(false);
  }

  const confLabel: Record<string, string> = {
    alta: "Confiança alta",
    media: "Confiança média",
    baixa: "Confiança baixa",
    desconhecida: "Confiança desconhecida",
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Aviso quando não há fundos incluídos */}
      {matches.length === 0 && (
        <div className="rounded-lg border border-dashed border-clay/40 bg-cream/50 p-4 text-sm text-ink/70">
          Ainda não marcaste nenhum fundo como{" "}
          <span className="font-semibold">Incluir no relatório</span> na página
          do projeto. Volta atrás e marca os fundos relevantes.
        </div>
      )}

      {/* Resumo executivo */}
      <Block label="Resumo executivo (o que parece mais promissor)">
        <textarea
          className="field-input min-h-[110px]"
          value={r?.executive_summary || ""}
          onChange={(e) => setR({ ...r, executive_summary: e.target.value })}
        />
      </Block>

      {/* Oportunidades (a partir dos matches incluídos) */}
      <div>
        <h2 className="font-display text-xl font-bold text-soil">
          Oportunidades ({matches.length})
        </h2>
        <div className="mt-3 space-y-3">
          {matches.map((m, i) => (
            <div
              key={i}
              className="rounded-xl border border-clay/20 bg-white/60 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="font-display font-bold text-soil">
                  {m.funding_opportunities?.name}
                </div>
                <span className="rounded-full bg-olive/15 px-2 py-0.5 text-xs font-semibold text-olive">
                  {confLabel[m.confidence] || m.confidence}
                </span>
              </div>
              {m.funding_opportunities?.support_rate && (
                <p className="mt-1 text-sm text-ink/70">
                  {m.funding_opportunities.support_rate}
                </p>
              )}
              <dl className="mt-3 space-y-2 text-sm">
                <Row k="Porque aparece" v={m.why_appears} />
                <Row k="O que pode correr mal" v={m.what_can_go_wrong} />
                <Row k="O que confirmar a seguir" v={m.what_to_confirm} />
              </dl>
            </div>
          ))}
        </div>
      </div>

      {/* Plano de ação */}
      <Block label="Plano de ação — próximos 7 dias">
        <textarea
          className="field-input min-h-[80px]"
          value={r?.action_plan_7d || ""}
          onChange={(e) => setR({ ...r, action_plan_7d: e.target.value })}
        />
      </Block>
      <Block label="Plano de ação — 30 dias">
        <textarea
          className="field-input min-h-[80px]"
          value={r?.action_plan_30d || ""}
          onChange={(e) => setR({ ...r, action_plan_30d: e.target.value })}
        />
      </Block>
      <Block label="Plano de ação — 90 dias">
        <textarea
          className="field-input min-h-[80px]"
          value={r?.action_plan_90d || ""}
          onChange={(e) => setR({ ...r, action_plan_90d: e.target.value })}
        />
      </Block>

      {/* Recomendação honesta */}
      <Block label="Recomendação honesta (avançar / preparar / esperar / não avançar)">
        <textarea
          className="field-input min-h-[90px]"
          value={r?.honest_recommendation || ""}
          onChange={(e) =>
            setR({ ...r, honest_recommendation: e.target.value })
          }
        />
      </Block>

      {/* Ações */}
      <div className="flex flex-wrap items-center gap-3 border-t border-clay/20 pt-5">
        <button className="btn-primary" disabled={saving} onClick={() => save(false)}>
          {saving ? "A guardar…" : "Guardar rascunho"}
        </button>
        <button
          className="btn-ghost"
          disabled={saving}
          onClick={() => save(true)}
        >
          Marcar como entregue
        </button>
        <button className="btn-ghost" onClick={() => window.print()}>
          Imprimir / PDF
        </button>
        {savedAt && (
          <span className="text-sm text-ink/50">Guardado às {savedAt}</span>
        )}
        {r?.status === "entregue" && (
          <span className="rounded-full bg-olive/15 px-3 py-1 text-xs font-semibold text-olive">
            Entregue
          </span>
        )}
      </div>

      <p className="text-xs text-ink/40">
        Para gerar PDF: usa Imprimir → Guardar como PDF. Lembrete: valida valores
        e prazos no aviso oficial antes de entregar.
      </p>
    </div>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-clay">
        {k}
      </dt>
      <dd className="text-ink/80">{v || "—"}</dd>
    </div>
  );
}
