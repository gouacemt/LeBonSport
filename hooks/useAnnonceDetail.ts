import { supabase } from '@/services/supabase'
import { useEffect, useState } from 'react'

type Annonce = {
  id: string
  created_at: string
  user_id: string | null
  type: string
  sport: string
  niveau: string
  titre: string
  description: string
  ville: string
  club: string | null
  places: number | null
  telephone: string | null
}

export function useAnnonceDetail(id: string | undefined) {
  const [annonce, setAnnonce] = useState<Annonce | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from('annonces')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setAnnonce(data)
        setLoading(false)
      })
  }, [id])

  return { annonce, loading, error }
}
