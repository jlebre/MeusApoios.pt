# Setup — Apoio Rural (versão sem login)

Fluxo: responder ao questionário → ver preview grátis → desbloquear → ver
detalhe com checklist de documentos. Sem contas, sem uploads. Simples.

## Ordem de execução no Supabase (SQL Editor)

1. `supabase/schema.sql`      (tabelas base)
2. `supabase/schema_v2.sql`   (regras, montantes, documentos, conversa, eventos, colunas extra)
3. `supabase/seed.sql`        (6 fundos reais)
4. `supabase/seed_v2.sql`     (regras de elegibilidade + montantes + documentos + PDFs)

## Variáveis de ambiente

```bash
cp .env.local.example .env.local
```
Preenche:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD` (password do backoffice)

## Correr

```bash
npm install
npm run dev
```

- Site: http://localhost:3000
- Backoffice: http://localhost:3000/admin (user qualquer, password = ADMIN_PASSWORD)

## Deploy (Vercel)

Importa o repositório → mete as mesmas env vars → deploy. Uma tarde.

## O que foi removido (e porquê)

Tirámos login, contas e upload de documentos. Razão: para os primeiros testes
com agricultores, login é fricção e ninguém vai carregar documentos para um site
que acabou de conhecer. A checklist de documentos continua a aparecer (como
lista, depois de desbloquear) — só não há upload. Quando houver utilizadores que
voltam, o login volta a fazer sentido.

## Funil de validação

O backoffice mostra três números no topo: quantos iniciaram o diagnóstico,
quantos o concluíram, e quantos clicaram em desbloquear. É a métrica que importa:
se as pessoas clicam em desbloquear, há intenção de compra. Os eventos ficam na
tabela `events`.

## Paywall

O desbloqueio (`/api/unlock`) está imediato em fase de testes, com o preço (19 €)
visível. Quando quiseres cobrar, liga o Stripe: o webhook chama `/api/unlock`
após pagamento, e o resto não muda.

## Próximos passos (não código)

1. Valida as regras de UM fundo contra o aviso oficial até ficarem perfeitas.
2. Põe online.
3. Mostra a 5 agricultores reais.
4. Vê o funil.

---

## Atualização v3 — Domínios, perfil partilhado, termos e assistente IA

### Ordem dos SQL (atualizada)
1. `supabase/schema.sql`
2. `supabase/schema_v2.sql`
3. `supabase/schema_v3.sql`   (domínios, perfil partilhado, perguntas, "como obter")
4. `supabase/seed.sql`
5. `supabase/seed_v2.sql`
6. `supabase/seed_v3.sql`     (guias de "como obter" os documentos)

### Múltiplos domínios
A base agora suporta vários domínios (agricultura, habitação, social, energia,
empresas). Só "agricultura" está ativa e preenchida; as outras existem na tabela
`domains` com `active=false`. Para abrir um domínio novo: ativa-o, cria os fundos
com `domain_id` desse domínio, e as respetivas regras/montantes/documentos.
O motor de elegibilidade é o mesmo — não muda nada no código.

### Perfil partilhado
`shared_profiles` guarda os dados transversais da pessoa (idade, rendimento,
agregado, localização) identificados por um token. A ideia é preencher uma vez e
reutilizar em vários domínios. (A ligação à UI do questionário fica preparada na
base; podes evoluí-la quando abrires o 2.º domínio.)

### Documentos: passo guiado
Cada documento pode ter "como obter" + link oficial. Em vez de irmos buscar dados
oficiais (proibido/inseguro), guiamos a pessoa a obtê-los ela própria.

### Termos e dados
Página `/termos`: ferramenta de apoio à decisão, sem garantias, sem segurança
assegurada, uso por conta e risco. O questionário exige aceitar antes de
submeter.

### Assistente de IA (premium)
Página `/assistente`: a pessoa descreve a ideia e a IA ajuda — mas ancorada no
motor (não inventa elegibilidades). Só funciona com projeto desbloqueado (402 se
não premium).
- Para ativar a IA a sério: define `ANTHROPIC_API_KEY` no `.env.local`.
- Sem key: usa um fallback baseado só no motor (bom para testar sem custos).

---

## Atualização v4 — Fundos de habitação, energia e empresas

### Ordem dos SQL (atualizada)
1. schema.sql
2. schema_v2.sql
3. schema_v3.sql
4. seed.sql
5. seed_v2.sql
6. seed_v3.sql
7. **seed_v4.sql**  (fundos de habitação, energia e empresas + regras + docs)

### Novos fundos populados (todos NEEDS_REVIEW)
- **Habitação:** IMT Jovem + Garantia Pública (1.ª habitação, até 35 anos).
- **Energia:** Vouchers Painéis Solares (anunciado 2026), Programa E-LAR.
- **Empresas:** Investe Jovem (IEFP), Microcrédito / MicroInvest.

### Como o utilizador escolhe a área
A landing leva agora a `/areas` (seletor de domínio). Só a Agricultura está
totalmente preenchida; habitação/energia/empresas estão preenchidas com fundos
reais mas as outras áreas mostram-se como "em breve" até as ativares (`active`
na tabela `domains`). A página de resultados filtra os fundos pelo domínio
escolhido no diagnóstico.

### IMPORTANTE — o questionário ainda é agrícola
O questionário recolhe sobretudo campos agrícolas. Os fundos de habitação/
energia/empresa têm regras que usam campos novos (idade, 1.ª habitação, preço do
imóvel, empresa constituída). Enquanto o questionário não recolher esses campos,
esses fundos aparecem como "falta confirmar" — o que é honesto e correto. O
próximo passo para os tornar 100% funcionais é adicionar as perguntas
específicas de cada domínio ao questionário (a base já tem a tabela `questions`
preparada para isso).

---

## Atualização v5 — Questionário dinâmico por área (guiado por dados)

### Ordem dos SQL (atualizada)
1. schema.sql
2. schema_v2.sql
3. schema_v3.sql
4. schema_v4.sql   (melhorias à tabela questions: secção, obrigatória, also_writes)
5. seed.sql
6. seed_v2.sql
7. seed_v3.sql
8. seed_v4.sql
9. seed_v5.sql     (PERGUNTAS de todos os domínios)

### Como funciona agora
O questionário deixou de estar fixo no código. As perguntas vivem na tabela
`questions` e o formulário monta-se sozinho a partir delas:
- Perguntas transversais (`shared=true`): idade, localização, situação fiscal —
  perguntam-se em qualquer área.
- Perguntas específicas: cada domínio tem as suas.
- Agrupadas por `section` (cada secção = um passo do questionário).
- `also_writes`: a idade grava em `promoter_age` E `birth_year_age`, para as
  regras dos vários domínios funcionarem sem duplicar a pergunta.

### Adicionar perguntas a uma área nova = SEM código
Basta inserir linhas na tabela `questions` com o `domain_id` certo. O
questionário e o motor passam a usá-las automaticamente.

### Perguntas por área (nesta versão)
- Transversais: 7 (sobre ti, localização, situação fiscal)
- Agricultura: 13 · Habitação: 4 · Energia: 4 · Empresas: 4

Agora as quatro áreas têm questionário próprio e funcional. Para afinar: revê as
perguntas na tabela `questions` e as regras em `eligibility_rules`.

---

## Atualização v6/v7 — Questionários melhorados + regras afinadas

### Ordem FINAL dos SQL
1. schema.sql
2. schema_v2.sql
3. schema_v3.sql
4. schema_v4.sql
5. schema_v5.sql   (rendimento, agregado, certificado energético, etc.)
6. seed.sql
7. seed_v2.sql
8. seed_v3.sql
9. seed_v4.sql
10. seed_v6.sql    (PERGUNTAS melhoradas — substitui o seed_v5; não corras o v5)
11. seed_v7.sql    (regras de elegibilidade afinadas com números reais)

NOTA: o seed_v6 substitui o seed_v5 (faz `delete from questions` e repõe).
Não precisas de correr o seed_v5.

### O que melhorou
- **Questionários mais ricos**: rendimento anual, situação profissional, nº de
  titulares (habitação), certificado energético (energia), inscrição IEFP
  (empresas), e mais contexto em cada área.
- **Regras afinadas com números reais** (verificados em jun 2026):
  - Habitação: rendimento até 86.634€/ano (8.º escalão IRS), imóvel até
    450.000€, não ser proprietário, nunca ter usado a Garantia do Estado.
  - Empresas: inscrição no IEFP.
- Testado: jovem elegível → "elegível"; rendimento 95k → "não elegível";
  imóvel 500k → "com ressalvas"; já proprietário → "não elegível". Tudo correto.

Continua tudo NEEDS_REVIEW: confirma sempre no aviso oficial antes de usar a
sério. Os limites de IRS e IMT mudam com o Orçamento do Estado.

---

## Atualização v8 — Conta opcional + perfil partilhado

### SQL adicional
Corre `supabase/schema_v6.sql` (depois do schema_v5.sql). Liga o perfil ao
utilizador autenticado e ativa RLS para proteger dados sensíveis.

### Configurar autenticação (email + password)
No painel Supabase → Authentication → Providers → Email:
- Ativa "Email".
- Para testes rápidos, podes DESLIGAR "Confirm email" (Authentication →
  Settings) para a conta funcionar logo sem confirmação por email.

### Os três estados (como funciona)
1. **Anónimo**: faz o questionário e vê resultados. O projeto é guardado (para
   mostrar os resultados) mas sem dono — não fica perfil reutilizável.
2. **Com conta**: ao fazer o diagnóstico logado, as perguntas transversais
   (nome, idade, localização, rendimento, situação fiscal) vêm pré-preenchidas
   do perfil, e o perfil é atualizado com o que responder. O projeto fica
   associado à conta.
3. **Perfil** (`/perfil`): vê e edita os dados transversais; lista o histórico
   de diagnósticos por área. Cada diagnóstico abre nos seus resultados.

### Privacidade
RLS garante que cada utilizador só acede ao seu perfil e aos seus projetos. Os
dados sensíveis (rendimento, situação fiscal) ficam protegidos. Diagnósticos
anónimos são geridos pelo servidor (service role).

### Transversais vs específicas
As perguntas com `shared=true` na tabela `questions` são as transversais
(perfil). As outras são específicas do domínio (projeto). É esta marca que
define o que se preenche uma vez e o que se pergunta sempre.

---

## Atualização v9 — PDF do relatório + Stripe

### PDF do relatório
Página `/resultado/[id]/pdf` (só desbloqueado). Botão "Guardar como PDF /
Imprimir" usa o diálogo do browser → guardar como PDF. Formato limpo, com
cabeçalho, apoios, condições, documentos e rodapé legal. Link na página de
resultados desbloqueada.

### Stripe (pagamento real)
Estrutura completa:
- `/api/checkout` cria a sessão de pagamento (19 €).
- `/api/stripe-webhook` desbloqueia o projeto após pagamento confirmado.
- `/resultado/[id]/sucesso` página pós-pagamento (também desbloqueia como
  fallback).

Para ativar:
1. Cria conta Stripe, copia a Secret Key.
2. No `.env.local`: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_BASE_URL`.
3. Configura o webhook no painel Stripe (Developers > Webhooks) a apontar para
   `https://o-teu-dominio/api/stripe-webhook`, evento
   `checkout.session.completed`, e mete `STRIPE_WEBHOOK_SECRET`.

