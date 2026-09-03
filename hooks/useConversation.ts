import { supabase } from '@/services/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useInstanceId } from './useInstanceId'

export type MessageStatus = 'pending' | 'sent' | 'failed'

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  /** Local-only delivery state for messages sent from this device. */
  status?: MessageStatus
  /** Local optimistic id, kept until the row is confirmed by the server. */
  clientId?: string
}

type ConversationMeta = {
  user_a: string
  user_b: string
  user_a_last_read_at: string | null
  user_b_last_read_at: string | null
}

export function useConversation(conversationId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(null)
  const instanceId = useInstanceId()
  const userIdRef = useRef<string | null>(null)

  const applyMeta = useCallback((meta: ConversationMeta | null | undefined) => {
    const uid = userIdRef.current
    if (!meta || !uid) return
    setOtherLastReadAt(uid === meta.user_a ? meta.user_b_last_read_at : meta.user_a_last_read_at)
  }, [])

  const markRead = useCallback(() => {
    if (!conversationId) return
    supabase.rpc('mark_conversation_read', { conv_id: conversationId })
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return

    let cancelled = false
    setLoading(true)
    setMessages([])

    supabase.auth.getUser().then(({ data }) => {
      userIdRef.current = data.user?.id ?? null
      setCurrentUserId(data.user?.id ?? null)
    })

    supabase
      .from('conversations')
      .select('user_a, user_b, user_a_last_read_at, user_b_last_read_at')
      .eq('id', conversationId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) applyMeta(data as ConversationMeta | null)
      })

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at')
      .then(({ data, error: messagesError }) => {
        if (cancelled) return
        if (messagesError) setError(messagesError.message)
        else setMessages((data ?? []) as Message[])
        setLoading(false)
        markRead()
      })

    const channel: RealtimeChannel = supabase
      .channel(`messages:${conversationId}:${instanceId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const message = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev
            // Remplace l'éventuel message optimiste correspondant.
            const optimisticIdx = prev.findIndex(
              (m) => m.clientId && m.sender_id === message.sender_id && m.content === message.content,
            )
            if (optimisticIdx !== -1) {
              const next = [...prev]
              next[optimisticIdx] = message
              return next
            }
            return [...prev, message]
          })
          // Message reçu alors que l'écran est ouvert : on le marque lu tout de suite.
          if (message.sender_id !== userIdRef.current) markRead()
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${conversationId}` },
        (payload) => applyMeta(payload.new as ConversationMeta),
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [conversationId, applyMeta, markRead, instanceId])

  const deliver = useCallback(
    async (clientId: string, content: string, userId: string) => {
      const { data: created, error: insertError } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, sender_id: userId, content })
        .select('*')
        .single()

      if (insertError || !created) {
        setError(insertError?.message ?? "Échec de l'envoi")
        setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, status: 'failed' } : m)))
        return false
      }

      const { data: conv } = await supabase.from('conversations').select('user_a, user_b').eq('id', conversationId).single()

      if (conv) {
        const destinataireId = conv.user_a === userId ? conv.user_b : conv.user_a

        const { data: settings } = await supabase.from('notification_settings').select('push_token, messages').eq('user_id', destinataireId).single()

        if (settings?.push_token && settings?.messages === true) {
          await supabase.functions.invoke('send-notification', {
            body: {
              token:   settings.push_token,
              titre:   'Nouveau message 💬',
              message: 'Tu as reçu un nouveau message sur LeBonSport',
            }
          })
        }
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev.filter((m) => m.clientId !== clientId)
        return prev.map((m) => (m.clientId === clientId ? { ...(created as Message) } : m))
      })
      return true
    },
    [conversationId],
  )

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || !conversationId) return false

    const userId = userIdRef.current
    if (!userId) {
      setError('Utilisateur non connecté')
      return false
    }

    setError(null)
    setSending(true)

    const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const optimistic: Message = {
      id: clientId,
      clientId,
      conversation_id: conversationId,
      sender_id: userId,
      content: trimmed,
      created_at: new Date().toISOString(),
      status: 'pending',
    }
    setMessages((prev) => [...prev, optimistic])

    const ok = await deliver(clientId, trimmed, userId)
    setSending(false)
    return ok
  }

  const retryMessage = async (clientId: string) => {
    const target = messages.find((m) => m.clientId === clientId)
    if (!target) return
    setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, status: 'pending' } : m)))
    const userId = userIdRef.current
    if (!userId) return
    await deliver(clientId, target.content, userId)
  }

  const removeFailed = (clientId: string) => {
    setMessages((prev) => prev.filter((m) => m.clientId !== clientId))
  }

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    retryMessage,
    removeFailed,
    currentUserId,
    otherLastReadAt,
  }
}
