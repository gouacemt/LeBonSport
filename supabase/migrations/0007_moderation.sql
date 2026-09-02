-- ── Modération : signalements et blocages ──────────────────────────────────

create table if not exists signalements (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('annonce', 'user')),
  target_id   uuid not null,
  motif       text not null,
  details     text,
  statut      text not null default 'nouveau' check (statut in ('nouveau', 'traite', 'rejete')),
  created_at  timestamptz not null default now(),
  constraint signalements_unique unique (reporter_id, target_type, target_id)
);

create index if not exists signalements_target_idx on signalements(target_type, target_id);

alter table signalements enable row level security;

drop policy if exists "signalements_insert_self" on signalements;
create policy "signalements_insert_self" on signalements
  for insert with check (reporter_id = auth.uid());

drop policy if exists "signalements_select_self" on signalements;
create policy "signalements_select_self" on signalements
  for select using (reporter_id = auth.uid());

create table if not exists blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);

alter table blocks enable row level security;

drop policy if exists "blocks_select_self" on blocks;
create policy "blocks_select_self" on blocks
  for select using (blocker_id = auth.uid());

drop policy if exists "blocks_insert_self" on blocks;
create policy "blocks_insert_self" on blocks
  for insert with check (blocker_id = auth.uid());

drop policy if exists "blocks_delete_self" on blocks;
create policy "blocks_delete_self" on blocks
  for delete using (blocker_id = auth.uid());
