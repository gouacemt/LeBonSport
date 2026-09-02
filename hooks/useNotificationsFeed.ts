import type { IconSymbolName } from '@/components/ui/icon-symbol'
import { supabase } from '@/services/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useInstanceId } from './useInstanceId'

export type AppNotification = {
  id: string
  type: string
  title: string
  body: string | null
  data: Record<string, any>
  read_at: string | null
  created_at: string
}

export function notificationIcon(type: string): IconSymbolName {
  switch (type) {
    case 'candidature_recue':
      return 'person.fill'
    case 'candidature_acceptee':
      return 'checkmark.circle.fill'
    case 'candidature_refusee':
      return 'xmark'
    case 'message':
      return 'bubble.left.fill'
    default:
      return 'bell.fill'
  }
}

export function useNotificationsFeed() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const instanceId = useInstanceId()
  const userIdRef = useRef<string | null>(null)

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) {
      setLoading(false)
      return
    }
    userIdRef.current = user.id
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications((data ?? []) as AppNotification[])
    setLoading(false)
  }, [])

  useEffect(() => {
    let channel: RealtimeChannel | null = null
    const setup = async () => {
      await load()
      const userId = userIdRef.current
      if (!userId) return
      channel = supabase
        .channel(`notifications-${instanceId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
          () => load(),
        )
        .subscribe()
    }
    setup()
    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [load, instanceId])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })))
    await supabase.rpc('mark_notifications_read')
  }, [])

  const unreadCount = notifications.filter((n) => !n.read_at).length

  return { notifications, loading, unreadCount, markAllRead, reload: load }
}
