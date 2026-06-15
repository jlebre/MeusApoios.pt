-- ============================================================
-- Schema v8 — Ingestão de fundos assistida por IA
-- Corre DEPOIS de schema_v7.sql.
-- ============================================================

-- Estado de publicação: a IA cria fundos como 'rascunho'; só aparecem
-- aos utilizadores depois de 'publicado' (um clique do admin).
alter table funding_opportunities add column if not exists publish_status text default 'publicado';
-- valores: 'rascunho' (só admin vê) | 'publicado' (utilizadores veem)
alter table funding_opportunities add column if not exists ai_generated boolean default false;
alter table funding_opportunities add column if not exists reviewed_by_human boolean default false;
alter table funding_opportunities add column if not exists last_reviewed_at timestamptz;

-- Registo das ingestões (auditoria do que a IA leu e gerou)
create table if not exists ingestion_log (
  id            uuid primary key default gen_random_uuid(),
  source_text   text,                    -- texto do aviso colado
  domain_id     uuid references domains(id) on delete set null,
  funding_id    uuid references funding_opportunities(id) on delete set null,
  status        text default 'processado', -- processado | erro
  created_at    timestamptz default now()
);
