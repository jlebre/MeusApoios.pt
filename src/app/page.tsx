import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between">
        <div className="font-display text-2xl font-black tracking-tight text-soil">
          Meus<span className="text-wheat">Apoios</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/perfil"
            className="text-sm font-medium text-soil hover:text-clay"
          >
            Entrar / Perfil
          </Link>
          <Link href="/areas" className="btn-ghost text-sm">
            Fazer diagnóstico
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mt-16 max-w-3xl">
        <p className="mb-4 inline-block rounded-full bg-olive/15 px-3 py-1 text-sm font-semibold text-olive">
          Agricultura · Habitação · Energia · Empresas · Formação · Social
        </p>
        <h1 className="font-display text-4xl font-black leading-tight text-soil sm:text-5xl md:text-6xl">
          Os apoios existem.
          <br />
          <span className="text-clay">Perceber a que tens direito é que é o problema.</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink/80">
          Há condições escondidas, documentos obrigatórios, prazos curtos e
          regras de não-acumulação que fazem muita gente perder candidaturas — ou
          desistir antes de tentar. Respondes a algumas perguntas sobre a tua
          situação e o teu objetivo, e recebes uma leitura clara: que apoios fazem
          sentido, o que pode correr mal, e os próximos passos.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/areas" className="btn-primary">
            Começar diagnóstico gratuito
          </Link>
          <a href="#como" className="btn-ghost">
            Como funciona
          </a>
        </div>
        <p className="mt-3 text-sm text-ink/50">
          Sem compromisso. Recebes uma primeira leitura; o relatório detalhado é
          opcional.
        </p>
      </section>

      {/* Como funciona */}
      <section id="como" className="mt-24 grid gap-6 md:grid-cols-3">
        {[
          {
            n: "01",
            t: "Diz-nos da tua situação",
            d: "A tua idade, localização, rendimento e o teu objetivo. Linguagem simples, sem jargão. Respondes uma vez, vale para todas as áreas.",
          },
          {
            n: "02",
            t: "Cruzamos com os apoios",
            d: "Comparamos o teu perfil com os apoios relevantes — e, mais importante, com as condições que normalmente não se veem.",
          },
          {
            n: "03",
            t: "Recebes um plano claro",
            d: "Apoios prováveis, riscos, documentos em falta e uma recomendação honesta: avançar, preparar ou esperar.",
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
          Qualquer site te diz que um apoio existe. Nós dizemos-te porque pode
          não servir, que confirmação falta, e o que desbloqueia a candidatura.
          Cada recomendação responde sempre a três coisas:
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Porque aparece", "O que no teu perfil sugere este apoio."],
            ["O que pode correr mal", "O risco que ninguém te avisa a tempo."],
            ["O que confirmar a seguir", "O passo concreto antes de avançares."],
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
          Vê o que é possível antes do próximo aviso fechar. Demora poucos
          minutos.
        </p>
        <Link href="/areas" className="btn-primary mt-6">
          Fazer o meu diagnóstico
        </Link>
        <p className="mt-4 text-ink/60">
          Preferes falar primeiro?{" "}
          <Link href="/conversa" className="font-semibold text-clay underline">
            Marca uma conversa
          </Link>
        </p>
      </section>

      <footer className="mt-24 border-t border-clay/20 pt-8 text-sm text-ink/50">
        <p>
          MeusApoios é uma ferramenta de apoio à decisão. Não substitui
          validação legal/técnica dos avisos nem aconselhamento de um consultor
          acreditado.
        </p>
        <p className="mt-2">© {new Date().getFullYear()} MeusApoios · v0.1 ·{" "}
          <Link href="/termos" className="text-clay underline">
            Termos e tratamento de dados
          </Link>
          {" · "}
          <Link href="/notificacoes" className="text-clay underline">
            Avisar-me de novos apoios
          </Link>
        </p>
      </footer>
    </main>
  );
}
