import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import FundEditor from "@/components/FundEditor";

export const dynamic = "force-dynamic";

export default async function Fundos() {
  const supabase = createServiceClient();
  const { data: funds } = await supabase
    .from("funding_opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/admin" className="text-sm text-clay underline">
        ← Voltar aos projetos
      </Link>
      <h1 className="mt-3 font-display text-3xl font-black text-soil">
        Fundos / Apoios
      </h1>
      <p className="mt-1 text-ink/60">
        A tua base de apoios. Começa com poucos, bem trabalhados. Qualidade {">"}{" "}
        quantidade.
      </p>

      <div className="mt-6">
        <FundEditor existing={funds ?? []} />
      </div>
    </main>
  );
}
