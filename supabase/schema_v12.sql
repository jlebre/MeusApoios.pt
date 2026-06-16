-- ============================================================
-- Schema v12 — Data de nascimento
-- Corre DEPOIS de schema_v11.sql.
-- ============================================================
-- Substitui o campo "idade" por "data de nascimento".
-- A idade continua a ser calculada em código e guardada em
-- promoter_age para compatibilidade com as regras de elegibilidade.
-- ============================================================

alter table projects        add column if not exists birth_date text;  -- YYYY-MM-DD
alter table shared_profiles add column if not exists birth_date text;  -- YYYY-MM-DD
