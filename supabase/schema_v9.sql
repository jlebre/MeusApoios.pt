-- ============================================================
-- Schema v9 — Zona de revisão fácil + links de plataformas
-- Corre DEPOIS de schema_v8.sql.
-- ============================================================

-- Links oficiais adicionais (além do source_url do aviso):
alter table funding_opportunities add column if not exists platform_url text;   -- plataforma de candidatura
alter table funding_opportunities add column if not exists info_url text;        -- página informativa oficial
alter table funding_opportunities add column if not exists review_notes text;    -- notas da TUA revisão

-- Estado de revisão mais claro:
-- 'por_rever' (default para dados de pesquisa/IA) | 'confirmado' | 'a_corrigir'
alter table funding_opportunities add column if not exists review_status text default 'por_rever';

-- Marcar os fundos já existentes que vieram de pesquisa como 'por_rever'
update funding_opportunities
set review_status = 'por_rever'
where review_status is null
   or (notes_internal is not null and notes_internal like '%NEEDS_REVIEW%')
   or (notes_internal is not null and notes_internal like '%GERADO POR IA%');
