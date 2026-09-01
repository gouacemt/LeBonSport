import { supabase } from '@/services/supabase'
import { useEffect, useState } from 'react'

export type AnnonceDetail = {
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
  photos: string[] | null
  date_evenement: string | null
}

export type AnnonceAuthor = {
  id: string
  prenom: string | null
  nom: string | null
  avatar_url: string | null
  bio: string | null
  is_sportif: boolean | null
  is_coach: boolean | null
  is_club: boolean | null
}

export function useAnnonceDetail(id: string | undefined) {
  const [annonce, setAnnonce] = useState<AnnonceDetail | null>(null)
  const [author, setAuthor] = useState<AnnonceAuthor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setAuthor(null)

    const load = async () => {
      const { data, error: annonceError } = await supabase
        .from('annonces')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (cancelled) return

      if (annonceError) {
        setError(annonceError.message)
        setLoading(false)
        return
      }
      if (!data) {
        setError('introuvable')
        setLoading(false)
        return
      }

      setAnnonce(data as AnnonceDetail)

      if (data.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, prenom, nom, avatar_url, bio, is_sportif, is_coach, is_club')
          .eq('id', data.user_id)
          .maybeSingle()
        if (!cancelled && profile) setAuthor(profile as AnnonceAuthor)
      }

      if (!cancelled) setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return { annonce, author, loading, error }
}
