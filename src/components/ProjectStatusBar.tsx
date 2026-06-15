"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  ["novo", "Novo"],
  ["em_analise", "Em análise"],
  ["relatorio_entregue", "Relatório entregue"],
  ["fechado", "Fechado"],
];

export default function ProjectStatusBar({
  projectId,
  status,
}: {
  projectId: string;
  status: string;
}) {
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function change(next: string) {
    setSaving(true);
    setCurrent(next);
    await fetch("/api/projects/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId, status: next }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-clay/20 bg-cream/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-clay">
          Estado
        </span>
        {STATUSES.map(([v, label]) => (
          <button
            key={v}
            onClick={() => change(v)}
            disabled={saving}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              current === v
                ? "bg-soil text-cream"
                : "border border-clay/30 bg-white/70 text-soil hover:bg-clay/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <a href={`/admin/projeto/${projectId}/relatorio`} className="btn-primary text-sm">
        Abrir relatório →
      </a>
    </div>
  );
}
