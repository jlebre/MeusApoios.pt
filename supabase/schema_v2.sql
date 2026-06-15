-- ============================================================
-- Apoio Rural — Schema v2 (adições) — VERSÃO SEM LOGIN
-- Corre DEPOIS de schema.sql.
-- Adiciona: regras de elegibilidade, montantes simuláveis,
-- documentos exigidos por fundo, pedidos de conversa, e as
-- colunas extra de projetos (questionário aprofundado + paywall).
-- ============================================================
-- NOTA: esta versão NÃO tem login, contas nem uploads de documentos.
-- O fluxo é: responder -> ver preview -> desbloquear -> ver detalhe.
-- Tudo o que é privado/admin passa pelo backoffice (service role).
-- ============================================================

-- ------------------------------------------------------------
-- REGRAS DE ELEGIBILIDADE
-- ------------------------------------------------------------
-- Cada regra liga UM campo do projeto a UMA condição verificável.
-- O motor (src/lib/eligibility.ts) avalia: elegível | em_risco |
-- inelegivel | confirmar.
--
-- operator: eq | neq | gte | lte | between | is_true | is_false | in
-- severity: 'eliminatoria' (falha = inelegível) | 'aviso' (falha = em risco)
create table if not exists eligibility_rules (
  id            uuid primary key default gen_random_uuid(),
  funding_id    uuid not null references funding_opportunities(id) on delete cascade,
  label         text not null,
  field         text not null,
  operator      text not null,
  value         text,
  value2        text,
  severity      text not null default 'eliminatoria',
  explain_pass  text,
  explain_fail  text,
  sort_order    int default 0,
  created_at    timestamptz default now()
);
create index if not exists idx_elig_funding on eligibility_rules(funding_id);

-- ------------------------------------------------------------
-- MONTANTES PARA SIMULAÇÃO
-- ------------------------------------------------------------
-- kind: 'fixo' (prémio fixo) | 'percentagem' (taxa sobre investimento)
create table if not exists funding_amounts (
  id            uuid primary key default gen_random_uuid(),
  funding_id    uuid not null references funding_opportunities(id) on delete cascade,
  label         text not null,
  kind          text not null,
  rate          numeric,
  fixed_amount  numeric,
  cap           numeric,
  base_field    text default 'budget_eur',
  notes         text,
  created_at    timestamptz default now()
);
create index if not exists idx_amounts_funding on funding_amounts(funding_id);

-- ------------------------------------------------------------
-- DOCUMENTOS EXIGIDOS POR FUNDO (checklist mostrada ao utilizador)
-- ------------------------------------------------------------
create table if not exists funding_documents_required (
  id            uuid primary key default gen_random_uuid(),
  funding_id    uuid not null references funding_opportunities(id) on delete cascade,
  name          text not null,
  hint          text,
  mandatory     boolean default true,
  sort_order    int default 0
);
create index if not exists idx_docsreq_funding on funding_documents_required(funding_id);

-- ------------------------------------------------------------
-- PEDIDOS DE CONVERSA (marcar contacto para mais informação)
-- ------------------------------------------------------------
create table if not exists conversation_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  email         text,
  phone         text,
  preferred_time text,
  topic         text,
  project_id    uuid references projects(id) on delete set null,
  status        text default 'novo',
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- COLUNAS EXTRA EM PROJECTS
-- ------------------------------------------------------------
-- Campos do fundo (PDF + prazo)
alter table funding_opportunities add column if not exists pdf_url text;
alter table funding_opportunities add column if not exists closes_at date;

-- Questionário aprofundado
alter table projects add column if not exists received_aid_before boolean;
alter table projects add column if not exists production_mode text;
alter table projects add column if not exists investment_type text;
alter table projects add column if not exists tax_situation_ok boolean;

-- Paywall: o projeto desbloqueia o detalhe dos fundos
alter table projects add column if not exists unlocked boolean default false;
alter table projects add column if not exists unlocked_at timestamptz;

-- ------------------------------------------------------------
-- RLS para leitura pública do catálogo (o motor corre no servidor
-- com service role, mas deixamos leitura aberta por segurança).
-- As tabelas de catálogo não têm dados sensíveis.
-- ------------------------------------------------------------
alter table eligibility_rules enable row level security;
alter table funding_amounts enable row level security;
alter table funding_documents_required enable row level security;
create policy "elig_read" on eligibility_rules for select using (true);
create policy "amounts_read" on funding_amounts for select using (true);
create policy "docsreq_read" on funding_documents_required for select using (true);

-- ------------------------------------------------------------
-- EVENTOS (funil de validação) — quantos chegam e o que fazem
-- ------------------------------------------------------------
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,        -- ex.: 'diagnostico_iniciado', 'diagnostico_concluido', 'unlock_clicado'
  project_id  uuid references projects(id) on delete set null,
  meta        jsonb,
  created_at  timestamptz default now()
);
create index if not exists idx_events_name on events(name);
