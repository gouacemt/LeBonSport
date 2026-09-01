import { supabase } from '@/services/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useInstanceId } from './useInstanceId'

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export function useConversation(conversationId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const instanceId = useInstanceId()

  useEffect(() => {
    if (!conversationId) return

    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))

    setLoading(true)
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at')
      .then(({ data, error: messagesError }) => {
        if (messagesError) setError(messagesError.message)
        else setMessages((data ?? []) as Message[])
        setLoading(false)
      })

    const channel: RealtimeChannel = supabase
      .channel(`messages:${conversationId}:${instanceId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const message = payload.new as Message
          setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || !conversationId) return false

    setSending(true)
    setError(null)

    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) {
      setError('Utilisateur non connecté')
      setSending(false)
      return false
    }

    const { data: created, error: insertError } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: user.id, content: trimmed })
      .select('*')
      .single()

    if (insertError) {
      setError(insertError.message)
      setSending(false)
      return false
    }

    setMessages((prev) => (prev.some((m) => m.id === created.id) ? prev : [...prev, created as Message]))
    setSending(false)
    return true
  }

  return { messages, loading, error, sending, sendMessage, currentUserId }
}
