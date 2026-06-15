"use client";

import { useState } from "react";

type Fund = {
  id?: string;
  name: string;
  program: string;
  entity: string;
  summary: string;
  beneficiaries: string;
  eligible_expenses: string;
  support_rate: string;
  amount_range: string;
  status: string;
  complexity: string;
  hidden_conditions: string;
  risks: string;
  incompatibilities: string;
  required_docs: string;
  source_url: string;
  pdf_url: string;
  closes_at: string | null;
};

const blank: Fund = {
  name: "",
  program: "",
  entity: "",
  summary: "",
  beneficiaries: "",
  eligible_expenses: "",
  support_rate: "",
  amount_range: "",
  status: "previsto",
  complexity: "media",
  hidden_conditions: "",
  risks: "",
  incompatibilities: "",
  required_docs: "",
  source_url: "",
  pdf_url: "",
  closes_at: null,
};

export default function FundEditor({ existing }: { existing: any[] }) {
  const [editing, setEditing] = useState<Fund | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch("/api/funds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(null);
      location.reload();
    }
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-clay/20 bg-white/60 p-6">
        <h2 className="font-display text-xl font-bold text-soil">
          {editing.id ? "Editar fundo" : "Novo fundo"}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <F label="Nome" v={editing.name} on={(v) => setEditing({ ...editing, name: v })} />
          <F label="Programa" v={editing.program} on={(v) => setEditing({ ...editing, program: v })} />
          <F label="Entidade" v={editing.entity} on={(v) => setEditing({ ...editing, entity: v })} />
          <F label="Taxa de apoio" v={editing.support_rate} on={(v) => setEditing({ ...editing, support_rate: v })} />
          <F label="Montantes" v={editing.amount_range} on={(v) => setEditing({ ...editing, amount_range: v })} />
          <F label="Link oficial (página do aviso)" v={editing.source_url} on={(v) => setEditing({ ...editing, source_url: v })} />
          <F label="PDF original do aviso (URL do documento)" v={editing.pdf_url} on={(v) => setEditing({ ...editing, pdf_url: v })} />
          <label className="block">
            <span className="field-label">Data de fecho (se conhecida)</span>
            <input className="field-input" type="date" value={editing.closes_at || ""} onChange={(e) => setEditing({ ...editing, closes_at: e.target.value })} />
          </label>
          <label className="block">
            <span className="field-label">Estado</span>
            <select className="field-input" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
              <option value="previsto">Previsto</option>
              <option value="aberto">Aberto</option>
              <option value="fechado">Fechado</option>
            </select>
          </label>
          <label className="block">
            <span className="field-label">Complexidade</span>
            <select className="field-input" value={editing.complexity} onChange={(e) => setEditing({ ...editing, complexity: e.target.value })}>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </label>
        </div>

        <div className="mt-4 space-y-4">
          <FA label="Resumo (linguagem simples)" v={editing.summary} on={(v) => setEditing({ ...editing, summary: v })} />
          <FA label="Beneficiários" v={editing.beneficiaries} on={(v) => setEditing({ ...editing, beneficiaries: v })} />
          <FA label="Despesas elegíveis" v={editing.eligible_expenses} on={(v) => setEditing({ ...editing, eligible_expenses: v })} />
          <FA label="⚠️ Condições escondidas" v={editing.hidden_conditions} on={(v) => setEditing({ ...editing, hidden_conditions: v })} />
          <FA label="⚠️ Riscos" v={editing.risks} on={(v) => setEditing({ ...editing, risks: v })} />
          <FA label="Incompatibilidades / não-acumulação" v={editing.incompatibilities} on={(v) => setEditing({ ...editing, incompatibilities: v })} />
          <FA label="Documentos obrigatórios" v={editing.required_docs} on={(v) => setEditing({ ...editing, required_docs: v })} />
        </div>

        <div className="mt-6 flex gap-3">
          <button className="btn-primary" disabled={saving} onClick={save}>
            {saving ? "A guardar…" : "Guardar fundo"}
          </button>
          <button className="btn-ghost" onClick={() => setEditing(null)}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn-primary" onClick={() => setEditing({ ...blank })}>
        + Novo fundo
      </button>
      <div className="mt-5 space-y-3">
        {existing.map((f) => (
          <div key={f.id} className="rounded-xl border border-clay/20 bg-white/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-soil">{f.name}</span>
                  {f.publish_status === "rascunho" && (
                    <span className="rounded-full bg-wheat/30 px-2 py-0.5 text-xs font-semibold text-clay">
                      Rascunho{f.ai_generated ? " · IA" : ""}
                    </span>
                  )}
                </div>
                <div className="text-sm text-ink/60">{f.program} · {f.entity}</div>
              </div>
              <div className="flex gap-2">
                {f.publish_status === "rascunho" && (
                  <button
                    className="btn-primary text-sm"
                    onClick={async () => {
                      await fetch("/api/funds/publish", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: f.id }),
                      });
                      location.reload();
                    }}
                  >
                    Publicar
                  </button>
                )}
                <button className="btn-ghost text-sm" onClick={() => setEditing(f)}>
                  Editar
                </button>
              </div>
            </div>
            {f.ai_generated && f.publish_status === "rascunho" && (
              <p className="mt-2 text-sm text-clay">
                ⚠️ Gerado por IA — revê os valores e condições antes de publicar.
              </p>
            )}
          </div>
        ))}
        {existing.length === 0 && (
          <div className="rounded-xl border border-dashed border-clay/30 p-8 text-center text-ink/50">
            Sem fundos ainda. Corre o seed.sql ou adiciona o primeiro.
          </div>
        )}
      </div>
    </div>
  );
}

function F({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field-input" value={v || ""} onChange={(e) => on(e.target.value)} />
    </label>
  );
}
function FA({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea className="field-input min-h-[80px] text-sm" value={v || ""} onChange={(e) => on(e.target.value)} />
    </label>
  );
}
