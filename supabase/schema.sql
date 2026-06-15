-- ============================================================
-- Apoio Rural — Schema MVP (matching manual por tags)
-- Foco inicial: Jovem Agricultor + PEPAC
-- ============================================================
-- Filosofia: as tags SUGEREM cruzamentos; o admin (tu) DECIDE.
-- Nada é automático. A IA fica para uma fase posterior.
-- ============================================================

-- Extensão para UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- TAGS: vocabulário controlado para cruzar projetos <-> fundos
-- ------------------------------------------------------------
-- Categorias de tag (ex.: regiao, tipo_promotor, tipo_despesa, setor)
create table if not exists tag_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,         -- ex.: 'regiao'
  label       text not null,                -- ex.: 'Região'
  created_at  timestamptz default now()
);

create table if not exists tags (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references tag_categories(id) on delete cascade,
  slug         text not null,               -- ex.: 'alentejo'
  label        text not null,               -- ex.: 'Alentejo'
  created_at   timestamptz default now(),
  unique (category_id, slug)
);

-- ------------------------------------------------------------
-- FUNDOS / APOIOS
-- ------------------------------------------------------------
create table if not exists funding_opportunities (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,              -- ex.: 'Jovens Agricultores — PEPAC'
  program       text,                       -- ex.: 'PEPAC 2023-2027'
  entity        text,                       -- ex.: 'IFAP / GPP'
  summary       text,                       -- resumo em linguagem simples
  beneficiaries text,                       -- quem pode candidatar
  eligible_expenses text,                   -- despesas elegíveis
  support_rate  text,                       -- taxa de apoio
  amount_range  text,                       -- montantes
  opens_at      date,                       -- abertura do aviso
  closes_at     date,                       -- fecho do aviso
  status        text default 'previsto',    -- previsto | aberto | fechado
  complexity    text default 'media',       -- baixa | media | alta
  -- A camada que diferencia o produto:
  hidden_conditions text,                   -- condições escondidas
  risks         text,                       -- o que pode correr mal
  incompatibilities text,                   -- não-acumulação
  required_docs text,                       -- documentos obrigatórios
  source_url    text,                       -- link oficial do aviso
  notes_internal text,                      -- notas só para o admin
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Tags de um fundo (M:N)
create table if not exists funding_tags (
  funding_id  uuid references funding_opportunities(id) on delete cascade,
  tag_id      uuid references tags(id) on delete cascade,
  primary key (funding_id, tag_id)
);

-- ------------------------------------------------------------
-- PROJETOS (respostas do formulário)
-- ------------------------------------------------------------
create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  -- Contacto
  contact_name  text,
  contact_email text,
  contact_phone text,
  -- Promotor
  promoter_age  int,
  activity_open boolean,                     -- atividade aberta?
  has_nifap     boolean,                     -- tem NIFAP?
  promoter_type text,                        -- singular | coletiva
  first_install boolean,                     -- primeira instalação?
  -- Propriedade
  location_district text,
  location_municipality text,
  area_ha       numeric,                     -- área em hectares
  has_water     boolean,
  water_notes   text,
  crops         text,                        -- culturas
  animals       text,                        -- animais
  buildings     text,                        -- edifícios
  -- Objetivo
  goal          text,                        -- o que quer fazer
  budget_eur    numeric,                     -- orçamento estimado
  timeline      text,                        -- horizonte temporal
  -- Funil
  status        text default 'novo',         -- novo | em_analise | relatorio_entregue | fechado
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Tags inferidas/atribuídas a um projeto (para sugerir cruzamentos)
create table if not exists project_tags (
  project_id  uuid references projects(id) on delete cascade,
  tag_id      uuid references tags(id) on delete cascade,
  primary key (project_id, tag_id)
);

-- ------------------------------------------------------------
-- MATCHES: o cruzamento que TU validas (manual)
-- ------------------------------------------------------------
create table if not exists matches (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references projects(id) on delete cascade,
  funding_id   uuid references funding_opportunities(id) on delete cascade,
  -- Decisão humana:
  confidence   text default 'media',         -- alta | media | baixa | desconhecida
  why_appears  text,                          -- porque aparece
  what_can_go_wrong text,                      -- o que pode correr mal
  what_to_confirm   text,                      -- o que confirmar a seguir
  admin_decision text default 'sugerido',     -- sugerido | incluir | excluir
  created_at   timestamptz default now(),
  unique (project_id, funding_id)
);

-- ------------------------------------------------------------
-- RELATÓRIOS
-- ------------------------------------------------------------
create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade,
  executive_summary text,
  action_plan_7d  text,
  action_plan_30d text,
  action_plan_90d text,
  honest_recommendation text,                 -- avançar | preparar | esperar | não avançar
  status        text default 'rascunho',      -- rascunho | entregue
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- Índices úteis
-- ------------------------------------------------------------
create index if not exists idx_projects_status on projects(status);
create index if not exists idx_funding_status on funding_opportunities(status);
create index if not exists idx_matches_project on matches(project_id);
create index if not exists idx_funding_tags_tag on funding_tags(tag_id);
create index if not exists idx_project_tags_tag on project_tags(tag_id);

-- ------------------------------------------------------------
-- RLS: por agora desligado nas tabelas internas.
-- O formulário público escreve em 'projects' via service role no
-- server (route handler), por isso não expomos chaves no cliente.
-- Quando adicionares auth ao backoffice, ativa RLS adequado.
-- ------------------------------------------------------------
