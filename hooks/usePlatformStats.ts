import { supabase } from '@/services/supabase'
import { useEffect, useState } from 'react'

type Stats = {
  annoncesCount: number
  membersCount: number
  loading: boolean
}

// Compteurs réels (via count Supabase, aucune colonne nouvelle nécessaire).
export function usePlatformStats(): Stats {
  const [annoncesCount, setAnnoncesCount] = useState(0)
  const [membersCount, setMembersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('annonces').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]).then(([annoncesRes, profilesRes]) => {
      setAnnoncesCount(annoncesRes.count ?? 0)
      setMembersCount(profilesRes.count ?? 0)
      setLoading(false)
    })
  }, [])

  return { annoncesCount, membersCount, loading }
}
