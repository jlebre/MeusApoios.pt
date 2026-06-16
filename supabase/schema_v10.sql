-- ============================================================
-- Schema v10 — Dossier de candidatura (estado dos documentos)
-- Corre DEPOIS de schema_v9.sql.
-- ============================================================
-- Guarda o estado de cada documento por projeto+fundo, para a pessoa
-- acompanhar a preparação da candidatura.
-- status: 'falta' | 'tenho' | 'submetido'
create table if not exists application_documents (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  funding_id   uuid references funding_opportunities(id) on delete set null,
  doc_name     text not null,
  status       text default 'falta',
  updated_at   timestamptz default now(),
  created_at   timestamptz default now()
);
create index if not exists idx_appdocs_project on application_documents(project_id);

-- leitura/escrita gerida pelo servidor (service role); sem RLS pública.
alter table application_documents enable row level security;
