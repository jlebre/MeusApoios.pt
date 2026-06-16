import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import FavoriteButton from "@/components/FavoriteButton";
import { notFound } from "next/navigation";
import ApoiosClient from "../ApoiosClient";
import {
  getFundStatus,
  getFundDeadlineMessage,
  daysUntil,
  FUND_STATUS_LABEL,
  FUND_STATUS_COLOR,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COMPLEXITY_LABEL: Record<string, string> = {
  baixa: "Processo simples",
  media: "Complexidade média",
  alta: "Processo exigente",
};

export default async function ApoioRoute({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceClient();

  // ─── Página de domínio: /apoios/agricultura, /apoios/habitacao, etc. ───
  if (!UUID_RE.test(params.id)) {
    const { data: domain } = await supabase
      .from("domains")
      .select("*")
      .eq("slug", params.id)
      .eq("active", true)
      .maybeSingle();

    if (!domain) notFound();

    const { data: funds } = await supabase
      .from("funding_opportunities")
      .select(
        "id, name, program, entity, summary, beneficiaries, status, complexity, closes_at, opens_at, domain_id, funding_zones(zone_type)"
      )
      .eq("domain_id", domain.id)
      .neq("publish_status", "rascunho")
      .order("name");

    const fundsWithScope = (funds || []).map((f: any) => {
      const zones = f.funding_zones || [];
      const isNacional = zones.some((z: any) => z.zone_type === "nacional");
      const scope =
        isNacional
          ? "nacional"
          : zones.length > 0
          ? "restrito"
          : "desconhecido";
      return { ...f, _scope: scope };
    });

    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <NavBar />
        <div className="mt-4 flex items-center gap-2 text-sm text-ink/50">
          <Link href="/apoios" className="hover:text-clay">
            Apoios
          </Link>
          <span>/</span>
          <span className="text-ink/70">{domain.label}</span>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3">
            {domain.icon && (
              <span className="text-4xl" aria-hidden>
                {domain.icon}
              </span>
            )}
            <h1 className="font-display text-3xl font-black text-soil sm:text-4xl">
              {domain.label}
            </h1>
          </div>
          {domain.description && (
            <p className="mt-3 max-w-2xl text-ink/70">{domain.description}</p>
          )}
          {fundsWithScope.length === 0 && (
            <p className="mt-3 text-sm text-ink/60">
              Esta área ainda tem poucos apoios mapeados, mas já podes fazer uma
              primeira leitura e explorar oportunidades relacionadas.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/diagnostico?dominio=${domain.slug}`}
            className="btn-primary"
          >
            Fazer diagnóstico em {domain.label}
          </Link>
          <Link href="/apoios" className="btn-ghost">
            Ver todos os apoios
          </Link>
        </div>

        <ApoiosClient
          funds={fundsWithScope}
          domains={[
            {
              id: domain.id,
              slug: domain.slug,
              label: domain.label,
              icon: domain.icon,
            },
          ]}
          defaultDomain={domain.id}
        />
      </main>
    );
  }

  // ─── Página de detalhe de apoio (/apoios/uuid) ───
  const { data: fund } = await supabase
    .from("funding_opportunities")
    .select(
      "*, eligibility_rules(*), funding_amounts(*), funding_documents_required(*), funding_zones(*), domains(slug, label, icon)"
    )
    .eq("id", params.id)
    .neq("publish_status", "rascunho")
    .maybeSingle();

  if (!fund) notFound();

  const domain = (fund as any).domains;
  const status = getFundStatus(fund as any);
  const statusColor = FUND_STATUS_COLOR[status] ?? "bg-clay/10 text-ink/60";
  const deadlineMsg = getFundDeadlineMessage(fund as any, status);
  const daysLeft = fund.closes_at && status === "aberto" ? daysUntil(fund.closes_at) : null;

  const docs = ((fund as any).funding_documents_required || [])
    .slice()
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const rules = (fund as any).eligibility_rules || [];
  const zones = (fund as any).funding_zones || [];
  const hasNacional = zones.some((z: any) => z.zone_type === "nacional");
  const districtZones = zones.filter((z: any) => z.zone_type === "distrito");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <NavBar />
      <div className="mt-4 flex items-center gap-2 text-sm text-ink/50">
        <Link href="/apoios" className="hover:text-clay">
          Apoios
        </Link>
        <span>/</span>
        <span className="truncate text-ink/70">{fund.name}</span>
      </div>

      {/* Cabeçalho */}
      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${statusColor}`}
          >
            {FUND_STATUS_LABEL[status] ?? "Desconhecido"}
          </span>
          {domain && (
            <span className="rounded-full bg-cream px-3 py-1 text-sm text-ink/60">
              {domain.icon} {domain.label}
            </span>
          )}
          {fund.complexity && (
            <span className="rounded-full bg-wheat/20 px-3 py-1 text-sm text-clay">
              {COMPLEXITY_LABEL[fund.complexity] ?? fund.complexity}
            </span>
          )}
          {daysLeft !== null && daysLeft >= 0 && daysLeft <= 30 && (
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                daysLeft <= 7 ? "bg-red-100 text-red-700" : "bg-wheat/30 text-clay"
              }`}
            >
              {daysLeft === 0 ? "Hoje!" : daysLeft === 1 ? "Amanhã" : `${daysLeft} dias`}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-start gap-3">
          <h1 className="flex-1 font-display text-3xl font-black text-soil sm:text-4xl">
            {fund.name}
          </h1>
          <FavoriteButton fundId={fund.id} fundName={fund.name} size="md" />
        </div>
        {(fund.program || fund.entity) && (
          <p className="mt-1 text-ink/60">
            {[fund.program, fund.entity].filter(Boolean).join(" · ")}
          </p>
        )}
        {deadlineMsg && (
          <p
            className={`mt-2 text-sm font-medium ${
              daysLeft !== null && daysLeft <= 7
                ? "text-red-600"
                : daysLeft !== null && daysLeft <= 30
                ? "text-clay"
                : "text-ink/55"
            }`}
          >
            {deadlineMsg}
          </p>
        )}
      </div>

      {/* Prazos */}
      {(fund.opens_at || fund.closes_at) && (
        <div className="mt-5 flex flex-wrap gap-4 rounded-xl border border-clay/20 bg-cream/50 p-4 text-sm">
          {fund.opens_at && (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-ink/40">
                Abertura
              </span>
              <span className="text-ink">
                {new Date(fund.opens_at).toLocaleDateString("pt-PT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          {fund.closes_at && (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-ink/40">
                Fecho
              </span>
              <span className="font-semibold text-clay">
                {new Date(fund.closes_at).toLocaleDateString("pt-PT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Resumo */}
      {fund.summary && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold text-soil">Resumo</h2>
          <p className="mt-2 leading-relaxed text-ink/80">{fund.summary}</p>
        </section>
      )}

      {/* Quem pode beneficiar */}
      {fund.beneficiaries && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold text-soil">
            Quem pode beneficiar
          </h2>
          <p className="mt-2 leading-relaxed text-ink/80">
            {fund.beneficiaries}
          </p>
        </section>
      )}

      {/* Quem provavelmente não deve perder tempo */}
      {rules.filter((r: any) => r.severity === "eliminatoria").length > 0 && (
        <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-display text-lg font-bold text-red-800">
            Quem provavelmente não deve perder tempo
          </h2>
          <p className="mt-1 text-xs text-red-700">
            Estas condições são eliminatórias — se não as cumpres, este apoio
            provavelmente não se aplica ao teu caso.
          </p>
          <ul className="mt-3 space-y-2">
            {rules
              .filter((r: any) => r.severity === "eliminatoria")
              .map((r: any) => (
                <li key={r.id} className="flex gap-2 text-sm">
                  <span aria-hidden className="shrink-0">
                    ⛔
                  </span>
                  <span className="text-red-900">
                    <span className="font-semibold">{r.label}</span>
                    {r.explain_fail && (
                      <span className="mt-0.5 block text-xs text-red-700">
                        {r.explain_fail}
                      </span>
                    )}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* O que pode correr mal */}
      {(fund.hidden_conditions || fund.risks || fund.incompatibilities) && (
        <section className="mt-6 rounded-xl border border-wheat/50 bg-wheat/10 p-5">
          <h2 className="font-display text-lg font-bold text-soil">
            O que pode correr mal
          </h2>
          <p className="mt-0.5 text-xs text-ink/55">
            Pontos que normalmente não se veem à primeira leitura.
          </p>
          {fund.hidden_conditions && (
            <p className="mt-3 text-sm leading-relaxed text-ink/80">
              <strong>Condições escondidas:</strong> {fund.hidden_conditions}
            </p>
          )}
          {fund.risks && (
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              <strong>Riscos:</strong> {fund.risks}
            </p>
          )}
          {fund.incompatibilities && (
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              <strong>Não acumulável com:</strong> {fund.incompatibilities}
            </p>
          )}
        </section>
      )}

      {/* Zona geográfica */}
      {zones.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold text-soil">
            Âmbito geográfico
          </h2>
          <p className="mt-2 text-ink/80">
            {hasNacional
              ? "Âmbito nacional (continente)."
              : districtZones.length > 0
              ? `Distritos elegíveis: ${districtZones
                  .flatMap((z: any) => z.match_values || [])
                  .join(", ")}.`
              : "Consulta o aviso oficial para confirmar a zona elegível."}
          </p>
        </section>
      )}

      {/* Montantes */}
      {(fund.support_rate ||
        fund.amount_range ||
        (fund as any).funding_amounts?.length > 0) && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold text-soil">
            Valor do apoio
          </h2>
          {fund.support_rate && (
            <p className="mt-1 text-ink/80">
              Taxa de apoio: <strong>{fund.support_rate}</strong>
            </p>
          )}
          {fund.amount_range && (
            <p className="mt-1 text-ink/80">Montantes: {fund.amount_range}</p>
          )}
          {(fund as any).funding_amounts?.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-ink/75">
              {((fund as any).funding_amounts as any[]).map(
                (a: any, i: number) => (
                  <li key={i}>
                    {a.label}:{" "}
                    {a.kind === "fixo"
                      ? `${(a.fixed_amount || 0).toLocaleString("pt-PT")} €`
                      : `${a.rate}%${
                          a.cap
                            ? ` (máx. ${a.cap.toLocaleString("pt-PT")} €)`
                            : ""
                        }`}
                    {a.notes && (
                      <span className="text-ink/50"> — {a.notes}</span>
                    )}
                  </li>
                )
              )}
            </ul>
          )}
        </section>
      )}

      {/* Despesas elegíveis */}
      {fund.eligible_expenses && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold text-soil">
            Despesas elegíveis
          </h2>
          <p className="mt-2 leading-relaxed text-ink/80">
            {fund.eligible_expenses}
          </p>
        </section>
      )}

      {/* Condições principais */}
      {rules.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold text-soil">
            Condições principais
          </h2>
          <ul className="mt-3 space-y-2">
            {rules.map((r: any) => (
              <li key={r.id} className="flex gap-2 text-sm">
                <span aria-hidden className="shrink-0">
                  {r.severity === "eliminatoria" ? "⛔" : "⚠️"}
                </span>
                <span className="text-ink/80">
                  <span className="font-semibold text-soil">{r.label}</span>
                  {r.explain_fail && (
                    <span className="mt-0.5 block text-xs text-ink/55">
                      {r.explain_fail}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Documentos necessários */}
      {docs.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold text-soil">
            Documentos necessários
          </h2>
          <ul className="mt-3 space-y-3">
            {docs.map((d: any) => (
              <li key={d.id} className="text-sm">
                <span className="font-medium text-soil">▢ {d.name}</span>
                {d.hint && (
                  <span className="block pl-4 text-xs text-ink/55">
                    {d.hint}
                  </span>
                )}
                {d.how_to_get && (
                  <span className="block pl-4 text-xs text-olive">
                    Como obter: {d.how_to_get}
                  </span>
                )}
                {d.official_url && (
                  <a
                    href={d.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-4 text-xs text-clay underline"
                  >
                    Portal oficial ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Links oficiais */}
      {(fund.source_url ||
        fund.platform_url ||
        fund.pdf_url ||
        fund.info_url) && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold text-soil">
            Fontes oficiais
          </h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {fund.source_url && (
              <a
                href={fund.source_url}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost text-sm"
              >
                Página oficial ↗
              </a>
            )}
            {fund.platform_url && (
              <a
                href={fund.platform_url}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-sm"
              >
                Candidatar ↗
              </a>
            )}
            {fund.info_url && (
              <a
                href={fund.info_url}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost text-sm"
              >
                Mais informação ↗
              </a>
            )}
            {fund.pdf_url && (
              <a
                href={fund.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost text-sm"
              >
                PDF do aviso ↗
              </a>
            )}
          </div>
        </section>
      )}

      {/* CTA diagnóstico */}
      {domain && (
        <div className="mt-10 rounded-2xl border border-clay/20 bg-soil p-8 text-center text-cream">
          <h2 className="font-display text-2xl font-black">
            Este apoio aplica-se a mim?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-cream/80">
            Responde a algumas perguntas sobre o teu caso e descobre se és
            elegível, o que pode correr mal e os próximos passos.
          </p>
          <Link
            href={`/diagnostico?dominio=${domain.slug}`}
            className="mt-5 inline-block rounded-full bg-wheat px-8 py-3 font-semibold text-soil hover:bg-wheat/90"
          >
            Fazer diagnóstico em {domain.label}
          </Link>
        </div>
      )}

      {fund.updated_at && (
        <p className="mt-8 text-xs text-ink/35">
          Última atualização:{" "}
          {new Date(fund.updated_at).toLocaleDateString("pt-PT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          . Confirma sempre as condições no aviso oficial antes de candidatares.
        </p>
      )}
    </main>
  );
}
