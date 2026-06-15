import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import ReportEditor from "@/components/ReportEditor";

export const dynamic = "force-dynamic";

export default async function Relatorio({
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

  // só fundos marcados "incluir" entram no relatório
  const { data: matches } = await supabase
    .from("matches")
    .select("*, funding_opportunities(name, program, support_rate, source_url)")
    .eq("project_id", params.id)
    .eq("admin_decision", "incluir");

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("project_id", params.id)
    .maybeSingle();

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
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/admin/projeto/${project.id}`}
        className="text-sm text-clay underline"
      >
        ← Voltar ao projeto
      </Link>
      <h1 className="mt-3 font-display text-3xl font-black text-soil">
        Relatório — {project.contact_name || "—"}
      </h1>
      <p className="text-ink/60">
        {project.location_municipality}
        {project.location_district ? `, ${project.location_district}` : ""} ·{" "}
        {project.goal?.slice(0, 80)}
      </p>

      <ReportEditor
        projectId={project.id}
        report={report}
        matches={matches ?? []}
      />
    </main>
  );
}
