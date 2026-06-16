-- ============================================================
-- Seed v14 — Data de nascimento + domínios todos ativos
-- Corre DEPOIS de schema_v12.sql e seed_v13.sql.
-- ============================================================

-- 1. Substituir pergunta de "idade" por "data de nascimento"
--    (a idade em anos é calculada em código, não pedida ao utilizador)
update questions
set
  field       = 'birth_date',
  label       = 'Data de nascimento',
  hint        = 'Muitos apoios têm limites de idade (ex.: até 35 ou 40 anos). A idade é calculada automaticamente.',
  input_type  = 'date',
  placeholder = NULL,
  also_writes = NULL
where field = 'promoter_age' and shared = true;

-- 2. Ativar todos os domínios
update domains set active = true;

-- 3. Adicionar domínios em falta (se não existirem)
insert into domains (slug, label, description, icon, active, sort_order) values
  ('saude',    'Saúde e Cuidadores',    'Apoios a cuidadores informais, pessoas com deficiência e situações de dependência.', '❤️', true, 6),
  ('formacao', 'Formação',              'Bolsas de formação, reconversão profissional e aprendizagem ao longo da vida.',       '🎓', true, 7),
  ('cultura',  'Cultura',               'Apoios à criação cultural, artes e preservação do património.',                       '🎭', true, 8),
  ('inovacao', 'Inovação e Startups',   'Incentivos à inovação, I&D e criação de startups tecnológicas.',                     '🚀', true, 9)
on conflict (slug) do update set active = true, sort_order = excluded.sort_order;
