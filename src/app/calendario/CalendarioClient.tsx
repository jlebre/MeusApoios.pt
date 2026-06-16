"use client";

import { useMemo, useState } from "react";
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

type CalFund = {
  id: string;
  name: string;
  entity: string | null;
  program: string | null;
  status: string | null;
  opens_at: string | null;
  closes_at: string | null;
  complexity: string | null;
  domain_id: string | null;
  domains?: { slug: string; label: string; icon: string | null } | null;
};

type Domain = {
  id: string;
  slug: string;
  label: string;
  icon: string | null;
};

function UrgencyBadge({ days }: { days: number }) {
  if (days < 0) return null;
  if (days === 0)
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
        Hoje!
      </span>
    );
  if (days === 1)
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
        Amanhã
      </span>
    );
  if (days <= 7)
    return (
      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
        {days} dias
      </span>
    );
  if (days <= 30)
    return (
      <span className="rounded-full bg-wheat/30 px-2 py-0.5 text-xs font-semibold text-clay">
        {days} dias
      </span>
    );
  return null;
}

function FundRow({ fund }: { fund: CalFund & { _status: FundStatus; _days: number | null } }) {
  const domain = fund.domains;
  const deadline = getFundDeadlineMessage(fund, fund._status);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-clay/15 bg-white/60 p-4 transition hover:border-clay/30">
      <FavoriteButton fundId={fund.id} fundName={fund.name} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              FUND_STATUS_COLOR[fund._status]
            }`}
          >
            {FUND_STATUS_LABEL[fund._status]}
          </span>
          {domain && (
            <span className="rounded-full bg-cream px-2 py-0.5 text-xs text-ink/60">
              {domain.icon} {domain.label}
            </span>
          )}
          {fund._days !== null && <UrgencyBadge days={fund._days} />}
        </div>

        <Link
          href={`/apoios/${fund.id}`}
          className="mt-1.5 block font-display font-bold text-soil hover:underline"
        >
          {fund.name}
        </Link>

        {(fund.entity || fund.program) && (
          <p className="text-sm text-ink/55">
            {[fund.entity, fund.program].filter(Boolean).join(" · ")}
          </p>
        )}

        {deadline && (
          <p
            className={`mt-1 text-xs font-medium ${
              fund._days !== null && fund._days <= 7
                ? "text-red-600"
                : fund._days !== null && fund._days <= 30
                ? "text-clay"
                : "text-ink/50"
            }`}
          >
            {deadline}
          </p>
        )}
      </div>

      <Link
        href={domain ? `/diagnostico?dominio=${domain.slug}` : "/areas"}
        className="btn-primary hidden shrink-0 text-sm sm:block"
      >
        Ver se me aplica
      </Link>
    </div>
  );
}

function Section({
  title,
  subtitle,
  funds,
  emptyText,
  highlight,
}: {
  title: string;
  subtitle?: string;
  funds: (CalFund & { _status: FundStatus; _days: number | null })[];
  emptyText?: string;
  highlight?: boolean;
}) {
  if (funds.length === 0 && !emptyText) return null;
  return (
    <section className="mt-8">
      <div
        className={`mb-3 flex items-baseline gap-3 border-b pb-2 ${
          highlight ? "border-red-200" : "border-clay/15"
        }`}
      >
        <h2
          className={`font-display text-xl font-bold ${
            highlight ? "text-red-700" : "text-soil"
          }`}
        >
          {title}
        </h2>
        {funds.length > 0 && (
          <span className="text-sm text-ink/50">
            {funds.length} apoio{funds.length !== 1 ? "s" : ""}
          </span>
        )}
        {subtitle && (
          <span className="ml-auto text-xs text-ink/40">{subtitle}</span>
        )}
      </div>

      {funds.length === 0 && emptyText ? (
        <p className="text-sm text-ink/50">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {funds.map((f) => (
            <FundRow key={f.id} fund={f} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function CalendarioClient({
  funds,
  domains,
}: {
  funds: CalFund[];
  domains: Domain[];
}) {
  const [filterDomain, setFilterDomain] = useState("");
  const [showClosed, setShowClosed] = useState(false);

  const enriched = useMemo(() => {
    const now = new Date();
    return funds
      .filter((f) => !filterDomain || f.domain_id === filterDomain)
      .map((f) => {
        const _status = getFundStatus(f, now);
        const _days =
          f.closes_at && _status === "aberto"
            ? daysUntil(f.closes_at, now)
            : f.opens_at && _status === "previsto"
            ? daysUntil(f.opens_at, now)
            : null;
        return { ...f, _status, _days };
      });
  }, [funds, filterDomain]);

  const urgentes = useMemo(
    () =>
      enriched
        .filter(
          (f) => f._status === "aberto" && f._days !== null && f._days <= 30
        )
        .sort((a, b) => (a._days ?? 999) - (b._days ?? 999)),
    [enriched]
  );

  const abertas = useMemo(
    () =>
      enriched.filter(
        (f) =>
          f._status === "aberto" &&
          (f._days === null || f._days > 30)
      ),
    [enriched]
  );

  const previstas = useMemo(
    () =>
      enriched
        .filter((f) => f._status === "previsto")
        .sort((a, b) => (a._days ?? 999) - (b._days ?? 999)),
    [enriched]
  );

  const recorrentes = useMemo(
    () => enriched.filter((f) => f._status === "recorrente"),
    [enriched]
  );

  const fechadas = useMemo(
    () => enriched.filter((f) => f._status === "fechado"),
    [enriched]
  );

  const semData = useMemo(
    () => enriched.filter((f) => f._status === "desconhecido"),
    [enriched]
  );

  const total = urgentes.length + abertas.length + previstas.length + recorrentes.length;

  return (
    <>
      {/* Filtros */}
      <div className="mt-6 flex flex-wrap gap-3">
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
      </div>

      {/* Resumo */}
      {total === 0 && fechadas.length === 0 && semData.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-clay/30 p-10 text-center text-ink/50">
          Nenhum apoio encontrado com os filtros selecionados.
        </div>
      )}

      {/* Prazos urgentes */}
      {urgentes.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-baseline gap-3 border-b border-red-200 pb-2">
            <h2 className="font-display text-xl font-bold text-red-700">
              ⚠️ Prazos urgentes
            </h2>
            <span className="text-sm text-ink/50">
              {urgentes.length} apoio{urgentes.length !== 1 ? "s" : ""} a
              fechar em 30 dias
            </span>
          </div>
          <div className="space-y-3">
            {urgentes.map((f) => (
              <FundRow key={f.id} fund={f} />
            ))}
          </div>
        </section>
      )}

      <Section
        title="Candidaturas abertas"
        subtitle="sem prazo urgente"
        funds={abertas}
        emptyText={
          urgentes.length === 0 ? "Sem candidaturas abertas de momento." : undefined
        }
      />

      <Section
        title="Próximas aberturas"
        subtitle="candidaturas previstas"
        funds={previstas}
      />

      <Section
        title="Candidaturas recorrentes"
        subtitle="sem prazo fixo"
        funds={recorrentes}
      />

      {semData.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 border-b border-clay/15 pb-2">
            <h2 className="font-display text-lg font-semibold text-ink/50">
              Sem datas definidas
            </h2>
          </div>
          <div className="space-y-3">
            {semData.map((f) => (
              <FundRow key={f.id} fund={f} />
            ))}
          </div>
        </section>
      )}

      {/* Candidaturas fechadas — ocultas por defeito */}
      {fechadas.length > 0 && (
        <section className="mt-8">
          <button
            type="button"
            onClick={() => setShowClosed((v) => !v)}
            className="flex items-center gap-2 text-sm text-ink/50 underline"
          >
            {showClosed ? "Ocultar" : "Mostrar"} candidaturas encerradas (
            {fechadas.length})
          </button>
          {showClosed && (
            <div className="mt-3 space-y-3 opacity-60">
              {fechadas.map((f) => (
                <FundRow key={f.id} fund={f} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
