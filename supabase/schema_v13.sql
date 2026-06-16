-- ============================================================
-- Schema v13 — Campos de elegibilidade no perfil partilhado
-- Corre DEPOIS de schema_v12.sql.
-- ============================================================
-- Permite guardar no perfil campos que são comummente pedidos
-- nas regras de elegibilidade — evita repetição em cada questionário.
-- ============================================================

alter table shared_profiles add column if not exists activity_open   boolean;  -- tem atividade aberta (NIFAP, NIF atividade)
alter table shared_profiles add column if not exists has_empresa     boolean;  -- tem empresa constituída
alter table shared_profiles add column if not exists ss_situation_ok boolean;  -- Segurança Social regularizada
