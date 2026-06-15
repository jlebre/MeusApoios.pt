import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = createServiceClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  // Funil de validação
  const { count: iniciados } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("name", "diagnostico_iniciado");
  const { count: concluidos } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("name", "diagnostico_concluido");
  const { count: unlocks } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("name", "unlock_clicado");

  const statusLabel: Record<string, string> = {
    novo: "Novo",
    em_analise: "Em análise",
    relatorio_entregue: "Relatório entregue",
    fechado: "Fechado",
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black text-soil">
          Backoffice · Projetos
        </h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/revisao" className="btn-ghost">
            ✓ Rever fundos
          </Link>
          <Link href="/admin/ingestao" className="btn-ghost">
            + Aviso por IA
          </Link>
          <Link href="/admin/conversas" className="btn-ghost">
            Pedidos de conversa
          </Link>
          <Link href="/admin/fundos" className="btn-ghost">
            Gerir fundos
          </Link>
        </div>
      </div>

      <p className="mt-2 text-ink/60">
        {projects?.length ?? 0} projeto(s). Clica para analisar e cruzar com
        fundos.
      </p>

      {/* Funil de validação */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FunnelStat label="Iniciaram" value={iniciados ?? 0} />
        <FunnelStat label="Concluíram" value={concluidos ?? 0} />
        <FunnelStat label="Clicaram desbloquear" value={unlocks ?? 0} highlight />
      </div>

      <div className="mt-8 space-y-3">
        {(projects ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/admin/projeto/${p.id}`}
            className="block rounded-xl border border-clay/20 bg-white/60 p-5 transition hover:border-clay/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-lg font-bold text-soil">
                  {p.contact_name || "Sem nome"} ·{" "}
                  {p.location_municipality || "—"}
                </div>
                <div className="text-sm text-ink/60">
                  {p.goal?.slice(0, 90) || "Sem objetivo descrito"}
                </div>
              </div>
              <span className="rounded-full bg-olive/15 px-3 py-1 text-xs font-semibold text-olive">
                {statusLabel[p.status] || p.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink/50">
              <span>Idade: {p.promoter_age ?? "—"}</span>
              <span>Área: {p.area_ha ?? "—"} ha</span>
              <span>NIFAP: {fmtBool(p.has_nifap)}</span>
              <span>1ª instalação: {fmtBool(p.first_install)}</span>
              <span>Orçamento: {p.budget_eur ? `${p.budget_eur}€` : "—"}</span>
            </div>
          </Link>
        ))}
        {(!projects || projects.length === 0) && (
          <div className="rounded-xl border border-dashed border-clay/30 p-10 text-center text-ink/50">
            Ainda não há projetos. Partilha o link do diagnóstico para começar.
          </div>
        )}
      </div>
    </main>
  );
}

function fmtBool(v: boolean | null) {
  if (v === true) return "Sim";
  if (v === false) return "Não";
  return "?";
}

function FunnelStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-wheat bg-wheat/10"
          : "border-clay/20 bg-white/60"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-clay">
        {label}
      </div>
      <div className="font-display text-3xl font-black text-soil">{value}</div>
    </div>
  );
}
