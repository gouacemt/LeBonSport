import { supabase } from '@/services/supabase'
import { useCallback, useEffect, useState } from 'react'

export const MOTIFS_SIGNALEMENT = [
  'Contenu inapproprié',
  'Spam ou publicité',
  'Arnaque / comportement suspect',
  'Harcèlement',
  'Autre',
] as const

/** Blocages de l'utilisateur courant + signalements. */
export function useModeration() {
  const [blockedIds, setBlockedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setLoading(false)
      return
    }
    const { data } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', userData.user.id)
    setBlockedIds(((data ?? []) as { blocked_id: string }[]).map((r) => r.blocked_id))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isBlocked = useCallback((userId: string | null | undefined) => !!userId && blockedIds.includes(userId), [blockedIds])

  const block = async (userId: string) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return false
    const { error } = await supabase.from('blocks').insert({ blocker_id: userData.user.id, blocked_id: userId })
    if (!error) setBlockedIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]))
    return !error
  }

  const unblock = async (userId: string) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return false
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', userData.user.id)
      .eq('blocked_id', userId)
    if (!error) setBlockedIds((prev) => prev.filter((id) => id !== userId))
    return !error
  }

  const report = async (params: {
    targetType: 'annonce' | 'user'
    targetId: string
    motif: string
    details?: string
  }) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return false
    const { error } = await supabase.from('signalements').upsert(
      {
        reporter_id: userData.user.id,
        target_type: params.targetType,
        target_id: params.targetId,
        motif: params.motif,
        details: params.details ?? null,
      },
      { onConflict: 'reporter_id,target_type,target_id' },
    )
    return !error
  }

  return { blockedIds, isBlocked, block, unblock, report, loading, reload: load }
}
