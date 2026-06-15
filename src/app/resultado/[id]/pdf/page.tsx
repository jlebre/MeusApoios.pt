import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import {
  evaluateFund,
  simulateAmount,
  VERDICT_LABEL,
  type Rule,
  type Amount,
} from "@/lib/eligibility";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

const ORDER: Record<string, number> = {
  elegivel: 0, em_risco: 1, confirmar: 2, inelegivel: 3,
};

export default async function ResultadoPDF({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceClient();
  const { data: project } = await supabase
    .from("projects").select("*, domains(label)").eq("id", params.id).single();

  if (!project) {
    return <main className="p-10 text-center">Diagnóstico não encontrado.</main>;
  }

  if (!project.unlocked) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-ink/70">
          O PDF do relatório faz parte da versão completa.
        </p>
        <Link href={`/resultado/${project.id}`} className="btn-primary mt-6">
          Ver como desbloquear
        </Link>
      </main>
    );
  }

  let fundsQuery = supabase
    .from("funding_opportunities")
    .select("*, eligibility_rules(*), funding_amounts(*), funding_documents_required(*)");
  if (project.domain_id) fundsQuery = fundsQuery.eq("domain_id", project.domain_id);
  const { data: funds } = await fundsQuery;

  const evaluated = (funds ?? [])
    .map((f: any) => {
      const { verdict, results } = evaluateFund((f.eligibility_rules || []) as Rule[], project);
      const sim = simulateAmount((f.funding_amounts || []) as Amount[], project);
      return { fund: f, verdict, results, sim };
    })
    .sort((a, b) => (ORDER[a.verdict] ?? 9) - (ORDER[b.verdict] ?? 9) || b.sim.total - a.sim.total);

  const candidataveis = evaluated.filter((e) => e.verdict === "elegivel" || e.verdict === "em_risco");
  const totalPotential = candidataveis.reduce((s, e) => s + e.sim.total, 0);
  const hoje = new Date().toLocaleDateString("pt-PT");

  return (
    <main className="mx-auto max-w-3xl bg-white px-10 py-8 text-ink print:px-0 print:py-0">
      {/* Barra de ação (não imprime) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/resultado/${project.id}`} className="text-sm text-clay underline">
          ← Voltar
        </Link>
        <PrintButton />
      </div>

      {/* Cabeçalho do relatório */}
      <header className="border-b-2 border-soil pb-4">
        <div className="font-display text-2xl font-black text-soil">
          Meus<span className="text-wheat">Apoios</span>
        </div>
        <h1 className="mt-2 font-display text-2xl font-black text-soil">
          Relatório de apoios — {project.domains?.label || "Diagnóstico"}
        </h1>
        <p className="text-sm text-ink/60">
          {project.contact_name ? `Para ${project.contact_name} · ` : ""}
          Gerado a {hoje}
        </p>
      </header>

      {/* Resumo */}
      <section className="mt-6 flex gap-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-clay">Apoios compatíveis</div>
          <div className="font-display text-3xl font-black text-soil">{candidataveis.length}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-clay">Potencial estimado</div>
          <div className="font-display text-3xl font-black text-soil">
            ~{totalPotential.toLocaleString("pt-PT")} €
          </div>
        </div>
      </section>

      {/* Apoios */}
      <section className="mt-6 space-y-5">
        {evaluated.filter((e) => e.verdict !== "inelegivel").map(({ fund, verdict, results, sim }) => (
          <div key={fund.id} className="break-inside-avoid rounded-lg border border-clay/30 p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold text-soil">{fund.name}</h2>
              {sim.total > 0 && (
                <span className="font-display font-black text-soil">
                  ~{sim.total.toLocaleString("pt-PT")} €
                </span>
              )}
            </div>
            <p className="text-xs text-ink/60">{fund.program} · {VERDICT_LABEL[verdict]}</p>
            {fund.summary && <p className="mt-2 text-sm">{fund.summary}</p>}

            <ul className="mt-3 space-y-1 text-sm">
              {results.map((r, i) => (
                <li key={i}>
                  {r.outcome === "cumpre" ? "✓" : r.outcome === "falha" ? "✗" : "?"}{" "}
                  <strong>{r.label}:</strong> {r.explanation}
                </li>
              ))}
            </ul>

            {fund.funding_documents_required?.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-clay">Documentos</div>
                <ul className="mt-1 text-sm">
                  {fund.funding_documents_required
                    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    .map((d: any) => (
                      <li key={d.id}>▢ {d.name}{d.how_to_get ? ` — ${d.how_to_get}` : ""}</li>
                    ))}
                </ul>
              </div>
            )}

            {(fund.source_url || fund.pdf_url) && (
              <p className="mt-2 text-xs text-ink/60">
                Aviso oficial: {fund.source_url || fund.pdf_url}
              </p>
            )}
          </div>
        ))}
      </section>

      <footer className="mt-8 border-t border-clay/30 pt-4 text-xs text-ink/50">
        <p>
          Documento gerado pelo MeusApoios. Ferramenta de apoio à decisão, sem
          garantias. Confirma sempre as condições, valores e prazos no aviso
          oficial de cada apoio antes de qualquer decisão ou despesa.
        </p>
      </footer>
    </main>
  );
}
