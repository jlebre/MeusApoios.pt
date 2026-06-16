import { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { createServiceClient } from "@/lib/supabase";
import CalendarioClient from "./CalendarioClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendário de apoios | MeusApoios",
  description:
    "Prazos e aberturas de candidaturas a apoios agrícolas e rurais. Não percas nenhum prazo.",
};

export default async function CalendarioPage() {
  const supabase = createServiceClient();

  const { data: funds } = await supabase
    .from("funding_opportunities")
    .select(
      "id, name, entity, program, status, opens_at, closes_at, complexity, domain_id, domains(slug, label, icon)"
    )
    .neq("publish_status", "rascunho")
    .order("closes_at", { ascending: true, nullsFirst: false });

  // Normalize domains: Supabase embedded join may return array or single object
  const allFunds = (funds ?? []).map((f: any) => ({
    ...f,
    domains: Array.isArray(f.domains) ? (f.domains[0] ?? null) : f.domains,
  }));

  // Deduplicate domains from fund list (avoids a separate query)
  const domainMap = new Map<string, { id: string; slug: string; label: string; icon: string | null }>();
  for (const f of allFunds) {
    if (f.domain_id && f.domains) {
      domainMap.set(f.domain_id, {
        id: f.domain_id,
        slug: (f.domains as any).slug,
        label: (f.domains as any).label,
        icon: (f.domains as any).icon,
      });
    }
  }
  const domains = Array.from(domainMap.values());

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <NavBar />

      <div className="mt-8">
        <h1 className="font-display text-4xl font-black text-soil">
          Calendário de apoios
        </h1>
        <p className="mt-1 text-ink/70">
          Prazos e aberturas de candidaturas. Organizado por urgência para não
          perderes nenhuma oportunidade.
        </p>
      </div>

      <CalendarioClient funds={allFunds} domains={domains} />
    </main>
  );
}
