-- ── Avis entre membres (réputation) ────────────────────────────────────────
create table if not exists avis (
  id          uuid primary key default gen_random_uuid(),
  auteur_id   uuid not null references auth.users(id) on delete cascade,
  cible_id    uuid not null references auth.users(id) on delete cascade,
  note        int  not null check (note between 1 and 5),
  commentaire text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint avis_unique unique (auteur_id, cible_id),
  constraint avis_not_self check (auteur_id <> cible_id)
);

create index if not exists avis_cible_idx on avis(cible_id, created_at desc);

alter table avis enable row level security;

-- Les avis sont publics en lecture (affichés sur le profil).
drop policy if exists "avis_select_all" on avis;
create policy "avis_select_all" on avis
  for select using (true);

-- On ne peut noter qu'un membre avec qui on a déjà une conversation.
drop policy if exists "avis_insert_after_contact" on avis;
create policy "avis_insert_after_contact" on avis
  for insert with check (
    auteur_id = auth.uid()
    and exists (
      select 1 from conversations c
      where (c.user_a = auth.uid() and c.user_b = cible_id)
         or (c.user_b = auth.uid() and c.user_a = cible_id)
    )
  );

drop policy if exists "avis_update_own" on avis;
create policy "avis_update_own" on avis
  for update using (auteur_id = auth.uid());

drop policy if exists "avis_delete_own" on avis;
create policy "avis_delete_own" on avis
  for delete using (auteur_id = auth.uid());

create or replace function touch_avis_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists avis_touch on avis;
create trigger avis_touch before update on avis
  for each row execute function touch_avis_updated_at();
