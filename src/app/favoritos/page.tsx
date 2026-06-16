"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import FavoriteButton from "@/components/FavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";
import { getBrowserClient } from "@/lib/supabase-browser";
import {
  getFundStatus,
  getFundDeadlineMessage,
  daysUntil,
  FUND_STATUS_LABEL,
  FUND_STATUS_COLOR,
  type FundStatus,
} from "@/lib/utils";

type FavFund = {
  id: string;
  name: string;
  entity: string | null;
  program: string | null;
  summary: string | null;
  status: string | null;
  opens_at: string | null;
  closes_at: string | null;
  complexity: string | null;
  domain_id: string | null;
  domains?: { slug: string; label: string; icon: string | null } | null;
  _status?: FundStatus;
  _days?: number | null;
};

function FundCard({ fund }: { fund: FavFund }) {
  const domain = fund.domains;
  const status = fund._status ?? "desconhecido";
  const deadline = getFundDeadlineMessage(fund, status);
  const days = fund._days;

  return (
    <div className="rounded-2xl border border-clay/20 bg-white/60 p-5 transition hover:border-clay/40">
      <div className="flex items-start gap-3">
        <FavoriteButton fundId={fund.id} fundName={fund.name} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${FUND_STATUS_COLOR[status]}`}
            >
              {FUND_STATUS_LABEL[status]}
            </span>
            {domain && (
              <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs text-ink/60">
                {domain.icon} {domain.label}
              </span>
            )}
            {days !== null && days !== undefined && days >= 0 && days <= 30 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  days <= 7 ? "bg-red-100 text-red-700" : "bg-wheat/30 text-clay"
                }`}
              >
                {days === 0 ? "Hoje!" : days === 1 ? "Amanhã" : `${days} dias`}
              </span>
            )}
          </div>

          <h2 className="mt-2 font-display text-lg font-bold text-soil">
            {fund.name}
          </h2>

          {(fund.entity || fund.program) && (
            <p className="text-sm text-ink/55">
              {[fund.entity, fund.program].filter(Boolean).join(" · ")}
            </p>
          )}

          {fund.summary && (
            <p className="mt-2 line-clamp-2 text-sm text-ink/70">
              {fund.summary}
            </p>
          )}

          {deadline && (
            <p
              className={`mt-1.5 text-xs font-medium ${
                days !== null && days !== undefined && days <= 7
                  ? "text-red-600"
                  : days !== null && days !== undefined && days <= 30
                  ? "text-clay"
                  : "text-ink/50"
              }`}
            >
              {deadline}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/apoios/${fund.id}`} className="btn-ghost text-sm">
          Ver detalhes
        </Link>
        {domain && (
          <Link
            href={`/diagnostico?dominio=${domain.slug}`}
            className="btn-primary text-sm"
          >
            Ver se me aplica
          </Link>
        )}
      </div>
    </div>
  );
}

export default function FavoritosPage() {
  const { ids, loaded } = useFavorites();
  const [funds, setFunds] = useState<FavFund[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (ids.length === 0) {
      setFunds([]);
      return;
    }

    setFetching(true);
    const supabase = getBrowserClient();

    supabase
      .from("funding_opportunities")
      .select(
        "id, name, entity, program, summary, status, opens_at, closes_at, complexity, domain_id, domains(slug, label, icon)"
      )
      .in("id", ids)
      .neq("publish_status", "rascunho")
      .then(({ data }: { data: any[] | null }) => {
        if (!data) { setFetching(false); return; }
        const now = new Date();
        const sorted = data
          .map((f: any) => {
            const _status = getFundStatus(f, now);
            const _days =
              f.closes_at && _status === "aberto"
                ? daysUntil(f.closes_at, now)
                : null;
            return { ...f, _status, _days };
          })
          .sort((a: FavFund, b: FavFund) => {
            const order: Record<string, number> = {
              aberto: 0,
              previsto: 1,
              recorrente: 2,
              desconhecido: 3,
              fechado: 4,
            };
            const ao = order[a._status ?? "desconhecido"] ?? 5;
            const bo = order[b._status ?? "desconhecido"] ?? 5;
            if (ao !== bo) return ao - bo;
            if (a.closes_at && b.closes_at)
              return (
                new Date(a.closes_at).getTime() -
                new Date(b.closes_at).getTime()
              );
            return 0;
          });
        setFunds(sorted);
        setFetching(false);
      });
  }, [ids, loaded]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <NavBar />

      <div className="mt-8">
        <h1 className="font-display text-4xl font-black text-soil">
          Os meus favoritos
        </h1>
        <p className="mt-1 text-ink/70">
          Apoios que guardaste para acompanhar. Usa a estrela ★ em qualquer
          apoio para o adicionar aqui.
        </p>
      </div>

      {!loaded && (
        <p className="mt-10 text-ink/50">A carregar…</p>
      )}

      {loaded && ids.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-clay/30 p-12 text-center">
          <p className="text-2xl">☆</p>
          <p className="mt-3 font-display text-lg font-bold text-soil">
            Ainda não tens favoritos
          </p>
          <p className="mt-1 text-sm text-ink/60">
            Navega pelo catálogo e usa a estrela ☆ para guardar apoios que
            queiras acompanhar.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/apoios" className="btn-primary">
              Ver catálogo
            </Link>
            <Link href="/calendario" className="btn-ghost">
              Ver calendário
            </Link>
          </div>
        </div>
      )}

      {loaded && ids.length > 0 && fetching && (
        <div className="mt-10 space-y-4">
          {ids.map((id) => (
            <div
              key={id}
              className="h-28 animate-pulse rounded-2xl bg-clay/10"
            />
          ))}
        </div>
      )}

      {loaded && !fetching && funds.length > 0 && (
        <>
          <p className="mt-4 text-sm text-ink/50">
            {funds.length} apoio{funds.length !== 1 ? "s" : ""} guardado
            {funds.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-3 space-y-4">
            {funds.map((f) => (
              <FundCard key={f.id} fund={f} />
            ))}
          </div>
          <p className="mt-6 text-xs text-ink/40">
            Os favoritos são guardados neste browser. Regista-te para os
            sincronizar entre dispositivos (brevemente).
          </p>
        </>
      )}

      {loaded && !fetching && ids.length > 0 && funds.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-clay/30 p-8 text-center text-ink/50">
          Não foi possível carregar os favoritos. Verifica a tua ligação.
        </div>
      )}
    </main>
  );
}
