import { supabase } from '@/services/supabase'
import { useEffect, useState } from 'react'

type Sport = {
  id: number
  nom: string
  emoji: string
}

export function useSports() {
  const [sports, setSports]     = useState<Sport[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // ─── Charger la liste des sports pour que le user choissise ses préférences ───────────────────────────
  useEffect(() => {
    supabase.from('sports').select('*').order('nom').then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else {
          if (data !== null && data !== undefined) {
            setSports(data)
        } else {
            setSports([])
            }
        }
        setLoading(false)
      })
  }, [])

  // ─── Permet aux user de selectionner ses sports ─────────────────
  const SportChoice = (id: number) => {
    // on regarde si le sport est déjà dans la liste
    const dejaSelectionne = selected.includes(id)

    if (dejaSelectionne) {
      // si le sport est déjà sélectionné , on l'enlève de la liste avec filtert 
      const nouvelleListe = selected.filter(
        function(sportId) {
            return sportId !== id
        }
    )
      setSelected(nouvelleListe) // et ion attribue à setSelected la nouvelle liste des sports selectionne
    } else {
      // si le sport n'est pas encore sélectionné, on l'ajoute à la liste
      const nouvelleListe = [...selected, id] // on copie le contenu de selected dans la nouvelle liste et on ajoute l'id qui vient d'être selectionner 
      setSelected(nouvelleListe)
    }
  }

  // ─── Sauvegarder les sports choisis ─────────────────────────
  const saveSports = async () => {
    setSaving(true)
    setError(null)

    // On récupère l'utilisateur qui choisi les reponses pour les mettre dans la base de données afin de pouvoir configurer ses preferences plus tard
    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user === null) {
      setError('Utilisateur non connecté')
      setSaving(false)
      return false
    }

    // Si le useer a selectionner un sport au moins on peut preparer les lignes à inserer dans la bdd
    if (selected.length > 0) {

      // Prépare les lignes à insérer dans la base
      const lignes = []
      for (let i = 0; i < selected.length; i++) {
        lignes.push({
          user_id: user.id,
          sport_id: selected[i],
        })
      }

      // On insère dans Supabase
      const { error } = await supabase.from('user_sports').insert(lignes)

      if (error) {
        setError(error.message)
        setSaving(false)
        return false
      }
    }
    setSaving(false)
    return true
  }

  // ─── Charger les sports déjà choisis par l'utilisateur ──────
  const loadUserSports = async () => {
    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user === null) {
      setError('Utilisateur non connecté')
      return false
    }

    const { data } = await supabase.from('user_sports').select('sport_id').eq('user_id', user.id)

    if (data !== null) {
      // On recupere que le id des sports
      const ids = []
      for (let i = 0; i < data.length; i++) {
        ids.push(data[i].sport_id)
      }
      setSelected(ids)
    }
  }

  return {
    sports,
    selected,
    loading,
    saving,
    error,
    SportChoice,
    saveSports,
    loadUserSports,
  }
}