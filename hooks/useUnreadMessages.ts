import { supabase } from '@/services/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { useInstanceId } from './useInstanceId'

type ConversationReadRow = {
  user_a: string
  user_b: string
  last_message_at: string
  user_a_last_read_at: string | null
  user_b_last_read_at: string | null
}

export function useUnreadMessages() {
  const [hasUnread, setHasUnread] = useState(false)
  const instanceId = useInstanceId()

  const check = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('conversations')
      .select('user_a, user_b, last_message_at, user_a_last_read_at, user_b_last_read_at')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)

    const rows = (data ?? []) as ConversationReadRow[]
    const unread = rows.some((r) => {
      const lastRead = r.user_a === userId ? r.user_a_last_read_at : r.user_b_last_read_at
      return !lastRead || new Date(r.last_message_at) > new Date(lastRead)
    })
    setHasUnread(unread)
  }, [])

  useEffect(() => {
    let channel: RealtimeChannel | null = null
    let userId: string | null = null

    const setup = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) return
      userId = user.id
      await check(user.id)

      channel = supabase
        .channel(`unread-messages-${instanceId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, (payload) => {
          const row = (payload.new ?? payload.old) as Partial<ConversationReadRow> | undefined
          if (row && (row.user_a === userId || row.user_b === userId)) check(userId!)
        })
        .subscribe()
    }

    setup()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [check])

  return { hasUnread }
}
