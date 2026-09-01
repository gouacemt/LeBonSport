import { useEffect, useState } from 'react'

// DONNÉES DE DÉMO — à remplacer par une vraie requête géolocalisée en Phase
// 2/3 (nécessite de persister une position, hors scope pour l'instant).
const MOCK_ATHLETES = [
  { id: 'a1', prenom: 'Léa', sport: 'Padel', niveau: 'Intermédiaire', ville: 'Lyon 6e' },
  { id: 'a2', prenom: 'Karim', sport: 'Football', niveau: 'Avancé', ville: 'Villeurbanne' },
  { id: 'a3', prenom: 'Manon', sport: 'Running', niveau: 'Débutant', ville: 'Lyon 3e' },
  { id: 'a4', prenom: 'Thomas', sport: 'Basketball', niveau: 'Intermédiaire', ville: 'Lyon 7e' },
]

export function useNearbyAthletes() {
  const [data, setData] = useState<typeof MOCK_ATHLETES>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setData(MOCK_ATHLETES)
      setLoading(false)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  return { data, loading }
}
