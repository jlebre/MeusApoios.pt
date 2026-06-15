"use client";

import { useState } from "react";

export default function ReviewCard({
  fund,
  compact,
}: {
  fund: any;
  compact?: boolean;
}) {
  const [status, setStatus] = useState(fund.review_status || "por_rever");
  const [notes, setNotes] = useState(fund.review_notes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function mark(newStatus: string) {
    setSaving(true);
    setSaved(false);
    await fetch("/api/funds/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fund.id, review_status: newStatus, review_notes: notes }),
    });
    setStatus(newStatus);
    setSaving(false);
    setSaved(true);
  }

  const statusBadge =
    status === "confirmado"
      ? { label: "Confirmado", cls: "bg-mint/15 text-mint2" }
      : status === "a_corrigir"
      ? { label: "A corrigir", cls: "bg-amber-100 text-amber-700" }
      : { label: "Por rever", cls: "bg-sky text-ocean2" };

  if (compact) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate/15 bg-white px-4 py-3">
        <span className="font-medium text-ink">{fund.name}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge.cls}`}>
          {statusBadge.label}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate/15 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-ink">{fund.name}</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge.cls}`}>
              {statusBadge.label}
            </span>
          </div>
          <p className="text-sm text-slate">
            {fund.domains?.label} · {fund.program}
          </p>
        </div>
      </div>

      {/* Resumo dos dados a verificar */}
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <Field label="Montante" value={fund.amount_range} />
        <Field label="Taxa de apoio" value={fund.support_rate} />
        <Field label="Estado" value={fund.status} />
        <Field label="Regras" value={`${fund.eligibility_rules?.length || 0} condições`} />
      </dl>

      {fund.hidden_conditions && (
        <p className="mt-3 rounded-lg bg-sky/60 p-3 text-sm text-ink">
          <strong>Condições escondidas:</strong> {fund.hidden_conditions}
        </p>
      )}

      {/* Links oficiais para confirmar */}
      <div className="mt-3 flex flex-wrap gap-2">
        {fund.source_url && (
          <a href={fund.source_url} target="_blank" rel="noreferrer"
             className="rounded-lg bg-ocean px-3 py-2 text-sm font-semibold text-white">
            Abrir aviso oficial ↗
          </a>
        )}
        {fund.platform_url && (
          <a href={fund.platform_url} target="_blank" rel="noreferrer"
             className="rounded-lg border border-ocean/30 px-3 py-2 text-sm font-medium text-ocean">
            Plataforma de candidatura ↗
          </a>
        )}
        {fund.info_url && (
          <a href={fund.info_url} target="_blank" rel="noreferrer"
             className="rounded-lg border border-ocean/30 px-3 py-2 text-sm font-medium text-ocean">
            Página informativa ↗
          </a>
        )}
      </div>

      {/* Notas da revisão */}
      <textarea
        className="field-input mt-3 min-h-[60px] text-sm"
        placeholder="Notas da tua revisão (o que confirmaste, o que está errado…)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Ações rápidas */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          className="rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-white hover:bg-mint2 disabled:opacity-50"
          disabled={saving}
          onClick={() => mark("confirmado")}
        >
          ✓ Confirmado
        </button>
        <button
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 disabled:opacity-50"
          disabled={saving}
          onClick={() => mark("a_corrigir")}
        >
          ⚠ Precisa de correção
        </button>
        <a
          href={`/admin/fundos`}
          className="rounded-lg border border-slate/30 px-4 py-2 text-sm font-medium text-slate"
        >
          Editar campos
        </a>
        {saved && <span className="text-sm text-mint2">Guardado ✓</span>}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate">{label}</dt>
      <dd className="text-ink">{value || "—"}</dd>
    </div>
  );
}
