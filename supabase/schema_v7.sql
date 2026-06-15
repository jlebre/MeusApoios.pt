-- ============================================================
-- Schema v7 — Validação de zona + subscrições de notificação
-- Corre DEPOIS de schema_v6.sql.
-- ============================================================

-- ------------------------------------------------------------
-- ZONAS ELEGÍVEIS por fundo
-- ------------------------------------------------------------
-- Em vez de coordenadas, validamos por concelho/distrito (que é como
-- as regras de elegibilidade dos fundos funcionam na prática).
-- zone_type: 'distrito' | 'concelho' | 'nuts2' | 'regiao'
-- match_values: lista de valores aceites (ex.: ["Évora","Beja","Portalegre"])
create table if not exists funding_zones (
  id          uuid primary key default gen_random_uuid(),
  funding_id  uuid not null references funding_opportunities(id) on delete cascade,
  zone_type   text not null default 'distrito',
  match_values jsonb not null default '[]'::jsonb,
  label       text,                      -- descrição legível da área
  created_at  timestamptz default now()
);
create index if not exists idx_funding_zones_funding on funding_zones(funding_id);

-- Guardar coordenadas marcadas no mapa (opcional, no projeto)
alter table projects add column if not exists latitude numeric;
alter table projects add column if not exists longitude numeric;

-- ------------------------------------------------------------
-- SUBSCRIÇÕES de notificação (avisar quando abre um aviso)
-- ------------------------------------------------------------
create table if not exists notification_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  domain_id    uuid references domains(id) on delete set null,  -- área de interesse
  funding_id   uuid references funding_opportunities(id) on delete set null, -- ou apoio específico
  location_district text,               -- filtro por zona (opcional)
  user_id      uuid references auth.users(id) on delete set null,
  active       boolean default true,
  created_at   timestamptz default now()
);
create index if not exists idx_notif_subs_email on notification_subscriptions(email);
create index if not exists idx_notif_subs_domain on notification_subscriptions(domain_id);

-- Fila de notificações a enviar (preenchida quando um aviso muda de estado)
-- Tu (ou um cron) lês esta tabela e envias os emails. Estrutura pronta.
create table if not exists notification_queue (
  id           uuid primary key default gen_random_uuid(),
  subscription_id uuid references notification_subscriptions(id) on delete cascade,
  funding_id   uuid references funding_opportunities(id) on delete set null,
  email        text not null,
  subject      text,
  body         text,
  status       text default 'pendente',  -- pendente | enviado | falhou
  created_at   timestamptz default now(),
  sent_at      timestamptz
);
create index if not exists idx_notif_queue_status on notification_queue(status);

-- RLS: subscrições do próprio (quando logado) + leitura de zonas pública
alter table funding_zones enable row level security;
create policy "zones_read" on funding_zones for select using (true);

alter table notification_subscriptions enable row level security;
create policy "subs_owner" on notification_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- (subscrições anónimas são geridas via service role no servidor)
