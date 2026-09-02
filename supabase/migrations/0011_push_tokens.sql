-- ── Jetons de notification push (Expo) ─────────────────────────────────────
create table if not exists push_tokens (
  user_id    uuid not null references auth.users(id) on delete cascade,
  token      text not null,
  platform   text,
  updated_at timestamptz not null default now(),
  primary key (user_id, token)
);

create index if not exists push_tokens_user_idx on push_tokens(user_id);

alter table push_tokens enable row level security;

drop policy if exists "push_tokens_rw_own" on push_tokens;
create policy "push_tokens_select_own" on push_tokens
  for select using (user_id = auth.uid());
create policy "push_tokens_insert_own" on push_tokens
  for insert with check (user_id = auth.uid());
create policy "push_tokens_update_own" on push_tokens
  for update using (user_id = auth.uid());
create policy "push_tokens_delete_own" on push_tokens
  for delete using (user_id = auth.uid());

-- Branchement recommandé : un Database Webhook sur `INSERT` de `notifications`
-- appelle l'Edge Function `send-push` (voir supabase/functions/send-push).
