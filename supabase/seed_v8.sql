-- ============================================================
-- Seed v8 — Zonas elegíveis por fundo
-- Corre DEPOIS de schema_v7.sql.
-- ============================================================

-- Alentejo 2030: só NUTS II Alentejo (distritos aproximados)
insert into funding_zones (funding_id, zone_type, match_values, label)
select id, 'distrito',
  '["Évora","Beja","Portalegre","Setúbal","Santarém"]'::jsonb,
  'NUTS II Alentejo (Setúbal e Santarém apenas em parte — confirmar concelho)'
from funding_opportunities
where name = 'Sistema de Incentivos de Base Territorial — Alentejo (ALT2030-2026-16)';

-- PEPAC (nacionais — Portugal Continental). Marcamos como nacional.
insert into funding_zones (funding_id, zone_type, match_values, label)
select id, 'nacional', '["Continente"]'::jsonb, 'Portugal Continental'
from funding_opportunities
where program like 'PEPAC%';
