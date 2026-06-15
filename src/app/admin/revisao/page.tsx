import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import ReviewCard from "@/components/ReviewCard";

export const dynamic = "force-dynamic";

export default async function Revisao() {
  const supabase = createServiceClient();
  const { data: funds } = await supabase
    .from("funding_opportunities")
    .select("*, domains(label), eligibility_rules(*), funding_amounts(*)")
    .order("review_status", { ascending: true })
    .order("name");

  const porRever = (funds ?? []).filter((f: any) => f.review_status !== "confirmado");
  const confirmados = (funds ?? []).filter((f: any) => f.review_status === "confirmado");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin" className="text-sm text-ocean underline">← Voltar</Link>
      <h1 className="mt-3 font-display text-3xl font-black text-ink">
        Revisão de fundos
      </h1>
      <p className="mt-2 text-slate">
        Confirma cada fundo contra o aviso oficial. Abre o link, verifica os
        valores e condições, e marca. {porRever.length} por rever ·{" "}
        {confirmados.length} confirmados.
      </p>

      <div className="mt-8 space-y-5">
        {porRever.map((f: any) => (
          <ReviewCard key={f.id} fund={f} />
        ))}
        {porRever.length === 0 && (
          <div className="rounded-xl border border-dashed border-mint/40 bg-mint/5 p-8 text-center text-slate">
            🎉 Tudo revisto! Não há fundos por confirmar.
          </div>
        )}
      </div>

      {confirmados.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer font-semibold text-slate">
            Ver {confirmados.length} fundos já confirmados
          </summary>
          <div className="mt-4 space-y-3">
            {confirmados.map((f: any) => (
              <ReviewCard key={f.id} fund={f} compact />
            ))}
          </div>
        </details>
      )}
    </main>
  );
}
