"use client";

import { useState } from "react";

type Fund = {
  id: string;
  name: string;
  program: string | null;
  status: string;
  summary?: string | null;
  hidden_conditions?: string | null;
  risks?: string | null;
  incompatibilities?: string | null;
  required_docs?: string | null;
  support_rate?: string | null;
  source_url?: string | null;
};
type Match = {
  id?: string;
  funding_id: string;
  confidence: string;
  why_appears: string;
  what_can_go_wrong: string;
  what_to_confirm: string;
  admin_decision: string;
};

export default function MatchEditor({
  projectId,
  funds,
  existing,
}: {
  projectId: string;
  funds: Fund[];
  existing: Match[];
}) {
  const [rows, setRows] = useState<Match[]>(
    existing.length
      ? existing
      : []
  );
  const [savingIdx, setSavingIdx] = useState<number | null>(null);

  function addRow() {
    setRows((r) => [
      ...r,
      {
        funding_id: funds[0]?.id ?? "",
        confidence: "media",
        why_appears: "",
        what_can_go_wrong: "",
        what_to_confirm: "",
        admin_decision: "sugerido",
      },
    ]);
  }

  function update(i: number, patch: Partial<Match>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function save(i: number) {
    setSavingIdx(i);
    const row = rows[i];
    const payload = { project_id: projectId, ...row };
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.match?.id) update(i, { id: json.match.id });
    }
    setSavingIdx(null);
  }

  return (
    <div className="space-y-4">
      {rows.map((row, i) => (
        <div
          key={i}
          className="rounded-xl border border-clay/20 bg-white/60 p-5"
        >
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="field-input max-w-xs"
              value={row.funding_id}
              onChange={(e) => update(i, { funding_id: e.target.value })}
            >
              {funds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.program ? `(${f.program})` : ""}
                </option>
              ))}
            </select>
            <select
              className="field-input max-w-[150px]"
              value={row.confidence}
              onChange={(e) => update(i, { confidence: e.target.value })}
            >
              <option value="alta">Confiança alta</option>
              <option value="media">Confiança média</option>
              <option value="baixa">Confiança baixa</option>
              <option value="desconhecida">Desconhecida</option>
            </select>
            <select
              className="field-input max-w-[150px]"
              value={row.admin_decision}
              onChange={(e) => update(i, { admin_decision: e.target.value })}
            >
              <option value="sugerido">Sugerido</option>
              <option value="incluir">Incluir no relatório</option>
              <option value="excluir">Excluir</option>
            </select>
          </div>

          {(() => {
            const f = funds.find((x) => x.id === row.funding_id);
            if (!f) return null;
            return (
              <details className="mt-3 rounded-lg bg-cream/70 p-3 text-sm">
                <summary className="cursor-pointer font-semibold text-soil">
                  Contexto do fundo (condições, riscos, documentos)
                </summary>
                <div className="mt-2 space-y-2 text-ink/80">
                  {f.support_rate && (
                    <p><span className="font-semibold text-clay">Taxa/montante:</span> {f.support_rate}</p>
                  )}
                  {f.hidden_conditions && (
                    <p><span className="font-semibold text-clay">⚠️ Condições escondidas:</span> {f.hidden_conditions}</p>
                  )}
                  {f.risks && (
                    <p><span className="font-semibold text-clay">⚠️ Riscos:</span> {f.risks}</p>
                  )}
                  {f.incompatibilities && (
                    <p><span className="font-semibold text-clay">Incompatibilidades:</span> {f.incompatibilities}</p>
                  )}
                  {f.required_docs && (
                    <p><span className="font-semibold text-clay">Documentos:</span> {f.required_docs}</p>
                  )}
                  {f.source_url && (
                    <p>
                      <a href={f.source_url} target="_blank" rel="noreferrer" className="text-clay underline">
                        Abrir aviso oficial ↗
                      </a>
                    </p>
                  )}
                </div>
              </details>
            );
          })()}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <FieldArea
              label="Porque aparece"
              value={row.why_appears}
              onChange={(v) => update(i, { why_appears: v })}
            />
            <FieldArea
              label="O que pode correr mal"
              value={row.what_can_go_wrong}
              onChange={(v) => update(i, { what_can_go_wrong: v })}
            />
            <FieldArea
              label="O que confirmar a seguir"
              value={row.what_to_confirm}
              onChange={(v) => update(i, { what_to_confirm: v })}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              className="btn-primary text-sm"
              disabled={savingIdx === i}
              onClick={() => save(i)}
            >
              {savingIdx === i ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </div>
      ))}

      <button className="btn-ghost" onClick={addRow}>
        + Adicionar fundo
      </button>
    </div>
  );
}

function FieldArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea
        className="field-input min-h-[90px] text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
