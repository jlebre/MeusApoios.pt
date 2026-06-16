import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import NavBar from "@/components/NavBar";

export const dynamic = "force-dynamic";

export default async function Areas() {
  const supabase = createServiceClient();
  const { data: domains } = await supabase
    .from("domains")
    .select("*")
    .order("sort_order");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <NavBar />

      <h1 className="mt-8 font-display text-4xl font-black text-soil">
        Em que área queres apoios?
      </h1>
      <p className="mt-2 text-ink/70">
        Escolhe a área e responde a algumas perguntas — recebes uma primeira
        leitura dos apoios que podem fazer sentido para o teu caso.
      </p>

      <div className="mt-4 rounded-xl border border-clay/20 bg-cream/50 p-4 text-sm text-ink/70">
        Tens conta?{" "}
        <Link href="/perfil" className="font-semibold text-clay underline">
          Entra
        </Link>{" "}
        para os teus dados (data de nascimento, localização, rendimento) se
        preencherem sozinhos — e as perguntas já respondidas são saltadas. Ou
        continua sem conta — só não fica guardado.
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(domains ?? []).map((d: any) => (
          <Link key={d.id} href={`/diagnostico?dominio=${d.slug}`}>
            <div className="h-full rounded-2xl border border-clay/20 bg-white/60 p-6 transition hover:border-clay/50 hover:shadow-sm">
              <div className="text-3xl">{d.icon}</div>
              <h2 className="mt-2 font-display text-xl font-bold text-soil">
                {d.label}
              </h2>
              <p className="mt-1 text-sm text-ink/70">{d.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-clay/10 pt-6">
        <p className="text-xs text-ink/40">
          Os resultados são uma primeira leitura — confirma sempre no aviso oficial.
        </p>
        <Link href="/apoios" className="text-sm font-medium text-clay hover:underline">
          Ver catálogo de apoios →
        </Link>
      </div>
    </main>
  );
}
