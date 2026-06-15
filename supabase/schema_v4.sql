-- ============================================================
-- Schema v4 — Questionário guiado por dados (melhorias)
-- Corre DEPOIS de schema_v3.sql.
-- ============================================================
-- Acrescenta à tabela 'questions' o que falta para montar
-- questionários ricos por domínio, sem código:
--  - secção/passo (agrupar perguntas em ecrãs)
--  - obrigatória
--  - placeholder
--  - também_grava_em (escrever a mesma resposta noutro campo, para
--    compatibilidade com regras que usam nomes diferentes)
-- ============================================================

alter table questions add column if not exists section text;          -- nome do passo
alter table questions add column if not exists section_order int default 0;
alter table questions add column if not exists required boolean default false;
alter table questions add column if not exists placeholder text;
alter table questions add column if not exists also_writes text;       -- campo espelho (ex.: promoter_age)

-- 'birth_year_age' e 'promoter_age' representam a mesma coisa (idade).
-- A pergunta de idade vai gravar nos dois via 'also_writes', para que
-- tanto as regras agrícolas como as outras funcionem sem duplicar a pergunta.
