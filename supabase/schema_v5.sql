-- ============================================================
-- Schema v5 — Campos adicionais para questionários mais ricos
-- Corre DEPOIS de schema_v4.sql.
-- ============================================================
alter table projects add column if not exists annual_income_eur numeric;   -- rendimento anual coletável
alter table projects add column if not exists household_size int;          -- pessoas no agregado
alter table projects add column if not exists employment_status text;      -- situação profissional
alter table projects add column if not exists has_public_guarantee_before boolean; -- já usou garantia do Estado
alter table projects add column if not exists energy_certificate text;     -- certificado energético (habitação/energia)
alter table projects add column if not exists co_applicants int;           -- nº de titulares (habitação)
