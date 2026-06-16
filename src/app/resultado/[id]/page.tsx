import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import BrandLogo from "@/components/BrandLogo";
import {
  evaluateFund,
  simulateAmount,
  checkZone,
  prioritize,
  buildComparison,
  VERDICT_LABEL,
  VERDICT_COLOR,
  type Rule,
  type Amount,
  type Zone,
} from "@/lib/eligibility";
import FundComparator from "@/components/FundComparator";
import ValueSimulator from "@/components/ValueSimulator";
import ApplicationGuide from "@/components/ApplicationGuide";
import UnlockButton from "@/components/UnlockButton";

export const dynamic = "force-dynamic";

const ORDER: Record<string, number> = {
  elegivel: 0,
  em_risco: 1,
  confirmar: 2,
  inelegivel: 3,
};

export default async function Resultado({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!project) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center text-ink/60">
        Não encontrámos este diagnóstico.{" "}
        <Link href="/diagnostico" className="text-clay underline">
          Fazer novo
        </Link>
      </main>
    );
  }

  let fundsQuery = supabase
    .from("funding_opportunities")
    .select("*, eligibility_rules(*), funding_amounts(*), funding_documents_required(*), funding_zones(*)")
    .neq("publish_status", "rascunho");
  if (project.domain_id) {
    fundsQuery = fundsQuery.eq("domain_id", project.domain_id);
  }
  const { data: funds } = await fundsQuery;

  const evaluated = (funds ?? [])
    .map((f: any) => {
      const { verdict, results } = evaluateFund(
        (f.eligibility_rules || []) as Rule[],
        project
      );
      const sim = simulateAmount((f.funding_amounts || []) as Amount[], project);
      const zone = checkZone((f.funding_zones || []) as Zone[], project);
      // Se a localização está fora da zona, rebaixa o veredito
      let finalVerdict = verdict;
      if (zone.status === "fora") finalVerdict = "inelegivel";
      return { fund: f, verdict: finalVerdict, results, sim, zone };
    })
    .sort(
      (a, b) =>
        (ORDER[a.verdict] ?? 9) - (ORDER[b.verdict] ?? 9) ||
        b.sim.total - a.sim.total
    );

  // Fundos "candidatáveis" = elegível ou com ressalvas
  const candidataveis = evaluated.filter(
    (e) => e.verdict === "elegivel" || e.verdict === "em_risco"
  );
  const totalPotential = candidataveis.reduce((s, e) => s + e.sim.total, 0);
  const unlocked = !!project.unlocked;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="font-display text-xl font-black tracking-tight text-soil"
      >
        <BrandLogo />
      </Link>

      <h1 className="mt-8 font-display text-3xl sm:text-4xl font-black text-soil">
        A tua primeira leitura
      </h1>
      <p className="mt-2 text-ink/70">
        Com base no que respondeste, analisámos os apoios disponíveis para o teu
        caso. Aqui está o resumo.
      </p>

      {/* RESUMO GRÁTIS — sempre visível */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-soil p-6 text-cream">
          <div className="text-sm text-cream/70">Apoios a que te podes candidatar</div>
          <div className="font-display text-4xl sm:text-5xl font-black text-wheat">
            {candidataveis.length}
          </div>
          <div className="mt-1 text-xs text-cream/60">
            de {evaluated.length} analisados
          </div>
        </div>
        <div className="rounded-2xl border border-clay/20 bg-white/60 p-6">
          <div className="text-sm text-clay">Potencial estimado total</div>
          <div className="font-display text-4xl font-black text-soil">
            ~{totalPotential.toLocaleString("pt-PT")} €
          </div>
          <div className="mt-1 text-xs text-ink/50">
            Soma de estimativas. Exige confirmação no aviso oficial.
          </div>
        </div>
      </div>

      {/* GATE: se não desbloqueado, mostra preview + paywall */}
      {!unlocked && candidataveis.length > 0 && (
        <div className="mt-8">
          {/* Lista esbatida com os nomes tapados */}
          <div className="relative">
            <div className="space-y-3" aria-hidden>
              {candidataveis.slice(0, 3).map(({ verdict, sim }, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-clay/20 bg-white/60 blur-sm select-none"
                >
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{ backgroundColor: VERDICT_COLOR[verdict] + "22" }}
                  >
                    <span className="text-sm font-bold" style={{ color: VERDICT_COLOR[verdict] }}>
                      {VERDICT_LABEL[verdict]}
                    </span>
                    <span className="font-display text-lg font-black text-soil">
                      ~{sim.total.toLocaleString("pt-PT")} €
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <div className="h-5 w-2/3 rounded bg-clay/20" />
                    <div className="mt-2 h-3 w-full rounded bg-clay/10" />
                    <div className="mt-1 h-3 w-4/5 rounded bg-clay/10" />
                  </div>
                </div>
              ))}
            </div>

            {/* Cartão de desbloqueio sobreposto */}
            <div className="mt-6 rounded-2xl border-2 border-wheat bg-cream p-7 text-center shadow-lg">
              <div className="font-display text-2xl font-black text-soil">
                {candidataveis.length === 1
                  ? "Tens 1 apoio compatível"
                  : `Tens ${candidataveis.length} apoios compatíveis`}
              </div>
              <p className="mx-auto mt-2 max-w-md text-ink/70">
                Desbloqueia para veres quais são, as condições de cada um, o que
                pode correr mal, os documentos necessários e o valor que podes
                receber em cada apoio.
              </p>
              <ul className="mx-auto mt-4 max-w-sm space-y-1 text-left text-sm text-ink/75">
                <li>✓ Nome e descrição de cada apoio</li>
                <li>✓ Condições verificadas contra o teu perfil</li>
                <li>✓ Valor estimado por apoio</li>
                <li>✓ Checklist de documentos necessários</li>
                <li>✓ Links e PDF do aviso oficial</li>
              </ul>
              <div className="mt-6">
                <UnlockButton projectId={project.id} />
              </div>
              <p className="mt-3 text-xs text-ink/50">
                Ou{" "}
                <Link href="/apoios" className="text-clay underline">
                  explora todos os apoios disponíveis
                </Link>{" "}
                antes de decidires.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sem fundos candidatáveis */}
      {!unlocked && candidataveis.length === 0 && (
        <div className="mt-8 rounded-2xl border border-clay/20 bg-white/60 p-7 text-center">
          <h2 className="font-display text-2xl font-black text-soil">
            Não encontrámos apoios claramente compatíveis
          </h2>
          <p className="mt-2 text-ink/70">
            Com as respostas atuais, nenhum apoio surge como diretamente
            elegível. Podes explorar outros apoios disponíveis ou tentar
            outro diagnóstico com informação mais detalhada.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/apoios" className="btn-primary">
              Explorar todos os apoios
            </Link>
            <Link href="/areas" className="btn-ghost">
              Fazer novo diagnóstico
            </Link>
          </div>
        </div>
      )}

      {/* DESBLOQUEADO: detalhe completo */}
      {unlocked && (
        <div className="mt-8 space-y-5">
          <div className="flex justify-end">
            <Link
              href={`/resultado/${project.id}/pdf`}
              className="btn-ghost text-sm"
            >
              ⬇ Descarregar PDF
            </Link>
          </div>

          {/* Priorização: por onde começar */}
          {(() => {
            const ranked = prioritize(
              evaluated.map((e) => ({ fund: e.fund, verdict: e.verdict, sim: e.sim }))
            );
            if (ranked.length === 0) return null;
            return (
              <div className="rounded-2xl border border-mint/40 bg-mint/5 p-6">
                <h2 className="font-display text-xl font-black text-ink">
                  Por onde começar
                </h2>
                <p className="mt-1 text-sm text-slate">
                  A nossa sugestão de ordem, pesando o valor, o prazo e a
                  facilidade de cada apoio para o teu caso.
                </p>
                <ol className="mt-4 space-y-3">
                  {ranked.slice(0, 5).map((r, i) => (
                    <li
                      key={r.fund.id}
                      className="flex gap-3 rounded-xl bg-white p-4"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean font-display text-sm font-black text-white">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-ink">
                            {r.fund.name}
                          </span>
                          {r.urgent && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              Urgente
                            </span>
                          )}
                        </div>
                        {r.reasons.length > 0 && (
                          <p className="mt-1 text-sm text-slate">
                            {r.reasons.join(" · ")}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })()}

          {/* Comparador (premium) */}
          {(() => {
            const rows = buildComparison(
              evaluated.map((e) => ({ fund: e.fund, verdict: e.verdict, sim: e.sim }))
            );
            if (rows.length < 2) return null;
            return <FundComparator rows={rows} />;
          })()}

          {/* Simulador de valores (premium) */}
          {(() => {
            const simFunds = evaluated
              .filter((e) => e.verdict !== "inelegivel")
              .map((e) => ({
                id: e.fund.id,
                name: e.fund.name,
                amounts: e.fund.funding_amounts || [],
              }))
              .filter((f) => f.amounts.length > 0);
            if (simFunds.length === 0) return null;
            return (
              <ValueSimulator
                funds={simFunds}
                initialBudget={Number(project.budget_eur) || 20000}
              />
            );
          })()}

          {/* Guias de candidatura (premium) — para os candidatáveis */}
          {(() => {
            const guias = evaluated.filter(
              (e) =>
                (e.verdict === "elegivel" || e.verdict === "em_risco") &&
                (e.fund.funding_documents_required || []).length > 0
            );
            if (guias.length === 0) return null;
            return (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-black text-ink">
                  Como avançar com cada apoio
                </h2>
                {guias.map((e) => (
                  <ApplicationGuide
                    key={e.fund.id}
                    projectId={project.id}
                    fund={{
                      id: e.fund.id,
                      name: e.fund.name,
                      platform_url: e.fund.platform_url,
                      source_url: e.fund.source_url,
                      closes_at: e.fund.closes_at,
                      documents: (e.fund.funding_documents_required || [])
                        .slice()
                        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                        .map((d: any) => ({
                          id: d.id,
                          name: d.name,
                          how_to_get: d.how_to_get,
                          official_url: d.official_url,
                        })),
                    }}
                  />
                ))}
              </div>
            );
          })()}
          {evaluated.map(({ fund, verdict, results, sim, zone }) => (
            <div
              key={fund.id}
              className="overflow-hidden rounded-2xl border border-clay/20 bg-white/60"
            >
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ backgroundColor: VERDICT_COLOR[verdict] + "22" }}
              >
                <span className="text-sm font-bold" style={{ color: VERDICT_COLOR[verdict] }}>
                  {VERDICT_LABEL[verdict]}
                </span>
                {sim.total > 0 && verdict !== "inelegivel" && (
                  <span className="font-display text-lg font-black text-soil">
                    ~{sim.total.toLocaleString("pt-PT")} €
                  </span>
                )}
              </div>

              <div className="px-5 py-4">
                <h2 className="font-display text-xl font-bold text-soil">
                  {fund.name}
                </h2>
                <p className="text-sm text-ink/60">
                  {fund.program} · {fund.entity}
                </p>
                {fund.summary && (
                  <p className="mt-2 text-sm text-ink/80">{fund.summary}</p>
                )}

                {(fund.source_url || fund.pdf_url || fund.platform_url || fund.info_url) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    {fund.source_url && (
                      <a href={fund.source_url} target="_blank" rel="noreferrer" className="text-clay underline">
                        Página oficial ↗
                      </a>
                    )}
                    {fund.platform_url && (
                      <a href={fund.platform_url} target="_blank" rel="noreferrer" className="text-clay underline">
                        Candidatar ↗
                      </a>
                    )}
                    {fund.info_url && (
                      <a href={fund.info_url} target="_blank" rel="noreferrer" className="text-clay underline">
                        Mais informação ↗
                      </a>
                    )}
                    {fund.pdf_url && (
                      <a href={fund.pdf_url} target="_blank" rel="noreferrer" className="text-clay underline">
                        PDF do aviso ↗
                      </a>
                    )}
                  </div>
                )}

                {zone && zone.status !== "sem_info" && (
                  <p className="mt-2 text-sm">
                    {zone.status === "ok" && (
                      <span className="text-olive">📍 Estás dentro da zona elegível{zone.label ? ` (${zone.label})` : ""}.</span>
                    )}
                    {zone.status === "nacional" && (
                      <span className="text-olive">📍 Apoio de âmbito nacional (continente).</span>
                    )}
                    {zone.status === "fora" && (
                      <span className="text-[#9b3b2f]">📍 A tua zona parece estar fora da área deste apoio{zone.label ? ` (${zone.label})` : ""}.</span>
                    )}
                  </p>
                )}

                <ul className="mt-4 space-y-2">
                  {results.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span aria-hidden>
                        {r.outcome === "cumpre"
                          ? "✅"
                          : r.outcome === "falha"
                          ? r.severity === "eliminatoria"
                            ? "⛔"
                            : "⚠️"
                          : "❓"}
                      </span>
                      <span>
                        <span className="font-semibold text-soil">{r.label}:</span>{" "}
                        <span className="text-ink/75">{r.explanation}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                {verdict !== "inelegivel" &&
                  fund.funding_documents_required &&
                  fund.funding_documents_required.length > 0 && (
                    <div className="mt-5 rounded-lg bg-cream/70 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-clay">
                        Documentos que vais precisar
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {fund.funding_documents_required
                          .sort(
                            (a: any, b: any) =>
                              (a.sort_order ?? 0) - (b.sort_order ?? 0)
                          )
                          .map((d: any) => (
                            <li key={d.id} className="text-sm">
                              <span className="text-soil">▢</span>{" "}
                              <span className="font-medium text-soil">
                                {d.name}
                              </span>
                              {d.hint && (
                                <span className="block pl-5 text-xs text-ink/55">
                                  {d.hint}
                                </span>
                              )}
                              {d.how_to_get && (
                                <span className="block pl-5 text-xs text-olive">
                                  Como obter: {d.how_to_get}
                                </span>
                              )}
                              {d.official_url && (
                                <a
                                  href={d.official_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ml-5 text-xs text-clay underline"
                                >
                                  Abrir portal oficial ↗
                                </a>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-clay/20 bg-cream/60 p-6 text-center">
            <h2 className="font-display text-xl font-black text-soil">
              Queres ajuda a chegar ao teu objetivo?
            </h2>
            <p className="mt-2 text-ink/70">
              Descreve a tua ideia ao assistente e ele ajuda-te a montar o
              caminho, com base nos apoios que te servem.
            </p>
            <Link
              href={`/assistente?project=${project.id}`}
              className="btn-primary mt-5"
            >
              Falar com o assistente
            </Link>
          </div>

          <div className="rounded-2xl border border-clay/20 bg-cream/60 p-6 text-center">
            <h2 className="font-display text-xl font-black text-soil">
              Queres explorar mais apoios?
            </h2>
            <p className="mt-2 text-ink/70">
              Vê o catálogo completo de apoios disponíveis — filtra por área,
              estado ou região para encontrares o que se aplica ao teu caso.
            </p>
            <Link href="/apoios" className="btn-primary mt-5">
              Ver todos os apoios
            </Link>
          </div>
        </div>
      )}

      <p className="mt-10 text-xs text-ink/40">
        Esta leitura usa regras automáticas sobre as tuas respostas. Não
        substitui a validação do aviso oficial nem aconselhamento técnico
        acreditado.
      </p>
    </main>
  );
}