Sem chaves Stripe, o botão de desbloqueio cai no modo de teste (desbloqueio
direto). Com chaves, leva ao checkout real.

---

## Atualização v10 — Mapa com validação de zona + Notificações

### SQL adicional
- `supabase/schema_v7.sql` (zonas, coordenadas, subscrições, fila de notificação)
- `supabase/seed_v8.sql` (zonas dos fundos: Alentejo 2030 = NUTS II Alentejo; PEPAC = nacional)

### Mapa + validação de zona
- No questionário, secção "Localização", há um mapa (Leaflet + OpenStreetMap,
  sem API key) para marcar a localização — guarda latitude/longitude.
- A validação de elegibilidade geográfica é por DISTRITO (que é como as regras
  funcionam). Se a localização está fora da zona de um fundo, o veredito passa a
  "não elegível" e mostra-se o aviso.
- Para precisão ao metro (polígonos reais), carrega a CAOP (Carta Administrativa
  Oficial de Portugal) — a estrutura `funding_zones` está pronta para isso.

### Notificações (base construída — falta ligar o envio de email)
- `/notificacoes`: a pessoa subscreve (email + área + distrito).
- `/api/notificacoes/gerar`: gera a fila de mensagens para um fundo que abriu
  (chamar quando marcas um fundo como "aberto", ou por cron).
