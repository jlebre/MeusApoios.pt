import Link from "next/link";
import NavBar from "@/components/NavBar";
import { BRAND } from "@/lib/brand";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <NavBar />

      {/* Hero */}
      <section className="mt-16 max-w-3xl">
        <p className="mb-4 inline-block rounded-full bg-olive/15 px-3 py-1 text-sm font-semibold text-olive">
          Agricultura · Habitação · Energia · Empresas · Formação · Social
        </p>
        <h1 className="font-display text-4xl font-black leading-tight text-soil sm:text-5xl md:text-6xl">
          Os apoios existem.
          <br />
          <span className="text-clay">
            Perceber a que podes aceder é que é o problema.
          </span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink/80">
          Há condições escondidas, documentos obrigatórios, prazos curtos e
          regras de não-acumulação que fazem muita gente perder candidaturas —
          ou desistir antes de tentar. Respondes a algumas perguntas e recebes
          uma primeira leitura: que apoios podem fazer sentido, o que pode
          correr mal, e os próximos passos concretos.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/areas" className="btn-primary">
            Começar diagnóstico gratuito
          </Link>
          <Link href="/apoios" className="btn-ghost">
            Explorar apoios disponíveis
          </Link>
        </div>
        <p className="mt-3 text-sm text-ink/50">
          Sem compromisso. Recebes uma primeira leitura sem pagar nada.
        </p>
      </section>

      {/* Como funciona */}
      <section id="como" className="mt-24 grid gap-6 md:grid-cols-3">
        {[
          {
            n: "01",
            t: "Diz-nos do teu caso",
            d: "Data de nascimento, localização, rendimento e o teu objetivo. Linguagem simples, sem jargão. Respondes uma vez, vale para todas as áreas.",
          },
          {
            n: "02",
            t: "Cruzamos com os apoios",
            d: "Comparamos o teu perfil com os apoios relevantes — e, mais importante, com as condições que normalmente não se veem.",
          },
          {
            n: "03",
            t: "Recebes uma leitura clara",
            d: "Apoios que podem fazer sentido, riscos a confirmar, documentos em falta e os próximos passos concretos.",
          },
        ].map((s) => (
          <div
            key={s.n}
            className="rounded-xl border border-clay/20 bg-white/50 p-6"
          >
            <div className="font-display text-3xl font-black text-wheat">
              {s.n}
            </div>
            <h3 className="mt-2 font-display text-xl font-bold text-soil">
              {s.t}
            </h3>
            <p className="mt-2 text-ink/70">{s.d}</p>
          </div>
        ))}
      </section>

      {/* Diferenciação */}
      <section className="mt-24 rounded-2xl bg-soil p-10 text-cream">
        <h2 className="font-display text-3xl font-black">
          A diferença não é listar apoios. É a segunda leitura.
        </h2>
        <p className="mt-4 max-w-2xl text-cream/80">
          Qualquer site te diz que um apoio existe. O {BRAND.name} diz-te porque
          pode não servir, que confirmação falta, e o que desbloqueia a
          candidatura. Cada recomendação responde sempre a três coisas:
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Porque aparece", "O que no teu perfil sugere este apoio."],
            ["O que pode correr mal", "O risco que ninguém te avisa a tempo."],
            [
              "O que confirmar a seguir",
              "O passo concreto antes de avançares.",
            ],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg bg-cream/10 p-5">
              <div className="font-display text-lg font-bold text-wheat">
                {t}
              </div>
              <p className="mt-1 text-sm text-cream/75">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mt-24 text-center">
        <h2 className="font-display text-4xl font-black text-soil">
          Tens um projeto ou uma necessidade?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ink/70">
          Vê o que pode fazer sentido antes do próximo aviso fechar. Demora
          poucos minutos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/areas" className="btn-primary">
            Fazer o meu diagnóstico
          </Link>
          <Link href="/apoios" className="btn-ghost">
            Explorar apoios
          </Link>
        </div>
      </section>

      <footer className="mt-24 border-t border-clay/20 pt-8 text-sm text-ink/50">
        <div className="flex flex-wrap justify-between gap-6">
          <div>
            <p className="font-semibold text-soil">
              <span className="text-ink">{BRAND.namePart1}</span>
              <span className="text-wheat">{BRAND.namePart2}</span>
            </p>
            <p className="mt-1 max-w-sm">
              Ferramenta de apoio à decisão — não substitui validação legal/técnica
              dos avisos nem aconselhamento de um consultor acreditado.
            </p>
          </div>
          <nav className="flex flex-col gap-1.5">
            <p className="font-semibold text-soil">Explorar</p>
            <Link href="/apoios" className="hover:text-soil">
              Apoios disponíveis
            </Link>
            <Link href="/areas" className="hover:text-soil">
              Fazer diagnóstico
            </Link>
            <Link href="/perfil" className="hover:text-soil">
              O meu perfil
            </Link>
            <Link href="/notificacoes" className="hover:text-soil">
              Avisar-me de novos apoios
            </Link>
          </nav>
          <nav className="flex flex-col gap-1.5">
            <p className="font-semibold text-soil">Informação</p>
            <Link href="/termos" className="hover:text-soil">
              Termos e dados
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-ink/40">
          © {new Date().getFullYear()} {BRAND.name} · v0.1
        </p>
      </footer>
    </main>
  );
}
