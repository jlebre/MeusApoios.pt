-- ============================================================
-- Schema v6 — CONTA OPCIONAL + perfil ligado ao utilizador
-- Corre DEPOIS de schema_v5.sql.
-- ============================================================
-- Três estados de utilizador:
--  1. Anónimo: faz o questionário, vê resultados; sem perfil reutilizável.
--  2. Com conta (email+password via Supabase Auth): perfil transversal
--     guardado e reutilizado em todos os domínios.
--  3. Edição de perfil: vê/edita os dados transversais e o histórico.
-- ============================================================

-- Ligar o perfil partilhado ao utilizador autenticado.
alter table shared_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
create unique index if not exists idx_shared_profiles_user on shared_profiles(user_id);

-- Alinhar os campos do perfil com o questionário transversal.
alter table shared_profiles add column if not exists promoter_age int;
alter table shared_profiles add column if not exists tax_situation_ok boolean;

-- Ligar projetos ao utilizador (para o histórico por área).
alter table projects add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists idx_projects_user on projects(user_id);

-- ------------------------------------------------------------
-- RLS: cada utilizador só acede ao SEU perfil e aos SEUS projetos.
-- Dados sensíveis (rendimento, situação fiscal) ficam protegidos.
-- O backoffice usa service role, que ignora RLS.
-- ------------------------------------------------------------
alter table shared_profiles enable row level security;
drop policy if exists "shared_profiles_owner" on shared_profiles;
create policy "shared_profiles_owner" on shared_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Projetos: o dono vê os seus; anónimos (user_id null) são geridos via
-- service role no servidor (a página de resultados usa service role).
alter table projects enable row level security;
drop policy if exists "projects_owner_select" on projects;
drop policy if exists "projects_owner_all" on projects;
create policy "projects_owner_all" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Nota: leitura de projetos anónimos para mostrar resultados é feita pelo
-- servidor com service role (bypassa RLS), por isso não precisa de policy
-- pública. Isto mantém os projetos com dono privados.