- Tabela `notification_queue`: mensagens 'pendente'. **A parte que falta ligar
  (tua):** ler esta fila e enviar os emails com um serviço (Resend, SendGrid…),
  marcando 'enviado'. A deteção automática de avisos novos nos sites oficiais
  também fica para ti — esta base assume que tu (ou um cron) acionas o envio.

---

## Atualização v11 — Otimização para telemóvel (Android e iOS)

Melhorias para a app funcionar bem no telemóvel:

- **Teclados certos**: campos numéricos abrem teclado numérico (`inputMode`),
  email abre teclado de email, telefone abre teclado de telefone. Menos erros,
  menos fricção.
- **Inputs a 16px**: evita o zoom automático irritante do iOS ao tocar num campo.
- **Mapa Leaflet otimizado**: já não rouba o scroll da página (zoom por scroll só
  depois de tocar no mapa); mais alto em mobile para tocar com facilidade.
- **Alvos de toque ≥48px** nos botões; sem realce cinzento ao tocar.
- **Títulos responsivos**: grandes no computador, ajustados no telemóvel (não
  estouram o ecrã).
- **Sem overflow horizontal**: nada rebenta a largura do ecrã.
- **Autocomplete**: email/password/nome preenchem com as sugestões do telemóvel.
- **PWA**: manifesto + ícone permitem "Adicionar ao ecrã principal" no Android e
  iOS, com aparência de app (cor da marca, nome, ecrã cheio).

