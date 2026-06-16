"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  getFundStatus,
  getFundDeadlineMessage,
  daysUntil,
  FUND_STATUS_LABEL,
  FUND_STATUS_COLOR,
  type FundStatus,
} from "@/lib/utils";
import FavoriteButton from "@/components/FavoriteButton";

type Fund = {
  id: string;
  name: string;
  program: string | null;
  entity: string | null;
  summary: string | null;
  beneficiaries: string | null;
  status: string | null;
  complexity: string | null;
  closes_at: string | null;
  opens_at: string | null;
  domain_id: string | null;
  _scope?: string | null;
};

type Domain = {
  id: string;
  slug: string;
  label: string;
  icon: string | null;
};

const COMPLEXITY_LABEL: Record<string, string> = {
  baixa: "Processo simples",
  media: "Complexidade média",
  alta: "Processo exigente",
};

const COMPLEXITY_COLOR: Record<string, string> = {
  baixa: "bg-mint/20 text-olive",
  media: "bg-wheat/20 text-clay",
  alta: "bg-clay/15 text-clay",
};

export default function ApoiosClient({
  funds,
  domains,
  defaultDomain = "",
}: {
  funds: Fund[];
  domains: Domain[];
  defaultDomain?: string;
}) {
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState(defaultDomain);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterComplexity, setFilterComplexity] = useState("");
  const [filterScope, setFilterScope] = useState("");

  const domainMap = useMemo(
    () => Object.fromEntries(domains.map((d) => [d.id, d])),
    [domains]
  );

  // Enrich each fund with computed status once
  const enriched = useMemo(() => {
    const now = new Date();
    return funds.map((f) => ({
      ...f,
      _computedStatus: getFundStatus(f, now) as FundStatus,
    }));
  }, [funds]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched.filter((f) => {
      if (filterDomain && f.domain_id !== filterDomain) return false;
      if (filterStatus && f._computedStatus !== filterStatus) return false;
      if (filterComplexity && (f.complexity || "media") !== filterComplexity)
        return false;
      if (filterScope && f._scope !== filterScope) return false;
      if (q) {
        const haystack = [f.name, f.entity, f.program, f.summary, f.beneficiaries]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [enriched, filterDomain, filterStatus, filterComplexity, filterScope, search]);

  const showScopeFilter = funds.some((f) => f._scope && f._scope !== "desconhecido");

  const statusOptions: FundStatus[] = ["aberto", "previsto", "recorrente", "fechado", "desconhecido"];

  return (
    <>
      {/* Filtros */}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          className="field-input min-w-[220px] flex-1"
          placeholder="Pesquisar apoios…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {domains.length > 1 && (
          <select
            className="field-input"
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
          >
            <option value="">Todas as áreas</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.icon} {d.label}
              </option>
            ))}
          </select>
        )}
        <select
          className="field-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos os estados</option>
          {statusOptions.map((v) => (
            <option key={v} value={v}>
              {FUND_STATUS_LABEL[v]}
            </option>
          ))}
        </select>
        <select
          className="field-input"
          value={filterComplexity}
          onChange={(e) => setFilterComplexity(e.target.value)}
        >
          <option value="">Toda a dificuldade</option>
          {Object.entries(COMPLEXITY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        {showScopeFilter && (
          <select
            className="field-input"
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
          >
            <option value="">Qualquer âmbito</option>
            <option value="nacional">🌍 Nacional</option>
            <option value="restrito">📍 Zona restrita</option>
          </select>
        )}
      </div>

      {/* Contagem */}
      <p className="mt-4 text-sm text-ink/50">
        {filtered.length} apoio{filtered.length !== 1 ? "s" : ""}
        {search || filterDomain || filterStatus || filterComplexity || filterScope
          ? " encontrado" + (filtered.length !== 1 ? "s" : "")
          : " no catálogo"}
      </p>

      {/* Lista */}
      <div className="mt-4 space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-clay/30 p-10 text-center text-ink/50">
            Nenhum apoio corresponde aos filtros selecionados.
          </div>
        )}
        {filtered.map((f) => {
          const domain = f.domain_id ? domainMap[f.domain_id] : null;
          const deadline = getFundDeadlineMessage(f, f._computedStatus);
          const days =
            f.closes_at && f._computedStatus === "aberto"
              ? daysUntil(f.closes_at)
              : null;

          return (
            <div
              key={f.id}
              className="rounded-2xl border border-clay/20 bg-white/60 p-5 transition hover:border-clay/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        FUND_STATUS_COLOR[f._computedStatus]
                      }`}
                    >
                      {FUND_STATUS_LABEL[f._computedStatus]}
                    </span>
                    {domain && (
                      <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs text-ink/60">
                        {domain.icon} {domain.label}
                      </span>
                    )}
                    {f.complexity && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          COMPLEXITY_COLOR[f.complexity] ?? "bg-clay/10 text-ink/60"
                        }`}
                      >
                        {COMPLEXITY_LABEL[f.complexity] ?? f.complexity}
                      </span>
                    )}
                    {f._scope && f._scope !== "desconhecido" && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          f._scope === "nacional"
                            ? "bg-sky/15 text-sky"
                            : "bg-cream text-ink/60"
                        }`}
                      >
                        {f._scope === "nacional" ? "🌍 Nacional" : "📍 Regional"}
                      </span>
                    )}
                    {days !== null && days >= 0 && days <= 30 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          days <= 7
                            ? "bg-red-100 text-red-700"
                            : "bg-wheat/30 text-clay"
                        }`}
                      >
                        {days === 0 ? "Hoje!" : days === 1 ? "Amanhã" : `${days} dias`}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 font-display text-lg font-bold text-soil">
                    {f.name}
                  </h2>
                  {(f.program || f.entity) && (
                    <p className="text-sm text-ink/55">
                      {[f.program, f.entity].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {f.summary && (
                    <p className="mt-2 line-clamp-2 text-sm text-ink/75">
                      {f.summary}
                    </p>
                  )}
                  {f.beneficiaries && (
                    <p className="mt-1 text-xs text-ink/50">
                      Para: {f.beneficiaries}
                    </p>
                  )}
                  {deadline && (
                    <p
                      className={`mt-1 text-xs font-medium ${
                        days !== null && days <= 7
                          ? "text-red-600"
                          : days !== null && days <= 30
                          ? "text-clay"
                          : "text-ink/50"
                      }`}
                    >
                      {deadline}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <FavoriteButton fundId={f.id} fundName={f.name} />
                  <Link
                    href={`/apoios/${f.id}`}
                    className="btn-ghost whitespace-nowrap text-sm"
                  >
                    Ver detalhes
                  </Link>
                  {domain && (
                    <Link
                      href={`/diagnostico?dominio=${domain.slug}`}
                      className="btn-primary whitespace-nowrap text-sm"
                    >
                      Ver se me aplica
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
