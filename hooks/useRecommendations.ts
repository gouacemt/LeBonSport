import { supabase } from '@/services/supabase'
import { useEffect, useState } from 'react'

type Annonce = {
  id: string
  type: string
  sport: string
  niveau: string
  titre: string
  description: string
  ville: string
}

// Recommandations réelles : annonces récentes dont le sport correspond aux
// sports pratiqués par l'utilisateur (user_sports) — aucune nouvelle colonne
// nécessaire, juste une jointure côté client sur des données déjà existantes.
export function useRecommendations() {
  const [data, setData] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        setLoading(false)
        return
      }

      const { data: userSports } = await supabase
        .from('user_sports')
        .select('sports(nom)')
        .eq('user_id', user.id)

      const sportNames = (userSports ?? [])
        .map((row: any) => (Array.isArray(row.sports) ? row.sports[0]?.nom : row.sports?.nom))
        .filter(Boolean)

      if (sportNames.length === 0) {
        setLoading(false)
        return
      }

      const { data: annonces } = await supabase
        .from('annonces')
        .select('id, type, sport, niveau, titre, description, ville')
        .in('sport', sportNames)
        .order('created_at', { ascending: false })
        .limit(6)

      if (!cancelled) {
        setData(annonces ?? [])
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading }
}
