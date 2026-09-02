-- ── Clubs (lecture publique) ───────────────────────────────────────────────
-- Remplace le hook de démo usePopularClubs (liste affichée sur la carte).
-- Pas d'interface de création pour l'instant : contenu géré côté admin.

create table if not exists clubs (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null,
  sport      text not null,
  ville      text not null,
  membres    int  not null default 0,
  created_at timestamptz not null default now()
);

alter table clubs enable row level security;

drop policy if exists "clubs_read_all" on clubs;
create policy "clubs_read_all" on clubs for select using (true);

-- Jeu de données initial (inséré seulement si la table est vide).
insert into clubs (nom, sport, ville, membres)
select * from (values
  ('AS Frontenex Football', 'Football', 'Lyon', 84),
  ('Padel Club Confluence', 'Padel', 'Lyon', 42),
  ('Running Team Rhône', 'Running', 'Villeurbanne', 130),
  ('Basket Club Part-Dieu', 'Basketball', 'Lyon', 61),
  ('Tennis Club Tête d''Or', 'Tennis', 'Lyon', 95)
) as v(nom, sport, ville, membres)
where not exists (select 1 from clubs);
