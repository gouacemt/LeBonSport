-- ── RGPD : suppression du compte par l'utilisateur lui-même ─────────────────

-- L'annonce ne cascadait pas à la suppression de l'utilisateur : on corrige.
do $$
begin
  alter table annonces drop constraint if exists annonces_user_id_fkey;
  alter table annonces
    add constraint annonces_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
exception when others then null;
end $$;

-- Supprime toutes les données de l'appelant puis son compte auth.
-- SECURITY DEFINER (propriétaire = postgres) : autorisé à écrire dans auth.users.
create or replace function delete_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  delete from messages            where sender_id = uid;
  delete from conversations       where user_a = uid or user_b = uid;
  delete from candidatures        where candidat_id = uid;
  delete from notifications       where user_id = uid;
  delete from favoris             where user_id = uid;
  delete from user_sports         where user_id = uid;
  delete from annonces            where user_id = uid;
  delete from notification_settings where user_id = uid;
  delete from profiles            where id = uid;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function delete_user() from public;
grant execute on function delete_user() to authenticated;