Tudo testado com user-agent de iPhone. Para testares tu: abre no telemóvel (ou
DevTools > modo dispositivo) e confirma o questionário, o mapa e o login.

---

## Atualização v12 — Ingestão por IA + apoios sociais

### SQL adicional (por esta ordem)
- `schema_v8.sql` (estado de publicação + log de ingestão)
- `seed_v9.sql` (3 apoios sociais + perguntas do domínio social)

### Como funciona a manutenção dos dados no FUTURO
O modelo escolhido: **IA assistida com revisão humana**. Não há scraping
automático (frágil e arriscado para dados sobre dinheiro). O fluxo é:

1. No backoffice → "+ Aviso por IA" (`/admin/ingestao`).
2. Colas o texto de um aviso oficial e escolhes a área.
3. A IA lê e cria um fundo completo (campos, regras, montantes, documentos)
   em estado **RASCUNHO** — invisível aos utilizadores.
4. Vais a "Gerir fundos", revês os valores (a IA pode enganar-se) e carregas
   em **Publicar**. Só aí fica visível.

Isto transforma ~1h de preenchimento manual por fundo em ~10min de revisão,
sem perder o controlo da qualidade. Precisa de `ANTHROPIC_API_KEY`.

Salvaguarda: tudo o que a IA gera fica `publish_status='rascunho'` e
`ai_generated=true` até publicares. A página de resultados NUNCA mostra
rascunhos aos utilizadores.

