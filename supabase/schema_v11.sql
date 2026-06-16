-- ============================================================
-- Schema v11 — Colunas que foram adicionadas em seed files
-- Corre DEPOIS de schema_v10.sql.
-- ============================================================
-- Estas colunas foram originalmente criadas em seed_v6.sql e
-- seed_v9.sql por engano (ALTER TABLE pertence a schema files).
-- Este ficheiro as documenta e garante que existem mesmo que
-- os seeds não tenham sido corridos por ordem, ou num ambiente
-- de produção que apenas corre os schemas.
-- ============================================================

-- De seed_v6.sql: iefp_registered (campo usado pelas perguntas
-- e regras de elegibilidade dos domínios formação e empresas)
alter table projects add column if not exists iefp_registered boolean;

-- De seed_v9.sql: has_children (campo usado pelas perguntas e
-- regras de elegibilidade do domínio social)
alter table projects add column if not exists has_children boolean;
