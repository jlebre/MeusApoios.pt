import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import MatchEditor from "@/components/MatchEditor";
import ProjectStatusBar from "@/components/ProjectStatusBar";

export const dynamic = "force-dynamic";

export default async function ProjetoDetalhe({
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

  const { data: funds } = await supabase
    .from("funding_opportunities")
    .select(
      "id, name, program, status, summary, hidden_conditions, risks, incompatibilities, required_docs, support_rate, source_url"
    )
    .order("name");

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("project_id", params.id);

  if (!project) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center text-ink/60">
        Projeto não encontrado.{" "}
        <Link href="/admin" className="text-clay underline">
          Voltar
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/admin" className="text-sm text-clay underline">
        ← Voltar aos projetos
      </Link>

      <h1 className="mt-3 font-display text-3xl font-black text-soil">
        {project.contact_name || "Projeto sem nome"}
      </h1>
      <p className="text-ink/60">
        {project.location_municipality}
        {project.location_district ? `, ${project.location_district}` : ""}
      </p>

      {/* Barra de estado + acesso ao relatório */}
      <ProjectStatusBar projectId={project.id} status={project.status} />

      {/* Dados do projeto */}
      <section className="mt-6 grid gap-4 rounded-xl border border-clay/20 bg-white/60 p-6 sm:grid-cols-2">
        <Data k="Objetivo" v={project.goal} full />
        <Data k="Orçamento" v={project.budget_eur ? `${project.budget_eur} €` : "—"} />
        <Data k="Horizonte" v={project.timeline} />
        <Data k="Idade" v={project.promoter_age} />
        <Data k="Tipo de promotor" v={project.promoter_type} />
        <Data k="Atividade aberta" v={fmtBool(project.activity_open)} />
        <Data k="NIFAP" v={fmtBool(project.has_nifap)} />
        <Data k="1ª instalação" v={fmtBool(project.first_install)} />
        <Data k="Área" v={project.area_ha ? `${project.area_ha} ha` : "—"} />
        <Data k="Água" v={fmtBool(project.has_water)} />
        <Data k="Culturas" v={project.crops} />
        <Data k="Animais" v={project.animals} />
        <Data k="Edifícios" v={project.buildings} />
        <Data k="Contacto" v={`${project.contact_email || ""} ${project.contact_phone || ""}`} />
      </section>

      {/* Cruzamento manual com fundos */}
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold text-soil">
          Cruzar com fundos
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Escolhe um fundo e preenche os três campos. Estas notas são a base do
          relatório que vais entregar.
        </p>
        <div className="mt-4">
          <MatchEditor
            projectId={project.id}
            funds={funds ?? []}
            existing={matches ?? []}
          />
        </div>
      </section>

      <p className="mt-10 text-xs text-ink/40">
        Lembrete: os fundos estão marcados para revisão. Confirma valores e
        prazos no aviso oficial antes de fechar o relatório.
      </p>
    </main>
  );
}

function Data({
  k,
  v,
  full,
}: {
  k: string;
  v: any;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-xs font-semibold uppercase tracking-wide text-clay">
        {k}
      </div>
      <div className="text-ink/85">{v || "—"}</div>
    </div>
  );
}

function fmtBool(v: boolean | null) {
  if (v === true) return "Sim";
  if (v === false) return "Não";
  return "Não sei";
}
