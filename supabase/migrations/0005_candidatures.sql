-- ── Candidatures : répondre à une annonce de façon structurée ───────────────
create table if not exists candidatures (
  id          uuid primary key default gen_random_uuid(),
  annonce_id  uuid not null references annonces(id) on delete cascade,
  candidat_id uuid not null references auth.users(id) on delete cascade,
  message     text,
  statut      text not null default 'en_attente'
                check (statut in ('en_attente', 'acceptee', 'refusee', 'retiree')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint candidatures_unique unique (annonce_id, candidat_id)
);

create index if not exists candidatures_annonce_idx on candidatures(annonce_id, created_at desc);
create index if not exists candidatures_candidat_idx on candidatures(candidat_id, created_at desc);

alter table candidatures enable row level security;

-- Le candidat voit ses candidatures ; le propriétaire de l'annonce voit celles reçues.
drop policy if exists "candidatures_select" on candidatures;
create policy "candidatures_select" on candidatures
  for select using (
    candidat_id = auth.uid()
    or exists (select 1 from annonces a where a.id = candidatures.annonce_id and a.user_id = auth.uid())
  );

-- On postule pour soi, jamais sur sa propre annonce.
drop policy if exists "candidatures_insert" on candidatures;
create policy "candidatures_insert" on candidatures
  for insert with check (
    candidat_id = auth.uid()
    and exists (select 1 from annonces a where a.id = annonce_id and a.user_id <> auth.uid())
  );

-- Candidat OU propriétaire peuvent faire évoluer le statut.
drop policy if exists "candidatures_update" on candidatures;
create policy "candidatures_update" on candidatures
  for update using (
    candidat_id = auth.uid()
    or exists (select 1 from annonces a where a.id = candidatures.annonce_id and a.user_id = auth.uid())
  );

drop policy if exists "candidatures_delete" on candidatures;
create policy "candidatures_delete" on candidatures
  for delete using (candidat_id = auth.uid());

create or replace function touch_candidature_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists candidatures_touch on candidatures;
create trigger candidatures_touch before update on candidatures
  for each row execute function touch_candidature_updated_at();

-- ── Notifications in-app ────────────────────────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  data       jsonb not null default '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications(user_id, created_at desc);

alter table notifications enable row level security;

-- Lecture / mise à jour / suppression : seulement ses propres notifications.
-- Aucune policy d'insert : seules les fonctions SECURITY DEFINER en créent.
drop policy if exists "notifications_select_own" on notifications;
create policy "notifications_select_own" on notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on notifications;
create policy "notifications_update_own" on notifications
  for update using (user_id = auth.uid());

drop policy if exists "notifications_delete_own" on notifications;
create policy "notifications_delete_own" on notifications
  for delete using (user_id = auth.uid());

create or replace function mark_notifications_read()
returns void language plpgsql security definer set search_path = public as $$
begin
  update notifications set read_at = now()
  where user_id = auth.uid() and read_at is null;
end;
$$;

-- ── Déclencheurs : candidature -> notification ──────────────────────────────
create or replace function notify_on_candidature()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_owner    uuid;
  v_titre    text;
  v_candidat text;
begin
  select a.user_id, a.titre into v_owner, v_titre from annonces a where a.id = new.annonce_id;
  select coalesce(nullif(btrim(concat_ws(' ', p.prenom, p.nom)), ''), 'Un membre')
    into v_candidat from profiles p where p.id = new.candidat_id;

  if tg_op = 'INSERT' then
    insert into notifications (user_id, type, title, body, data)
    values (v_owner, 'candidature_recue',
            'Nouvelle candidature',
            v_candidat || ' a répondu à « ' || v_titre || ' »',
            jsonb_build_object('annonce_id', new.annonce_id, 'candidature_id', new.id));

  elsif tg_op = 'UPDATE' and new.statut <> old.statut and new.statut in ('acceptee', 'refusee') then
    insert into notifications (user_id, type, title, body, data)
    values (new.candidat_id,
            'candidature_' || new.statut,
            case when new.statut = 'acceptee' then 'Candidature acceptée' else 'Candidature refusée' end,
            'Votre candidature à « ' || v_titre || ' » a été '
              || case when new.statut = 'acceptee' then 'acceptée' else 'refusée' end || '.',
            jsonb_build_object('annonce_id', new.annonce_id, 'candidature_id', new.id));
  end if;

  return new;
end;
$$;

drop trigger if exists candidatures_notify_ins on candidatures;
create trigger candidatures_notify_ins after insert on candidatures
  for each row execute function notify_on_candidature();

drop trigger if exists candidatures_notify_upd on candidatures;
create trigger candidatures_notify_upd after update on candidatures
  for each row execute function notify_on_candidature();

-- ── Realtime ───────────────────────────────────────────────────────────────
do $$ begin
  alter publication supabase_realtime add table candidatures;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table notifications;
exception when duplicate_object then null;
end $$;
