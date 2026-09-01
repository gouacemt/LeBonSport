import type { IconSymbolName } from '@/components/ui/icon-symbol'
import { supabase } from '@/services/supabase'
import { useEffect, useState } from 'react'

type Badge = { icon: IconSymbolName; label: string }

type Stats = {
  memberSince: string | null
  badges: Badge[]
  loading: boolean
}

export function useDashboardStats(sportsCount: number): Stats {
  const [memberSince, setMemberSince] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.created_at) {
        setMemberSince(
          new Date(data.user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        )
      }
      setLoading(false)
    })
  }, [])

  const badges: Badge[] = []
  if (sportsCount >= 1) badges.push({ icon: 'tshirt.fill', label: 'Sportif inscrit' })
  if (sportsCount >= 3) badges.push({ icon: 'flame.fill', label: 'Multi-sports' })
  if (sportsCount >= 5) badges.push({ icon: 'trophy.fill', label: '5 sports pratiqués' })
  if (badges.length === 0) badges.push({ icon: 'hand.wave.fill', label: 'Nouveau membre' })

  return { memberSince, badges, loading }
}
