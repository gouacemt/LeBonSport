create table if not exists conversations (
  id                   uuid primary key default gen_random_uuid(),
  annonce_id           uuid not null references annonces(id) on delete cascade,
  user_a               uuid not null references auth.users(id) on delete cascade,
  user_b               uuid not null references auth.users(id) on delete cascade,
  last_message_at      timestamptz not null default now(),
  last_message_preview text,
  created_at           timestamptz not null default now(),
  constraint conversations_ordered_pair check (user_a < user_b),
  constraint conversations_unique_thread unique (annonce_id, user_a, user_b)
);

create index if not exists conversations_participant_a_idx on conversations(user_a, last_message_at desc);
create index if not exists conversations_participant_b_idx on conversations(user_b, last_message_at desc);

alter table conversations enable row level security;

drop policy if exists "conversations_select_participant" on conversations;
create policy "conversations_select_participant" on conversations
  for select using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "conversations_insert_participant" on conversations;
create policy "conversations_insert_participant" on conversations
  for insert with check (auth.uid() = user_a or auth.uid() = user_b);

create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references auth.users(id) on delete cascade,
  content         text not null check (char_length(btrim(content)) > 0),
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_created_idx on messages(conversation_id, created_at);

alter table messages enable row level security;

drop policy if exists "messages_select_participant" on messages;
create policy "messages_select_participant" on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
    )
  );

drop policy if exists "messages_insert_participant" on messages;
create policy "messages_insert_participant" on messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
    )
  );

create or replace function bump_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update conversations
  set last_message_at = new.created_at,
      last_message_preview = left(new.content, 120)
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_bump_conversation on messages;
create trigger messages_bump_conversation
  after insert on messages
  for each row execute function bump_conversation_last_message();


do $$ begin
  alter publication supabase_realtime add table conversations;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table messages;
exception when duplicate_object then null;
end $$;
