-- ── Bucket de stockage pour les photos de profil ───────────────────────────
-- useEditProfile.pickAndUploadAvatar uploade vers le bucket `avatars`
-- (chemin `<uid>/avatar-<timestamp>.<ext>`), mais ce bucket n'a jamais été
-- créé : l'upload échouait donc systématiquement ("Bucket not found").

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_owner_modify" on storage.objects;
create policy "avatars_owner_modify" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
