-- ============================================================
-- Schema v14 — Favoritos persistentes por utilizador autenticado
-- Corre DEPOIS de schema_v13.sql.
-- ============================================================
-- user_favorites guarda os apoios guardados por cada utilizador.
-- Utilizadores anónimos usam localStorage (sem tabela).
-- ============================================================

create table if not exists user_favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  fund_id     uuid not null references funding_opportunities(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, fund_id)
);

-- Cada utilizador só vê os seus favoritos
alter table user_favorites enable row level security;

create policy "Utilizador lê os seus favoritos"
  on user_favorites for select
  using (auth.uid() = user_id);

create policy "Utilizador insere os seus favoritos"
  on user_favorites for insert
  with check (auth.uid() = user_id);

create policy "Utilizador apaga os seus favoritos"
  on user_favorites for delete
  using (auth.uid() = user_id);