### Evolução futura (quando fizer sentido)
- Crontab só para DETETAR mudanças (avisar-te "este aviso parece ter
  fechado"), nunca para escrever dados sem supervisão.
- A deteção automática de avisos novos nos sites oficiais continua a ser o
  passo mais difícil e fica para quando o volume justificar.

### Apoios sociais adicionados
Domínio "social" agora ativo, com 3 apoios: Garantia para a Infância, Prestação
Social para a Inclusão (PSI), Creche Feliz. Todos NEEDS_REVIEW.

---

## Atualização v13 — Mais domínios e fundos (para revisão)

### SQL adicional
- `seed_v10.sql` (domínios Formação e Saúde/Cuidadores + 3 fundos + perguntas)

### Inventário completo de domínios e fundos (TODOS NEEDS_REVIEW)

**🌾 Agricultura** (ativo)
- Prémio Instalação Jovens Agricultores (C.2.2.1)
- Investimento Produtivo Jovens Agricultores (C.2.2.2)
- Investimento Produtivo Agrícola — Modernização (C.2.1.1)
- Transformação e Comercialização de Produtos Agrícolas

**🏠 Habitação** (ativo)
- IMT Jovem + Garantia Pública (1.ª habitação)

**⚡ Energia** (ativo)
- Vouchers Painéis Solares Autoconsumo
- Programa E-LAR

**🏢 Empresas** (ativo)
- Investe Jovem (IEFP)
- Microcrédito / MicroInvest

**🤝 Social** (ativo)
- Garantia para a Infância
- Prestação Social para a Inclusão (PSI)
- Creche Feliz

**🎓 Formação e Emprego** (ativo) — NOVO
- Cheque-Formação + Digital (até 750€)
- Cheque-Formação (até ~175€)

**❤️ Saúde e Cuidadores** (ativo) — NOVO
- Subsídio de Apoio ao Cuidador Informal (até 590,84€/mês)

**Alentejo 2030** (incluído no domínio empresas/territorial)
- Sistema de Incentivos de Base Territorial — Alentejo

### O que rever (a tua tarefa)
Para cada fundo: confirmar valores, prazos, condições e regras de elegibilidade
contra o aviso/portal oficial. Usa o backoffice (Gerir fundos) para editar.
Os campos `notes_internal` indicam a fonte e a data da pesquisa.

---

## Atualização v14 — Rebranding: "MeusApoios"

O projeto passou de "Apoio Rural" para **MeusApoios** — porque já não é só
agricultura. Cobre habitação, energia, empresas, formação, social e saúde.

### O que mudou
- **Nome**: MeusApoios (logo: "Meus" + "Apoios"). Centralizado em
  `src/lib/brand.ts` — muda lá e muda em todo o lado no futuro.
- **Paleta**: fresca e moderna — azul vivo (#0a6cff) + verde-menta (#10b981),
  fundo azulado claro (#f5f9fc), texto azul-petróleo (#0f1f2e).
  Os nomes de cor antigos (soil, clay, wheat…) ficaram como ALIASES das novas,
  por isso todas as classes existentes passaram a usar a nova paleta sem
  reescrever cada ficheiro.
- **Botões**: azul vivo, cantos mais suaves.
- **Textos**: hero e secções reescritos para multi-área (já não falam só de
  "terra"/"rural").
- **PWA**: manifesto, ícone (M verde em fundo azul) e theme-color atualizados.

### Para mudar o nome outra vez (futuro)
Edita `src/lib/brand.ts`. Para o logótipo de duas cores nas páginas, procura
`Meus<span...>Apoios</span>`. Para as cores, edita `tailwind.config.ts` (mantém
os aliases para não partir nada).

---

## Atualização v15 — Zona de revisão + domínios Cultura e Inovação

### SQL adicional (por ordem)
- `schema_v9.sql` (campos de revisão + links de plataforma)
- `seed_v11.sql` (domínios Cultura e Inovação + 5 fundos + perguntas)

### ZONA DE REVISÃO FÁCIL (a peça que pediste)
Novo no backoffice: **/admin/revisao** ("✓ Rever fundos").
Para cada fundo por confirmar mostra: os dados-chave, as condições escondidas,
e botões para abrir o **aviso oficial**, a **plataforma de candidatura** e a
**página informativa**. Revês e marcas com um clique:
- **✓ Confirmado** — fica verificado, com data.
- **⚠ Precisa de correção** — assinalado para corrigires.
Podes deixar notas em cada um. Os confirmados ficam separados numa lista.

Assim, rever 16+ fundos passa a ser uma tarefa rápida e organizada, em vez de
caçar informação espalhada.

### Links e plataformas oficiais (incluídos nos fundos novos)
- Balcão dos Fundos (Portugal 2030): balcaofundosue.pt
- IAPMEI: iapmei.pt
- DGARTES / Balcão Artes: apoios.dgartes.gov.pt
- ANI / SIFIDE: sifide.ani.pt
- Portugal 2030: portugal2030.pt

### Domínios novos
- **🎭 Cultura e Artes**: DGARTES Apoio a Projetos, Bolsas Jovens Criadores.
- **💡 Inovação e Digitalização**: Vale Digitalização, SIFIDE II, Inovação
  Produtiva (Portugal 2030).

### Inventário atual: 9 domínios, 21 fundos (todos por rever)
Agricultura(4) · Habitação(1) · Energia(2) · Empresas(2) · Social(3) ·
Formação(2) · Saúde(1) · Cultura(2) · Inovação(3) + Alentejo 2030.

---

## Atualização v16 — Domínio Startups e Empreendedorismo

### SQL adicional
- `seed_v12.sql` (domínio Startups + 4 apoios + perguntas)

### Porquê um domínio próprio (e não dentro de "empresas")
O ecossistema de startups em Portugal tem instrumentos e lógica próprios
(fase de ideia, incubação, financiamento de ignição, investidores) que são
diferentes de "criar uma microempresa" ou "modernizar uma PME". Por isso é um
domínio separado, com perguntas próprias (fase: ideia / protótipo / clientes /
escalar).

### Apoios a startups (todos por rever, com plataformas oficiais)
- **StartUP Voucher (IAPMEI)** — fase de ideia, regiões Norte/Centro/Alentejo.
- **Vale Incubação** — empresas < 1 ano, via incubadora certificada.
- **ADN Startup (Banco de Fomento)** — crédito facilitado a microempresas
  iniciais (NÃO é fundo perdido).
- **Startup Visa** — via de residência para empreendedores estrangeiros (não é
  apoio financeiro).

Plataformas: iapmei.pt, bpfomento.pt, startupportugal.com, startupvisa.startupportugal.com

### Inventário atual: 10 domínios, 25 fundos (todos por rever)
Agricultura(4) · Habitação(1) · Energia(2) · Empresas(2) · Social(3) ·
Formação(2) · Saúde(1) · Cultura(2) · Inovação(3) · Startups(4) + Alentejo 2030.
