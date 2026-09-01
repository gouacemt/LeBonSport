alter table conversations
  add column if not exists user_a_last_read_at timestamptz,
  add column if not exists user_b_last_read_at timestamptz;


create or replace function bump_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update conversations
  set last_message_at = new.created_at,
      last_message_preview = left(new.content, 120),
      user_a_last_read_at = case when new.sender_id = user_a then new.created_at else user_a_last_read_at end,
      user_b_last_read_at = case when new.sender_id = user_b then new.created_at else user_b_last_read_at end
  where id = new.conversation_id;
  return new;
end;
$$;


create or replace function mark_conversations_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update conversations set user_a_last_read_at = now() where user_a = auth.uid();
  update conversations set user_b_last_read_at = now() where user_b = auth.uid();
end;
$$;
