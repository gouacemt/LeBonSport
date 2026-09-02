import { getSportIcon } from '@/constants/sportIcons'
import { supabase } from '@/services/supabase'
import { useEffect, useState } from 'react'

export type PopularClub = {
  id: string
  nom: string
  sport: string
  ville: string
  membres: number
  icon: ReturnType<typeof getSportIcon>
}

export function usePopularClubs() {
  const [data, setData] = useState<PopularClub[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('clubs')
      .select('id, nom, sport, ville, membres')
      .order('membres', { ascending: false })
      .limit(6)
      .then(({ data: rows }) => {
        if (cancelled) return
        setData(
          ((rows ?? []) as Omit<PopularClub, 'icon'>[]).map((c) => ({ ...c, icon: getSportIcon(c.sport) })),
        )
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading }
}
