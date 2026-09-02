import { supabase } from '@/services/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'

type AnnonceItem = { titre: string; photos: string[] }
type AnnonceRef = AnnonceItem | AnnonceItem[] | null

type ConversationRow = {
  id: string
  annonce_id: string
  user_a: string
  user_b: string
  last_message_at: string
  last_message_preview: string | null
  user_a_last_read_at: string | null
  user_b_last_read_at: string | null
  annonces: AnnonceRef
}

type OtherProfile = {
  id: string
  nom: string | null
  prenom: string | null
  avatar_url: string | null
}

export type ConversationListItem = {
  id: string
  annonceId: string
  annonceTitre: string
  annoncePhoto: string | null
  otherUserId: string
  otherName: string
  otherAvatarUrl: string | null
  lastMessageAt: string
  lastMessagePreview: string | null
  unread: boolean
  unreadCount: number
}

function myLastRead(row: ConversationRow, userId: string): string | null {
  return row.user_a === userId ? row.user_a_last_read_at : row.user_b_last_read_at
}

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userIdRef = useRef<string | null>(null)

  const loadConversations = useCallback(async (userId: string) => {
    setError(null)

    const { data, error: convError } = await supabase
      .from('conversations')
      .select(
        'id, annonce_id, user_a, user_b, last_message_at, last_message_preview, user_a_last_read_at, user_b_last_read_at, annonces(titre, photos)',
      )
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (convError) {
      setError(convError.message)
      setLoading(false)
      return
    }

    const rows = (data ?? []) as unknown as ConversationRow[]
    const otherIds = Array.from(new Set(rows.map((r) => (r.user_a === userId ? r.user_b : r.user_a))))

    const profilesById = new Map<string, OtherProfile>()
    if (otherIds.length > 0) {
      const { data: profilesData } = await supabase.from('profiles').select('id, nom, prenom, avatar_url').in('id', otherIds)
      for (const p of (profilesData ?? []) as OtherProfile[]) {
        profilesById.set(p.id, p)
      }
    }

    // Conversations où le dernier message est plus récent que ma dernière lecture.
    const maybeUnread = rows.filter((r) => {
      const lastRead = myLastRead(r, userId)
      return !lastRead || new Date(r.last_message_at) > new Date(lastRead)
    })

    // Compte précis des messages non lus (borné aux conversations ci-dessus).
    const unreadCountById = new Map<string, number>()
    if (maybeUnread.length > 0) {
      const earliest = maybeUnread.reduce((min, r) => {
        const t = myLastRead(r, userId)
        return Math.min(min, t ? new Date(t).getTime() : 0)
      }, Number.POSITIVE_INFINITY)

      const { data: msgs } = await supabase
        .from('messages')
        .select('conversation_id, created_at, sender_id')
        .in(
          'conversation_id',
          maybeUnread.map((r) => r.id),
        )
        .neq('sender_id', userId)
        .gt('created_at', new Date(Number.isFinite(earliest) ? earliest : 0).toISOString())

      const lastReadById = new Map(maybeUnread.map((r) => [r.id, myLastRead(r, userId)]))
      for (const m of (msgs ?? []) as { conversation_id: string; created_at: string }[]) {
        const lastRead = lastReadById.get(m.conversation_id)
        if (!lastRead || new Date(m.created_at) > new Date(lastRead)) {
          unreadCountById.set(m.conversation_id, (unreadCountById.get(m.conversation_id) ?? 0) + 1)
        }
      }
    }

    const items: ConversationListItem[] = rows.map((r) => {
      const otherUserId = r.user_a === userId ? r.user_b : r.user_a
      const other = profilesById.get(otherUserId)
      const annonce = Array.isArray(r.annonces) ? r.annonces[0] : r.annonces
      const unreadCount = unreadCountById.get(r.id) ?? 0
      return {
        id: r.id,
        annonceId: r.annonce_id,
        annonceTitre: annonce?.titre ?? 'Annonce',
        annoncePhoto: annonce?.photos?.[0] ?? null,
        otherUserId,
        otherName: other ? [other.prenom, other.nom].filter(Boolean).join(' ').trim() || 'Utilisateur' : 'Utilisateur',
        otherAvatarUrl: other?.avatar_url ?? null,
        lastMessageAt: r.last_message_at,
        lastMessagePreview: r.last_message_preview,
        unread: unreadCount > 0,
        unreadCount,
      }
    })

    setConversations(items)
    setLoading(false)
  }, [])

  const reload = useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) {
      setLoading(false)
      return
    }
    userIdRef.current = user.id
    await loadConversations(user.id)
  }, [loadConversations])

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    const setup = async () => {
      await reload()
      const userId = userIdRef.current
      if (!userId) return

      channel = supabase
        .channel('conversations-list')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, (payload) => {
          const row = (payload.new ?? payload.old) as Partial<ConversationRow> | undefined
          if (!row || (row.user_a !== userId && row.user_b !== userId)) return
          loadConversations(userId)
        })
        .subscribe()
    }

    setup()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const markAllRead = async () => {
    await supabase.rpc('mark_conversations_read')
    const userId = userIdRef.current
    if (userId) {
      setConversations((prev) => prev.map((c) => ({ ...c, unread: false, unreadCount: 0 })))
      loadConversations(userId)
    }
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return { conversations, loading, error, reload, markAllRead, totalUnread }
}
