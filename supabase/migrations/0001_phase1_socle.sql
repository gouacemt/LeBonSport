alter table profiles
  add column if not exists niveau text
    check (niveau is null or niveau in ('Débutant','Intermédiaire','Avancé','Expert')),
  add column if not exists disponibilites jsonb not null default '[]'::jsonb,
  add column if not exists gallery_urls text[] not null default '{}';

do $$ begin
  alter table user_sports add constraint user_sports_unique unique (user_id, sport_id);
exception when duplicate_object then null;
end $$;

alter table annonces
  add column if not exists user_id uuid references auth.users(id) default auth.uid(),
  add column if not exists photos text[] not null default '{}',
  add column if not exists date_evenement timestamptz;

drop policy if exists "annonces_update_own" on annonces;
create policy "annonces_update_own" on annonces
  for update using (auth.uid() = user_id);

drop policy if exists "annonces_delete_own" on annonces;
create policy "annonces_delete_own" on annonces
  for delete using (auth.uid() = user_id);

create table if not exists favoris (
  user_id    uuid references auth.users(id) on delete cascade,
  annonce_id uuid references annonces(id)   on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, annonce_id)
);
alter table favoris enable row level security;

drop policy if exists "favoris_select_own" on favoris;
create policy "favoris_select_own" on favoris for select using (auth.uid() = user_id);
drop policy if exists "favoris_insert_own" on favoris;
create policy "favoris_insert_own" on favoris for insert with check (auth.uid() = user_id);
drop policy if exists "favoris_delete_own" on favoris;
create policy "favoris_delete_own" on favoris for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media_owner_write" on storage.objects;
create policy "media_owner_write" on storage.objects
  for insert with check (bucket_id = 'media' and (storage.foldername(name))[2] = auth.uid()::text);

drop policy if exists "media_owner_modify" on storage.objects;
create policy "media_owner_modify" on storage.objects
  for update using (bucket_id = 'media' and (storage.foldername(name))[2] = auth.uid()::text);

drop policy if exists "media_owner_delete" on storage.objects;
create policy "media_owner_delete" on storage.objects
  for delete using (bucket_id = 'media' and (storage.foldername(name))[2] = auth.uid()::text);
