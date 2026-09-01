import { supabase } from '@/services/supabase'
import { useState } from 'react'

async function findOrCreateConversationId(annonceId: string, userA: string, userB: string) {
  const { data: existing, error: selectError } = await supabase
    .from('conversations')
    .select('id')
    .eq('annonce_id', annonceId)
    .eq('user_a', userA)
    .eq('user_b', userB)
    .maybeSingle()
  if (selectError) throw new Error(selectError.message)
  if (existing) return existing.id as string

  const { data: created, error: insertError } = await supabase
    .from('conversations')
    .insert({ annonce_id: annonceId, user_a: userA, user_b: userB })
    .select('id')
    .single()
  if (insertError) throw new Error(insertError.message)
  return created.id as string
}

export function useAnnonceConversation(annonceId: string | undefined, ownerId: string | null | undefined) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || !annonceId || !ownerId) return false

    setSending(true)
    setError(null)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user || user.id === ownerId) {
      setSending(false)
      return false
    }

    try {
      let convId = conversationId
      if (!convId) {
        const [userA, userB] = [user.id, ownerId].sort()
        convId = await findOrCreateConversationId(annonceId, userA, userB)
        setConversationId(convId)
      }

      const { error: insertError } = await supabase
        .from('messages')
        .insert({ conversation_id: convId, sender_id: user.id, content: trimmed })
      if (insertError) throw new Error(insertError.message)

      setSending(false)
      return true
    } catch (e: any) {
      setError(e.message)
      setSending(false)
      return false
    }
  }

  return { sending, error, sendMessage }
}
