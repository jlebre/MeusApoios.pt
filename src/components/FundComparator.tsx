"use client";

import { useState } from "react";

type CompareRow = {
  fund: any;
  verdict: string;
  value: number;
  complexity: string;
  closesAt: string | null;
  daysLeft: number | null;
};

const VERDICT_LABEL: Record<string, string> = {
  elegivel: "Provavelmente elegível",
  em_risco: "Com ressalvas",
  confirmar: "Falta confirmar",
};

const COMPLEXITY_LABEL: Record<string, string> = {
  baixa: "Simples",
  media: "Média",
  alta: "Exigente",
};

export default function FundComparator({ rows }: { rows: CompareRow[] }) {
  // por defeito compara os 3 primeiros (já vêm ordenados por prioridade)
  const [selected, setSelected] = useState<string[]>(
    rows.slice(0, 3).map((r) => r.fund.id)
  );

  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s
    );
  }

  const cols = rows.filter((r) => selected.includes(r.fund.id));

  return (
    <div className="rounded-2xl border border-slate/20 bg-white p-6">
      <h2 className="font-display text-xl font-black text-ink">
        Comparar apoios
      </h2>
      <p className="mt-1 text-sm text-slate">
        Escolhe até 3 apoios para ver lado a lado (toca para selecionar).
      </p>

      {/* seletor */}
      <div className="mt-3 flex flex-wrap gap-2">
        {rows.map((r) => (
          <button
            key={r.fund.id}
            onClick={() => toggle(r.fund.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              selected.includes(r.fund.id)
                ? "bg-ocean text-white"
                : "bg-sky text-ocean2"
            }`}
          >
            {r.fund.name}
          </button>
        ))}
      </div>

      {/* tabela comparativa (scroll horizontal em mobile) */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-slate/20 p-2 text-left text-xs uppercase tracking-wide text-slate">
                Critério
              </th>
              {cols.map((c) => (
                <th
                  key={c.fund.id}
                  className="border-b border-slate/20 p-2 text-left font-display text-ink"
                >
                  {c.fund.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Valor estimado">
              {cols.map((c) => (
                <td key={c.fund.id} className="p-2 font-bold text-mint2">
                  {c.value > 0 ? `~${c.value.toLocaleString("pt-PT")} €` : "—"}
                </td>
              ))}
            </Row>
            <Row label="Elegibilidade">
              {cols.map((c) => (
                <td key={c.fund.id} className="p-2 text-ink">
                  {VERDICT_LABEL[c.verdict] || c.verdict}
                </td>
              ))}
            </Row>
            <Row label="Esforço">
              {cols.map((c) => (
                <td key={c.fund.id} className="p-2 text-ink">
                  {COMPLEXITY_LABEL[c.complexity] || c.complexity}
                </td>
              ))}
            </Row>
            <Row label="Prazo">
              {cols.map((c) => (
                <td key={c.fund.id} className="p-2 text-ink">
                  {c.daysLeft == null
                    ? "Sem data"
                    : c.daysLeft < 0
                    ? "Terminado"
                    : `${c.daysLeft} dias`}
                </td>
              ))}
            </Row>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td className="border-b border-slate/10 p-2 text-xs font-semibold uppercase tracking-wide text-slate">
        {label}
      </td>
      {children}
    </tr>
  );
}
