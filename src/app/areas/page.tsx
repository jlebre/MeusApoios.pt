import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Areas() {
  const supabase = createServiceClient();
  const { data: domains } = await supabase
    .from("domains")
    .select("*")
    .order("sort_order");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="font-display text-xl font-black tracking-tight text-soil"
      >
        Meus<span className="text-wheat">Apoios</span>
      </Link>

      <h1 className="mt-8 font-display text-4xl font-black text-soil">
        Em que área queres apoios?
      </h1>
      <p className="mt-2 text-ink/70">
        Escolhe a área que te interessa. Podes fazer mais do que um diagnóstico.
      </p>

      <div className="mt-4 rounded-xl border border-clay/20 bg-cream/50 p-4 text-sm text-ink/70">
        Tens conta?{" "}
        <Link href="/perfil" className="font-semibold text-clay underline">
          Entra
        </Link>{" "}
        para os teus dados (idade, localização, rendimento) se preencherem
        sozinhos em todas as áreas. Ou continua sem conta — só não fica guardado.
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(domains ?? []).map((d: any) => {
          const card = (
            <div
              className={`h-full rounded-2xl border p-6 transition ${
                d.active
                  ? "border-clay/20 bg-white/60 hover:border-clay/50"
                  : "border-clay/10 bg-clay/5 opacity-70"
              }`}
            >
              <div className="text-3xl">{d.icon}</div>
              <h2 className="mt-2 font-display text-xl font-bold text-soil">
                {d.label}
              </h2>
              <p className="mt-1 text-sm text-ink/70">{d.description}</p>
              {!d.active && (
                <span className="mt-3 inline-block rounded-full bg-clay/15 px-3 py-1 text-xs font-semibold text-clay">
                  Em breve
                </span>
              )}
            </div>
          );
          return d.active ? (
            <Link key={d.id} href={`/diagnostico?dominio=${d.slug}`}>
              {card}
            </Link>
          ) : (
            <div key={d.id}>{card}</div>
          );
        })}
      </div>

      <p className="mt-10 text-xs text-ink/40">
        Algumas áreas ainda estão a ser preparadas. A área de Agricultura está
        completa.
      </p>
    </main>
  );
}
