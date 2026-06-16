import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import ApoiosClient from "./ApoiosClient";

export const dynamic = "force-dynamic";

export default async function Apoios() {
  const supabase = createServiceClient();

  const [{ data: funds }, { data: domains }] = await Promise.all([
    supabase
      .from("funding_opportunities")
      .select(
        "id, name, program, entity, summary, beneficiaries, status, complexity, closes_at, opens_at, domain_id, funding_zones(zone_type)"
      )
      .neq("publish_status", "rascunho")
      .order("name"),
    supabase.from("domains").select("id, slug, label, icon").order("sort_order"),
  ]);

  const fundsWithScope = (funds ?? []).map((f: any) => {
    const zones = f.funding_zones || [];
    const isNacional = zones.some((z: any) => z.zone_type === "nacional");
    const scope =
      isNacional ? "nacional" : zones.length > 0 ? "restrito" : "desconhecido";
    return { ...f, _scope: scope };
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <NavBar />

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black text-soil">
            Apoios disponíveis
          </h1>
          <p className="mt-1 text-ink/70">
            Explora o catálogo de apoios públicos. Filtra por área, estado ou
            pesquisa por texto.
          </p>
        </div>
        <Link href="/areas" className="btn-primary shrink-0">
          Fazer diagnóstico
        </Link>
      </div>

      <ApoiosClient
        funds={fundsWithScope}
        domains={domains ?? []}
      />
    </main>
  );
}
