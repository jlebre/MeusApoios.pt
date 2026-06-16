import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `Termos e Tratamento de Dados — ${BRAND.name}`,
};

export default function Termos() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/"
        className="font-display text-xl font-black tracking-tight text-soil"
      >
        <BrandLogo />
      </Link>

      <h1 className="mt-8 font-display text-3xl font-black text-soil">
        Termos de utilização e tratamento de dados
      </h1>
      <p className="mt-2 text-sm text-ink/50">
        Última atualização: {new Date().toLocaleDateString("pt-PT")}
      </p>

      <div className="mt-8 space-y-6 text-ink/80">
        <Section title={`O que é o ${BRAND.name}`}>
          <p>
            O {BRAND.name} é uma <strong>ferramenta de apoio à decisão</strong>.
            Ajuda-te a perceber que apoios podem fazer sentido para o teu caso,
            com base nas respostas que dás. Não é um serviço oficial, não está
            associado a nenhuma entidade pública, e não substitui o aviso
            oficial de cada apoio nem o aconselhamento de um técnico ou consultor
            acreditado.
          </p>
        </Section>

        <Section title="Sem garantias">
          <p>
            A informação é fornecida <strong>tal como está</strong>, sem garantia
            de exatidão, atualidade ou adequação. Os valores, prazos e condições
            mostrados são estimativas e podem estar desatualizados ou incorretos.
            <strong> Confirma sempre no aviso oficial</strong> antes de tomar
            qualquer decisão ou fazer qualquer despesa.
          </p>
        </Section>

        <Section title="Uso por tua conta e risco">
          <p>
            Usas esta ferramenta <strong>por tua própria conta e risco</strong>.
            Não nos responsabilizamos por quaisquer decisões, despesas, perdas ou
            danos resultantes do uso da ferramenta ou da confiança na informação
            apresentada — incluindo candidaturas indeferidas, despesas não
            elegíveis ou prazos perdidos.
          </p>
        </Section>

        <Section title="Segurança e dados">
          <p>
            Esta é uma ferramenta em fase inicial.{" "}
            <strong>Não garantimos a segurança dos dados</strong> que aqui
            introduzes. Não introduzas informação sensível que não estejas
            disposto a partilhar. Não pedimos nem acedemos aos teus dados
            oficiais (Finanças, Segurança Social): quando um apoio exige um
            documento, indicamos-te como o obténs tu próprio, no portal oficial.
          </p>
          <p className="mt-2">
            Guardamos as respostas que dás para te mostrar os resultados e para
            melhorar a ferramenta. Se quiseres que apaguemos os teus dados,
            contacta-nos.
          </p>
        </Section>

        <Section title="Sem aconselhamento profissional">
          <p>
            Nada aqui constitui aconselhamento jurídico, financeiro, fiscal ou
            técnico. Para decisões importantes, fala com um profissional
            qualificado.
          </p>
        </Section>
      </div>

      <div className="mt-10">
        <Link href="/" className="btn-ghost">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-bold text-soil">{title}</h2>
      <div className="mt-2 leading-relaxed">{children}</div>
    </section>
  );
}
