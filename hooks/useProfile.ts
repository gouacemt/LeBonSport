import { supabase } from '@/services/supabase'
import { useEffect, useState } from 'react'

type Profile = {
  id: string
  nom: string | null
  prenom: string | null
  bio: string | null
  age: number | null
  avatar_url: string | null
}

type Sport = {
  id: number
  nom: string
  emoji: string
}

export function useProfile() {
  const [profile, setProfile]       = useState<Profile | null>(null)
  const [sports, setSports]         = useState<Sport[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    setError(null)

    // On récupère l'utilisateur connecté
    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user === null) {
      setError('Utilisateur non connecté')
      setLoading(false)
      return false
    }

    // On charge le profil
    const {data: profileData, error: profileError} = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return false
    }

    setProfile(profileData)

   // Charge les sports favoris avec les détails
  const {data: sportsData, error: sportsError} = await supabase.from('user_sports').select('sport_id, sports(id, nom, emoji)').eq('user_id', user.id)

  if (sportsError === null && sportsData !== null) {
    const listeSports: Sport[] = []

    for (let i = 0; i < sportsData.length; i++) {
      const sportBrut = sportsData[i].sports

      // Supabase peut retourner un objet OU un tableau selon la relation
      // on gère les deux cas
      if (sportBrut !== null) {
        if (Array.isArray(sportBrut)) {
          // cas tableau → on prend le premier élément
          if (sportBrut.length > 0) {
            listeSports.push(sportBrut[0] as Sport)
          }
        } else {
          // cas objet direct
          listeSports.push(sportBrut as Sport)
        }
      }
    }

  setSports(listeSports)
}

    setLoading(false)
    return true
  }

  // ─── Sauvegarder les modifications du profil ────────────────
  const saveProfile = async (données: Partial<Profile>) => {
    setSaving(true)
    setError(null)

    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user === null) {
      setError('Utilisateur non connecté')
      setSaving(false)
      return false
    }

    const { error } = await supabase.from('profiles').update({...données,updated_at: new Date().toISOString(),}).eq('id', user.id)

    if (error) {
      setError(error.message)
      setSaving(false)
      return false
    }

    // Met à jour le state local sans recharger depuis Supabase
    if (profile !== null) {
      setProfile({ ...profile, ...données })
    }

    setSaving(false)
    return true
  }

  return {
    profile,
    sports,
    loading,
    saving,
    error,
    loadProfile,
    saveProfile,
  }
}