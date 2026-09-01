import { useEffect, useState } from 'react'

// DONNÉES DE DÉMO — statique, pas de backend prévu pour des témoignages
// modérés avant la Phase 2/3 (impliquerait modération + vraie collecte d'avis).
const MOCK_TESTIMONIALS = [
  { id: 't1', nom: 'Julie R.', texte: "J'ai trouvé mon équipe de basket en 3 jours, franchement bluffée.", note: 5 },
  { id: 't2', nom: 'Marc D.', texte: 'Super pour organiser des parties de padel entre niveaux similaires.', note: 5 },
  { id: 't3', nom: 'Sofia B.', texte: "L'appli qu'il manquait pour le sport entre potes.", note: 4 },
]

export function useTestimonials() {
  const [data, setData] = useState<typeof MOCK_TESTIMONIALS>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setData(MOCK_TESTIMONIALS)
      setLoading(false)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  return { data, loading }
}
