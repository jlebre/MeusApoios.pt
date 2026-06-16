"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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
};

type Domain = {
  id: string;
  slug: string;
  label: string;
  icon: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  fechado: "Fechado",
  previsto: "Previsto",
  recorrente: "Recorrente",
};

const STATUS_COLOR: Record<string, string> = {
  aberto: "bg-olive/15 text-olive",
  fechado: "bg-clay/15 text-clay",
  previsto: "bg-sky/15 text-sky",
  recorrente: "bg-mint/20 text-olive",
};

function statusBadge(status: string | null) {
  const s = status || "previsto";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_COLOR[s] ?? "bg-clay/10 text-ink/60"
      }`}
    >
      {STATUS_LABEL[s] ?? "Desconhecido"}
    </span>
  );
}

export default function ApoiosClient({
  funds,
  domains,
}: {
  funds: Fund[];
  domains: Domain[];
}) {
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const domainMap = useMemo(
    () => Object.fromEntries(domains.map((d) => [d.id, d])),
    [domains]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return funds.filter((f) => {
      if (filterDomain && f.domain_id !== filterDomain) return false;
      if (filterStatus && (f.status || "previsto") !== filterStatus) return false;
      if (q) {
        const haystack = [f.name, f.entity, f.program, f.summary, f.beneficiaries]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [funds, filterDomain, filterStatus, search]);

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
        <select
          className="field-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos os estados</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Contagem */}
      <p className="mt-4 text-sm text-ink/50">
        {filtered.length} apoio{filtered.length !== 1 ? "s" : ""}
        {search || filterDomain || filterStatus ? " encontrado" + (filtered.length !== 1 ? "s" : "") : " no catálogo"}
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
          return (
            <div
              key={f.id}
              className="rounded-2xl border border-clay/20 bg-white/60 p-5 transition hover:border-clay/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {statusBadge(f.status)}
                    {domain && (
                      <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs text-ink/60">
                        {domain.icon} {domain.label}
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
                    <p className="mt-2 text-sm text-ink/75 line-clamp-2">
                      {f.summary}
                    </p>
                  )}
                  {f.beneficiaries && (
                    <p className="mt-1 text-xs text-ink/50">
                      Para: {f.beneficiaries}
                    </p>
                  )}
                  {f.closes_at && (
                    <p className="mt-1 text-xs text-clay">
                      Prazo:{" "}
                      {new Date(f.closes_at).toLocaleDateString("pt-PT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <Link
                    href={`/apoios/${f.id}`}
                    className="btn-ghost text-sm whitespace-nowrap"
                  >
                    Ver detalhes
                  </Link>
                  {domain && (
                    <Link
                      href={`/diagnostico?dominio=${domain.slug}`}
                      className="btn-primary text-sm whitespace-nowrap"
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
