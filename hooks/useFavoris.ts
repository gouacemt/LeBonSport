import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'

// Favoris stockés localement sur l'appareil (pas de table Supabase pour l'instant :
// pas de synchronisation entre appareils, mais fonctionne sans changement de base).
const STORAGE_KEY = 'favoris_annonces'

export function useFavoris() {
  const [favoris, setFavoris] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setFavoris(JSON.parse(stored))
      setLoading(false)
    })
  }, [])

  const persist = (ids: string[]) => {
    setFavoris(ids)
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }

  const isFavori = useCallback((annonceId: string) => favoris.includes(annonceId), [favoris])

  const toggleFavori = (annonceId: string) => {
    if (favoris.includes(annonceId)) {
      persist(favoris.filter((id) => id !== annonceId))
    } else {
      persist([...favoris, annonceId])
    }
  }

  return { favoris, loading, isFavori, toggleFavori }
}
