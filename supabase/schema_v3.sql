-- ============================================================
-- Apoio Rural — Schema v3: MÚLTIPLOS DOMÍNIOS + PERFIL PARTILHADO
-- Corre DEPOIS de schema.sql e schema_v2.sql.
-- ============================================================
-- Ideia: a pessoa preenche o PERFIL uma vez (idade, localização,
-- rendimento, agregado…) e esse perfil é reutilizado em vários
-- DOMÍNIOS (agricultura, habitação, social, empresas…).
-- Cada apoio pertence a um domínio. O motor de elegibilidade
-- continua igual — só passa a saber a que domínio pertence.
-- Sem login: o perfil é identificado por um token guardado no browser.
-- ============================================================

-- ------------------------------------------------------------
-- DOMÍNIOS (áreas de apoio)
-- ------------------------------------------------------------
create table if not exists domains (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,      -- 'agricultura', 'habitacao'…
  label       text not null,             -- 'Agricultura', 'Primeira habitação'
  description text,
  icon        text,                      -- emoji ou nome de ícone
  active      boolean default true,      -- mostrar ao utilizador?
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- Cada apoio pertence a um domínio
alter table funding_opportunities add column if not exists domain_id uuid references domains(id) on delete set null;

-- ------------------------------------------------------------
-- PERFIL PARTILHADO (dados da pessoa, reutilizáveis entre domínios)
-- ------------------------------------------------------------
-- Identificado por um token (uuid) guardado no browser do utilizador.
-- Sem login: quem tiver o token, acede ao seu perfil.
create table if not exists shared_profiles (
  id            uuid primary key default gen_random_uuid(),
  token         uuid unique not null default gen_random_uuid(),
  -- Identificação / contacto
  full_name     text,
  email         text,
  phone         text,
  -- Dados transversais (servem vários domínios)
  birth_year    int,
  household_size int,                     -- pessoas no agregado
  annual_income_eur numeric,             -- rendimento anual do agregado
  location_district text,
  location_municipality text,
  employment_status text,                -- empregado | desempregado | independente | estudante
  -- Dados específicos guardados de forma flexível por domínio
  extra         jsonb default '{}'::jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists idx_shared_profiles_token on shared_profiles(token);

-- Ligar projetos ao perfil partilhado e ao domínio
alter table projects add column if not exists shared_profile_id uuid references shared_profiles(id) on delete set null;
alter table projects add column if not exists domain_id uuid references domains(id) on delete set null;

-- ------------------------------------------------------------
-- PERGUNTAS (definidas por domínio, algumas partilhadas)
-- ------------------------------------------------------------
-- Permite montar o questionário a partir da base de dados, em vez de
-- estar fixo no código. 'shared'=true → pergunta transversal (preenche
-- uma vez, vale para todos os domínios).
create table if not exists questions (
  id          uuid primary key default gen_random_uuid(),
  domain_id   uuid references domains(id) on delete cascade,  -- null = pergunta global
  field       text not null,             -- nome do campo (ex.: 'birth_year')
  label       text not null,             -- texto da pergunta
  hint        text,                      -- ajuda
  input_type  text not null default 'text', -- text | number | yesno | select | textarea
  options     jsonb,                     -- para select: ["a","b"]
  shared      boolean default false,     -- transversal a domínios?
  sort_order  int default 0,
  created_at  timestamptz default now()
);
create index if not exists idx_questions_domain on questions(domain_id);

-- ------------------------------------------------------------
-- DOCUMENTOS: como obter (passo guiado)
-- ------------------------------------------------------------
-- Acrescenta à checklist existente o "onde/como obter".
alter table funding_documents_required add column if not exists how_to_get text;
alter table funding_documents_required add column if not exists official_url text;

-- ------------------------------------------------------------
-- RLS leitura pública do catálogo novo
-- ------------------------------------------------------------
alter table domains enable row level security;
alter table questions enable row level security;
create policy "domains_read" on domains for select using (true);
create policy "questions_read" on questions for select using (true);

-- shared_profiles: sem login, o acesso é por token via service role no
-- servidor. Mantemos RLS ligado e SEM policy pública (só service role lê).
alter table shared_profiles enable row level security;

-- ------------------------------------------------------------
-- SEED de domínios
-- ------------------------------------------------------------
insert into domains (slug, label, description, icon, active, sort_order) values
  ('agricultura', 'Agricultura', 'Apoios à atividade agrícola, instalação de jovens agricultores, modernização e transformação.', '🌾', true, 0),
  ('habitacao', 'Habitação', 'Apoios à compra, arrendamento e reabilitação da primeira habitação.', '🏠', false, 1),
  ('social', 'Apoios sociais', 'Prestações e apoios sociais (família, desemprego, inclusão).', '🤝', false, 2),
  ('energia', 'Energia', 'Apoios a autoconsumo, eficiência energética e renováveis.', '⚡', false, 3),
  ('empresas', 'Empresas', 'Incentivos ao empreendedorismo e investimento empresarial.', '🏢', false, 4)
on conflict (slug) do nothing;

-- Ligar os fundos agrícolas existentes ao domínio agricultura
update funding_opportunities
set domain_id = (select id from domains where slug = 'agricultura')
where domain_id is null;

-- ------------------------------------------------------------
-- Campos extra de projetos para os novos domínios
-- (habitação, energia, empresas). Opcionais.
-- ------------------------------------------------------------
alter table projects add column if not exists birth_year_age int;       -- idade (anos)
alter table projects add column if not exists first_home boolean;       -- 1.ª habitação?
alter table projects add column if not exists property_price_eur numeric; -- preço do imóvel
alter table projects add column if not exists owns_home boolean;        -- tem habitação própria?
alter table projects add column if not exists company_exists boolean;   -- empresa já constituída?
