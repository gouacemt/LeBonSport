-- ── Géolocalisation des annonces ───────────────────────────────────────────
alter table annonces
  add column if not exists lat double precision,
  add column if not exists lng double precision;

alter table profiles
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- Filtrage par distance sans extension : haversine en SQL.
create or replace function annonces_near(p_lat double precision, p_lng double precision, p_radius_km double precision)
returns setof annonces
language sql
stable
as $$
  select a.*
  from annonces a
  where a.lat is not null and a.lng is not null
    and (
      2 * 6371 * asin(
        sqrt(
          power(sin(radians(a.lat - p_lat) / 2), 2)
          + cos(radians(p_lat)) * cos(radians(a.lat))
            * power(sin(radians(a.lng - p_lng) / 2), 2)
        )
      )
    ) <= p_radius_km
  order by a.created_at desc;
$$;
