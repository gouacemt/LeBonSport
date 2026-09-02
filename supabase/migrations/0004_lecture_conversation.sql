-- Marque une seule conversation comme lue pour l'utilisateur courant.
-- Les policies RLS de `conversations` n'autorisent pas l'UPDATE côté client :
-- on passe donc par une fonction SECURITY DEFINER, comme mark_conversations_read().
create or replace function mark_conversation_read(conv_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update conversations
  set user_a_last_read_at = case when user_a = auth.uid() then now() else user_a_last_read_at end,
      user_b_last_read_at = case when user_b = auth.uid() then now() else user_b_last_read_at end
  where id = conv_id
    and (user_a = auth.uid() or user_b = auth.uid());
end;
$$;
