# Apoio Rural

Plataforma que ajuda promotores rurais a descobrir, perceber e preparar
candidaturas a apoios (PEPAC, programas regionais, energia). Em vez de uma lista
de links, dá uma **leitura honesta**: que apoios servem o teu caso, o que pode
correr mal, e os próximos passos.

**Foco de lançamento:** jovens agricultores + PEPAC.

---

## Como funciona, em tres ideias

1. **Questionario -> perfil.** O utilizador responde a perguntas simples sobre a
   terra, o objetivo e a sua situacao. As perguntas espelham as condicoes reais
   dos apoios.
2. **Motor de elegibilidade (sem IA).** Cada condicao de um apoio e uma regra
   que bate numa resposta. O motor da um veredito por apoio — elegivel, com
   ressalvas, falta confirmar, ou nao elegivel — e explica cada condicao.
3. **Simulacao de valor + preparacao.** Estima quanto se pode receber e, ao
   desbloquear, da a checklist de documentos, prazos e gestao da candidatura.

---

## Fluxo do utilizador

Landing -> Diagnostico (gratis) -> Resultado

No Resultado:
- PREVIEW GRATIS: numero de apoios compativeis + potencial estimado total (EUR)
  + cards esbatidos (teaser).
- Ao Desbloquear (paywall): detalhe completo de cada apoio (nome, condicoes,
  valor, PDF + link oficial) e botao "Preparar candidatura" -> login.
- Candidatura: checklist de documentos, upload, prazo, valor.
- A minha conta: todas as candidaturas.

Em qualquer ponto pode marcar uma conversa para falar com alguem.

## Fluxo do backoffice (admin)

/admin -> Projetos recebidos
  - Detalhe do projeto: dados + estado + matching manual (com condicoes
    escondidas do fundo a frente) -> Relatorio (resumo, plano 7/30/90,
    recomendacao, PDF).
  - /admin/fundos: gerir apoios (condicoes, riscos, PDF, prazos).
  - /admin/conversas: pedidos de contacto.

---

## Modelo de negocio (como esta montado)

- Diagnostico gratis -> mostra contagem + potencial total. Cria desejo.
- Desbloqueio pago (19 EUR) -> revela o detalhe de cada apoio. Em fase de
  testes o desbloqueio e imediato, com o preco ja visivel, para medir intencao
  real de compra antes de integrar pagamento.
- Conversa / acompanhamento -> porta para servico de maior valor.

Quando quiseres cobrar a serio: o desbloqueio (/api/unlock) passa a ser chamado
pelo webhook do Stripe apos pagamento. O resto do fluxo nao muda.

---

## Stack

- Next.js 14 (App Router, server components onde faz sentido)
- Supabase (Postgres + Auth por magic link + Storage privado)
- TypeScript + Tailwind
- Motor de elegibilidade em TypeScript puro, deterministico e testavel.

---

## Arranque rapido

Ver SETUP_v2.md para o passo a passo completo (Supabase, Auth, Storage).

Resumo:
1. Supabase: corre, por esta ordem, schema.sql, schema_v2.sql, seed.sql,
   seed_v2.sql.
2. Ativa Email/Magic Link em Authentication.
3. Cria bucket privado "documentos" em Storage (policies no SETUP_v2.md).
4. cp .env.local.example .env.local e preenche as chaves.
5. npm install && npm run dev.

Backoffice em /admin (Basic Auth: user qualquer, password = ADMIN_PASSWORD).

---

## Limites honestos (ler antes de usar a serio)

- As regras de elegibilidade sao uma primeira aproximacao. O motor esta
  correto; o que precisa de revisao de perito e se cada regra reflete fielmente
  cada aviso. Os valores estao marcados NEEDS_REVIEW.
- Pagamento real ainda nao esta integrado (precisa de Stripe + conta).
- Validacao territorial e aproximada (por distrito); o mapa fica para v3.
- Geracao de relatorio com IA fica para uma versao futura.

O maior risco do negocio nao e tecnico — e saber se as pessoas pagam. Esta
versao existe para testar isso com utilizadores reais.
