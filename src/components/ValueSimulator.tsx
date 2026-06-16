"use client";

import { useState } from "react";

// Simulação afinada (premium): a pessoa ajusta o orçamento/investimento e vê
// como o valor estimado de cada apoio muda em tempo real.
// Recebe os apoios já avaliados com as suas regras de montante (amounts).
type FundAmount = {
  kind: string;
  rate: number | null;
  fixed_amount: number | null;
  cap: number | null;
  base_field: string;
};
type SimFund = {
  id: string;
  name: string;
  amounts: FundAmount[];
};

function computeValue(amounts: FundAmount[], budget: number): number {
  let total = 0;
  for (const a of amounts) {
    if (a.kind === "fixo" && a.fixed_amount) {
      total += a.fixed_amount;
    } else if (a.kind === "percentagem" && a.rate) {
      let v = (budget * a.rate) / 100;
      if (a.cap && v > a.cap) v = a.cap;
      total += v;
    }
  }
  return Math.round(total);
}

export default function ValueSimulator({
  funds,
  initialBudget,
}: {
  funds: SimFund[];
  initialBudget: number;
}) {
  const [budget, setBudget] = useState(initialBudget || 20000);

  return (
    <div className="rounded-2xl border border-ocean/30 bg-sky/40 p-6">
      <h2 className="font-display text-xl font-black text-ink">
        Simular valores
      </h2>
      <p className="mt-1 text-sm text-slate">
        Ajusta o teu investimento e vê como muda o valor estimado de cada apoio.
        Estimativa indicativa — confirma sempre no aviso oficial.
      </p>

      <label className="mt-4 block">
        <span className="field-label">
          Investimento / orçamento: {budget.toLocaleString("pt-PT")} €
        </span>
        <input
          type="range"
          min={1000}
          max={200000}
          step={1000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-ocean"
        />
        <div className="flex justify-between text-xs text-slate">
          <span>1.000 €</span>
          <span>200.000 €</span>
        </div>
      </label>

      <ul className="mt-4 space-y-2">
        {funds.map((f) => {
          const v = computeValue(f.amounts, budget);
          return (
            <li
              key={f.id}
              className="flex items-center justify-between rounded-lg bg-white px-4 py-3"
            >
              <span className="text-sm text-ink">{f.name}</span>
              <span className="font-display font-black text-mint2">
                {v > 0 ? `~${v.toLocaleString("pt-PT")} €` : "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
